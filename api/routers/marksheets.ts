import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { marksheets, marksheetSubjects, students, courses, centers } from "@db/schema";
import { eq, desc } from "drizzle-orm";

function gradeFor(pct: number): string {
  if (pct >= 90) return "A+"; if (pct >= 80) return "A"; if (pct >= 70) return "B+";
  if (pct >= 60) return "B"; if (pct >= 50) return "C"; if (pct >= 35) return "D"; return "F";
}
const genNumber = () => `UAN24-MS-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

export const marksheetRouter = createRouter({
  list: adminQuery.query(async () => {
    const db = getDb();
    return db.select({
      id: marksheets.id, marksheetNumber: marksheets.marksheetNumber, studentName: students.name,
      rollNumber: students.rollNumber, courseName: courses.name, percentage: marksheets.percentage,
      grade: marksheets.grade, resultStatus: marksheets.resultStatus, issueDate: marksheets.issueDate,
      status: marksheets.status, centreName: centers.name,
    }).from(marksheets)
      .leftJoin(students, eq(marksheets.studentId, students.id))
      .leftJoin(courses, eq(marksheets.courseId, courses.id))
      .leftJoin(centers, eq(marksheets.centreId, centers.id))
      .orderBy(desc(marksheets.createdAt));
  }),

  detail: publicQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const [ms] = await db.select().from(marksheets).where(eq(marksheets.id, input.id));
    if (!ms) return null;
    const subjects = await db.select().from(marksheetSubjects).where(eq(marksheetSubjects.marksheetId, input.id));
    const [student] = ms.studentId ? await db.select().from(students).where(eq(students.id, ms.studentId)) : [null];
    const [course] = ms.courseId ? await db.select().from(courses).where(eq(courses.id, ms.courseId)) : [null];
    const [centre] = ms.centreId ? await db.select().from(centers).where(eq(centers.id, ms.centreId)) : [null];
    return { ms, subjects, student, course, centre };
  }),

  byStudent: publicQuery.input(z.object({ studentId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    return db.select().from(marksheets).where(eq(marksheets.studentId, input.studentId)).orderBy(desc(marksheets.createdAt));
  }),

  byCenter: publicQuery.input(z.object({ centerId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    return db.select({
      id: marksheets.id, marksheetNumber: marksheets.marksheetNumber, studentName: students.name,
      rollNumber: students.rollNumber, percentage: marksheets.percentage, grade: marksheets.grade,
      resultStatus: marksheets.resultStatus, issueDate: marksheets.issueDate, status: marksheets.status,
    }).from(marksheets).innerJoin(students, eq(marksheets.studentId, students.id))
      .where(eq(students.centerId, input.centerId)).orderBy(desc(marksheets.createdAt));
  }),

  verify: publicQuery.input(z.object({ number: z.string() })).query(async ({ input }) => {
    const db = getDb();
    const [ms] = await db.select().from(marksheets).where(eq(marksheets.marksheetNumber, input.number.trim()));
    if (!ms) return { found: false as const };
    const [student] = ms.studentId ? await db.select().from(students).where(eq(students.id, ms.studentId)) : [null];
    const [course] = ms.courseId ? await db.select().from(courses).where(eq(courses.id, ms.courseId)) : [null];
    return {
      found: true as const, valid: ms.status === "issued",
      studentName: student?.name, courseName: course?.name, percentage: ms.percentage, grade: ms.grade,
      resultStatus: ms.resultStatus, issueDate: ms.issueDate, marksheetNumber: ms.marksheetNumber,
    };
  }),

  // Generate a marksheet from subject-wise marks (dynamic totals/grade/result).
  generate: adminQuery
    .input(z.object({
      studentId: z.number(), courseId: z.number().optional(), issueDate: z.string().optional(),
      subjects: z.array(z.object({ subjectName: z.string().min(1), maxMarks: z.number(), obtainedMarks: z.number(), remarks: z.string().optional() })).min(1),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [student] = await db.select().from(students).where(eq(students.id, input.studentId));
      if (!student) throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });
      const total = input.subjects.reduce((a, s) => a + s.maxMarks, 0);
      const obtained = input.subjects.reduce((a, s) => a + s.obtainedMarks, 0);
      const percentage = total > 0 ? +((obtained / total) * 100).toFixed(2) : 0;
      const grade = gradeFor(percentage);
      const resultStatus = percentage >= 35 ? "pass" : "fail";
      const marksheetNumber = genNumber();
      const issueDate = input.issueDate || new Date().toISOString().slice(0, 10);
      const res = await db.insert(marksheets).values({
        studentId: student.id, courseId: input.courseId ?? student.courseId ?? undefined, centreId: student.centerId,
        marksheetNumber, totalMarks: total, obtainedMarks: obtained, percentage: percentage.toFixed(2),
        grade, resultStatus, issueDate, qrCode: `/verify/${marksheetNumber}`, status: "issued",
      });
      const marksheetId = Number(res[0].insertId);
      for (const s of input.subjects) {
        await db.insert(marksheetSubjects).values({
          marksheetId, subjectName: s.subjectName, maxMarks: s.maxMarks, obtainedMarks: s.obtainedMarks,
          grade: gradeFor(s.maxMarks > 0 ? (s.obtainedMarks / s.maxMarks) * 100 : 0), remarks: s.remarks,
        });
      }
      return { success: true, id: marksheetId, marksheetNumber, percentage, grade, resultStatus };
    }),

  revoke: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(marksheets).set({ status: "revoked" }).where(eq(marksheets.id, input.id));
    return { success: true };
  }),

  delete: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.delete(marksheetSubjects).where(eq(marksheetSubjects.marksheetId, input.id));
    await db.delete(marksheets).where(eq(marksheets.id, input.id));
    return { success: true };
  }),
});

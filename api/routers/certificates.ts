import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { certificates, students, courses, centers } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

// Pick certificate type + template from a course duration string ("6 Months", "1 Year", "12 Months"…).
function typeFromDuration(duration?: string | null): { type: "one_year" | "six_months" | "three_months" | "default"; template: string } {
  const d = (duration || "").toLowerCase();
  const months = /(\d+)\s*month/.exec(d)?.[1];
  if (/year|12\s*month/.test(d) || months === "12") return { type: "one_year", template: "one-year" };
  if (months === "6") return { type: "six_months", template: "six-months" };
  if (months === "3") return { type: "three_months", template: "three-months" };
  return { type: "default", template: "default" };
}

const genNumber = () => `UAN24-CERT-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

export const certificateRouter = createRouter({
  list: adminQuery.input(z.object({ studentId: z.number().optional(), page: z.number().default(1), limit: z.number().default(50) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const where = input?.studentId ? eq(certificates.studentId, input.studentId) : undefined;
      const list = await db.select({
        id: certificates.id, serialNumber: certificates.serialNumber, studentName: certificates.studentName,
        courseName: certificates.courseName, certificateType: certificates.certificateType,
        issueDate: certificates.issueDate, status: certificates.status, centreName: centers.name,
      }).from(certificates).leftJoin(centers, eq(certificates.centreId, centers.id))
        .where(where).orderBy(desc(certificates.createdAt)).limit(input?.limit || 50).offset(((input?.page || 1) - 1) * (input?.limit || 50));
      const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(certificates).where(where);
      return { list, total: countResult?.count || 0 };
    }),

  // Full data for rendering the certificate (public — used by print page + dashboards).
  detail: publicQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const [cert] = await db.select().from(certificates).where(eq(certificates.id, input.id));
    if (!cert) return null;
    const [student] = cert.studentId ? await db.select().from(students).where(eq(students.id, cert.studentId)) : [null];
    const [course] = cert.courseId ? await db.select().from(courses).where(eq(courses.id, cert.courseId)) : [null];
    const [centre] = cert.centreId ? await db.select().from(centers).where(eq(centers.id, cert.centreId)) : [null];
    return { cert, student, course, centre };
  }),

  byStudent: publicQuery.input(z.object({ studentId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    return db.select().from(certificates).where(eq(certificates.studentId, input.studentId)).orderBy(desc(certificates.createdAt));
  }),

  byCenter: publicQuery.input(z.object({ centerId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    return db.select({
      id: certificates.id, serialNumber: certificates.serialNumber, studentName: certificates.studentName,
      courseName: certificates.courseName, certificateType: certificates.certificateType,
      issueDate: certificates.issueDate, status: certificates.status,
    }).from(certificates).innerJoin(students, eq(certificates.studentId, students.id))
      .where(eq(students.centerId, input.centerId)).orderBy(desc(certificates.createdAt));
  }),

  // Public verification by certificate number (or QR scan → /verify/:number).
  verify: publicQuery.input(z.object({ number: z.string() })).query(async ({ input }) => {
    const db = getDb();
    const [cert] = await db.select().from(certificates).where(eq(certificates.serialNumber, input.number.trim()));
    if (!cert) return { found: false as const };
    const [centre] = cert.centreId ? await db.select().from(centers).where(eq(centers.id, cert.centreId)) : [null];
    return {
      found: true as const, valid: cert.status === "issued",
      studentName: cert.studentName, courseName: cert.courseName, courseDuration: cert.courseDuration,
      centreName: centre?.name, centreCity: centre?.city, issueDate: cert.issueDate, status: cert.status,
      certificateNumber: cert.serialNumber, certificateType: cert.certificateType,
    };
  }),

  bySerial: publicQuery.input(z.object({ serial: z.string() })).query(async ({ input }) => {
    const db = getDb();
    const [cert] = await db.select().from(certificates).where(eq(certificates.serialNumber, input.serial));
    return cert || null;
  }),

  // Issue a certificate — all fields derived dynamically from student/course/centre.
  issue: adminQuery
    .input(z.object({ studentId: z.number(), completionDate: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [student] = await db.select().from(students).where(eq(students.id, input.studentId));
      if (!student) throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });
      const [course] = student.courseId ? await db.select().from(courses).where(eq(courses.id, student.courseId)) : [null];
      const { type, template } = typeFromDuration(course?.duration);
      const serialNumber = genNumber();
      const issueDate = new Date().toISOString().slice(0, 10);
      const result = await db.insert(certificates).values({
        studentId: student.id, courseId: student.courseId ?? 0, centreId: student.centerId,
        serialNumber, studentName: student.name, courseName: course?.name,
        certificateType: type, templateUsed: template, courseDuration: course?.duration,
        issueDate, completionDate: input.completionDate || issueDate,
        qrCode: `/verify/${serialNumber}`, status: "issued",
      });
      await db.update(students).set({ certificateIssued: true, certificateSerial: serialNumber }).where(eq(students.id, student.id));
      return { success: true, id: Number(result[0].insertId), serialNumber, certificateType: type };
    }),

  revoke: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(certificates).set({ status: "revoked" }).where(eq(certificates.id, input.id));
    return { success: true };
  }),

  delete: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.delete(certificates).where(eq(certificates.id, input.id));
    return { success: true };
  }),
});

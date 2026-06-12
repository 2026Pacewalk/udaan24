import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { exams, questions, examAttempts, results } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const examRouter = createRouter({
  list: publicQuery.input(z.object({ courseId: z.number().optional(), status: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.courseId) conditions.push(eq(exams.courseId, input.courseId));
      if (input?.status) conditions.push(eq(exams.status, input.status as any));
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      return db.select().from(exams).where(where).orderBy(desc(exams.examDate));
    }),

  byId: publicQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const [exam] = await db.select().from(exams).where(eq(exams.id, input.id));
    if (!exam) return null;
    const questionList = await db.select().from(questions).where(eq(questions.examId, input.id));
    return { ...exam, questions: questionList };
  }),

  create: adminQuery
    .input(z.object({
      courseId: z.number(), name: z.string().min(1), description: z.string().optional(),
      maxMarks: z.number().optional(), passingMarks: z.number().optional(),
      duration: z.number().optional(), negativeMarking: z.boolean().optional(),
      randomQuestions: z.boolean().optional(), examDate: z.string().optional(),
    })).mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(exams).values(input);
      return { success: true, id: Number(result[0].insertId) };
    }),

  update: adminQuery
    .input(z.object({ id: z.number(), name: z.string().optional(), status: z.enum(["upcoming", "ongoing", "completed", "draft"]).optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(exams).set(data).where(eq(exams.id, id));
      return { success: true };
    }),

  delete: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.delete(exams).where(eq(exams.id, input.id));
    return { success: true };
  }),

  addQuestion: adminQuery
    .input(z.object({
      examId: z.number(), question: z.string().min(1),
      optionA: z.string().optional(), optionB: z.string().optional(),
      optionC: z.string().optional(), optionD: z.string().optional(),
      correctAnswer: z.enum(["a", "b", "c", "d"]).optional(), marks: z.number().optional(),
    })).mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(questions).values(input);
      return { success: true, id: Number(result[0].insertId) };
    }),

  deleteQuestion: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.delete(questions).where(eq(questions.id, input.id));
    return { success: true };
  }),

  submitAttempt: publicQuery
    .input(z.object({
      studentId: z.number(), examId: z.number(), answers: z.any(),
      marksObtained: z.number(), totalMarks: z.number(),
      percentage: z.string(), grade: z.string().optional(), status: z.enum(["pass", "fail"]),
    })).mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(examAttempts).values({
        studentId: input.studentId, examId: input.examId, answers: input.answers,
        marksObtained: input.marksObtained, totalMarks: input.totalMarks,
        percentage: input.percentage, grade: input.grade, status: input.status,
      });
      await db.insert(results).values({
        studentId: input.studentId, examId: input.examId, attemptId: Number(result[0].insertId),
        marksObtained: input.marksObtained, totalMarks: input.totalMarks,
        percentage: input.percentage, grade: input.grade, status: input.status,
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  getAttempts: publicQuery.input(z.object({ studentId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    return db.select().from(examAttempts).where(eq(examAttempts.studentId, input.studentId)).orderBy(desc(examAttempts.submittedAt));
  }),

  getResults: publicQuery.input(z.object({ examId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    return db.select().from(results).where(eq(results.examId, input.examId));
  }),
});

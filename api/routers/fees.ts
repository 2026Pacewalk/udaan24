import { z } from "zod";
import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { feePayments, students } from "@db/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";

export const feeRouter = createRouter({
  list: adminQuery.input(z.object({ studentId: z.number().optional(), status: z.string().optional(), page: z.number().default(1), limit: z.number().default(50) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.studentId) conditions.push(eq(feePayments.studentId, input.studentId));
      if (input?.status) conditions.push(eq(feePayments.status, input.status as any));
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      const list = await db.select().from(feePayments).where(where).orderBy(desc(feePayments.createdAt)).limit(input?.limit || 50).offset(((input?.page || 1) - 1) * (input?.limit || 50));
      const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(feePayments).where(where);
      return { list, total: countResult?.count || 0 };
    }),

  recordPayment: adminQuery
    .input(z.object({ studentId: z.number(), courseId: z.number(), amount: z.string(),
      paymentMethod: z.enum(["cash", "card", "upi", "net_banking"]), transactionId: z.string().optional(),
    })).mutation(async ({ input }) => {
      const db = getDb();
      const receiptNumber = `RCP-${Date.now().toString(36).toUpperCase()}`;
      const result = await db.insert(feePayments).values({ ...input, receiptNumber, amount: input.amount });
      await db.update(students).set({ feeStatus: "paid" }).where(eq(students.id, input.studentId));
      return { success: true, id: Number(result[0].insertId), receiptNumber };
    }),

  dueFees: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(students).where(eq(students.feeStatus, "pending"));
  }),

  delete: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.delete(feePayments).where(eq(feePayments.id, input.id));
    return { success: true };
  }),
});

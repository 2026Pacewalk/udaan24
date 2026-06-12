import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { testimonials } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const testimonialRouter = createRouter({
  list: publicQuery
    .input(z.object({
      isActive: z.boolean().optional(),
      limit: z.number().default(10),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const list = await db.select().from(testimonials)
        .where(input?.isActive !== undefined ? eq(testimonials.isActive, input.isActive) : undefined)
        .orderBy(desc(testimonials.createdAt))
        .limit(input?.limit || 10);
      return list;
    }),

  create: adminQuery
    .input(z.object({
      name: z.string().min(1),
      course: z.string().optional(),
      content: z.string().min(1),
      photo: z.string().optional(),
      rating: z.number().min(1).max(5).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(testimonials).values(input);
      return { success: true, id: Number(result[0].insertId) };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(testimonials).where(eq(testimonials.id, input.id));
      return { success: true };
    }),
});

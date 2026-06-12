import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { courses } from "@db/schema";
import { eq, like, and, desc, sql } from "drizzle-orm";

export const courseRouter = createRouter({
  list: publicQuery
    .input(z.object({ category: z.string().optional(), search: z.string().optional(), status: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.category) conditions.push(eq(courses.category, input.category as any));
      if (input?.status) conditions.push(eq(courses.status, input.status as any));
      if (input?.search) conditions.push(like(courses.name, `%${input.search}%`));
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      return db.select().from(courses).where(where).orderBy(desc(courses.createdAt));
    }),

  bySlug: publicQuery.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const db = getDb();
    const [course] = await db.select().from(courses).where(eq(courses.slug, input.slug));
    return course || null;
  }),

  byId: publicQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const [course] = await db.select().from(courses).where(eq(courses.id, input.id));
    return course || null;
  }),

  create: adminQuery
    .input(z.object({
      name: z.string().min(1), slug: z.string().min(1), category: z.enum(["foundation", "core_ai", "advanced_ai", "specialization", "analytics", "premium", "short_term"]),
      shortDescription: z.string().optional(), description: z.string().optional(), highlights: z.string().optional(),
      syllabus: z.string().optional(), duration: z.string().optional(),
      eligibility: z.string().optional(), fee: z.string().optional(),
      onlineFee: z.string().optional(), offlineFee: z.string().optional(),
      registrationFee: z.string().optional(), examFee: z.string().optional(), certification: z.string().optional(),
      careerOpportunities: z.string().optional(), thumbnail: z.string().optional(),
      mode: z.enum(["online", "offline", "hybrid"]).optional(),
      status: z.enum(["active", "inactive"]).optional(),
      seoTitle: z.string().optional(), seoDescription: z.string().optional(), seoKeywords: z.string().optional(),
    })).mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(courses).values({ ...input, fee: input.fee || undefined });
      return { success: true, id: Number(result[0].insertId) };
    }),

  update: adminQuery
    .input(z.object({
      id: z.number(), name: z.string().optional(), slug: z.string().optional(),
      category: z.enum(["foundation", "core_ai", "advanced_ai", "specialization", "analytics", "premium", "short_term"]).optional(),
      shortDescription: z.string().optional(), description: z.string().optional(), highlights: z.string().optional(),
      status: z.enum(["active", "inactive"]).optional(),
      fee: z.string().optional(), onlineFee: z.string().optional(), offlineFee: z.string().optional(),
      registrationFee: z.string().optional(), examFee: z.string().optional(),
      syllabus: z.string().optional(), duration: z.string().optional(), eligibility: z.string().optional(),
      certification: z.string().optional(), careerOpportunities: z.string().optional(),
      thumbnail: z.string().optional(), mode: z.enum(["online", "offline", "hybrid"]).optional(),
      seoTitle: z.string().optional(), seoDescription: z.string().optional(), seoKeywords: z.string().optional(),
    })).mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(courses).set(data).where(eq(courses.id, id));
      return { success: true };
    }),

  delete: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.delete(courses).where(eq(courses.id, input.id));
    return { success: true };
  }),
});

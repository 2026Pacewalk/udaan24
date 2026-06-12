import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { blogPosts } from "@db/schema";
import { eq, like, desc, sql } from "drizzle-orm";

export const blogRouter = createRouter({
  list: publicQuery.input(z.object({ category: z.string().optional(), search: z.string().optional(), page: z.number().default(1), limit: z.number().default(12) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.category) conditions.push(eq(blogPosts.category, input.category));
      if (input?.search) conditions.push(like(blogPosts.title, `%${input.search}%`));
      const where = conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : undefined) : undefined;
      const list = await db.select().from(blogPosts).where(where).orderBy(desc(blogPosts.createdAt)).limit(input?.limit || 12).offset(((input?.page || 1) - 1) * (input?.limit || 12));
      const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(blogPosts).where(where);
      return { list, total: countResult?.count || 0 };
    }),

  bySlug: publicQuery.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const db = getDb();
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, input.slug));
    if (post) await db.update(blogPosts).set({ views: sql`views + 1` }).where(eq(blogPosts.id, post.id));
    return post || null;
  }),

  create: adminQuery
    .input(z.object({ title: z.string().min(1), slug: z.string().min(1), excerpt: z.string().optional(), content: z.string().optional(),
      category: z.string().optional(), tags: z.string().optional(), thumbnail: z.string().optional(),
      author: z.string().optional(), seoTitle: z.string().optional(), seoDescription: z.string().optional(),
      status: z.enum(["published", "draft"]).optional(),
    })).mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(blogPosts).values(input);
      return { success: true, id: Number(result[0].insertId) };
    }),

  update: adminQuery
    .input(z.object({ id: z.number(), title: z.string().optional(), content: z.string().optional(),
      status: z.enum(["published", "draft"]).optional(), seoTitle: z.string().optional(),
    })).mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(blogPosts).set(data).where(eq(blogPosts.id, id));
      return { success: true };
    }),

  delete: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.delete(blogPosts).where(eq(blogPosts.id, input.id));
    return { success: true };
  }),
});

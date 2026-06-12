import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { gallery } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const galleryRouter = createRouter({
  list: publicQuery
    .input(z.object({
      type: z.string().optional(),
      category: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(24),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      let query = db.select().from(gallery);
      if (input?.type) query = query.where(eq(gallery.type, input.type as "image" | "video")) as typeof query;
      if (input?.category) query = query.where(eq(gallery.category, input.category)) as typeof query;
      const list = await query.orderBy(desc(gallery.createdAt)).limit(input?.limit || 24).offset(((input?.page || 1) - 1) * (input?.limit || 24));
      const countResult = await db.select({ count: sql<number>`count(*)` }).from(gallery);
      return { list, total: countResult[0]?.count || 0 };
    }),

  create: adminQuery
    .input(z.object({
      title: z.string().optional(),
      type: z.enum(["image", "video"]).default("image"),
      category: z.string().optional(),
      url: z.string().min(1),
      thumbnail: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(gallery).values(input);
      return { success: true, id: Number(result[0].insertId) };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(gallery).where(eq(gallery.id, input.id));
      return { success: true };
    }),
});

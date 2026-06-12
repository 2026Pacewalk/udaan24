import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { announcements } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const announcementRouter = createRouter({
  list: publicQuery
    .input(z.object({
      type: z.string().optional(),
      isActive: z.boolean().optional(),
      limit: z.number().default(10),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.type) conditions.push(eq(announcements.type, input.type as "general" | "exam" | "fee" | "admission"));
      if (input?.isActive !== undefined) conditions.push(eq(announcements.isActive, input.isActive));

      const where = conditions.length > 0 ? sql`${conditions.join(" AND ")}` : undefined;
      const list = await db.select().from(announcements).where(where).orderBy(desc(announcements.createdAt)).limit(input?.limit || 10);
      return list;
    }),

  create: adminQuery
    .input(z.object({
      title: z.string().min(1),
      content: z.string().optional(),
      type: z.enum(["general", "exam", "fee", "admission"]).default("general"),
      isActive: z.boolean().default(true),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(announcements).values(input);
      return { success: true, id: Number(result[0].insertId) };
    }),

  update: adminQuery
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      content: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(announcements).set(data).where(eq(announcements.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(announcements).where(eq(announcements.id, input.id));
      return { success: true };
    }),
});

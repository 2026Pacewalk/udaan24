import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { downloads } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const downloadRouter = createRouter({
  list: publicQuery
    .input(z.object({
      type: z.string().optional(),
      limit: z.number().default(50),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const list = await db.select().from(downloads)
        .where(input?.type ? eq(downloads.type, input.type as "prospectus" | "form" | "fee_structure" | "brochure" | "other") : undefined)
        .orderBy(desc(downloads.createdAt))
        .limit(input?.limit || 50);
      return list;
    }),

  create: adminQuery
    .input(z.object({
      title: z.string().min(1),
      type: z.enum(["prospectus", "form", "fee_structure", "brochure", "other"]).default("other"),
      fileUrl: z.string().min(1),
      fileSize: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(downloads).values(input);
      return { success: true, id: Number(result[0].insertId) };
    }),

  incrementDownload: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(downloads).set({ downloads: sql`downloads + 1` }).where(eq(downloads.id, input.id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(downloads).where(eq(downloads.id, input.id));
      return { success: true };
    }),
});

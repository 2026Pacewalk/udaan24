import { z } from "zod";
import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { settings } from "@db/schema";
import { eq } from "drizzle-orm";

export const settingRouter = createRouter({
  list: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(settings);
  }),

  get: adminQuery.input(z.object({ key: z.string() })).query(async ({ input }) => {
    const db = getDb();
    const [setting] = await db.select().from(settings).where(eq(settings.key, input.key));
    return setting || null;
  }),

  getByGroup: adminQuery.input(z.object({ group: z.string() })).query(async ({ input }) => {
    const db = getDb();
    return db.select().from(settings).where(eq(settings.group, input.group));
  }),

  set: adminQuery
    .input(z.object({ key: z.string(), value: z.string(), group: z.string().default("general") }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [existing] = await db.select().from(settings).where(eq(settings.key, input.key));
      if (existing) {
        await db.update(settings).set({ value: input.value, group: input.group }).where(eq(settings.key, input.key));
      } else {
        await db.insert(settings).values(input);
      }
      return { success: true };
    }),

  delete: adminQuery.input(z.object({ key: z.string() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.delete(settings).where(eq(settings.key, input.key));
    return { success: true };
  }),
});

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, superAdminQuery } from "../middleware";
import { isDriveConfigured } from "../lib/drive";
import { runBackup, listBackups, restoreFromBackup, deleteBackup, readBackup } from "../lib/backup-service";

export const backupRouter = createRouter({
  // Is Google Drive wired up? (drives the UI hint)
  status: superAdminQuery.query(() => ({ driveConfigured: isDriveConfigured() })),

  // List all backups (Drive + local), newest first.
  list: superAdminQuery.query(async () => {
    const items = await listBackups();
    return { items, driveConfigured: isDriveConfigured() };
  }),

  // Run a backup now.
  run: superAdminQuery.mutation(async () => {
    return runBackup("manual");
  }),

  // Download a backup's SQL as base64 (guarded by size).
  download: superAdminQuery.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    const buf = await readBackup(input.id);
    if (buf.length > 40 * 1024 * 1024) {
      throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Backup too large to download inline — use the Google Drive link." });
    }
    return { base64: buf.toString("base64"), sizeBytes: buf.length };
  }),

  // Restore the database from a backup (snapshots current state first).
  restore: superAdminQuery
    .input(z.object({ id: z.string(), confirm: z.literal("RESTORE") }))
    .mutation(async ({ input }) => {
      try {
        return await restoreFromBackup(input.id);
      } catch (e: any) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Restore failed: ${e?.message || e}` });
      }
    }),

  // Delete a backup (Drive or local).
  delete: superAdminQuery.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    await deleteBackup(input.id);
    return { success: true };
  }),
});

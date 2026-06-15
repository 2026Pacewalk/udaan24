import { runBackup } from "./backup-service";
import { isDriveConfigured } from "./drive";

// Fires runBackup() once per day at BACKUP_HOUR_UTC (default 02:00 UTC).
// Self-reschedules with setTimeout (no cron dependency). On Railway the local
// filesystem is ephemeral, so Google Drive is the durable destination.
export function startDailyBackupScheduler() {
  const hour = Math.min(23, Math.max(0, parseInt(process.env.BACKUP_HOUR_UTC || "2")));

  const msUntilNext = () => {
    const now = new Date();
    const next = new Date(now);
    next.setUTCHours(hour, 0, 0, 0);
    if (next.getTime() <= now.getTime()) next.setUTCDate(next.getUTCDate() + 1);
    return next.getTime() - now.getTime();
  };

  const schedule = () => {
    const delay = msUntilNext();
    setTimeout(async () => {
      try {
        await runBackup("scheduled");
      } catch (e) {
        console.error("[backup:scheduled] failed:", e);
      }
      schedule(); // reschedule for the next day
    }, delay);
    console.log(
      `[backup] daily scheduler armed for ${hour.toString().padStart(2, "0")}:00 UTC ` +
      `(next run in ~${Math.round(delay / 3600000)}h). Drive configured: ${isDriveConfigured()}`,
    );
  };

  schedule();
}

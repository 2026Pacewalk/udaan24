import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { env } from "./env";
import { isDriveConfigured, uploadToDrive, listDriveBackups, downloadDriveFile, deleteDriveFile } from "./drive";

const BACKUP_DIR = path.join(process.cwd(), "backups");
const FILE_PREFIX = "udaan24-backup-";
const KEEP_LOCAL = 7; // keep the newest N local files

function ensureDir() {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function timestamp(): string {
  // 2026-06-12T14-03-55 → filename-safe
  return new Date().toISOString().replace(/[:T]/g, "-").replace(/\..+/, "");
}

// Escape a single value for an SQL literal. Objects (JSON columns) are
// stringified; Dates/Buffers/strings/numbers/null go through mysql2's escaper.
function escapeValue(conn: mysql.Connection, v: any): string {
  if (v === null || v === undefined) return "NULL";
  if (v instanceof Date) return conn.escape(v);
  if (Buffer.isBuffer(v)) return conn.escape(v);
  if (typeof v === "object") return conn.escape(JSON.stringify(v));
  return conn.escape(v);
}

// ─── Create a full logical SQL dump of the database ───
export async function dumpDatabaseToSql(): Promise<{ sql: string; tables: string[]; rows: number }> {
  const conn = await mysql.createConnection(env.databaseUrl);
  try {
    const [tableRows] = await conn.query<any[]>("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'");
    const tables = tableRows.map((r) => Object.values(r)[0] as string);

    let sql = `-- Udaan24 database backup\n-- Generated: ${new Date().toISOString()}\n`;
    sql += `SET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS=0;\n\n`;
    let totalRows = 0;

    for (const table of tables) {
      const [createRows] = await conn.query<any[]>(`SHOW CREATE TABLE \`${table}\``);
      const createSql = createRows[0]["Create Table"] || createRows[0]["Create View"];
      sql += `DROP TABLE IF EXISTS \`${table}\`;\n${createSql};\n\n`;

      const [rows] = await conn.query<any[]>(`SELECT * FROM \`${table}\``);
      if (rows.length) {
        const cols = Object.keys(rows[0]).map((c) => `\`${c}\``).join(", ");
        const BATCH = 100;
        for (let i = 0; i < rows.length; i += BATCH) {
          const chunk = rows.slice(i, i + BATCH);
          const values = chunk
            .map((row) => "(" + Object.values(row).map((v) => escapeValue(conn, v)).join(", ") + ")")
            .join(",\n");
          sql += `INSERT INTO \`${table}\` (${cols}) VALUES\n${values};\n`;
        }
        sql += "\n";
        totalRows += rows.length;
      }
    }
    sql += `SET FOREIGN_KEY_CHECKS=1;\n`;
    return { sql, tables, rows: totalRows };
  } finally {
    await conn.end();
  }
}

// ─── Restore the database from a SQL dump string ───
export async function restoreSqlToDatabase(sql: string): Promise<void> {
  const conn = await mysql.createConnection({ uri: env.databaseUrl, multipleStatements: true });
  try {
    await conn.query("SET FOREIGN_KEY_CHECKS=0;");
    await conn.query(sql);
    await conn.query("SET FOREIGN_KEY_CHECKS=1;");
  } finally {
    await conn.end();
  }
}

// Prune local files beyond KEEP_LOCAL (newest kept).
function pruneLocal() {
  ensureDir();
  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.startsWith(FILE_PREFIX) && f.endsWith(".sql"))
    .sort()
    .reverse();
  for (const f of files.slice(KEEP_LOCAL)) {
    try { fs.unlinkSync(path.join(BACKUP_DIR, f)); } catch { /* ignore */ }
  }
}

export type RunBackupResult = {
  filename: string;
  sizeBytes: number;
  tables: number;
  rows: number;
  savedLocal: boolean;
  uploadedDrive: boolean;
  driveFileId?: string;
  driveLink?: string;
  driveError?: string;
};

// ─── Orchestrate: dump → save local → upload to Drive ───
export async function runBackup(source: "manual" | "scheduled" = "manual"): Promise<RunBackupResult> {
  const { sql, tables, rows } = await dumpDatabaseToSql();
  const filename = `${FILE_PREFIX}${timestamp()}.sql`;
  const buffer = Buffer.from(sql, "utf-8");

  // Local save
  ensureDir();
  const localPath = path.join(BACKUP_DIR, filename);
  let savedLocal = false;
  try {
    fs.writeFileSync(localPath, buffer);
    savedLocal = true;
    pruneLocal();
  } catch { /* ephemeral fs may fail; Drive is the durable copy */ }

  const result: RunBackupResult = {
    filename, sizeBytes: buffer.length, tables: tables.length, rows, savedLocal, uploadedDrive: false,
  };

  // Drive upload
  if (isDriveConfigured()) {
    try {
      const up = await uploadToDrive(filename, buffer, "application/sql");
      result.uploadedDrive = true;
      result.driveFileId = up.id;
      result.driveLink = up.webViewLink;
    } catch (e: any) {
      result.driveError = e?.message || String(e);
    }
  }

  console.log(`[backup:${source}] ${filename} — ${tables.length} tables, ${rows} rows, ${(buffer.length / 1024).toFixed(0)} KB · local=${savedLocal} drive=${result.uploadedDrive}${result.driveError ? " (" + result.driveError + ")" : ""}`);
  return result;
}

export type BackupEntry = {
  id: string;          // driveFileId or "local:<filename>"
  name: string;
  sizeBytes: number;
  createdTime: string;
  source: "drive" | "local";
  link?: string;
};

// ─── List backups from Drive + local disk (most recent first) ───
export async function listBackups(): Promise<BackupEntry[]> {
  const out: BackupEntry[] = [];

  if (isDriveConfigured()) {
    try {
      const files = await listDriveBackups();
      for (const f of files) {
        out.push({
          id: f.id, name: f.name, sizeBytes: Number(f.size || 0),
          createdTime: f.createdTime, source: "drive", link: f.webViewLink,
        });
      }
    } catch { /* surface elsewhere via status */ }
  }

  ensureDir();
  try {
    for (const f of fs.readdirSync(BACKUP_DIR).filter((x) => x.startsWith(FILE_PREFIX) && x.endsWith(".sql"))) {
      const stat = fs.statSync(path.join(BACKUP_DIR, f));
      out.push({ id: `local:${f}`, name: f, sizeBytes: stat.size, createdTime: stat.mtime.toISOString(), source: "local" });
    }
  } catch { /* ignore */ }

  return out.sort((a, b) => (a.createdTime < b.createdTime ? 1 : -1));
}

// Read a backup's SQL bytes by id (drive file id or "local:<filename>").
export async function readBackup(id: string): Promise<Buffer> {
  if (id.startsWith("local:")) {
    const file = id.slice("local:".length);
    if (file.includes("/") || file.includes("\\")) throw new Error("Invalid backup id");
    return fs.readFileSync(path.join(BACKUP_DIR, file));
  }
  return downloadDriveFile(id);
}

export async function deleteBackup(id: string): Promise<void> {
  if (id.startsWith("local:")) {
    const file = id.slice("local:".length);
    if (file.includes("/") || file.includes("\\")) throw new Error("Invalid backup id");
    fs.unlinkSync(path.join(BACKUP_DIR, file));
    return;
  }
  await deleteDriveFile(id);
}

// Restore from a stored backup id (creates a safety dump first).
export async function restoreFromBackup(id: string): Promise<{ safetyFile: string }> {
  // Safety: snapshot current DB before overwriting.
  let safetyFile = "";
  try {
    const safety = await runBackup("manual");
    safetyFile = safety.filename;
  } catch { /* best effort */ }

  const buffer = await readBackup(id);
  await restoreSqlToDatabase(buffer.toString("utf-8"));
  return { safetyFile };
}

/**
 * Idempotent migration: widen image/data-URL columns from TEXT (64 KB) to
 * MEDIUMTEXT (16 MB). TEXT was too small for base64 profile images, causing
 * "Data too long for column" insert failures when a photo was uploaded.
 *
 * Safe to run repeatedly — it checks the current type and only ALTERs when needed.
 * Run: `npx tsx db/migrate-media-columns.ts` (reads DATABASE_URL from .env).
 */
import "dotenv/config";
import mysql from "mysql2/promise";

const COLUMNS = [
  { table: "students", col: "photo" },
  { table: "courses", col: "thumbnail" },
  { table: "centers", col: "logo" },
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  const conn = await mysql.createConnection(url);
  try {
    for (const { table, col } of COLUMNS) {
      const [rows] = await conn.query(
        "SELECT DATA_TYPE FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?",
        [table, col],
      );
      const dataType = (rows as any[])[0]?.DATA_TYPE?.toLowerCase();
      if (!dataType) { console.log(`- skip ${table}.${col} (column not found)`); continue; }
      if (dataType === "mediumtext" || dataType === "longtext") { console.log(`- ok   ${table}.${col} already ${dataType}`); continue; }
      await conn.query(`ALTER TABLE \`${table}\` MODIFY \`${col}\` MEDIUMTEXT`);
      console.log(`- DONE ${table}.${col}: ${dataType} -> mediumtext`);
    }
    console.log("media-columns migration complete");
  } finally {
    await conn.end();
  }
}

main().catch((e) => { console.error("media-columns migration FAILED:", e?.message || e); process.exit(1); });

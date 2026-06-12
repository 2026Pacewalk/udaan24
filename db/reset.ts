import "dotenv/config";
import { createConnection } from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required to reset. Set it in app/.env");
}

// Truncates every table in the current database (keeps the schema, resets
// AUTO_INCREMENT). Run this before `tsx db/seed.ts` for a clean re-seed.
async function reset() {
  const conn = await createConnection({ uri: DATABASE_URL });
  await conn.query("SET FOREIGN_KEY_CHECKS = 0");
  const [tables] = (await conn.query(
    "SELECT TABLE_NAME AS t FROM information_schema.tables WHERE table_schema = DATABASE()",
  )) as any[];
  for (const row of tables as any[]) {
    await conn.query(`TRUNCATE TABLE \`${row.t}\``);
    console.log(`Truncated: ${row.t}`);
  }
  await conn.query("SET FOREIGN_KEY_CHECKS = 1");
  console.log("All tables truncated.");
  await conn.end();
}

reset().catch((e) => { console.error("Error:", e.message); process.exit(1); });

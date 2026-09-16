/**
 * Keep only the real Kotkapura centre.
 * - Updates centre id=1 (UAN24-KKP) with the correct address + phone.
 * - Reassigns every reference from the demo centres (2,3,4) to centre 1
 *   (no FK constraints exist; this keeps data consistent, no orphaned centre_id).
 * - Deletes the 3 demo centres (Bathinda, Faridkot, Ludhiana).
 * Run: npx tsx db/fix-centres.ts   (reads DATABASE_URL from .env)
 */
import "dotenv/config";
import mysql from "mysql2/promise";

const KEEP_CODE = "UAN24-KKP";
const REMOVE_CODES = ["UAN24-BTI", "UAN24-FDR", "UAN24-LDH"];

const NEW_ADDRESS = "Batian wala Chownk, Jaitu Road, opposite Car Parking, Above Punjab & Sind Bank";
const NEW_CITY = "Kotkapura";
const NEW_STATE = "Punjab";
const NEW_PHONE = "+91 97803 16116";

// table -> centre-id column(s) to remap
const REFS: Array<[string, string[]]> = [
  ["students", ["center_id"]],
  ["admission_form_links", ["centre_id"]],
  ["enquiries", ["selected_centre_id", "assigned_centre_id"]],
  ["certificates", ["centre_id"]],
  ["marksheets", ["centre_id"]],
  ["notifications", ["center_id"]],
  ["student_referrals", ["responsible_centre_id"]],
  ["referral_transactions", ["responsible_centre_id"]],
  ["student_wallets", ["centre_id"]],
  ["wallet_statements", ["centre_id"]],
  ["payout_requests", ["centre_id"]],
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  const c = await mysql.createConnection(url);
  try {
    const [[keep]] = await c.query<any[]>("SELECT id FROM centers WHERE center_code=?", [KEEP_CODE]);
    if (!keep) throw new Error(`Keep centre ${KEEP_CODE} not found`);
    const keepId = keep.id;
    const [rmRows] = await c.query<any[]>(
      `SELECT id, center_code FROM centers WHERE center_code IN (${REMOVE_CODES.map(() => "?").join(",")})`,
      REMOVE_CODES,
    );
    const removeIds = rmRows.map((r) => r.id);
    console.log("keep centre id:", keepId, "| remove ids:", removeIds.join(",") || "(none)");

    // 1) Update the kept centre.
    await c.query(
      "UPDATE centers SET address=?, city=?, state=?, owner_phone=? WHERE id=?",
      [NEW_ADDRESS, NEW_CITY, NEW_STATE, NEW_PHONE, keepId],
    );
    console.log("updated centre", keepId, "address/phone");

    // 2) Remap all references off the removed centres onto the kept one.
    if (removeIds.length) {
      const inList = removeIds.map(() => "?").join(",");
      for (const [table, cols] of REFS) {
        for (const col of cols) {
          const [res] = await c
            .query<any>(`UPDATE ${table} SET ${col}=? WHERE ${col} IN (${inList})`, [keepId, ...removeIds])
            .catch((e) => { console.log(`  skip ${table}.${col}:`, e?.code || e?.message); return [{ affectedRows: 0 }] as any; });
          if (res?.affectedRows) console.log(`  remapped ${table}.${col}:`, res.affectedRows);
        }
      }
      // 3) Delete the demo centres.
      const [del] = await c.query<any>(`DELETE FROM centers WHERE id IN (${inList})`, removeIds);
      console.log("deleted demo centres:", del.affectedRows);
    }

    const [[cnt]] = await c.query<any[]>("SELECT COUNT(*) n FROM centers");
    const [remaining] = await c.query<any[]>("SELECT id, center_code, name, address, city, state, owner_phone FROM centers");
    console.log("centres now:", cnt.n);
    remaining.forEach((r) => console.log("  -", r.center_code, "|", r.name, "|", r.address + ", " + r.city + ", " + r.state, "|", r.owner_phone));
    console.log("done.");
  } finally {
    await c.end();
  }
}

main().catch((e) => { console.error("fix-centres FAILED:", e?.message || e); process.exit(1); });

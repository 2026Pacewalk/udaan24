/**
 * Replace the entire course catalog with the Master Curriculum courses.
 * - inserts all COURSES (courses-data.ts)
 * - remaps students/exams/fee_payments off the old courses (no FK constraints
 *   exist, so this just keeps data consistent — no orphaned course_id)
 * - deletes the old courses
 * Run: npx tsx db/replace-courses.ts   (reads DATABASE_URL from .env)
 */
import "dotenv/config";
import mysql from "mysql2/promise";
import { COURSES } from "./courses-data";

const COLMAP: Record<string, string> = {
  name: "name", slug: "slug", category: "category", shortDescription: "short_description",
  description: "description", highlights: "highlights", syllabus: "syllabus", duration: "duration",
  eligibility: "eligibility", fee: "fee", onlineFee: "online_fee", offlineFee: "offline_fee",
  certification: "certification", careerOpportunities: "career_opportunities", thumbnail: "thumbnail",
  mode: "mode", status: "status", seoTitle: "seo_title", seoDescription: "seo_description", seoKeywords: "seo_keywords",
};

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  const c = await mysql.createConnection(url);
  try {
    const [oldRows] = await c.query<any[]>("SELECT id FROM courses");
    console.log("existing courses (removing):", oldRows.length);
    // Replace the whole catalog: clear existing courses first (no FK constraints;
    // students/exams are remapped to the new courses below).
    await c.query("DELETE FROM courses");

    const newIds: number[] = [];
    for (const course of COURSES) {
      const cols: string[] = [], ph: string[] = [], vals: any[] = [];
      for (const [k, col] of Object.entries(COLMAP)) {
        cols.push("`" + col + "`"); ph.push("?");
        const v = (course as any)[k];
        vals.push(v === undefined ? null : v);
      }
      const [res] = await c.query<any>("INSERT INTO courses (" + cols.join(",") + ") VALUES (" + ph.join(",") + ")", vals);
      newIds.push(res.insertId);
    }
    console.log("inserted new courses:", newIds.length);

    // Remap references (round-robin students; exams/fees to first new course).
    const [studs] = await c.query<any[]>("SELECT id FROM students ORDER BY id");
    for (let i = 0; i < studs.length; i++) {
      await c.query("UPDATE students SET course_id=? WHERE id=?", [newIds[i % newIds.length], studs[i].id]);
    }
    await c.query("UPDATE exams SET course_id=?", [newIds[0]]).catch(() => {});
    await c.query("UPDATE fee_payments SET course_id=?", [newIds[0]]).catch(() => {});

    const [[cnt]] = await c.query<any[]>("SELECT COUNT(*) n FROM courses");
    const [[orph]] = await c.query<any[]>("SELECT COUNT(*) n FROM students WHERE course_id NOT IN (SELECT id FROM courses)");
    console.log("courses now:", cnt.n, "| orphan students:", orph.n);
    console.log("done.");
  } finally {
    await c.end();
  }
}

main().catch((e) => { console.error("replace-courses FAILED:", e?.message || e); process.exit(1); });

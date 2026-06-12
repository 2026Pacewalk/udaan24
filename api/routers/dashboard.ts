import { z } from "zod";
import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { students, courses, centers, enquiries, feePayments, exams, certificates, activityLogs, results } from "@db/schema";
import { sql, eq, and, gte, desc } from "drizzle-orm";

export const dashboardRouter = createRouter({
  stats: adminQuery.query(async () => {
    const db = getDb();
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [studentsCount] = await db.select({ count: sql<number>`count(*)` }).from(students);
    const [coursesCount] = await db.select({ count: sql<number>`count(*)` }).from(courses).where(eq(courses.status, "active"));
    const [centersCount] = await db.select({ count: sql<number>`count(*)` }).from(centers).where(eq(centers.status, "active"));
    const [enquiriesCount] = await db.select({ count: sql<number>`count(*)` }).from(enquiries);
    const [pendingEnquiries] = await db.select({ count: sql<number>`count(*)` }).from(enquiries).where(eq(enquiries.status, "new"));
    const [pendingCenters] = await db.select({ count: sql<number>`count(*)` }).from(centers).where(eq(centers.status, "pending"));
    const [certificatesCount] = await db.select({ count: sql<number>`count(*)` }).from(certificates);
    const [feeThisMonth] = await db.select({ total: sql<string>`COALESCE(sum(amount), 0)` }).from(feePayments).where(gte(feePayments.createdAt, firstDayOfMonth));
    const [upcomingExams] = await db.select({ count: sql<number>`count(*)` }).from(exams).where(eq(exams.status, "upcoming"));
    const [activeStudents] = await db.select({ count: sql<number>`count(*)` }).from(students).where(eq(students.status, "active"));
    const [pendingFees] = await db.select({ count: sql<number>`count(*)` }).from(students).where(eq(students.feeStatus, "pending"));
    const [resultsCount] = await db.select({ count: sql<number>`count(*)` }).from(results);

    return {
      totalStudents: studentsCount?.count || 0,
      activeCourses: coursesCount?.count || 0,
      totalCenters: centersCount?.count || 0,
      totalEnquiries: enquiriesCount?.count || 0,
      pendingEnquiries: pendingEnquiries?.count || 0,
      pendingCenters: pendingCenters?.count || 0,
      certificatesIssued: certificatesCount?.count || 0,
      feeThisMonth: feeThisMonth?.total || "0",
      upcomingExams: upcomingExams?.count || 0,
      activeStudents: activeStudents?.count || 0,
      pendingFees: pendingFees?.count || 0,
      totalResults: resultsCount?.count || 0,
    };
  }),

  recentActivity: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(20);
  }),

  admissionsTrend: adminQuery.query(async () => {
    const db = getDb();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const [result] = await db.select({ count: sql<number>`count(*)` }).from(students)
        .where(and(gte(students.createdAt, start), gte(end, students.createdAt)));
      months.push({
        month: d.toLocaleString("default", { month: "short" }),
        count: result?.count || 0,
      });
    }
    return months;
  }),

  recentStudents: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(students).orderBy(desc(students.createdAt)).limit(10);
  }),

  recentEnquiries: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(enquiries).orderBy(desc(enquiries.createdAt)).limit(10);
  }),

  // Real fee-status distribution across all students (drives the donut chart).
  feeBreakdown: adminQuery.query(async () => {
    const db = getDb();
    const [paid] = await db.select({ c: sql<number>`count(*)` }).from(students).where(eq(students.feeStatus, "paid"));
    const [partial] = await db.select({ c: sql<number>`count(*)` }).from(students).where(eq(students.feeStatus, "partial"));
    const [pending] = await db.select({ c: sql<number>`count(*)` }).from(students).where(eq(students.feeStatus, "pending"));
    const paidC = paid?.c || 0, partialC = partial?.c || 0, pendingC = pending?.c || 0;
    const total = paidC + partialC + pendingC;
    const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
    return {
      total,
      paid: paidC, partial: partialC, pending: pendingC,
      paidPct: pct(paidC), partialPct: pct(partialC), pendingPct: pct(pendingC),
    };
  }),
});

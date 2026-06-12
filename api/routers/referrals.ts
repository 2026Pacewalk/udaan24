import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, adminQuery, superAdminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import {
  students, courses, centers, settings, studentReferrals, referralTransactions,
  studentWallets, walletStatements, payoutRequests,
} from "@db/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";

// ─── Helpers ───
function genReferralCode(id: number) {
  const rnd = () => "ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.floor(Math.random() * 24)];
  return "UDN" + id.toString(36).toUpperCase() + rnd() + rnd();
}

async function getReferralSettings(db: ReturnType<typeof getDb>) {
  const rows = await db.select().from(settings).where(eq(settings.group, "referral"));
  const m: Record<string, string> = Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));
  return {
    enabled: (m.referral_enabled ?? "true") === "true",
    discountPercent: Number(m.referral_discount_percent ?? 5),
    commissionPercent: Number(m.referral_commission_percent ?? 10),
    approvalType: (m.referral_approval_type ?? "manual") as "auto" | "manual",
    minPayout: Number(m.referral_min_payout ?? 100),
    payoutModes: (m.referral_payout_modes ?? "cash,upi,bank").split(",").map((s) => s.trim()),
    cookieDays: Number(m.referral_cookie_days ?? 30),
    terms: m.referral_terms ?? "",
  };
}

// Resolve the centre responsible for a referrer's payouts: their mapped centre,
// else the configured Head Office / Main Centre (auto-created if missing).
async function getHeadOfficeCentreId(db: ReturnType<typeof getDb>): Promise<number> {
  const [row] = await db.select().from(settings).where(eq(settings.key, "referral_head_office_centre_id"));
  if (row?.value) return Number(row.value);
  const [ho] = await db.select().from(centers).where(eq(centers.centerCode, "UAN24-HO"));
  if (ho) return ho.id;
  const res = await db.insert(centers).values({ centerCode: "UAN24-HO", name: "Udaan24 - Head Office", password: "center123", status: "active" });
  return Number(res[0].insertId);
}
async function resolveResponsibleCentre(db: ReturnType<typeof getDb>, studentId: number): Promise<number> {
  const [stu] = await db.select().from(students).where(eq(students.id, studentId));
  return stu?.centerId ?? (await getHeadOfficeCentreId(db));
}

// Recompute the cached wallet row from the ledger + transactions (source of truth).
async function recomputeWallet(db: ReturnType<typeof getDb>, studentId: number) {
  const stmts = await db.select().from(walletStatements).where(eq(walletStatements.studentId, studentId));
  let credit = 0, debit = 0, earned = 0, withdrawn = 0;
  for (const s of stmts) {
    const cr = Number(s.creditAmount || 0), dr = Number(s.debitAmount || 0);
    credit += cr; debit += dr;
    if (s.transactionType === "commission_credit") earned += cr;
    if (s.transactionType === "payout_paid") withdrawn += dr;
  }
  const balance = credit - debit;
  const txns = await db.select().from(referralTransactions).where(eq(referralTransactions.referrerStudentId, studentId));
  let pending = 0, approved = 0;
  for (const t of txns) {
    const a = Number(t.commissionAmount || 0);
    if (t.status === "pending") pending += a;
    if (t.status === "approved") approved += a;
  }
  const centreId = await resolveResponsibleCentre(db, studentId);
  const row = {
    studentId, centreId,
    totalEarned: earned.toFixed(2), totalWithdrawn: withdrawn.toFixed(2),
    pendingAmount: pending.toFixed(2), approvedAmount: approved.toFixed(2),
    walletBalance: balance.toFixed(2), outstandingAmount: balance.toFixed(2),
  };
  const [ex] = await db.select().from(studentWallets).where(eq(studentWallets.studentId, studentId));
  if (ex) await db.update(studentWallets).set(row).where(eq(studentWallets.studentId, studentId));
  else await db.insert(studentWallets).values(row);
  return row;
}

// Append a ledger entry with a running balanceAfter, then refresh the wallet cache.
async function addStatement(db: ReturnType<typeof getDb>, studentId: number, type: typeof walletStatements.$inferInsert.transactionType, opts: { credit?: number; debit?: number; referenceId?: string; status?: string; paymentMode?: string; remarks?: string; centreId?: number }) {
  const [{ bal }] = await db.select({ bal: sql<string>`COALESCE(SUM(credit_amount),0) - COALESCE(SUM(debit_amount),0)` }).from(walletStatements).where(eq(walletStatements.studentId, studentId));
  const credit = opts.credit || 0, debit = opts.debit || 0;
  const balanceAfter = (Number(bal || 0) + credit - debit).toFixed(2);
  const centreId = opts.centreId ?? await resolveResponsibleCentre(db, studentId);
  await db.insert(walletStatements).values({
    studentId, centreId, transactionType: type,
    creditAmount: credit.toFixed(2), debitAmount: debit.toFixed(2), balanceAfter,
    referenceId: opts.referenceId, status: opts.status, paymentMode: opts.paymentMode, remarks: opts.remarks,
  });
  await recomputeWallet(db, studentId);
}

async function ensureReferralCode(db: ReturnType<typeof getDb>, student: { id: number; referralCode: string | null }) {
  if (student.referralCode) return student.referralCode;
  const code = genReferralCode(student.id);
  await db.update(students).set({ referralCode: code }).where(eq(students.id, student.id));
  return code;
}

export const referralRouter = createRouter({
  // ───────────── STUDENT ─────────────
  me: publicQuery.input(z.object({ studentId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const [student] = await db.select().from(students).where(eq(students.id, input.studentId));
    if (!student) return null;
    const code = await ensureReferralCode(db, student);
    const s = await getReferralSettings(db);
    return {
      referralCode: code,
      referralPath: `/r/${code}`,
      settings: { enabled: s.enabled, discountPercent: s.discountPercent, commissionPercent: s.commissionPercent, minPayout: s.minPayout, payoutModes: s.payoutModes, terms: s.terms },
    };
  }),

  overview: publicQuery.input(z.object({ studentId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const refs = await db.select().from(studentReferrals).where(eq(studentReferrals.referrerStudentId, input.studentId));
    const txns = await db.select().from(referralTransactions).where(eq(referralTransactions.referrerStudentId, input.studentId));
    const sum = (st: string) => txns.filter((t) => t.status === st).reduce((a, t) => a + Number(t.commissionAmount || 0), 0);
    const wallet = await recomputeWallet(db, input.studentId);
    return {
      totalReferrals: refs.length,
      successfulPurchases: refs.filter((r) => r.status === "purchased").length,
      pendingCommission: sum("pending").toFixed(2),
      approvedCommission: sum("approved").toFixed(2),
      paidCommission: sum("paid").toFixed(2),
      walletBalance: wallet.walletBalance,
    };
  }),

  referrals: publicQuery.input(z.object({ studentId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    return db.select({
      id: studentReferrals.id,
      referredName: students.name,
      referredPhone: students.phone,
      referredEmail: students.email,
      referralStatus: studentReferrals.status,
      date: studentReferrals.createdAt,
      courseId: referralTransactions.courseId,
      courseAmount: referralTransactions.courseAmount,
      discountAmount: referralTransactions.discountAmount,
      commissionAmount: referralTransactions.commissionAmount,
      commissionStatus: referralTransactions.status,
    }).from(studentReferrals)
      .innerJoin(students, eq(studentReferrals.referredStudentId, students.id))
      .leftJoin(referralTransactions, and(eq(referralTransactions.referredStudentId, studentReferrals.referredStudentId), eq(referralTransactions.referrerStudentId, input.studentId)))
      .where(eq(studentReferrals.referrerStudentId, input.studentId))
      .orderBy(desc(studentReferrals.createdAt));
  }),

  wallet: publicQuery.input(z.object({ studentId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const w = await recomputeWallet(db, input.studentId);
    const [{ pendingPayout }] = await db.select({ pendingPayout: sql<string>`COALESCE(SUM(amount),0)` }).from(payoutRequests).where(and(eq(payoutRequests.studentId, input.studentId), inArray(payoutRequests.status, ["requested", "processing"])));
    return { ...w, pendingPayout: Number(pendingPayout || 0).toFixed(2), available: (Number(w.walletBalance) - Number(pendingPayout || 0)).toFixed(2) };
  }),

  statements: publicQuery.input(z.object({ studentId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    return db.select().from(walletStatements).where(eq(walletStatements.studentId, input.studentId)).orderBy(desc(walletStatements.createdAt));
  }),

  payouts: publicQuery.input(z.object({ studentId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    return db.select().from(payoutRequests).where(eq(payoutRequests.studentId, input.studentId)).orderBy(desc(payoutRequests.createdAt));
  }),

  requestPayout: publicQuery
    .input(z.object({
      studentId: z.number(), amount: z.number().positive(),
      paymentMode: z.enum(["cash", "upi", "bank"]),
      upiId: z.string().optional(), accountHolderName: z.string().optional(),
      accountNumber: z.string().optional(), ifscCode: z.string().optional(), bankName: z.string().optional(),
      remarks: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const s = await getReferralSettings(db);
      if (!s.payoutModes.includes(input.paymentMode)) throw new TRPCError({ code: "BAD_REQUEST", message: "Payout mode not allowed" });
      if (input.amount < s.minPayout) throw new TRPCError({ code: "BAD_REQUEST", message: `Minimum payout is ₹${s.minPayout}` });
      const w = await recomputeWallet(db, input.studentId);
      const [{ pendingPayout }] = await db.select({ pendingPayout: sql<string>`COALESCE(SUM(amount),0)` }).from(payoutRequests).where(and(eq(payoutRequests.studentId, input.studentId), inArray(payoutRequests.status, ["requested", "processing"])));
      const available = Number(w.walletBalance) - Number(pendingPayout || 0);
      if (input.amount > available) throw new TRPCError({ code: "BAD_REQUEST", message: `Amount exceeds available balance (₹${available.toFixed(2)})` });
      if (input.paymentMode === "upi" && !input.upiId) throw new TRPCError({ code: "BAD_REQUEST", message: "UPI ID required" });
      if (input.paymentMode === "bank" && (!input.accountNumber || !input.ifscCode)) throw new TRPCError({ code: "BAD_REQUEST", message: "Bank account number and IFSC required" });
      // Route the request to the centre responsible for this student.
      const centreId = await resolveResponsibleCentre(db, input.studentId);
      const res = await db.insert(payoutRequests).values({
        studentId: input.studentId, centreId, amount: input.amount.toFixed(2), paymentMode: input.paymentMode,
        upiId: input.upiId, accountHolderName: input.accountHolderName, accountNumber: input.accountNumber,
        ifscCode: input.ifscCode, bankName: input.bankName, adminRemarks: input.remarks, status: "requested",
      });
      await addStatement(db, input.studentId, "payout_request", { referenceId: `PR-${res[0].insertId}`, status: "requested", paymentMode: input.paymentMode, centreId, remarks: `Payout requested: ₹${input.amount.toFixed(2)}` });
      return { success: true, id: Number(res[0].insertId) };
    }),

  // ───────────── PURCHASE HOOKS (used by checkout placeholder + admin + future gateway) ─────────────
  checkoutPreview: publicQuery
    .input(z.object({ referredStudentId: z.number(), courseId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const s = await getReferralSettings(db);
      const [course] = await db.select().from(courses).where(eq(courses.id, input.courseId));
      if (!course) return null;
      const amount = Number(course.fee || 0);
      const [map] = await db.select().from(studentReferrals).where(eq(studentReferrals.referredStudentId, input.referredStudentId));
      const [already] = await db.select().from(referralTransactions).where(and(eq(referralTransactions.referredStudentId, input.referredStudentId), eq(referralTransactions.courseId, input.courseId)));
      const hasReferral = s.enabled && !!map && !already;
      const discountAmount = hasReferral ? +(amount * s.discountPercent / 100).toFixed(2) : 0;
      return {
        courseName: course.name, courseAmount: amount.toFixed(2),
        hasReferral, discountPercent: hasReferral ? s.discountPercent : 0,
        discountAmount: discountAmount.toFixed(2), finalPayable: (amount - discountAmount).toFixed(2),
      };
    }),

  recordPurchase: publicQuery
    .input(z.object({ referredStudentId: z.number(), courseId: z.number(), amount: z.number().optional(), paymentRef: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const s = await getReferralSettings(db);
      const [course] = await db.select().from(courses).where(eq(courses.id, input.courseId));
      const courseAmount = input.amount ?? Number(course?.fee || 0);
      const [map] = await db.select().from(studentReferrals).where(eq(studentReferrals.referredStudentId, input.referredStudentId));
      if (!s.enabled || !map) return { referral: false, courseAmount: courseAmount.toFixed(2), discountAmount: "0.00", finalPayable: courseAmount.toFixed(2) };
      // discount/commission apply once per referred student + course
      const [already] = await db.select().from(referralTransactions).where(and(eq(referralTransactions.referredStudentId, input.referredStudentId), eq(referralTransactions.courseId, input.courseId)));
      if (already) {
        return { referral: true, duplicate: true, courseAmount: already.courseAmount, discountAmount: already.discountAmount!, finalPayable: (Number(already.courseAmount) - Number(already.discountAmount)).toFixed(2), commissionAmount: already.commissionAmount!, status: already.status };
      }
      const discountAmount = +(courseAmount * s.discountPercent / 100).toFixed(2);
      const commissionAmount = +(courseAmount * s.commissionPercent / 100).toFixed(2);
      const status = s.approvalType === "auto" ? "approved" : "pending";
      // The centre responsible for paying this commission = referrer's centre, else Head Office.
      const responsibleCentreId = await resolveResponsibleCentre(db, map.referrerStudentId);
      const res = await db.insert(referralTransactions).values({
        referrerStudentId: map.referrerStudentId, referredStudentId: input.referredStudentId, courseId: input.courseId,
        responsibleCentreId, paymentRef: input.paymentRef, courseAmount: courseAmount.toFixed(2),
        discountPercentage: s.discountPercent.toFixed(2), discountAmount: discountAmount.toFixed(2),
        commissionPercentage: s.commissionPercent.toFixed(2), commissionAmount: commissionAmount.toFixed(2), status,
      });
      await db.update(studentReferrals).set({ status: "purchased", responsibleCentreId }).where(eq(studentReferrals.id, map.id));
      if (status === "approved") {
        await addStatement(db, map.referrerStudentId, "commission_credit", { credit: commissionAmount, referenceId: `RT-${res[0].insertId}`, status: "approved", centreId: responsibleCentreId, remarks: `Commission for referred purchase (course #${input.courseId})` });
      } else {
        await recomputeWallet(db, map.referrerStudentId);
      }
      return { referral: true, responsibleCentreId, courseAmount: courseAmount.toFixed(2), discountAmount: discountAmount.toFixed(2), finalPayable: (courseAmount - discountAmount).toFixed(2), commissionAmount: commissionAmount.toFixed(2), status };
    }),

  // ───────────── ADMIN ─────────────
  adminOverview: adminQuery.query(async () => {
    const db = getDb();
    const [refs] = await db.select({ c: sql<number>`count(*)` }).from(studentReferrals);
    const txns = await db.select().from(referralTransactions);
    const sum = (st: string) => txns.filter((t) => t.status === st).reduce((a, t) => a + Number(t.commissionAmount || 0), 0);
    const [wal] = await db.select({ bal: sql<string>`COALESCE(SUM(wallet_balance),0)` }).from(studentWallets);
    const [pp] = await db.select({ c: sql<number>`count(*)` }).from(payoutRequests).where(inArray(payoutRequests.status, ["requested", "processing"]));
    return {
      totalReferrals: refs?.c || 0,
      totalCommission: txns.reduce((a, t) => a + Number(t.commissionAmount || 0), 0).toFixed(2),
      pendingCommission: sum("pending").toFixed(2), approvedCommission: sum("approved").toFixed(2), paidCommission: sum("paid").toFixed(2),
      totalWalletBalance: Number(wal?.bal || 0).toFixed(2), pendingPayouts: pp?.c || 0,
    };
  }),

  // Super Admin: VIEW ONLY (no pay/approve actions). Includes responsible centre + filters.
  adminTransactions: adminQuery
    .input(z.object({ status: z.string().optional(), courseId: z.number().optional(), centreId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db.select({
        id: referralTransactions.id,
        referrerId: referralTransactions.referrerStudentId,
        referrerName: students.name, referrerCode: students.referralCode,
        referredId: referralTransactions.referredStudentId,
        responsibleCentreId: referralTransactions.responsibleCentreId,
        responsibleCentreName: centers.name, responsibleCentreCode: centers.centerCode,
        courseId: referralTransactions.courseId,
        courseAmount: referralTransactions.courseAmount,
        discountAmount: referralTransactions.discountAmount,
        commissionAmount: referralTransactions.commissionAmount,
        status: referralTransactions.status, paymentRef: referralTransactions.paymentRef,
        date: referralTransactions.createdAt,
      }).from(referralTransactions)
        .leftJoin(students, eq(referralTransactions.referrerStudentId, students.id))
        .leftJoin(centers, eq(referralTransactions.responsibleCentreId, centers.id))
        .where(and(
          input?.status ? eq(referralTransactions.status, input.status as any) : undefined,
          input?.courseId ? eq(referralTransactions.courseId, input.courseId) : undefined,
          input?.centreId ? eq(referralTransactions.responsibleCentreId, input.centreId) : undefined,
        ))
        .orderBy(desc(referralTransactions.createdAt));
      return rows;
    }),

  adminWallets: adminQuery.query(async () => {
    const db = getDb();
    return db.select({
      studentId: studentWallets.studentId, studentName: students.name, rollNumber: students.rollNumber,
      centreId: studentWallets.centreId, centreName: centers.name,
      walletBalance: studentWallets.walletBalance, totalEarned: studentWallets.totalEarned,
      totalWithdrawn: studentWallets.totalWithdrawn, pendingAmount: studentWallets.pendingAmount,
      outstandingAmount: studentWallets.outstandingAmount,
    }).from(studentWallets).innerJoin(students, eq(studentWallets.studentId, students.id))
      .leftJoin(centers, eq(studentWallets.centreId, centers.id))
      .orderBy(desc(studentWallets.walletBalance));
  }),

  adminPayouts: adminQuery
    .input(z.object({ status: z.string().optional(), paymentMode: z.string().optional(), centreId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      return db.select({
        id: payoutRequests.id, studentId: payoutRequests.studentId, studentName: students.name, rollNumber: students.rollNumber,
        centreId: payoutRequests.centreId, centreName: centers.name,
        amount: payoutRequests.amount, paymentMode: payoutRequests.paymentMode, upiId: payoutRequests.upiId,
        accountHolderName: payoutRequests.accountHolderName, accountNumber: payoutRequests.accountNumber,
        ifscCode: payoutRequests.ifscCode, bankName: payoutRequests.bankName, status: payoutRequests.status,
        paymentReference: payoutRequests.paymentReference, centreRemarks: payoutRequests.centreRemarks, date: payoutRequests.createdAt,
      }).from(payoutRequests).innerJoin(students, eq(payoutRequests.studentId, students.id))
        .leftJoin(centers, eq(payoutRequests.centreId, centers.id))
        .where(and(
          input?.status ? eq(payoutRequests.status, input.status as any) : undefined,
          input?.paymentMode ? eq(payoutRequests.paymentMode, input.paymentMode as any) : undefined,
          input?.centreId ? eq(payoutRequests.centreId, input.centreId) : undefined,
        ))
        .orderBy(desc(payoutRequests.createdAt));
    }),

  // ───────────── STUDY CENTRE (scoped to its OWN students via responsible centre) ─────────────
  centerOverview: publicQuery.input(z.object({ centreId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const txns = await db.select().from(referralTransactions).where(eq(referralTransactions.responsibleCentreId, input.centreId));
    const sum = (st: string) => txns.filter((t) => t.status === st).reduce((a, t) => a + Number(t.commissionAmount || 0), 0);
    const [pp] = await db.select({ c: sql<number>`count(*)` }).from(payoutRequests).where(and(eq(payoutRequests.centreId, input.centreId), inArray(payoutRequests.status, ["requested", "processing"])));
    const [wb] = await db.select({ b: sql<string>`COALESCE(SUM(wallet_balance),0)` }).from(studentWallets).where(eq(studentWallets.centreId, input.centreId));
    return {
      totalCommission: txns.reduce((a, t) => a + Number(t.commissionAmount || 0), 0).toFixed(2),
      pendingCommission: sum("pending").toFixed(2), approvedCommission: sum("approved").toFixed(2), paidCommission: sum("paid").toFixed(2),
      outstanding: Number(wb?.b || 0).toFixed(2), pendingPayouts: pp?.c || 0,
    };
  }),

  centerCommissions: publicQuery.input(z.object({ centreId: z.number(), status: z.string().optional() })).query(async ({ input }) => {
    const db = getDb();
    return db.select({
      id: referralTransactions.id, referrerName: students.name, referrerCode: students.referralCode,
      courseId: referralTransactions.courseId, courseAmount: referralTransactions.courseAmount,
      discountAmount: referralTransactions.discountAmount, commissionAmount: referralTransactions.commissionAmount,
      status: referralTransactions.status, date: referralTransactions.createdAt,
    }).from(referralTransactions)
      .leftJoin(students, eq(referralTransactions.referrerStudentId, students.id))
      .where(and(eq(referralTransactions.responsibleCentreId, input.centreId), input.status ? eq(referralTransactions.status, input.status as any) : undefined))
      .orderBy(desc(referralTransactions.createdAt));
  }),

  centerSetCommissionStatus: publicQuery
    .input(z.object({ centreId: z.number(), id: z.number(), status: z.enum(["pending", "approved", "paid", "cancelled"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [t] = await db.select().from(referralTransactions).where(eq(referralTransactions.id, input.id));
      if (!t || t.responsibleCentreId !== input.centreId) throw new TRPCError({ code: "FORBIDDEN", message: "Not your centre's commission" });
      const wasCredited = t.status === "approved" || t.status === "paid";
      const willCredit = input.status === "approved" || input.status === "paid";
      await db.update(referralTransactions).set({ status: input.status }).where(eq(referralTransactions.id, input.id));
      const amt = Number(t.commissionAmount || 0);
      if (!wasCredited && willCredit) await addStatement(db, t.referrerStudentId, "commission_credit", { credit: amt, referenceId: `RT-${t.id}`, status: input.status, centreId: input.centreId, remarks: `Commission ${input.status} (course #${t.courseId})` });
      else if (wasCredited && input.status === "cancelled") await addStatement(db, t.referrerStudentId, "cancelled", { debit: amt, referenceId: `RT-${t.id}`, status: "cancelled", centreId: input.centreId, remarks: `Commission reversed (course #${t.courseId})` });
      else await recomputeWallet(db, t.referrerStudentId);
      return { success: true };
    }),

  centerWallets: publicQuery.input(z.object({ centreId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    return db.select({
      studentId: studentWallets.studentId, studentName: students.name, rollNumber: students.rollNumber,
      walletBalance: studentWallets.walletBalance, totalEarned: studentWallets.totalEarned,
      totalWithdrawn: studentWallets.totalWithdrawn, pendingAmount: studentWallets.pendingAmount,
      outstandingAmount: studentWallets.outstandingAmount,
    }).from(studentWallets).innerJoin(students, eq(studentWallets.studentId, students.id))
      .where(eq(studentWallets.centreId, input.centreId)).orderBy(desc(studentWallets.walletBalance));
  }),

  centerPayouts: publicQuery
    .input(z.object({ centreId: z.number(), status: z.string().optional(), paymentMode: z.string().optional() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select({
        id: payoutRequests.id, studentId: payoutRequests.studentId, studentName: students.name, rollNumber: students.rollNumber,
        amount: payoutRequests.amount, paymentMode: payoutRequests.paymentMode, upiId: payoutRequests.upiId,
        accountHolderName: payoutRequests.accountHolderName, accountNumber: payoutRequests.accountNumber,
        ifscCode: payoutRequests.ifscCode, bankName: payoutRequests.bankName, status: payoutRequests.status,
        paymentReference: payoutRequests.paymentReference, centreRemarks: payoutRequests.centreRemarks, date: payoutRequests.createdAt,
      }).from(payoutRequests).innerJoin(students, eq(payoutRequests.studentId, students.id))
        .where(and(
          eq(payoutRequests.centreId, input.centreId),
          input.status ? eq(payoutRequests.status, input.status as any) : undefined,
          input.paymentMode ? eq(payoutRequests.paymentMode, input.paymentMode as any) : undefined,
        ))
        .orderBy(desc(payoutRequests.createdAt));
    }),

  // Centre pays a payout for one of ITS students (ownership enforced).
  centerPayPayout: publicQuery
    .input(z.object({ centreId: z.number(), id: z.number(), paymentReference: z.string().optional(), centreRemarks: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [p] = await db.select().from(payoutRequests).where(eq(payoutRequests.id, input.id));
      if (!p || p.centreId !== input.centreId) throw new TRPCError({ code: "FORBIDDEN", message: "Not your centre's payout request" });
      if (p.status === "paid") throw new TRPCError({ code: "BAD_REQUEST", message: "Already paid" });
      await db.update(payoutRequests).set({ status: "paid", paymentReference: input.paymentReference, centreRemarks: input.centreRemarks, paidByCentreUserId: input.centreId, paidAt: new Date() }).where(eq(payoutRequests.id, input.id));
      await addStatement(db, p.studentId, "payout_paid", { debit: Number(p.amount), referenceId: input.paymentReference || `PR-${p.id}`, status: "paid", paymentMode: p.paymentMode, centreId: input.centreId, remarks: `Payout paid by centre via ${p.paymentMode}${input.paymentReference ? ` · ref ${input.paymentReference}` : ""}` });
      return { success: true };
    }),

  centerRejectPayout: publicQuery
    .input(z.object({ centreId: z.number(), id: z.number(), centreRemarks: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [p] = await db.select().from(payoutRequests).where(eq(payoutRequests.id, input.id));
      if (!p || p.centreId !== input.centreId) throw new TRPCError({ code: "FORBIDDEN", message: "Not your centre's payout request" });
      await db.update(payoutRequests).set({ status: "rejected", centreRemarks: input.centreRemarks }).where(eq(payoutRequests.id, input.id));
      return { success: true };
    }),

  centerStatements: publicQuery.input(z.object({ centreId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    return db.select({
      id: walletStatements.id, studentId: walletStatements.studentId, studentName: students.name,
      transactionType: walletStatements.transactionType, referenceId: walletStatements.referenceId,
      creditAmount: walletStatements.creditAmount, debitAmount: walletStatements.debitAmount,
      balanceAfter: walletStatements.balanceAfter, status: walletStatements.status,
      paymentMode: walletStatements.paymentMode, remarks: walletStatements.remarks, date: walletStatements.createdAt,
    }).from(walletStatements).innerJoin(students, eq(walletStatements.studentId, students.id))
      .where(eq(walletStatements.centreId, input.centreId)).orderBy(desc(walletStatements.createdAt));
  }),

  adminStatements: adminQuery.input(z.object({ studentId: z.number().optional() }).optional()).query(async ({ input }) => {
    const db = getDb();
    return db.select({
      id: walletStatements.id, studentId: walletStatements.studentId, studentName: students.name,
      transactionType: walletStatements.transactionType, referenceId: walletStatements.referenceId,
      creditAmount: walletStatements.creditAmount, debitAmount: walletStatements.debitAmount,
      balanceAfter: walletStatements.balanceAfter, status: walletStatements.status,
      paymentMode: walletStatements.paymentMode, remarks: walletStatements.remarks, date: walletStatements.createdAt,
    }).from(walletStatements).innerJoin(students, eq(walletStatements.studentId, students.id))
      .where(input?.studentId ? eq(walletStatements.studentId, input.studentId) : undefined)
      .orderBy(desc(walletStatements.createdAt));
  }),

  // ─── Referral program settings (super admin) ───
  settingsGet: adminQuery.query(async () => {
    const db = getDb();
    return getReferralSettings(db);
  }),

  settingsSet: superAdminQuery
    .input(z.object({
      enabled: z.boolean().optional(), discountPercent: z.number().optional(), commissionPercent: z.number().optional(),
      approvalType: z.enum(["auto", "manual"]).optional(), minPayout: z.number().optional(),
      payoutModes: z.array(z.string()).optional(), cookieDays: z.number().optional(), terms: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const map: Record<string, string> = {};
      if (input.enabled !== undefined) map.referral_enabled = String(input.enabled);
      if (input.discountPercent !== undefined) map.referral_discount_percent = String(input.discountPercent);
      if (input.commissionPercent !== undefined) map.referral_commission_percent = String(input.commissionPercent);
      if (input.approvalType !== undefined) map.referral_approval_type = input.approvalType;
      if (input.minPayout !== undefined) map.referral_min_payout = String(input.minPayout);
      if (input.payoutModes !== undefined) map.referral_payout_modes = input.payoutModes.join(",");
      if (input.cookieDays !== undefined) map.referral_cookie_days = String(input.cookieDays);
      if (input.terms !== undefined) map.referral_terms = input.terms;
      for (const [k, v] of Object.entries(map)) {
        await db.insert(settings).values({ key: k, value: v, group: "referral" }).onDuplicateKeyUpdate({ set: { value: v } });
      }
      return { success: true };
    }),
});

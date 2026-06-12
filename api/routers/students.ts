import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, adminQuery, superAdminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { students, courses, centers, attendance, results, feePayments, certificates, notifications, studentReferrals, studentSiblings, admissionFormLinks } from "@db/schema";
import { eq, like, and, or, inArray, desc, sql } from "drizzle-orm";

// ─── Credential generators (official students created/approved by Super Admin) ───
const genRollNumber = () => `UAN24${Date.now().toString(36).toUpperCase()}`;
const genTempPassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let p = "";
  for (let i = 0; i < 8; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p;
};
// Unique username: first-name slug + roll suffix; falls back to roll on collision.
async function makeUsername(db: any, name: string, roll: string) {
  const base = (name || "student").toLowerCase().split(/\s+/)[0].replace(/[^a-z0-9]/g, "") || "student";
  let candidate = `${base}${roll.slice(-4).toLowerCase()}`;
  const [exists] = await db.select({ id: students.id }).from(students).where(eq(students.username, candidate));
  if (exists) candidate = `${base}${roll.slice(-6).toLowerCase()}`;
  return candidate;
}

export const studentRouter = createRouter({
  list: adminQuery
    .input(z.object({
      search: z.string().optional(),
      courseId: z.number().optional(),
      centerId: z.number().optional(),
      status: z.string().optional(),
      feeStatus: z.string().optional(),
      admissionStatus: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(50),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.search) {
        const term = `%${input.search}%`;
        // Search across name, roll number, mobile, email, and centre code.
        conditions.push(or(
          like(students.name, term),
          like(students.rollNumber, term),
          like(students.phone, term),
          like(students.email, term),
          inArray(students.centerId, db.select({ id: centers.id }).from(centers).where(like(centers.centerCode, term))),
        ));
      }
      if (input?.courseId) conditions.push(eq(students.courseId, input.courseId));
      if (input?.centerId) conditions.push(eq(students.centerId, input.centerId));
      if (input?.status) conditions.push(eq(students.status, input.status as any));
      if (input?.feeStatus) conditions.push(eq(students.feeStatus, input.feeStatus as any));
      if (input?.admissionStatus) conditions.push(eq(students.admissionStatus, input.admissionStatus as any));

      const where = conditions.length > 0 ? and(...conditions) : undefined;
      const list = await db.select().from(students).where(where).orderBy(desc(students.createdAt))
        .limit(input?.limit || 50).offset(((input?.page || 1) - 1) * (input?.limit || 50));
      const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(students).where(where);

      return { list, total: countResult?.count || 0, pages: Math.ceil((countResult?.count || 0) / (input?.limit || 50)) };
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [student] = await db.select().from(students).where(eq(students.id, input.id));
      return student || null;
    }),

  byRollNumber: publicQuery
    .input(z.object({ rollNumber: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [student] = await db.select().from(students).where(eq(students.rollNumber, input.rollNumber));
      return student || null;
    }),

  // ─── Public self-registration = APPLICATION ONLY ───
  // Self-registered users are created as INACTIVE applicants (pending Super Admin
  // approval). They cannot log in or become official students until a Super Admin
  // approves them and generates credentials. This enforces "no auto-active students".
  register: publicQuery
    .input(z.object({
      name: z.string().min(1), phone: z.string().optional(), email: z.string().optional(),
      password: z.string().min(4).optional(), courseId: z.number().optional(),
      referralCode: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const rollNumber = genRollNumber();
      const genRef = () => "UDN" + Date.now().toString(36).toUpperCase() + "ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.floor(Math.random() * 24)];
      // resolve referrer (must exist and not be a self-reference)
      let referredBy: number | undefined;
      if (input.referralCode) {
        const [ref] = await db.select().from(students).where(eq(students.referralCode, input.referralCode.trim()));
        if (ref) referredBy = ref.id;
      }
      const res = await db.insert(students).values({
        name: input.name, phone: input.phone, email: input.email,
        password: input.password || "student123", rollNumber, courseId: input.courseId,
        referralCode: genRef(), referredBy,
        status: "inactive", feeStatus: "pending",
        admissionStatus: "pending", createdByAdmin: false,
      });
      const newId = Number(res[0].insertId);
      // create the referral mapping (one per referred student; never self)
      if (referredBy && referredBy !== newId) {
        const [exists] = await db.select().from(studentReferrals).where(eq(studentReferrals.referredStudentId, newId));
        if (!exists) {
          await db.insert(studentReferrals).values({
            referrerStudentId: referredBy, referredStudentId: newId,
            referralCode: input.referralCode!.trim(), status: "registered",
          });
        }
      }
      return { success: true, id: newId, rollNumber, referred: !!referredBy, pendingApproval: true };
    }),

  // ─── Student login (Student ID / roll number OR username + password) ───
  login: publicQuery
    .input(z.object({ rollNumber: z.string().min(1), password: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const id = input.rollNumber.trim();
      // Accept either the Student ID (roll number) or the generated username.
      const [student] = await db.select().from(students)
        .where(or(eq(students.rollNumber, id), eq(students.username, id)));
      if (!student || student.password !== input.password) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid Student ID / username or password" });
      }
      if (student.status === "inactive" || student.status === "dropped") {
        throw new TRPCError({ code: "FORBIDDEN", message: "This account is not active yet. Your application is awaiting approval — please contact your study centre or Udaan24." });
      }
      return { id: student.id, name: student.name, rollNumber: student.rollNumber };
    }),

  // ─── Students affiliated to a centre (for the centre dashboard) ───
  byCenter: publicQuery
    .input(z.object({ centerId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(students).where(eq(students.centerId, input.centerId)).orderBy(desc(students.createdAt));
    }),

  // ─── Centre adds a student directly (active) with optional payment details ───
  createByCenter: publicQuery
    .input(z.object({
      centerId: z.number(),
      name: z.string().min(1),
      phone: z.string().optional(), email: z.string().optional(), courseId: z.number().optional(),
      gender: z.enum(["male", "female", "other"]).optional(),
      category: z.enum(["general", "sc_st", "bc_obc"]).optional(),
      photo: z.string().optional(),
      fatherName: z.string().optional(), motherName: z.string().optional(),
      dob: z.string().optional(), address: z.string().optional(), aadharNumber: z.string().optional(),
      feeStatus: z.enum(["paid", "pending", "partial"]).optional(),
      paymentMode: z.enum(["online", "offline_cash", "offline_upi", "offline_bank"]).optional(),
      paymentReceivedDate: z.string().optional(), paymentReference: z.string().optional(), paymentRemarks: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const rollNumber = `UAN24${Date.now().toString(36).toUpperCase()}`;
      const result = await db.insert(students).values({
        ...input, rollNumber, password: "student123",
        status: "active", feeStatus: input.feeStatus || "pending",
      });
      return { success: true, id: Number(result[0].insertId), rollNumber };
    }),

  // ─── Centre edits / marks payment for one of ITS OWN students (ownership enforced) ───
  updateByCenter: publicQuery
    .input(z.object({
      centerId: z.number(), id: z.number(),
      name: z.string().min(1).optional(), phone: z.string().optional(),
      email: z.string().optional(), courseId: z.number().optional(), photo: z.string().optional(),
      feeStatus: z.enum(["paid", "pending", "partial"]).optional(),
      paymentMode: z.enum(["online", "offline_cash", "offline_upi", "offline_bank"]).optional(),
      paymentReceivedDate: z.string().optional(), paymentReference: z.string().optional(), paymentRemarks: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [s] = await db.select().from(students).where(eq(students.id, input.id));
      if (!s || s.centerId !== input.centerId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "This student does not belong to your centre" });
      }
      const { centerId, id, ...data } = input;
      await db.update(students).set(data).where(eq(students.id, id));
      return { success: true };
    }),

  // ═══════ ADMISSION 3-STEP FORM ═══════
  admissionGet: publicQuery.input(z.object({ studentId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const [student] = await db.select().from(students).where(eq(students.id, input.studentId));
    if (!student) return null;
    const siblings = await db.select().from(studentSiblings).where(eq(studentSiblings.studentId, input.studentId));
    const [course] = student.courseId ? await db.select().from(courses).where(eq(courses.id, student.courseId)) : [null];
    const [center] = student.centerId ? await db.select().from(centers).where(eq(centers.id, student.centerId)) : [null];
    return {
      student, siblings,
      course: course ? { id: course.id, name: course.name, duration: course.duration } : null,
      centre: center ? { id: center.id, name: center.name, city: center.city } : null,
    };
  }),

  saveAdmissionStep: publicQuery
    .input(z.object({
      studentId: z.number(), step: z.number().min(1).max(3),
      // step 1
      photo: z.string().optional(), name: z.string().optional(),
      gender: z.enum(["male", "female", "other"]).optional(), category: z.enum(["general", "sc_st", "bc_obc"]).optional(),
      fatherName: z.string().optional(), motherName: z.string().optional(), dob: z.string().optional(),
      phone: z.string().optional(), email: z.string().optional(), address: z.string().optional(),
      // step 2
      siblings: z.array(z.object({ name: z.string().optional(), relation: z.string().optional(), age: z.number().optional(), qualification: z.string().optional() })).optional(),
      // step 3
      courseId: z.number().optional(), aadharNumber: z.string().optional(), centerId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { studentId, step, siblings, ...fields } = input;
      // persist provided student fields
      const data: Record<string, any> = {};
      for (const [k, v] of Object.entries(fields)) if (v !== undefined) data[k] = v;
      data.admissionStep = step;
      data.admissionStatus = "in_progress";
      await db.update(students).set(data).where(eq(students.id, studentId));
      if (step === 2 && siblings) {
        await db.delete(studentSiblings).where(eq(studentSiblings.studentId, studentId));
        for (const s of siblings) {
          if (s.name) await db.insert(studentSiblings).values({ studentId, siblingName: s.name, siblingRelation: s.relation, siblingAge: s.age, siblingQualification: s.qualification });
        }
      }
      return { success: true };
    }),

  // Online payment hook (placeholder for Razorpay). A real gateway calls this on
  // payment.success with the real razorpayPaymentId; logic is otherwise identical.
  payOnline: publicQuery
    .input(z.object({ studentId: z.number(), courseId: z.number(), amount: z.string().optional(), razorpayPaymentId: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const rzpId = input.razorpayPaymentId || `rzp_test_${Date.now().toString(36).toUpperCase()}`;
      const today = new Date().toISOString().slice(0, 10);
      await db.update(students).set({
        courseId: input.courseId, feeStatus: "paid", paymentMode: "online",
        razorpayPaymentId: rzpId, paymentReceivedDate: today,
        admissionStatus: "in_progress",
      }).where(eq(students.id, input.studentId));
      // Write a receipt row so the payment appears in the student's payment history.
      const receiptNumber = `RCPT${Date.now().toString(36).toUpperCase()}`;
      const [course] = await db.select().from(courses).where(eq(courses.id, input.courseId));
      const amount = input.amount || (course?.onlineFee ?? course?.fee ?? "0");
      await db.insert(feePayments).values({
        studentId: input.studentId, courseId: input.courseId, amount: String(amount),
        paymentMethod: "net_banking", transactionId: rzpId, receiptNumber, status: "success",
      });
      return { success: true, razorpayPaymentId: rzpId, receiptNumber };
    }),

  submitAdmission: publicQuery.input(z.object({ studentId: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(students).set({ admissionStatus: "completed", admissionStep: 3, profileCompleted: true, status: "active" }).where(eq(students.id, input.studentId));
    return { success: true };
  }),

  // Centre generates a shareable admission-form link (creates a pending student to fill).
  createAdmissionLink: publicQuery
    .input(z.object({ centerId: z.number(), name: z.string().min(1), phone: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const rollNumber = `UAN24${Date.now().toString(36).toUpperCase()}`;
      const res = await db.insert(students).values({ name: input.name, phone: input.phone, centerId: input.centerId, rollNumber, password: "student123", status: "inactive", feeStatus: "pending", admissionStatus: "pending" });
      const studentId = Number(res[0].insertId);
      const token = `ADM${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
      await db.insert(admissionFormLinks).values({ studentId, centreId: input.centerId, token, status: "active" });
      return { success: true, token, studentId };
    }),

  // Public: resolve an admission link token to the student it fills.
  admissionByToken: publicQuery.input(z.object({ token: z.string() })).query(async ({ input }) => {
    const db = getDb();
    const [link] = await db.select().from(admissionFormLinks).where(eq(admissionFormLinks.token, input.token));
    if (!link || link.status !== "active") return null;
    const [center] = link.centreId ? await db.select().from(centers).where(eq(centers.id, link.centreId)) : [null];
    return { studentId: link.studentId, centreId: link.centreId, centreName: center?.name, centreCity: center?.city };
  }),

  // Admin: full student detail (admission + siblings + course/centre names).
  detail: adminQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const [student] = await db.select().from(students).where(eq(students.id, input.id));
    if (!student) return null;
    const siblings = await db.select().from(studentSiblings).where(eq(studentSiblings.studentId, input.id));
    const [course] = student.courseId ? await db.select().from(courses).where(eq(courses.id, student.courseId)) : [null];
    const [center] = student.centerId ? await db.select().from(centers).where(eq(centers.id, student.centerId)) : [null];
    return { student, siblings, courseName: course?.name, courseDuration: course?.duration, centreName: center?.name, centreCity: center?.city };
  }),

  // ─── Super Admin: officially create a student (generates ID + username + temp password) ───
  create: superAdminQuery
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      rollNumber: z.string().optional(),
      courseId: z.number().optional(),
      centerId: z.number().optional(),
      fatherName: z.string().optional(),
      motherName: z.string().optional(),
      dob: z.string().optional(),
      gender: z.enum(["male", "female", "other"]).optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
      qualification: z.string().optional(),
      photo: z.string().optional(),
      category: z.enum(["general", "sc_st", "bc_obc"]).optional(),
      aadharNumber: z.string().optional(),
      admissionDate: z.string().optional(),
      feeStatus: z.enum(["paid", "pending", "partial"]).optional(),
      paymentMode: z.enum(["online", "offline_cash", "offline_upi", "offline_bank"]).optional(),
      status: z.enum(["active", "inactive", "completed", "dropped"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const rollNumber = input.rollNumber || genRollNumber();
      const username = await makeUsername(db, input.name, rollNumber);
      const password = genTempPassword();
      const result = await db.insert(students).values({
        ...input, rollNumber, username, password,
        status: input.status || "active", createdByAdmin: true,
        admissionDate: input.admissionDate || new Date().toISOString().slice(0, 10),
      });
      return { success: true, id: Number(result[0].insertId), rollNumber, username, password };
    }),

  // ─── Super Admin: approve an applicant / (re)generate login credentials ───
  approveActivate: superAdminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [s] = await db.select().from(students).where(eq(students.id, input.id));
      if (!s) throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });
      const username = s.username || await makeUsername(db, s.name, s.rollNumber);
      const password = genTempPassword();
      await db.update(students).set({ status: "active", username, password, createdByAdmin: true }).where(eq(students.id, input.id));
      return { success: true, rollNumber: s.rollNumber, username, password };
    }),

  // ─── Super Admin: reset a student's password (returns the new temp password) ───
  resetPassword: superAdminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [s] = await db.select().from(students).where(eq(students.id, input.id));
      if (!s) throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });
      const username = s.username || await makeUsername(db, s.name, s.rollNumber);
      const password = genTempPassword();
      await db.update(students).set({ password, username }).where(eq(students.id, input.id));
      return { success: true, rollNumber: s.rollNumber, username, password };
    }),

  update: adminQuery
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      courseId: z.number().optional(),
      centerId: z.number().optional(),
      status: z.enum(["active", "inactive", "completed", "dropped"]).optional(),
      feeStatus: z.enum(["paid", "pending", "partial"]).optional(),
      paymentMode: z.enum(["online", "offline_cash", "offline_upi", "offline_bank"]).optional(),
      certificateIssued: z.boolean().optional(),
      photo: z.string().optional(),
      category: z.enum(["general", "sc_st", "bc_obc"]).optional(),
      aadharNumber: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(students).set(data).where(eq(students.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(students).where(eq(students.id, input.id));
      return { success: true };
    }),

  dashboard: publicQuery
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [student] = await db.select().from(students).where(eq(students.id, input.studentId));
      if (!student) return null;
      const [course] = student.courseId ? await db.select().from(courses).where(eq(courses.id, student.courseId)) : [null];
      const [center] = student.centerId ? await db.select().from(centers).where(eq(centers.id, student.centerId)) : [null];
      const attendanceRecords = await db.select().from(attendance).where(eq(attendance.studentId, input.studentId));
      const resultsRecords = await db.select().from(results).where(eq(results.studentId, input.studentId));
      const feeRecords = await db.select().from(feePayments).where(eq(feePayments.studentId, input.studentId));
      const certRecords = await db.select().from(certificates).where(eq(certificates.studentId, input.studentId));
      const noticeRecords = await db.select().from(notifications).where(eq(notifications.studentId, input.studentId)).orderBy(desc(notifications.createdAt));
      const totalDays = attendanceRecords.length;
      const presentDays = attendanceRecords.filter(a => a.status === "present").length;
      return {
        student,
        course: course || null,
        center: center || null,
        attendance: { totalDays, presentDays, percentage: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0 },
        results: resultsRecords,
        payments: feeRecords,
        certificates: certRecords,
        notifications: noticeRecords,
      };
    }),
});

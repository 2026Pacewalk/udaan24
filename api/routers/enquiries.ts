import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, adminQuery, superAdminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { enquiries, centers, users, students, studentSiblings } from "@db/schema";
import { eq, like, or, and, desc, sql, gte, lte, isNull, isNotNull } from "drizzle-orm";

const LEAD_STATUS = ["new", "contacted", "follow_up", "converted", "not_interested", "closed"] as const;

export const enquiryRouter = createRouter({
  // ─── Admin/Super Admin: list leads with filters (Lead Management) ───
  list: adminQuery
    .input(z.object({
      status: z.string().optional(), type: z.string().optional(), source: z.string().optional(),
      courseInterest: z.string().optional(), selectedCentreId: z.number().optional(),
      converted: z.enum(["yes", "no"]).optional(),
      search: z.string().optional(), from: z.string().optional(), to: z.string().optional(),
      page: z.number().default(1), limit: z.number().default(50),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.status) conditions.push(eq(enquiries.status, input.status as any));
      if (input?.type) conditions.push(eq(enquiries.type, input.type as any));
      if (input?.source) conditions.push(eq(enquiries.source, input.source as any));
      if (input?.courseInterest) conditions.push(like(enquiries.courseInterest, `%${input.courseInterest}%`));
      if (input?.selectedCentreId) conditions.push(eq(enquiries.selectedCentreId, input.selectedCentreId));
      if (input?.converted === "yes") conditions.push(isNotNull(enquiries.convertedStudentId));
      if (input?.converted === "no") conditions.push(isNull(enquiries.convertedStudentId));
      if (input?.from) conditions.push(gte(enquiries.createdAt, new Date(input.from)));
      if (input?.to) conditions.push(lte(enquiries.createdAt, new Date(input.to + "T23:59:59")));
      if (input?.search) {
        const t = `%${input.search}%`;
        conditions.push(or(like(enquiries.name, t), like(enquiries.phone, t), like(enquiries.email, t)));
      }
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      const list = await db.select({
        id: enquiries.id, name: enquiries.name, email: enquiries.email, phone: enquiries.phone,
        courseInterest: enquiries.courseInterest, message: enquiries.message, type: enquiries.type,
        source: enquiries.source, status: enquiries.status,
        selectedCentreId: enquiries.selectedCentreId, selectedCentreName: enquiries.centerPreference,
        assignedTo: enquiries.assignedTo, assignedCentreId: enquiries.assignedCentreId,
        followUpDate: enquiries.followUpDate, remarks: enquiries.remarks,
        convertedStudentId: enquiries.convertedStudentId, convertedAt: enquiries.convertedAt,
        convertedStudentRoll: students.rollNumber, convertedStudentName: students.name,
        centreName: centers.name, createdAt: enquiries.createdAt,
      }).from(enquiries)
        .leftJoin(centers, eq(enquiries.selectedCentreId, centers.id))
        .leftJoin(students, eq(enquiries.convertedStudentId, students.id))
        .where(where).orderBy(desc(enquiries.createdAt))
        .limit(input?.limit || 50).offset(((input?.page || 1) - 1) * (input?.limit || 50));
      const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(enquiries).where(where);
      return { list, total: countResult?.count || 0 };
    }),

  byId: adminQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const [lead] = await db.select({
      id: enquiries.id, name: enquiries.name, email: enquiries.email, phone: enquiries.phone,
      courseInterest: enquiries.courseInterest, message: enquiries.message, type: enquiries.type,
      source: enquiries.source, status: enquiries.status,
      selectedCentreId: enquiries.selectedCentreId, selectedCentreName: enquiries.centerPreference,
      assignedTo: enquiries.assignedTo, assignedUserName: users.name,
      assignedCentreId: enquiries.assignedCentreId, centreName: centers.name,
      followUpDate: enquiries.followUpDate, remarks: enquiries.remarks,
      convertedStudentId: enquiries.convertedStudentId, convertedAt: enquiries.convertedAt,
      createdAt: enquiries.createdAt, updatedAt: enquiries.updatedAt,
    }).from(enquiries)
      .leftJoin(centers, eq(enquiries.selectedCentreId, centers.id))
      .leftJoin(users, eq(enquiries.assignedTo, users.id))
      .where(eq(enquiries.id, input.id));
    return lead || null;
  }),

  // ─── Public: submit a lead (Contact page) ───
  submit: publicQuery
    .input(z.object({
      name: z.string().min(1), email: z.string().email().optional(), phone: z.string().min(1),
      courseInterest: z.string().optional(), centerPreference: z.string().optional(),
      selectedCentreId: z.number().optional(), message: z.string().optional(),
      type: z.enum(["course", "franchise", "general"]).optional(),
      source: z.enum(["website", "whatsapp", "popup", "referral", "social_media", "contact_page"]).optional(),
    })).mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(enquiries).values({ ...input, status: "new" });
      return { success: true, id: Number(result[0].insertId) };
    }),

  // ─── Admin: update lead (full edit + status/follow-up/remarks/assignment) ───
  update: adminQuery
    .input(z.object({
      id: z.number(),
      // editable lead fields
      name: z.string().min(1).optional(), phone: z.string().optional(),
      email: z.string().optional(), courseInterest: z.string().optional(),
      message: z.string().optional(),
      source: z.enum(["website", "whatsapp", "popup", "referral", "social_media", "contact_page"]).optional(),
      selectedCentreId: z.number().nullable().optional(), centerPreference: z.string().optional(),
      // workflow fields
      status: z.enum(LEAD_STATUS).optional(),
      remarks: z.string().optional(), assignedTo: z.number().nullable().optional(),
      assignedCentreId: z.number().nullable().optional(), followUpDate: z.string().optional(),
    })).mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(enquiries).set(data).where(eq(enquiries.id, id));
      return { success: true };
    }),

  // ─── Super Admin only: convert a lead into an official student (one-time) ───
  convertToStudent: superAdminQuery
    .input(z.object({
      id: z.number(),
      // student fields (prefilled from lead, completed by admin)
      name: z.string().min(1), phone: z.string().optional(), email: z.string().optional(),
      photo: z.string().optional(),
      gender: z.enum(["male", "female", "other"]).optional(),
      category: z.enum(["general", "sc_st", "bc_obc"]).optional(),
      aadharNumber: z.string().optional(),
      fatherName: z.string().optional(), motherName: z.string().optional(),
      dob: z.string().optional(), address: z.string().optional(),
      courseId: z.number().optional(), centerId: z.number().optional(),
      feeStatus: z.enum(["paid", "pending", "partial"]).optional(),
      paymentMode: z.enum(["online", "offline_cash", "offline_upi", "offline_bank"]).optional(),
      paymentReceivedDate: z.string().optional(), paymentReference: z.string().optional(), paymentRemarks: z.string().optional(),
      siblings: z.array(z.object({ name: z.string().optional(), relation: z.string().optional(), age: z.number().optional(), qualification: z.string().optional() })).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      // Guard: lead must exist and not already be converted (prevents double conversion / duplicate students).
      const [lead] = await db.select().from(enquiries).where(eq(enquiries.id, input.id));
      if (!lead) throw new TRPCError({ code: "NOT_FOUND", message: "Lead not found" });
      if (lead.convertedStudentId) {
        throw new TRPCError({ code: "CONFLICT", message: "This lead is already converted to student." });
      }

      const { id, siblings, ...studentFields } = input;
      const rollNumber = `UAN24${Date.now().toString(36).toUpperCase()}`;
      // Generate official login credentials (Student ID + username + temp password).
      const unameBase = (input.name || "student").toLowerCase().split(/\s+/)[0].replace(/[^a-z0-9]/g, "") || "student";
      let username = `${unameBase}${rollNumber.slice(-4).toLowerCase()}`;
      const [uExists] = await db.select({ id: students.id }).from(students).where(eq(students.username, username));
      if (uExists) username = `${unameBase}${rollNumber.slice(-6).toLowerCase()}`;
      const pwChars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
      let password = "";
      for (let i = 0; i < 8; i++) password += pwChars[Math.floor(Math.random() * pwChars.length)];

      const res = await db.insert(students).values({
        ...studentFields, rollNumber, username, password,
        status: "active", feeStatus: input.feeStatus || "pending",
        createdByAdmin: true, admissionDate: new Date().toISOString().slice(0, 10),
      });
      const studentId = Number(res[0].insertId);

      // Optional siblings
      if (siblings?.length) {
        for (const s of siblings) {
          if (s.name) await db.insert(studentSiblings).values({
            studentId, siblingName: s.name, siblingRelation: s.relation, siblingAge: s.age, siblingQualification: s.qualification,
          });
        }
      }

      // Mark lead converted + link the student.
      await db.update(enquiries).set({
        status: "converted", convertedStudentId: studentId, convertedAt: new Date(),
      }).where(eq(enquiries.id, id));

      // Keep centre student count roughly in sync (best-effort).
      if (input.centerId) {
        await db.update(centers).set({ studentCount: sql`${centers.studentCount} + 1` }).where(eq(centers.id, input.centerId));
      }

      return { success: true, studentId, rollNumber, username, password };
    }),

  // Admin/staff users a lead can be assigned to.
  assignableUsers: adminQuery.query(async () => {
    const db = getDb();
    return db.select({ id: users.id, name: users.name, role: users.role }).from(users);
  }),

  delete: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.delete(enquiries).where(eq(enquiries.id, input.id));
    return { success: true };
  }),
});

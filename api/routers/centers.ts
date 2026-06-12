import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, adminQuery, superAdminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { centers, students, results, exams, certificates } from "@db/schema";
import { eq, like, and, desc, sql } from "drizzle-orm";

// Unique study-centre code, e.g. UAN24-KOT-LX9F2. City prefix + timestamp + random.
function genCenterCode(city?: string) {
  const prefix = (city || "").replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "CTR";
  const suffix = (Date.now().toString(36) + Math.random().toString(36).slice(2, 5)).slice(-5).toUpperCase();
  return `UAN24-${prefix}-${suffix}`;
}

export const centerRouter = createRouter({
  list: publicQuery
    .input(z.object({ search: z.string().optional(), status: z.string().optional(), page: z.number().default(1), limit: z.number().default(50) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.status) conditions.push(eq(centers.status, input.status as any));
      if (input?.search) conditions.push(like(centers.name, `%${input.search}%`));
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      const list = await db.select().from(centers).where(where).orderBy(desc(centers.createdAt)).limit(input?.limit || 50).offset(((input?.page || 1) - 1) * (input?.limit || 50));
      const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(centers).where(where);
      return { list, total: countResult?.count || 0 };
    }),

  byCode: publicQuery.input(z.object({ code: z.string() })).query(async ({ input }) => {
    const db = getDb();
    const [center] = await db.select().from(centers).where(eq(centers.centerCode, input.code));
    return center || null;
  }),

  // ─── Public: only ACTIVE centres, safe fields (for Contact page dropdown + cards) ───
  publicActive: publicQuery.query(async () => {
    const db = getDb();
    return db.select({
      id: centers.id, name: centers.name, centerCode: centers.centerCode,
      contactPerson: centers.ownerName, phone: centers.ownerPhone, email: centers.email,
      address: centers.address, city: centers.city, state: centers.state,
      mapLink: centers.mapLink, status: centers.status,
    }).from(centers).where(eq(centers.status, "active")).orderBy(centers.name);
  }),

  // ─── Centre login (centre code + password) ───
  login: publicQuery
    .input(z.object({ code: z.string().min(1), password: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [center] = await db.select().from(centers).where(eq(centers.centerCode, input.code.trim()));
      if (!center || center.password !== input.password) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid centre code or password" });
      }
      if (center.status !== "active") {
        throw new TRPCError({ code: "FORBIDDEN", message: "This centre is not active yet. Please contact head office." });
      }
      return { id: center.id, name: center.name, centerCode: center.centerCode };
    }),

  byId: publicQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const [center] = await db.select().from(centers).where(eq(centers.id, input.id));
    return center || null;
  }),

  // Super admin manually adds a centre — auto-generates a unique code + default
  // password if not supplied, and creates it active.
  create: adminQuery
    .input(z.object({
      name: z.string().min(1), centerCode: z.string().optional(), ownerName: z.string().optional(),
      ownerPhone: z.string().optional(), email: z.string().email().optional(), password: z.string().optional(),
      address: z.string().optional(), city: z.string().optional(), state: z.string().optional(),
      pincode: z.string().optional(), lat: z.string().optional(), lng: z.string().optional(),
      status: z.enum(["pending", "approved", "rejected", "suspended", "active", "inactive"]).optional(),
    })).mutation(async ({ input }) => {
      const db = getDb();
      const centerCode = input.centerCode?.trim() || genCenterCode(input.city);
      const result = await db.insert(centers).values({
        ...input,
        centerCode,
        password: input.password || "center123",
        status: input.status || "active",
      });
      return { success: true, id: Number(result[0].insertId), centerCode };
    }),

  update: adminQuery
    .input(z.object({
      id: z.number(), name: z.string().optional(),
      status: z.enum(["pending", "approved", "rejected", "suspended", "active", "inactive"]).optional(),
      ownerName: z.string().optional(), ownerPhone: z.string().optional(),
      email: z.string().optional(), address: z.string().optional(),
      city: z.string().optional(), state: z.string().optional(), pincode: z.string().optional(),
    })).mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(centers).set(data).where(eq(centers.id, id));
      return { success: true };
    }),

  delete: superAdminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.delete(centers).where(eq(centers.id, input.id));
    return { success: true };
  }),

  // ─── Public: apply for a study centre / franchise from the website ───
  submitApplication: publicQuery
    .input(z.object({
      name: z.string().min(1), ownerName: z.string().optional(), ownerPhone: z.string().min(1),
      email: z.string().optional(), address: z.string().optional(),
      city: z.string().optional(), state: z.string().optional(), pincode: z.string().optional(),
      documents: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      // Provisional code until approved; status pending puts it in the application queue.
      const centerCode = `APP-${(Date.now().toString(36) + Math.random().toString(36).slice(2, 5)).slice(-6).toUpperCase()}`;
      const result = await db.insert(centers).values({ ...input, centerCode, status: "pending" });
      return { success: true, id: Number(result[0].insertId) };
    }),

  // ─── Super admin: approve an application → active centre with code + password ───
  approve: superAdminQuery
    .input(z.object({ id: z.number(), password: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [center] = await db.select().from(centers).where(eq(centers.id, input.id));
      if (!center) throw new TRPCError({ code: "NOT_FOUND", message: "Centre not found" });
      const centerCode = center.centerCode?.startsWith("APP-") || !center.centerCode
        ? genCenterCode(center.city ?? undefined)
        : center.centerCode;
      const password = input.password || center.password || "center123";
      await db.update(centers).set({ status: "active", centerCode, password }).where(eq(centers.id, input.id));
      return { success: true, centerCode, password };
    }),

  reject: superAdminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(centers).set({ status: "rejected" }).where(eq(centers.id, input.id));
    return { success: true };
  }),

  // Suspend / re-activate / any status change.
  setStatus: superAdminQuery
    .input(z.object({ id: z.number(), status: z.enum(["pending", "approved", "rejected", "suspended", "active", "inactive"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(centers).set({ status: input.status }).where(eq(centers.id, input.id));
      return { success: true };
    }),

  setCredentials: superAdminQuery
    .input(z.object({ id: z.number(), password: z.string().min(4) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(centers).set({ password: input.password }).where(eq(centers.id, input.id));
      return { success: true };
    }),

  // ─── Results overview for a centre's students ───
  results: publicQuery.input(z.object({ centerId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    return db.select({
      id: results.id,
      studentName: students.name,
      rollNumber: students.rollNumber,
      examName: exams.name,
      marksObtained: results.marksObtained,
      totalMarks: results.totalMarks,
      percentage: results.percentage,
      grade: results.grade,
      status: results.status,
    }).from(results)
      .innerJoin(students, eq(results.studentId, students.id))
      .leftJoin(exams, eq(results.examId, exams.id))
      .where(eq(students.centerId, input.centerId))
      .orderBy(desc(results.createdAt));
  }),

  // ─── Certificate status for a centre's students ───
  certificates: publicQuery.input(z.object({ centerId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    return db.select({
      id: certificates.id,
      serialNumber: certificates.serialNumber,
      studentName: certificates.studentName,
      courseName: certificates.courseName,
      issueDate: certificates.issueDate,
      status: certificates.status,
    }).from(certificates)
      .innerJoin(students, eq(certificates.studentId, students.id))
      .where(eq(students.centerId, input.centerId))
      .orderBy(desc(certificates.createdAt));
  }),
});

import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  decimal,
  boolean,
  bigint,
  date,
  json,
} from "drizzle-orm/mysql-core";

// ─── Users (Admin/Staff/Super Admin) ───
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  password: varchar("password", { length: 255 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["super_admin", "admin", "staff"]).default("staff").notNull(),
  permissions: json("permissions"),
  status: mysqlEnum("status", ["active", "inactive"]).default("active"),
  lastLoginAt: timestamp("lastLoginAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Students ───
export const students = mysqlTable("students", {
  id: serial("id").primaryKey(),
  rollNumber: varchar("roll_number", { length: 50 }).notNull().unique(),
  username: varchar("username", { length: 100 }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  password: varchar("password", { length: 255 }).default("$2a$10$student123"),
  photo: text("photo"),
  fatherName: varchar("father_name", { length: 255 }),
  motherName: varchar("mother_name", { length: 255 }),
  dob: date("dob"),
  gender: mysqlEnum("gender", ["male", "female", "other"]),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  pincode: varchar("pincode", { length: 20 }),
  qualification: varchar("qualification", { length: 255 }),
  courseId: bigint("course_id", { mode: "number", unsigned: true }),
  centerId: bigint("center_id", { mode: "number", unsigned: true }),
  admissionDate: date("admission_date"),
  status: mysqlEnum("status", ["active", "inactive", "completed", "dropped"]).default("active"),
  feeStatus: mysqlEnum("fee_status", ["paid", "pending", "partial"]).default("pending"),
  attendancePercent: int("attendance_percent").default(0),
  certificateIssued: boolean("certificate_issued").default(false),
  certificateSerial: varchar("certificate_serial", { length: 100 }),
  referralCode: varchar("referral_code", { length: 32 }).unique(),
  referredBy: bigint("referred_by", { mode: "number", unsigned: true }),
  // ── Admission + payment details ──
  category: mysqlEnum("category", ["general", "sc_st", "bc_obc"]),
  aadharNumber: varchar("aadhar_number", { length: 12 }),
  admissionStatus: mysqlEnum("admission_status", ["pending", "in_progress", "completed"]).default("pending").notNull(),
  admissionStep: int("admission_step").default(0).notNull(),
  profileCompleted: boolean("profile_completed").default(false).notNull(),
  createdByAdmin: boolean("created_by_admin").default(false).notNull(),
  paymentMode: mysqlEnum("payment_mode", ["online", "offline_cash", "offline_upi", "offline_bank"]),
  paymentReceivedDate: date("payment_received_date"),
  paymentReference: varchar("payment_reference", { length: 100 }),
  razorpayPaymentId: varchar("razorpay_payment_id", { length: 100 }),
  paymentRemarks: text("payment_remarks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Student siblings (admission step 2) ───
export const studentSiblings = mysqlTable("student_siblings", {
  id: serial("id").primaryKey(),
  studentId: bigint("student_id", { mode: "number", unsigned: true }).notNull(),
  siblingName: varchar("sibling_name", { length: 255 }),
  siblingRelation: varchar("sibling_relation", { length: 50 }),
  siblingAge: int("sibling_age"),
  siblingQualification: varchar("sibling_qualification", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Admission form links (centre-shared) ───
export const admissionFormLinks = mysqlTable("admission_form_links", {
  id: serial("id").primaryKey(),
  studentId: bigint("student_id", { mode: "number", unsigned: true }),
  centreId: bigint("centre_id", { mode: "number", unsigned: true }),
  token: varchar("token", { length: 64 }).notNull().unique(),
  status: mysqlEnum("status", ["active", "used", "expired"]).default("active").notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Courses ───
export const courses = mysqlTable("courses", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  category: mysqlEnum("category", ["foundation", "core_ai", "advanced_ai", "specialization", "analytics", "premium", "short_term"]).notNull(),
  shortDescription: text("short_description"),
  description: text("description"),
  highlights: text("highlights"),
  syllabus: text("syllabus"),
  duration: varchar("duration", { length: 100 }),
  eligibility: text("eligibility"),
  fee: decimal("fee", { precision: 10, scale: 2 }),
  onlineFee: decimal("online_fee", { precision: 10, scale: 2 }),
  offlineFee: decimal("offline_fee", { precision: 10, scale: 2 }),
  registrationFee: decimal("registration_fee", { precision: 10, scale: 2 }),
  examFee: decimal("exam_fee", { precision: 10, scale: 2 }),
  certification: varchar("certification", { length: 255 }),
  careerOpportunities: text("career_opportunities"),
  thumbnail: text("thumbnail"),
  mode: mysqlEnum("mode", ["online", "offline", "hybrid"]).default("offline"),
  status: mysqlEnum("status", ["active", "inactive"]).default("active"),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  seoKeywords: varchar("seo_keywords", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Centers (Study Centres) ───
export const centers = mysqlTable("centers", {
  id: serial("id").primaryKey(),
  centerCode: varchar("center_code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  ownerName: varchar("owner_name", { length: 255 }),
  ownerPhone: varchar("owner_phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  password: varchar("password", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  pincode: varchar("pincode", { length: 20 }),
  lat: varchar("lat", { length: 50 }),
  lng: varchar("lng", { length: 50 }),
  mapLink: varchar("map_link", { length: 500 }),
  logo: text("logo"),
  documents: text("documents"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "suspended", "active", "inactive"]).default("pending"),
  studentCount: int("student_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Enquiries ───
export const enquiries = mysqlTable("enquiries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }).notNull(),
  courseInterest: varchar("course_interest", { length: 255 }),
  centerPreference: varchar("center_preference", { length: 255 }),
  selectedCentreId: bigint("selected_centre_id", { mode: "number", unsigned: true }),
  assignedCentreId: bigint("assigned_centre_id", { mode: "number", unsigned: true }),
  type: mysqlEnum("type", ["course", "franchise", "general"]).default("general"),
  message: text("message"),
  source: mysqlEnum("source", ["website", "whatsapp", "popup", "referral", "social_media", "contact_page"]).default("website"),
  status: mysqlEnum("status", ["new", "contacted", "follow_up", "converted", "not_interested", "closed"]).default("new"),
  assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
  remarks: text("remarks"),
  followUpDate: date("follow_up_date"),
  convertedStudentId: bigint("converted_student_id", { mode: "number", unsigned: true }),
  convertedAt: timestamp("converted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Fee Payments ───
export const feePayments = mysqlTable("fee_payments", {
  id: serial("id").primaryKey(),
  studentId: bigint("student_id", { mode: "number", unsigned: true }).notNull(),
  courseId: bigint("course_id", { mode: "number", unsigned: true }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("payment_method", ["cash", "card", "upi", "net_banking"]),
  transactionId: varchar("transaction_id", { length: 255 }),
  receiptNumber: varchar("receipt_number", { length: 100 }),
  status: mysqlEnum("status", ["success", "pending", "failed"]).default("success"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Exams ───
export const exams = mysqlTable("exams", {
  id: serial("id").primaryKey(),
  courseId: bigint("course_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  maxMarks: int("max_marks").default(100),
  passingMarks: int("passing_marks").default(35),
  duration: int("duration").default(60),
  negativeMarking: boolean("negative_marking").default(false),
  randomQuestions: boolean("random_questions").default(false),
  examDate: date("exam_date"),
  status: mysqlEnum("status", ["upcoming", "ongoing", "completed", "draft"]).default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Questions ───
export const questions = mysqlTable("questions", {
  id: serial("id").primaryKey(),
  examId: bigint("exam_id", { mode: "number", unsigned: true }).notNull(),
  question: text("question").notNull(),
  optionA: text("option_a"),
  optionB: text("option_b"),
  optionC: text("option_c"),
  optionD: text("option_d"),
  correctAnswer: mysqlEnum("correct_answer", ["a", "b", "c", "d"]),
  marks: int("marks").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Student Exam Attempts ───
export const examAttempts = mysqlTable("exam_attempts", {
  id: serial("id").primaryKey(),
  studentId: bigint("student_id", { mode: "number", unsigned: true }).notNull(),
  examId: bigint("exam_id", { mode: "number", unsigned: true }).notNull(),
  answers: json("answers"),
  marksObtained: int("marks_obtained").default(0),
  totalMarks: int("total_marks").default(100),
  percentage: decimal("percentage", { precision: 5, scale: 2 }),
  grade: varchar("grade", { length: 10 }),
  status: mysqlEnum("status", ["pass", "fail", "absent"]).default("absent"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

// ─── Results ───
export const results = mysqlTable("results", {
  id: serial("id").primaryKey(),
  studentId: bigint("student_id", { mode: "number", unsigned: true }).notNull(),
  examId: bigint("exam_id", { mode: "number", unsigned: true }).notNull(),
  attemptId: bigint("attempt_id", { mode: "number", unsigned: true }),
  marksObtained: int("marks_obtained").default(0),
  totalMarks: int("total_marks").default(100),
  percentage: decimal("percentage", { precision: 5, scale: 2 }),
  grade: varchar("grade", { length: 10 }),
  status: mysqlEnum("status", ["pass", "fail", "absent"]).default("absent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Certificates ───
export const certificates = mysqlTable("certificates", {
  id: serial("id").primaryKey(),
  studentId: bigint("student_id", { mode: "number", unsigned: true }).notNull(),
  courseId: bigint("course_id", { mode: "number", unsigned: true }).notNull(),
  serialNumber: varchar("serial_number", { length: 100 }).notNull().unique(),
  studentName: varchar("student_name", { length: 255 }),
  courseName: varchar("course_name", { length: 255 }),
  certificateType: mysqlEnum("certificate_type", ["one_year", "six_months", "three_months", "default"]).default("default").notNull(),
  courseDuration: varchar("course_duration", { length: 100 }),
  centreId: bigint("centre_id", { mode: "number", unsigned: true }),
  completionDate: date("completion_date"),
  qrCode: varchar("qr_code", { length: 255 }),
  templateUsed: varchar("template_used", { length: 50 }),
  certificateFile: varchar("certificate_file", { length: 255 }),
  issueDate: date("issue_date"),
  status: mysqlEnum("status", ["issued", "revoked"]).default("issued"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Marksheets ───
export const marksheets = mysqlTable("marksheets", {
  id: serial("id").primaryKey(),
  studentId: bigint("student_id", { mode: "number", unsigned: true }).notNull(),
  courseId: bigint("course_id", { mode: "number", unsigned: true }),
  centreId: bigint("centre_id", { mode: "number", unsigned: true }),
  marksheetNumber: varchar("marksheet_number", { length: 100 }).notNull().unique(),
  totalMarks: int("total_marks").default(0),
  obtainedMarks: int("obtained_marks").default(0),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).default("0"),
  grade: varchar("grade", { length: 10 }),
  resultStatus: mysqlEnum("result_status", ["pass", "fail"]).default("pass"),
  issueDate: date("issue_date"),
  qrCode: varchar("qr_code", { length: 255 }),
  marksheetFile: varchar("marksheet_file", { length: 255 }),
  status: mysqlEnum("status", ["issued", "revoked"]).default("issued").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const marksheetSubjects = mysqlTable("marksheet_subjects", {
  id: serial("id").primaryKey(),
  marksheetId: bigint("marksheet_id", { mode: "number", unsigned: true }).notNull(),
  subjectName: varchar("subject_name", { length: 255 }),
  maxMarks: int("max_marks").default(100),
  obtainedMarks: int("obtained_marks").default(0),
  grade: varchar("grade", { length: 10 }),
  remarks: varchar("remarks", { length: 255 }),
});

// ─── Blog Posts ───
export const blogPosts = mysqlTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content"),
  category: varchar("category", { length: 100 }),
  tags: text("tags"),
  thumbnail: text("thumbnail"),
  author: varchar("author", { length: 255 }),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  status: mysqlEnum("status", ["published", "draft"]).default("draft"),
  views: int("views").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Gallery ───
export const gallery = mysqlTable("gallery", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }),
  type: mysqlEnum("type", ["image", "video"]).default("image"),
  category: varchar("category", { length: 100 }),
  url: text("url").notNull(),
  thumbnail: text("thumbnail"),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Downloads ───
export const downloads = mysqlTable("downloads", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["prospectus", "form", "fee_structure", "brochure", "course_pdf", "other"]).default("other"),
  fileUrl: text("file_url").notNull(),
  fileSize: varchar("file_size", { length: 50 }),
  isPublic: boolean("is_public").default(true),
  downloads: int("downloads").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Announcements ───
export const announcements = mysqlTable("announcements", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  type: mysqlEnum("type", ["general", "exam", "fee", "admission"]).default("general"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Settings ───
export const settings = mysqlTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value"),
  group: varchar("group", { length: 50 }).default("general"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Testimonials ───
export const testimonials = mysqlTable("testimonials", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  course: varchar("course", { length: 255 }),
  content: text("content").notNull(),
  photo: text("photo"),
  rating: int("rating").default(5),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Attendance ───
export const attendance = mysqlTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: bigint("student_id", { mode: "number", unsigned: true }).notNull(),
  courseId: bigint("course_id", { mode: "number", unsigned: true }).notNull(),
  date: date("date").notNull(),
  status: mysqlEnum("status", ["present", "absent", "holiday"]).default("present"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Notifications ───
export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  studentId: bigint("student_id", { mode: "number", unsigned: true }),
  centerId: bigint("center_id", { mode: "number", unsigned: true }),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  type: mysqlEnum("type", ["general", "exam", "fee", "certificate"]).default("general"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Activity Logs ───
export const activityLogs = mysqlTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  action: varchar("action", { length: 255 }).notNull(),
  entity: varchar("entity", { length: 100 }),
  entityId: bigint("entity_id", { mode: "number", unsigned: true }),
  ipAddress: varchar("ip_address", { length: 50 }),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Study Materials ───
export const studyMaterials = mysqlTable("study_materials", {
  id: serial("id").primaryKey(),
  courseId: bigint("course_id", { mode: "number", unsigned: true }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["pdf", "video", "document"]).default("pdf"),
  fileUrl: text("file_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Refer & Earn: referral mapping (who referred whom) ───
export const studentReferrals = mysqlTable("student_referrals", {
  id: serial("id").primaryKey(),
  referrerStudentId: bigint("referrer_student_id", { mode: "number", unsigned: true }).notNull(),
  referredStudentId: bigint("referred_student_id", { mode: "number", unsigned: true }).notNull(),
  referralCode: varchar("referral_code", { length: 32 }),
  responsibleCentreId: bigint("responsible_centre_id", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["registered", "purchased", "cancelled"]).default("registered").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Commission earned per referred purchase ───
export const referralTransactions = mysqlTable("referral_transactions", {
  id: serial("id").primaryKey(),
  referrerStudentId: bigint("referrer_student_id", { mode: "number", unsigned: true }).notNull(),
  referredStudentId: bigint("referred_student_id", { mode: "number", unsigned: true }).notNull(),
  responsibleCentreId: bigint("responsible_centre_id", { mode: "number", unsigned: true }),
  courseId: bigint("course_id", { mode: "number", unsigned: true }),
  paymentRef: varchar("payment_ref", { length: 100 }),
  courseAmount: decimal("course_amount", { precision: 10, scale: 2 }).notNull(),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  commissionPercentage: decimal("commission_percentage", { precision: 5, scale: 2 }).default("0"),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["pending", "approved", "paid", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Wallet cache (always recomputed from wallet_statements) ───
export const studentWallets = mysqlTable("student_wallets", {
  id: serial("id").primaryKey(),
  studentId: bigint("student_id", { mode: "number", unsigned: true }).notNull().unique(),
  centreId: bigint("centre_id", { mode: "number", unsigned: true }),
  totalEarned: decimal("total_earned", { precision: 10, scale: 2 }).default("0"),
  totalWithdrawn: decimal("total_withdrawn", { precision: 10, scale: 2 }).default("0"),
  pendingAmount: decimal("pending_amount", { precision: 10, scale: 2 }).default("0"),
  approvedAmount: decimal("approved_amount", { precision: 10, scale: 2 }).default("0"),
  walletBalance: decimal("wallet_balance", { precision: 10, scale: 2 }).default("0"),
  outstandingAmount: decimal("outstanding_amount", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Ledger: every credit/debit, source of truth for balance ───
export const walletStatements = mysqlTable("wallet_statements", {
  id: serial("id").primaryKey(),
  studentId: bigint("student_id", { mode: "number", unsigned: true }).notNull(),
  centreId: bigint("centre_id", { mode: "number", unsigned: true }),
  transactionType: mysqlEnum("transaction_type", ["commission_credit", "payout_request", "payout_paid", "adjustment", "cancelled"]).notNull(),
  referenceId: varchar("reference_id", { length: 100 }),
  creditAmount: decimal("credit_amount", { precision: 10, scale: 2 }).default("0"),
  debitAmount: decimal("debit_amount", { precision: 10, scale: 2 }).default("0"),
  balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }).default("0"),
  status: varchar("status", { length: 50 }),
  paymentMode: varchar("payment_mode", { length: 20 }),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Payout (withdrawal) requests ───
export const payoutRequests = mysqlTable("payout_requests", {
  id: serial("id").primaryKey(),
  studentId: bigint("student_id", { mode: "number", unsigned: true }).notNull(),
  centreId: bigint("centre_id", { mode: "number", unsigned: true }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMode: mysqlEnum("payment_mode", ["cash", "upi", "bank"]).notNull(),
  upiId: varchar("upi_id", { length: 100 }),
  accountHolderName: varchar("account_holder_name", { length: 255 }),
  accountNumber: varchar("account_number", { length: 50 }),
  ifscCode: varchar("ifsc_code", { length: 20 }),
  bankName: varchar("bank_name", { length: 255 }),
  status: mysqlEnum("status", ["requested", "processing", "paid", "rejected"]).default("requested").notNull(),
  adminRemarks: text("admin_remarks"),
  centreRemarks: text("centre_remarks"),
  paidByCentreUserId: bigint("paid_by_centre_user_id", { mode: "number", unsigned: true }),
  paymentReference: varchar("payment_reference", { length: 100 }),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type StudentReferral = typeof studentReferrals.$inferSelect;
export type ReferralTransaction = typeof referralTransactions.$inferSelect;
export type StudentWallet = typeof studentWallets.$inferSelect;
export type WalletStatement = typeof walletStatements.$inferSelect;
export type PayoutRequest = typeof payoutRequests.$inferSelect;

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Student = typeof students.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Center = typeof centers.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
export type Exam = typeof exams.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type ExamAttempt = typeof examAttempts.$inferSelect;
export type Result = typeof results.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type GalleryItem = typeof gallery.$inferSelect;
export type Download = typeof downloads.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type StudyMaterial = typeof studyMaterials.$inferSelect;
export type FeePayment = typeof feePayments.$inferSelect;

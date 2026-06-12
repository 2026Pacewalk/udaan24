import "dotenv/config";
import { createConnection } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required to seed. Set it in app/.env");
}

async function seed() {
  const conn = await createConnection({ uri: DATABASE_URL });
  const db = drizzle(conn, { schema, mode: "default" });

  console.log("Seeding admin users...");
  await db.insert(schema.users).values([
    {
      unionId: "dev-superadmin",
      name: "Udaan24 Super Admin",
      email: "superadmin@udaan24.com",
      phone: "+91 97808 43440",
      password: "superadmin123",
      role: "super_admin" as const,
      status: "active" as const,
    },
    {
      unionId: "dev-admin",
      name: "Udaan24 Admin",
      email: "admin@udaan24.com",
      phone: "+91 97808 43440",
      password: "admin123",
      role: "admin" as const,
      status: "active" as const,
    },
  ]);
  console.log("  super admin (superadmin@udaan24.com / superadmin123) + admin (admin@udaan24.com / admin123) seeded");

  console.log("Seeding courses...");
  const courseData = [
    { name: "Certificate Course In Basic With AI", slug: "certificate-course-in-basic-with-ai", category: "foundation" as const, shortDescription: "Learn computer basics, AI tools, productivity apps, internet skills, and smart digital workflows for beginners.", description: "A beginner-friendly programme that builds strong computer fundamentals while introducing modern AI productivity tools. Learn MS Office / Google Workspace, internet and email, and how to use ChatGPT and AI assistants for everyday work, with hands-on practical assignments.", highlights: "Basic computer training; AI tools introduction; Internet and email usage; MS Office / Google Workspace basics; ChatGPT and AI productivity; Practical assignments", syllabus: "Basic computer training; AI tools introduction; Internet and email usage; MS Office / Google Workspace basics; ChatGPT and AI productivity; Practical assignments", duration: "1 Month", eligibility: "10th pass or basic reading/writing knowledge.", fee: "10999.00", onlineFee: "5999.00", offlineFee: "10999.00", certification: "Udaan24 Certificate in Basic Computing with AI (Online + Offline)", careerOpportunities: "Computer Operator, Office Assistant, Data Entry Executive, Digital Support Executive", thumbnail: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&h=520&q=80", mode: "hybrid" as const, status: "active" as const, seoTitle: "Basic Computer Course with AI in Kotkapura | Udaan24", seoDescription: "Beginner computer + AI tools course in Kotkapura. MS Office, internet, ChatGPT productivity. Online and offline.", seoKeywords: "basic computer course, AI tools, MS office, ChatGPT course, computer course Kotkapura" },
    { name: "Digital Marketing With AI", slug: "digital-marketing-with-ai", category: "specialization" as const, shortDescription: "Learn SEO, social media, Google Ads, Meta Ads, content marketing, analytics, and AI-powered marketing automation.", description: "A practical, project-based digital marketing course supercharged with AI. Master SEO, social media, Google and Meta Ads, AI content creation, lead generation and analytics, and learn to automate campaigns using the latest AI marketing tools.", highlights: "SEO with AI; Social media marketing; Google Ads and Meta Ads; Content creation with AI; Lead generation; Marketing analytics", syllabus: "SEO with AI; Social media marketing; Google Ads and Meta Ads; Content creation with AI; Lead generation; Marketing analytics", duration: "3 Months", eligibility: "12th pass, business owners, freelancers, students.", fee: "21999.00", onlineFee: "14999.00", offlineFee: "21999.00", certification: "Udaan24 Digital Marketing with AI Certificate (Online + Offline)", careerOpportunities: "Digital Marketer, SEO Executive, Social Media Manager, Ads Specialist, Freelancer", thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&h=520&q=80", mode: "hybrid" as const, status: "active" as const, seoTitle: "Digital Marketing with AI Course Kotkapura | Udaan24", seoDescription: "AI-powered digital marketing course - SEO, Google/Meta Ads, content, analytics. Online and offline in Punjab.", seoKeywords: "digital marketing course, AI marketing, SEO course, Google Ads, Meta Ads, social media marketing" },
    { name: "Certificate Course in Python Programming With AI", slug: "certificate-course-in-python-programming-with-ai", category: "foundation" as const, shortDescription: "Learn Python programming from basics to AI-powered automation, data handling, and practical coding projects.", description: "Go from zero to confident coder. This course covers Python fundamentals, logic building, functions and OOP, and data handling, while using AI assistants to write and debug code faster. Build real mini-projects you can showcase.", highlights: "Python basics; Logic building; Functions and OOP basics; Data handling; AI-assisted coding; Mini projects", syllabus: "Python basics; Logic building; Functions and OOP basics; Data handling; AI-assisted coding; Mini projects", duration: "3 Months", eligibility: "10th/12th pass, coding beginners.", fee: "23999.00", onlineFee: "15999.00", offlineFee: "23999.00", certification: "Udaan24 Python Programming with AI Certificate (Online + Offline)", careerOpportunities: "Python Trainee, Junior Developer, Automation Assistant, AI Coding Beginner", thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=900&h=520&q=80", mode: "hybrid" as const, status: "active" as const, seoTitle: "Python Programming with AI Course Kotkapura | Udaan24", seoDescription: "Learn Python with AI - basics to automation and projects. Beginner friendly. Online and offline in Kotkapura.", seoKeywords: "python course, python with AI, coding course, programming course Kotkapura, AI coding" },
    { name: "Blockchain Development Course With AI", slug: "blockchain-development-course-with-ai", category: "specialization" as const, shortDescription: "Learn blockchain fundamentals, smart contracts, Web3 basics, crypto concepts, and AI-assisted blockchain development.", description: "An applied blockchain programme covering blockchain fundamentals, Web3, smart contracts and decentralized apps, with AI assistance for faster development. Practice on real projects and understand the crypto ecosystem end to end.", highlights: "Blockchain fundamentals; Web3 basics; Smart contract introduction; Decentralized applications; AI-assisted coding; Real project practice", syllabus: "Blockchain fundamentals; Web3 basics; Smart contract introduction; Decentralized applications; AI-assisted coding; Real project practice", duration: "6 Months", eligibility: "Basic computer knowledge, programming knowledge preferred.", fee: "77999.00", onlineFee: "54999.00", offlineFee: "77999.00", certification: "Udaan24 Blockchain Development with AI Certificate (Online + Offline)", careerOpportunities: "Blockchain Trainee, Web3 Developer Assistant, Smart Contract Beginner, Crypto Tech Support", thumbnail: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=900&h=520&q=80", mode: "hybrid" as const, status: "active" as const, seoTitle: "Blockchain Development with AI Course | Udaan24 Kotkapura", seoDescription: "Blockchain + Web3 + smart contracts with AI. Hands-on projects. Online and offline in Punjab.", seoKeywords: "blockchain course, web3 course, smart contracts, crypto course, blockchain development Kotkapura" },
    { name: "Web Development & Data Science With AI", slug: "web-development-and-data-science-with-ai", category: "premium" as const, shortDescription: "Learn frontend, backend, databases, APIs, data analytics, Python, and AI-powered data science workflows.", description: "A complete 1-year career programme combining full-stack web development and data science, powered by AI. Learn HTML/CSS/JavaScript, React, backend and databases, then Python for data science, visualization and AI tools, building deployable, portfolio-ready projects.", highlights: "HTML, CSS, JavaScript; React basics; Backend and database basics; Python for data science; Data visualization; AI tools for development", syllabus: "HTML, CSS, JavaScript; React basics; Backend and database basics; Python for data science; Data visualization; AI tools for development", duration: "12 Months", eligibility: "12th pass, graduates, career switchers.", fee: "75999.00", onlineFee: "41999.00", offlineFee: "75999.00", certification: "Udaan24 Web Development and Data Science with AI Diploma (Online + Offline)", careerOpportunities: "Web Developer, Data Analyst Trainee, Full-Stack Intern, AI Developer Trainee", thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&h=520&q=80", mode: "hybrid" as const, status: "active" as const, seoTitle: "Web Development & Data Science with AI | Udaan24", seoDescription: "1-year full-stack web dev + data science with AI. React, Python, analytics. Online and offline in Kotkapura.", seoKeywords: "web development course, data science course, full stack, python data science, react course" },
    { name: "Nanny Course With AI", slug: "nanny-course-with-ai", category: "short_term" as const, shortDescription: "Learn professional childcare, child safety, communication, health basics, activity planning, and AI-assisted learning support.", description: "A professional childcare programme that prepares you for trusted nanny and daycare roles. Learn child safety and hygiene, communication, activity planning and first-aid awareness, plus how to use AI tools to support early childhood learning.", highlights: "Childcare basics; Child safety and hygiene; Communication skills; Activity planning; First-aid awareness; AI tools for child learning support", syllabus: "Childcare basics; Child safety and hygiene; Communication skills; Activity planning; First-aid awareness; AI tools for child learning support", duration: "6 Months", eligibility: "10th pass, childcare workers, homemakers, job seekers.", fee: "65999.00", onlineFee: "45999.00", offlineFee: "65999.00", certification: "Udaan24 Professional Nanny with AI Certificate (Online + Offline)", careerOpportunities: "Professional Nanny, Childcare Assistant, Daycare Support Staff, Home Care Assistant", thumbnail: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&h=520&q=80", mode: "hybrid" as const, status: "active" as const, seoTitle: "Professional Nanny Course with AI | Udaan24 Kotkapura", seoDescription: "Professional childcare and nanny training with AI learning support. Safety, first-aid, activities. Online and offline.", seoKeywords: "nanny course, childcare course, daycare training, child safety course, nanny training Punjab" },
    { name: "Professional Accounts With AI", slug: "professional-accounts-with-ai", category: "specialization" as const, shortDescription: "Learn accounting basics, GST, Tally/Excel, billing, reporting, business finance, and AI-powered accounting workflows.", description: "A job-ready accounting programme covering accounting fundamentals, GST, Tally and Excel, invoicing, billing and business reporting, enhanced with AI tools that automate routine accounting tasks and reporting.", highlights: "Accounting fundamentals; GST basics; Tally/Excel practice; Invoice and billing; Business reporting; AI tools for accounts automation", syllabus: "Accounting fundamentals; GST basics; Tally/Excel practice; Invoice and billing; Business reporting; AI tools for accounts automation", duration: "12 Months", eligibility: "12th pass, commerce students, business owners, office staff.", fee: "47999.00", onlineFee: "40999.00", offlineFee: "47999.00", certification: "Udaan24 Professional Accounts with AI Certificate (Online + Offline)", careerOpportunities: "Accounts Assistant, Billing Executive, GST Assistant, Office Accountant, Finance Support Executive", thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&h=520&q=80", mode: "hybrid" as const, status: "active" as const, seoTitle: "Professional Accounts with AI Course | Udaan24 Kotkapura", seoDescription: "Accounting + GST + Tally/Excel with AI automation. Job-ready finance skills. Online and offline in Punjab.", seoKeywords: "accounts course, GST course, tally course, accounting course Kotkapura, professional accounting" },
  ];
  for (const c of courseData) await db.insert(schema.courses).values(c);
  console.log(`  ${courseData.length} courses seeded`);

  console.log("Seeding centers...");
  const centerData = [
    { centerCode: "UAN24-KKP", name: "Udaan24 - Kotkapura Main", ownerName: "Rajinder Singh", ownerPhone: "+91 97808 43440", email: "info@udaan24.com", address: "Near Bus Stand, Kotkapura", city: "Kotkapura", state: "Punjab", pincode: "151204", status: "active" as const },
    { centerCode: "UAN24-FDR", name: "Udaan24 - Faridkot", ownerName: "Harpreet Kaur", ownerPhone: "+91 98765 12340", email: "faridkot@udaan24.com", address: "Main Road, Faridkot", city: "Faridkot", state: "Punjab", pincode: "151203", status: "active" as const },
    { centerCode: "UAN24-BTI", name: "Udaan24 - Bathinda", ownerName: "Manjit Singh", ownerPhone: "+91 98765 12341", email: "bathinda@udaan24.com", address: "Bibi Wala Road, Bathinda", city: "Bathinda", state: "Punjab", pincode: "151001", status: "active" as const },
    { centerCode: "UAN24-LDH", name: "Udaan24 - Ludhiana", ownerName: "Simran Kaur", ownerPhone: "+91 98765 12342", email: "ludhiana@udaan24.com", address: "Ferozepur Road, Ludhiana", city: "Ludhiana", state: "Punjab", pincode: "141001", status: "active" as const },
  ];
  for (const c of centerData) await db.insert(schema.centers).values({ ...c, password: "center123" });
  console.log(`  ${centerData.length} centers seeded (login: <centerCode> / center123)`);

  console.log("Seeding students...");
  const studentNames = ["Gurpreet Singh", "Harpreet Kaur", "Manjit Singh", "Simran Kaur", "Rajinder Kumar", "Amandeep Singh", "Jaspreet Kaur", "Balwinder Singh", "Navdeep Kaur", "Gagandeep Singh"];
  const cities = ["Kotkapura", "Faridkot", "Bathinda", "Ludhiana", "Moga"];
  for (let i = 0; i < 20; i++) {
    await db.insert(schema.students).values({
      rollNumber: `UAN24-${String(i + 1).padStart(4, "0")}`,
      password: "student123",
      name: studentNames[i % studentNames.length] + (i >= 10 ? ` ${Math.floor(i/10) + 1}` : ""),
      email: `student${i+1}@udaan24.com`,
      phone: `+91 98765 ${String(10000 + i).slice(1)}`,
      courseId: (i % 4) + 1,
      centerId: (i % 4) + 1,
      city: cities[i % cities.length],
      state: "Punjab",
      admissionDate: new Date(2024, 8 + (i % 4), 1 + (i % 28)).toISOString().split("T")[0],
      status: "active" as const,
      feeStatus: i % 3 === 0 ? "pending" as const : i % 3 === 1 ? "partial" as const : "paid" as const,
      qualification: i % 2 === 0 ? "12th Pass" : "Graduate",
    });
  }
  console.log(`  20 students seeded`);

  console.log("Seeding enquiries...");
  const enquiryData = [
    { name: "Vikram Singh", phone: "+91 98765 43212", courseInterest: "Python Programming Course", type: "course" as const, status: "new" as const, source: "website" as const },
    { name: "Neha Gupta", phone: "+91 98765 43213", courseInterest: "Digital Marketing with AI", type: "course" as const, status: "follow_up" as const, source: "whatsapp" as const },
    { name: "Rajesh Kumar", phone: "+91 98765 43214", courseInterest: "Web Development & Data Science", type: "course" as const, status: "new" as const, source: "referral" as const },
    { name: "Sunita Devi", phone: "+91 98765 43215", courseInterest: "Blockchain Development Course", type: "course" as const, status: "converted" as const, source: "website" as const },
    { name: "Amarjit Singh", phone: "+91 98765 43216", type: "franchise" as const, status: "new" as const, source: "website" as const },
  ];
  for (const e of enquiryData) await db.insert(schema.enquiries).values(e);
  console.log(`  ${enquiryData.length} enquiries seeded`);

  console.log("Seeding exams...");
  const examData = [
    { courseId: 1, name: "Python Basics Quiz", description: "Test your understanding of Python fundamentals", maxMarks: 30, passingMarks: 12, duration: 30, examDate: "2025-02-10", status: "upcoming" as const },
    { courseId: 2, name: "Web & Database Assessment", description: "HTML, CSS, JS, PHP & MySQL fundamentals", maxMarks: 50, passingMarks: 20, duration: 45, examDate: "2025-02-15", status: "upcoming" as const },
    { courseId: 3, name: "Blockchain Concepts Exam", maxMarks: 100, passingMarks: 40, duration: 120, status: "completed" as const },
  ];
  for (const e of examData) await db.insert(schema.exams).values(e);
  console.log(`  ${examData.length} exams seeded`);

  console.log("Seeding testimonials...");
  const testimonialData = [
    { name: "Gurpreet Singh", course: "Python Programming Course", content: "Udaan24's Python course changed my career. I went from zero coding to building real projects in 6 months. Now working as a Junior Developer.", rating: 5 },
    { name: "Harpreet Kaur", course: "Web Development & Data Science", content: "Joined after graduation - best decision. Real-world web and data projects helped me crack 3 interviews. Highly recommended for Punjab students!", rating: 5 },
    { name: "Manjit Singh", course: "Digital Marketing with AI", content: "Learned SEO, paid ads and AI marketing tools hands-on. Trainers explain everything simply. Now running campaigns for local businesses as a freelancer.", rating: 5 },
  ];
  for (const t of testimonialData) await db.insert(schema.testimonials).values(t);
  console.log(`  ${testimonialData.length} testimonials seeded`);

  console.log("Seeding announcements...");
  await db.insert(schema.announcements).values([
    { title: "Admissions Open in Kotkapura", content: "New batches starting soon. Enroll now for Python Programming, Web Development & Data Science, Blockchain Development, and Digital Marketing with AI.", type: "admission" as const, isActive: true },
    { title: "Free Digital Marketing with AI Workshop this Saturday", content: "Hands-on workshop on SEO and AI marketing tools. Open to all enrolled students.", type: "general" as const, isActive: true },
  ]);
  console.log("  2 announcements seeded");

  console.log("Seeding settings...");
  const settingsData = [
    { key: "site_name", value: "Udaan24.com", group: "general" },
    { key: "site_tagline", value: "AI Coaching Institute Kotkapura", group: "general" },
    { key: "contact_phone", value: "+91 97808 43440", group: "contact" },
    { key: "contact_whatsapp", value: "+91 97808 43440", group: "contact" },
    { key: "contact_email", value: "info@udaan24.com", group: "contact" },
    { key: "contact_address", value: "Near Bus Stand, Kotkapura, Faridkot, Punjab 151204", group: "contact" },
    { key: "facebook", value: "https://facebook.com/udaan24", group: "social" },
    { key: "instagram", value: "https://instagram.com/udaan24", group: "social" },
    { key: "referral_enabled", value: "true", group: "referral" },
    { key: "referral_discount_percent", value: "5", group: "referral" },
    { key: "referral_commission_percent", value: "10", group: "referral" },
    { key: "referral_approval_type", value: "manual", group: "referral" },
    { key: "referral_min_payout", value: "100", group: "referral" },
    { key: "referral_payout_modes", value: "cash,upi,bank", group: "referral" },
    { key: "referral_cookie_days", value: "30", group: "referral" },
    { key: "referral_terms", value: "Refer friends to Udaan24. They get 5% off any course; you earn 10% commission credited to your wallet after their successful purchase. Payouts subject to admin approval.", group: "referral" },
  ];
  for (const s of settingsData) await db.insert(schema.settings).values(s);
  console.log(`  ${settingsData.length} settings seeded`);

  console.log("Seeding downloads...");
  const downloadData = [
    { title: "Admission Form 2025", type: "form" as const, fileUrl: "/downloads/admission-form.pdf", fileSize: "180 KB", isPublic: true },
    { title: "Course Prospectus", type: "prospectus" as const, fileUrl: "/downloads/prospectus.pdf", fileSize: "2.4 MB", isPublic: true },
    { title: "Fee Structure 2025", type: "fee_structure" as const, fileUrl: "/downloads/fee-structure.pdf", fileSize: "120 KB", isPublic: true },
    { title: "Centre Partner Brochure", type: "brochure" as const, fileUrl: "/downloads/franchise-brochure.pdf", fileSize: "1.1 MB", isPublic: true },
  ];
  for (const d of downloadData) await db.insert(schema.downloads).values(d);
  console.log(`  ${downloadData.length} downloads seeded`);

  console.log("Seeding exam questions...");
  const questionData = [
    { examId: 1, question: "Which keyword defines a function in Python?", optionA: "func", optionB: "def", optionC: "function", optionD: "lambda", correctAnswer: "b" as const, marks: 10 },
    { examId: 1, question: "Which data type is used to store key-value pairs in Python?", optionA: "list", optionB: "tuple", optionC: "dict", optionD: "set", correctAnswer: "c" as const, marks: 10 },
    { examId: 1, question: "Which library is commonly used for GUI apps in Python?", optionA: "Tkinter", optionB: "Flask", optionC: "NumPy", optionD: "Django", correctAnswer: "a" as const, marks: 10 },
  ];
  for (const q of questionData) await db.insert(schema.questions).values(q);
  console.log(`  ${questionData.length} questions seeded`);

  console.log("Seeding student detail records (for student #1)...");
  // Attendance — 20 days, ~18 present
  for (let d = 0; d < 20; d++) {
    await db.insert(schema.attendance).values({
      studentId: 1, courseId: 1,
      date: new Date(2025, 0, d + 1).toISOString().split("T")[0],
      status: d % 10 === 0 ? "absent" as const : "present" as const,
    });
  }
  // Exam attempt + result for student #1 on the completed exam (#3)
  await db.insert(schema.examAttempts).values({
    studentId: 1, examId: 3, answers: { "1": "a", "2": "b" },
    marksObtained: 78, totalMarks: 100, percentage: "78.00", grade: "B+", status: "pass" as const,
  });
  await db.insert(schema.results).values({
    studentId: 1, examId: 3, attemptId: 1,
    marksObtained: 78, totalMarks: 100, percentage: "78.00", grade: "B+", status: "pass" as const,
  });
  // Fee payment for student #1
  await db.insert(schema.feePayments).values({
    studentId: 1, courseId: 1, amount: "9000.00", paymentMethod: "upi" as const,
    transactionId: "TXN-UAN24-0001", receiptNumber: "RCPT-0001", status: "success" as const,
  });
  // Certificate for student #1 (and flag it on the student record for consistency)
  await db.insert(schema.certificates).values({
    studentId: 1, courseId: 1, serialNumber: "UAN24-CERT-0001",
    studentName: "Gurpreet Singh", courseName: "Python Programming Course",
    issueDate: "2025-01-31", status: "issued" as const,
  });
  await db.update(schema.students).set({ certificateIssued: true, certificateSerial: "UAN24-CERT-0001" }).where(eq(schema.students.id, 1));
  // Notifications for student #1
  await db.insert(schema.notifications).values([
    { studentId: 1, title: "Exam Result Published", message: "Your Blockchain Concepts Exam result is now available.", type: "exam" as const },
    { studentId: 1, title: "Fee Received", message: "We have received your fee payment of Rs. 9000.", type: "fee" as const },
  ]);
  console.log("  attendance, result, fee, certificate, notifications seeded for student #1");

  console.log("\nAll data seeded successfully!");
  await conn.end();
}

seed().catch(console.error);

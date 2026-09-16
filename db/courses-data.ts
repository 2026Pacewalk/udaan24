// ─── Udaan24 AI Institute — Master Curriculum course catalog ───
// Source: UDAAN24 Master_Curriculum.xls (Duration Matrix). One record per
// certificate/diploma programme. Prices are the programme fee in INR.

type Cat = "foundation" | "core_ai" | "advanced_ai" | "specialization" | "analytics" | "premium" | "short_term";

type Raw = {
  name: string;
  slug: string;
  category: Cat;
  duration: string;
  price: number | null;
  cert: string;
  eligibility: string;
  careers: string;
  img: string;
  modules: string[];
};

const U = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&h=520&q=80`;

const RAW: Raw[] = [
  {
    name: "Professional Digital Marketing with AI", slug: "professional-digital-marketing-with-ai",
    category: "premium", duration: "15 Months", price: 135000,
    cert: "Diploma / Certificate in Professional Digital Marketing",
    eligibility: "12th pass or equivalent; anyone aiming for a digital marketing career.",
    careers: "Digital Marketing Manager, SEO Specialist, Performance Marketer, Social Media Manager, Marketing Agency Owner, Freelancer",
    img: U("1460925895917-afdab827c52f"),
    modules: ["Website & Landing Page Development", "Advanced Search Engine Optimization (SEO)", "Performance Marketing & Paid Advertising", "Social Media Growth Strategy", "AI-Powered Marketing", "Video Production & Editing", "Marketing Automation & CRM", "Web Analytics & Data Intelligence", "Freelancing & Digital Entrepreneurship", "Industry-Oriented Live Projects", "Live Support & Career Readiness"],
  },
  {
    name: "Computer Foundation with AI", slug: "computer-foundation-with-ai",
    category: "foundation", duration: "3 Months", price: 27000,
    cert: "Diploma in Computer Applications",
    eligibility: "10th pass or basic reading/writing knowledge. Ideal for beginners.",
    careers: "Computer Operator, Data Entry Executive, Office Assistant, Digital Support Executive",
    img: U("1531482615713-2afd69097998"),
    modules: ["Typing & Keyboard Skills with AI Automation", "Computer Foundation with AI Automation", "Windows & File Management with AI Automation", "Internet, Email & Digital Literacy with AI Automation", "Digital Safety & Cyber Awareness with AI Automation"],
  },
  {
    name: "Office & Productivity with AI", slug: "office-productivity-with-ai",
    category: "foundation", duration: "3 Months", price: 27000,
    cert: "Diploma in Computer Applications",
    eligibility: "10th pass with basic computer knowledge.",
    careers: "Office Executive, Back-Office Assistant, MS Office Operator, Excel Data Analyst",
    img: U("1497032628192-86f99bcd76bc"),
    modules: ["MS Word with AI Automation", "MS Excel with AI Automation", "Advanced Excel & Data Analysis with AI Automation", "MS PowerPoint with AI Automation", "Office Automation with AI Automation", "Google Workspace with AI Automation"],
  },
  {
    name: "Professional Accounts & Business with AI", slug: "professional-accounts-business-with-ai",
    category: "specialization", duration: "6 Months", price: 54000,
    cert: "Diploma / Certificate in Professional Accountant",
    eligibility: "12th pass (commerce preferred), business owners, or office staff.",
    careers: "Accounts Assistant, Tally Operator, GST Executive, Billing Executive, Office Accountant",
    img: U("1554224155-6726b3ff858f"),
    modules: ["Accounting Fundamentals with AI Automation", "Tally Prime with AI Automation", "GST with AI Automation", "Inventory & Billing with AI Automation", "Advanced Accounting with AI Automation"],
  },
  {
    name: "Graphic Designing & Creative Technology with AI", slug: "graphic-designing-creative-technology-with-ai",
    category: "specialization", duration: "6 Months", price: 54000,
    cert: "Diploma / Certificate in Graphic Designing",
    eligibility: "10th/12th pass with an interest in design and creativity.",
    careers: "Graphic Designer, Creative Designer, Brand & Social Media Designer, Freelancer",
    img: U("1626785774573-4b799315345d"),
    modules: ["Canva with AI Automation", "Graphic Designing with AI Automation", "Photoshop with AI Automation", "CorelDRAW with AI Automation"],
  },
  {
    name: "Video Creation & Editing with AI", slug: "video-creation-editing-with-ai",
    category: "specialization", duration: "6 Months", price: 54000,
    cert: "Diploma / Certificate in Video Editing",
    eligibility: "10th/12th pass; anyone interested in video and content creation.",
    careers: "Video Editor, Content Creator, Motion Graphics Artist, YouTube/Reels Creator",
    img: U("1574717024653-61fd2cf4d44d"),
    modules: ["Video Creation with AI Automation", "Video Animation with AI Automation", "Video Editing with AI Automation"],
  },
  {
    name: "Web Development & Programming with AI", slug: "web-development-programming-with-ai",
    category: "specialization", duration: "6 Months", price: 54000,
    cert: "Diploma / Certificate in Programming & Web Development",
    eligibility: "10th/12th pass with logical aptitude.",
    careers: "Web Developer, Front-End Developer, Freelance Web Designer, Web Project Associate",
    img: U("1551288049-bebda4e38f71"),
    modules: ["HTML with AI Automation", "CSS with AI Automation", "JavaScript with AI Automation", "Web Designing with AI Automation", "Basic Web Development with AI Automation", "Website Project with AI Automation"],
  },
  {
    name: "Data, AI & Documentation with AI", slug: "data-ai-documentation-with-ai",
    category: "analytics", duration: "6 Months", price: 54000,
    cert: "Diploma / Certificate in Data Analysis & Management",
    eligibility: "12th pass; basic computer knowledge.",
    careers: "Data Analyst, MIS Executive, AI Tools Specialist, Documentation Executive",
    img: U("1526379095098-d400fd0bf935"),
    modules: ["Data Entry & Data Management with AI Automation", "Data Analysis with AI Automation", "Dashboard & MIS with AI Automation", "AI Tools & AI Productivity with AI Automation", "Digital Documentation with AI Automation"],
  },
  {
    name: "Digital Marketing with AI", slug: "digital-marketing-with-ai",
    category: "specialization", duration: "6 Months", price: 54000,
    cert: "Diploma / Certificate in Digital Marketing",
    eligibility: "12th pass, business owners, freelancers, and students.",
    careers: "Digital Marketer, SEO Executive, Social Media Manager, Freelancer",
    img: U("1611926653458-09294b3142bf"),
    modules: ["Digital Marketing with AI Automation", "SEO Fundamentals with AI Automation", "Social Media Management with AI Automation"],
  },
  {
    name: "Professional & Career Skills with AI", slug: "professional-career-skills-with-ai",
    category: "short_term", duration: "3 Months", price: 27000,
    cert: "Diploma / Certificate in Professional & Career Skills",
    eligibility: "10th/12th pass; job seekers and freshers.",
    careers: "Office Administrator, Front-Desk Executive, Job-Ready Professional",
    img: U("1521737604893-d14cc237f11d"),
    modules: ["Professional Communication with AI Automation", "Resume & CV Development with AI Automation", "Interview & Job Skills with AI Automation", "Office Administration with AI Automation"],
  },
  {
    name: "Projects & Portfolio with AI", slug: "projects-portfolio-with-ai",
    category: "short_term", duration: "3 Months", price: 27000,
    cert: "Diploma / Certificate in Projects & Portfolio",
    eligibility: "Learners who have completed foundation/specialization modules.",
    careers: "Freelancer, Project Associate, Portfolio-Ready Professional",
    img: U("1522071820081-009f0129c71c"),
    modules: ["Real Office Projects with AI Automation", "Freelancing Fundamentals with AI Automation", "Portfolio Development with AI Automation", "Final Capstone Project with AI Automation"],
  },
  {
    name: "C & C++ Programming with AI", slug: "c-cpp-programming-with-ai",
    category: "foundation", duration: "3 Months", price: 27000,
    cert: "Diploma / Certificate in C & C++ Language",
    eligibility: "10th/12th pass with logical aptitude; coding beginners.",
    careers: "Junior Programmer, Software Trainee, C/C++ Developer",
    img: U("1517180102446-f3ece451e9d8"),
    modules: ["C Programming with AI Automation", "C++ Programming with AI Automation"],
  },
  {
    name: "Java Programming with AI", slug: "java-programming-with-ai",
    category: "specialization", duration: "6 Months", price: 54000,
    cert: "Diploma / Certificate in Java Language",
    eligibility: "12th pass; basic programming logic helpful.",
    careers: "Java Developer, Backend Developer Trainee, Software Engineer",
    img: U("1555066931-4365d14bab8c"),
    modules: ["Java Programming with AI Automation"],
  },
  {
    name: "Python Programming with AI", slug: "python-programming-with-ai",
    category: "specialization", duration: "6 Months", price: 54000,
    cert: "Diploma / Certificate in Python Language",
    eligibility: "10th/12th pass; coding beginners welcome.",
    careers: "Python Developer, Automation Assistant, Data/AI Beginner, Freelancer",
    img: U("1526379095098-d400fd0bf935"),
    modules: ["Python Programming with AI Automation"],
  },
  {
    name: "JavaScript Programming with AI", slug: "javascript-programming-with-ai",
    category: "short_term", duration: "3 Months", price: 27000,
    cert: "Diploma / Certificate in JavaScript Language",
    eligibility: "10th/12th pass; basic HTML/CSS helpful.",
    careers: "Front-End Developer, Web Developer, JavaScript Programmer",
    img: U("1579468118864-1b9ea3c0db4a"),
    modules: ["JavaScript with AI Automation"],
  },
  {
    name: "PHP Programming with AI", slug: "php-programming-with-ai",
    category: "specialization", duration: "6 Months", price: 54000,
    cert: "Diploma / Certificate in PHP Language",
    eligibility: "12th pass; basic web knowledge helpful.",
    careers: "PHP Developer, Backend Developer, Full-Stack Trainee",
    img: U("1599507593499-a3f7d7d97667"),
    modules: ["PHP with AI Automation"],
  },
  {
    name: "C# Programming with AI", slug: "csharp-programming-with-ai",
    category: "short_term", duration: "3 Months", price: 27000,
    cert: "Diploma / Certificate in C# Language",
    eligibility: "10th/12th pass with logical aptitude.",
    careers: "C# Developer, .NET Trainee, Software Programmer",
    img: U("1517180102446-f3ece451e9d8"),
    modules: ["C# Programming with AI Automation"],
  },
  {
    name: "SQL & Database Programming with AI", slug: "sql-database-programming-with-ai",
    category: "specialization", duration: "6 Months", price: 54000,
    cert: "Diploma / Certificate in SQL Language",
    eligibility: "12th pass; basic computer knowledge.",
    careers: "Database Developer, SQL Analyst, Data Management Executive",
    img: U("1544383835-bda2bc66a55d"),
    modules: ["SQL & Database Programming with AI Automation"],
  },
  {
    name: "Architectural Design & Building Technology with AI", slug: "architectural-design-building-technology-with-ai",
    category: "premium", duration: "18 Months", price: 162000,
    cert: "Diploma / Certificate in Architectural Design & Building Technology",
    eligibility: "12th pass; suitable for aspiring architecture & design professionals.",
    careers: "Architectural Draughtsman, CAD/BIM Technician, Design Assistant, Interior Design Assistant",
    img: U("1487958449943-2429e8be8625"),
    modules: ["Architectural Fundamentals & Design Principles", "Architectural Drawing & Drafting", "AutoCAD for Architecture", "Building Planning & Space Planning", "Building Construction & Materials", "Structural & Services Awareness", "SketchUp for Architecture", "Revit Architecture & BIM", "3D Visualization, Rendering & Walkthrough", "Interior & Landscape Design Basics", "Quantity, Estimation & Project Documentation", "Professional Practice & Architecture Portfolio"],
  },
  {
    name: "Nanny / Caregiver Course with AI", slug: "nanny-caregiver-course-with-ai",
    category: "short_term", duration: "1 Year", price: null,
    cert: "Certificate in Live-In Caregiver / Nanny (with AI)",
    eligibility: "10th pass; homemakers, caregivers, and job seekers.",
    careers: "Professional Nanny, Childcare Assistant, Daycare Support Staff, Home Care Assistant",
    img: U("1503454537195-1dcabb73ffb9"),
    modules: ["Introduction to Nanny Profession", "Role & Responsibilities of a Nanny", "Professional Ethics & Conduct", "Child Safety & Protection", "Child Rights & Safeguarding", "Health, Hygiene & First Aid", "Activity Planning & Early Learning", "AI Tools for Childcare & Learning Support"],
  },
];

export const COURSES = RAW.map((r) => {
  const price = r.price != null ? String(r.price) : undefined;
  return {
    name: r.name,
    slug: r.slug,
    category: r.category,
    shortDescription: `Master ${r.name.replace(/ with AI$/, "")} through hands-on, AI-powered training — ${r.modules.length} practical module${r.modules.length > 1 ? "s" : ""} and an industry-recognized certificate.`,
    description: `The ${r.name} programme at Udaan24 AI Institute is a ${r.duration.toLowerCase()} ${r.cert.toLowerCase().includes("diploma") ? "diploma/certificate" : "certificate"} designed to make you job-ready. Every module is taught with modern AI tools and live, practical work — covering ${r.modules.slice(0, 3).join(", ")}${r.modules.length > 3 ? ", and more" : ""}. On successful completion you earn the ${r.cert}.`,
    highlights: r.modules.slice(0, 6).join("; "),
    syllabus: r.modules.join("; "),
    duration: r.duration,
    eligibility: r.eligibility,
    fee: price,
    onlineFee: price,
    offlineFee: price,
    certification: r.cert,
    careerOpportunities: r.careers,
    thumbnail: r.img,
    mode: "hybrid" as const,
    status: "active" as const,
    seoTitle: `${r.name} Course in Kotkapura | Udaan24 AI Institute`,
    seoDescription: `${r.name} at Udaan24 AI Institute, Kotkapura — ${r.duration}, AI-powered training with ${r.cert}. Online & offline.`,
    seoKeywords: `${r.name}, ${r.name} course, ${r.name} Kotkapura, Udaan24, AI institute Punjab`,
  };
});

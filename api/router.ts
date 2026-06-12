import { authRouter } from "./auth-router";
import { courseRouter } from "./routers/courses";
import { studentRouter } from "./routers/students";
import { centerRouter } from "./routers/centers";
import { enquiryRouter } from "./routers/enquiries";
import { blogRouter } from "./routers/blog";
import { dashboardRouter } from "./routers/dashboard";
import { examRouter } from "./routers/exams";
import { certificateRouter } from "./routers/certificates";
import { marksheetRouter } from "./routers/marksheets";
import { feeRouter } from "./routers/fees";
import { settingRouter } from "./routers/settings";
import { testimonialRouter } from "./routers/testimonials";
import { announcementRouter } from "./routers/announcements";
import { galleryRouter } from "./routers/gallery";
import { downloadRouter } from "./routers/downloads";
import { referralRouter } from "./routers/referrals";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  courses: courseRouter,
  students: studentRouter,
  centers: centerRouter,
  enquiries: enquiryRouter,
  blog: blogRouter,
  dashboard: dashboardRouter,
  exams: examRouter,
  certificates: certificateRouter,
  marksheets: marksheetRouter,
  fees: feeRouter,
  settings: settingRouter,
  testimonials: testimonialRouter,
  announcements: announcementRouter,
  gallery: galleryRouter,
  downloads: downloadRouter,
  referrals: referralRouter,
});

export type AppRouter = typeof appRouter;

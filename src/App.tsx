import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router'
import Home from './pages/Home'
import About from './pages/About'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import Register, { ReferralCapture } from './pages/Register'
import Admission from './pages/Admission'
import Certificate from './pages/Certificate'
import Marksheet from './pages/Marksheet'
import Verify from './pages/Verify'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'
import Blog from './pages/Blog'
import Franchise from './pages/Franchise'
import Downloads from './pages/Downloads'
import StudentPortal from './pages/StudentPortal'
import CentreDashboard from './pages/CentreDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

// Ensures every route change starts scrolled to the top of the page.
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Website */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:slug" element={<CourseDetail />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<Blog />} />
        <Route path="/franchise" element={<Franchise />} />
        <Route path="/downloads" element={<Downloads />} />

        {/* Registration + referral capture */}
        <Route path="/register" element={<Register />} />
        <Route path="/r/:code" element={<ReferralCapture />} />

        {/* Certificates, marksheets & public verification */}
        <Route path="/certificate/:id" element={<Certificate />} />
        <Route path="/marksheet/:id" element={<Marksheet />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/verify/:number" element={<Verify />} />

        {/* Admission 3-step form (logged-in student or shared centre link) */}
        <Route path="/admission" element={<Admission />} />
        <Route path="/admission/:token" element={<Admission />} />

        {/* Student Portal */}
        <Route path="/student/login" element={<StudentPortal />} />
        <Route path="/student/*" element={<StudentPortal />} />

        {/* Centre Dashboard */}
        <Route path="/centre/login" element={<CentreDashboard />} />
        <Route path="/centre/*" element={<CentreDashboard />} />

        {/* Admin CRM */}
        <Route path="/admin/*" element={<AdminDashboard />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

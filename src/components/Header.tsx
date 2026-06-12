import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X, ChevronDown, GraduationCap, BookOpen, Users, Phone, Building2, LayoutDashboard } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '/', icon: null },
  { label: 'AI Courses', href: '/courses', icon: BookOpen },
  { label: 'About', href: '/about', icon: GraduationCap },
  { label: 'Gallery', href: '/gallery', icon: null },
  { label: 'Blog', href: '/blog', icon: null },
  { label: 'Contact', href: '/contact', icon: Phone },
];

const portalLinks = [
  { label: 'Student Portal', href: '/student/login', icon: LayoutDashboard },
  { label: 'Study Centre', href: '/franchise', icon: Building2 },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[rgba(254,253,251,0.95)] backdrop-blur-[12px] shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="container-main flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-[#F5B800] flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-[#1B2A4A]" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-[20px] font-semibold leading-none text-[#1B2A4A]">Udaan24</span>
              <span className="font-mono-accent text-[9px] text-[#718096] tracking-widest uppercase">AI Coaching</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => link.label === 'Courses' && setCoursesDropdownOpen(true)}
                onMouseLeave={() => setCoursesDropdownOpen(false)}
              >
                <Link
                  to={link.href}
                  className={`px-4 py-2 text-[14px] font-medium transition-colors duration-200 flex items-center gap-1.5 ${
                    isActive(link.href)
                      ? 'text-[#1B2A4A] border-b-2 border-[#F5B800]'
                      : 'text-[#4A5568] hover:text-[#1B2A4A]'
                  }`}
                >
                  {link.label}
                  {link.label === 'Courses' && <ChevronDown className="w-3.5 h-3.5" />}
                </Link>

                {/* Courses Mega Dropdown */}
                {link.label === 'Courses' && coursesDropdownOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
                    <div className="bg-white rounded-xl shadow-[0_12px_48px_rgba(27,42,74,0.12)] p-6 w-[500px] grid grid-cols-2 gap-4">
                      {['Python for AI & ML', 'Machine Learning Masterclass', 'Deep Learning & Neural Networks', 'Data Science with Python', 'Natural Language Processing', 'AI Prompt Engineering', 'Data Analytics & Visualization', 'AI Tools & Automation'].map((c, i) => (
                        <Link
                          key={i}
                          to="/courses"
                          className="block p-3 rounded-lg hover:bg-[#FFF9E6] transition-colors duration-150"
                        >
                          <div className="text-[14px] font-medium text-[#1B2A4A]">{c}</div>
                          <div className="text-[11px] text-[#718096] mt-0.5">2-6 months</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            {portalLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="px-4 py-2 text-[13px] font-medium text-[#4A5568] hover:text-[#1B2A4A] transition-colors duration-200 flex items-center gap-1.5"
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </Link>
            ))}
            <Link
              to="/contact"
              className="btn-primary text-[13px] py-2.5 px-6"
            >
              Apply Now
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-[#1B2A4A]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-[rgba(27,42,74,0.95)] lg:hidden">
          <div className="flex flex-col h-full p-8">
            <div className="flex justify-end mb-8">
              <button onClick={() => setMobileMenuOpen(false)} className="text-white">
                <X className="w-8 h-8" />
              </button>
            </div>
            <nav className="flex-1 flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-white text-[24px] font-medium font-display"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-white/20 pt-6 mt-4">
                {portalLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="flex items-center gap-3 text-white/70 text-[16px] py-3"
                  >
                    {link.icon && <link.icon className="w-5 h-5" />}
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>
            <Link to="/contact" className="btn-primary text-center text-[16px] py-4">
              Apply Now
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

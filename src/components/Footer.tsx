import { Link } from 'react-router';
import { GraduationCap, Facebook, Instagram, Linkedin, Youtube, Twitter, ArrowUp, MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { trpc } from '@/providers/trpc';

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'AI Courses', href: '/courses' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Student Portal', href: '/student/login' },
  { label: 'Study Centre', href: '/franchise' },
];

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Twitter, href: '#', label: 'Twitter' },
];

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const { data: coursesData } = trpc.courses.list.useQuery({ status: 'active' });
  const courseLinks = (coursesData || []).slice(0, 6).map((c: any) => ({ label: c.name, href: `/courses/${c.slug}` }));

  return (
    <footer className="bg-[#1B2A4A] text-white">
      {/* Main Footer */}
      <div className="container-main py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-lg bg-[#F5B800] flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-[#1B2A4A]" />
              </div>
              <span className="font-display text-[20px] font-semibold">Udaan24</span>
            </Link>
            <p className="text-[14px] text-white/60 leading-relaxed mb-6">
              Leading AI Coaching Institute in Kotkapura, Punjab. Master Artificial Intelligence, Machine Learning, and Data Science with hands-on training and industry-recognized certification.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-all duration-200"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-body text-[14px] font-semibold text-white/90 uppercase tracking-wider mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-[14px] text-white/50 hover:text-[#F5B800] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Courses */}
          <div>
            <h4 className="font-body text-[14px] font-semibold text-white/90 uppercase tracking-wider mb-5">
              Popular Courses
            </h4>
            <ul className="space-y-3">
              {courseLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-[14px] text-white/50 hover:text-[#F5B800] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-body text-[14px] font-semibold text-white/90 uppercase tracking-wider mb-5">
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#F5B800] mt-1 flex-shrink-0" />
                <span className="text-[14px] text-white/50">
                  Near Bus Stand, Kotkapura<br />
                  Faridkot, Punjab 151204
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#F5B800] flex-shrink-0" />
                <span className="text-[14px] text-white/50">+91 97808 43440</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#F5B800] flex-shrink-0" />
                <span className="text-[14px] text-white/50">info@udaan24.com</span>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-[#F5B800] flex-shrink-0" />
                <span className="text-[14px] text-white/50">WhatsApp: +91 97808 43440</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Accreditation Strip */}
      <div className="border-t border-white/10">
        <div className="container-main py-6">
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
            <span className="font-mono-accent text-[11px] text-white uppercase tracking-widest">AI Coaching Kotkapura</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="font-mono-accent text-[11px] text-white uppercase tracking-widest">AI Institute Punjab</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="font-mono-accent text-[11px] text-white uppercase tracking-widest">ML & Data Science</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="font-mono-accent text-[11px] text-white uppercase tracking-widest">Certified AI Training</span>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/10">
        <div className="container-main py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-white/40">
            &copy; {new Date().getFullYear()} Udaan24.com - AI Coaching Institute Kotkapura. All rights reserved.
            <span className="mx-2 text-white/20">|</span>
            Designed &amp; Developed by{' '}
            <a href="https://pacewalk.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-[#F5B800] font-medium transition-colors">
              PACEWALK
            </a>
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-[13px] text-white/40 hover:text-white/70 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-[13px] text-white/40 hover:text-white/70 transition-colors">
              Terms of Use
            </Link>
            <button
              onClick={scrollToTop}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-all duration-200"
              aria-label="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

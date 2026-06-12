import { useState } from 'react';
import { Link } from 'react-router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { trpc } from '@/providers/trpc';
import { Monitor, Globe, TrendingUp, Code, BarChart3, Cpu, Clock, CheckCircle, Search, Loader2 } from 'lucide-react';

// DB course row → display shape used by this page.
interface Course {
  id: number;
  icon: React.ElementType;
  name: string;
  slug: string;
  category: string;
  duration: string;
  eligibility: string;
  description: string;
  shortDescription: string;
  fee: string;
  onlineFee: string;
  offlineFee: string;
  thumbnail: string;
  certification: string;
  mode: string;
  syllabus: string[];
  highlights: string[];
  career: string[];
}

const CATEGORY_LABELS: Record<string, string> = {
  foundation: 'Foundation', core_ai: 'Core AI', advanced_ai: 'Advanced AI',
  specialization: 'Specialization', analytics: 'Analytics', premium: 'Premium', short_term: 'Short Term',
};
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  foundation: Code, core_ai: Cpu, advanced_ai: Cpu, specialization: Globe,
  analytics: BarChart3, premium: Cpu, short_term: TrendingUp,
};

const splitList = (s: string | null | undefined): string[] =>
  (s || '').split(/[;,]/).map((x) => x.trim()).filter(Boolean);
const formatFee = (fee: string | null | undefined): string =>
  fee ? `₹${Number(fee).toLocaleString('en-IN')}` : 'Contact us';

function mapCourse(c: any): Course {
  return {
    id: c.id,
    icon: CATEGORY_ICONS[c.category] || Monitor,
    name: c.name,
    slug: c.slug,
    category: c.category,
    duration: c.duration || '-',
    eligibility: c.eligibility || 'Open to all',
    description: c.description || '',
    shortDescription: c.shortDescription || c.description || '',
    fee: formatFee(c.offlineFee || c.fee),
    onlineFee: formatFee(c.onlineFee),
    offlineFee: formatFee(c.offlineFee || c.fee),
    thumbnail: c.thumbnail || '',
    certification: c.certification || 'Udaan24 Certificate',
    mode: c.mode ? c.mode.charAt(0).toUpperCase() + c.mode.slice(1) : 'Offline/Online',
    syllabus: splitList(c.syllabus),
    highlights: splitList(c.highlights),
    career: splitList(c.careerOpportunities),
  };
}

export default function Courses() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const { data, isLoading } = trpc.courses.list.useQuery();
  const allCourses: Course[] = (data || []).map(mapCourse);

  const categories = [
    { label: 'All', value: 'all' },
    ...Array.from(new Set(allCourses.map((c) => c.category))).map((value) => ({
      label: CATEGORY_LABELS[value] || value,
      value,
    })),
  ];

  const filtered = allCourses.filter((c) => {
    const matchCategory = activeCategory === 'all' || c.category === activeCategory;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#FEFDFB]">
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-[100px] pb-10 bg-[#1B2A4A]">
          <div className="container-main">
            <div className="text-center mb-10">
              <h1 className="font-display text-[36px] md:text-[48px] font-semibold text-white mb-4">
                Courses at Udaan24
              </h1>
              <p className="text-[16px] text-white/70 max-w-[520px] mx-auto">
                Industry-ready training in Programming, Web Development, Data Science, Blockchain and AI-powered Digital Marketing at Kotkapura.
              </p>
            </div>

            {/* Search */}
            <div className="flex flex-col sm:flex-row items-center gap-4 max-w-[700px] mx-auto">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718096]" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 text-[14px] focus:outline-none focus:border-[#F5B800]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Category Pills */}
        <div className="py-6 bg-white border-b border-[#E8EDF5]">
          <div className="container-main">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-6 py-2.5 rounded-full text-[13px] font-medium transition-all duration-200 ${
                    activeCategory === cat.value
                      ? 'bg-[#F5B800] text-[#1B2A4A]'
                      : 'bg-transparent border border-[#E8EDF5] text-[#4A5568] hover:border-[#1B2A4A]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <section className="section-padding">
          <div className="container-main">
            {isLoading ? (
              <div className="text-center py-20"><Loader2 className="w-8 h-8 text-[#F5B800] animate-spin mx-auto" /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white border border-[#E8EDF5] rounded-xl overflow-hidden group hover:shadow-[0_8px_32px_rgba(27,42,74,0.1)] hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="h-[180px] bg-gradient-to-br from-[#1B2A4A] to-[#2A3F5F] flex items-center justify-center relative overflow-hidden">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <course.icon className="w-16 h-16 text-white/20" />
                      )}
                      <span className="absolute top-4 left-4 status-badge-yellow text-[11px]">
                        {CATEGORY_LABELS[course.category] || course.category}
                      </span>
                    </div>
                    <div className="p-6">
                      <Link to={`/courses/${course.slug}`} className="block font-body text-[18px] font-semibold text-[#1B2A4A] mb-2 group-hover:text-[#F5B800] transition-colors">
                        {course.name}
                      </Link>
                      <div className="flex items-center gap-3 text-[12px] text-[#718096] mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {course.duration}
                        </span>
                        <span>{course.eligibility}</span>
                      </div>
                      <p className="text-[13px] text-[#4A5568] leading-relaxed mb-4 line-clamp-2">
                        {course.shortDescription}
                      </p>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-[#FFF9E6] rounded-lg px-3 py-2">
                          <div className="text-[10px] uppercase tracking-wide text-[#718096]">Offline</div>
                          <div className="font-display text-[16px] font-semibold text-[#1B2A4A]">{course.offlineFee}</div>
                        </div>
                        <div className="bg-[#F0F5FF] rounded-lg px-3 py-2">
                          <div className="text-[10px] uppercase tracking-wide text-[#718096]">Online</div>
                          <div className="font-display text-[16px] font-semibold text-[#1B2A4A]">{course.onlineFee}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/courses/${course.slug}`}
                          className="flex-1 text-center border border-[#1B2A4A] text-[#1B2A4A] text-[12px] font-semibold px-4 py-2.5 rounded-full hover:bg-[#1B2A4A] hover:text-white transition-colors"
                        >
                          View Details
                        </Link>
                        <Link
                          to="/contact"
                          className="flex-1 text-center bg-[#F5B800] text-[#1B2A4A] text-[12px] font-semibold px-4 py-2.5 rounded-full hover:bg-[#E0A800] transition-colors"
                        >
                          Apply Now
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-[16px] text-[#718096]">No courses found matching your criteria.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => setSelectedCourse(null)}>
          <div className="absolute inset-0 bg-[rgba(27,42,74,0.5)]" />
          <div className="relative bg-white rounded-2xl shadow-[0_24px_64px_rgba(27,42,74,0.2)] w-full max-w-[600px] max-h-[85vh] overflow-y-auto z-10" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#1B2A4A] flex items-center justify-center">
                    <selectedCourse.icon className="w-7 h-7 text-[#F5B800]" />
                  </div>
                  <div>
                    <h3 className="font-display text-[22px] font-semibold text-[#1B2A4A]">{selectedCourse.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="status-badge-yellow text-[11px]">{CATEGORY_LABELS[selectedCourse.category] || selectedCourse.category}</span>
                      <span className="flex items-center gap-1 text-[12px] text-[#718096]"><Clock className="w-3 h-3" />{selectedCourse.duration}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedCourse(null)} className="w-10 h-10 rounded-full border border-[#E8EDF5] flex items-center justify-center hover:bg-[#E8EDF5]">
                  <span className="text-[#718096]">X</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#FFF9E6] rounded-lg p-4">
                  <div className="label-meta mb-1">Fee</div>
                  <div className="font-display text-[22px] font-semibold text-[#1B2A4A]">{selectedCourse.fee}</div>
                </div>
                <div className="bg-[#F0F5FF] rounded-lg p-4">
                  <div className="label-meta mb-1">Eligibility</div>
                  <div className="text-[14px] font-medium text-[#1B2A4A]">{selectedCourse.eligibility}</div>
                </div>
                <div className="bg-[#F0FFF4] rounded-lg p-4">
                  <div className="label-meta mb-1">Mode</div>
                  <div className="text-[14px] font-medium text-[#1B2A4A]">{selectedCourse.mode}</div>
                </div>
                <div className="bg-[#FFF5F5] rounded-lg p-4">
                  <div className="label-meta mb-1">Certification</div>
                  <div className="text-[14px] font-medium text-[#1B2A4A]">{selectedCourse.certification}</div>
                </div>
              </div>

              {selectedCourse.syllabus.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-body text-[14px] font-semibold text-[#1B2A4A] mb-3">Syllabus</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedCourse.syllabus.map((topic) => (
                      <li key={topic} className="flex items-center gap-2 text-[13px] text-[#4A5568]">
                        <CheckCircle className="w-3.5 h-3.5 text-[#22C55E] flex-shrink-0" />{topic}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedCourse.career.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-body text-[14px] font-semibold text-[#1B2A4A] mb-3">Career Opportunities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCourse.career.map((role) => (
                      <span key={role} className="status-badge-blue text-[11px]">{role}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Link to="/contact" className="btn-primary flex-1 text-center py-3.5">Apply Now</Link>
                <button className="btn-secondary flex-1 py-3.5">Download Brochure</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

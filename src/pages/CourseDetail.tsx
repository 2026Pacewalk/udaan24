import { useEffect } from 'react';
import { useParams, Link } from 'react-router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { trpc } from '@/providers/trpc';
import { Clock, CheckCircle, Loader2, ArrowLeft, GraduationCap } from 'lucide-react';

const splitList = (s?: string | null) => (s || '').split(/[;,]/).map((x) => x.trim()).filter(Boolean);
const formatFee = (fee?: string | null) => (fee ? `₹${Number(fee).toLocaleString('en-IN')}` : 'Contact us');

export default function CourseDetail() {
  const { slug } = useParams();
  const { data: course, isLoading } = trpc.courses.bySlug.useQuery({ slug: slug || '' }, { enabled: !!slug });

  // Dynamic SEO from the course record.
  useEffect(() => {
    if (course) {
      document.title = course.seoTitle || `${course.name} | Udaan24.com`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta && (course.seoDescription || course.description)) {
        meta.setAttribute('content', (course.seoDescription || course.description)!);
      }
    }
  }, [course]);

  return (
    <div className="min-h-screen bg-[#FEFDFB]">
      <Header />
      <main>
        {isLoading ? (
          <div className="pt-[140px] pb-20 text-center"><Loader2 className="w-8 h-8 text-[#F5B800] animate-spin mx-auto" /></div>
        ) : !course ? (
          <div className="pt-[140px] pb-20 text-center">
            <p className="text-[16px] text-[#718096] mb-4">Course not found.</p>
            <Link to="/courses" className="btn-primary inline-flex items-center gap-2"><ArrowLeft className="w-4 h-4" />Back to Courses</Link>
          </div>
        ) : (
          <>
            <section className="pt-[100px] pb-12 bg-[#1B2A4A]">
              <div className="container-main">
                <Link to="/courses" className="inline-flex items-center gap-2 text-[13px] text-white/60 hover:text-white mb-6"><ArrowLeft className="w-4 h-4" />All Courses</Link>
                <span className="font-mono-accent text-[12px] tracking-[0.1em] text-[#F5B800] uppercase mb-3 block capitalize">{(course.category || '').replace('_', ' ')}</span>
                <h1 className="font-display text-[34px] md:text-[46px] font-semibold text-white leading-[1.1] tracking-[-1px] mb-4">{course.name}</h1>
                <p className="text-[15px] text-white/70 max-w-[640px] mb-6">{course.shortDescription || course.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-white/80 text-[13px]">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#F5B800]" />{course.duration}</span>
                  <span className="capitalize">{course.mode}</span>
                  <span className="bg-white/10 rounded-full px-4 py-1.5"><span className="text-white/60">Offline</span> <span className="font-display text-[18px] font-semibold text-[#F5B800]">{formatFee(course.offlineFee || course.fee)}</span></span>
                  <span className="bg-white/10 rounded-full px-4 py-1.5"><span className="text-white/60">Online</span> <span className="font-display text-[18px] font-semibold text-[#F5B800]">{formatFee(course.onlineFee)}</span></span>
                </div>
              </div>
            </section>

            <section className="section-padding">
              <div className="container-main grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {course.thumbnail && <img src={course.thumbnail} alt={course.name} className="rounded-2xl w-full object-cover max-h-[320px]" />}
                  {course.description && (
                    <div>
                      <h2 className="font-display text-[24px] font-semibold text-[#1B2A4A] mb-4">About the Course</h2>
                      <p className="text-[15px] text-[#4A5568] leading-relaxed whitespace-pre-line">{course.description}</p>
                    </div>
                  )}
                  {splitList(course.highlights).length > 0 && (
                    <div>
                      <h2 className="font-display text-[24px] font-semibold text-[#1B2A4A] mb-4">Course Highlights</h2>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {splitList(course.highlights).map((t) => (
                          <li key={t} className="flex items-center gap-2 text-[14px] text-[#4A5568]"><CheckCircle className="w-4 h-4 text-[#F5B800] flex-shrink-0" />{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {splitList(course.syllabus).length > 0 && (
                    <div>
                      <h2 className="font-display text-[24px] font-semibold text-[#1B2A4A] mb-4">What You Will Learn</h2>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {splitList(course.syllabus).map((t) => (
                          <li key={t} className="flex items-center gap-2 text-[14px] text-[#4A5568]"><CheckCircle className="w-4 h-4 text-[#22C55E] flex-shrink-0" />{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {splitList(course.careerOpportunities).length > 0 && (
                    <div>
                      <h2 className="font-display text-[24px] font-semibold text-[#1B2A4A] mb-4">Career Opportunities</h2>
                      <div className="flex flex-wrap gap-2">
                        {splitList(course.careerOpportunities).map((r) => <span key={r} className="status-badge-blue text-[12px]">{r}</span>)}
                      </div>
                    </div>
                  )}
                </div>
                <aside className="space-y-4">
                  <div className="bg-white border border-[#E8EDF5] rounded-2xl p-6">
                    <div className="w-12 h-12 rounded-xl bg-[#FFF9E6] flex items-center justify-center mb-4"><GraduationCap className="w-6 h-6 text-[#F5B800]" /></div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-[#FFF9E6] rounded-lg px-3 py-2.5">
                        <div className="text-[11px] uppercase tracking-wide text-[#718096]">Offline Fee</div>
                        <div className="font-display text-[18px] font-semibold text-[#1B2A4A]">{formatFee(course.offlineFee || course.fee)}</div>
                      </div>
                      <div className="bg-[#F0F5FF] rounded-lg px-3 py-2.5">
                        <div className="text-[11px] uppercase tracking-wide text-[#718096]">Online Fee</div>
                        <div className="font-display text-[18px] font-semibold text-[#1B2A4A]">{formatFee(course.onlineFee)}</div>
                      </div>
                    </div>
                    <dl className="space-y-3 text-[14px]">
                      <div className="flex justify-between"><dt className="text-[#718096]">Duration</dt><dd className="text-[#1B2A4A]">{course.duration}</dd></div>
                      <div className="flex justify-between"><dt className="text-[#718096]">Mode</dt><dd className="text-[#1B2A4A] capitalize">{course.mode}</dd></div>
                      <div className="flex justify-between"><dt className="text-[#718096]">Eligibility</dt><dd className="text-[#1B2A4A] text-right">{course.eligibility || 'Open to all'}</dd></div>
                      <div className="flex justify-between"><dt className="text-[#718096]">Certificate</dt><dd className="text-[#1B2A4A] text-right">{course.certification || 'Udaan24 Certificate'}</dd></div>
                    </dl>
                    <Link to="/contact" className="btn-primary w-full text-center mt-5 py-3 block">Apply Now</Link>
                    <Link to="/student" className="btn-secondary w-full text-center mt-3 py-3 block">Buy Course</Link>
                  </div>
                </aside>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

import { Link } from 'react-router';
import { trpc } from '@/providers/trpc';
import { Brain, Database, BarChart3, Code, Cpu, Globe, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';

interface Course {
  icon: React.ElementType;
  name: string;
  slug: string;
  duration: string;
  description: string;
  shortDescription: string;
  category: string;
  thumbnail: string;
  fee: string;
  onlineFee: string;
  offlineFee: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  foundation: 'Foundation', core_ai: 'Core AI', advanced_ai: 'Advanced AI',
  specialization: 'Specialization', analytics: 'Analytics', premium: 'Premium', short_term: 'Short Term',
};
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  foundation: Code, core_ai: Brain, advanced_ai: Cpu, specialization: Globe,
  analytics: BarChart3, premium: Cpu, short_term: TrendingUp,
};
const formatFee = (fee: string | null | undefined): string =>
  fee ? `₹${Number(fee).toLocaleString('en-IN')}` : 'Contact us';

function mapCourse(c: any): Course {
  return {
    icon: CATEGORY_ICONS[c.category] || Database,
    name: c.name,
    slug: c.slug,
    duration: c.duration || '-',
    description: c.description || '',
    shortDescription: c.shortDescription || c.description || '',
    category: CATEGORY_LABELS[c.category] || c.category,
    thumbnail: c.thumbnail || '',
    fee: formatFee(c.offlineFee || c.fee),
    onlineFee: formatFee(c.onlineFee),
    offlineFee: formatFee(c.offlineFee || c.fee),
  };
}

export default function CoursesSection() {
  const { data, isLoading } = trpc.courses.list.useQuery();
  const courses: Course[] = (data || []).map(mapCourse);

  return (
    <section className="section-padding bg-white">
      <div className="container-main">
        <div className="text-center mb-14">
          <span className="label-meta mb-3 block">Our Courses</span>
          <h2 className="font-display text-[36px] md:text-[42px] font-semibold text-[#1B2A4A] tracking-[-1.2px]">
            Courses Designed for Careers
          </h2>
        </div>

        {isLoading ? (
          <div className="text-center py-12"><Loader2 className="w-8 h-8 text-[#F5B800] animate-spin mx-auto" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <Link
                to={`/courses/${course.slug}`}
                key={course.slug}
                className="bg-[#1B2A4A] rounded-xl overflow-hidden group transition-all duration-300 hover:shadow-[0_12px_40px_rgba(27,42,74,0.2)] hover:-translate-y-1 flex flex-col"
              >
                <div className="h-[140px] bg-gradient-to-br from-[#1B2A4A] to-[#2A3F5F] relative overflow-hidden flex items-center justify-center">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <course.icon className="w-12 h-12 text-white/30" />
                  )}
                  <span className="absolute top-3 right-3 font-mono-accent text-[10px] bg-[#F5B800] text-[#1B2A4A] px-3 py-1 rounded-full font-medium">
                    {course.duration}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-body text-[16px] font-semibold text-white mb-2 leading-tight">
                    {course.name}
                  </h3>
                  <p className="text-[13px] text-white/60 leading-relaxed mb-4 line-clamp-2">
                    {course.shortDescription}
                  </p>
                  <div className="mt-auto flex items-end justify-between">
                    <div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wide">Starts at</div>
                      <div className="font-display text-[18px] font-semibold text-[#F5B800]">{course.onlineFee}</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-[#F5B800] group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link to="/courses" className="btn-primary inline-flex items-center gap-2">
            View All Courses
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

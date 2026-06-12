import { Link } from 'react-router';
import { Calendar, ArrowRight, Tag } from 'lucide-react';

interface BlogPost {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  image: string;
  slug: string;
}

const posts: BlogPost[] = [
  {
    title: 'New Deep Learning Batch Starting February 2025 in Kotkapura',
    excerpt: 'Udaan24 launches a comprehensive Deep Learning course with TensorFlow and real-world neural network projects at our Kotkapura centre.',
    category: 'Announcement',
    date: 'Jan 15, 2025',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop',
    slug: 'deep-learning-batch-kotkapura',
  },
  {
    title: 'How to Build a Career in Artificial Intelligence',
    excerpt: 'A complete roadmap for aspiring AI professionals including skills, tools, salary expectations, and job preparation strategies for Punjab.',
    category: 'Career Guide',
    date: 'Jan 10, 2025',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop',
    slug: 'ai-career-roadmap',
  },
  {
    title: 'Udaan24 Students Placed at AI Companies',
    excerpt: 'Over 50 AI students from our recent batch have been successfully placed at leading technology companies across India.',
    category: 'Placement',
    date: 'Jan 5, 2025',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=250&fit=crop',
    slug: 'udaan24-ai-placements',
  },
];

export default function NewsSection() {
  return (
    <section className="section-padding bg-[#FEFDFB]">
      <div className="container-main">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-4">
          <div>
            <span className="label-meta mb-3 block">News & Updates</span>
            <h2 className="font-display text-[36px] md:text-[42px] font-semibold text-[#1B2A4A] tracking-[-1.2px]">
              AI Coaching Updates
            </h2>
          </div>
          <Link to="/blog" className="flex items-center gap-2 text-[14px] font-medium text-[#1B2A4A] hover:text-[#F5B800] transition-colors">
            View All Articles
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group bg-white rounded-xl border border-[#E8EDF5] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_rgba(27,42,74,0.08)] hover:-translate-y-1"
            >
              <div className="overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-[200px] object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="status-badge-yellow text-[11px] flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-[12px] text-[#718096]">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </span>
                </div>
                <h3 className="font-body text-[17px] font-semibold text-[#1B2A4A] mb-2 leading-tight group-hover:text-[#F5B800] transition-colors">
                  {post.title}
                </h3>
                <p className="text-[13px] text-[#4A5568] leading-relaxed mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <Link
                  to={`/blog/${post.slug}`}
                  className="flex items-center gap-1.5 text-[13px] font-medium text-[#1B2A4A] hover:text-[#F5B800] transition-colors"
                >
                  Read More
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

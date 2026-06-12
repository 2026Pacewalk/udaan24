import { useState } from 'react';
import { Link, useParams } from 'react-router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { Calendar, User, Tag, ArrowLeft, ArrowRight, Search } from 'lucide-react';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  date: string;
  image: string;
}

const blogPosts: BlogPost[] = [
  {
    slug: 'ai-ml-course-launch',
    title: 'Deep Learning Batch Starting Feb 2025 in Kotkapura',
    excerpt: 'Udaan24 launches a comprehensive Deep Learning course with TensorFlow and real-world neural network projects at our Kotkapura centre.',
    content: 'Artificial Intelligence and Machine Learning are transforming industries across the globe. Our new comprehensive course covers everything from Python basics to advanced deep learning concepts. Students will work on real-world projects including natural language processing, computer vision, and predictive analytics. The course is designed by industry experts with years of experience in AI development.',
    category: 'Announcement',
    tags: ['AI', 'Machine Learning', 'New Course'],
    author: 'Dr. Rajesh Kumar',
    date: 'January 15, 2025',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop',
  },
  {
    slug: 'web-development-career',
    title: 'How to Build a Career in Artificial Intelligence',
    excerpt: 'A complete roadmap for aspiring AI professionals including skills, tools, salary expectations, and job preparation strategies for Punjab.',
    content: 'Web development continues to be one of the most in-demand skills in the tech industry. This comprehensive guide covers the essential skills you need including HTML5, CSS3, JavaScript, React, and Node.js. We also discuss soft skills, portfolio building, interview preparation, and how to land your first job as a web developer.',
    category: 'Career Guide',
    tags: ['Web Development', 'Career', 'Programming'],
    author: 'Priya Sharma',
    date: 'January 10, 2025',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop',
  },
  {
    slug: 'placement-success',
    title: 'Udaan24 Students Placed at AI Companies',
    excerpt: 'Over 50 AI students from our recent batch have been successfully placed at leading technology companies across India.',
    content: 'We are proud to announce that over 200 students from our recent batch have been placed at leading technology companies including TCS, Infosys, Wipro, and Cognizant. Our dedicated placement cell works tirelessly to connect students with the right opportunities. The average package offered was 4.5 LPA with the highest being 12 LPA.',
    category: 'Placement',
    tags: ['Placement', 'Jobs', 'Success Story'],
    author: 'Career Team',
    date: 'January 5, 2025',
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=450&fit=crop',
  },
  {
    slug: 'tally-gst-importance',
    title: 'Why Every Accountant Should Learn Tally with GST',
    excerpt: 'Understanding GST compliance is essential for modern accounting professionals.',
    content: 'With the implementation of GST in India, every business needs professionals who understand GST compliance. Tally Prime with GST is the most widely used accounting software in India. This article explores why learning Tally with GST is crucial for accounting professionals and how it can boost your career prospects.',
    category: 'Education',
    tags: ['Tally', 'GST', 'Accounting'],
    author: 'CA Anjali Patel',
    date: 'December 28, 2024',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=450&fit=crop',
  },
  {
    slug: 'graphic-design-trends',
    title: 'Top Graphic Design Trends for 2025',
    excerpt: 'Stay ahead of the curve with these emerging design trends.',
    content: 'The AI industry in India is booming in 2025. From generative AI to autonomous systems, we explore the trends shaping AI careers and how Udaan24 courses in Kotkapura prepare students for the AI job market.',
    category: 'Design',
    tags: ['Graphic Design', 'Trends', '2025'],
    author: 'Rahul Verma',
    date: 'December 20, 2024',
    image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=450&fit=crop',
  },
  {
    slug: 'digital-marketing-guide',
    title: 'The Complete Guide to Digital Marketing in India',
    excerpt: 'Everything you need to know about starting a career in digital marketing.',
    content: 'Data Science is one of the most in-demand careers in India. This guide covers the skills needed, job roles, salary expectations in Punjab, and how Udaan24 Data Science course with Python can help you build a successful AI career from Kotkapura.',
    category: 'Career Guide',
    tags: ['Digital Marketing', 'Career', 'SEO'],
    author: 'Sneha Reddy',
    date: 'December 15, 2024',
    image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=450&fit=crop',
  },
];

const categories = ['All', 'Announcement', 'Career Guide', 'Placement', 'Education', 'AI Trends'];

export default function Blog() {
  const { slug } = useParams<{ slug: string }>();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const post = slug ? blogPosts.find((p) => p.slug === slug) : null;

  const filtered = blogPosts.filter((p) => {
    const matchCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch && p.slug !== slug;
  });

  if (post) {
    return (
      <div className="min-h-screen bg-[#FEFDFB]">
        <Header />
        <main>
          <article>
            {/* Hero Image */}
            <div className="pt-[72px]">
              <img src={post.image} alt={post.title} className="w-full h-[400px] object-cover" />
            </div>

            <div className="container-main py-12">
              <div className="max-w-[800px] mx-auto">
                <Link to="/blog" className="flex items-center gap-2 text-[14px] text-[#718096] hover:text-[#F5B800] transition-colors mb-6">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Blog
                </Link>

                <span className="status-badge-yellow text-[11px] mb-4 inline-block">{post.category}</span>
                <h1 className="font-display text-[32px] md:text-[42px] font-semibold text-[#1B2A4A] leading-tight tracking-[-1px] mb-6">
                  {post.title}
                </h1>

                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-[#E8EDF5]">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#718096]" />
                    <span className="text-[14px] text-[#4A5568]">{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#718096]" />
                    <span className="text-[14px] text-[#4A5568]">{post.date}</span>
                  </div>
                </div>

                <p className="text-[16px] text-[#4A5568] leading-relaxed mb-6">
                  {post.excerpt}
                </p>

                <div className="text-[16px] text-[#4A5568] leading-relaxed mb-8">
                  {post.content}
                </div>

                <div className="flex items-center gap-2 mb-10">
                  {post.tags.map((tag) => (
                    <span key={tag} className="status-badge-blue text-[11px] flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Related Posts */}
                <div>
                  <h3 className="font-display text-[22px] font-semibold text-[#1B2A4A] mb-6">Related Articles</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {filtered.slice(0, 2).map((rp) => (
                      <Link key={rp.slug} to={`/blog/${rp.slug}`} className="group">
                        <img src={rp.image} alt={rp.title} className="w-full h-[160px] object-cover rounded-xl mb-3" />
                        <h4 className="font-body text-[15px] font-semibold text-[#1B2A4A] group-hover:text-[#F5B800] transition-colors">
                          {rp.title}
                        </h4>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </article>
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFDFB]">
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-[100px] pb-10 bg-[#1B2A4A]">
          <div className="container-main">
            <div className="text-center mb-10">
              <h1 className="font-display text-[36px] md:text-[48px] font-semibold text-white mb-4">
                AI Blog & News - Udaan24
              </h1>
              <p className="text-[16px] text-white/70 max-w-[500px] mx-auto">
                Latest AI updates, career tips, and coaching insights from Udaan24 Kotkapura.
              </p>
            </div>
            <div className="max-w-[500px] mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718096]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 text-[14px] focus:outline-none focus:border-[#F5B800]"
                placeholder="Search AI articles..."
              />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-6 bg-white border-b border-[#E8EDF5]">
          <div className="container-main">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-[13px] font-medium transition-all duration-200 ${
                    activeCategory === cat
                      ? 'bg-[#F5B800] text-[#1B2A4A]'
                      : 'bg-transparent border border-[#E8EDF5] text-[#4A5568] hover:border-[#1B2A4A]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="section-padding">
          <div className="container-main">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((bp) => (
                <Link key={bp.slug} to={`/blog/${bp.slug}`} className="group">
                  <article className="bg-white rounded-xl border border-[#E8EDF5] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_rgba(27,42,74,0.08)] hover:-translate-y-1">
                    <div className="overflow-hidden">
                      <img src={bp.image} alt={bp.title} className="w-full h-[200px] object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="status-badge-yellow text-[11px]">{bp.category}</span>
                        <span className="text-[12px] text-[#718096]">{bp.date}</span>
                      </div>
                      <h3 className="font-body text-[17px] font-semibold text-[#1B2A4A] mb-2 leading-tight group-hover:text-[#F5B800] transition-colors">
                        {bp.title}
                      </h3>
                      <p className="text-[13px] text-[#4A5568] leading-relaxed line-clamp-2">
                        {bp.excerpt}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

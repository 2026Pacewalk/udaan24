import { Link } from 'react-router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { Award, Users, BookOpen, Monitor, Target, Eye, Quote, CheckCircle, Sparkles, GraduationCap, Briefcase, Building2, Home } from 'lucide-react';

const facilities = [
  { icon: Monitor, title: 'Computer Labs', desc: 'State-of-the-art labs with latest hardware and software' },
  { icon: BookOpen, title: 'Digital Library', desc: 'Access to 5000+ e-books, video lectures and resources' },
  { icon: Users, title: 'Placement Cell', desc: 'Dedicated team for job placements and career guidance' },
  { icon: Award, title: 'Online Portal', desc: '24/7 access to study materials, exams and certificates' },
];

const audiences = [
  { icon: GraduationCap, title: 'Students & Freshers', desc: 'Graduate job-ready with real AI skills that employers are actively hiring for.' },
  { icon: Briefcase, title: 'Working Professionals', desc: 'Use AI to work faster, automate the repetitive, and stay ahead in your role.' },
  { icon: Building2, title: 'Business Owners', desc: 'Spot where AI can cut costs, reach more customers, and grow your business.' },
  { icon: Home, title: 'Homemakers & Restarters', desc: 'Learn flexible, in-demand skills to earn from home or restart your career.' },
];

const capabilities = [
  'Understand what today’s AI truly can — and cannot — do',
  'Use everyday AI tools with confidence, no coding required',
  'Apply AI to real problems in your studies, job or business',
  'Read the change in the job market and turn it to your advantage',
  'Build a sustainable, practical AI plan for your career',
  'Tell real opportunity apart from the hype',
];

export default function About() {
  return (
    <div className="min-h-screen bg-[#FEFDFB]">
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-[100px] pb-16 bg-[#1B2A4A]">
          <div className="container-main text-center">
            <span className="font-mono-accent text-[12px] tracking-[0.1em] text-[#16A34A] uppercase mb-4 block">
              About Us
            </span>
            <h1 className="font-display text-[36px] md:text-[48px] font-semibold text-white leading-[1.1] tracking-[-1.5px] mb-4">
              About Udaan24 - AI Coaching Kotkapura
            </h1>
            <p className="text-[16px] text-white/70 max-w-[600px] mx-auto">
              Punjab's premier AI coaching institute. We make Artificial Intelligence accessible to every student in Kotkapura and beyond.
            </p>
          </div>
        </section>

        {/* About Content */}
        <section className="section-padding">
          <div className="container-main">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <h2 className="font-display text-[32px] font-semibold text-[#1B2A4A] mb-6">
                  Making AI Education Accessible in Punjab
                </h2>
                <p className="text-[15px] text-[#4A5568] leading-relaxed mb-4">
                  Udaan24 was founded with a mission to bring world-class Artificial Intelligence education to Kotkapura, Punjab. We saw the growing demand for AI professionals and the lack of quality AI coaching in the region. Today, Udaan24 is the most trusted name for AI, Machine Learning, and Data Science training in Punjab.
                </p>
                <p className="text-[15px] text-[#4A5568] leading-relaxed mb-6">
                  Our courses are designed by AI industry professionals who have built real-world ML systems. Every student works on live AI projects, building a portfolio that helps them get hired. We believe in learning by doing - not just theory.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {['Live AI Projects', 'Industry Mentors', 'Practical Training', 'Placement Support'].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#22C55E] flex-shrink-0" />
                      <span className="text-[14px] text-[#1B2A4A] font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop"
                  alt="Udaan24 AI Coaching Kotkapura"
                  className="rounded-2xl w-full h-[400px] object-cover"
                />
                <div className="absolute -bottom-6 -left-6 bg-[#16A34A] rounded-xl p-6 shadow-lg">
                  <div className="font-display text-[36px] font-semibold text-[#1B2A4A]">2,000+</div>
                  <div className="text-[13px] text-[#1B2A4A]/80 font-medium">AI Students Trained</div>
                </div>
              </div>
            </div>

            {/* Mission & Vision */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
              <div className="card-standard !bg-[#EAF7EF] !border-[#16A34A]/20">
                <Target className="w-10 h-10 text-[#16A34A] mb-4" />
                <h3 className="font-display text-[24px] font-semibold text-[#1B2A4A] mb-3">Our Mission</h3>
                <p className="text-[14px] text-[#4A5568] leading-relaxed">
                  To make Artificial Intelligence education affordable and accessible to every student in Punjab. We aim to bridge the AI skill gap through hands-on training with real projects, enabling students to build careers in the world's fastest-growing field.
                </p>
              </div>
              <div className="card-standard !bg-[#F0F5FF] !border-blue-200">
                <Eye className="w-10 h-10 text-[#0071E3] mb-4" />
                <h3 className="font-display text-[24px] font-semibold text-[#1B2A4A] mb-3">Our Vision</h3>
                <p className="text-[14px] text-[#4A5568] leading-relaxed">
                  To become North India's leading AI coaching network with 25+ centres by 2030, creating 10,000 AI-skilled professionals from Punjab who contribute to India's AI revolution and global competitiveness.
                </p>
              </div>
            </div>

            {/* AI for Everyone */}
            <div className="mb-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <span className="label-meta mb-3 block flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#16A34A]" />AI for Everyone</span>
                  <h2 className="font-display text-[32px] font-semibold text-[#1B2A4A] mb-6 leading-tight">
                    AI Is for Everyone — Not Just Engineers
                  </h2>
                  <p className="text-[15px] text-[#4A5568] leading-relaxed mb-4">
                    Artificial Intelligence is no longer a subject reserved for engineers and researchers. It has quietly become part of everyday work — in how businesses find customers, how offices handle data, how creators make content, and how decisions get made. At Udaan24 AI Institute, we believe every learner deserves to understand this shift, whatever their background and however little code they have written.
                  </p>
                  <p className="text-[15px] text-[#4A5568] leading-relaxed mb-4">
                    Our programmes are built so that a first-year student, a shop owner, an accountant, or someone returning to work can all learn to use AI with confidence. You will see what today's AI genuinely can do — and, just as importantly, what it cannot — so you can tell real opportunity apart from the hype and apply the right tools to real problems around you.
                  </p>
                  <p className="text-[15px] text-[#4A5568] leading-relaxed">
                    More than a set of tools, AI is changing which skills the job market rewards. We help you navigate that change: build practical, AI-powered skills, understand how it affects your field, and turn it into a real advantage for your career or your business.
                  </p>
                </div>
                <div className="bg-[#EAF7EF] border border-[#16A34A]/20 rounded-2xl p-8">
                  <h3 className="font-body text-[16px] font-semibold text-[#1B2A4A] mb-5">By the end, you will be able to:</h3>
                  <ul className="space-y-3">
                    {capabilities.map((c) => (
                      <li key={c} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0 mt-0.5" />
                        <span className="text-[14px] text-[#1B2A4A] leading-relaxed">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Who it's for */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
                {audiences.map((a) => (
                  <div key={a.title} className="card-standard">
                    <div className="w-12 h-12 rounded-xl bg-[#EAF7EF] flex items-center justify-center mb-4">
                      <a.icon className="w-6 h-6 text-[#16A34A]" />
                    </div>
                    <h3 className="font-body text-[16px] font-semibold text-[#1B2A4A] mb-2">{a.title}</h3>
                    <p className="text-[13px] text-[#4A5568] leading-relaxed">{a.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Director's Message */}
            <div className="bg-white border border-[#E8EDF5] rounded-2xl p-8 md:p-12 mb-20">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-1">
                  <img
                    src="/images/founder.jpg"
                    alt="OP Goyal, Founder & Director, Udaan24"
                    className="w-full max-w-[280px] mx-auto rounded-xl object-cover h-[350px]"
                  />
                </div>
                <div className="lg:col-span-2">
                  <Quote className="w-10 h-10 text-[#16A34A] mb-4" />
                  <p className="font-display text-[20px] md:text-[24px] text-[#1B2A4A] leading-relaxed italic mb-6">
                    "When we started Udaan24, we saw students from Punjab moving to big cities for AI education. Why should they? We brought world-class AI coaching right here to Kotkapura. Today, our students are building AI solutions for companies across India while staying rooted in Punjab."
                  </p>
                  <div>
                    <h4 className="font-body text-[18px] font-semibold text-[#1B2A4A]">OP Goyal, Founder & Director</h4>
                    <p className="text-[14px] text-[#718096]">Udaan24 - AI Coaching Institute, Kotkapura</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Infrastructure */}
            <div>
              <div className="text-center mb-12">
                <span className="label-meta mb-3 block">Facilities</span>
                <h2 className="font-display text-[32px] font-semibold text-[#1B2A4A]">Our Infrastructure</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {facilities.map((f) => (
                  <div key={f.title} className="card-standard text-center">
                    <div className="w-14 h-14 rounded-xl bg-[#EAF7EF] flex items-center justify-center mx-auto mb-4">
                      <f.icon className="w-7 h-7 text-[#16A34A]" />
                    </div>
                    <h3 className="font-body text-[17px] font-semibold text-[#1B2A4A] mb-2">{f.title}</h3>
                    <p className="text-[13px] text-[#4A5568]">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

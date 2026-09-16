import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Download, Play, Sparkles, ChevronLeft, ChevronRight, Cpu, Rocket, ShieldCheck } from 'lucide-react';
import NeuralBackground from '@/components/NeuralBackground';

type Slide = {
  eyebrow: string;
  icon: React.ElementType;
  titleTop: string;
  titleAccent: string;
  titleTail?: string;
  desc: string;
  primary: { label: string; to: string };
  secondary: { label: string; to: string; icon: React.ElementType };
};

const SLIDES: Slide[] = [
  {
    eyebrow: '#1 AI Coaching in Kotkapura, Punjab',
    icon: Sparkles,
    titleTop: 'Master',
    titleAccent: 'Artificial Intelligence',
    titleTail: 'with Udaan24',
    desc: "Punjab's leading AI institute — learn Python, Machine Learning, Deep Learning & Data Science with hands-on projects and guaranteed certification.",
    primary: { label: 'Explore Courses', to: '/courses' },
    secondary: { label: 'Prospectus', to: '/downloads', icon: Download },
  },
  {
    eyebrow: 'Industry-Ready · Hands-On Learning',
    icon: Rocket,
    titleTop: 'Build Real',
    titleAccent: 'AI & Data Projects',
    titleTail: 'that get you hired',
    desc: 'From Python foundations to Generative AI — train on live, mentor-led projects, in classroom or online, and build a portfolio that stands out.',
    primary: { label: 'View AI Courses', to: '/courses' },
    secondary: { label: 'Book a Free Demo', to: '/contact', icon: Play },
  },
  {
    eyebrow: 'Certified · Career & Placement Support',
    icon: ShieldCheck,
    titleTop: 'Get Certified.',
    titleAccent: 'Get Hired.',
    titleTail: '',
    desc: 'Industry-recognized certification, expert career guidance, and placement support to launch your future in Artificial Intelligence.',
    primary: { label: 'Apply Now', to: '/register' },
    secondary: { label: 'Talk to Us', to: '/contact', icon: Cpu },
  },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = useCallback((i: number) => setIndex((i + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((p) => (p + 1) % SLIDES.length), 6500);
    return () => clearInterval(t);
  }, [paused, index]);

  const s = SLIDES[index];
  const Icon = s.icon;

  return (
    <section
      className="relative w-full min-h-[100dvh] flex items-center overflow-hidden bg-[#0C1526]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <style>{`
        @keyframes heroUp { 0% { opacity: 0; transform: translateY(18px); } 100% { opacity: 1; transform: translateY(0); } }
        .hero-up > * { animation: heroUp .7s cubic-bezier(.22,.61,.36,1) both; }
        .hero-up > *:nth-child(2){ animation-delay:.08s } .hero-up > *:nth-child(3){ animation-delay:.16s }
        .hero-up > *:nth-child(4){ animation-delay:.24s } .hero-up > *:nth-child(5){ animation-delay:.32s }
        @keyframes heroPulse { 0%,100% { opacity:.5 } 50% { opacity:1 } }
      `}</style>

      <NeuralBackground />

      {/* Content */}
      <div className="relative z-[3] container-main pt-[110px] pb-[80px]">
        <div key={index} className="hero-up max-w-[820px]">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 backdrop-blur-sm mb-6">
            <Icon className="w-3.5 h-3.5 text-[#22C55E]" />
            <span className="font-mono-accent text-[11px] sm:text-[12px] tracking-[0.14em] text-[#B8F0CE] uppercase">{s.eyebrow}</span>
          </span>

          <h1 className="font-display text-[40px] sm:text-[54px] md:text-[66px] font-semibold text-white leading-[1.03] tracking-[-1.5px] mb-6">
            {s.titleTop}{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg,#22C55E,#2DD4BF 60%,#5EEAD4)' }}>{s.titleAccent}</span>
            {s.titleTail ? <><br />{s.titleTail}</> : null}
          </h1>

          <p className="text-[16px] sm:text-[18px] text-white/70 leading-relaxed max-w-[600px] mb-9">{s.desc}</p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12">
            <Link to={s.primary.to} className="group inline-flex items-center gap-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold px-8 py-4 text-[15px] transition-all shadow-[0_8px_30px_rgba(22,163,74,0.35)] hover:shadow-[0_10px_38px_rgba(22,163,74,0.5)] hover:-translate-y-0.5">
              {s.primary.label}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to={s.secondary.to} className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 backdrop-blur-sm text-white font-semibold px-8 py-4 text-[15px] hover:bg-white/12 hover:border-white/40 transition-all">
              <s.secondary.icon className="w-4 h-4" />
              {s.secondary.label}
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {['AI Coaching Kotkapura', 'Live Projects', 'Certified Training'].map((t, i) => (
              <span key={t} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" style={{ animation: `heroPulse 2.4s ${i * 0.4}s ease-in-out infinite` }} />
                <span className="font-mono-accent text-[11px] text-white/45 uppercase tracking-widest">{t}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Slider controls */}
      <button aria-label="Previous slide" onClick={() => go(index - 1)} className="hidden md:flex absolute left-5 top-1/2 -translate-y-1/2 z-[4] w-11 h-11 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm items-center justify-center text-white/70 hover:text-white hover:bg-white/12 transition-all">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button aria-label="Next slide" onClick={() => go(index + 1)} className="hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 z-[4] w-11 h-11 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm items-center justify-center text-white/70 hover:text-white hover:bg-white/12 transition-all">
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[4] flex items-center gap-2.5">
        {SLIDES.map((_, i) => (
          <button key={i} aria-label={`Go to slide ${i + 1}`} onClick={() => go(i)} className="h-2 rounded-full transition-all duration-300"
            style={{ width: i === index ? 28 : 8, background: i === index ? 'linear-gradient(90deg,#22C55E,#2DD4BF)' : 'rgba(255,255,255,0.25)' }} />
        ))}
      </div>

      {/* Bottom fade into the light page below */}
      <div className="absolute bottom-0 left-0 right-0 h-24 z-[2] pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent, #FEFDFB)' }} />
    </section>
  );
}

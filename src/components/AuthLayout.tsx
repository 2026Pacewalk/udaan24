import { ReactNode } from 'react';
import { Link } from 'react-router';
import NeuralBackground from '@/components/NeuralBackground';

// Shared dark-theme form styles for the login pages.
export const authInput =
  'w-full h-11 px-3.5 bg-white/5 border border-white/15 rounded-lg text-[14px] text-white placeholder-white/35 outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/25 transition';
export const authLabel = 'text-[12px] font-medium text-white/70 mb-1.5 block';
export const authButton =
  'w-full h-11 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_8px_24px_rgba(22,163,74,0.35)] disabled:opacity-60';

// Branded auth shell: dark AI background + Udaan24 logo + glass card.
export default function AuthLayout({ badge, title, subtitle, children }: {
  badge?: string; title: string; subtitle?: string; children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0C1526] p-4">
      <NeuralBackground />

      <div className="relative z-[3] w-full max-w-[420px]">
        {/* Brand */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-6">
          <img src="/logo-icon.png" alt="Udaan24 AI Institute" className="w-12 h-12 object-contain" />
          <div className="flex flex-col">
            <span className="font-display text-[22px] font-extrabold leading-none tracking-tight text-white">UDAAN<span className="text-[#22C55E]">24</span></span>
            <span className="font-mono-accent text-[9px] text-white/55 tracking-[0.18em] uppercase mt-1">AI Institute</span>
          </div>
        </Link>

        {/* Glass card */}
        <div className="rounded-2xl border border-white/12 bg-white/[0.06] backdrop-blur-xl p-7 sm:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
          <div className="text-center mb-6">
            {badge && (
              <span className="inline-block mb-3 rounded-full border border-[#22C55E]/40 bg-[#22C55E]/10 px-3 py-1 font-mono-accent text-[10px] tracking-[0.12em] text-[#8FE9AD] uppercase">
                {badge}
              </span>
            )}
            <h1 className="font-display text-[24px] font-semibold text-white">{title}</h1>
            {subtitle && <p className="text-[13px] text-white/55 mt-1">{subtitle}</p>}
          </div>
          {children}
        </div>

        <Link to="/" className="block text-center text-[12px] text-white/45 mt-5 hover:text-white/80 transition-colors">← Back to website</Link>
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';

// Animated neural-network canvas (matches the Udaan24 logo's node motif).
export function NeuralCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let nodes: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    const mouse = { x: -9999, y: -9999 };
    let raf = 0;
    const GREEN = '22,163,74';
    const TEAL = '45,212,191';

    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(16, Math.min(52, Math.floor((w * h) / 26000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 1,
      }));
    };

    const step = () => {
      ctx.clearRect(0, 0, w, h);
      const LINK = 150;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x, dy = n.y - m.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(${TEAL},${(1 - d / LINK) * 0.22})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.stroke();
          }
        }
        const md = Math.hypot(n.x - mouse.x, n.y - mouse.y);
        if (md < 180) {
          ctx.strokeStyle = `rgba(${GREEN},${(1 - md / 180) * 0.5})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = i % 3 === 0 ? `rgba(${GREEN},0.9)` : `rgba(${TEAL},0.85)`;
        ctx.shadowColor = i % 3 === 0 ? `rgba(${GREEN},0.8)` : `rgba(${TEAL},0.8)`;
        ctx.shadowBlur = 8; ctx.fill(); ctx.shadowBlur = 0;
      }
      raf = requestAnimationFrame(step);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    const onVis = () => { cancelAnimationFrame(raf); if (!document.hidden) raf = requestAnimationFrame(step); };

    resize();
    raf = requestAnimationFrame(step);
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full" />;
}

// Full dark AI background layer: gradient + neural canvas + grid + glow orbs.
export default function NeuralBackground() {
  return (
    <>
      <div className="absolute inset-0 z-0" style={{ background: 'radial-gradient(120% 120% at 50% -10%, #16324a 0%, #0f2036 45%, #0a1120 100%)' }} />
      <div className="absolute inset-0 z-[1] opacity-90"><NeuralCanvas /></div>
      <div className="absolute inset-0 z-[1] pointer-events-none opacity-[0.12]" style={{
        backgroundImage: 'linear-gradient(rgba(45,212,191,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,.5) 1px, transparent 1px)',
        backgroundSize: '54px 54px',
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 78%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 78%)',
      }} />
      <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full z-[1] pointer-events-none blur-[90px]" style={{ background: 'radial-gradient(circle, rgba(22,163,74,.35), transparent 70%)' }} />
      <div className="absolute bottom-[-120px] right-[-80px] w-[460px] h-[460px] rounded-full z-[1] pointer-events-none blur-[100px]" style={{ background: 'radial-gradient(circle, rgba(45,212,191,.28), transparent 70%)' }} />
    </>
  );
}

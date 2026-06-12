import { useEffect, useRef, useState } from 'react';

interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

const stats: StatItem[] = [
  { value: 2000, suffix: '+', label: 'AI Students Trained' },
  { value: 15, suffix: '+', label: 'AI Courses' },
  { value: 50, suffix: '+', label: 'Industry Projects' },
  { value: 98, suffix: '%', label: 'Placement Rate' },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 2000;
          const start = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, hasAnimated]);

  return (
    <div ref={ref} className="font-display text-[42px] sm:text-[48px] font-semibold text-[#1B2A4A] leading-none">
      {count.toLocaleString()}{suffix}
    </div>
  );
}

export default function StatsCounter() {
  return (
    <section className="py-16 md:py-20 border-y border-[#E8EDF5] bg-white">
      <div className="container-main">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center py-4">
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              <span className="label-meta mt-3 block">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

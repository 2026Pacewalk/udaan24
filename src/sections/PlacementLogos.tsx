const recruiters = [
  { name: 'TCS', slug: 'tcs' },
  { name: 'Infosys', slug: 'infosys' },
  { name: 'Wipro', slug: 'wipro' },
  { name: 'HCL', slug: 'hcl' },
  { name: 'Cognizant', slug: 'cognizant' },
  { name: 'Tech Mahindra', slug: 'techmahindra' },
  { name: 'Accenture', slug: 'accenture' },
  { name: 'IBM', slug: 'ibm' },
  { name: 'Capgemini', slug: 'capgemini' },
  { name: 'Oracle', slug: 'oracle' },
  { name: 'Microsoft', slug: 'microsoft' },
  { name: 'Google', slug: 'google' },
];

export default function PlacementLogos() {
  // Duplicated once so the CSS marquee (translateX -50%) loops seamlessly.
  const track = [...recruiters, ...recruiters];
  return (
    <section className="py-16 bg-white border-y border-[#E8EDF5] overflow-hidden">
      <div className="container-main">
        <div className="text-center mb-10">
          <span className="label-meta mb-3 block">AI Career Partners</span>
          <h3 className="font-display text-[28px] font-semibold text-[#1B2A4A]">
            Trusted by AI Companies
          </h3>
        </div>
      </div>

      <div
        className="relative"
        style={{
          maskImage: 'linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)',
        }}
      >
        <div
          className="marquee-track items-center gap-16 md:gap-20 w-max hover:[animation-play-state:paused]"
          style={{ animationDuration: '42s' }}
        >
          {track.map((c, i) => (
            <img
              key={`${c.slug}-${i}`}
              src={`/logos/${c.slug}.png`}
              alt={`${c.name} logo`}
              loading="lazy"
              className="h-10 md:h-12 w-auto object-contain shrink-0 opacity-80 hover:opacity-100 transition-opacity duration-200"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

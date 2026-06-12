import { Building2 } from 'lucide-react';

const recruiters = [
  'TCS', 'Infosys', 'Wipro', 'HCL', 'Cognizant', 'Tech Mahindra',
  'Accenture', 'IBM', 'Capgemini', 'Oracle', 'Microsoft', 'Google',
];

export default function PlacementLogos() {
  return (
    <section className="py-16 bg-white border-y border-[#E8EDF5]">
      <div className="container-main">
        <div className="text-center mb-10">
          <span className="label-meta mb-3 block">AI Career Partners</span>
          <h3 className="font-display text-[28px] font-semibold text-[#1B2A4A]">
            Trusted by AI Companies
          </h3>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {recruiters.map((company) => (
            <div
              key={company}
              className="flex items-center gap-2 px-6 py-3 bg-[#FEFDFB] border border-[#E8EDF5] rounded-lg hover:border-[#F5B800] hover:shadow-sm transition-all duration-200"
            >
              <Building2 className="w-5 h-5 text-[#718096]" />
              <span className="font-body text-[14px] font-medium text-[#4A5568]">{company}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

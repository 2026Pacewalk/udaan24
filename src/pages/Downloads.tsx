import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { FileText, Download, Filter, Search, File, Table, BookOpen } from 'lucide-react';

interface DownloadItem {
  title: string;
  type: string;
  category: string;
  size: string;
  format: string;
  icon: React.ElementType;
}

const downloads: DownloadItem[] = [
  { title: 'Prospectus 2025-26', type: 'prospectus', category: 'Prospectus', size: '3.2 MB', format: 'PDF', icon: BookOpen },
  { title: 'Admission Form', type: 'form', category: 'Forms', size: '450 KB', format: 'PDF', icon: FileText },
  { title: 'Fee Structure', type: 'fee', category: 'Fee', size: '280 KB', format: 'PDF', icon: Table },
  { title: 'DCA Course Brochure', type: 'brochure', category: 'Brochure', size: '1.8 MB', format: 'PDF', icon: File },
  { title: 'Tally Prime Brochure', type: 'brochure', category: 'Brochure', size: '1.5 MB', format: 'PDF', icon: File },
  { title: 'Web Design Brochure', type: 'brochure', category: 'Brochure', size: '2.1 MB', format: 'PDF', icon: File },
  { title: 'Franchise Application Form', type: 'form', category: 'Forms', size: '380 KB', format: 'PDF', icon: FileText },
  { title: 'Certificate Request Form', type: 'form', category: 'Forms', size: '220 KB', format: 'PDF', icon: FileText },
];

const categories = ['All', 'Prospectus', 'Forms', 'Fee', 'Brochure'];

export default function Downloads() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = downloads.filter((d) => {
    const matchCategory = activeCategory === 'All' || d.category === activeCategory;
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#FEFDFB]">
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-[100px] pb-10 bg-[#1B2A4A]">
          <div className="container-main text-center">
            <h1 className="font-display text-[36px] md:text-[48px] font-semibold text-white mb-4">
              Downloads - Udaan24
            </h1>
            <p className="text-[16px] text-white/70 max-w-[500px] mx-auto">
              Download AI course prospectus, admission forms, fee structure and course brochures for Udaan24 Kotkapura.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-6 bg-white border-b border-[#E8EDF5]">
          <div className="container-main">
            <div className="flex flex-col sm:flex-row items-center gap-4">
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
              <div className="relative flex-1 max-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718096]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 pl-11 pr-4 bg-[#F5F6FA] border border-[#E8EDF5] rounded-full text-[13px] outline-none focus:border-[#F5B800]"
                  placeholder="Search files..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Downloads - Udaan24 Grid */}
        <section className="section-padding">
          <div className="container-main">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-white border border-[#E8EDF5] rounded-xl p-5 hover:shadow-sm hover:border-[#F5B800]/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#FFF9E6] flex items-center justify-center flex-shrink-0 group-hover:bg-[#F5B800] transition-colors">
                    <d.icon className="w-6 h-6 text-[#F5B800] group-hover:text-[#1B2A4A] transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-medium text-[#1B2A4A] truncate">{d.title}</h3>
                    <p className="text-[12px] text-[#718096]">{d.format} &middot; {d.size}</p>
                  </div>
                  <button className="w-9 h-9 rounded-lg border border-[#E8EDF5] flex items-center justify-center hover:bg-[#F5B800] hover:border-[#F5B800] transition-all group-hover:border-[#F5B800]">
                    <Download className="w-4 h-4 text-[#718096] group-hover:text-[#1B2A4A] transition-colors" />
                  </button>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-[16px] text-[#718096]">No downloads found matching your criteria.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

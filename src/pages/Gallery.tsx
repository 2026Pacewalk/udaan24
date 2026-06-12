import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { X, Image, Video, Play } from 'lucide-react';

interface GalleryItem {
  id: number;
  title: string;
  type: 'image' | 'video';
  category: string;
  url: string;
  thumbnail?: string;
}

const galleryItems: GalleryItem[] = [
  { id: 1, title: 'AI Lab - Python & ML', type: 'image', category: 'Campus', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop' },
  { id: 2, title: 'AI Classroom Session', type: 'image', category: 'Classroom', url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop' },
  { id: 3, title: 'AI Certificate Distribution', type: 'image', category: 'Events', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop' },
  { id: 4, title: 'ML Workshop - Kotkapura', type: 'video', category: 'Workshops', url: '#', thumbnail: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop' },
  { id: 5, title: 'AI Student Projects', type: 'image', category: 'Projects', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop' },
  { id: 6, title: 'Udaan24 Centre Kotkapura', type: 'image', category: 'Campus', url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&h=400&fit=crop' },
  { id: 7, title: 'Hands-on AI Training', type: 'image', category: 'Classroom', url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=400&fit=crop' },
  { id: 8, title: 'AI Course Completion Day', type: 'image', category: 'Events', url: 'https://images.unsplash.com/photo-1525921429624-479b6a26d84d?w=600&h=400&fit=crop' },
  { id: 9, title: 'Python for AI Bootcamp', type: 'video', category: 'Workshops', url: '#', thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop' },
  { id: 10, title: 'AI Resource Library', type: 'image', category: 'Campus', url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&h=400&fit=crop' },
  { id: 11, title: 'Data Visualization Lab', type: 'image', category: 'Classroom', url: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop' },
  { id: 12, title: 'AI Demo Day', type: 'image', category: 'Events', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop' },
];

const categories = ['All', 'Campus', 'Classroom', 'Events', 'Workshops', 'Projects'];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const filtered = activeCategory === 'All'
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#FEFDFB]">
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-[100px] pb-10 bg-[#1B2A4A]">
          <div className="container-main text-center">
            <h1 className="font-display text-[36px] md:text-[48px] font-semibold text-white mb-4">
              AI Coaching Gallery
            </h1>
            <p className="text-[16px] text-white/70 max-w-[500px] mx-auto">
              Glimpses of our AI coaching centre in Kotkapura, classrooms, projects and student achievements.
            </p>
          </div>
        </section>

        {/* Filters */}
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

        {/* AI Coaching Gallery Grid */}
        <section className="section-padding">
          <div className="container-main">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <img
                    src={item.type === 'video' ? item.thumbnail || item.url : item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(27,42,74,0.7)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <span className="text-[12px] text-[#F5B800] font-medium uppercase tracking-wider mb-1">
                      {item.category}
                    </span>
                    <h3 className="text-[14px] font-medium text-white">{item.title}</h3>
                  </div>
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-[#F5B800] transition-colors duration-300">
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />

      {/* Lightbox */}
      {selectedItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" onClick={() => setSelectedItem(null)}>
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.9)]" />
          <div className="relative z-10 max-w-[900px] max-h-[80vh] w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedItem.type === 'video' ? selectedItem.thumbnail || selectedItem.url : selectedItem.url}
              alt={selectedItem.title}
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <span className="text-[12px] text-[#F5B800] font-medium uppercase tracking-wider">{selectedItem.category}</span>
              <h3 className="text-[16px] font-medium text-white mt-1">{selectedItem.title}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import HeroMarble from '@/sections/HeroMarble';
import AnnouncementTicker from '@/sections/AnnouncementTicker';
import StatsCounter from '@/sections/StatsCounter';
import CoursesSection from '@/sections/CoursesSection';
import WhyChooseUs from '@/sections/WhyChooseUs';
import Testimonials from '@/sections/Testimonials';
import FranchiseSection from '@/sections/FranchiseSection';
import NewsSection from '@/sections/NewsSection';
import PlacementLogos from '@/sections/PlacementLogos';
import FAQSection from '@/sections/FAQSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FEFDFB]">
      <Header />
      <main>
        <HeroMarble />
        <AnnouncementTicker />
        <StatsCounter />
        <CoursesSection />
        <WhyChooseUs />
        <FranchiseSection />
        <Testimonials />
        <PlacementLogos />
        <FAQSection />
        <NewsSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

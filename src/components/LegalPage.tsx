import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';

// Shared layout + typography for the legal / policy pages so they all match the
// site design. Business/legal entity details are surfaced consistently.
export default function LegalPage({ title, subtitle, updated, children }: { title: string; subtitle?: string; updated?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FEFDFB]">
      <Header />
      <main>
        <section className="pt-[100px] pb-10 bg-[#1B2A4A]">
          <div className="container-main">
            <h1 className="font-display text-[32px] md:text-[44px] font-semibold text-white tracking-[-1px]">{title}</h1>
            {subtitle && <p className="text-[15px] text-white/70 mt-3 max-w-[640px]">{subtitle}</p>}
            {updated && <p className="text-[13px] text-white/50 mt-3">Last updated: {updated}</p>}
          </div>
        </section>
        <section className="section-padding">
          <div className="container-main max-w-[840px]">{children}</div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export const H2 = ({ children }: { children: ReactNode }) => (
  <h2 className="font-display text-[21px] font-semibold text-[#1B2A4A] mt-8 mb-3 first:mt-0">{children}</h2>
);
export const P = ({ children }: { children: ReactNode }) => (
  <p className="text-[15px] text-[#4A5568] leading-[1.75] mb-4">{children}</p>
);
export const UL = ({ children }: { children: ReactNode }) => (
  <ul className="list-disc pl-6 space-y-2 mb-4 text-[15px] text-[#4A5568] leading-[1.7]">{children}</ul>
);

// Business identity block reused on every policy page (payment gateways require
// a clearly visible legal entity name + address).
export const BusinessBlock = () => (
  <div className="bg-[#F5F6FA] border border-[#E8EDF5] rounded-xl p-5 mb-8 text-[14px] text-[#4A5568] leading-[1.7]">
    <p className="font-semibold text-[#1B2A4A] mb-1">Udaan24 AI Institute</p>
    <p>Operated by <b>Udaan24 Educational Society</b>, Kotkapura.</p>
    <p>Near Bus Stand, Kotkapura, Faridkot, Punjab 151204, India</p>
    <p>Phone / WhatsApp: +91 97808 43440 &nbsp;·&nbsp; Email: info@udaan24.com</p>
    <p>Website: https://udaan24.com</p>
  </div>
);

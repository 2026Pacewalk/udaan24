import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle, Building2, Search, ExternalLink, User } from 'lucide-react';
import { trpc } from '@/providers/trpc';

const MAIN_OFFICE = 'Main Udaan24 Office / Not Sure';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', centre: '', courseInterest: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [centreSearch, setCentreSearch] = useState('');

  const { data: centres } = trpc.centers.publicActive.useQuery();
  const { data: courses } = trpc.courses.list.useQuery();

  const enquiryMutation = trpc.enquiries.submit.useMutation({
    onSuccess: () => { setSubmitted(true); setFormData({ name: '', email: '', phone: '', centre: '', courseInterest: '', message: '' }); },
    onError: (e) => setError(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.name.trim() || !formData.phone.trim()) { setError('Please enter your name and phone number.'); return; }
    if (!formData.centre) { setError('Please select your nearby study centre.'); return; }
    const isMain = formData.centre === 'main';
    const centre = (centres || []).find((c: any) => String(c.id) === formData.centre);
    enquiryMutation.mutate({
      name: formData.name.trim(),
      email: formData.email || undefined,
      phone: formData.phone.trim(),
      selectedCentreId: isMain || !centre ? undefined : centre.id,
      centerPreference: isMain || !centre ? MAIN_OFFICE : `${centre.name}${centre.city ? `, ${centre.city}` : ''}`,
      courseInterest: formData.courseInterest || undefined,
      message: formData.message || undefined,
      source: 'contact_page',
      type: 'general',
    });
  };

  const filteredCentres = (centres || []).filter((c: any) => {
    if (!centreSearch) return true;
    const q = centreSearch.toLowerCase();
    return (c.name || '').toLowerCase().includes(q) || (c.city || '').toLowerCase().includes(q);
  });

  const mapHref = (c: any) => c.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([c.name, c.address, c.city, c.state].filter(Boolean).join(', '))}`;

  return (
    <div className="min-h-screen bg-[#FEFDFB]">
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-[100px] pb-10 bg-[#1B2A4A]">
          <div className="container-main text-center">
            <h1 className="font-display text-[30px] sm:text-[36px] md:text-[48px] font-semibold text-white mb-4 leading-tight">
              Contact Udaan24 — AI Coaching Kotkapura
            </h1>
            <p className="text-[15px] sm:text-[16px] text-white/70 max-w-[560px] mx-auto">
              Get in touch for AI course enquiries, admissions, or study centre partnerships in Punjab.
            </p>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-main">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">
              {/* Contact Form */}
              <div className="lg:col-span-3">
                <div className="bg-white border border-[#E8EDF5] rounded-2xl p-6 sm:p-8">
                  <h2 className="font-display text-[22px] sm:text-[24px] font-semibold text-[#1B2A4A] mb-6">Enquire About AI Courses</h2>

                  {submitted ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-[#F0FFF4] flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-[#22C55E]" /></div>
                      <h3 className="font-body text-[20px] font-semibold text-[#1B2A4A] mb-2">Thank You!</h3>
                      <p className="text-[14px] text-[#4A5568]">Your enquiry has been received. Our AI coaching team will contact you shortly.</p>
                      <button onClick={() => setSubmitted(false)} className="btn-primary mt-6">Send Another Enquiry</button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="font-body text-[14px] font-medium text-[#1B2A4A] mb-1.5 block">Student Name *</label>
                          <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-standard w-full" placeholder="Your name" />
                        </div>
                        <div>
                          <label className="font-body text-[14px] font-medium text-[#1B2A4A] mb-1.5 block">Phone Number *</label>
                          <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input-standard w-full" placeholder="+91 97808 43440" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="font-body text-[14px] font-medium text-[#1B2A4A] mb-1.5 block">Email</label>
                          <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-standard w-full" placeholder="your@email.com" />
                        </div>
                        <div>
                          <label className="font-body text-[14px] font-medium text-[#1B2A4A] mb-1.5 block">Nearby Study Centre *</label>
                          <select required value={formData.centre} onChange={(e) => setFormData({ ...formData, centre: e.target.value })} className="input-standard w-full">
                            <option value="">Select your nearby centre</option>
                            {(centres || []).map((c: any) => (
                              <option key={c.id} value={c.id}>{c.name}{c.city ? ` — ${c.city}` : ''}</option>
                            ))}
                            <option value="main">{MAIN_OFFICE}</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="font-body text-[14px] font-medium text-[#1B2A4A] mb-1.5 block">AI Course Interest</label>
                        <select value={formData.courseInterest} onChange={(e) => setFormData({ ...formData, courseInterest: e.target.value })} className="input-standard w-full">
                          <option value="">Select an AI course</option>
                          {(courses || []).map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="font-body text-[14px] font-medium text-[#1B2A4A] mb-1.5 block">Message</label>
                        <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="input-standard w-full !min-h-[120px] py-4 resize-vertical" placeholder="How can we help you?" />
                      </div>

                      {error && <p className="text-[13px] text-red-500">{error}</p>}

                      <button type="submit" disabled={enquiryMutation.isPending} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                        <Send className="w-4 h-4" />{enquiryMutation.isPending ? 'Sending...' : 'Send Message'}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  <div className="bg-[#1B2A4A] rounded-2xl p-6 sm:p-8 text-white">
                    <h3 className="font-display text-[20px] sm:text-[22px] font-semibold mb-6">Contact Information</h3>
                    <div className="space-y-5">
                      <div className="flex items-start gap-4"><MapPin className="w-5 h-5 text-[#F5B800] mt-0.5 flex-shrink-0" /><div><p className="text-[14px] font-medium mb-0.5">Kotkapura Centre</p><p className="text-[13px] text-white/60">Near Bus Stand, Kotkapura<br />Faridkot, Punjab 151204</p></div></div>
                      <div className="flex items-start gap-4"><Phone className="w-5 h-5 text-[#F5B800] mt-0.5 flex-shrink-0" /><div><p className="text-[14px] font-medium mb-0.5">Phone</p><p className="text-[13px] text-white/60">+91 97808 43440</p></div></div>
                      <div className="flex items-start gap-4"><Mail className="w-5 h-5 text-[#F5B800] mt-0.5 flex-shrink-0" /><div><p className="text-[14px] font-medium mb-0.5">Email</p><p className="text-[13px] text-white/60">info@udaan24.com<br />support@udaan24.com</p></div></div>
                      <div className="flex items-start gap-4"><Clock className="w-5 h-5 text-[#F5B800] mt-0.5 flex-shrink-0" /><div><p className="text-[14px] font-medium mb-0.5">Office Hours</p><p className="text-[13px] text-white/60">Mon - Sat: 9:00 AM - 6:00 PM<br />Sunday: Closed</p></div></div>
                    </div>
                  </div>

                  <div className="bg-[#FFF9E6] rounded-2xl p-6 border border-[#F5B800]/20">
                    <h4 className="font-body text-[16px] font-semibold text-[#1B2A4A] mb-2">Need AI Course Guidance?</h4>
                    <p className="text-[13px] text-[#4A5568] mb-4">Chat with us on WhatsApp for AI course guidance and admission queries.</p>
                    <a href="https://wa.me/919780843440" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-3 rounded-full font-medium text-[14px] hover:bg-[#1da851] transition-colors"><MessageCircle className="w-4 h-4" />Chat on WhatsApp</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Study Centres */}
        <section className="section-padding bg-white border-t border-[#E8EDF5]">
          <div className="container-main">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="label-meta mb-2 block">Find Us</span>
                <h2 className="font-display text-[28px] sm:text-[36px] font-semibold text-[#1B2A4A] tracking-[-1px]">Our Study Centres</h2>
                <p className="text-[14px] text-[#718096] mt-1">Visit your nearest Udaan24 study centre across Punjab.</p>
              </div>
              <div className="flex items-center bg-[#F5F6FA] rounded-lg px-3 py-2.5 border border-[#E8EDF5] w-full sm:w-72">
                <Search className="w-4 h-4 text-[#718096] mr-2 flex-shrink-0" />
                <input value={centreSearch} onChange={(e) => setCentreSearch(e.target.value)} placeholder="Search by city or centre name…" className="bg-transparent text-[13px] outline-none w-full" />
              </div>
            </div>

            {filteredCentres.length === 0 ? (
              <p className="text-[14px] text-[#718096] text-center py-10">No study centres found{centreSearch ? ' for your search.' : '.'}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCentres.map((c: any) => (
                  <div key={c.id} className="bg-white border border-[#E8EDF5] rounded-2xl p-5 hover:shadow-[0_8px_32px_rgba(27,42,74,0.08)] transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-11 h-11 rounded-xl bg-[#FFF9E6] flex items-center justify-center"><Building2 className="w-5 h-5 text-[#F5B800]" /></div>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-green-50 text-green-700">Active</span>
                    </div>
                    <h3 className="font-body text-[16px] font-semibold text-[#1B2A4A]">{c.name}</h3>
                    <p className="text-[12px] font-mono text-[#718096] mb-3">{c.centerCode}</p>
                    <div className="space-y-1.5 text-[13px] text-[#4A5568]">
                      {(c.address || c.city) && <p className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 text-[#F5B800] mt-0.5 flex-shrink-0" /><span>{[c.address, c.city, c.state].filter(Boolean).join(', ')}</span></p>}
                      {c.contactPerson && <p className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-[#F5B800] flex-shrink-0" />{c.contactPerson}</p>}
                      {c.phone && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-[#F5B800] flex-shrink-0" /><a href={`tel:${c.phone}`} className="hover:text-[#1B2A4A]">{c.phone}</a></p>}
                      {c.email && <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-[#F5B800] flex-shrink-0" /><a href={`mailto:${c.email}`} className="hover:text-[#1B2A4A] break-all">{c.email}</a></p>}
                    </div>
                    <a href={mapHref(c)} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-medium text-[#0071E3]"><ExternalLink className="w-3.5 h-3.5" />View on Google Maps</a>
                  </div>
                ))}
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

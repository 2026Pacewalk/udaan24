import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { trpc } from '@/providers/trpc';
import { TrendingUp, Shield, Users, Award, Headphones, CheckCircle, Send, IndianRupee, Loader2 } from 'lucide-react';

const benefits = [
  { icon: IndianRupee, title: 'Low Investment', desc: 'Start your center from just Rs. 2 Lakhs investment' },
  { icon: TrendingUp, title: 'High ROI', desc: 'Recover your investment within 6-8 months' },
  { icon: Shield, title: 'Brand Recognition', desc: 'Use our trusted brand name built over 16 years' },
  { icon: Users, title: 'Complete Support', desc: 'Marketing, training, operations - we handle it all' },
  { icon: Headphones, title: '24/7 Assistance', desc: 'Round-the-clock support for all your queries' },
  { icon: Award, title: 'Certified Courses', desc: 'Govt. recognized curriculum and certificates' },
];

const roiData = [
  { label: 'Initial Investment', value: 'Rs. 2-5 Lakhs' },
  { label: 'Monthly Revenue', value: 'Rs. 1-3 Lakhs' },
  { label: 'Break-even Period', value: '6-8 Months' },
  { label: 'Profit Margin', value: '40-60%' },
];

const steps = [
  { step: '01', title: 'Apply Online', desc: 'Fill the franchise application form with your details' },
  { step: '02', title: 'Verification', desc: 'Our team will verify your application and documents' },
  { step: '03', title: 'Agreement', desc: 'Sign the franchise agreement and pay the setup fee' },
  { step: '04', title: 'Setup', desc: 'We help you set up the center with branding and equipment' },
  { step: '05', title: 'Training', desc: 'Get comprehensive training for you and your staff' },
  { step: '06', title: 'Launch', desc: 'Grand opening with marketing support from head office' },
];

type FranchiseForm = {
  name: string; email: string; phone: string; education: string;
  city: string; state: string; address: string; premises: string;
  investment: string; experience: string; message: string;
};

const empty: FranchiseForm = {
  name: '', email: '', phone: '', education: '', city: '', state: '',
  address: '', premises: 'Owned', investment: 'Rs. 2-3 Lakhs', experience: 'No experience', message: '',
};

export default function Franchise() {
  const [formStep, setFormStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FranchiseForm>(empty);
  const [error, setError] = useState('');

  // Saves as a study-centre application (status: pending) so the Super Admin can
  // review/approve it in Centre Management.
  const submitMutation = trpc.centers.submitApplication.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (e) => setError(e.message),
  });

  const set = (k: keyof FranchiseForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const handleSubmit = () => {
    setError('');
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone are required.');
      setFormStep(1);
      return;
    }
    const documents = [
      `Education: ${form.education || '-'}`,
      `Premises: ${form.premises}`,
      `Investment: ${form.investment}`,
      `Experience: ${form.experience}`,
      form.message ? `Notes: ${form.message}` : '',
    ].filter(Boolean).join(' | ');

    submitMutation.mutate({
      name: form.name.trim(),
      ownerName: form.name.trim(),
      ownerPhone: form.phone.trim(),
      email: form.email || undefined,
      address: form.address || undefined,
      city: form.city || undefined,
      state: form.state || undefined,
      documents,
    });
  };

  return (
    <div className="min-h-screen bg-[#FEFDFB]">
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-[100px] pb-16 bg-[#1B2A4A]">
          <div className="container-main text-center">
            <span className="font-mono-accent text-[12px] tracking-[0.1em] text-[#F5B800] uppercase mb-4 block">
              Study Centre Opportunity
            </span>
            <h1 className="font-display text-[36px] md:text-[52px] font-semibold text-white leading-[1.1] tracking-[-1.5px] mb-6">
              Start Your Own<br />AI Study Centre
            </h1>
            <p className="text-[16px] text-white/70 max-w-[600px] mx-auto mb-8">
              Bring AI education to your city. Partner with Punjab's leading AI coaching brand. Low investment, complete support.
            </p>
            <a href="#apply" className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-[15px]">
              Apply Now
              <Send className="w-4 h-4" />
            </a>
          </div>
        </section>

        {/* Benefits */}
        <section className="section-padding">
          <div className="container-main">
            <div className="text-center mb-14">
              <span className="label-meta mb-3 block">Why Partner With Udaan24</span>
              <h2 className="font-display text-[36px] md:text-[42px] font-semibold text-[#1B2A4A] tracking-[-1.2px]">
                Benefits of AI Study Centre
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((b) => (
                <div key={b.title} className="card-standard flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-xl bg-[#FFF9E6] flex items-center justify-center mb-4">
                    <b.icon className="w-7 h-7 text-[#F5B800]" />
                  </div>
                  <h3 className="font-body text-[18px] font-semibold text-[#1B2A4A] mb-2">{b.title}</h3>
                  <p className="text-[14px] text-[#4A5568]">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ROI Section */}
        <section className="py-16 bg-[#1B2A4A]">
          <div className="container-main">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="font-mono-accent text-[12px] tracking-[0.1em] text-[#F5B800] uppercase mb-4 block">
                  Return on Investment
                </span>
                <h2 className="font-display text-[32px] md:text-[42px] font-semibold text-white leading-tight tracking-[-1.2px] mb-6">
                  Excellent ROI for<br />Your Investment
                </h2>
                <p className="text-[15px] text-white/70 leading-relaxed mb-8">
                  Our franchise model is designed to ensure quick returns. With our proven curriculum, marketing support, and brand recognition, most franchise partners recover their investment within the first year of operation.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {roiData.map((r) => (
                    <div key={r.label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                      <div className="text-[12px] text-white/50 uppercase tracking-wider mb-1">{r.label}</div>
                      <div className="font-display text-[20px] font-semibold text-[#F5B800]">{r.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop"
                  alt="Franchise Meeting"
                  className="rounded-2xl w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="section-padding">
          <div className="container-main">
            <div className="text-center mb-14">
              <span className="label-meta mb-3 block">Process</span>
              <h2 className="font-display text-[36px] md:text-[42px] font-semibold text-[#1B2A4A] tracking-[-1.2px]">
                How to Open Your Centre
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {steps.map((s) => (
                <div key={s.step} className="relative">
                  <div className="font-display text-[60px] font-semibold text-[#E8EDF5] leading-none mb-2">
                    {s.step}
                  </div>
                  <h3 className="font-body text-[18px] font-semibold text-[#1B2A4A] mb-2">{s.title}</h3>
                  <p className="text-[14px] text-[#4A5568]">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section id="apply" className="section-padding bg-[#FFF9E6]">
          <div className="container-main">
            <div className="max-w-[700px] mx-auto">
              <div className="text-center mb-10">
                <span className="label-meta mb-3 block">Apply Now</span>
                <h2 className="font-display text-[32px] md:text-[36px] font-semibold text-[#1B2A4A] tracking-[-1px]">
                  Study Centre Application
                </h2>
              </div>

              {submitted ? (
                <div className="bg-white rounded-2xl p-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#F0FFF4] flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-[#22C55E]" />
                  </div>
                  <h3 className="font-body text-[22px] font-semibold text-[#1B2A4A] mb-2">Application Submitted!</h3>
                  <p className="text-[14px] text-[#4A5568]">
                    Our Udaan24 team will contact you within 24-48 hours to discuss setting up your AI study centre.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                  {/* Step indicator */}
                  <div className="flex items-center justify-center gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold ${
                        formStep >= s ? 'bg-[#F5B800] text-[#1B2A4A]' : 'bg-[#E8EDF5] text-[#718096]'
                      }`}>
                        {s}
                      </div>
                    ))}
                  </div>

                  {formStep === 1 && (
                    <div className="space-y-5">
                      <h3 className="font-body text-[16px] font-semibold text-[#1B2A4A] mb-4">Personal Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="font-body text-[14px] font-medium text-[#1B2A4A] mb-1.5 block">Full Name *</label>
                          <input type="text" value={form.name} onChange={set('name')} className="input-standard w-full" placeholder="Your name" />
                        </div>
                        <div>
                          <label className="font-body text-[14px] font-medium text-[#1B2A4A] mb-1.5 block">Email</label>
                          <input type="email" value={form.email} onChange={set('email')} className="input-standard w-full" placeholder="your@email.com" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="font-body text-[14px] font-medium text-[#1B2A4A] mb-1.5 block">Phone *</label>
                          <input type="tel" value={form.phone} onChange={set('phone')} className="input-standard w-full" placeholder="+91 97808 43440" />
                        </div>
                        <div>
                          <label className="font-body text-[14px] font-medium text-[#1B2A4A] mb-1.5 block">Education</label>
                          <input type="text" value={form.education} onChange={set('education')} className="input-standard w-full" placeholder="Highest qualification" />
                        </div>
                      </div>
                      <button onClick={() => setFormStep(2)} className="btn-primary w-full py-3.5">Continue</button>
                    </div>
                  )}

                  {formStep === 2 && (
                    <div className="space-y-5">
                      <h3 className="font-body text-[16px] font-semibold text-[#1B2A4A] mb-4">Center Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="font-body text-[14px] font-medium text-[#1B2A4A] mb-1.5 block">City *</label>
                          <input type="text" value={form.city} onChange={set('city')} className="input-standard w-full" placeholder="City name" />
                        </div>
                        <div>
                          <label className="font-body text-[14px] font-medium text-[#1B2A4A] mb-1.5 block">State *</label>
                          <input type="text" value={form.state} onChange={set('state')} className="input-standard w-full" placeholder="State" />
                        </div>
                      </div>
                      <div>
                        <label className="font-body text-[14px] font-medium text-[#1B2A4A] mb-1.5 block">Full Address</label>
                        <textarea value={form.address} onChange={set('address')} className="input-standard w-full !min-h-[80px] py-3" placeholder="Complete address" />
                      </div>
                      <div>
                        <label className="font-body text-[14px] font-medium text-[#1B2A4A] mb-1.5 block">Premises Type</label>
                        <select value={form.premises} onChange={set('premises')} className="input-standard w-full">
                          <option>Owned</option>
                          <option>Rented</option>
                          <option>Leased</option>
                        </select>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setFormStep(1)} className="btn-secondary flex-1 py-3.5">Back</button>
                        <button onClick={() => setFormStep(3)} className="btn-primary flex-1 py-3.5">Continue</button>
                      </div>
                    </div>
                  )}

                  {formStep === 3 && (
                    <div className="space-y-5">
                      <h3 className="font-body text-[16px] font-semibold text-[#1B2A4A] mb-4">Investment Capacity</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="font-body text-[14px] font-medium text-[#1B2A4A] mb-1.5 block">Investment Capacity *</label>
                          <select value={form.investment} onChange={set('investment')} className="input-standard w-full">
                            <option>Rs. 2-3 Lakhs</option>
                            <option>Rs. 3-5 Lakhs</option>
                            <option>Rs. 5-10 Lakhs</option>
                            <option>Above Rs. 10 Lakhs</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-body text-[14px] font-medium text-[#1B2A4A] mb-1.5 block">Business Experience</label>
                          <select value={form.experience} onChange={set('experience')} className="input-standard w-full">
                            <option>No experience</option>
                            <option>1-2 years</option>
                            <option>3-5 years</option>
                            <option>5+ years</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="font-body text-[14px] font-medium text-[#1B2A4A] mb-1.5 block">Additional Message</label>
                        <textarea value={form.message} onChange={set('message')} className="input-standard w-full !min-h-[80px] py-3" placeholder="Tell us about your vision for AI education in your city" />
                      </div>
                      {error && <p className="text-[13px] text-red-500">{error}</p>}
                      <div className="flex gap-3">
                        <button onClick={() => setFormStep(2)} className="btn-secondary flex-1 py-3.5">Back</button>
                        <button onClick={handleSubmit} disabled={submitMutation.isPending} className="btn-primary flex-1 py-3.5 flex items-center justify-center gap-2">
                          {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          Submit Application
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { trpc } from '@/providers/trpc';
import { ShieldCheck, ShieldX, Loader2, GraduationCap, FileText, Award } from 'lucide-react';

const fmt = (d: any) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

export default function ResultVerify() {
  const [name, setName] = useState('');
  const [reg, setReg] = useState('');
  const [q, setQ] = useState<{ name: string; registrationNumber: string } | null>(null);

  const res = trpc.marksheets.verifyResult.useQuery(q!, { enabled: !!q });
  const d = res.data;
  const loading = !!q && res.isLoading;

  const Row = ({ k, v }: { k: string; v: any }) => (
    <div className="flex justify-between gap-3 py-2.5 border-b border-[#F0F2F7] last:border-0">
      <span className="text-[13px] text-[#718096]">{k}</span>
      <span className="text-[14px] text-[#1B2A4A] font-medium text-right">{v || '—'}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FEFDFB]">
      <Header />
      <main>
        <section className="pt-[100px] pb-10 bg-[#1B2A4A]">
          <div className="container-main text-center">
            <span className="font-mono-accent text-[12px] tracking-[0.1em] text-[#22C55E] uppercase mb-3 block">Result Verification</span>
            <h1 className="font-display text-[32px] md:text-[44px] font-semibold text-white leading-tight mb-3">Check Your Result</h1>
            <p className="text-[15px] text-white/70 max-w-[560px] mx-auto">Enter your name and registration number to view your official Udaan24 AI Institute result.</p>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-main max-w-[560px]">
            <form
              onSubmit={(e) => { e.preventDefault(); if (name.trim() && reg.trim()) setQ({ name: name.trim(), registrationNumber: reg.trim() }); }}
              className="bg-white border border-[#E8EDF5] rounded-2xl p-6 sm:p-8 mb-8"
            >
              <div className="space-y-4">
                <div>
                  <label className="text-[13px] font-medium text-[#1B2A4A] mb-1.5 block">Student Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full name as registered" className="input-standard w-full" />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-[#1B2A4A] mb-1.5 block">Registration Number</label>
                  <input value={reg} onChange={(e) => setReg(e.target.value)} required placeholder="e.g. UAN24-0001" className="input-standard w-full" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}Get Result
                </button>
              </div>
            </form>

            {loading && <div className="text-center py-6"><Loader2 className="w-7 h-7 text-[#16A34A] animate-spin mx-auto" /></div>}

            {/* No match */}
            {d && d.found === false && (
              <div className="bg-white border border-[#E8EDF5] rounded-2xl p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-[#FFF5F5] flex items-center justify-center mx-auto mb-3"><ShieldX className="w-7 h-7 text-[#EF4444]" /></div>
                <p className="font-body text-[16px] font-semibold text-[#1B2A4A]">No matching record found</p>
                <p className="text-[13px] text-[#718096] mt-1">Please check that your name and registration number are exactly as registered.</p>
              </div>
            )}

            {/* Found but result not published */}
            {d && d.found && d.resultPublished === false && (
              <div className="bg-white border border-[#E8EDF5] rounded-2xl overflow-hidden">
                <div className="p-5 bg-[#FFF9E6] flex items-center gap-3">
                  <Award className="w-8 h-8 text-[#B8860B]" />
                  <div>
                    <p className="font-body text-[16px] font-semibold text-[#1B2A4A]">Result not published yet</p>
                    <p className="text-[12px] text-[#718096]">Your record was found, but the result has not been published. Please check again later.</p>
                  </div>
                </div>
                <div className="p-5">
                  <Row k="Student Name" v={d.studentName} />
                  <Row k="Father Name" v={d.fatherName} />
                  <Row k="Date of Birth" v={fmt(d.dob)} />
                  <Row k="Course Name" v={d.courseName} />
                  <Row k="Institute Name & City" v={`${d.instituteName}, ${d.instituteCity}`} />
                </div>
              </div>
            )}

            {/* Result published */}
            {d && d.found && d.resultPublished && (
              <div className="bg-white border border-[#E8EDF5] rounded-2xl overflow-hidden">
                <div className={`p-5 flex items-center gap-3 ${d.resultStatus === 'pass' ? 'bg-[#F0FFF4]' : 'bg-[#FFF5F5]'}`}>
                  {d.resultStatus === 'pass' ? <ShieldCheck className="w-8 h-8 text-[#22C55E]" /> : <ShieldX className="w-8 h-8 text-[#EF4444]" />}
                  <div>
                    <p className="font-body text-[16px] font-semibold text-[#1B2A4A]">Official Result — {d.resultStatus === 'pass' ? 'PASS' : 'FAIL'}</p>
                    <p className="text-[12px] text-[#718096]">Verified from Udaan24 AI Institute records.</p>
                  </div>
                </div>
                <div className="p-5">
                  <Row k="Student Name" v={d.studentName} />
                  <Row k="Father Name" v={d.fatherName} />
                  <Row k="Date of Birth" v={fmt(d.dob)} />
                  <Row k="Course Name" v={d.courseName} />
                  <Row k="Marks" v={`${d.obtainedMarks} / ${d.totalMarks}  (${Number(d.percentage)}%)  ·  Grade ${d.grade}`} />
                  <Row k="Result" v={(d.resultStatus || '').toUpperCase()} />
                  <Row k="Institute Name & City" v={`${d.instituteName}, ${d.instituteCity}`} />
                  <Row k="Registration Number" v={d.registrationNumber} />
                  <Row k="Marksheet No." v={d.marksheetNumber} />
                  <Row k="Issue Date" v={fmt(d.issueDate)} />
                </div>
              </div>
            )}

            <p className="text-center text-[12px] text-[#A0AEC0] mt-6"><Link to="/" className="hover:text-[#1B2A4A]">← Back to Udaan24.com</Link></p>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

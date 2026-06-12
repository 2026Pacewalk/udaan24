import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { trpc } from '@/providers/trpc';
import { ShieldCheck, ShieldX, Search, Loader2, GraduationCap } from 'lucide-react';

const fmt = (d: any) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

export default function Verify() {
  const { number: param } = useParams();
  const [input, setInput] = useState(param || '');
  const [query, setQuery] = useState(param || '');
  useEffect(() => { if (param) { setInput(param); setQuery(param); } }, [param]);

  const cert = trpc.certificates.verify.useQuery({ number: query }, { enabled: !!query });
  const ms = trpc.marksheets.verify.useQuery({ number: query }, { enabled: !!query });
  const loading = !!query && (cert.isLoading || ms.isLoading);
  const c = cert.data?.found ? cert.data : null;
  const m = !c && ms.data?.found ? ms.data : null;
  const notFound = !!query && !loading && !c && !m;

  const Row = ({ k, v }: { k: string; v: any }) => (<div className="flex justify-between gap-3 py-2 border-b border-[#F0F2F7] last:border-0"><span className="text-[13px] text-[#718096]">{k}</span><span className="text-[14px] text-[#1B2A4A] font-medium text-right">{v || '—'}</span></div>);

  return (
    <div className="min-h-screen bg-[#FEFDFB]">
      <Header />
      <main className="pt-[100px] pb-16">
        <div className="container-main max-w-[560px]">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#F5B800] flex items-center justify-center mx-auto mb-3"><GraduationCap className="w-7 h-7 text-[#1B2A4A]" /></div>
            <h1 className="font-display text-[30px] font-semibold text-[#1B2A4A]">Verify Certificate / Marksheet</h1>
            <p className="text-[14px] text-[#718096] mt-1">Enter a certificate or marksheet number (or scan its QR code).</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); setQuery(input.trim()); }} className="flex gap-2 mb-6">
            <div className="flex items-center flex-1 bg-white border border-[#E8EDF5] rounded-lg px-3">
              <Search className="w-4 h-4 text-[#718096] mr-2" />
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="UAN24-CERT-… or UAN24-MS-…" className="flex-1 h-11 bg-transparent text-[14px] outline-none" />
            </div>
            <button type="submit" className="bg-[#1B2A4A] text-white px-5 rounded-lg text-[14px] font-semibold">Verify</button>
          </form>

          {loading && <div className="text-center py-8"><Loader2 className="w-7 h-7 text-[#F5B800] animate-spin mx-auto" /></div>}

          {notFound && (
            <div className="bg-white border border-[#E8EDF5] rounded-2xl p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-[#FFF5F5] flex items-center justify-center mx-auto mb-3"><ShieldX className="w-7 h-7 text-[#EF4444]" /></div>
              <p className="font-body text-[16px] font-semibold text-[#1B2A4A]">No record found</p>
              <p className="text-[13px] text-[#718096] mt-1">No certificate or marksheet matches this number.</p>
            </div>
          )}

          {(c || m) && (
            <div className="bg-white border border-[#E8EDF5] rounded-2xl overflow-hidden">
              <div className={`p-5 flex items-center gap-3 ${(c?.valid || m?.valid) ? 'bg-[#F0FFF4]' : 'bg-[#FFF5F5]'}`}>
                {(c?.valid || m?.valid) ? <ShieldCheck className="w-8 h-8 text-[#22C55E]" /> : <ShieldX className="w-8 h-8 text-[#EF4444]" />}
                <div>
                  <p className="font-body text-[16px] font-semibold text-[#1B2A4A]">{(c?.valid || m?.valid) ? 'Verified · Genuine' : 'Revoked / Invalid'}</p>
                  <p className="text-[12px] text-[#718096]">{c ? 'Certificate' : 'Marksheet'} record found in Udaan24 records.</p>
                </div>
              </div>
              <div className="p-5">
                {c && <>
                  <Row k="Certificate Number" v={c.certificateNumber} />
                  <Row k="Student Name" v={c.studentName} />
                  <Row k="Course" v={c.courseName} />
                  <Row k="Course Duration" v={c.courseDuration} />
                  <Row k="Centre" v={c.centreName ? `${c.centreName}${c.centreCity ? `, ${c.centreCity}` : ''}` : 'Main Office'} />
                  <Row k="Issue Date" v={fmt(c.issueDate)} />
                  <Row k="Status" v={c.status} />
                </>}
                {m && <>
                  <Row k="Marksheet Number" v={m.marksheetNumber} />
                  <Row k="Student Name" v={m.studentName} />
                  <Row k="Course" v={m.courseName} />
                  <Row k="Percentage" v={`${Number(m.percentage)}%`} />
                  <Row k="Grade" v={m.grade} />
                  <Row k="Result" v={m.resultStatus} />
                  <Row k="Issue Date" v={fmt(m.issueDate)} />
                </>}
              </div>
            </div>
          )}

          <p className="text-center text-[12px] text-[#A0AEC0] mt-6"><Link to="/" className="hover:text-[#1B2A4A]">← Back to Udaan24.com</Link></p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

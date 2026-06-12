import { useParams, Link } from 'react-router';
import { trpc } from '@/providers/trpc';
import { Loader2, Printer, ArrowLeft, GraduationCap } from 'lucide-react';

const TITLES: Record<string, string> = {
  one_year: 'One Year Course Certificate',
  six_months: 'Six Months Course Certificate',
  three_months: 'Three Months Course Certificate',
  default: 'Course Completion Certificate',
};
const fmt = (d: any) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—');

export default function Certificate() {
  const { id } = useParams();
  const { data, isLoading } = trpc.certificates.detail.useQuery({ id: Number(id) }, { enabled: !!id });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA]"><Loader2 className="w-8 h-8 text-[#F5B800] animate-spin" /></div>;
  if (!data?.cert) return <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#F5F6FA]"><p className="text-[#718096]">Certificate not found.</p><Link to="/" className="text-[#0071E3]">Home</Link></div>;

  const { cert, student, course, centre } = data;
  const verifyUrl = `${window.location.origin}/verify/${cert.serialNumber}`;
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(verifyUrl)}`;

  return (
    <div className="min-h-screen bg-[#E9EDF3] py-6">
      <style>{`@media print { @page { size: A4 landscape; margin: 0; } body { background: #fff; } .no-print { display: none !important; } .cert-sheet { box-shadow: none !important; margin: 0 !important; } }`}</style>

      <div className="no-print max-w-[1123px] mx-auto px-4 mb-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1.5 text-[13px] text-[#4A5568]"><ArrowLeft className="w-4 h-4" />Home</Link>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#1B2A4A] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold"><Printer className="w-4 h-4" />Print / Download PDF</button>
      </div>

      {/* A4 landscape ≈ 1123 × 794 px @96dpi */}
      <div className="cert-sheet bg-white mx-auto shadow-[0_10px_40px_rgba(27,42,74,0.18)]" style={{ width: 1123, maxWidth: '100%', minHeight: 794 }}>
        <div className="m-[14px] border-[3px] border-[#F5B800] h-[calc(100%-28px)]" style={{ minHeight: 766 }}>
          <div className="border border-[#1B2A4A]/30 m-[8px] px-12 py-10 relative" style={{ minHeight: 742 }}>
            {/* Header */}
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-12 h-12 rounded-xl bg-[#F5B800] flex items-center justify-center"><GraduationCap className="w-7 h-7 text-[#1B2A4A]" /></div>
                <div className="text-left">
                  <p className="font-display text-[26px] font-bold text-[#1B2A4A] leading-none">Udaan24.com</p>
                  <p className="text-[12px] tracking-[0.2em] text-[#F5B800] uppercase">AI Coaching Institute</p>
                </div>
              </div>
              <p className="text-[12px] text-[#718096]">Kotkapura, Punjab</p>
              <h1 className="font-display text-[30px] font-semibold text-[#1B2A4A] mt-5 tracking-[1px]">Certificate of Completion</h1>
              <p className="text-[12px] tracking-[0.18em] text-[#A0772E] uppercase mt-1">{TITLES[cert.certificateType] || TITLES.default}</p>
            </div>

            {/* Photo + body */}
            <div className="flex items-start gap-8 mt-7">
              <div className="flex-shrink-0">
                {student?.photo ? <img src={student.photo} alt="" className="w-[110px] h-[130px] object-cover rounded-md border-2 border-[#E8EDF5]" /> : <div className="w-[110px] h-[130px] rounded-md border-2 border-[#E8EDF5] bg-[#F5F6FA] flex items-center justify-center text-[11px] text-[#A0AEC0]">Photo</div>}
              </div>
              <div className="flex-1 text-center pt-2">
                <p className="text-[14px] text-[#4A5568]">This is to certify that</p>
                <p className="font-display text-[30px] font-semibold text-[#1B2A4A] mt-2 border-b border-dashed border-[#E8EDF5] inline-block px-8 pb-1">{cert.studentName || student?.name}</p>
                <p className="text-[14px] text-[#4A5568] mt-4 leading-relaxed max-w-[620px] mx-auto">
                  son/daughter of <b>{student?.fatherName || '—'}</b>, has successfully completed the course
                  <b className="text-[#1B2A4A]"> {cert.courseName || course?.name}</b>
                  {cert.courseDuration ? <> (Duration: <b>{cert.courseDuration}</b>)</> : null} at our {centre?.name || 'Main Udaan24 Office'}{centre?.city ? `, ${centre.city}` : ''} centre.
                </p>
              </div>
            </div>

            {/* Detail strip */}
            <div className="grid grid-cols-4 gap-4 mt-8 text-[12px]">
              {[
                ['Roll Number', student?.rollNumber],
                ['Centre', centre?.name || 'Main Office'],
                ['Completion Date', fmt(cert.completionDate)],
                ['Certificate No.', cert.serialNumber],
              ].map(([k, v]) => (
                <div key={k as string} className="bg-[#F8FAFC] border border-[#E8EDF5] rounded-md px-3 py-2 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-[#A0AEC0]">{k}</p>
                  <p className="text-[#1B2A4A] font-medium mt-0.5 break-words">{v || '—'}</p>
                </div>
              ))}
            </div>

            {/* Footer: QR, seal, signature */}
            <div className="flex items-end justify-between mt-10">
              <div className="text-center">
                <img src={qr} alt="QR" className="w-[110px] h-[110px]" />
                <p className="text-[10px] text-[#718096] mt-1">Scan to verify</p>
              </div>
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#C9A227] flex items-center justify-center text-[9px] text-[#A0772E] text-center leading-tight">Institute<br />Seal</div>
              <div className="text-center">
                <div className="w-44 border-b border-[#1B2A4A] mb-1" />
                <p className="text-[12px] font-medium text-[#1B2A4A]">Authorized Signatory</p>
                <p className="text-[10px] text-[#718096]">Udaan24.com · Director</p>
              </div>
            </div>
            {cert.status === 'revoked' && <p className="absolute top-2 right-3 text-[11px] font-bold text-red-500 uppercase">Revoked</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

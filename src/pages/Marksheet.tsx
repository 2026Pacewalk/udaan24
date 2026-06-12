import { useParams, Link } from 'react-router';
import { trpc } from '@/providers/trpc';
import { Loader2, Printer, ArrowLeft, GraduationCap } from 'lucide-react';

const fmt = (d: any) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

export default function Marksheet() {
  const { id } = useParams();
  const { data, isLoading } = trpc.marksheets.detail.useQuery({ id: Number(id) }, { enabled: !!id });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA]"><Loader2 className="w-8 h-8 text-[#F5B800] animate-spin" /></div>;
  if (!data?.ms) return <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#F5F6FA]"><p className="text-[#718096]">Marksheet not found.</p><Link to="/" className="text-[#0071E3]">Home</Link></div>;

  const { ms, subjects, student, course, centre } = data;
  const verifyUrl = `${window.location.origin}/verify/${ms.marksheetNumber}`;
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(verifyUrl)}`;

  return (
    <div className="min-h-screen bg-[#E9EDF3] py-6">
      <style>{`@media print { @page { size: A4 portrait; margin: 0; } body { background:#fff; } .no-print { display:none !important; } .ms-sheet { box-shadow:none !important; margin:0 !important; } }`}</style>

      <div className="no-print max-w-[794px] mx-auto px-4 mb-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1.5 text-[13px] text-[#4A5568]"><ArrowLeft className="w-4 h-4" />Home</Link>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#1B2A4A] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold"><Printer className="w-4 h-4" />Print / Download PDF</button>
      </div>

      {/* A4 portrait ≈ 794 × 1123 px @96dpi */}
      <div className="ms-sheet bg-white mx-auto shadow-[0_10px_40px_rgba(27,42,74,0.18)]" style={{ width: 794, maxWidth: '100%', minHeight: 1123 }}>
        <div className="border-[3px] border-[#1B2A4A] m-[14px]" style={{ minHeight: 1095 }}>
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-[#F5B800] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#F5B800] flex items-center justify-center"><GraduationCap className="w-7 h-7 text-[#1B2A4A]" /></div>
                <div>
                  <p className="font-display text-[22px] font-bold text-[#1B2A4A] leading-none">Udaan24.com</p>
                  <p className="text-[10px] tracking-[0.18em] text-[#F5B800] uppercase">AI Coaching Institute · Kotkapura, Punjab</p>
                </div>
              </div>
              {student?.photo ? <img src={student.photo} alt="" className="w-[80px] h-[96px] object-cover rounded border border-[#E8EDF5]" /> : <div className="w-[80px] h-[96px] rounded border border-[#E8EDF5] bg-[#F5F6FA] flex items-center justify-center text-[10px] text-[#A0AEC0]">Photo</div>}
            </div>

            <h1 className="text-center font-display text-[22px] font-semibold text-[#1B2A4A] mt-5">Statement of Marks</h1>

            {/* Student info */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-[13px] mt-5">
              {[
                ['Student Name', student?.name],
                ['Roll Number', student?.rollNumber],
                ['Course', course?.name],
                ['Duration', course?.duration],
                ['Centre', centre ? `${centre.name}${centre.city ? `, ${centre.city}` : ''}` : 'Main Office'],
                ['Marksheet No.', ms.marksheetNumber],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between border-b border-[#F0F2F7] py-1"><span className="text-[#718096]">{k}</span><span className="text-[#1B2A4A] font-medium text-right">{v || '—'}</span></div>
              ))}
            </div>

            {/* Subjects table */}
            <table className="w-full mt-6 border border-[#E8EDF5] text-[13px]">
              <thead className="bg-[#1B2A4A] text-white">
                <tr><th className="text-left p-2.5">Subject / Module</th><th className="p-2.5 w-20 text-center">Max</th><th className="p-2.5 w-24 text-center">Obtained</th><th className="p-2.5 w-16 text-center">Grade</th></tr>
              </thead>
              <tbody>
                {(subjects || []).map((s: any, i: number) => (
                  <tr key={s.id} className={i % 2 ? 'bg-[#F8FAFC]' : ''}>
                    <td className="p-2.5 border-t border-[#E8EDF5] text-[#1B2A4A]">{s.subjectName}</td>
                    <td className="p-2.5 border-t border-[#E8EDF5] text-center">{s.maxMarks}</td>
                    <td className="p-2.5 border-t border-[#E8EDF5] text-center font-medium">{s.obtainedMarks}</td>
                    <td className="p-2.5 border-t border-[#E8EDF5] text-center">{s.grade}</td>
                  </tr>
                ))}
                <tr className="bg-[#FFF9E6] font-semibold text-[#1B2A4A]">
                  <td className="p-2.5 border-t-2 border-[#F5B800]">Total</td>
                  <td className="p-2.5 border-t-2 border-[#F5B800] text-center">{ms.totalMarks}</td>
                  <td className="p-2.5 border-t-2 border-[#F5B800] text-center">{ms.obtainedMarks}</td>
                  <td className="p-2.5 border-t-2 border-[#F5B800] text-center">{ms.grade}</td>
                </tr>
              </tbody>
            </table>

            {/* Result summary */}
            <div className="grid grid-cols-3 gap-3 mt-5 text-center">
              <div className="bg-[#F0F5FF] rounded-lg p-3"><p className="text-[11px] uppercase text-[#718096]">Percentage</p><p className="font-display text-[22px] font-semibold text-[#0071E3]">{Number(ms.percentage)}%</p></div>
              <div className="bg-[#FFF9E6] rounded-lg p-3"><p className="text-[11px] uppercase text-[#718096]">Grade</p><p className="font-display text-[22px] font-semibold text-[#F5B800]">{ms.grade}</p></div>
              <div className={`rounded-lg p-3 ${ms.resultStatus === 'pass' ? 'bg-[#F0FFF4]' : 'bg-[#FFF5F5]'}`}><p className="text-[11px] uppercase text-[#718096]">Result</p><p className={`font-display text-[22px] font-semibold capitalize ${ms.resultStatus === 'pass' ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>{ms.resultStatus}</p></div>
            </div>

            {/* Footer */}
            <div className="flex items-end justify-between mt-10">
              <div className="text-center"><img src={qr} alt="QR" className="w-[100px] h-[100px]" /><p className="text-[10px] text-[#718096] mt-1">Scan to verify · Issued {fmt(ms.issueDate)}</p></div>
              <div className="text-center"><div className="w-40 border-b border-[#1B2A4A] mb-1" /><p className="text-[12px] font-medium text-[#1B2A4A]">Controller of Examinations</p><p className="text-[10px] text-[#718096]">Udaan24.com</p></div>
            </div>
            {ms.status === 'revoked' && <p className="text-center text-[12px] font-bold text-red-500 uppercase mt-3">Revoked</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

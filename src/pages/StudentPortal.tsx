import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { trpc } from '@/providers/trpc';
import {
  GraduationCap, BookOpen, CreditCard, Award, LogOut, Bell, User,
  CheckCircle, AlertCircle, Download, Percent, Loader2, Building2, FileText,
  Copy, Share2, Wallet, Gift, Send, IndianRupee,
} from 'lucide-react';

const STORAGE_KEY = 'udaan24_student_id';

// ─── Login screen ───
function StudentLogin({ onLogin }: { onLogin: (id: number) => void }) {
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const login = trpc.students.login.useMutation({
    onSuccess: (s) => onLogin(s.id),
    onError: (e) => setError(e.message),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA] p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#E8EDF5] p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#F5B800] flex items-center justify-center mx-auto mb-3">
            <GraduationCap className="w-7 h-7 text-[#1B2A4A]" />
          </div>
          <h1 className="font-display text-[20px] font-semibold text-[#1B2A4A]">Student Portal</h1>
          <p className="text-[13px] text-[#718096]">Login with your Student ID or username</p>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); setError(''); login.mutate({ rollNumber: rollNumber.trim(), password }); }}
          className="space-y-3"
        >
          <div>
            <label className="text-[13px] font-medium text-[#1B2A4A] mb-1 block">Student ID or Username</label>
            <input value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} required
              className="w-full h-10 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] outline-none focus:border-[#F5B800]"
              placeholder="UAN24XXXX or username" />
          </div>
          <div>
            <label className="text-[13px] font-medium text-[#1B2A4A] mb-1 block">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full h-10 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] outline-none focus:border-[#F5B800]"
              placeholder="••••••••" />
          </div>
          {error && <p className="text-[12px] text-red-500">{error}</p>}
          <button type="submit" disabled={login.isPending}
            className="w-full h-10 bg-[#F5B800] text-[#1B2A4A] rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-[#E0A800] disabled:opacity-60">
            {login.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign in'}
          </button>
        </form>
        <Link to="/" className="block text-center text-[12px] text-[#718096] mt-4 hover:text-[#1B2A4A]">← Back to website</Link>
      </div>
    </div>
  );
}

// ─── Stat tile ───
function Tile({ icon: Icon, label, value, color, bg }: any) {
  return (
    <div className="bg-white rounded-xl border border-[#E8EDF5] p-5">
      <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}><Icon className={`w-5 h-5 ${color}`} /></div>
      <p className="font-display text-[22px] font-semibold text-[#1B2A4A]">{value}</p>
      <p className="text-[12px] text-[#718096] mt-0.5">{label}</p>
    </div>
  );
}

// ─── Dashboard ───
function StudentDashboard({ studentId, onLogout }: { studentId: number; onLogout: () => void }) {
  const { data, isLoading, error } = trpc.students.dashboard.useQuery({ studentId });
  const { data: myMarksheets } = trpc.marksheets.byStudent.useQuery({ studentId });
  const [tab, setTab] = useState('dashboard');

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA]"><Loader2 className="w-8 h-8 text-[#F5B800] animate-spin" /></div>;
  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F6FA] gap-3">
        <p className="text-[14px] text-[#718096]">Could not load your data.</p>
        <button onClick={onLogout} className="bg-[#F5B800] text-[#1B2A4A] px-4 py-2 rounded-lg text-[13px] font-semibold">Back to login</button>
      </div>
    );
  }

  const { student, course, center, attendance, results, payments, certificates, notifications } = data;
  const feeColor = student.feeStatus === 'paid' ? 'text-[#22C55E]' : student.feeStatus === 'partial' ? 'text-[#F5B800]' : 'text-[#EF4444]';

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'refer', label: 'Refer & Earn' },
    { id: 'buy', label: 'Buy Course' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* Top bar */}
      <header className="bg-[#1B2A4A] text-white">
        <div className="max-w-[1100px] mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#F5B800] flex items-center justify-center"><GraduationCap className="w-5 h-5 text-[#1B2A4A]" /></div>
            <span className="font-display text-[16px] font-semibold">Udaan24 Student</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[13px] font-medium leading-tight">{student.name}</p>
              <p className="text-[11px] text-white/60">{student.rollNumber}</p>
            </div>
            {student.photo ? <img src={student.photo} alt="" className="w-9 h-9 rounded-full object-cover" /> : <div className="w-9 h-9 rounded-full bg-[#F5B800] flex items-center justify-center text-[#1B2A4A] text-[13px] font-bold">{student.name.charAt(0)}</div>}
            <button onClick={onLogout} className="text-white/60 hover:text-white" title="Logout"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="max-w-[1100px] mx-auto px-4 flex gap-1">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${tab === t.id ? 'border-[#F5B800] text-white' : 'border-transparent text-white/50 hover:text-white'}`}>{t.label}</button>
          ))}
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-4 py-6 space-y-6">
        {tab === 'refer' && <ReferEarnView studentId={studentId} studentName={student.name} />}
        {tab === 'buy' && <BuyCourseView studentId={studentId} />}
        {tab === 'dashboard' && <>
        {student.admissionStatus !== 'completed' && (
          <div className="bg-[#FFF9E6] border border-[#F5B800]/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#F5B800] flex-shrink-0" />
              <div>
                <p className="text-[14px] font-semibold text-[#1B2A4A]">Complete your admission details</p>
                <p className="text-[12px] text-[#718096]">Your certificate, exam and course access stay limited until your mandatory admission form is completed.</p>
              </div>
            </div>
            <Link to="/admission" className="bg-[#F5B800] text-[#1B2A4A] px-4 py-2 rounded-lg text-[13px] font-semibold whitespace-nowrap text-center">Complete Now</Link>
          </div>
        )}
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Tile icon={Percent} label="Attendance" value={`${attendance.percentage}%`} color="text-[#0071E3]" bg="bg-[#F0F5FF]" />
          <Tile icon={Award} label="Exam Results" value={results.length} color="text-[#22C55E]" bg="bg-[#F0FFF4]" />
          <Tile icon={CreditCard} label="Fee Status" value={<span className={`capitalize ${feeColor}`}>{student.feeStatus}</span>} color="text-[#F5B800]" bg="bg-[#FFF9E6]" />
          <Tile icon={Award} label="Certificates" value={certificates.length} color="text-orange-500" bg="bg-orange-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile + course + centre */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#E8EDF5] p-5">
              <h3 className="font-body text-[14px] font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2"><User className="w-4 h-4 text-[#F5B800]" />Profile</h3>
              <dl className="space-y-2 text-[13px]">
                <div className="flex justify-between"><dt className="text-[#718096]">Name</dt><dd className="text-[#1B2A4A] font-medium">{student.name}</dd></div>
                <div className="flex justify-between"><dt className="text-[#718096]">Student ID</dt><dd className="text-[#1B2A4A] font-medium">{student.rollNumber}</dd></div>
                {student.username && <div className="flex justify-between"><dt className="text-[#718096]">Username</dt><dd className="text-[#1B2A4A] font-medium">{student.username}</dd></div>}
                <div className="flex justify-between"><dt className="text-[#718096]">Phone</dt><dd className="text-[#1B2A4A]">{student.phone || '-'}</dd></div>
                <div className="flex justify-between"><dt className="text-[#718096]">Admission</dt><dd className="text-[#1B2A4A]">{student.admissionStatus === 'completed' ? (student.feeStatus === 'paid' ? 'Fully Admitted' : 'Payment Pending') : student.admissionStatus === 'in_progress' ? 'Profile Incomplete' : 'Pending'}</dd></div>
                <div className="flex justify-between"><dt className="text-[#718096]">Status</dt><dd className="text-[#1B2A4A] capitalize">{student.status}</dd></div>
              </dl>
            </div>
            <div className="bg-white rounded-xl border border-[#E8EDF5] p-5">
              <h3 className="font-body text-[14px] font-semibold text-[#1B2A4A] mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4 text-[#F5B800]" />My Course</h3>
              {course ? (
                <>
                  <p className="text-[14px] font-medium text-[#1B2A4A]">{course.name}</p>
                  <p className="text-[12px] text-[#718096] mt-1">{course.duration} · {course.mode}</p>
                  <p className="text-[12px] text-[#4A5568] mt-2">{course.certification}</p>
                </>
              ) : <p className="text-[13px] text-[#718096]">No course assigned</p>}
            </div>
            <div className="bg-white rounded-xl border border-[#E8EDF5] p-5">
              <h3 className="font-body text-[14px] font-semibold text-[#1B2A4A] mb-3 flex items-center gap-2"><Building2 className="w-4 h-4 text-[#F5B800]" />My Centre</h3>
              {center ? (
                <>
                  <p className="text-[14px] font-medium text-[#1B2A4A]">{center.name}</p>
                  <p className="text-[12px] text-[#718096] mt-1">{center.centerCode} · {center.city}, {center.state}</p>
                </>
              ) : <p className="text-[13px] text-[#718096]">No centre assigned</p>}
            </div>
          </div>

          {/* Results + fees */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-[#E8EDF5] p-5">
              <h3 className="font-body text-[14px] font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-[#F5B800]" />Exam Results & Marksheet</h3>
              {results.length === 0 ? <p className="text-[13px] text-[#718096]">No results published yet.</p> : (
                <div className="space-y-2">
                  {results.map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between p-3 bg-[#F5F6FA] rounded-lg">
                      <div>
                        <p className="text-[13px] font-medium text-[#1B2A4A]">Exam #{r.examId} — {r.grade}</p>
                        <p className="text-[12px] text-[#718096]">{r.marksObtained}/{r.totalMarks} ({r.percentage}%)</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${r.status === 'pass' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{r.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {certificates.length > 0 && (
              <div className="bg-white rounded-xl border border-[#E8EDF5] p-5">
                <h3 className="font-body text-[14px] font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-[#F5B800]" />Certificates</h3>
                <div className="space-y-2">
                  {certificates.map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-[#F5F6FA] rounded-lg">
                      <div>
                        <p className="text-[13px] font-medium text-[#1B2A4A]">{c.courseName}</p>
                        <p className="text-[12px] font-mono text-[#F5B800]">{c.serialNumber}</p>
                      </div>
                      <a href={`/certificate/${c.id}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[12px] text-[#0071E3] font-medium"><Download className="w-3.5 h-3.5" />View / Download</a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(myMarksheets || []).length > 0 && (
              <div className="bg-white rounded-xl border border-[#E8EDF5] p-5">
                <h3 className="font-body text-[14px] font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-[#F5B800]" />Marksheets</h3>
                <div className="space-y-2">
                  {(myMarksheets || []).map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-[#F5F6FA] rounded-lg">
                      <div>
                        <p className="text-[13px] font-medium text-[#1B2A4A]">{Number(m.percentage)}% · Grade {m.grade} · <span className="capitalize">{m.resultStatus}</span></p>
                        <p className="text-[12px] font-mono text-[#F5B800]">{m.marksheetNumber}</p>
                      </div>
                      <a href={`/marksheet/${m.id}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[12px] text-[#0071E3] font-medium"><Download className="w-3.5 h-3.5" />View / Download</a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-[#E8EDF5] p-5">
              <h3 className="font-body text-[14px] font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-[#F5B800]" />Fee & Payments</h3>
              <div className="flex items-center gap-2 mb-3">
                {student.feeStatus === 'paid' ? <CheckCircle className="w-4 h-4 text-[#22C55E]" /> : <AlertCircle className="w-4 h-4 text-[#F5B800]" />}
                <span className="text-[13px] text-[#4A5568]">Current status: <span className={`capitalize font-medium ${feeColor}`}>{student.feeStatus}</span></span>
              </div>
              {payments.length === 0 ? <p className="text-[13px] text-[#718096]">No payment records.</p> : (
                <div className="space-y-2">
                  {payments.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-[#F5F6FA] rounded-lg text-[13px]">
                      <span className="text-[#1B2A4A]">₹{Number(p.amount).toLocaleString()} · {p.paymentMethod}</span>
                      <span className="font-mono text-[12px] text-[#718096]">{p.receiptNumber}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-[#E8EDF5] p-5">
              <h3 className="font-body text-[14px] font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-[#F5B800]" />Notifications</h3>
              {notifications.length === 0 ? <p className="text-[13px] text-[#718096]">No notifications.</p> : (
                <div className="space-y-2">
                  {notifications.map((n: any) => (
                    <div key={n.id} className="p-3 bg-[#F5F6FA] rounded-lg">
                      <p className="text-[13px] font-medium text-[#1B2A4A]">{n.title}</p>
                      <p className="text-[12px] text-[#718096]">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        </>}
      </main>
    </div>
  );
}

// ════════ REFER & EARN ════════
function SummaryCard({ label, value, color }: { label: string; value: any; color?: string }) {
  return (
    <div className="bg-white rounded-xl border border-[#E8EDF5] p-4">
      <p className={`font-display text-[20px] font-semibold ${color || 'text-[#1B2A4A]'}`}>{value}</p>
      <p className="text-[11px] text-[#718096] mt-0.5">{label}</p>
    </div>
  );
}

function ReferEarnView({ studentId, studentName }: { studentId: number; studentName: string }) {
  const utils = trpc.useUtils();
  const { data: me } = trpc.referrals.me.useQuery({ studentId });
  const { data: ov } = trpc.referrals.overview.useQuery({ studentId });
  const { data: refs } = trpc.referrals.referrals.useQuery({ studentId });
  const { data: wallet } = trpc.referrals.wallet.useQuery({ studentId });
  const { data: statements } = trpc.referrals.statements.useQuery({ studentId });
  const { data: payouts } = trpc.referrals.payouts.useQuery({ studentId });
  const [copied, setCopied] = useState(false);
  const [payout, setPayout] = useState<any>({ paymentMode: 'upi' });
  const [msg, setMsg] = useState('');

  const requestPayout = trpc.referrals.requestPayout.useMutation({
    onSuccess: () => { setMsg('Payout request submitted ✓'); setPayout({ paymentMode: 'upi' }); utils.referrals.wallet.invalidate({ studentId }); utils.referrals.payouts.invalidate({ studentId }); utils.referrals.statements.invalidate({ studentId }); },
    onError: (e) => setMsg(e.message),
  });

  if (!me) return <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 text-[#F5B800] animate-spin" /></div>;

  const link = `${window.location.origin}${me.referralPath}`;
  const waText = encodeURIComponent(`Join Udaan24 AI Coaching and get 5% off any course! Register with my link: ${link}`);
  const badge = (s: string) => {
    const m: Record<string, string> = { registered: 'bg-blue-50 text-blue-700', purchased: 'bg-purple-50 text-purple-700', pending: 'bg-yellow-50 text-yellow-700', approved: 'bg-green-50 text-green-700', paid: 'bg-green-50 text-green-700', cancelled: 'bg-red-50 text-red-600', requested: 'bg-yellow-50 text-yellow-700', rejected: 'bg-red-50 text-red-600' };
    return `px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${m[s] || 'bg-gray-100 text-gray-600'}`;
  };

  if (!me.settings.enabled) return <div className="bg-white rounded-xl border border-[#E8EDF5] p-8 text-center text-[#718096]">The Refer & Earn program is currently disabled.</div>;

  return (
    <div className="space-y-6">
      {/* Referral link card */}
      <div className="bg-gradient-to-br from-[#1B2A4A] to-[#2A3F5F] rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-2"><Gift className="w-5 h-5 text-[#F5B800]" /><h3 className="font-display text-[18px] font-semibold">Refer & Earn</h3></div>
        <p className="text-[13px] text-white/70 mb-4">Share your link — friends get <b>{me.settings.discountPercent}% off</b>, you earn <b>{me.settings.commissionPercent}% commission</b> on their purchase.</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-[13px] font-mono truncate">{link}</div>
          <button onClick={() => { navigator.clipboard?.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="bg-[#F5B800] text-[#1B2A4A] px-4 py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1.5"><Copy className="w-4 h-4" />{copied ? 'Copied!' : 'Copy'}</button>
          <a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noreferrer" className="bg-[#25D366] text-white px-4 py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1.5"><Share2 className="w-4 h-4" />WhatsApp</a>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <SummaryCard label="Total Referrals" value={ov?.totalReferrals ?? 0} />
        <SummaryCard label="Purchases" value={ov?.successfulPurchases ?? 0} />
        <SummaryCard label="Pending" value={`₹${ov?.pendingCommission ?? 0}`} color="text-[#F5B800]" />
        <SummaryCard label="Approved" value={`₹${ov?.approvedCommission ?? 0}`} color="text-[#22C55E]" />
        <SummaryCard label="Paid" value={`₹${ov?.paidCommission ?? 0}`} color="text-[#0071E3]" />
        <SummaryCard label="Wallet Balance" value={`₹${ov?.walletBalance ?? 0}`} color="text-[#1B2A4A]" />
      </div>

      {/* Referral tracking table */}
      <div className="bg-white rounded-xl border border-[#E8EDF5] overflow-hidden">
        <div className="p-4 border-b border-[#E8EDF5]"><h3 className="font-body text-[15px] font-semibold text-[#1B2A4A]">Your Referrals</h3></div>
        <div className="overflow-x-auto"><table className="w-full">
          <thead className="bg-[#F5F6FA]"><tr className="text-left text-[11px] text-[#718096] uppercase"><th className="p-3 font-medium">Student</th><th className="p-3 font-medium">Contact</th><th className="p-3 font-medium">Amount</th><th className="p-3 font-medium">Discount</th><th className="p-3 font-medium">Commission</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Date</th></tr></thead>
          <tbody className="divide-y divide-[#E8EDF5]">
            {(refs || []).length === 0 ? <tr><td colSpan={7} className="p-8 text-center text-[#718096] text-[13px]">No referrals yet — share your link to start earning.</td></tr> :
              (refs || []).map((r: any) => (
                <tr key={r.id} className="hover:bg-[#F5F6FA]">
                  <td className="p-3 text-[13px] font-medium text-[#1B2A4A]">{r.referredName}</td>
                  <td className="p-3 text-[12px] text-[#718096]">{r.referredPhone || r.referredEmail || '-'}</td>
                  <td className="p-3 text-[13px]">{r.courseAmount ? `₹${Number(r.courseAmount).toLocaleString('en-IN')}` : '-'}</td>
                  <td className="p-3 text-[13px] text-[#22C55E]">{r.discountAmount ? `₹${Number(r.discountAmount).toLocaleString('en-IN')}` : '-'}</td>
                  <td className="p-3 text-[13px] font-medium">{r.commissionAmount ? `₹${Number(r.commissionAmount).toLocaleString('en-IN')}` : '-'}</td>
                  <td className="p-3"><span className={badge(r.commissionStatus || r.referralStatus)}>{r.commissionStatus || r.referralStatus}</span></td>
                  <td className="p-3 text-[12px] text-[#718096]">{new Date(r.date).toLocaleDateString()}</td>
                </tr>
              ))}
          </tbody>
        </table></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wallet + payout */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E8EDF5] p-5">
            <h3 className="font-body text-[15px] font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2"><Wallet className="w-4 h-4 text-[#F5B800]" />Wallet</h3>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div><span className="text-[#718096]">Balance</span><p className="font-display text-[20px] font-semibold text-[#1B2A4A]">₹{wallet?.walletBalance ?? 0}</p></div>
              <div><span className="text-[#718096]">Available to withdraw</span><p className="font-display text-[20px] font-semibold text-[#22C55E]">₹{wallet?.available ?? 0}</p></div>
              <div><span className="text-[#718096]">Total Earned</span><p className="text-[#1B2A4A] font-medium">₹{wallet?.totalEarned ?? 0}</p></div>
              <div><span className="text-[#718096]">Total Withdrawn</span><p className="text-[#1B2A4A] font-medium">₹{wallet?.totalWithdrawn ?? 0}</p></div>
              <div><span className="text-[#718096]">Pending Payout</span><p className="text-[#1B2A4A] font-medium">₹{wallet?.pendingPayout ?? 0}</p></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E8EDF5] p-5">
            <h3 className="font-body text-[15px] font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2"><Send className="w-4 h-4 text-[#F5B800]" />Request Payout</h3>
            <form onSubmit={(e) => { e.preventDefault(); setMsg(''); requestPayout.mutate({ studentId, amount: Number(payout.amount), paymentMode: payout.paymentMode, upiId: payout.upiId, accountHolderName: payout.accountHolderName, accountNumber: payout.accountNumber, ifscCode: payout.ifscCode, bankName: payout.bankName, remarks: payout.remarks }); }} className="space-y-3">
              <input type="number" required placeholder={`Amount (min ₹${me.settings.minPayout})`} value={payout.amount || ''} onChange={(e) => setPayout({ ...payout, amount: e.target.value })} className="w-full h-10 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] outline-none focus:border-[#F5B800]" />
              <select value={payout.paymentMode} onChange={(e) => setPayout({ ...payout, paymentMode: e.target.value })} className="w-full h-10 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] outline-none focus:border-[#F5B800]">
                {me.settings.payoutModes.map((m: string) => <option key={m} value={m}>{m.toUpperCase()}</option>)}
              </select>
              {payout.paymentMode === 'upi' && <input placeholder="UPI ID" value={payout.upiId || ''} onChange={(e) => setPayout({ ...payout, upiId: e.target.value })} className="w-full h-10 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] outline-none focus:border-[#F5B800]" />}
              {payout.paymentMode === 'bank' && <div className="grid grid-cols-2 gap-2">
                <input placeholder="Account holder" value={payout.accountHolderName || ''} onChange={(e) => setPayout({ ...payout, accountHolderName: e.target.value })} className="h-10 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] outline-none focus:border-[#F5B800]" />
                <input placeholder="Account number" value={payout.accountNumber || ''} onChange={(e) => setPayout({ ...payout, accountNumber: e.target.value })} className="h-10 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] outline-none focus:border-[#F5B800]" />
                <input placeholder="IFSC" value={payout.ifscCode || ''} onChange={(e) => setPayout({ ...payout, ifscCode: e.target.value })} className="h-10 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] outline-none focus:border-[#F5B800]" />
                <input placeholder="Bank name" value={payout.bankName || ''} onChange={(e) => setPayout({ ...payout, bankName: e.target.value })} className="h-10 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] outline-none focus:border-[#F5B800]" />
              </div>}
              <input placeholder="Remarks (optional)" value={payout.remarks || ''} onChange={(e) => setPayout({ ...payout, remarks: e.target.value })} className="w-full h-10 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] outline-none focus:border-[#F5B800]" />
              {msg && <p className={`text-[12px] ${msg.includes('✓') ? 'text-green-600' : 'text-red-500'}`}>{msg}</p>}
              <button type="submit" disabled={requestPayout.isPending} className="w-full h-10 bg-[#F5B800] text-[#1B2A4A] rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 disabled:opacity-60">{requestPayout.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}Request Payout</button>
            </form>
            {(payouts || []).length > 0 && <div className="mt-4 space-y-1.5">
              {(payouts || []).map((p: any) => <div key={p.id} className="flex items-center justify-between text-[12px]"><span className="text-[#4A5568]">₹{Number(p.amount).toLocaleString('en-IN')} · {p.paymentMode}</span><span className={badge(p.status)}>{p.status}</span></div>)}
            </div>}
          </div>
        </div>

        {/* Statement / ledger */}
        <div className="bg-white rounded-xl border border-[#E8EDF5] overflow-hidden">
          <div className="p-4 border-b border-[#E8EDF5]"><h3 className="font-body text-[15px] font-semibold text-[#1B2A4A] flex items-center gap-2"><FileText className="w-4 h-4 text-[#F5B800]" />Wallet Statement</h3></div>
          <div className="overflow-x-auto max-h-[460px]"><table className="w-full">
            <thead className="bg-[#F5F6FA] sticky top-0"><tr className="text-left text-[11px] text-[#718096] uppercase"><th className="p-3 font-medium">Date</th><th className="p-3 font-medium">Type</th><th className="p-3 font-medium">Credit</th><th className="p-3 font-medium">Debit</th><th className="p-3 font-medium">Balance</th></tr></thead>
            <tbody className="divide-y divide-[#E8EDF5]">
              {(statements || []).length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-[#718096] text-[13px]">No transactions yet.</td></tr> :
                (statements || []).map((s: any) => (
                  <tr key={s.id} className="hover:bg-[#F5F6FA]">
                    <td className="p-3 text-[12px] text-[#718096]">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-[12px] text-[#1B2A4A] capitalize">{s.transactionType.replace(/_/g, ' ')}</td>
                    <td className="p-3 text-[13px] text-[#22C55E]">{Number(s.creditAmount) > 0 ? `+₹${Number(s.creditAmount).toLocaleString('en-IN')}` : '-'}</td>
                    <td className="p-3 text-[13px] text-[#EF4444]">{Number(s.debitAmount) > 0 ? `-₹${Number(s.debitAmount).toLocaleString('en-IN')}` : '-'}</td>
                    <td className="p-3 text-[13px] font-medium">₹{Number(s.balanceAfter).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
            </tbody>
          </table></div>
        </div>
      </div>
    </div>
  );
}

// ════════ BUY COURSE (checkout placeholder — fires referral discount + commission) ════════
function BuyCourseView({ studentId }: { studentId: number }) {
  const navigate = useNavigate();
  const { data: courses } = trpc.courses.list.useQuery();
  const [selected, setSelected] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const { data: preview } = trpc.referrals.checkoutPreview.useQuery({ referredStudentId: studentId, courseId: selected?.id || 0 }, { enabled: !!selected });
  const referral = trpc.referrals.recordPurchase.useMutation();
  const payOnline = trpc.students.payOnline.useMutation();
  const [paying, setPaying] = useState(false);
  // Razorpay placeholder: record referral commission + mark the student's online
  // payment, then send them to the mandatory admission form.
  const pay = async () => {
    setPaying(true);
    const r = await referral.mutateAsync({ referredStudentId: studentId, courseId: selected.id, paymentRef: `PAY-${Date.now().toString(36).toUpperCase()}` }).catch(() => null);
    await payOnline.mutateAsync({ studentId, courseId: selected.id }).catch(() => null);
    setResult(r || { finalPayable: selected.fee, discountAmount: 0 });
    setPaying(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-[22px] font-semibold text-[#1B2A4A]">Buy a Course</h2>
      <p className="text-[13px] text-[#718096]">If you registered via a referral link, a 5% discount is applied automatically at checkout.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(courses || []).map((c: any) => (
          <div key={c.id} className="bg-white rounded-xl border border-[#E8EDF5] p-5">
            <div className="flex items-center gap-2 mb-2"><BookOpen className="w-4 h-4 text-[#F5B800]" /><span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FFF9E6] text-[#1B2A4A] capitalize">{(c.category || '').replace('_', ' ')}</span></div>
            <h3 className="font-body text-[15px] font-semibold text-[#1B2A4A]">{c.name}</h3>
            <p className="text-[12px] text-[#718096] mt-1">{c.duration} · {c.mode}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="font-display text-[18px] font-semibold text-[#F5B800]">₹{Number(c.fee).toLocaleString('en-IN')}</span>
              <button onClick={() => { setSelected(c); setResult(null); }} className="bg-[#1B2A4A] text-white text-[12px] font-semibold px-4 py-2 rounded-lg">Buy</button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-[rgba(27,42,74,0.5)]" />
          <div className="relative bg-white rounded-2xl w-full max-w-[420px] z-10 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-[18px] font-semibold text-[#1B2A4A] mb-1">Checkout</h3>
            <p className="text-[13px] text-[#718096] mb-4">{selected.name}</p>
            {result ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-[#F0FFF4] flex items-center justify-center mx-auto mb-3"><CheckCircle className="w-7 h-7 text-[#22C55E]" /></div>
                <p className="font-body text-[16px] font-semibold text-[#1B2A4A]">Payment successful!</p>
                <p className="text-[13px] text-[#718096] mt-1">Paid ₹{Number(result.finalPayable).toLocaleString('en-IN')}{Number(result.discountAmount) > 0 ? ` (saved ₹${Number(result.discountAmount).toLocaleString('en-IN')})` : ''}.</p>
                {result.referral && <p className="text-[12px] text-green-600 mt-1">Your referrer earned ₹{Number(result.commissionAmount).toLocaleString('en-IN')} commission ({result.status}).</p>}
                <p className="text-[12px] text-[#718096] mt-2">Next: complete your mandatory admission details.</p>
                <button onClick={() => navigate('/admission')} className="btn-primary w-full mt-4 py-2.5">Continue to Admission Form</button>
              </div>
            ) : (
              <>
                <div className="space-y-2 text-[14px] border border-[#E8EDF5] rounded-lg p-4 mb-4">
                  <div className="flex justify-between"><span className="text-[#718096]">Course price</span><span className="text-[#1B2A4A]">₹{Number(preview?.courseAmount || selected.fee).toLocaleString('en-IN')}</span></div>
                  {preview?.hasReferral && <div className="flex justify-between text-[#22C55E]"><span>Referral discount ({preview.discountPercent}%)</span><span>-₹{Number(preview.discountAmount).toLocaleString('en-IN')}</span></div>}
                  <div className="flex justify-between font-semibold text-[#1B2A4A] border-t border-[#E8EDF5] pt-2"><span>Final payable</span><span>₹{Number(preview?.finalPayable || selected.fee).toLocaleString('en-IN')}</span></div>
                </div>
                <button onClick={pay} disabled={paying} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">{paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <IndianRupee className="w-4 h-4" />}Pay Now (Razorpay)</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentPortal() {
  const [studentId, setStudentId] = useState<number | null>(() => {
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? Number(v) : null;
  });

  useEffect(() => {
    if (studentId) localStorage.setItem(STORAGE_KEY, String(studentId));
    else localStorage.removeItem(STORAGE_KEY);
  }, [studentId]);

  if (!studentId) return <StudentLogin onLogin={setStudentId} />;
  return <StudentDashboard studentId={studentId} onLogout={() => setStudentId(null)} />;
}

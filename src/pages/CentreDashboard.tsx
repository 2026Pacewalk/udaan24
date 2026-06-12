import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { trpc } from '@/providers/trpc';
import ImageUpload from '@/components/ImageUpload';
import {
  Building2, Users, LogOut, Loader2, GraduationCap, CheckCircle, Award, CreditCard,
  BookOpen, FileText, Download, ClipboardList, Plus, X, Save, LayoutDashboard, Menu,
  Wallet, Send, Gift,
} from 'lucide-react';

const STORAGE_KEY = 'udaan24_center_id';

// ─── Login ───
function CentreLogin({ onLogin }: { onLogin: (id: number) => void }) {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = trpc.centers.login.useMutation({ onSuccess: (c) => onLogin(c.id), onError: (e) => setError(e.message) });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA] p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#E8EDF5] p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#F5B800] flex items-center justify-center mx-auto mb-3"><Building2 className="w-7 h-7 text-[#1B2A4A]" /></div>
          <h1 className="font-display text-[20px] font-semibold text-[#1B2A4A]">Study Centre Login</h1>
          <p className="text-[13px] text-[#718096]">Login with your centre code</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setError(''); login.mutate({ code, password }); }} className="space-y-3">
          <div>
            <label className="text-[13px] font-medium text-[#1B2A4A] mb-1 block">Centre Code</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} required className="w-full h-10 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] outline-none focus:border-[#F5B800]" placeholder="UAN24-KKP" />
          </div>
          <div>
            <label className="text-[13px] font-medium text-[#1B2A4A] mb-1 block">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full h-10 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] outline-none focus:border-[#F5B800]" placeholder="••••••••" />
          </div>
          {error && <p className="text-[12px] text-red-500">{error}</p>}
          <button type="submit" disabled={login.isPending} className="w-full h-10 bg-[#F5B800] text-[#1B2A4A] rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-[#E0A800] disabled:opacity-60">
            {login.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign in'}
          </button>
        </form>
        <Link to="/" className="block text-center text-[12px] text-[#718096] mt-4 hover:text-[#1B2A4A]">← Back to website</Link>
      </div>
    </div>
  );
}

function Tile({ icon: Icon, label, value, color, bg }: any) {
  return (
    <div className="bg-white rounded-xl border border-[#E8EDF5] p-5">
      <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}><Icon className={`w-5 h-5 ${color}`} /></div>
      <p className="font-display text-[22px] font-semibold text-[#1B2A4A]">{value}</p>
      <p className="text-[12px] text-[#718096] mt-0.5">{label}</p>
    </div>
  );
}

const badge = (s: string) => {
  const map: Record<string, string> = {
    active: 'bg-green-50 text-green-700', inactive: 'bg-gray-100 text-gray-600', pending: 'bg-yellow-50 text-yellow-700',
    paid: 'bg-green-50 text-green-700', partial: 'bg-orange-50 text-orange-700', pass: 'bg-green-50 text-green-700',
    fail: 'bg-red-50 text-red-600', issued: 'bg-green-50 text-green-700', revoked: 'bg-red-50 text-red-600',
  };
  return `px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${map[s] || 'bg-gray-100 text-gray-600'}`;
};

// ─── Generate & share an admission-form link for a new student ───
function ShareLinkModal({ centerId, onClose, onDone }: { centerId: number; onClose: () => void; onDone: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const gen = trpc.students.createAdmissionLink.useMutation({
    onSuccess: (r) => { setLink(`${window.location.origin}/admission/${r.token}`); onDone(); },
    onError: (e) => setError(e.message),
  });
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[rgba(27,42,74,0.5)]" />
      <div className="relative bg-white rounded-2xl w-full max-w-[460px] z-10 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4"><h3 className="font-display text-[18px] font-semibold text-[#1B2A4A]">Share Admission Form Link</h3><button onClick={onClose}><X className="w-5 h-5 text-[#718096]" /></button></div>
        {!link ? (
          <form onSubmit={(e) => { e.preventDefault(); setError(''); if (!name.trim()) return setError('Student name is required.'); gen.mutate({ centerId, name: name.trim(), phone: phone || undefined }); }} className="space-y-3">
            <p className="text-[12px] text-[#718096]">Create a link the student opens to fill their own 3-step admission form. Your centre auto-fills as their centre.</p>
            <input required placeholder="Student name *" value={name} onChange={(e) => setName(e.target.value)} className="w-full h-10 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] outline-none focus:border-[#F5B800]" />
            <input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-10 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] outline-none focus:border-[#F5B800]" />
            {error && <p className="text-[12px] text-red-500">{error}</p>}
            <button type="submit" disabled={gen.isPending} className="w-full h-10 bg-[#F5B800] text-[#1B2A4A] rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 disabled:opacity-60">{gen.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}Generate Link</button>
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-[13px] text-green-700 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" />Link generated — share it with the student.</p>
            <div className="flex gap-2">
              <input readOnly value={link} className="flex-1 h-10 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[12px] font-mono outline-none" />
              <button onClick={() => { navigator.clipboard?.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="bg-[#F5B800] text-[#1B2A4A] px-4 rounded-lg text-[13px] font-semibold">{copied ? 'Copied!' : 'Copy'}</button>
            </div>
            <a href={`https://wa.me/?text=${encodeURIComponent('Complete your Udaan24 admission form: ' + link)}`} target="_blank" rel="noreferrer" className="block text-center bg-[#25D366] text-white py-2.5 rounded-lg text-[13px] font-semibold">Share on WhatsApp</a>
            <button onClick={onClose} className="w-full h-10 border border-[#E8EDF5] rounded-lg text-[13px] font-medium">Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Add / Edit Student modal ───
function StudentModal({ centerId, student, onClose, onDone }: { centerId: number; student?: any; onClose: () => void; onDone: () => void }) {
  const editing = !!student;
  const [form, setForm] = useState<any>(student ? { name: student.name, phone: student.phone, email: student.email, courseId: student.courseId, category: student.category, aadharNumber: student.aadharNumber, photo: student.photo, feeStatus: student.feeStatus, paymentMode: student.paymentMode, paymentReceivedDate: student.paymentReceivedDate ? new Date(student.paymentReceivedDate).toISOString().slice(0, 10) : '', paymentReference: student.paymentReference, paymentRemarks: student.paymentRemarks } : { feeStatus: 'pending' });
  const [error, setError] = useState('');
  const { data: courses } = trpc.courses.list.useQuery();
  const onErr = (e: any) => setError(e.message);
  const done = () => { onDone(); onClose(); };
  const create = trpc.students.createByCenter.useMutation({ onSuccess: done, onError: onErr });
  const update = trpc.students.updateByCenter.useMutation({ onSuccess: done, onError: onErr });
  const pending = create.isPending || update.isPending;
  const cls = "w-full h-10 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] outline-none focus:border-[#F5B800]";

  const submit = (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    // Validation: payment mode + date required once payment is marked received.
    if ((form.feeStatus === 'paid' || form.feeStatus === 'partial')) {
      if (!form.paymentMode) return setError('Select a payment mode for received payment.');
      if (!form.paymentReceivedDate) return setError('Payment received date is required.');
    }
    const pay = { feeStatus: form.feeStatus || undefined, paymentMode: form.paymentMode || undefined, paymentReceivedDate: form.paymentReceivedDate || undefined, paymentReference: form.paymentReference || undefined, paymentRemarks: form.paymentRemarks || undefined };
    if (editing) update.mutate({ centerId, id: student.id, name: form.name, phone: form.phone, email: form.email, courseId: form.courseId ? Number(form.courseId) : undefined, photo: form.photo || undefined, ...pay });
    else create.mutate({ centerId, name: form.name, phone: form.phone, email: form.email, courseId: form.courseId ? Number(form.courseId) : undefined, category: form.category || undefined, aadharNumber: form.aadharNumber || undefined, photo: form.photo || undefined, ...pay });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[rgba(27,42,74,0.5)]" />
      <div className="relative bg-white rounded-2xl w-full max-w-[520px] max-h-[88vh] overflow-y-auto z-10 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-[18px] font-semibold text-[#1B2A4A]">{editing ? 'Edit Student' : 'Add Student'}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-[#718096]" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <ImageUpload value={form.photo} onChange={(v) => setForm({ ...form, photo: v })} label="Student Image" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input required placeholder="Student name *" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className={cls} />
            <input placeholder="Phone" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={cls} />
            <input placeholder="Email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className={cls} />
            <select value={form.courseId || ''} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className={cls}>
              <option value="">Select Course</option>{(courses || []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {!editing && <select value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} className={cls}><option value="">Category</option><option value="general">General</option><option value="sc_st">SC/ST</option><option value="bc_obc">BC/OBC</option></select>}
            {!editing && <input placeholder="Aadhar (optional · 12 digits)" maxLength={12} value={form.aadharNumber || ''} onChange={(e) => setForm({ ...form, aadharNumber: e.target.value })} className={cls} />}
          </div>
          <div className="border-t border-[#E8EDF5] pt-3">
            <p className="text-[12px] font-semibold text-[#1B2A4A] mb-2">Payment</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select value={form.feeStatus || 'pending'} onChange={(e) => setForm({ ...form, feeStatus: e.target.value })} className={cls}><option value="pending">Pending</option><option value="partial">Partial</option><option value="paid">Paid</option></select>
              <select value={form.paymentMode || ''} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })} className={cls}><option value="">Payment mode</option><option value="online">Online</option><option value="offline_cash">Offline Cash</option><option value="offline_upi">Offline UPI</option><option value="offline_bank">Offline Bank Transfer</option></select>
              <input type="date" value={form.paymentReceivedDate || ''} onChange={(e) => setForm({ ...form, paymentReceivedDate: e.target.value })} className={cls} title="Payment received date" />
              <input placeholder="Transaction / reference no." value={form.paymentReference || ''} onChange={(e) => setForm({ ...form, paymentReference: e.target.value })} className={cls} />
            </div>
            <input placeholder="Remarks (optional)" value={form.paymentRemarks || ''} onChange={(e) => setForm({ ...form, paymentRemarks: e.target.value })} className={`${cls} mt-3`} />
          </div>
          {error && <p className="text-[12px] text-red-500">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 h-10 border border-[#E8EDF5] rounded-lg text-[13px] font-medium">Cancel</button>
            <button type="submit" disabled={pending} className="flex-1 h-10 bg-[#F5B800] text-[#1B2A4A] rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
              {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{editing ? 'Update' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'results', label: 'Results', icon: ClipboardList },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'referrals', label: 'Referral Payouts', icon: Gift },
  { id: 'downloads', label: 'Forms & Downloads', icon: Download },
];

function CentreDash({ centerId, onLogout }: { centerId: number; onLogout: () => void }) {
  const [tab, setTab] = useState('overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [modal, setModal] = useState<null | 'add' | any>(null);
  const [showLink, setShowLink] = useState(false);
  const utils = trpc.useUtils();

  const { data: center, isLoading: cLoading } = trpc.centers.byId.useQuery({ id: centerId });
  const { data: students } = trpc.students.byCenter.useQuery({ centerId });
  const { data: courses } = trpc.courses.list.useQuery();
  const { data: results } = trpc.centers.results.useQuery({ centerId });
  const { data: certificates } = trpc.certificates.byCenter.useQuery({ centerId });
  const { data: centreMarksheets } = trpc.marksheets.byCenter.useQuery({ centerId });
  const { data: downloads } = trpc.downloads.list.useQuery();

  if (cLoading) return <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA]"><Loader2 className="w-8 h-8 text-[#F5B800] animate-spin" /></div>;
  if (!center) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F6FA] gap-3">
        <p className="text-[14px] text-[#718096]">Could not load centre data.</p>
        <button onClick={onLogout} className="bg-[#F5B800] text-[#1B2A4A] px-4 py-2 rounded-lg text-[13px] font-semibold">Back to login</button>
      </div>
    );
  }

  const list = students || [];
  const courseName = (id: number | null) => (courses || []).find((c: any) => c.id === id)?.name || '-';
  const stats = {
    total: list.length,
    active: list.filter((s: any) => s.status === 'active').length,
    certified: list.filter((s: any) => s.certificateIssued).length,
    pendingFees: list.filter((s: any) => s.feeStatus !== 'paid').length,
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-[230px] bg-[#1B2A4A] flex-col fixed h-full">
        <div className="h-[64px] flex items-center gap-2.5 px-5">
          <div className="w-9 h-9 rounded-lg bg-[#F5B800] flex items-center justify-center"><Building2 className="w-5 h-5 text-[#1B2A4A]" /></div>
          <span className="font-display text-[15px] font-semibold text-white">Udaan24 Centre</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setTab(n.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${tab === n.id ? 'bg-[#F5B800] text-[#1B2A4A]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <n.icon className="w-[18px] h-[18px]" />{n.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-white/50 hover:text-white"><LogOut className="w-[18px] h-[18px]" />Logout</button>
        </div>
      </aside>

      {/* Mobile nav drawer */}
      {mobileNav && (
        <div className="fixed inset-0 z-[80] lg:hidden" onClick={() => setMobileNav(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <aside className="absolute left-0 top-0 bottom-0 w-[230px] bg-[#1B2A4A] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="h-[64px] flex items-center px-5 text-white font-display font-semibold">Udaan24 Centre</div>
            <nav className="flex-1 px-3 space-y-1">
              {NAV.map((n) => (
                <button key={n.id} onClick={() => { setTab(n.id); setMobileNav(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium ${tab === n.id ? 'bg-[#F5B800] text-[#1B2A4A]' : 'text-white/60'}`}><n.icon className="w-[18px] h-[18px]" />{n.label}</button>
              ))}
            </nav>
            <div className="p-3 border-t border-white/10"><button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-white/50"><LogOut className="w-[18px] h-[18px]" />Logout</button></div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-[230px]">
        <header className="sticky top-0 z-30 bg-white border-b border-[#E8EDF5] px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileNav(true)} className="lg:hidden p-1"><Menu className="w-5 h-5 text-[#1B2A4A]" /></button>
            <span className="text-[13px] text-[#718096]">Centre / <span className="text-[#1B2A4A] font-medium capitalize">{NAV.find((n) => n.id === tab)?.label}</span></span>
          </div>
          <div className="text-right">
            <p className="text-[13px] font-medium text-[#1B2A4A] leading-tight">{center.name}</p>
            <p className="text-[11px] text-[#718096]">{center.centerCode}</p>
          </div>
        </header>

        <main className="p-4 md:p-6 space-y-6">
          {/* OVERVIEW */}
          {tab === 'overview' && (
            <>
              <div className="bg-white rounded-xl border border-[#E8EDF5] p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-[20px] font-semibold text-[#1B2A4A]">{center.name}</h2>
                  <p className="text-[13px] text-[#718096]">{center.centerCode} · {center.city}, {center.state} · Owner: {center.ownerName || '-'}</p>
                </div>
                <span className={`flex items-center gap-1.5 ${badge(center.status)}`}><CheckCircle className="w-3.5 h-3.5" />Franchise: {center.status}</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Tile icon={Users} label="Total Students" value={stats.total} color="text-[#0071E3]" bg="bg-[#F0F5FF]" />
                <Tile icon={GraduationCap} label="Active" value={stats.active} color="text-[#22C55E]" bg="bg-[#F0FFF4]" />
                <Tile icon={Award} label="Certified" value={stats.certified} color="text-[#F5B800]" bg="bg-[#FFF9E6]" />
                <Tile icon={CreditCard} label="Fees Pending" value={stats.pendingFees} color="text-[#EF4444]" bg="bg-red-50" />
              </div>
            </>
          )}

          {/* STUDENTS */}
          {tab === 'students' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-[22px] font-semibold text-[#1B2A4A]">Affiliated Students</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowLink(true)} className="border border-[#E8EDF5] text-[#1B2A4A] px-4 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 hover:bg-[#F5F6FA]"><Send className="w-4 h-4" />Share Admission Link</button>
                  <button onClick={() => setModal('add')} className="bg-[#F5B800] text-[#1B2A4A] px-4 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 hover:bg-[#E0A800]"><Plus className="w-4 h-4" />Add Student</button>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-[#E8EDF5] overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F5F6FA]"><tr className="text-left text-[11px] text-[#718096] uppercase tracking-wider">
                    <th className="p-4 font-medium">Roll No</th><th className="p-4 font-medium">Name</th><th className="p-4 font-medium">Course</th><th className="p-4 font-medium">Status</th><th className="p-4 font-medium">Admission</th><th className="p-4 font-medium">Fee</th><th className="p-4 font-medium">Certificate</th><th className="p-4 font-medium">Action</th>
                  </tr></thead>
                  <tbody className="divide-y divide-[#E8EDF5]">
                    {list.length === 0 ? <tr><td colSpan={8} className="p-8 text-center text-[#718096]">No students yet</td></tr> :
                      list.map((s: any) => (
                        <tr key={s.id} className="hover:bg-[#F5F6FA]">
                          <td className="p-4 text-[12px] font-mono text-[#718096]">{s.rollNumber}</td>
                          <td className="p-4 text-[13px] font-medium text-[#1B2A4A]">{s.name}</td>
                          <td className="p-4 text-[13px] text-[#4A5568]">{courseName(s.courseId)}</td>
                          <td className="p-4"><span className={badge(s.status)}>{s.status}</span></td>
                          <td className="p-4 text-[12px] text-[#4A5568]">{s.admissionStatus === 'completed' ? (s.feeStatus === 'paid' ? 'Fully Admitted' : 'Payment Pending') : s.admissionStatus === 'in_progress' ? 'Profile Incomplete' : s.status === 'inactive' ? 'Pending Approval' : 'Pending'}</td>
                          <td className="p-4"><span className={badge(s.feeStatus)}>{s.feeStatus}</span></td>
                          <td className="p-4 text-[13px]">{s.certificateIssued ? <span className="text-[#22C55E]">Issued</span> : <span className="text-[#718096]">—</span>}</td>
                          <td className="p-4"><button onClick={() => setModal(s)} className="text-[12px] text-[#0071E3] font-medium">Edit</button></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* COURSES */}
          {tab === 'courses' && (
            <div className="space-y-4">
              <h2 className="font-display text-[22px] font-semibold text-[#1B2A4A]">Available Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {(courses || []).map((c: any) => (
                  <div key={c.id} className="bg-white rounded-xl border border-[#E8EDF5] p-5">
                    <div className="flex items-center gap-2 mb-2"><BookOpen className="w-4 h-4 text-[#F5B800]" /><span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FFF9E6] text-[#1B2A4A] capitalize">{(c.category || '').replace('_', ' ')}</span></div>
                    <h3 className="font-body text-[15px] font-semibold text-[#1B2A4A]">{c.name}</h3>
                    <p className="text-[12px] text-[#718096] mt-1">{c.duration} · {c.mode}</p>
                    <p className="font-display text-[18px] font-semibold text-[#F5B800] mt-2">₹{Number(c.fee).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RESULTS */}
          {tab === 'results' && (
            <div className="space-y-4">
              <h2 className="font-display text-[22px] font-semibold text-[#1B2A4A]">Result Overview</h2>
              <div className="bg-white rounded-xl border border-[#E8EDF5] overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F5F6FA]"><tr className="text-left text-[11px] text-[#718096] uppercase tracking-wider">
                    <th className="p-4 font-medium">Student</th><th className="p-4 font-medium">Exam</th><th className="p-4 font-medium">Marks</th><th className="p-4 font-medium">%</th><th className="p-4 font-medium">Grade</th><th className="p-4 font-medium">Result</th>
                  </tr></thead>
                  <tbody className="divide-y divide-[#E8EDF5]">
                    {(results || []).length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-[#718096]">No results published yet</td></tr> :
                      (results || []).map((r: any) => (
                        <tr key={r.id} className="hover:bg-[#F5F6FA]">
                          <td className="p-4 text-[13px] font-medium text-[#1B2A4A]">{r.studentName}<div className="text-[11px] font-mono text-[#718096]">{r.rollNumber}</div></td>
                          <td className="p-4 text-[13px] text-[#4A5568]">{r.examName || '-'}</td>
                          <td className="p-4 text-[13px]">{r.marksObtained}/{r.totalMarks}</td>
                          <td className="p-4 text-[13px]">{r.percentage}%</td>
                          <td className="p-4 text-[13px] font-medium">{r.grade}</td>
                          <td className="p-4"><span className={badge(r.status)}>{r.status}</span></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CERTIFICATES */}
          {tab === 'certificates' && (
            <div className="space-y-4">
              <h2 className="font-display text-[22px] font-semibold text-[#1B2A4A]">Certificate Status</h2>
              <div className="bg-white rounded-xl border border-[#E8EDF5] overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F5F6FA]"><tr className="text-left text-[11px] text-[#718096] uppercase tracking-wider">
                    <th className="p-4 font-medium">Serial</th><th className="p-4 font-medium">Student</th><th className="p-4 font-medium">Course</th><th className="p-4 font-medium">Status</th><th className="p-4 font-medium">Action</th>
                  </tr></thead>
                  <tbody className="divide-y divide-[#E8EDF5]">
                    {(certificates || []).length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-[#718096]">No certificates issued yet</td></tr> :
                      (certificates || []).map((c: any) => (
                        <tr key={c.id} className="hover:bg-[#F5F6FA]">
                          <td className="p-4 text-[12px] font-mono text-[#F5B800] font-medium">{c.serialNumber}</td>
                          <td className="p-4 text-[13px] font-medium text-[#1B2A4A]">{c.studentName}</td>
                          <td className="p-4 text-[13px] text-[#4A5568]">{c.courseName}</td>
                          <td className="p-4"><span className={badge(c.status)}>{c.status}</span></td>
                          <td className="p-4"><a href={`/certificate/${c.id}`} target="_blank" rel="noreferrer" className="text-[12px] text-[#0071E3] font-medium">View / Print</a></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <h2 className="font-display text-[20px] font-semibold text-[#1B2A4A] pt-2">Marksheets</h2>
              <div className="bg-white rounded-xl border border-[#E8EDF5] overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F5F6FA]"><tr className="text-left text-[11px] text-[#718096] uppercase tracking-wider">
                    <th className="p-4 font-medium">Number</th><th className="p-4 font-medium">Student</th><th className="p-4 font-medium">%</th><th className="p-4 font-medium">Result</th><th className="p-4 font-medium">Action</th>
                  </tr></thead>
                  <tbody className="divide-y divide-[#E8EDF5]">
                    {(centreMarksheets || []).length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-[#718096]">No marksheets yet</td></tr> :
                      (centreMarksheets || []).map((m: any) => (
                        <tr key={m.id} className="hover:bg-[#F5F6FA]">
                          <td className="p-4 text-[12px] font-mono text-[#F5B800] font-medium">{m.marksheetNumber}</td>
                          <td className="p-4 text-[13px] font-medium text-[#1B2A4A]">{m.studentName}</td>
                          <td className="p-4 text-[13px]">{Number(m.percentage)}%</td>
                          <td className="p-4"><span className={badge(m.resultStatus)}>{m.resultStatus}</span></td>
                          <td className="p-4"><a href={`/marksheet/${m.id}`} target="_blank" rel="noreferrer" className="text-[12px] text-[#0071E3] font-medium">View / Print</a></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DOWNLOADS */}
          {tab === 'downloads' && (
            <div className="space-y-4">
              <h2 className="font-display text-[22px] font-semibold text-[#1B2A4A]">Forms & Downloads</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(downloads || []).length === 0 ? <p className="text-[13px] text-[#718096]">No downloads available.</p> :
                  (downloads || []).map((d: any) => (
                    <div key={d.id} className="bg-white rounded-xl border border-[#E8EDF5] p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#FFF9E6] flex items-center justify-center"><FileText className="w-5 h-5 text-[#F5B800]" /></div>
                        <div>
                          <p className="text-[13px] font-medium text-[#1B2A4A]">{d.title}</p>
                          <p className="text-[11px] text-[#718096] capitalize">{(d.type || '').replace('_', ' ')} · {d.fileSize || ''}</p>
                        </div>
                      </div>
                      <a href={d.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[12px] text-[#0071E3] font-medium"><Download className="w-3.5 h-3.5" />Download</a>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* REFERRAL PAYOUTS */}
          {tab === 'referrals' && <CentreReferrals centerId={centerId} />}
        </main>
      </div>

      {modal && <StudentModal centerId={centerId} student={modal === 'add' ? undefined : modal} onClose={() => setModal(null)} onDone={() => utils.students.byCenter.invalidate({ centerId })} />}
      {showLink && <ShareLinkModal centerId={centerId} onClose={() => setShowLink(false)} onDone={() => utils.students.byCenter.invalidate({ centerId })} />}
    </div>
  );
}

// ════════ CENTRE REFERRAL PAYOUTS (own students only) ════════
function csvDownload(filename: string, rows: any[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = filename; a.click(); URL.revokeObjectURL(a.href);
}

function CentrePayModal({ centerId, payout, onClose, onDone }: { centerId: number; payout: any; onClose: () => void; onDone: () => void }) {
  const [ref, setRef] = useState('');
  const [remarks, setRemarks] = useState('');
  const [err, setErr] = useState('');
  const pay = trpc.referrals.centerPayPayout.useMutation({ onSuccess: () => { onDone(); onClose(); }, onError: (e) => setErr(e.message) });
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[rgba(27,42,74,0.5)]" />
      <div className="relative bg-white rounded-2xl w-full max-w-[420px] z-10 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4"><h3 className="font-display text-[18px] font-semibold text-[#1B2A4A]">Pay Payout</h3><button onClick={onClose}><X className="w-5 h-5 text-[#718096]" /></button></div>
        <div className="bg-[#F5F6FA] rounded-lg p-3 text-[13px] mb-4 space-y-1">
          <p><b>{payout.studentName}</b> ({payout.rollNumber})</p>
          <p className="text-[#1B2A4A] font-semibold text-[16px]">₹{Number(payout.amount).toLocaleString('en-IN')} via {payout.paymentMode?.toUpperCase()}</p>
          {payout.paymentMode === 'upi' && <p className="text-[#718096]">UPI: {payout.upiId}</p>}
          {payout.paymentMode === 'bank' && <p className="text-[#718096]">{payout.accountHolderName} · {payout.accountNumber} · {payout.ifscCode} · {payout.bankName}</p>}
        </div>
        <input placeholder="Payment reference / UTR / Txn ID" value={ref} onChange={(e) => setRef(e.target.value)} className="w-full h-10 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] outline-none focus:border-[#F5B800] mb-2" />
        <input placeholder="Centre remarks (optional)" value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full h-10 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] outline-none focus:border-[#F5B800] mb-3" />
        {err && <p className="text-[12px] text-red-500 mb-2">{err}</p>}
        <button onClick={() => pay.mutate({ centreId: centerId, id: payout.id, paymentReference: ref, centreRemarks: remarks })} disabled={pay.isPending} className="w-full h-10 bg-[#F5B800] text-[#1B2A4A] rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 disabled:opacity-60">{pay.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}Mark as Paid</button>
      </div>
    </div>
  );
}

function CentreReferrals({ centerId }: { centerId: number }) {
  const [sub, setSub] = useState('payouts');
  const [payModal, setPayModal] = useState<any>(null);
  const utils = trpc.useUtils();
  const { data: ov } = trpc.referrals.centerOverview.useQuery({ centreId: centerId });
  const { data: commissions } = trpc.referrals.centerCommissions.useQuery({ centreId: centerId });
  const { data: wallets } = trpc.referrals.centerWallets.useQuery({ centreId: centerId });
  const { data: payouts } = trpc.referrals.centerPayouts.useQuery({ centreId: centerId });
  const { data: statements } = trpc.referrals.centerStatements.useQuery({ centreId: centerId });

  const refresh = () => { utils.referrals.centerPayouts.invalidate(); utils.referrals.centerWallets.invalidate(); utils.referrals.centerStatements.invalidate(); utils.referrals.centerOverview.invalidate(); };
  const setCommission = trpc.referrals.centerSetCommissionStatus.useMutation({ onSuccess: () => { utils.referrals.centerCommissions.invalidate(); utils.referrals.centerWallets.invalidate(); utils.referrals.centerOverview.invalidate(); } });
  const reject = trpc.referrals.centerRejectPayout.useMutation({ onSuccess: refresh });

  const badge = (s: string) => {
    const m: Record<string, string> = { pending: 'bg-yellow-50 text-yellow-700', approved: 'bg-green-50 text-green-700', paid: 'bg-green-50 text-green-700', cancelled: 'bg-red-50 text-red-600', requested: 'bg-yellow-50 text-yellow-700', rejected: 'bg-red-50 text-red-600' };
    return `px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${m[s] || 'bg-gray-100 text-gray-600'}`;
  };
  const subs = ['payouts', 'commissions', 'wallets', 'statements'];

  return (
    <div className="space-y-4">
      <h2 className="font-display text-[22px] font-semibold text-[#1B2A4A]">Referral Payouts</h2>
      <p className="text-[13px] text-[#718096]">You pay referral commissions for your own students only.</p>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Tile icon={Award} label="Total Commission" value={`₹${ov?.totalCommission ?? 0}`} color="text-purple-600" bg="bg-purple-50" />
        <Tile icon={CreditCard} label="Pending" value={`₹${ov?.pendingCommission ?? 0}`} color="text-[#F5B800]" bg="bg-[#FFF9E6]" />
        <Tile icon={CheckCircle} label="Approved" value={`₹${ov?.approvedCommission ?? 0}`} color="text-[#22C55E]" bg="bg-[#F0FFF4]" />
        <Tile icon={Wallet} label="Outstanding" value={`₹${ov?.outstanding ?? 0}`} color="text-[#1B2A4A]" bg="bg-[#F5F6FA]" />
        <Tile icon={Send} label="Pending Payouts" value={ov?.pendingPayouts ?? 0} color="text-orange-500" bg="bg-orange-50" />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[#E8EDF5]">
        {subs.map((s) => <button key={s} onClick={() => setSub(s)} className={`px-4 py-2 text-[13px] font-medium border-b-2 capitalize ${sub === s ? 'border-[#F5B800] text-[#1B2A4A]' : 'border-transparent text-[#718096]'}`}>{s}</button>)}
      </div>

      {/* PAYOUTS */}
      {sub === 'payouts' && (
        <div className="space-y-3">
          <button onClick={() => csvDownload('centre-payouts.csv', (payouts || []).map((p: any) => ({ student: p.studentName, amount: p.amount, mode: p.paymentMode, status: p.status, ref: p.paymentReference, remarks: p.centreRemarks, date: p.date })))} className="flex items-center gap-1.5 text-[13px] text-[#1B2A4A] font-medium px-3 py-2 border border-[#E8EDF5] rounded-lg hover:bg-[#F5F6FA]"><Download className="w-4 h-4" />Export CSV</button>
          <div className="bg-white rounded-xl border border-[#E8EDF5] overflow-x-auto">
            <table className="w-full"><thead className="bg-[#F5F6FA]"><tr className="text-left text-[11px] text-[#718096] uppercase"><th className="p-3 font-medium">Student</th><th className="p-3 font-medium">Amount</th><th className="p-3 font-medium">Mode</th><th className="p-3 font-medium">Details</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Actions</th></tr></thead>
              <tbody className="divide-y divide-[#E8EDF5]">
                {(payouts || []).length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-[#718096]">No payout requests from your students</td></tr> :
                  (payouts || []).map((p: any) => (
                    <tr key={p.id} className="hover:bg-[#F5F6FA]">
                      <td className="p-3 text-[13px] font-medium text-[#1B2A4A]">{p.studentName}<div className="text-[11px] font-mono text-[#718096]">{p.rollNumber}</div></td>
                      <td className="p-3 text-[13px] font-semibold">₹{Number(p.amount).toLocaleString('en-IN')}</td>
                      <td className="p-3 text-[13px] uppercase">{p.paymentMode}</td>
                      <td className="p-3 text-[12px] text-[#718096]">{p.paymentMode === 'upi' ? p.upiId : p.paymentMode === 'bank' ? `${p.accountNumber || ''} ${p.ifscCode || ''}` : 'Cash'}</td>
                      <td className="p-3"><span className={badge(p.status)}>{p.status}</span></td>
                      <td className="p-3">
                        {(p.status === 'requested' || p.status === 'processing') ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => setPayModal(p)} className="text-[11px] text-green-700 font-medium px-2 py-1 rounded bg-green-50">Pay Now</button>
                            <button onClick={() => reject.mutate({ centreId: centerId, id: p.id })} className="text-[11px] text-red-600 font-medium px-2 py-1 rounded bg-red-50">Reject</button>
                          </div>
                        ) : <span className="text-[11px] text-[#718096]">{p.paymentReference || '—'}</span>}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COMMISSIONS */}
      {sub === 'commissions' && (
        <div className="bg-white rounded-xl border border-[#E8EDF5] overflow-x-auto">
          <table className="w-full"><thead className="bg-[#F5F6FA]"><tr className="text-left text-[11px] text-[#718096] uppercase"><th className="p-3 font-medium">Student</th><th className="p-3 font-medium">Course Amt</th><th className="p-3 font-medium">Commission</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Actions</th></tr></thead>
            <tbody className="divide-y divide-[#E8EDF5]">
              {(commissions || []).length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-[#718096]">No commissions yet</td></tr> :
                (commissions || []).map((t: any) => (
                  <tr key={t.id} className="hover:bg-[#F5F6FA]">
                    <td className="p-3 text-[13px] font-medium text-[#1B2A4A]">{t.referrerName}<div className="text-[11px] font-mono text-[#718096]">{t.referrerCode}</div></td>
                    <td className="p-3 text-[13px]">₹{Number(t.courseAmount).toLocaleString('en-IN')}</td>
                    <td className="p-3 text-[13px] font-semibold">₹{Number(t.commissionAmount).toLocaleString('en-IN')}</td>
                    <td className="p-3"><span className={badge(t.status)}>{t.status}</span></td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        {t.status === 'pending' && <button onClick={() => setCommission.mutate({ centreId: centerId, id: t.id, status: 'approved' })} className="text-[11px] text-green-700 font-medium px-2 py-1 rounded bg-green-50">Approve</button>}
                        {t.status !== 'cancelled' && t.status !== 'paid' && <button onClick={() => setCommission.mutate({ centreId: centerId, id: t.id, status: 'cancelled' })} className="text-[11px] text-red-600 font-medium px-2 py-1 rounded bg-red-50">Cancel</button>}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* WALLETS */}
      {sub === 'wallets' && (
        <div className="bg-white rounded-xl border border-[#E8EDF5] overflow-x-auto">
          <table className="w-full"><thead className="bg-[#F5F6FA]"><tr className="text-left text-[11px] text-[#718096] uppercase"><th className="p-3 font-medium">Student</th><th className="p-3 font-medium">Balance</th><th className="p-3 font-medium">Earned</th><th className="p-3 font-medium">Withdrawn</th><th className="p-3 font-medium">Pending</th><th className="p-3 font-medium">Outstanding</th></tr></thead>
            <tbody className="divide-y divide-[#E8EDF5]">
              {(wallets || []).length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-[#718096]">No wallets yet</td></tr> :
                (wallets || []).map((w: any) => (
                  <tr key={w.studentId} className="hover:bg-[#F5F6FA]">
                    <td className="p-3 text-[13px] font-medium text-[#1B2A4A]">{w.studentName}<div className="text-[11px] font-mono text-[#718096]">{w.rollNumber}</div></td>
                    <td className="p-3 text-[13px] font-semibold">₹{Number(w.walletBalance).toLocaleString('en-IN')}</td>
                    <td className="p-3 text-[13px]">₹{Number(w.totalEarned).toLocaleString('en-IN')}</td>
                    <td className="p-3 text-[13px]">₹{Number(w.totalWithdrawn).toLocaleString('en-IN')}</td>
                    <td className="p-3 text-[13px] text-[#F5B800]">₹{Number(w.pendingAmount).toLocaleString('en-IN')}</td>
                    <td className="p-3 text-[13px]">₹{Number(w.outstandingAmount).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* STATEMENTS */}
      {sub === 'statements' && (
        <div className="space-y-3">
          <button onClick={() => csvDownload('centre-statements.csv', (statements || []).map((s: any) => ({ student: s.studentName, type: s.transactionType, credit: s.creditAmount, debit: s.debitAmount, balance: s.balanceAfter, remarks: s.remarks, date: s.date })))} className="flex items-center gap-1.5 text-[13px] text-[#1B2A4A] font-medium px-3 py-2 border border-[#E8EDF5] rounded-lg hover:bg-[#F5F6FA]"><Download className="w-4 h-4" />Export CSV</button>
          <div className="bg-white rounded-xl border border-[#E8EDF5] overflow-x-auto">
            <table className="w-full"><thead className="bg-[#F5F6FA]"><tr className="text-left text-[11px] text-[#718096] uppercase"><th className="p-3 font-medium">Date</th><th className="p-3 font-medium">Student</th><th className="p-3 font-medium">Type</th><th className="p-3 font-medium">Credit</th><th className="p-3 font-medium">Debit</th><th className="p-3 font-medium">Balance</th></tr></thead>
            <tbody className="divide-y divide-[#E8EDF5]">
              {(statements || []).length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-[#718096]">No statement records</td></tr> :
                (statements || []).map((s: any) => (
                  <tr key={s.id} className="hover:bg-[#F5F6FA]">
                    <td className="p-3 text-[12px] text-[#718096]">{new Date(s.date).toLocaleDateString()}</td>
                    <td className="p-3 text-[13px] text-[#1B2A4A]">{s.studentName}</td>
                    <td className="p-3 text-[12px] capitalize">{s.transactionType.replace(/_/g, ' ')}</td>
                    <td className="p-3 text-[13px] text-[#22C55E]">{Number(s.creditAmount) > 0 ? `+₹${Number(s.creditAmount).toLocaleString('en-IN')}` : '-'}</td>
                    <td className="p-3 text-[13px] text-[#EF4444]">{Number(s.debitAmount) > 0 ? `-₹${Number(s.debitAmount).toLocaleString('en-IN')}` : '-'}</td>
                    <td className="p-3 text-[13px] font-medium">₹{Number(s.balanceAfter).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
            </tbody>
            </table>
          </div>
        </div>
      )}

      {payModal && <CentrePayModal centerId={centerId} payout={payModal} onClose={() => setPayModal(null)} onDone={refresh} />}
    </div>
  );
}

export default function CentreDashboard() {
  const [centerId, setCenterId] = useState<number | null>(() => {
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? Number(v) : null;
  });
  useEffect(() => {
    if (centerId) localStorage.setItem(STORAGE_KEY, String(centerId));
    else localStorage.removeItem(STORAGE_KEY);
  }, [centerId]);

  if (!centerId) return <CentreLogin onLogin={setCenterId} />;
  return <CentreDash centerId={centerId} onLogout={() => setCenterId(null)} />;
}

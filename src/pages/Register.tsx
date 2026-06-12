import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { trpc } from '@/providers/trpc';
import { GraduationCap, Loader2, CheckCircle, Gift } from 'lucide-react';

const REF_KEY = 'udaan24_ref';

// Visiting /r/:code stores the referral code (cookie-equivalent) and sends the
// visitor to the registration page where the 5% discount mapping is created.
export function ReferralCapture() {
  const { code } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (code) localStorage.setItem(REF_KEY, code);
    navigate('/register', { replace: true });
  }, [code, navigate]);
  return null;
}

export default function Register() {
  const [form, setForm] = useState<any>({});
  const [error, setError] = useState('');
  const [refCode, setRefCode] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const { data: courses } = trpc.courses.list.useQuery();

  useEffect(() => { setRefCode(localStorage.getItem(REF_KEY)); }, []);

  const register = trpc.students.register.useMutation({
    onSuccess: () => {
      // Self-registration creates an APPLICATION only — no auto-login. A Super Admin
      // reviews and approves it before the student gets login credentials.
      localStorage.removeItem(REF_KEY);
      setSubmitted(true);
    },
    onError: (e) => setError(e.message),
  });

  if (submitted) return (
    <div className="min-h-screen bg-[#FEFDFB]">
      <Header />
      <main className="pt-[120px] pb-20">
        <div className="container-main max-w-[520px]">
          <div className="bg-white border border-[#E8EDF5] rounded-2xl p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F0FFF4] flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-[#22C55E]" /></div>
            <h1 className="font-display text-[24px] font-semibold text-[#1B2A4A] mb-2">Application Submitted</h1>
            <p className="text-[14px] text-[#4A5568] mb-2">Thank you for applying to Udaan24. Our team will review your application and activate your student account.</p>
            <p className="text-[13px] text-[#718096] mb-6">Once approved, you'll receive your <b>Student ID</b>, <b>username</b> and <b>password</b> to log in.</p>
            <Link to="/" className="btn-primary inline-block px-6 py-2.5">Back to website</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FEFDFB]">
      <Header />
      <main className="pt-[100px] pb-16">
        <div className="container-main max-w-[520px]">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#F5B800] flex items-center justify-center mx-auto mb-3"><GraduationCap className="w-7 h-7 text-[#1B2A4A]" /></div>
            <h1 className="font-display text-[30px] font-semibold text-[#1B2A4A]">Apply to Udaan24</h1>
            <p className="text-[14px] text-[#718096] mt-1">Submit your application — our team will review and activate your account.</p>
          </div>

          {refCode && (
            <div className="flex items-center gap-2 bg-[#F0FFF4] border border-green-200 rounded-lg px-4 py-2.5 mb-5 text-[13px] text-green-700">
              <Gift className="w-4 h-4" /> Referral applied (<b>{refCode}</b>) — you'll get <b>5% off</b> any course.
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); setError(''); register.mutate({ name: form.name, phone: form.phone, email: form.email, password: form.password, courseId: form.courseId ? Number(form.courseId) : undefined, referralCode: refCode || undefined }); }} className="bg-white border border-[#E8EDF5] rounded-2xl p-6 space-y-3">
            <input required placeholder="Full name *" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full h-11 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[14px] outline-none focus:border-[#F5B800]" />
            <input placeholder="Mobile number" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full h-11 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[14px] outline-none focus:border-[#F5B800]" />
            <input type="email" placeholder="Email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full h-11 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[14px] outline-none focus:border-[#F5B800]" />
            <input type="password" placeholder="Password (min 4 chars)" value={form.password || ''} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full h-11 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[14px] outline-none focus:border-[#F5B800]" />
            <select value={form.courseId || ''} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className="w-full h-11 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[14px] outline-none focus:border-[#F5B800]">
              <option value="">Interested course (optional)</option>
              {(courses || []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {error && <p className="text-[13px] text-red-500">{error}</p>}
            <button type="submit" disabled={register.isPending} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {register.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}Submit Application
            </button>
            <p className="text-center text-[12px] text-[#718096]">Already have credentials? <Link to="/student/login" className="text-[#0071E3] font-medium">Login here</Link></p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

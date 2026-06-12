import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { trpc } from '@/providers/trpc';
import ImageUpload from '@/components/ImageUpload';
import { GraduationCap, Loader2, CheckCircle, ArrowLeft, ArrowRight, Save, Plus, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'udaan24_student_id';
const STEPS = ['Student Details', 'Sibling Details', 'Course & Centre'];

export default function Admission() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState<number | null>(null);
  const [resolving, setResolving] = useState(true);
  const [centreLock, setCentreLock] = useState<{ id?: number; name?: string; city?: string } | null>(null);

  // Resolve which student this form fills: shared link token, else logged-in student.
  const tokenInfo = trpc.students.admissionByToken.useQuery({ token: token || '' }, { enabled: !!token });
  useEffect(() => {
    if (token) {
      if (tokenInfo.isLoading) return;
      if (tokenInfo.data?.studentId) { setStudentId(tokenInfo.data.studentId); setCentreLock({ id: tokenInfo.data.centreId ?? undefined, name: tokenInfo.data.centreName ?? undefined, city: tokenInfo.data.centreCity ?? undefined }); }
      setResolving(false);
    } else {
      const v = localStorage.getItem(STORAGE_KEY);
      setStudentId(v ? Number(v) : null);
      setResolving(false);
    }
  }, [token, tokenInfo.isLoading, tokenInfo.data]);

  if (resolving) return <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA]"><Loader2 className="w-8 h-8 text-[#F5B800] animate-spin" /></div>;
  if (!studentId) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F6FA] gap-3 p-6 text-center">
      <p className="text-[15px] text-[#1B2A4A] font-medium">{token ? 'This admission link is invalid or expired.' : 'Please log in to complete your admission.'}</p>
      <Link to="/student/login" className="bg-[#F5B800] text-[#1B2A4A] px-5 py-2.5 rounded-lg text-[13px] font-semibold">Student Login</Link>
    </div>
  );
  return <AdmissionWizard studentId={studentId} centreLock={centreLock} onDone={() => { if (!token) navigate('/student'); }} />;
}

function AdmissionWizard({ studentId, centreLock, onDone }: { studentId: number; centreLock: any; onDone: () => void }) {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.students.admissionGet.useQuery({ studentId });
  const { data: courses } = trpc.courses.list.useQuery();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const [form, setForm] = useState<any>(null);
  const [siblings, setSiblings] = useState<any[]>([]);
  const [sibCount, setSibCount] = useState(0);

  // Hydrate the form from saved data once.
  useEffect(() => {
    if (!data?.student || form) return;
    const s = data.student;
    setForm({
      photo: s.photo || '', name: s.name || '', gender: s.gender || '', category: s.category || '',
      fatherName: s.fatherName || '', motherName: s.motherName || '', dob: s.dob ? new Date(s.dob).toISOString().slice(0, 10) : '',
      phone: s.phone || '', email: s.email || '', address: s.address || '',
      courseId: s.courseId ? String(s.courseId) : '', aadharNumber: s.aadharNumber || '',
    });
    setSiblings((data.siblings || []).map((x: any) => ({ name: x.siblingName, relation: x.siblingRelation, age: x.siblingAge, qualification: x.siblingQualification })));
    setSibCount((data.siblings || []).length);
    if (s.admissionStep && s.admissionStep >= 1 && s.admissionStatus !== 'completed') setStep(Math.min(s.admissionStep + 0, 3) || 1);
  }, [data, form]);

  const saveStep = trpc.students.saveAdmissionStep.useMutation();
  const submit = trpc.students.submitAdmission.useMutation({ onSuccess: () => { setDone(true); utils.students.dashboard.invalidate(); } });

  if (isLoading || !form) return <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA]"><Loader2 className="w-8 h-8 text-[#F5B800] animate-spin" /></div>;

  const set = (k: string, v: any) => setForm({ ...form, [k]: v });
  const centre = centreLock?.name ? centreLock : data?.centre;
  const selectedCourse = (courses || []).find((c: any) => String(c.id) === form.courseId);

  const validateStep1 = () => {
    if (!form.name?.trim()) return 'Student name is required.';
    if (!form.gender) return 'Gender is required.';
    if (form.aadharNumber && !/^[0-9]{12}$/.test((form.aadharNumber || '').replace(/\s/g, ''))) return 'Aadhar number must be exactly 12 digits if entered.';
    if (!form.fatherName?.trim()) return "Father's name is required.";
    if (!form.motherName?.trim()) return "Mother's name is required.";
    if (!form.dob) return 'Date of birth is required.';
    if (!form.category) return 'Category is required.';
    if (!/^[0-9+\-\s]{8,15}$/.test(form.phone || '')) return 'A valid contact number is required.';
    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return 'Email is not valid.';
    if (!form.address?.trim()) return 'Address is required.';
    return '';
  };
  const validateStep3 = () => {
    if (!form.courseId) return 'Please select a course.';
    return '';
  };

  const next = async () => {
    setErr('');
    if (step === 1) {
      const e = validateStep1(); if (e) return setErr(e);
      await saveStep.mutateAsync({ studentId, step: 1, photo: form.photo || undefined, name: form.name, gender: form.gender, aadharNumber: form.aadharNumber ? form.aadharNumber.replace(/\s/g, '') : undefined, category: form.category, fatherName: form.fatherName, motherName: form.motherName, dob: form.dob, phone: form.phone, email: form.email || undefined, address: form.address });
      setStep(2);
    } else if (step === 2) {
      const sibs = sibCount > 0 ? siblings.slice(0, sibCount).filter((s) => s.name) : [];
      await saveStep.mutateAsync({ studentId, step: 2, siblings: sibs.map((s) => ({ name: s.name, relation: s.relation, age: s.age ? Number(s.age) : undefined, qualification: s.qualification })) });
      setStep(3);
    }
  };
  const finalSubmit = async () => {
    setErr('');
    const e = validateStep3(); if (e) return setErr(e);
    await saveStep.mutateAsync({ studentId, step: 3, courseId: Number(form.courseId), centerId: centre?.id });
    await submit.mutateAsync({ studentId });
  };

  const inputCls = "w-full h-10 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] outline-none focus:border-[#F5B800]";
  const label = (t: string, req = false) => <label className="text-[13px] font-medium text-[#1B2A4A] mb-1 block">{t}{req && <span className="text-red-500"> *</span>}</label>;

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA] p-4">
      <div className="bg-white rounded-2xl border border-[#E8EDF5] p-10 text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-[#F0FFF4] flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-[#22C55E]" /></div>
        <h2 className="font-display text-[22px] font-semibold text-[#1B2A4A] mb-2">Admission Details Completed!</h2>
        <p className="text-[14px] text-[#4A5568] mb-6">Your admission details have been saved successfully.</p>
        <button onClick={onDone} className="bg-[#F5B800] text-[#1B2A4A] px-6 py-2.5 rounded-lg text-[13px] font-semibold">Continue</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F6FA] py-8 px-4">
      <div className="max-w-[680px] mx-auto">
        <div className="flex items-center gap-2.5 justify-center mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#F5B800] flex items-center justify-center"><GraduationCap className="w-6 h-6 text-[#1B2A4A]" /></div>
          <span className="font-display text-[18px] font-semibold text-[#1B2A4A]">Udaan24 Admission Form</span>
        </div>

        {/* Progress bar */}
        <div className="flex items-center mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold ${step > i + 1 ? 'bg-[#22C55E] text-white' : step === i + 1 ? 'bg-[#F5B800] text-[#1B2A4A]' : 'bg-[#E8EDF5] text-[#718096]'}`}>{step > i + 1 ? '✓' : i + 1}</div>
                <span className="text-[11px] text-[#718096] mt-1 hidden sm:block whitespace-nowrap">{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${step > i + 1 ? 'bg-[#22C55E]' : 'bg-[#E8EDF5]'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[#E8EDF5] p-6">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-body text-[16px] font-semibold text-[#1B2A4A]">Step 1 — Student Basic Details</h2>
              <ImageUpload value={form.photo} onChange={(v) => set('photo', v)} label="Student Image" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>{label('Student Name', true)}<input value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} /></div>
                <div>{label('Gender', true)}<select value={form.gender} onChange={(e) => set('gender', e.target.value)} className={inputCls}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option></select></div>
                <div>{label('Aadhar Number')}<input value={form.aadharNumber} onChange={(e) => set('aadharNumber', e.target.value)} maxLength={12} className={inputCls} placeholder="Optional · 12 digits if entered" /></div>
                <div>{label("Father Name", true)}<input value={form.fatherName} onChange={(e) => set('fatherName', e.target.value)} className={inputCls} /></div>
                <div>{label("Mother Name", true)}<input value={form.motherName} onChange={(e) => set('motherName', e.target.value)} className={inputCls} /></div>
                <div>{label('Date of Birth', true)}<input type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)} className={inputCls} /></div>
                <div>{label('Category', true)}<select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls}><option value="">Select</option><option value="general">General</option><option value="sc_st">SC/ST</option><option value="bc_obc">BC/OBC</option></select></div>
                <div>{label('Contact Number', true)}<input value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputCls} placeholder="+91…" /></div>
                <div>{label('Mail ID')}<input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} /></div>
              </div>
              <div>{label('Student Address', true)}<textarea value={form.address} onChange={(e) => set('address', e.target.value)} className={`${inputCls} h-20 py-2 resize-none`} /></div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-body text-[16px] font-semibold text-[#1B2A4A]">Step 2 — Sibling Details</h2>
              <div className="sm:w-1/2">{label('Number of Siblings')}<input type="number" min={0} value={sibCount} onChange={(e) => { const n = Math.max(0, Number(e.target.value) || 0); setSibCount(n); setSiblings((prev) => { const a = [...prev]; while (a.length < n) a.push({}); return a.slice(0, n); }); }} className={inputCls} /></div>
              {sibCount === 0 ? <p className="text-[13px] text-[#718096]">No siblings — you can continue to the next step.</p> :
                <div className="space-y-3">
                  {Array.from({ length: sibCount }).map((_, i) => (
                    <div key={i} className="border border-[#E8EDF5] rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2"><span className="text-[12px] font-medium text-[#1B2A4A]">Sibling {i + 1}</span>{sibCount > 1 && <button onClick={() => { setSiblings(siblings.filter((_, j) => j !== i)); setSibCount(sibCount - 1); }} className="text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input placeholder="Name" value={siblings[i]?.name || ''} onChange={(e) => { const a = [...siblings]; a[i] = { ...a[i], name: e.target.value }; setSiblings(a); }} className={inputCls} />
                        <input placeholder="Relation (brother/sister)" value={siblings[i]?.relation || ''} onChange={(e) => { const a = [...siblings]; a[i] = { ...a[i], relation: e.target.value }; setSiblings(a); }} className={inputCls} />
                        <input type="number" placeholder="Age" value={siblings[i]?.age || ''} onChange={(e) => { const a = [...siblings]; a[i] = { ...a[i], age: e.target.value }; setSiblings(a); }} className={inputCls} />
                        <input placeholder="Qualification" value={siblings[i]?.qualification || ''} onChange={(e) => { const a = [...siblings]; a[i] = { ...a[i], qualification: e.target.value }; setSiblings(a); }} className={inputCls} />
                      </div>
                    </div>
                  ))}
                  <button onClick={() => { setSiblings([...siblings, {}]); setSibCount(sibCount + 1); }} className="flex items-center gap-1.5 text-[13px] text-[#0071E3] font-medium"><Plus className="w-4 h-4" />Add More Sibling</button>
                </div>}
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-body text-[16px] font-semibold text-[#1B2A4A]">Step 3 — Course & Centre Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>{label('Course Name', true)}<select value={form.courseId} onChange={(e) => set('courseId', e.target.value)} className={inputCls}><option value="">Select course</option>{(courses || []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div>{label('Course Duration')}<input value={selectedCourse?.duration || ''} readOnly className={`${inputCls} bg-[#EEF1F6] text-[#718096]`} placeholder="Auto-filled" /></div>
                <div className="sm:col-span-2">{label('Centre Name & City')}<input value={centre ? `${centre.name}${centre.city ? `, ${centre.city}` : ''}` : 'Main Udaan24 Office, Kotkapura'} readOnly className={`${inputCls} bg-[#EEF1F6] text-[#718096]`} /></div>
              </div>
            </div>
          )}

          {err && <p className="text-[13px] text-red-500 mt-4">{err}</p>}

          <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-[#E8EDF5]">
            <button onClick={() => { setErr(''); setStep(Math.max(1, step - 1)); }} disabled={step === 1} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-medium border border-[#E8EDF5] text-[#4A5568] disabled:opacity-40"><ArrowLeft className="w-4 h-4" />Back</button>
            {step < 3 ? (
              <button onClick={next} disabled={saveStep.isPending} className="flex items-center gap-1.5 bg-[#F5B800] text-[#1B2A4A] px-5 py-2.5 rounded-lg text-[13px] font-semibold disabled:opacity-60">{saveStep.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save & Continue<ArrowRight className="w-4 h-4" /></button>
            ) : (
              <button onClick={finalSubmit} disabled={submit.isPending || saveStep.isPending} className="flex items-center gap-1.5 bg-[#22C55E] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold disabled:opacity-60">{(submit.isPending || saveStep.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}Submit Admission</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

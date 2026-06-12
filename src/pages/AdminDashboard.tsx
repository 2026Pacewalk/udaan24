import { useState, useEffect } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import ImageUpload from "@/components/ImageUpload";
import { useAuth } from "@/hooks/useAuth";
import { useStore } from "@/hooks/useStore";
import Toast from "@/components/Toast";
import CrudModal from "@/components/CrudModal";
import {
  LayoutDashboard, Users, BookOpen, Building2, CreditCard, ClipboardList,
  Award, Image, Download, MessageSquare, Bell, Settings, BarChart3,
  LogOut, Search, Plus, ChevronLeft, ChevronRight, Edit, Trash2, Eye,
  X, Menu, Filter, CheckCircle, GraduationCap, Save, Loader2, Wallet, Send, UserPlus, ExternalLink
} from "lucide-react";

// ─── Module Sidebar Items ───
const sidebarModules = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: Users },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "centers", label: "Centres", icon: Building2 },
  { id: "enquiries", label: "Leads", icon: MessageSquare },
  { id: "fees", label: "Fees", icon: CreditCard },
  { id: "exams", label: "Exams", icon: ClipboardList },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "referrals", label: "Referrals & Wallet", icon: Wallet },
  { id: "settings", label: "Settings", icon: Settings },
];

// ─── Stat Card Component ───
function StatCard({ label, value, icon: Icon, color, bg }: { label: string; value: string | number; icon: any; color: string; bg: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-[#E8EDF5]">
      <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-4.5 h-4.5 ${color}`} />
      </div>
      <p className="font-display text-[22px] font-semibold text-[#1B2A4A]">{value}</p>
      <p className="text-[12px] text-[#718096] mt-1">{label}</p>
    </div>
  );
}

// ─── Table Pagination ───
function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  return (
    <div className="p-4 border-t border-[#E8EDF5] flex items-center justify-between">
      <p className="text-[12px] text-[#718096]">Page {page} of {pages}</p>
      <div className="flex items-center gap-1">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="w-8 h-8 rounded-lg border border-[#E8EDF5] flex items-center justify-center disabled:opacity-30">
          <ChevronLeft className="w-4 h-4 text-[#718096]" />
        </button>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map((p) => (
          <button key={p} onClick={() => onChange(p)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-medium ${p === page ? "bg-[#F5B800] text-[#1B2A4A]" : "border border-[#E8EDF5] text-[#718096]"}`}>{p}</button>
        ))}
        <button disabled={page >= pages} onClick={() => onChange(page + 1)} className="w-8 h-8 rounded-lg border border-[#E8EDF5] flex items-center justify-center disabled:opacity-30">
          <ChevronRight className="w-4 h-4 text-[#718096]" />
        </button>
      </div>
    </div>
  );
}

// ─── Input Field ───
function FormInput({ label, name, value, onChange, type = "text", required = false, placeholder = "" }: any) {
  return (
    <div>
      <label className="font-body text-[13px] font-medium text-[#1B2A4A] mb-1.5 block">{label}{required && <span className="text-red-500"> *</span>}</label>
      <input type={type} name={name} value={value || ""} onChange={onChange} required={required} placeholder={placeholder}
        className="w-full h-10 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] text-[#1B2A4A] outline-none focus:border-[#F5B800] focus:ring-2 focus:ring-[#F5B800]/20 transition-all" />
    </div>
  );
}

function FormSelect({ label, name, value, onChange, options, required = false }: any) {
  return (
    <div>
      <label className="font-body text-[13px] font-medium text-[#1B2A4A] mb-1.5 block">{label}{required && <span className="text-red-500"> *</span>}</label>
      <select name={name} value={value || ""} onChange={onChange} required={required}
        className="w-full h-10 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] text-[#1B2A4A] outline-none focus:border-[#F5B800] focus:ring-2 focus:ring-[#F5B800]/20 transition-all">
        <option value="">Select {label}</option>
        {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── Status Badge ───
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-green-50 text-green-700", inactive: "bg-gray-100 text-gray-600",
    pending: "bg-yellow-50 text-yellow-700", paid: "bg-green-50 text-green-700",
    partial: "bg-orange-50 text-orange-700", new: "bg-blue-50 text-blue-700",
    follow_up: "bg-yellow-50 text-yellow-700", converted: "bg-green-50 text-green-700",
    completed: "bg-green-50 text-green-700", draft: "bg-gray-100 text-gray-600",
    upcoming: "bg-blue-50 text-blue-700", ongoing: "bg-purple-50 text-purple-700",
    approved: "bg-green-50 text-green-700", rejected: "bg-red-50 text-red-600",
    suspended: "bg-orange-50 text-orange-700",
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${map[status] || "bg-gray-100 text-gray-600"}`}>{status.replace("_", " ")}</span>;
}

// Derive a human admission-progress label from the student record.
function admissionProgress(s: any): string {
  if (!s) return "Pending";
  if (s.status === "inactive") return "Pending Approval";
  if (s.admissionStatus === "completed" || s.profileCompleted) {
    return s.feeStatus === "paid" ? "Fully Admitted" : "Payment Pending";
  }
  if (s.admissionStatus === "in_progress") return "Profile Incomplete";
  return "Profile Incomplete";
}

// Reusable modal that shows generated login credentials for a student.
function CredentialsModal({ creds, onClose }: { creds: { rollNumber: string; username?: string; password?: string }; onClose: () => void }) {
  const { showToast } = useStore();
  const loginUrl = `${window.location.origin}/student/login`;
  const copyAll = () => {
    const text = `Udaan24 Student Login\nStudent ID: ${creds.rollNumber}\nUsername: ${creds.username || creds.rollNumber}\nPassword: ${creds.password || "(unchanged)"}\nLogin: ${loginUrl}`;
    navigator.clipboard?.writeText(text).then(() => showToast("Credentials copied", "success"));
  };
  const Line = ({ k, v }: { k: string; v: string }) => (<div className="flex justify-between gap-3 py-2 border-b border-[#F0F2F7] last:border-0"><span className="text-[12px] text-[#718096]">{k}</span><span className="text-[13px] font-mono font-semibold text-[#1B2A4A] text-right break-all">{v}</span></div>);
  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[rgba(27,42,74,0.5)]" />
      <div className="relative bg-white rounded-2xl w-full max-w-[440px] z-10 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#1B2A4A] px-6 py-5 text-center"><div className="w-12 h-12 rounded-full bg-[#F5B800]/20 flex items-center justify-center mx-auto mb-2"><CheckCircle className="w-6 h-6 text-[#F5B800]" /></div><h3 className="font-body text-[16px] font-semibold text-white">Student Credentials Generated</h3><p className="text-[12px] text-white/60 mt-1">Share these login details with the student.</p></div>
        <div className="p-6 space-y-4">
          <div className="bg-[#F5F6FA] rounded-xl p-4">
            <Line k="Student ID" v={creds.rollNumber} />
            <Line k="Username" v={creds.username || creds.rollNumber} />
            <Line k="Temp Password" v={creds.password || "(unchanged)"} />
            <Line k="Login URL" v={loginUrl} />
          </div>
          <div className="flex gap-3">
            <button onClick={copyAll} className="btn-secondary flex-1 py-2.5 text-[13px]">Copy All</button>
            <button onClick={onClose} className="btn-primary flex-1 py-2.5 text-[13px]">Done</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// MAIN ADMIN DASHBOARD
// ═══════════════════════════════════════════════
export default function AdminDashboard() {
  const { sidebarCollapsed, setSidebarCollapsed, activeModule, setActiveModule, showToast, modalOpen, modalType, openModal, closeModal } = useStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, isLoading: authLoading, logout } = useAuth({ redirectOnUnauthenticated: true });
  // New-lead count for the sidebar badge (hook must run before any early return).
  const { data: leadStats } = trpc.dashboard.stats.useQuery(undefined, { retry: false });

  // Block render until auth resolves; non-admins are redirected to /login.
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA]"><Loader2 className="w-8 h-8 text-[#F5B800] animate-spin" /></div>;
  }
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F6FA] gap-3 p-6 text-center">
        <p className="text-[15px] font-medium text-[#1B2A4A]">Admin access required</p>
        <Link to="/login" className="bg-[#F5B800] text-[#1B2A4A] px-5 py-2.5 rounded-lg text-[13px] font-semibold">Go to Login</Link>
      </div>
    );
  }

  const newLeads = leadStats?.pendingEnquiries || 0;

  const renderContent = () => {
    switch (activeModule) {
      case "dashboard": return <DashboardModule />;
      case "students": return <StudentsModule />;
      case "courses": return <CoursesModule />;
      case "centers": return <CentersModule />;
      case "enquiries": return <EnquiriesModule />;
      case "fees": return <FeesModule />;
      case "exams": return <ExamsModule />;
      case "certificates": return <CertificatesModule />;
      case "referrals": return <ReferralsModule />;
      case "settings": return <SettingsModule />;
      default: return <DashboardModule />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex">
      {/* ── Desktop Sidebar ── */}
      <aside className={`hidden lg:flex bg-[#1B2A4A] flex-col fixed h-full z-40 transition-all duration-300 ${sidebarCollapsed ? "w-[72px]" : "w-[250px]"}`}>
        <div className={`h-[64px] flex items-center px-4 ${sidebarCollapsed ? "justify-center" : "justify-between"}`}>
          {!sidebarCollapsed && (
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#F5B800] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-[#1B2A4A]" />
              </div>
              <span className="font-display text-[16px] font-semibold text-white">Udaan24</span>
            </Link>
          )}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="text-white/50 hover:text-white transition-colors">
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarModules.map((m) => (
            <button key={m.id} onClick={() => { setActiveModule(m.id); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${activeModule === m.id ? "bg-[#F5B800] text-[#1B2A4A]" : "text-white/60 hover:text-white hover:bg-white/5"}`}
              title={sidebarCollapsed ? m.label : undefined}>
              <m.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!sidebarCollapsed && <span className="truncate flex-1 text-left">{m.label}</span>}
              {m.id === "enquiries" && newLeads > 0 && (
                <span className={`${sidebarCollapsed ? "absolute ml-5 -mt-4" : ""} min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center`}>{newLeads}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button onClick={() => logout()} className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-white/50 hover:text-white transition-colors">
            <LogOut className="w-[18px] h-[18px]" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Mobile Sidebar ── */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden" onClick={() => setMobileSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <aside className="absolute left-0 top-0 bottom-0 w-[250px] bg-[#1B2A4A] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 flex justify-between items-center">
              <span className="font-display text-[16px] font-semibold text-white">Udaan24 CRM</span>
              <button onClick={() => setMobileSidebarOpen(false)} className="text-white"><X className="w-6 h-6" /></button>
            </div>
            <nav className="flex-1 px-3 space-y-1">
              {sidebarModules.map((m) => (
                <button key={m.id} onClick={() => { setActiveModule(m.id); setMobileSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium ${activeModule === m.id ? "bg-[#F5B800] text-[#1B2A4A]" : "text-white/60"}`}>
                  <m.icon className="w-[18px] h-[18px]" /><span className="flex-1 text-left">{m.label}</span>
                  {m.id === "enquiries" && newLeads > 0 && <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{newLeads}</span>}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[250px]"}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#E8EDF5] px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-2"><Menu className="w-5 h-5 text-[#1B2A4A]" /></button>
            <div className="hidden md:flex items-center text-[13px] text-[#718096]">
              <span>Admin</span><ChevronRight className="w-3 h-3 mx-1" />
              <span className="text-[#1B2A4A] font-medium capitalize">{sidebarModules.find((m) => m.id === activeModule)?.label || activeModule}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-[13px] text-[#4A5568]">{user.name}</span>
            <div className="w-8 h-8 rounded-full bg-[#F5B800] flex items-center justify-center text-[#1B2A4A] text-[12px] font-bold">{(user.name || "A").charAt(0).toUpperCase()}</div>
          </div>
        </header>

        {/* Module Content */}
        <main className="p-4 md:p-6">
          {renderContent()}
        </main>
      </div>

      <Toast />
    </div>
  );
}

// ═══════════════════════════════════════════════
// DASHBOARD MODULE
// ═══════════════════════════════════════════════
function DashboardModule() {
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();
  const { data: admissionsTrend } = trpc.dashboard.admissionsTrend.useQuery();
  const { data: recentStudents } = trpc.dashboard.recentStudents.useQuery();
  const { data: recentEnquiries } = trpc.dashboard.recentEnquiries.useQuery();
  const { data: feeBreakdown } = trpc.dashboard.feeBreakdown.useQuery();

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-[#F5B800] animate-spin" /></div>;

  const statItems = [
    { label: "AI Students", value: stats?.totalStudents || 0, icon: Users, color: "text-[#0071E3]", bg: "bg-[#F0F5FF]" },
    { label: "Active Courses", value: stats?.activeCourses || 0, icon: BookOpen, color: "text-[#22C55E]", bg: "bg-[#F0FFF4]" },
    { label: "AI Centres", value: stats?.totalCenters || 0, icon: Building2, color: "text-[#F5B800]", bg: "bg-[#FFF9E6]" },
    { label: "Enquiries", value: stats?.totalEnquiries || 0, icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Pending", value: stats?.pendingEnquiries || 0, icon: Bell, color: "text-red-500", bg: "bg-red-50" },
    { label: "Certificates", value: stats?.certificatesIssued || 0, icon: Award, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Fee (Monthly)", value: `Rs.${Number(stats?.feeThisMonth || 0).toLocaleString()}`, icon: CreditCard, color: "text-green-600", bg: "bg-green-50" },
    { label: "Pending Fees", value: stats?.pendingFees || 0, icon: CreditCard, color: "text-red-500", bg: "bg-red-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Add Student", module: "students", icon: Users },
          { label: "Add Course", module: "courses", icon: BookOpen },
          { label: "Add Centre", module: "centers", icon: Building2 },
          { label: "View Enquiries", module: "enquiries", icon: MessageSquare },
        ].map((action) => (
          <button key={action.label} onClick={() => useStore.getState().setActiveModule(action.module)} className="bg-white border border-[#E8EDF5] rounded-lg px-4 py-2.5 flex items-center gap-2 text-[13px] font-medium text-[#1B2A4A] hover:border-[#F5B800] hover:shadow-sm transition-all">
            <action.icon className="w-4 h-4 text-[#F5B800]" />{action.label}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statItems.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E8EDF5] p-6">
          <h3 className="font-body text-[15px] font-semibold text-[#1B2A4A] mb-6">AI Student Enrolments</h3>
          <div className="flex items-end gap-3 h-[200px]">
            {(admissionsTrend || []).map((v: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-[#E8EDF5] rounded-t-lg relative" style={{ height: `${Math.max((v.count / 10) * 160, 4)}px` }}>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1B2A4A] to-[#3D5A80] rounded-t-lg transition-all" style={{ height: "100%" }} />
                </div>
                <span className="text-[10px] text-[#718096]">{v.month}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E8EDF5] p-6">
          <h3 className="font-body text-[15px] font-semibold text-[#1B2A4A] mb-6">Fee Collection Status</h3>
          <div className="flex items-center justify-center h-[200px]">
            <div className="relative w-[160px] h-[160px]">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E8EDF5" strokeWidth="4" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22C55E" strokeWidth="4" strokeDasharray={`${feeBreakdown?.paidPct ?? 0}, 100`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-[24px] font-semibold text-[#1B2A4A]">{feeBreakdown?.paidPct ?? 0}%</span>
                <span className="text-[10px] text-[#718096]">Collected</span>
              </div>
            </div>
            <div className="ml-8 space-y-3">
              {[
                { color: "#22C55E", label: `Paid (${feeBreakdown?.paidPct ?? 0}%)`, count: feeBreakdown?.paid ?? 0 },
                { color: "#F5B800", label: `Partial (${feeBreakdown?.partialPct ?? 0}%)`, count: feeBreakdown?.partial ?? 0 },
                { color: "#EF4444", label: `Pending (${feeBreakdown?.pendingPct ?? 0}%)`, count: feeBreakdown?.pending ?? 0 },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                  <span className="text-[12px] text-[#4A5568]">{s.label} · {s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E8EDF5] overflow-hidden">
          <div className="p-4 border-b border-[#E8EDF5] flex items-center justify-between">
            <h3 className="font-body text-[15px] font-semibold text-[#1B2A4A]">Recent AI Students</h3>
            <button onClick={() => useStore.getState().setActiveModule("students")} className="text-[12px] text-[#F5B800] font-medium">View All</button>
          </div>
          <table className="w-full">
            <tbody className="divide-y divide-[#E8EDF5]">
              {(recentStudents || []).slice(0, 5).map((s: any) => (
                <tr key={s.id} className="hover:bg-[#F5F6FA]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FFF9E6] flex items-center justify-center text-[#F5B800] text-[12px] font-bold">{s.name.charAt(0)}</div>
                      <div>
                        <p className="text-[13px] font-medium text-[#1B2A4A]">{s.name}</p>
                        <p className="text-[11px] text-[#718096]">{s.rollNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right"><StatusBadge status={s.feeStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded-xl border border-[#E8EDF5] overflow-hidden">
          <div className="p-4 border-b border-[#E8EDF5] flex items-center justify-between">
            <h3 className="font-body text-[15px] font-semibold text-[#1B2A4A]">Recent Enquiries</h3>
            <button onClick={() => useStore.getState().setActiveModule("enquiries")} className="text-[12px] text-[#F5B800] font-medium">View All</button>
          </div>
          <table className="w-full">
            <tbody className="divide-y divide-[#E8EDF5]">
              {(recentEnquiries || []).slice(0, 5).map((e: any) => (
                <tr key={e.id} className="hover:bg-[#F5F6FA]">
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-medium text-[#1B2A4A]">{e.name}</p>
                    <p className="text-[11px] text-[#718096]">{e.courseInterest || e.type}</p>
                  </td>
                  <td className="px-4 py-3 text-right"><StatusBadge status={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// STUDENTS MODULE - FULL CRUD
// ═══════════════════════════════════════════════
function StudentsModule() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [centerFilter, setCenterFilter] = useState("");
  const [feeFilter, setFeeFilter] = useState("");
  const [admissionFilter, setAdmissionFilter] = useState("");
  const [viewId, setViewId] = useState<number | null>(null);
  const { showToast, openModal, closeModal, modalOpen, modalType, studentFocusSearch, setStudentFocusSearch } = useStore();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [creds, setCreds] = useState<any>(null);

  // Deep-link from a converted lead: pre-fill the search with the linked student's roll number.
  useEffect(() => {
    if (studentFocusSearch) {
      setSearch(studentFocusSearch);
      setPage(1);
      setStudentFocusSearch("");
    }
  }, [studentFocusSearch, setStudentFocusSearch]);

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.students.list.useQuery({
    search: search || undefined,
    status: statusFilter || undefined,
    courseId: courseFilter ? Number(courseFilter) : undefined,
    centerId: centerFilter ? Number(centerFilter) : undefined,
    feeStatus: feeFilter || undefined,
    admissionStatus: admissionFilter || undefined,
    page, limit: 10,
  });
  const createMutation = trpc.students.create.useMutation({ onSuccess: (r) => { utils.students.list.invalidate(); utils.dashboard.stats.invalidate(); showToast("Student created — credentials generated", "success"); closeModal(); setFormData({}); setCreds(r); }, onError: (e) => showToast(e.message, "error") });
  const updateMutation = trpc.students.update.useMutation({ onSuccess: () => { utils.students.list.invalidate(); showToast("Student updated successfully", "success"); closeModal(); setEditingId(null); setFormData({}); }, onError: (e) => showToast(e.message, "error") });
  const deleteMutation = trpc.students.delete.useMutation({ onSuccess: () => { utils.students.list.invalidate(); utils.dashboard.stats.invalidate(); showToast("Student deleted successfully", "success"); }, onError: (e) => showToast(e.message, "error") });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const openAddModal = () => { setEditingId(null); setFormData({}); openModal("Add Student"); };
  const openEditModal = (student: any) => { setEditingId(student.id); setFormData({ ...student }); openModal("Edit Student"); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) { updateMutation.mutate({ id: editingId, ...formData, courseId: formData.courseId ? Number(formData.courseId) : undefined, centerId: formData.centerId ? Number(formData.centerId) : undefined }); }
    else { createMutation.mutate({ ...formData, courseId: formData.courseId ? Number(formData.courseId) : undefined, centerId: formData.centerId ? Number(formData.centerId) : undefined }); }
  };

  const { data: coursesData } = trpc.courses.list.useQuery();
  const { data: centersData } = trpc.centers.list.useQuery();

  const statusOptions = [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }, { value: "completed", label: "Completed" }, { value: "dropped", label: "Dropped" }];
  const feeOptions = [{ value: "paid", label: "Paid" }, { value: "pending", label: "Pending" }, { value: "partial", label: "Partial" }];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="font-display text-[24px] font-semibold text-[#1B2A4A]">AI Students</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-[#E8EDF5]">
            <Search className="w-4 h-4 text-[#718096] mr-2" />
            <input type="text" placeholder="Name, roll, mobile, email, centre code…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="bg-transparent text-[13px] outline-none w-56" />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="h-9 px-3 bg-white border border-[#E8EDF5] rounded-lg text-[13px] outline-none">
            <option value="">All Status</option>{statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={courseFilter} onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }} className="h-9 px-3 bg-white border border-[#E8EDF5] rounded-lg text-[13px] outline-none">
            <option value="">All Courses</option>{(coursesData || []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={centerFilter} onChange={(e) => { setCenterFilter(e.target.value); setPage(1); }} className="h-9 px-3 bg-white border border-[#E8EDF5] rounded-lg text-[13px] outline-none">
            <option value="">All Centres</option>{(centersData?.list || []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={feeFilter} onChange={(e) => { setFeeFilter(e.target.value); setPage(1); }} className="h-9 px-3 bg-white border border-[#E8EDF5] rounded-lg text-[13px] outline-none">
            <option value="">All Payments</option>{feeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={admissionFilter} onChange={(e) => { setAdmissionFilter(e.target.value); setPage(1); }} className="h-9 px-3 bg-white border border-[#E8EDF5] rounded-lg text-[13px] outline-none">
            <option value="">All Admissions</option><option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="completed">Completed</option>
          </select>
          <button onClick={() => downloadCSV("students.csv", (data?.list || []).map((s: any) => ({ roll: s.rollNumber, name: s.name, phone: s.phone, email: s.email, course: (coursesData || []).find((c: any) => c.id === s.courseId)?.name, centre: (centersData?.list || []).find((c: any) => c.id === s.centerId)?.name, status: s.status, payment: s.feeStatus, paymentMode: s.paymentMode, admission: s.admissionStatus, razorpay: s.razorpayPaymentId })))} className="flex items-center gap-1.5 text-[13px] text-[#1B2A4A] font-medium px-3 py-2 border border-[#E8EDF5] rounded-lg hover:bg-[#F5F6FA]"><Download className="w-4 h-4" />Export</button>
          <button onClick={openAddModal} className="bg-[#F5B800] text-[#1B2A4A] px-4 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 hover:bg-[#E0A800] transition-colors">
            <Plus className="w-4 h-4" />Add Student
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E8EDF5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F5F6FA]">
              <tr className="text-left text-[11px] text-[#718096] uppercase tracking-wider">
                <th className="p-4 font-medium">Roll No</th><th className="p-4 font-medium">Name</th><th className="p-4 font-medium">Course</th>
                <th className="p-4 font-medium">Centre</th><th className="p-4 font-medium">Fee</th><th className="p-4 font-medium">Admission</th><th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EDF5]">
              {isLoading ? (
                <tr><td colSpan={7} className="p-8 text-center"><Loader2 className="w-6 h-6 text-[#F5B800] animate-spin mx-auto" /></td></tr>
              ) : (data?.list || []).length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-[#718096]">No students found</td></tr>
              ) : (data?.list || []).map((s: any) => (
                <tr key={s.id} className="hover:bg-[#F5F6FA] transition-colors">
                  <td className="p-4 text-[12px] font-mono text-[#718096]">{s.rollNumber}</td>
                  <td className="p-4 text-[13px] font-medium text-[#1B2A4A]">{s.name}</td>
                  <td className="p-4 text-[13px] text-[#4A5568]">{(coursesData || []).find((c: any) => c.id === s.courseId)?.name || "-"}</td>
                  <td className="p-4 text-[13px] text-[#4A5568]">{(centersData?.list || []).find((c: any) => c.id === s.centerId)?.name || "-"}</td>
                  <td className="p-4"><StatusBadge status={s.feeStatus} /></td>
                  <td className="p-4"><span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${s.admissionStatus === "completed" ? "bg-green-50 text-green-700" : s.admissionStatus === "in_progress" ? "bg-yellow-50 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>{(s.admissionStatus || "pending").replace("_", " ")}</span></td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewId(s.id)} className="w-7 h-7 rounded-lg hover:bg-[#E8EDF5] flex items-center justify-center" title="View details"><Eye className="w-3.5 h-3.5 text-[#718096]" /></button>
                      <button onClick={() => openEditModal(s)} className="w-7 h-7 rounded-lg hover:bg-[#E8EDF5] flex items-center justify-center"><Edit className="w-3.5 h-3.5 text-[#718096]" /></button>
                      <button onClick={() => { if (confirm("Delete this student?")) deleteMutation.mutate({ id: s.id }); }} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data && data.pages > 1 && <Pagination page={page} pages={data.pages} onChange={setPage} />}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (modalType === "Add Student" || modalType === "Edit Student") && (
        <CrudModal title={modalType}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <ImageUpload value={formData.photo} onChange={(v) => setFormData({ ...formData, photo: v })} label="Student Image" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Full Name" name="name" value={formData.name} onChange={handleFormChange} required placeholder="Student name" />
              <FormInput label="Aadhar Number" name="aadharNumber" value={formData.aadharNumber} onChange={handleFormChange} placeholder="Optional · 12 digits" />
              <FormInput label="Email" name="email" value={formData.email} onChange={handleFormChange} type="email" placeholder="student@email.com" />
              <FormInput label="Phone" name="phone" value={formData.phone} onChange={handleFormChange} placeholder="+91 98765 43210" />
              <FormSelect label="Category" name="category" value={formData.category} onChange={handleFormChange} options={[{ value: "general", label: "General" }, { value: "sc_st", label: "SC/ST" }, { value: "bc_obc", label: "BC/OBC" }]} />
              <FormInput label="Roll Number" name="rollNumber" value={formData.rollNumber} onChange={handleFormChange} placeholder="Auto-generated if blank" />
              <FormSelect label="AI Course" name="courseId" value={formData.courseId} onChange={handleFormChange} options={(coursesData || []).map((c: any) => ({ value: String(c.id), label: c.name }))} />
              <FormSelect label="Centre" name="centerId" value={formData.centerId} onChange={handleFormChange} options={(centersData?.list || []).map((c: any) => ({ value: String(c.id), label: c.name }))} />
              <FormSelect label="Status" name="status" value={formData.status} onChange={handleFormChange} options={statusOptions} />
              <FormSelect label="Payment Status" name="feeStatus" value={formData.feeStatus} onChange={handleFormChange} options={feeOptions} />
              <FormSelect label="Payment Mode" name="paymentMode" value={formData.paymentMode} onChange={handleFormChange} options={[{ value: "online", label: "Online Payment" }, { value: "offline_cash", label: "Offline · Cash" }, { value: "offline_upi", label: "Offline · UPI" }, { value: "offline_bank", label: "Offline · Bank Transfer" }]} />
              <FormInput label="City" name="city" value={formData.city} onChange={handleFormChange} placeholder="Kotkapura" />
              <FormInput label="State" name="state" value={formData.state} onChange={handleFormChange} placeholder="Punjab" />
            </div>
            {!editingId && <p className="text-[12px] text-[#718096] bg-[#FFF9E6] rounded-lg px-3 py-2">A unique Student ID, username and temporary password are generated automatically on save.</p>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={closeModal} className="btn-secondary flex-1 py-2.5 text-[13px]">Cancel</button>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn-primary flex-1 py-2.5 text-[13px] flex items-center justify-center gap-2">
                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? "Update" : "Save"} Student
              </button>
            </div>
          </form>
        </CrudModal>
      )}

      {viewId && <StudentDetailModal id={viewId} onClose={() => setViewId(null)} onCreds={(c) => setCreds(c)} />}
      {creds && <CredentialsModal creds={creds} onClose={() => setCreds(null)} />}
    </div>
  );
}

// Full student detail (admission + siblings + payment) for Super Admin, with credential actions.
function StudentDetailModal({ id, onClose, onCreds }: { id: number; onClose: () => void; onCreds: (c: any) => void }) {
  const { data, isLoading } = trpc.students.detail.useQuery({ id });
  const { showToast } = useStore();
  const utils = trpc.useUtils();
  const resetPw = trpc.students.resetPassword.useMutation({ onSuccess: (r) => { onCreds(r); showToast("Password reset", "success"); }, onError: (e) => showToast(e.message, "error") });
  const activate = trpc.students.approveActivate.useMutation({ onSuccess: (r) => { utils.students.list.invalidate(); utils.students.detail.invalidate({ id }); onCreds(r); showToast("Student activated", "success"); }, onError: (e) => showToast(e.message, "error") });
  const setStatus = trpc.students.update.useMutation({ onSuccess: () => { utils.students.list.invalidate(); utils.students.detail.invalidate({ id }); showToast("Status updated", "success"); }, onError: (e) => showToast(e.message, "error") });
  const Row = ({ k, v }: { k: string; v: any }) => (<div className="flex justify-between gap-3 py-1.5 border-b border-[#F0F2F7] last:border-0"><span className="text-[12px] text-[#718096]">{k}</span><span className="text-[13px] text-[#1B2A4A] text-right capitalize">{v ?? "—"}</span></div>);
  const s = data?.student;
  const fmt = (d: any) => (d ? new Date(d).toLocaleDateString() : "—");
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[rgba(27,42,74,0.5)]" />
      <div className="relative bg-white rounded-2xl w-full max-w-[600px] max-h-[88vh] overflow-y-auto z-10" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-[#E8EDF5] px-6 py-4 flex items-center justify-between rounded-t-2xl"><h3 className="font-body text-[16px] font-semibold text-[#1B2A4A]">Student Details</h3><button onClick={onClose}><X className="w-5 h-5 text-[#718096]" /></button></div>
        {isLoading || !s ? <div className="p-10 flex justify-center"><Loader2 className="w-7 h-7 text-[#F5B800] animate-spin" /></div> : (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              {s.photo ? <img src={s.photo} alt="" className="w-16 h-16 rounded-full object-cover border border-[#E8EDF5]" /> : <div className="w-16 h-16 rounded-full bg-[#F5F6FA] border border-[#E8EDF5] flex items-center justify-center text-[#718096] text-[11px]">No image</div>}
              <div className="flex-1"><p className="font-display text-[18px] font-semibold text-[#1B2A4A]">{s.name}</p><p className="text-[12px] font-mono text-[#718096]">{s.rollNumber}</p></div>
              <div className="flex flex-col items-end gap-1"><StatusBadge status={s.status} /><span className="text-[11px] text-[#718096]">{admissionProgress(s)}</span></div>
            </div>
            <div className="bg-[#F5F6FA] rounded-xl p-4">
              <Row k="Student ID" v={s.rollNumber} /><Row k="Username" v={s.username || "— (not generated)"} /><Row k="Account Status" v={s.status} /><Row k="Profile Completed" v={s.profileCompleted ? "Yes" : "No"} /><Row k="Created By Admin" v={s.createdByAdmin ? "Yes" : "Self-registered"} />
            </div>
            {/* Super Admin credential / status actions */}
            <div className="flex flex-wrap gap-2">
              {s.status === "inactive" ? (
                <button onClick={() => activate.mutate({ id })} disabled={activate.isPending} className="btn-primary flex-1 py-2.5 text-[12px] flex items-center justify-center gap-1.5">{activate.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}Approve & Generate Credentials</button>
              ) : (
                <button onClick={() => setStatus.mutate({ id, status: "inactive" })} disabled={setStatus.isPending} className="btn-secondary flex-1 py-2.5 text-[12px]">Disable Student</button>
              )}
              <button onClick={() => resetPw.mutate({ id })} disabled={resetPw.isPending} className="btn-secondary flex-1 py-2.5 text-[12px] flex items-center justify-center gap-1.5">{resetPw.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}Reset Password</button>
            </div>
            <div className="bg-[#F5F6FA] rounded-xl p-4">
              <Row k="Gender" v={s.gender} /><Row k="Category" v={s.category === "sc_st" ? "SC/ST" : s.category === "bc_obc" ? "BC/OBC" : s.category} /><Row k="Father Name" v={s.fatherName} /><Row k="Mother Name" v={s.motherName} />
              <Row k="Date of Birth" v={fmt(s.dob)} /><Row k="Contact" v={s.phone} /><Row k="Email" v={s.email} /><Row k="Address" v={s.address} /><Row k="Aadhar" v={s.aadharNumber} />
            </div>
            <div className="bg-[#F5F6FA] rounded-xl p-4">
              <Row k="Course" v={data.courseName} /><Row k="Duration" v={data.courseDuration} /><Row k="Centre" v={data.centreName ? `${data.centreName}${data.centreCity ? `, ${data.centreCity}` : ""}` : "Main Office, Kotkapura"} />
              <Row k="Admission Status" v={(s.admissionStatus || "").replace("_", " ")} />
            </div>
            <div className="bg-[#F5F6FA] rounded-xl p-4">
              <Row k="Payment Status" v={s.feeStatus} /><Row k="Payment Mode" v={(s.paymentMode || "").replace(/_/g, " ")} /><Row k="Received Date" v={fmt(s.paymentReceivedDate)} />
              <Row k="Razorpay Payment ID" v={s.razorpayPaymentId} /><Row k="Reference" v={s.paymentReference} /><Row k="Remarks" v={s.paymentRemarks} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#1B2A4A] mb-2">Siblings ({(data.siblings || []).length})</p>
              {(data.siblings || []).length === 0 ? <p className="text-[12px] text-[#718096]">No siblings recorded.</p> : (
                <div className="border border-[#E8EDF5] rounded-lg overflow-hidden"><table className="w-full"><thead className="bg-[#F5F6FA]"><tr className="text-left text-[11px] text-[#718096] uppercase"><th className="p-2 font-medium">Name</th><th className="p-2 font-medium">Relation</th><th className="p-2 font-medium">Age</th><th className="p-2 font-medium">Qualification</th></tr></thead>
                  <tbody className="divide-y divide-[#E8EDF5]">{(data.siblings || []).map((sb: any) => <tr key={sb.id}><td className="p-2 text-[13px]">{sb.siblingName}</td><td className="p-2 text-[13px]">{sb.siblingRelation}</td><td className="p-2 text-[13px]">{sb.siblingAge}</td><td className="p-2 text-[13px]">{sb.siblingQualification}</td></tr>)}</tbody>
                </table></div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// COURSES MODULE - FULL CRUD
// ═══════════════════════════════════════════════
function CoursesModule() {
  const [search, setSearch] = useState("");
  const { showToast, openModal, closeModal, modalOpen, modalType } = useStore();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const utils = trpc.useUtils();

  const { data: coursesData, isLoading } = trpc.courses.list.useQuery({ search: search || undefined });
  const createMutation = trpc.courses.create.useMutation({ onSuccess: () => { utils.courses.list.invalidate(); showToast("Course added", "success"); closeModal(); setFormData({}); }, onError: (e) => showToast(e.message, "error") });
  const updateMutation = trpc.courses.update.useMutation({ onSuccess: () => { utils.courses.list.invalidate(); showToast("Course updated", "success"); closeModal(); setEditingId(null); setFormData({}); }, onError: (e) => showToast(e.message, "error") });
  const deleteMutation = trpc.courses.delete.useMutation({ onSuccess: () => { utils.courses.list.invalidate(); showToast("Course deleted", "success"); }, onError: (e) => showToast(e.message, "error") });

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) updateMutation.mutate({ id: editingId, ...formData });
    else createMutation.mutate({ ...formData, slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-") });
  };

  const categoryOptions = [
    { value: "foundation", label: "Foundation" }, { value: "core_ai", label: "Core AI" },
    { value: "advanced_ai", label: "Advanced AI" }, { value: "specialization", label: "Specialization" },
    { value: "analytics", label: "Analytics" }, { value: "premium", label: "Premium" }, { value: "short_term", label: "Short Term" },
  ];
  const modeOptions = [{ value: "online", label: "Online" }, { value: "offline", label: "Offline" }, { value: "hybrid", label: "Hybrid" }];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="font-display text-[24px] font-semibold text-[#1B2A4A]">AI Courses</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-[#E8EDF5]">
            <Search className="w-4 h-4 text-[#718096] mr-2" />
            <input type="text" placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-[13px] outline-none w-40" />
          </div>
          <button onClick={() => { setEditingId(null); setFormData({}); openModal("Add Course"); }} className="bg-[#F5B800] text-[#1B2A4A] px-4 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 hover:bg-[#E0A800] transition-colors">
            <Plus className="w-4 h-4" />Add Course
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? <div className="col-span-full text-center py-8"><Loader2 className="w-6 h-6 text-[#F5B800] animate-spin mx-auto" /></div> :
          (coursesData || []).length === 0 ? <div className="col-span-full text-center py-8 text-[#718096]">No courses found</div> :
            (coursesData || []).map((c: any) => (
              <div key={c.id} className="bg-white rounded-xl border border-[#E8EDF5] p-5 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#FFF9E6] text-[#1B2A4A]">{categoryOptions.find(o => o.value === c.category)?.label || c.category}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingId(c.id); setFormData({ ...c }); openModal("Edit Course"); }} className="w-7 h-7 rounded-lg hover:bg-[#E8EDF5] flex items-center justify-center"><Edit className="w-3.5 h-3.5 text-[#718096]" /></button>
                    <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate({ id: c.id }); }} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                  </div>
                </div>
                <h3 className="font-body text-[15px] font-semibold text-[#1B2A4A] mb-1">{c.name}</h3>
                <p className="text-[12px] text-[#718096] mb-3">{c.duration} &middot; {c.mode}</p>
                <div className="flex items-center justify-between">
                  <div className="text-[12px] text-[#4A5568]">
                    <span className="font-semibold text-[#1B2A4A]">Offline Rs.{Number(c.offlineFee || c.fee || 0).toLocaleString()}</span>
                    <span className="mx-1 text-[#CBD5E0]">|</span>
                    <span className="font-semibold text-[#1B2A4A]">Online Rs.{Number(c.onlineFee || 0).toLocaleString()}</span>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              </div>
            ))}
      </div>

      {modalOpen && (modalType === "Add Course" || modalType === "Edit Course") && (
        <CrudModal title={modalType}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Course Name" name="name" value={formData.name} onChange={handleChange} required />
              <FormInput label="Slug" name="slug" value={formData.slug} onChange={handleChange} placeholder="auto-generated" />
              <FormSelect label="Category" name="category" value={formData.category} onChange={handleChange} options={categoryOptions} required />
              <FormSelect label="Mode" name="mode" value={formData.mode} onChange={handleChange} options={modeOptions} />
              <FormInput label="Duration" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g. 4 Months" />
              <FormInput label="Offline Fee (Rs.)" name="offlineFee" value={formData.offlineFee} onChange={handleChange} placeholder="e.g. 10999" />
              <FormInput label="Online Fee (Rs.)" name="onlineFee" value={formData.onlineFee} onChange={handleChange} placeholder="e.g. 5999" />
              <FormInput label="Certification" name="certification" value={formData.certification} onChange={handleChange} placeholder="Certificate name" />
              <FormInput label="Eligibility" name="eligibility" value={formData.eligibility} onChange={handleChange} placeholder="e.g. 10th Pass" />
              <FormSelect label="Status" name="status" value={formData.status} onChange={handleChange} options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]} />
            </div>
            <ImageUpload value={formData.thumbnail} onChange={(v) => setFormData({ ...formData, thumbnail: v })} label="Course Image" />
            <FormInput label="Image URL (optional)" name="thumbnail" value={formData.thumbnail} onChange={handleChange} placeholder="Or paste an https:// image URL" />
            <FormInput label="Short Description" name="shortDescription" value={formData.shortDescription} onChange={handleChange} placeholder="One-line summary shown on cards" />
            <FormInput label="Full Description" name="description" value={formData.description} onChange={handleChange} placeholder="Detailed course description..." />
            <FormInput label="Highlights" name="highlights" value={formData.highlights} onChange={handleChange} placeholder="Semicolon or comma separated highlights" />
            <FormInput label="What Students Learn (Syllabus)" name="syllabus" value={formData.syllabus} onChange={handleChange} placeholder="Semicolon or comma separated topics" />
            <FormInput label="Career Opportunities" name="careerOpportunities" value={formData.careerOpportunities} onChange={handleChange} placeholder="Comma-separated roles" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="SEO Title" name="seoTitle" value={formData.seoTitle} onChange={handleChange} placeholder="SEO meta title" />
              <FormInput label="SEO Keywords" name="seoKeywords" value={formData.seoKeywords} onChange={handleChange} placeholder="comma-separated keywords" />
            </div>
            <FormInput label="SEO Description" name="seoDescription" value={formData.seoDescription} onChange={handleChange} placeholder="SEO meta description" />
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={closeModal} className="btn-secondary flex-1 py-2.5 text-[13px]">Cancel</button>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn-primary flex-1 py-2.5 text-[13px] flex items-center justify-center gap-2">
                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </CrudModal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// CENTRES MODULE - FULL CRUD
// ═══════════════════════════════════════════════
// Modal showing a centre's full details + the students mapped to it.
function CentreDetailModal({ center, onClose }: { center: any; onClose: () => void }) {
  const { data: students, isLoading } = trpc.students.byCenter.useQuery({ centerId: center.id });
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[rgba(27,42,74,0.5)]" />
      <div className="relative bg-white rounded-2xl w-full max-w-[640px] max-h-[85vh] overflow-y-auto z-10 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-display text-[20px] font-semibold text-[#1B2A4A]">{center.name}</h3>
            <p className="text-[12px] text-[#718096]">{center.centerCode}</p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-[#718096]" /></button>
        </div>
        <div className="flex items-center gap-2 mb-4"><StatusBadge status={center.status} /></div>
        <div className="grid grid-cols-2 gap-3 text-[13px] mb-5">
          <div><span className="text-[#718096]">Owner</span><p className="text-[#1B2A4A] font-medium">{center.ownerName || "-"}</p></div>
          <div><span className="text-[#718096]">Phone</span><p className="text-[#1B2A4A]">{center.ownerPhone || "-"}</p></div>
          <div><span className="text-[#718096]">Email</span><p className="text-[#1B2A4A]">{center.email || "-"}</p></div>
          <div><span className="text-[#718096]">Location</span><p className="text-[#1B2A4A]">{[center.city, center.state, center.pincode].filter(Boolean).join(", ") || "-"}</p></div>
          <div className="col-span-2"><span className="text-[#718096]">Address</span><p className="text-[#1B2A4A]">{center.address || "-"}</p></div>
          {center.documents && <div className="col-span-2"><span className="text-[#718096]">Application / Documents</span><p className="text-[#1B2A4A] text-[12px]">{center.documents}</p></div>}
        </div>
        <h4 className="font-body text-[14px] font-semibold text-[#1B2A4A] mb-2">Mapped Students ({(students || []).length})</h4>
        <div className="border border-[#E8EDF5] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#F5F6FA]"><tr className="text-left text-[11px] text-[#718096] uppercase"><th className="p-3 font-medium">Roll</th><th className="p-3 font-medium">Name</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Fee</th></tr></thead>
            <tbody className="divide-y divide-[#E8EDF5]">
              {isLoading ? <tr><td colSpan={4} className="p-6 text-center"><Loader2 className="w-5 h-5 text-[#F5B800] animate-spin mx-auto" /></td></tr> :
                (students || []).length === 0 ? <tr><td colSpan={4} className="p-6 text-center text-[#718096] text-[13px]">No students mapped</td></tr> :
                  (students || []).map((s: any) => (
                    <tr key={s.id}><td className="p-3 text-[12px] font-mono text-[#718096]">{s.rollNumber}</td><td className="p-3 text-[13px] text-[#1B2A4A]">{s.name}</td><td className="p-3"><StatusBadge status={s.status} /></td><td className="p-3"><StatusBadge status={s.feeStatus} /></td></tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CentersModule() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewCenter, setViewCenter] = useState<any>(null);
  const { showToast, openModal, closeModal, modalOpen, modalType } = useStore();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.centers.list.useQuery({ search: search || undefined, status: statusFilter || undefined });
  const refresh = () => utils.centers.list.invalidate();
  const createMutation = trpc.centers.create.useMutation({ onSuccess: (r: any) => { refresh(); showToast(`Centre added · code ${r.centerCode}`, "success"); closeModal(); setFormData({}); }, onError: (e) => showToast(e.message, "error") });
  const updateMutation = trpc.centers.update.useMutation({ onSuccess: () => { refresh(); showToast("Centre updated", "success"); closeModal(); setEditingId(null); setFormData({}); }, onError: (e) => showToast(e.message, "error") });
  const deleteMutation = trpc.centers.delete.useMutation({ onSuccess: () => { refresh(); showToast("Centre deleted", "success"); }, onError: (e) => showToast(e.message, "error") });
  const approveMutation = trpc.centers.approve.useMutation({ onSuccess: (r: any) => { refresh(); showToast(`Approved · code ${r.centerCode} / pw ${r.password}`, "success"); }, onError: (e) => showToast(e.message, "error") });
  const rejectMutation = trpc.centers.reject.useMutation({ onSuccess: () => { refresh(); showToast("Application rejected", "success"); }, onError: (e) => showToast(e.message, "error") });
  const statusMutation = trpc.centers.setStatus.useMutation({ onSuccess: () => { refresh(); showToast("Status updated", "success"); }, onError: (e) => showToast(e.message, "error") });

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (editingId) updateMutation.mutate({ id: editingId, ...formData }); else createMutation.mutate(formData); };

  const filters = [
    { label: "All", value: "" }, { label: "Applications", value: "pending" }, { label: "Active", value: "active" },
    { label: "Suspended", value: "suspended" }, { label: "Rejected", value: "rejected" }, { label: "Inactive", value: "inactive" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="font-display text-[24px] font-semibold text-[#1B2A4A]">Study Centres</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-[#E8EDF5]">
            <Search className="w-4 h-4 text-[#718096] mr-2" />
            <input type="text" placeholder="Search centres..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-[13px] outline-none w-40" />
          </div>
          <button onClick={() => { setEditingId(null); setFormData({}); openModal("Add Centre"); }} className="bg-[#F5B800] text-[#1B2A4A] px-4 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 hover:bg-[#E0A800]">
            <Plus className="w-4 h-4" />Add Centre
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button key={f.value} onClick={() => setStatusFilter(f.value)} className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-colors ${statusFilter === f.value ? "bg-[#1B2A4A] text-white" : "bg-white border border-[#E8EDF5] text-[#4A5568] hover:border-[#1B2A4A]"}`}>{f.label}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? <div className="col-span-full text-center py-8"><Loader2 className="w-6 h-6 text-[#F5B800] animate-spin mx-auto" /></div> :
          (data?.list || []).length === 0 ? <div className="col-span-full text-center py-8 text-[#718096]">No centres found</div> :
            (data?.list || []).map((c: any) => (
              <div key={c.id} className="bg-white rounded-xl border border-[#E8EDF5] p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FFF9E6] flex items-center justify-center flex-shrink-0"><Building2 className="w-6 h-6 text-[#F5B800]" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-body text-[15px] font-semibold text-[#1B2A4A] truncate">{c.name}</h3>
                        <p className="text-[12px] text-[#718096] truncate">{c.centerCode} &middot; {c.city || "—"}, {c.state || ""}</p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    {c.ownerName && <p className="text-[11px] text-[#718096] mt-1">Owner: {c.ownerName} {c.ownerPhone ? `· ${c.ownerPhone}` : ""}</p>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[#E8EDF5]">
                  <button onClick={() => setViewCenter(c)} className="flex items-center gap-1 text-[12px] text-[#1B2A4A] font-medium px-2.5 py-1 rounded-lg hover:bg-[#F5F6FA]"><Eye className="w-3.5 h-3.5" />View</button>
                  <button onClick={() => { setEditingId(c.id); setFormData({ ...c }); openModal("Edit Centre"); }} className="flex items-center gap-1 text-[12px] text-[#718096] font-medium px-2.5 py-1 rounded-lg hover:bg-[#F5F6FA]"><Edit className="w-3.5 h-3.5" />Edit</button>
                  {isSuperAdmin && c.status === "pending" && (
                    <>
                      <button onClick={() => approveMutation.mutate({ id: c.id })} className="flex items-center gap-1 text-[12px] text-green-700 font-medium px-2.5 py-1 rounded-lg bg-green-50 hover:bg-green-100"><CheckCircle className="w-3.5 h-3.5" />Approve</button>
                      <button onClick={() => { if (confirm("Reject this application?")) rejectMutation.mutate({ id: c.id }); }} className="flex items-center gap-1 text-[12px] text-red-600 font-medium px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100"><X className="w-3.5 h-3.5" />Reject</button>
                    </>
                  )}
                  {isSuperAdmin && c.status === "active" && (
                    <button onClick={() => statusMutation.mutate({ id: c.id, status: "suspended" })} className="text-[12px] text-orange-600 font-medium px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100">Suspend</button>
                  )}
                  {isSuperAdmin && (c.status === "suspended" || c.status === "inactive") && (
                    <button onClick={() => statusMutation.mutate({ id: c.id, status: "active" })} className="text-[12px] text-green-700 font-medium px-2.5 py-1 rounded-lg bg-green-50 hover:bg-green-100">Activate</button>
                  )}
                  {isSuperAdmin && (
                    <button onClick={() => { if (confirm("Delete this centre permanently?")) deleteMutation.mutate({ id: c.id }); }} className="flex items-center gap-1 text-[12px] text-red-500 font-medium px-2.5 py-1 rounded-lg hover:bg-red-50 ml-auto"><Trash2 className="w-3.5 h-3.5" />Delete</button>
                  )}
                </div>
              </div>
            ))}
      </div>

      {viewCenter && <CentreDetailModal center={viewCenter} onClose={() => setViewCenter(null)} />}

      {modalOpen && (modalType === "Add Centre" || modalType === "Edit Centre") && (
        <CrudModal title={modalType}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Centre Name" name="name" value={formData.name} onChange={handleChange} required />
              <FormInput label="Centre Code" name="centerCode" value={formData.centerCode} onChange={handleChange} placeholder="Auto-generated if blank" />
              <FormInput label="Owner Name" name="ownerName" value={formData.ownerName} onChange={handleChange} />
              <FormInput label="Owner Phone" name="ownerPhone" value={formData.ownerPhone} onChange={handleChange} />
              <FormInput label="Email" name="email" value={formData.email} onChange={handleChange} type="email" />
              <FormInput label="Login Password" name="password" value={formData.password} onChange={handleChange} placeholder="Default: center123" />
              <FormInput label="City" name="city" value={formData.city} onChange={handleChange} />
              <FormInput label="State" name="state" value={formData.state} onChange={handleChange} />
              <FormInput label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} />
              <FormSelect label="Status" name="status" value={formData.status} onChange={handleChange} options={[{ value: "active", label: "Active" }, { value: "pending", label: "Pending" }, { value: "suspended", label: "Suspended" }, { value: "inactive", label: "Inactive" }]} />
              <div className="sm:col-span-2"><FormInput label="Address" name="address" value={formData.address} onChange={handleChange} placeholder="Full address..." /></div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={closeModal} className="btn-secondary flex-1 py-2.5 text-[13px]">Cancel</button>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn-primary flex-1 py-2.5 text-[13px] flex items-center justify-center gap-2">
                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </CrudModal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// ENQUIRIES MODULE - FULL CRUD
// ═══════════════════════════════════════════════
const LEAD_STATUS_OPTS = [
  { value: "new", label: "New" }, { value: "contacted", label: "Contacted" }, { value: "follow_up", label: "Follow-Up" },
  { value: "converted", label: "Converted" }, { value: "not_interested", label: "Not Interested" }, { value: "closed", label: "Closed" },
];
const toDateInput = (d: any) => (d ? new Date(d).toISOString().slice(0, 10) : "");

// ─── Lead: read-only View modal ───
function LeadViewModal({ lead, onClose, onEdit, onConvert, onViewStudent }: { lead: any; onClose: () => void; onEdit: () => void; onConvert: () => void; onViewStudent: () => void }) {
  const Row = ({ k, v }: { k: string; v: any }) => (<div className="flex justify-between gap-3 py-1.5 border-b border-[#F0F2F7] last:border-0"><span className="text-[12px] text-[#718096]">{k}</span><span className="text-[13px] text-[#1B2A4A] text-right">{v || "—"}</span></div>);
  const isConverted = !!lead.convertedStudentId;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[rgba(27,42,74,0.5)]" />
      <div className="relative bg-white rounded-2xl w-full max-w-[560px] max-h-[88vh] overflow-y-auto z-10" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-[#E8EDF5] px-6 py-4 flex items-center justify-between rounded-t-2xl"><h3 className="font-body text-[16px] font-semibold text-[#1B2A4A] flex items-center gap-2">Lead Details <StatusBadge status={lead.status} /></h3><button onClick={onClose}><X className="w-5 h-5 text-[#718096]" /></button></div>
        <div className="p-6 space-y-4">
          <div className="bg-[#F5F6FA] rounded-xl p-4">
            <Row k="Lead Name" v={lead.name} />
            <Row k="Phone" v={lead.phone} />
            <Row k="Email" v={lead.email} />
            <Row k="Selected Study Centre" v={lead.selectedCentreName || lead.centreName} />
            <Row k="Course Interest" v={lead.courseInterest} />
            <Row k="Message" v={lead.message} />
            <Row k="Source" v={(lead.source || "").replace(/_/g, " ")} />
            <Row k="Follow-up Date" v={lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : ""} />
            <Row k="Admin Remarks" v={lead.remarks} />
            <Row k="Created" v={lead.createdAt ? new Date(lead.createdAt).toLocaleString() : ""} />
            {isConverted && <Row k="Converted Student" v={`${lead.convertedStudentName || ""} (${lead.convertedStudentRoll || "—"})`} />}
            {isConverted && <Row k="Converted At" v={lead.convertedAt ? new Date(lead.convertedAt).toLocaleString() : ""} />}
          </div>
          {isConverted && (
            <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-lg px-3 py-2 text-[12px]"><CheckCircle className="w-4 h-4" />This lead is already converted to student.</div>
          )}
          <div className="flex flex-wrap gap-2">
            <button onClick={onEdit} className="btn-secondary flex-1 py-2.5 text-[13px] flex items-center justify-center gap-1.5"><Edit className="w-4 h-4" />Edit Lead</button>
            {isConverted ? (
              <button onClick={onViewStudent} className="btn-primary flex-1 py-2.5 text-[13px] flex items-center justify-center gap-1.5"><ExternalLink className="w-4 h-4" />View Student Profile</button>
            ) : (
              <button onClick={onConvert} className="btn-primary flex-1 py-2.5 text-[13px] flex items-center justify-center gap-1.5"><UserPlus className="w-4 h-4" />Convert to Student</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Lead: full Edit modal (all lead fields editable) ───
function LeadEditModal({ lead, users, centres, onClose, onSaved }: { lead: any; users: any[]; centres: any[]; onClose: () => void; onSaved: () => void }) {
  const { showToast } = useStore();
  const [form, setForm] = useState<any>({
    name: lead.name || "", phone: lead.phone || "", email: lead.email || "",
    courseInterest: lead.courseInterest || "", message: lead.message || "",
    source: lead.source || "contact_page", selectedCentreId: lead.selectedCentreId ? String(lead.selectedCentreId) : "",
    status: lead.status, remarks: lead.remarks || "", followUpDate: toDateInput(lead.followUpDate),
    assignedTo: lead.assignedTo ? String(lead.assignedTo) : "", assignedCentreId: lead.assignedCentreId ? String(lead.assignedCentreId) : "",
  });
  const update = trpc.enquiries.update.useMutation({ onSuccess: () => { showToast("Lead updated", "success"); onSaved(); onClose(); }, onError: (e) => showToast(e.message, "error") });
  const set = (k: string, v: any) => setForm({ ...form, [k]: v });
  const lbl = "text-[12px] text-[#718096] mb-1 block";
  const inp = "w-full h-9 px-2 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px]";
  const selectedCentre = centres.find((c: any) => String(c.id) === form.selectedCentreId);
  const save = () => update.mutate({
    id: lead.id, name: form.name, phone: form.phone, email: form.email || undefined,
    courseInterest: form.courseInterest || undefined, message: form.message || undefined,
    source: form.source, selectedCentreId: form.selectedCentreId ? Number(form.selectedCentreId) : null,
    centerPreference: selectedCentre ? selectedCentre.name : undefined,
    status: form.status, remarks: form.remarks, followUpDate: form.followUpDate || undefined,
    assignedTo: form.assignedTo ? Number(form.assignedTo) : null, assignedCentreId: form.assignedCentreId ? Number(form.assignedCentreId) : null,
  });
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[rgba(27,42,74,0.5)]" />
      <div className="relative bg-white rounded-2xl w-full max-w-[600px] max-h-[88vh] overflow-y-auto z-10" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-[#E8EDF5] px-6 py-4 flex items-center justify-between rounded-t-2xl"><h3 className="font-body text-[16px] font-semibold text-[#1B2A4A]">Edit Lead</h3><button onClick={onClose}><X className="w-5 h-5 text-[#718096]" /></button></div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className={lbl}>Lead / Student Name</label><input value={form.name} onChange={(e) => set("name", e.target.value)} className={inp} /></div>
            <div><label className={lbl}>Phone Number</label><input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inp} /></div>
            <div><label className={lbl}>Email</label><input value={form.email} onChange={(e) => set("email", e.target.value)} className={inp} /></div>
            <div><label className={lbl}>Course Interest</label><input value={form.courseInterest} onChange={(e) => set("courseInterest", e.target.value)} className={inp} /></div>
            <div><label className={lbl}>Selected Study Centre</label><select value={form.selectedCentreId} onChange={(e) => set("selectedCentreId", e.target.value)} className={inp}><option value="">Not selected</option>{centres.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className={lbl}>Source</label><select value={form.source} onChange={(e) => set("source", e.target.value)} className={inp}>{["contact_page", "website", "whatsapp", "popup", "referral", "social_media"].map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}</select></div>
            <div><label className={lbl}>Status</label><select value={form.status} onChange={(e) => set("status", e.target.value)} className={inp}>{LEAD_STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            <div><label className={lbl}>Follow-up Date</label><input type="date" value={form.followUpDate} onChange={(e) => set("followUpDate", e.target.value)} className={inp} /></div>
            <div><label className={lbl}>Assigned User</label><select value={form.assignedTo} onChange={(e) => set("assignedTo", e.target.value)} className={inp}><option value="">Unassigned</option>{users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}</select></div>
            <div><label className={lbl}>Assigned Centre (optional)</label><select value={form.assignedCentreId} onChange={(e) => set("assignedCentreId", e.target.value)} className={inp}><option value="">Not assigned</option>{centres.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          </div>
          <div><label className={lbl}>Message</label><textarea value={form.message} onChange={(e) => set("message", e.target.value)} className="w-full h-16 px-3 py-2 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] resize-none" /></div>
          <div><label className={lbl}>Admin Remarks</label><textarea value={form.remarks} onChange={(e) => set("remarks", e.target.value)} className="w-full h-16 px-3 py-2 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] resize-none" placeholder="Add remarks…" /></div>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1 py-2.5 text-[13px]">Cancel</button>
            <button onClick={save} disabled={update.isPending || !form.name} className="btn-primary flex-1 py-2.5 text-[13px] flex items-center justify-center gap-2">{update.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Lead: Convert to Student modal ───
function ConvertLeadModal({ lead, courses, centres, onClose, onConverted }: { lead: any; courses: any[]; centres: any[]; onClose: () => void; onConverted: (res: any) => void }) {
  const { showToast } = useStore();
  // Pre-fill course from the lead's free-text interest by fuzzy name match.
  const guessCourseId = () => {
    const ci = (lead.courseInterest || "").toLowerCase().trim();
    if (!ci) return "";
    const hit = courses.find((c: any) => c.name.toLowerCase().includes(ci) || ci.includes(c.name.toLowerCase()));
    return hit ? String(hit.id) : "";
  };
  const [form, setForm] = useState<any>({
    photo: "", name: lead.name || "", gender: "", aadharNumber: "", fatherName: "", motherName: "",
    dob: "", category: "", phone: lead.phone || "", email: lead.email || "", address: lead.message || "",
    courseId: guessCourseId(), centerId: lead.selectedCentreId ? String(lead.selectedCentreId) : "",
    feeStatus: "pending", paymentMode: "", paymentReceivedDate: "", paymentReference: "", paymentRemarks: "",
  });
  const [siblings, setSiblings] = useState<any[]>([]);
  const handle = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });
  const selectedCourse = courses.find((c: any) => String(c.id) === form.courseId);
  const selectedCentre = centres.find((c: any) => String(c.id) === form.centerId);
  const showPaymentDate = form.feeStatus === "paid" || form.feeStatus === "partial";

  const convert = trpc.enquiries.convertToStudent.useMutation({
    onSuccess: (res) => { showToast("Lead converted to student", "success"); onConverted(res); },
    onError: (e) => showToast(e.message, "error"),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (convert.isPending) return; // guard against double-click duplicate creation
    convert.mutate({
      id: lead.id, name: form.name, phone: form.phone || undefined, email: form.email || undefined,
      photo: form.photo || undefined, gender: form.gender || undefined, category: form.category || undefined,
      aadharNumber: form.aadharNumber || undefined, fatherName: form.fatherName || undefined, motherName: form.motherName || undefined,
      dob: form.dob || undefined, address: form.address || undefined,
      courseId: form.courseId ? Number(form.courseId) : undefined, centerId: form.centerId ? Number(form.centerId) : undefined,
      feeStatus: form.feeStatus || undefined, paymentMode: form.paymentMode || undefined,
      paymentReceivedDate: showPaymentDate && form.paymentReceivedDate ? form.paymentReceivedDate : undefined,
      paymentReference: form.paymentReference || undefined, paymentRemarks: form.paymentRemarks || undefined,
      siblings: siblings.filter((s) => s.name).map((s) => ({ name: s.name, relation: s.relation || undefined, age: s.age ? Number(s.age) : undefined, qualification: s.qualification || undefined })),
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[rgba(27,42,74,0.5)]" />
      <div className="relative bg-white rounded-2xl w-full max-w-[640px] max-h-[90vh] overflow-y-auto z-10" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-[#E8EDF5] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10"><h3 className="font-body text-[16px] font-semibold text-[#1B2A4A] flex items-center gap-2"><UserPlus className="w-4 h-4 text-[#F5B800]" />Convert Lead to Student</h3><button onClick={onClose}><X className="w-5 h-5 text-[#718096]" /></button></div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <p className="text-[12px] text-[#718096] bg-[#FFF9E6] rounded-lg px-3 py-2">Data pre-filled from the lead. Complete the required student details below, then confirm.</p>
          <ImageUpload value={form.photo} onChange={(v) => setForm({ ...form, photo: v })} label="Student Image (optional)" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Student Name" name="name" value={form.name} onChange={handle} required placeholder="Full name" />
            <FormSelect label="Gender" name="gender" value={form.gender} onChange={handle} options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }]} />
            <FormInput label="Aadhar Number" name="aadharNumber" value={form.aadharNumber} onChange={handle} placeholder="Optional · 12 digits" />
            <FormSelect label="Category" name="category" value={form.category} onChange={handle} options={[{ value: "general", label: "General" }, { value: "sc_st", label: "SC/ST" }, { value: "bc_obc", label: "BC/OBC" }]} />
            <FormInput label="Father Name" name="fatherName" value={form.fatherName} onChange={handle} placeholder="Father's name" />
            <FormInput label="Mother Name" name="motherName" value={form.motherName} onChange={handle} placeholder="Mother's name" />
            <FormInput label="Date of Birth" name="dob" value={form.dob} onChange={handle} type="date" />
            <FormInput label="Contact Number" name="phone" value={form.phone} onChange={handle} placeholder="+91 98765 43210" />
            <FormInput label="Mail ID" name="email" value={form.email} onChange={handle} type="email" placeholder="student@email.com" />
          </div>
          <div><label className="font-body text-[13px] font-medium text-[#1B2A4A] mb-1.5 block">Student Address</label><textarea name="address" value={form.address} onChange={handle} className="w-full h-16 px-3 py-2 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] resize-none" placeholder="Address" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormSelect label="Course Name" name="courseId" value={form.courseId} onChange={handle} options={courses.map((c: any) => ({ value: String(c.id), label: c.name }))} />
              {selectedCourse && <p className="text-[11px] text-[#718096] mt-1">Duration: {selectedCourse.duration || "—"}</p>}
            </div>
            <div>
              <FormSelect label="Centre Name" name="centerId" value={form.centerId} onChange={handle} options={centres.map((c: any) => ({ value: String(c.id), label: c.name }))} />
              {selectedCentre && <p className="text-[11px] text-[#718096] mt-1">City: {selectedCentre.city || "—"}</p>}
            </div>
            <FormSelect label="Payment Status" name="feeStatus" value={form.feeStatus} onChange={handle} options={[{ value: "paid", label: "Paid" }, { value: "pending", label: "Pending" }, { value: "partial", label: "Partial" }]} />
            <FormSelect label="Payment Mode" name="paymentMode" value={form.paymentMode} onChange={handle} options={[{ value: "online", label: "Online" }, { value: "offline_cash", label: "Offline Cash" }, { value: "offline_upi", label: "Offline UPI" }, { value: "offline_bank", label: "Offline Bank Transfer" }]} />
            {showPaymentDate && <FormInput label="Payment Received Date" name="paymentReceivedDate" value={form.paymentReceivedDate} onChange={handle} type="date" />}
            <FormInput label="Payment Reference" name="paymentReference" value={form.paymentReference} onChange={handle} placeholder="Txn / receipt no." />
          </div>
          <div><label className="font-body text-[13px] font-medium text-[#1B2A4A] mb-1.5 block">Payment Remarks</label><textarea name="paymentRemarks" value={form.paymentRemarks} onChange={handle} className="w-full h-12 px-3 py-2 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] resize-none" placeholder="Optional" /></div>

          {/* Siblings (optional) */}
          <div className="border-t border-[#E8EDF5] pt-3">
            <div className="flex items-center justify-between mb-2">
              <label className="font-body text-[13px] font-medium text-[#1B2A4A]">Sibling Details (optional)</label>
              <button type="button" onClick={() => setSiblings([...siblings, { name: "", relation: "", age: "", qualification: "" }])} className="text-[12px] text-[#F5B800] font-medium flex items-center gap-1"><Plus className="w-3.5 h-3.5" />Add Sibling</button>
            </div>
            {siblings.map((s, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-2">
                <input value={s.name} onChange={(e) => { const n = [...siblings]; n[i] = { ...s, name: e.target.value }; setSiblings(n); }} placeholder="Name" className="h-9 px-2 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px]" />
                <input value={s.relation} onChange={(e) => { const n = [...siblings]; n[i] = { ...s, relation: e.target.value }; setSiblings(n); }} placeholder="Relation" className="h-9 px-2 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px]" />
                <input value={s.age} onChange={(e) => { const n = [...siblings]; n[i] = { ...s, age: e.target.value }; setSiblings(n); }} placeholder="Age" className="h-9 px-2 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px]" />
                <div className="flex gap-1"><input value={s.qualification} onChange={(e) => { const n = [...siblings]; n[i] = { ...s, qualification: e.target.value }; setSiblings(n); }} placeholder="Qualification" className="h-9 px-2 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] flex-1" /><button type="button" onClick={() => setSiblings(siblings.filter((_, j) => j !== i))} className="w-9 h-9 rounded-lg hover:bg-red-50 flex items-center justify-center flex-shrink-0"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button></div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5 text-[13px]">Cancel</button>
            <button type="submit" disabled={convert.isPending || !form.name} className="btn-primary flex-1 py-2.5 text-[13px] flex items-center justify-center gap-2">{convert.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}Convert to Student</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EnquiriesModule() {
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [centreFilter, setCentreFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [convertedFilter, setConvertedFilter] = useState("");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [viewLead, setViewLead] = useState<any>(null);
  const [editLead, setEditLead] = useState<any>(null);
  const [convertLead, setConvertLead] = useState<any>(null);
  const [creds, setCreds] = useState<any>(null);
  const { showToast, setActiveModule, setStudentFocusSearch } = useStore();
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.enquiries.list.useQuery({
    status: statusFilter || undefined, source: sourceFilter || undefined,
    selectedCentreId: centreFilter ? Number(centreFilter) : undefined,
    courseInterest: courseFilter || undefined,
    converted: (convertedFilter as "yes" | "no") || undefined,
    search: search || undefined, from: from || undefined, to: to || undefined,
  });
  const { data: usersData } = trpc.enquiries.assignableUsers.useQuery();
  const { data: centresData } = trpc.centers.list.useQuery();
  const { data: coursesData } = trpc.courses.list.useQuery();
  const deleteMutation = trpc.enquiries.delete.useMutation({ onSuccess: () => { utils.enquiries.list.invalidate(); utils.dashboard.stats.invalidate(); showToast("Lead deleted", "success"); }, onError: (e) => showToast(e.message, "error") });

  const centres = centresData?.list || [];
  const courses = coursesData || [];
  const refresh = () => { utils.enquiries.list.invalidate(); utils.dashboard.stats.invalidate(); };
  const goToStudent = (roll: string) => { setStudentFocusSearch(roll || ""); setActiveModule("students"); };
  const exportCsv = () => downloadCSV("leads.csv", (data?.list || []).map((l: any) => ({ id: l.id, name: l.name, phone: l.phone, email: l.email, centre: l.selectedCentreName || l.centreName, course: l.courseInterest, source: l.source, status: l.status, converted: l.convertedStudentId ? "yes" : "no", studentRoll: l.convertedStudentRoll || "", followUp: l.followUpDate ? new Date(l.followUpDate).toLocaleDateString() : "", remarks: l.remarks, date: l.createdAt ? new Date(l.createdAt).toLocaleString() : "" })));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="font-display text-[24px] font-semibold text-[#1B2A4A]">Lead Management</h2>
        <button onClick={exportCsv} className="flex items-center gap-1.5 text-[13px] text-[#1B2A4A] font-medium px-3 py-2 border border-[#E8EDF5] rounded-lg hover:bg-[#F5F6FA]"><Download className="w-4 h-4" />Export CSV</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-[#E8EDF5]">
          <Search className="w-4 h-4 text-[#718096] mr-2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, phone, email…" className="bg-transparent text-[13px] outline-none w-44" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 bg-white border border-[#E8EDF5] rounded-lg text-[13px] outline-none"><option value="">All Status</option>{LEAD_STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
        <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="h-9 px-3 bg-white border border-[#E8EDF5] rounded-lg text-[13px] outline-none"><option value="">All Courses</option>{courses.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}</select>
        <select value={centreFilter} onChange={(e) => setCentreFilter(e.target.value)} className="h-9 px-3 bg-white border border-[#E8EDF5] rounded-lg text-[13px] outline-none"><option value="">All Centres</option>{centres.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="h-9 px-3 bg-white border border-[#E8EDF5] rounded-lg text-[13px] outline-none"><option value="">All Sources</option>{["contact_page", "website", "whatsapp", "popup", "referral", "social_media"].map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}</select>
        <select value={convertedFilter} onChange={(e) => setConvertedFilter(e.target.value)} className="h-9 px-3 bg-white border border-[#E8EDF5] rounded-lg text-[13px] outline-none"><option value="">All Leads</option><option value="yes">Converted</option><option value="no">Not Converted</option></select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 px-2 bg-white border border-[#E8EDF5] rounded-lg text-[12px] outline-none" title="From date" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 px-2 bg-white border border-[#E8EDF5] rounded-lg text-[12px] outline-none" title="To date" />
      </div>

      <div className="bg-white rounded-xl border border-[#E8EDF5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F5F6FA]">
              <tr className="text-left text-[11px] text-[#718096] uppercase tracking-wider">
                <th className="p-4 font-medium">Name</th><th className="p-4 font-medium">Phone</th><th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Course</th><th className="p-4 font-medium">Centre</th><th className="p-4 font-medium">Source</th>
                <th className="p-4 font-medium">Status</th><th className="p-4 font-medium">Follow-up</th><th className="p-4 font-medium">Created</th><th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EDF5]">
              {isLoading ? <tr><td colSpan={10} className="p-8 text-center"><Loader2 className="w-6 h-6 text-[#F5B800] animate-spin mx-auto" /></td></tr> :
                (data?.list || []).length === 0 ? <tr><td colSpan={10} className="p-8 text-center text-[#718096]">No leads found</td></tr> :
                  (data?.list || []).map((e: any) => {
                    const converted = !!e.convertedStudentId;
                    return (
                    <tr key={e.id} className="hover:bg-[#F5F6FA]">
                      <td className="p-4 text-[13px] font-medium text-[#1B2A4A]">{e.name}</td>
                      <td className="p-4 text-[13px] text-[#4A5568]">{e.phone}</td>
                      <td className="p-4 text-[13px] text-[#4A5568]">{e.email || "—"}</td>
                      <td className="p-4 text-[13px] text-[#4A5568]">{e.courseInterest || "—"}</td>
                      <td className="p-4 text-[13px] text-[#4A5568]">{e.selectedCentreName || e.centreName || "—"}</td>
                      <td className="p-4 text-[12px] text-[#718096] capitalize">{(e.source || "").replace(/_/g, " ")}</td>
                      <td className="p-4"><StatusBadge status={e.status} /></td>
                      <td className="p-4 text-[12px] text-[#718096]">{e.followUpDate ? new Date(e.followUpDate).toLocaleDateString() : "—"}</td>
                      <td className="p-4 text-[12px] text-[#718096]">{e.createdAt ? new Date(e.createdAt).toLocaleDateString() : ""}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setViewLead(e)} className="w-7 h-7 rounded-lg hover:bg-[#E8EDF5] flex items-center justify-center" title="View"><Eye className="w-3.5 h-3.5 text-[#718096]" /></button>
                          <button onClick={() => setEditLead(e)} className="w-7 h-7 rounded-lg hover:bg-[#E8EDF5] flex items-center justify-center" title="Edit"><Edit className="w-3.5 h-3.5 text-[#718096]" /></button>
                          {converted ? (
                            <button onClick={() => goToStudent(e.convertedStudentRoll)} className="w-7 h-7 rounded-lg hover:bg-green-50 flex items-center justify-center" title="View Student Profile"><ExternalLink className="w-3.5 h-3.5 text-green-600" /></button>
                          ) : (
                            <button onClick={() => setConvertLead(e)} className="w-7 h-7 rounded-lg hover:bg-[#FFF9E6] flex items-center justify-center" title="Convert to Student"><UserPlus className="w-3.5 h-3.5 text-[#B8860B]" /></button>
                          )}
                          <button onClick={() => { if (confirm("Are you sure you want to delete this lead?")) deleteMutation.mutate({ id: e.id }); }} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center" title="Delete"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                        </div>
                      </td>
                    </tr>
                  );})}
            </tbody>
          </table>
        </div>
      </div>

      {viewLead && <LeadViewModal lead={viewLead} onClose={() => setViewLead(null)} onEdit={() => { setEditLead(viewLead); setViewLead(null); }} onConvert={() => { setConvertLead(viewLead); setViewLead(null); }} onViewStudent={() => { goToStudent(viewLead.convertedStudentRoll); setViewLead(null); }} />}
      {editLead && <LeadEditModal lead={editLead} users={usersData || []} centres={centres} onClose={() => setEditLead(null)} onSaved={refresh} />}
      {convertLead && <ConvertLeadModal lead={convertLead} courses={courses} centres={centres} onClose={() => setConvertLead(null)} onConverted={(res) => { setConvertLead(null); refresh(); utils.students.list.invalidate(); if (res?.rollNumber) setCreds(res); }} />}
      {creds && <CredentialsModal creds={creds} onClose={() => setCreds(null)} />}
    </div>
  );
}

// ═══════════════════════════════════════════════
// FEES MODULE
// ═══════════════════════════════════════════════
function FeesModule() {
  const { data: dueFees, isLoading } = trpc.fees.dueFees.useQuery();
  return (
    <div className="space-y-4">
      <h2 className="font-display text-[24px] font-semibold text-[#1B2A4A]">Fee Management</h2>
      <div className="bg-white rounded-xl border border-[#E8EDF5] p-6">
        <h3 className="font-body text-[15px] font-semibold text-[#1B2A4A] mb-4">Pending Fee Students</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F5F6FA]">
              <tr className="text-left text-[11px] text-[#718096] uppercase tracking-wider">
                <th className="p-3 font-medium">Roll No</th><th className="p-3 font-medium">Name</th><th className="p-3 font-medium">Fee Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EDF5]">
              {isLoading ? <tr><td colSpan={3} className="p-8 text-center"><Loader2 className="w-6 h-6 text-[#F5B800] animate-spin mx-auto" /></td></tr> :
                (dueFees || []).length === 0 ? <tr><td colSpan={3} className="p-8 text-center text-[#718096]">No pending fees</td></tr> :
                  (dueFees || []).map((s: any) => (
                    <tr key={s.id} className="hover:bg-[#F5F6FA]">
                      <td className="p-3 text-[12px] font-mono text-[#718096]">{s.rollNumber}</td>
                      <td className="p-3 text-[13px] font-medium text-[#1B2A4A]">{s.name}</td>
                      <td className="p-3"><StatusBadge status={s.feeStatus} /></td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// EXAMS MODULE
// ═══════════════════════════════════════════════
function ExamsModule() {
  const { data: examsData, isLoading } = trpc.exams.list.useQuery();
  const { data: coursesData } = trpc.courses.list.useQuery();
  return (
    <div className="space-y-4">
      <h2 className="font-display text-[24px] font-semibold text-[#1B2A4A]">AI Exam Builder</h2>
      <div className="space-y-3">
        {isLoading ? <div className="text-center py-8"><Loader2 className="w-6 h-6 text-[#F5B800] animate-spin mx-auto" /></div> :
          (examsData || []).length === 0 ? <div className="text-center py-8 text-[#718096]">No exams found</div> :
            (examsData || []).map((exam: any) => (
              <div key={exam.id} className="bg-white rounded-xl border border-[#E8EDF5] p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-body text-[15px] font-semibold text-[#1B2A4A]">{exam.name}</h3>
                  <p className="text-[12px] text-[#718096]">{(coursesData || []).find((c: any) => c.id === exam.courseId)?.name || ""} &middot; {exam.maxMarks} marks &middot; {exam.duration} min{exam.examDate ? ` · ${new Date(exam.examDate).toLocaleDateString()}` : ""}</p>
                </div>
                <StatusBadge status={exam.status} />
              </div>
            ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// CERTIFICATES MODULE
// ═══════════════════════════════════════════════
function MarksheetGenModal({ students, onClose, onDone }: { students: any[]; onClose: () => void; onDone: () => void }) {
  const { showToast } = useStore();
  const [studentId, setStudentId] = useState('');
  const [subjects, setSubjects] = useState<any[]>([{ subjectName: '', maxMarks: 100, obtainedMarks: 0 }]);
  const gen = trpc.marksheets.generate.useMutation({ onSuccess: (r) => { showToast(`Marksheet ${r.marksheetNumber} · ${r.percentage}% (${r.resultStatus})`, "success"); onDone(); onClose(); }, onError: (e) => showToast(e.message, "error") });
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[rgba(27,42,74,0.5)]" />
      <div className="relative bg-white rounded-2xl w-full max-w-[560px] max-h-[88vh] overflow-y-auto z-10 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4"><h3 className="font-display text-[18px] font-semibold text-[#1B2A4A]">Generate Marksheet</h3><button onClick={onClose}><X className="w-5 h-5 text-[#718096]" /></button></div>
        <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full h-10 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] mb-3"><option value="">Select student *</option>{students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>)}</select>
        <p className="text-[12px] font-semibold text-[#1B2A4A] mb-2">Subjects / Modules</p>
        <div className="space-y-2">
          {subjects.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_70px_70px_28px] gap-2 items-center">
              <input placeholder="Subject" value={s.subjectName} onChange={(e) => { const a = [...subjects]; a[i].subjectName = e.target.value; setSubjects(a); }} className="h-9 px-2 bg-[#F5F6FA] border border-[#E8EDF5] rounded text-[13px]" />
              <input type="number" placeholder="Max" value={s.maxMarks} onChange={(e) => { const a = [...subjects]; a[i].maxMarks = Number(e.target.value); setSubjects(a); }} className="h-9 px-2 bg-[#F5F6FA] border border-[#E8EDF5] rounded text-[13px]" />
              <input type="number" placeholder="Got" value={s.obtainedMarks} onChange={(e) => { const a = [...subjects]; a[i].obtainedMarks = Number(e.target.value); setSubjects(a); }} className="h-9 px-2 bg-[#F5F6FA] border border-[#E8EDF5] rounded text-[13px]" />
              {subjects.length > 1 && <button onClick={() => setSubjects(subjects.filter((_, j) => j !== i))} className="text-red-400"><Trash2 className="w-4 h-4" /></button>}
            </div>
          ))}
        </div>
        <button onClick={() => setSubjects([...subjects, { subjectName: '', maxMarks: 100, obtainedMarks: 0 }])} className="flex items-center gap-1.5 text-[12px] text-[#0071E3] font-medium mt-2"><Plus className="w-4 h-4" />Add Subject</button>
        <button onClick={() => { if (!studentId) return showToast('Select a student', 'error'); gen.mutate({ studentId: Number(studentId), subjects: subjects.filter((s) => s.subjectName) }); }} disabled={gen.isPending} className="btn-primary w-full mt-4 py-2.5 flex items-center justify-center gap-2">{gen.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Generate Marksheet</button>
      </div>
    </div>
  );
}

function CertificatesModule() {
  const [tab, setTab] = useState("certificates");
  const [genCert, setGenCert] = useState('');
  const [showMs, setShowMs] = useState(false);
  const { showToast } = useStore();
  const utils = trpc.useUtils();
  const { data: certsData } = trpc.certificates.list.useQuery();
  const { data: msData } = trpc.marksheets.list.useQuery();
  const { data: studentsData } = trpc.students.list.useQuery({ limit: 200 });
  const students = studentsData?.list || [];
  const issue = trpc.certificates.issue.useMutation({ onSuccess: (r) => { showToast(`Certificate issued · ${r.serialNumber} (${r.certificateType.replace('_', ' ')})`, "success"); setGenCert(''); utils.certificates.list.invalidate(); }, onError: (e) => showToast(e.message, "error") });
  const revokeCert = trpc.certificates.revoke.useMutation({ onSuccess: () => { utils.certificates.list.invalidate(); showToast("Certificate revoked", "success"); } });
  const revokeMs = trpc.marksheets.revoke.useMutation({ onSuccess: () => { utils.marksheets.list.invalidate(); showToast("Marksheet revoked", "success"); } });
  const open = (path: string) => window.open(path, '_blank');

  return (
    <div className="space-y-4">
      <h2 className="font-display text-[24px] font-semibold text-[#1B2A4A]">Certificates & Marksheets</h2>
      <div className="flex flex-wrap gap-2 border-b border-[#E8EDF5]">
        {["certificates", "marksheets"].map((t) => <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-[13px] font-medium border-b-2 capitalize ${tab === t ? "border-[#F5B800] text-[#1B2A4A]" : "border-transparent text-[#718096]"}`}>{t}</button>)}
      </div>

      {tab === "certificates" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <select value={genCert} onChange={(e) => setGenCert(e.target.value)} className="h-9 px-3 bg-white border border-[#E8EDF5] rounded-lg text-[13px] outline-none min-w-[220px]"><option value="">Select student to issue…</option>{students.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>)}</select>
            <button onClick={() => genCert && issue.mutate({ studentId: Number(genCert) })} disabled={!genCert || issue.isPending} className="bg-[#F5B800] text-[#1B2A4A] px-4 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 disabled:opacity-50">{issue.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}Generate Certificate</button>
            <span className="text-[11px] text-[#718096]">Type auto-selected from course duration.</span>
          </div>
          <div className="bg-white rounded-xl border border-[#E8EDF5] overflow-x-auto">
            <table className="w-full"><thead className="bg-[#F5F6FA]"><tr className="text-left text-[11px] text-[#718096] uppercase tracking-wider"><th className="p-4 font-medium">Serial</th><th className="p-4 font-medium">Student</th><th className="p-4 font-medium">Course</th><th className="p-4 font-medium">Type</th><th className="p-4 font-medium">Status</th><th className="p-4 font-medium">Actions</th></tr></thead>
              <tbody className="divide-y divide-[#E8EDF5]">
                {(certsData?.list || []).length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-[#718096]">No certificates issued yet</td></tr> :
                  (certsData?.list || []).map((c: any) => (
                    <tr key={c.id} className="hover:bg-[#F5F6FA]">
                      <td className="p-4 text-[12px] font-mono text-[#F5B800] font-medium">{c.serialNumber}</td>
                      <td className="p-4 text-[13px] font-medium text-[#1B2A4A]">{c.studentName}</td>
                      <td className="p-4 text-[13px] text-[#4A5568]">{c.courseName}</td>
                      <td className="p-4 text-[12px] capitalize">{(c.certificateType || '').replace('_', ' ')}</td>
                      <td className="p-4"><StatusBadge status={c.status} /></td>
                      <td className="p-4"><div className="flex items-center gap-1">
                        <button onClick={() => open(`/certificate/${c.id}`)} className="text-[11px] text-[#0071E3] font-medium px-2 py-1 rounded bg-blue-50">View / Print</button>
                        <button onClick={() => open(`/verify/${c.serialNumber}`)} className="text-[11px] text-[#1B2A4A] font-medium px-2 py-1 rounded bg-[#F5F6FA]">Verify</button>
                        {c.status === 'issued' && <button onClick={() => { if (confirm('Revoke?')) revokeCert.mutate({ id: c.id }); }} className="text-[11px] text-red-600 font-medium px-2 py-1 rounded bg-red-50">Revoke</button>}
                      </div></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "marksheets" && (
        <div className="space-y-3">
          <button onClick={() => setShowMs(true)} className="bg-[#F5B800] text-[#1B2A4A] px-4 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-1.5"><Plus className="w-4 h-4" />Generate Marksheet</button>
          <div className="bg-white rounded-xl border border-[#E8EDF5] overflow-x-auto">
            <table className="w-full"><thead className="bg-[#F5F6FA]"><tr className="text-left text-[11px] text-[#718096] uppercase tracking-wider"><th className="p-4 font-medium">Number</th><th className="p-4 font-medium">Student</th><th className="p-4 font-medium">%</th><th className="p-4 font-medium">Grade</th><th className="p-4 font-medium">Result</th><th className="p-4 font-medium">Actions</th></tr></thead>
              <tbody className="divide-y divide-[#E8EDF5]">
                {(msData || []).length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-[#718096]">No marksheets generated yet</td></tr> :
                  (msData || []).map((m: any) => (
                    <tr key={m.id} className="hover:bg-[#F5F6FA]">
                      <td className="p-4 text-[12px] font-mono text-[#F5B800] font-medium">{m.marksheetNumber}</td>
                      <td className="p-4 text-[13px] font-medium text-[#1B2A4A]">{m.studentName}<div className="text-[11px] font-mono text-[#718096]">{m.rollNumber}</div></td>
                      <td className="p-4 text-[13px]">{Number(m.percentage)}%</td>
                      <td className="p-4 text-[13px] font-medium">{m.grade}</td>
                      <td className="p-4"><span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${m.resultStatus === 'pass' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{m.resultStatus}</span></td>
                      <td className="p-4"><div className="flex items-center gap-1">
                        <button onClick={() => open(`/marksheet/${m.id}`)} className="text-[11px] text-[#0071E3] font-medium px-2 py-1 rounded bg-blue-50">View / Print</button>
                        <button onClick={() => open(`/verify/${m.marksheetNumber}`)} className="text-[11px] text-[#1B2A4A] font-medium px-2 py-1 rounded bg-[#F5F6FA]">Verify</button>
                        {m.status === 'issued' && <button onClick={() => { if (confirm('Revoke?')) revokeMs.mutate({ id: m.id }); }} className="text-[11px] text-red-600 font-medium px-2 py-1 rounded bg-red-50">Revoke</button>}
                      </div></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showMs && <MarksheetGenModal students={students} onClose={() => setShowMs(false)} onDone={() => utils.marksheets.list.invalidate()} />}
    </div>
  );
}

// ═══════════════════════════════════════════════
// SETTINGS MODULE
// ═══════════════════════════════════════════════
function SettingsModule() {
  const { data: settingsData, isLoading } = trpc.settings.list.useQuery();
  const utils = trpc.useUtils();
  const { showToast } = useStore();
  const setMutation = trpc.settings.set.useMutation({ onSuccess: () => { utils.settings.list.invalidate(); showToast("Setting saved", "success"); } });

  const grouped = (settingsData || []).reduce((acc: any, s: any) => {
    (acc[s.group] = acc[s.group] || []).push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h2 className="font-display text-[24px] font-semibold text-[#1B2A4A]">Settings</h2>
      {isLoading ? <div className="text-center py-8"><Loader2 className="w-6 h-6 text-[#F5B800] animate-spin mx-auto" /></div> :
        Object.entries(grouped).map(([group, items]: [string, any]) => (
          <div key={group} className="bg-white rounded-xl border border-[#E8EDF5] p-6">
            <h3 className="font-body text-[14px] font-semibold text-[#1B2A4A] uppercase tracking-wider mb-4">{group}</h3>
            <div className="space-y-3">
              {items.map((s: any) => (
                <div key={s.id} className="flex items-center gap-4">
                  <span className="text-[13px] text-[#718096] w-40 flex-shrink-0 capitalize">{s.key.replace(/_/g, " ")}</span>
                  <input type="text" defaultValue={s.value || ""} onBlur={(e) => setMutation.mutate({ key: s.key, value: e.target.value, group: s.group })}
                    className="flex-1 h-9 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] text-[#1B2A4A] outline-none focus:border-[#F5B800]" />
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

// ═══════════════════════════════════════════════
// REFERRALS & WALLET MANAGEMENT MODULE
// ═══════════════════════════════════════════════
function downloadCSV(filename: string, rows: any[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = filename; a.click();
  URL.revokeObjectURL(a.href);
}

function ReferralsModule() {
  const [tab, setTab] = useState("transactions");
  const [txStatus, setTxStatus] = useState("");
  const [txCentre, setTxCentre] = useState("");
  const [poStatus, setPoStatus] = useState("");
  const [poCentre, setPoCentre] = useState("");
  const { user } = useAuth();
  const { showToast } = useStore();
  const utils = trpc.useUtils();
  const isSuperAdmin = user?.role === "super_admin";

  const { data: ov } = trpc.referrals.adminOverview.useQuery();
  const { data: txns } = trpc.referrals.adminTransactions.useQuery({ status: txStatus || undefined, centreId: txCentre ? Number(txCentre) : undefined });
  const { data: wallets } = trpc.referrals.adminWallets.useQuery();
  const { data: pays } = trpc.referrals.adminPayouts.useQuery({ status: poStatus || undefined, centreId: poCentre ? Number(poCentre) : undefined });
  const { data: stmts } = trpc.referrals.adminStatements.useQuery({});
  const { data: settings } = trpc.referrals.settingsGet.useQuery();
  const { data: centresData } = trpc.centers.list.useQuery();
  const [cfg, setCfg] = useState<any>(null);

  const saveSettings = trpc.referrals.settingsSet.useMutation({ onSuccess: () => { utils.referrals.settingsGet.invalidate(); showToast("Settings saved", "success"); }, onError: (e) => showToast(e.message, "error") });

  const C = cfg || settings;
  const centreOpts = (centresData?.list || []);
  const subTabs = ["transactions", "wallets", "payouts", "statements", "settings"];
  const badge = (s: string) => <StatusBadge status={s} />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-display text-[24px] font-semibold text-[#1B2A4A]">Referral Reports</h2>
        <span className="text-[12px] text-[#718096] bg-[#F5F6FA] border border-[#E8EDF5] rounded-full px-3 py-1">View only · payouts are paid by each Study Centre</span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <StatCard label="Referrals" value={ov?.totalReferrals ?? 0} icon={Users} color="text-[#0071E3]" bg="bg-[#F0F5FF]" />
        <StatCard label="Total Commission" value={`₹${ov?.totalCommission ?? 0}`} icon={Award} color="text-purple-600" bg="bg-purple-50" />
        <StatCard label="Pending" value={`₹${ov?.pendingCommission ?? 0}`} icon={Bell} color="text-[#F5B800]" bg="bg-[#FFF9E6]" />
        <StatCard label="Approved" value={`₹${ov?.approvedCommission ?? 0}`} icon={CheckCircle} color="text-[#22C55E]" bg="bg-[#F0FFF4]" />
        <StatCard label="Wallet Total" value={`₹${ov?.totalWalletBalance ?? 0}`} icon={Wallet} color="text-[#1B2A4A]" bg="bg-[#F5F6FA]" />
        <StatCard label="Pending Payouts" value={ov?.pendingPayouts ?? 0} icon={Send} color="text-orange-500" bg="bg-orange-50" />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[#E8EDF5]">
        {subTabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-[13px] font-medium border-b-2 capitalize ${tab === t ? "border-[#F5B800] text-[#1B2A4A]" : "border-transparent text-[#718096]"}`}>{t}</button>
        ))}
      </div>

      {/* TRANSACTIONS (view only) */}
      {tab === "transactions" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <select value={txStatus} onChange={(e) => setTxStatus(e.target.value)} className="h-9 px-3 bg-white border border-[#E8EDF5] rounded-lg text-[13px] outline-none">
              <option value="">All Status</option>{["pending", "approved", "paid", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={txCentre} onChange={(e) => setTxCentre(e.target.value)} className="h-9 px-3 bg-white border border-[#E8EDF5] rounded-lg text-[13px] outline-none">
              <option value="">All Centres</option>{centreOpts.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={() => downloadCSV("referral-commissions.csv", (txns || []).map((t: any) => ({ id: t.id, referrer: t.referrerName, referrerCode: t.referrerCode, responsibleCentre: t.responsibleCentreName, courseId: t.courseId, amount: t.courseAmount, discount: t.discountAmount, commission: t.commissionAmount, status: t.status, ref: t.paymentRef, date: t.date })))} className="ml-auto flex items-center gap-1.5 text-[13px] text-[#1B2A4A] font-medium px-3 py-2 border border-[#E8EDF5] rounded-lg hover:bg-[#F5F6FA]"><Download className="w-4 h-4" />Export CSV</button>
          </div>
          <div className="bg-white rounded-xl border border-[#E8EDF5] overflow-x-auto">
            <table className="w-full"><thead className="bg-[#F5F6FA]"><tr className="text-left text-[11px] text-[#718096] uppercase"><th className="p-3 font-medium">Referrer</th><th className="p-3 font-medium">Responsible Centre</th><th className="p-3 font-medium">Course Amt</th><th className="p-3 font-medium">Discount</th><th className="p-3 font-medium">Commission</th><th className="p-3 font-medium">Status</th></tr></thead>
              <tbody className="divide-y divide-[#E8EDF5]">
                {(txns || []).length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-[#718096]">No commission records</td></tr> :
                  (txns || []).map((t: any) => (
                    <tr key={t.id} className="hover:bg-[#F5F6FA]">
                      <td className="p-3 text-[13px] font-medium text-[#1B2A4A]">{t.referrerName}<div className="text-[11px] font-mono text-[#718096]">{t.referrerCode}</div></td>
                      <td className="p-3 text-[13px] text-[#4A5568]">{t.responsibleCentreName || "—"}<div className="text-[11px] font-mono text-[#718096]">{t.responsibleCentreCode || ""}</div></td>
                      <td className="p-3 text-[13px]">₹{Number(t.courseAmount).toLocaleString("en-IN")}</td>
                      <td className="p-3 text-[13px] text-[#22C55E]">₹{Number(t.discountAmount).toLocaleString("en-IN")}</td>
                      <td className="p-3 text-[13px] font-semibold">₹{Number(t.commissionAmount).toLocaleString("en-IN")}</td>
                      <td className="p-3">{badge(t.status)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WALLETS */}
      {tab === "wallets" && (
        <div className="bg-white rounded-xl border border-[#E8EDF5] overflow-x-auto">
          <table className="w-full"><thead className="bg-[#F5F6FA]"><tr className="text-left text-[11px] text-[#718096] uppercase"><th className="p-3 font-medium">Student</th><th className="p-3 font-medium">Centre</th><th className="p-3 font-medium">Balance</th><th className="p-3 font-medium">Earned</th><th className="p-3 font-medium">Withdrawn</th><th className="p-3 font-medium">Pending</th><th className="p-3 font-medium">Outstanding</th></tr></thead>
            <tbody className="divide-y divide-[#E8EDF5]">
              {(wallets || []).length === 0 ? <tr><td colSpan={7} className="p-8 text-center text-[#718096]">No wallets yet</td></tr> :
                (wallets || []).map((w: any) => (
                  <tr key={w.studentId} className="hover:bg-[#F5F6FA]">
                    <td className="p-3 text-[13px] font-medium text-[#1B2A4A]">{w.studentName}<div className="text-[11px] font-mono text-[#718096]">{w.rollNumber}</div></td>
                    <td className="p-3 text-[13px] text-[#4A5568]">{w.centreName || "—"}</td>
                    <td className="p-3 text-[13px] font-semibold">₹{Number(w.walletBalance).toLocaleString("en-IN")}</td>
                    <td className="p-3 text-[13px]">₹{Number(w.totalEarned).toLocaleString("en-IN")}</td>
                    <td className="p-3 text-[13px]">₹{Number(w.totalWithdrawn).toLocaleString("en-IN")}</td>
                    <td className="p-3 text-[13px] text-[#F5B800]">₹{Number(w.pendingAmount).toLocaleString("en-IN")}</td>
                    <td className="p-3 text-[13px]">₹{Number(w.outstandingAmount).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PAYOUTS (view only — paid by centre) */}
      {tab === "payouts" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <select value={poStatus} onChange={(e) => setPoStatus(e.target.value)} className="h-9 px-3 bg-white border border-[#E8EDF5] rounded-lg text-[13px] outline-none">
              <option value="">All Status</option>{["requested", "processing", "paid", "rejected"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={poCentre} onChange={(e) => setPoCentre(e.target.value)} className="h-9 px-3 bg-white border border-[#E8EDF5] rounded-lg text-[13px] outline-none">
              <option value="">All Centres</option>{centreOpts.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={() => downloadCSV("payouts.csv", (pays || []).map((p: any) => ({ id: p.id, student: p.studentName, centre: p.centreName, amount: p.amount, mode: p.paymentMode, upi: p.upiId, account: p.accountNumber, ifsc: p.ifscCode, status: p.status, ref: p.paymentReference, remarks: p.centreRemarks, date: p.date })))} className="ml-auto flex items-center gap-1.5 text-[13px] text-[#1B2A4A] font-medium px-3 py-2 border border-[#E8EDF5] rounded-lg hover:bg-[#F5F6FA]"><Download className="w-4 h-4" />Export CSV</button>
          </div>
          <div className="bg-white rounded-xl border border-[#E8EDF5] overflow-x-auto">
            <table className="w-full"><thead className="bg-[#F5F6FA]"><tr className="text-left text-[11px] text-[#718096] uppercase"><th className="p-3 font-medium">Student</th><th className="p-3 font-medium">Responsible Centre</th><th className="p-3 font-medium">Amount</th><th className="p-3 font-medium">Mode</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Reference</th></tr></thead>
              <tbody className="divide-y divide-[#E8EDF5]">
                {(pays || []).length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-[#718096]">No payout requests</td></tr> :
                  (pays || []).map((p: any) => (
                    <tr key={p.id} className="hover:bg-[#F5F6FA]">
                      <td className="p-3 text-[13px] font-medium text-[#1B2A4A]">{p.studentName}<div className="text-[11px] font-mono text-[#718096]">{p.rollNumber}</div></td>
                      <td className="p-3 text-[13px] text-[#4A5568]">{p.centreName || "—"}</td>
                      <td className="p-3 text-[13px] font-semibold">₹{Number(p.amount).toLocaleString("en-IN")}</td>
                      <td className="p-3 text-[13px] uppercase">{p.paymentMode}</td>
                      <td className="p-3">{badge(p.status)}</td>
                      <td className="p-3 text-[12px] text-[#718096]">{p.paymentReference || "—"}{p.centreRemarks ? ` · ${p.centreRemarks}` : ""}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STATEMENTS */}
      {tab === "statements" && (
        <div className="space-y-3">
          <button onClick={() => downloadCSV("wallet-statements.csv", (stmts || []).map((s: any) => ({ id: s.id, student: s.studentName, type: s.transactionType, ref: s.referenceId, credit: s.creditAmount, debit: s.debitAmount, balance: s.balanceAfter, mode: s.paymentMode, remarks: s.remarks, date: s.date })))} className="flex items-center gap-1.5 text-[13px] text-[#1B2A4A] font-medium px-3 py-2 border border-[#E8EDF5] rounded-lg hover:bg-[#F5F6FA]"><Download className="w-4 h-4" />Export CSV</button>
          <div className="bg-white rounded-xl border border-[#E8EDF5] overflow-x-auto">
            <table className="w-full"><thead className="bg-[#F5F6FA]"><tr className="text-left text-[11px] text-[#718096] uppercase"><th className="p-3 font-medium">Date</th><th className="p-3 font-medium">Student</th><th className="p-3 font-medium">Type</th><th className="p-3 font-medium">Credit</th><th className="p-3 font-medium">Debit</th><th className="p-3 font-medium">Balance</th><th className="p-3 font-medium">Remarks</th></tr></thead>
              <tbody className="divide-y divide-[#E8EDF5]">
                {(stmts || []).length === 0 ? <tr><td colSpan={7} className="p-8 text-center text-[#718096]">No statement records</td></tr> :
                  (stmts || []).map((s: any) => (
                    <tr key={s.id} className="hover:bg-[#F5F6FA]">
                      <td className="p-3 text-[12px] text-[#718096]">{new Date(s.date).toLocaleDateString()}</td>
                      <td className="p-3 text-[13px] text-[#1B2A4A]">{s.studentName}</td>
                      <td className="p-3 text-[12px] capitalize">{s.transactionType.replace(/_/g, " ")}</td>
                      <td className="p-3 text-[13px] text-[#22C55E]">{Number(s.creditAmount) > 0 ? `+₹${Number(s.creditAmount).toLocaleString("en-IN")}` : "-"}</td>
                      <td className="p-3 text-[13px] text-[#EF4444]">{Number(s.debitAmount) > 0 ? `-₹${Number(s.debitAmount).toLocaleString("en-IN")}` : "-"}</td>
                      <td className="p-3 text-[13px] font-medium">₹{Number(s.balanceAfter).toLocaleString("en-IN")}</td>
                      <td className="p-3 text-[12px] text-[#718096]">{s.remarks}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SETTINGS */}
      {tab === "settings" && C && (
        <div className="bg-white rounded-xl border border-[#E8EDF5] p-6 max-w-[640px] space-y-4">
          {!isSuperAdmin && <p className="text-[12px] text-orange-600">Only Super Admin can change these settings.</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-[13px] text-[#1B2A4A]"><input type="checkbox" checked={C.enabled} disabled={!isSuperAdmin} onChange={(e) => setCfg({ ...C, enabled: e.target.checked })} />Program enabled</label>
            <div><label className="text-[12px] text-[#718096]">Approval type</label><select value={C.approvalType} disabled={!isSuperAdmin} onChange={(e) => setCfg({ ...C, approvalType: e.target.value })} className="w-full h-9 px-2 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px]"><option value="manual">Manual approve</option><option value="auto">Auto approve</option></select></div>
            <div><label className="text-[12px] text-[#718096]">Discount %</label><input type="number" value={C.discountPercent} disabled={!isSuperAdmin} onChange={(e) => setCfg({ ...C, discountPercent: Number(e.target.value) })} className="w-full h-9 px-2 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px]" /></div>
            <div><label className="text-[12px] text-[#718096]">Commission %</label><input type="number" value={C.commissionPercent} disabled={!isSuperAdmin} onChange={(e) => setCfg({ ...C, commissionPercent: Number(e.target.value) })} className="w-full h-9 px-2 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px]" /></div>
            <div><label className="text-[12px] text-[#718096]">Min payout (₹)</label><input type="number" value={C.minPayout} disabled={!isSuperAdmin} onChange={(e) => setCfg({ ...C, minPayout: Number(e.target.value) })} className="w-full h-9 px-2 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px]" /></div>
            <div><label className="text-[12px] text-[#718096]">Cookie validity (days)</label><input type="number" value={C.cookieDays} disabled={!isSuperAdmin} onChange={(e) => setCfg({ ...C, cookieDays: Number(e.target.value) })} className="w-full h-9 px-2 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px]" /></div>
          </div>
          <div><label className="text-[12px] text-[#718096]">Allowed payout modes</label>
            <div className="flex gap-4 mt-1">{["cash", "upi", "bank"].map((m) => <label key={m} className="flex items-center gap-1.5 text-[13px] capitalize"><input type="checkbox" disabled={!isSuperAdmin} checked={C.payoutModes.includes(m)} onChange={(e) => setCfg({ ...C, payoutModes: e.target.checked ? [...C.payoutModes, m] : C.payoutModes.filter((x: string) => x !== m) })} />{m}</label>)}</div>
          </div>
          <div><label className="text-[12px] text-[#718096]">Terms & conditions</label><textarea value={C.terms} disabled={!isSuperAdmin} onChange={(e) => setCfg({ ...C, terms: e.target.value })} className="w-full h-24 px-3 py-2 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] resize-none" /></div>
          {isSuperAdmin && <button onClick={() => saveSettings.mutate(C)} disabled={saveSettings.isPending} className="btn-primary py-2.5 px-6 flex items-center gap-2">{saveSettings.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save Settings</button>}
        </div>
      )}

    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { Loader2 } from "lucide-react";
import AuthLayout, { authInput, authLabel, authButton } from "@/components/AuthLayout";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);
  return url.toString();
}

export default function Login() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [email, setEmail] = useState("admin@udaan24.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const devLogin = trpc.auth.devLogin.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      navigate("/admin");
    },
    onError: (e) => setError(e.message),
  });

  const kimiConfigured = !!import.meta.env.VITE_KIMI_AUTH_URL;

  return (
    <AuthLayout badge="Admin Panel" title="Admin Login" subtitle="Sign in to manage Udaan24 AI Institute">
      <form
        onSubmit={(e) => { e.preventDefault(); setError(""); devLogin.mutate({ email, password }); }}
        className="space-y-4"
      >
        <div>
          <label className={authLabel}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={authInput} placeholder="admin@udaan24.com" />
        </div>
        <div>
          <label className={authLabel}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={authInput} placeholder="••••••••" />
        </div>
        {error && <p className="text-[12px] text-red-300">{error}</p>}
        <button type="submit" disabled={devLogin.isPending} className={authButton}>
          {devLogin.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
        </button>
      </form>

      {kimiConfigured && (
        <>
          <div className="my-4 flex items-center gap-3 text-[11px] text-white/40">
            <span className="flex-1 h-px bg-white/15" />OR<span className="flex-1 h-px bg-white/15" />
          </div>
          <button
            onClick={() => { window.location.href = getOAuthUrl(); }}
            className="w-full h-11 rounded-lg border border-white/20 bg-white/5 text-white text-[14px] font-semibold hover:bg-white/12 transition-all"
          >
            Sign in with Kimi
          </button>
        </>
      )}
    </AuthLayout>
  );
}

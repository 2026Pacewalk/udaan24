import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { Loader2, GraduationCap } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA] p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-xl bg-[#F5B800] flex items-center justify-center mx-auto mb-2">
            <GraduationCap className="w-7 h-7 text-[#1B2A4A]" />
          </div>
          <CardTitle>Udaan24 Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setError("");
              devLogin.mutate({ email, password });
            }}
            className="space-y-3"
          >
            <div>
              <label className="text-[13px] font-medium text-[#1B2A4A] mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-10 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] outline-none focus:border-[#F5B800]"
                placeholder="admin@udaan24.com"
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-[#1B2A4A] mb-1 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-10 px-3 bg-[#F5F6FA] border border-[#E8EDF5] rounded-lg text-[13px] outline-none focus:border-[#F5B800]"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-[12px] text-red-500">{error}</p>}
            <Button type="submit" className="w-full" size="lg" disabled={devLogin.isPending}>
              {devLogin.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
            </Button>
          </form>

          {kimiConfigured && (
            <>
              <div className="my-4 flex items-center gap-3 text-[11px] text-[#A0AEC0]">
                <span className="flex-1 h-px bg-[#E8EDF5]" />OR<span className="flex-1 h-px bg-[#E8EDF5]" />
              </div>
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => { window.location.href = getOAuthUrl(); }}
              >
                Sign in with Kimi
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

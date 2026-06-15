/**
 * One-time helper to obtain a Google Drive OAuth refresh token.
 *
 * Prereqs (see BACKUP_SETUP.md):
 *   1. Google Cloud Console → enable "Google Drive API".
 *   2. OAuth consent screen → External → add yourself; PUBLISH to "In production"
 *      (so the refresh token does not expire after 7 days).
 *   3. Credentials → Create OAuth client ID → "Desktop app" → copy Client ID + Secret.
 *
 * Run:
 *   GOOGLE_OAUTH_CLIENT_ID=xxx GOOGLE_OAUTH_CLIENT_SECRET=yyy npx tsx db/drive-auth.ts
 *   (PowerShell: $env:GOOGLE_OAUTH_CLIENT_ID="xxx"; $env:GOOGLE_OAUTH_CLIENT_SECRET="yyy"; npx tsx db/drive-auth.ts)
 *
 * It opens a consent URL, captures the code via a localhost redirect, and prints
 * your GOOGLE_OAUTH_REFRESH_TOKEN — set that (plus the client id/secret) on Railway.
 */
import http from "http";

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || process.argv[2];
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || process.argv[3];
const PORT = 53682;
const REDIRECT = `http://localhost:${PORT}`;
const SCOPE = "https://www.googleapis.com/auth/drive";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Missing client id/secret. Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET (env or args).");
  process.exit(1);
}

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
  }).toString();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", REDIRECT);
  const code = url.searchParams.get("code");
  if (!code) {
    res.writeHead(400).end("No code");
    return;
  }
  try {
    const r = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT,
        grant_type: "authorization_code",
      }),
    });
    const json = (await r.json()) as { refresh_token?: string; error?: string; error_description?: string };
    if (json.refresh_token) {
      res.writeHead(200, { "content-type": "text/html" }).end("<h2>✅ Done — you can close this tab and return to the terminal.</h2>");
      console.log("\n========================================================");
      console.log("GOOGLE_OAUTH_REFRESH_TOKEN=" + json.refresh_token);
      console.log("========================================================\n");
      console.log("Set this on Railway (plus GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET).");
    } else {
      res.writeHead(400).end("No refresh_token: " + JSON.stringify(json));
      console.error("No refresh_token returned:", json);
    }
  } catch (e) {
    res.writeHead(500).end("Error: " + String(e));
    console.error(e);
  } finally {
    setTimeout(() => { server.close(); process.exit(0); }, 500);
  }
});

server.listen(PORT, () => {
  console.log("\n1) Open this URL in your browser and approve access:\n");
  console.log("   " + authUrl + "\n");
  console.log(`2) Waiting for Google to redirect to ${REDIRECT} ...`);
});

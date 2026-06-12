// Auth bypass guard for the email/password (admin/student/centre) dev logins.
// Controlled solely by the DEV_AUTH env var, which defaults to "false". Set
// DEV_AUTH=true to enable the seeded logins (e.g. on a demo/staging deploy that
// has no Kimi OAuth configured); leave it unset/false for a hardened production
// deploy that uses real OAuth instead.
export function isDevAuth(): boolean {
  return process.env.DEV_AUTH === "true";
}

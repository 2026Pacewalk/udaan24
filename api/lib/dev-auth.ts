// Local development auth bypass guard.
// Enabled only when DEV_AUTH=true AND we are not running in production.
// This gates the dev-only login routes (admin/student/centre) so they can
// never be active in a production build.
export function isDevAuth(): boolean {
  return process.env.DEV_AUTH === "true" && process.env.NODE_ENV !== "production";
}

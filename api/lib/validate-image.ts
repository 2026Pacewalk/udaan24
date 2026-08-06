import { TRPCError } from "@trpc/server";

// Accepted profile-image data URLs (matches the client ImageUpload component).
const DATA_URL_RE = /^data:image\/(jpeg|jpg|png|webp);base64,/i;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB decoded — generous; client compresses to ~<200 KB

// Validate an optional profile photo. Empty/undefined = "no photo" (allowed).
// External http(s) URLs (e.g. seeded images) pass through untouched. Anything
// else must be a valid JPG/PNG/WEBP base64 data URL under the size cap.
// Throws a user-friendly TRPCError (never a raw DB/server exception) on failure.
export function assertValidPhoto(photo: string | undefined | null): void {
  if (!photo) return;
  if (/^https?:\/\//i.test(photo)) return;
  if (!DATA_URL_RE.test(photo)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Please upload a valid JPG, JPEG, PNG or WEBP image." });
  }
  const b64 = photo.slice(photo.indexOf(",") + 1);
  const bytes = Math.floor((b64.length * 3) / 4);
  if (bytes > MAX_BYTES) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Image is too large. Please choose an image under 5 MB." });
  }
}

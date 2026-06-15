// Minimal Google Drive client using the REST API + an OAuth2 refresh token.
// No googleapis dependency — just fetch. Files are owned by the user who
// granted consent (reliable on personal Gmail; service accounts can't own
// files in personal My Drive).
//
// Required env:
//   GOOGLE_OAUTH_CLIENT_ID
//   GOOGLE_OAUTH_CLIENT_SECRET
//   GOOGLE_OAUTH_REFRESH_TOKEN
// Optional:
//   GDRIVE_BACKUP_FOLDER_ID  (upload into this folder; else My Drive root)

const TOKEN_URL = "https://oauth2.googleapis.com/token";

function cfg() {
  return {
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || "",
    refreshToken: process.env.GOOGLE_OAUTH_REFRESH_TOKEN || "",
    folderId: process.env.GDRIVE_BACKUP_FOLDER_ID || "",
  };
}

export function isDriveConfigured(): boolean {
  const c = cfg();
  return !!(c.clientId && c.clientSecret && c.refreshToken);
}

async function getAccessToken(): Promise<string> {
  const c = cfg();
  const body = new URLSearchParams({
    client_id: c.clientId,
    client_secret: c.clientSecret,
    refresh_token: c.refreshToken,
    grant_type: "refresh_token",
  });
  const r = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!r.ok) throw new Error(`Google auth failed (${r.status}): ${await r.text()}`);
  const json = (await r.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("Google auth: no access_token returned");
  return json.access_token;
}

export type DriveFile = { id: string; name: string; size?: string; createdTime: string; webViewLink?: string };

export async function uploadToDrive(name: string, content: Buffer, mimeType = "application/sql"): Promise<DriveFile> {
  const token = await getAccessToken();
  const c = cfg();
  const metadata: Record<string, any> = { name };
  if (c.folderId) metadata.parents = [c.folderId];

  const boundary = "udaan24boundary" + Date.now();
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`),
    content,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  const r = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size,webViewLink,createdTime&supportsAllDrives=true",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": `multipart/related; boundary=${boundary}` },
      body,
    },
  );
  if (!r.ok) throw new Error(`Drive upload failed (${r.status}): ${await r.text()}`);
  return (await r.json()) as DriveFile;
}

export async function listDriveBackups(): Promise<DriveFile[]> {
  const token = await getAccessToken();
  const c = cfg();
  const clauses = ["name contains 'udaan24-backup'", "trashed=false"];
  if (c.folderId) clauses.push(`'${c.folderId}' in parents`);
  const q = encodeURIComponent(clauses.join(" and "));
  const url =
    `https://www.googleapis.com/drive/v3/files?q=${q}` +
    `&orderBy=createdTime desc&pageSize=200&fields=files(id,name,size,createdTime,webViewLink)` +
    `&supportsAllDrives=true&includeItemsFromAllDrives=true`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new Error(`Drive list failed (${r.status}): ${await r.text()}`);
  return ((await r.json()) as { files?: DriveFile[] }).files || [];
}

export async function downloadDriveFile(id: string): Promise<Buffer> {
  const token = await getAccessToken();
  const r = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media&supportsAllDrives=true`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error(`Drive download failed (${r.status}): ${await r.text()}`);
  return Buffer.from(await r.arrayBuffer());
}

export async function deleteDriveFile(id: string): Promise<void> {
  const token = await getAccessToken();
  const r = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?supportsAllDrives=true`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok && r.status !== 204) throw new Error(`Drive delete failed (${r.status}): ${await r.text()}`);
}

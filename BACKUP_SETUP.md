# Database Backups → Google Drive

The app takes a **daily automatic backup** of the MySQL database (02:00 UTC by
default) and can upload it to **Google Drive**. Super Admins can also run a
backup on demand, download, and **restore** from any backup — in the admin
panel under **Backups**.

- **Engine:** a pure-Node logical SQL dump of every table (no `mysqldump` needed).
- **Local copy:** saved to `backups/` on the server (note: Railway disk is
  temporary, so Google Drive is the durable, off-server copy).
- **Restore:** drops & reloads all tables from a chosen backup, and **takes a
  safety snapshot of the current database first**.

## One-time Google Drive setup (~5–10 min)

Backups upload to **your** Google Drive using an OAuth refresh token (this works
on a personal Gmail; a bare service account does not, because service accounts
can't own files in personal "My Drive").

### 1. Create a Google Cloud project + enable Drive API
1. Go to https://console.cloud.google.com → create a project (any name).
2. **APIs & Services → Library** → search **Google Drive API** → **Enable**.

### 2. Configure the OAuth consent screen
1. **APIs & Services → OAuth consent screen** → User type **External** → Create.
2. Fill App name + your email. Save through the steps.
3. On **Scopes**, you can skip (we request the scope at runtime).
4. **IMPORTANT:** On the consent screen overview, click **Publish app → Confirm**
   (status becomes *In production*). This stops the refresh token from expiring
   after 7 days. (You'll see an "unverified app" notice when you authorize — that's
   fine for your own personal use; click *Advanced → Go to … (unsafe)*.)

### 3. Create the OAuth client
1. **APIs & Services → Credentials → Create credentials → OAuth client ID**.
2. Application type: **Desktop app** → Create.
3. Copy the **Client ID** and **Client secret**.

### 4. Mint your refresh token (run locally, once)
In the `app/` folder:

```powershell
$env:GOOGLE_OAUTH_CLIENT_ID="<your client id>"
$env:GOOGLE_OAUTH_CLIENT_SECRET="<your client secret>"
npx tsx db/drive-auth.ts
```

It prints a URL → open it, approve access → the terminal prints:

```
GOOGLE_OAUTH_REFRESH_TOKEN=1//0g....
```

### 5. (Optional) Pick a Drive folder
Create a folder in your Drive (e.g. "Udaan24 Backups"), open it, and copy the id
from the URL: `https://drive.google.com/drive/folders/<THIS_IS_THE_ID>`.
Leave blank to drop backups in My Drive root.

### 6. Set the variables on Railway
Railway → your `udaan24-app` service → **Variables** → add:

| Variable | Value |
|---|---|
| `GOOGLE_OAUTH_CLIENT_ID` | from step 3 |
| `GOOGLE_OAUTH_CLIENT_SECRET` | from step 3 |
| `GOOGLE_OAUTH_REFRESH_TOKEN` | from step 4 |
| `GDRIVE_BACKUP_FOLDER_ID` | (optional) from step 5 |
| `BACKUP_HOUR_UTC` | (optional) e.g. `2` |

Railway redeploys automatically. Open **Admin → Backups** → the banner should say
**"Google Drive connected."** Click **Backup Now** to confirm a file appears in
your Drive.

## Daily schedule
The server runs the backup once a day at `BACKUP_HOUR_UTC` (default 02:00 UTC) and
uploads to Drive. No external cron needed.

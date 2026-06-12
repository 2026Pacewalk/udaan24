# Deploying Udaan24 to Railway

This app is a single Node service (Hono + tRPC API that also serves the built React
frontend) backed by MySQL. The whole thing runs from this folder (`package.json` is
the repo root).

## 1. Create the project
1. Go to https://railway.app → **New Project** → **Deploy from GitHub repo**.
2. Pick **2026Pacewalk/udaan24**. Railway auto-detects Node (Nixpacks), runs
   `npm run build`, then `npm start` (see `railway.json`).

## 2. Add a MySQL database
1. In the project, **+ New** → **Database** → **Add MySQL**.
2. Railway creates a MySQL service exposing connection variables.

## 3. Set environment variables (on the **web service**, not the DB)
Open the service → **Variables** and add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | `${{ MySQL.MYSQL_URL }}` (Railway reference to the MySQL service) |
| `APP_ID` | `udaan24` |
| `APP_SECRET` | a long random string (used to sign sessions) |
| `KIMI_AUTH_URL` | `https://example.invalid` |
| `KIMI_OPEN_URL` | `https://example.invalid` |
| `OWNER_UNION_ID` | `dev-admin` |
| `DEV_AUTH` | `true` (enables the email/password logins below; see security note) |

> `PORT` and `NODE_ENV` are handled automatically — don't set them.
> `DATABASE_URL` must point at the MySQL service. If `${{ MySQL.MYSQL_URL }}` isn't
> picked up, copy the database's public `MYSQL_URL` value in directly.

## 4. Create the schema + seed (one time)
The database starts empty. From your machine (or Railway's shell), point at the
Railway MySQL and run:

```bash
# DATABASE_URL = the Railway MySQL connection string (public URL)
export DATABASE_URL="mysql://root:PASS@HOST:PORT/railway"
npm install
npm run db:push      # creates all tables from db/schema.ts
npx tsx db/seed.ts   # seeds courses, centres, dev admin/student/centre logins
```

(Railway: service → **⋯** → **Shell**, or use the Railway CLI `railway run`.)

## 5. Get the public domain
Service → **Settings** → **Networking** → **Generate Domain**. That URL is your live
site. Logins:
- Super Admin / Admin: `https://<domain>/login`
- Study Centre: `https://<domain>/centre/login`
- Student: `https://<domain>/student/login`

Seeded demo logins (only while `DEV_AUTH=true`):
- `superadmin@udaan24.com` / `superadmin123`
- `admin@udaan24.com` / `admin123`
- centre `UAN24-KKP` / `center123`, student `UAN24-0001` / `student123`

## ⚠️ Security note
`DEV_AUTH=true` exposes the seeded email/password logins on a public URL. For a real
production launch, change those seeded passwords (or set `DEV_AUTH=false` and wire up
real Kimi OAuth), and set a strong unique `APP_SECRET`.

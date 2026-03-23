# TSM Dashboard — Deployment Guide

## Super Admin Login (after deploy)
```
Email:    admin@tsm.com
Password: Admin@2026!
```

---

## Step 1 — Get Neon Database (free)

1. Go to https://neon.tech → Sign in with GitHub (echou12@asu.edu)
2. Click **New Project** → name it `tsm-dashboard`
3. On the dashboard, click **Connection Details**
4. Copy two strings:
   - **Pooled** → this is your `DATABASE_URL`
   - **Direct** → this is your `DIRECT_URL`

---

## Step 2 — Push code to GitHub

```bash
# In the tsm-dashboard folder:
git init
git add .
git commit -m "TSM Dashboard with Smartico integration"
git branch -M main

# Create a new repo at github.com, then:
git remote add origin https://github.com/echou12/tsm-dashboard.git
git push -u origin main
```

---

## Step 3 — Deploy to Vercel

1. Go to https://vercel.com → Sign in with GitHub (echou12@asu.edu)
2. Click **Add New Project** → select `tsm-dashboard` repo
3. Framework: **Next.js** (auto-detected)
4. Under **Environment Variables**, add ALL of these:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon **pooled** connection string |
| `DIRECT_URL` | Your Neon **direct** connection string |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` and paste result |
| `NEXTAUTH_URL` | `https://YOUR-APP.vercel.app` (fill after first deploy) |
| `SMARTICO_URL` | `https://apis6.smartico.ai/api/external/events/v2` |
| `SMARTICO_AUTH` | `377e796f-aa37-4258-87cd-b238248ff2fa` |
| `SMARTICO_BRAND` | `wjcasino` |
| `NEXT_PUBLIC_APP_NAME` | `TSM Dashboard` |

5. Click **Deploy** → wait ~2 minutes

---

## Step 4 — Seed the database (IMPORTANT)

After deploy, open Vercel terminal or run locally with production env:

```bash
# Option A: locally with production DB
DATABASE_URL="your-neon-pooled-url" \
DIRECT_URL="your-neon-direct-url" \
npx tsx prisma/seed.ts

# Option B: Vercel CLI
npm install -g vercel
vercel env pull .env.production.local
npx tsx prisma/seed.ts
```

---

## Step 5 — Update NEXTAUTH_URL

1. Copy your deployed URL from Vercel (e.g. `https://tsm-dashboard-abc.vercel.app`)
2. In Vercel → Project Settings → Environment Variables
3. Update `NEXTAUTH_URL` to your real URL
4. Click **Redeploy**

---

## Step 6 — Test login

Visit your Vercel URL → login with:
```
Email:    admin@tsm.com
Password: Admin@2026!
```

---

## Smartico Auto-Sync

The `vercel.json` includes a cron job that calls `/api/smartico/sync` every hour automatically.

You can also trigger a manual sync from the Dashboard page → **"Sincronizar Smartico"** button (visible to admin/manager roles).

---

## Troubleshooting

**Login fails** → Seed wasn't run. Run `npx tsx prisma/seed.ts` with production DB vars.

**"PrismaClientInitializationError"** → Both `DATABASE_URL` and `DIRECT_URL` must be set in Vercel env vars.

**Smartico returns 0 events** → Check `SMARTICO_AUTH` token and `SMARTICO_BRAND` value. Dashboard will fall back to local DB data automatically.

**Build fails on Vercel** → Make sure `DIRECT_URL` is set (needed for Prisma migrations during build).

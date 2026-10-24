# MyCardioGen · India Launch e-Invitation

Personalised invitations for the MyCardioGen India launch: **Saturday, 28 November 2026 · Le Méridien, Windsor Place, New Delhi**.

- `/{dr-name}`: each doctor's personal invitation (for example `/dr-anil-kapoor`). It opens with a wax-seal intro, then a real-time 3D beating heart with a DNA orbit, the founders' video, the hosts, venue and countdown, and an RSVP.
- `/admin`: the password-protected Invitation Console. Add doctors one at a time or in bulk, copy or WhatsApp their links, track who opened their invitation and who RSVP'd, set the founders' video, and export everything to CSV.
- `/`: a "by invitation only" teaser for anyone without a personal link.
- Shared links show a personalised preview card (name, date, venue and the heart render) in WhatsApp, iMessage, LinkedIn and similar apps.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Three.js via React Three Fiber (custom GLSL particle shaders) · Motion · Upstash Redis · hosted on Vercel.

## Run locally

```bash
npm install
cp .env.example .env.local   # then set ADMIN_USERNAME / ADMIN_PASSWORD / SESSION_SECRET
npm run dev
```

Locally, data is saved to `.data/db.json` (git-ignored). No database is needed.

## Deploy to Vercel

1. Push this folder to a GitHub repository and **Import** it in Vercel. Name the project `mycardiogeninvitation` to get `mycardiogeninvitation.vercel.app`.
2. In the Vercel project, open **Storage → Create Database → Upstash for Redis** (the free tier is plenty) and connect it to the project. This adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.
3. Under **Settings → Environment Variables**, add:
   - `ADMIN_USERNAME`: the admin login ID
   - `ADMIN_PASSWORD`: a strong password
   - `SESSION_SECRET`: a long random string (`openssl rand -base64 32`)
4. **Redeploy**, then open `https://<your-domain>/admin` and sign in.

Without Redis connected, the admin console shows a clear "Storage is not configured" message instead of losing data.

## Using the console

| Task | How |
| --- | --- |
| Invite one doctor | Type the name (with or without "Dr."), plus an optional WhatsApp number, then **Create invitation**. |
| Invite many | Switch to **Bulk** and paste one per line: `Anil Kapoor, 9876543210`. |
| Send | Use **WhatsApp** (pre-written message with their link) or **Copy link**. |
| Founders' video | Paste a YouTube, Vimeo, Google Drive or `.mp4` link under *Invitation settings*. Until then, invitations show a "Video message coming soon" placeholder. |
| Event time | Optional. Adds the time to the invitation, the countdown and the calendar files. |
| Track | Badges show *Not opened → Opened → Attending / Declined*. **Export CSV** downloads everything. |

Doctors with the same name get unique links (`dr-anil-kapoor`, `dr-anil-kapoor-2`).

## Editing content

Event details, host names and titles are in [`src/lib/event.ts`](src/lib/event.ts). Host photos are in `public/team/`.

# floridakimono.com — automation status & go-live plan

The Admin Command Center already exists and already covers the whole flow —
it's the Next.js app at **`kimono-admin/` on the `admin` branch of
`velocirachael/Kimono`** (built together in a previous session; design/scope
notes live in its `DESIGN.md`). This document is the go-live plan for it,
plus the suggested routine input (see `ROUTINE.md`).

## What's already built (don't rebuild)

| Requirement | Where it's handled |
|---|---|
| New email submissions get Welcome Letter | Formspree webhook → `data/pending-signups.json` → admin approves → **Resend** sends the Welcome Letter (`lib/resend.ts`) |
| Send newsletter / project updates | Newsletter-type signups get the subscription email on approve; bulk "Send newsletter" is designed (purple section) in `DESIGN.md`'s backlog |
| Member event → admin approve/deny/edit → calendar | Tally webhook → `data/pending-events.json` → `/admin` queue → edit-in-place → one atomic, syntax-checked commit to `events.js` on the live site |
| Admin command center GUI | `kimono-admin/app/admin/page.tsx` — built, working, **needs a home** (below) |

## Where the command center should live

The site itself is GitHub Pages (`CNAME` → floridakimono.com), but the
command center has server-side API routes (webhooks, GitHub commits, Resend
email), so Pages can't host it. **Vercel free tier is the right home**, as
its own README already planned:

1. **Vercel → New Project → import `Kimono`**, deploy from the `admin`
   branch, and set **Root Directory = `kimono-admin`** (critical — without
   it Vercel tries to build the whole static site as Next.js and fails).
2. **Add env vars** in Vercel project settings — the app's README mentions
   `.env.example`, but that file was never committed; the full list from
   the code is:
   - `GITHUB_TOKEN` — fine-grained PAT, `Kimono` repo only, Contents: read/write
   - `GITHUB_OWNER` = `velocirachael`, `GITHUB_REPO` = `Kimono`,
     `GITHUB_BRANCH` = the branch Pages publishes (check Settings → Pages)
   - `RESEND_API_KEY` / `RESEND_FROM` — needs the Resend account created
     and floridakimono.com verified as a sending domain
   - `ADMIN_USERNAME` / `ADMIN_PASSWORD` — Basic Auth login for `/admin`
   - `WEBHOOK_SECRET` — random string, appended to both webhook URLs
3. **DNS**: add a CNAME record `admin.floridakimono.com` → Vercel, and add
   that domain to the Vercel project. The GUI then lives at
   `https://admin.floridakimono.com/admin`.
4. **Point the forms at it**: in Tally and Formspree dashboards set the
   webhook URLs to
   `https://admin.floridakimono.com/api/webhooks/tally?secret=<value>` and
   `.../api/webhooks/formspree?secret=<value>`.

## Go-live checklist (from the app's own "known gaps")

- [ ] Create the Resend account + verify the sending domain
- [ ] Replace placeholder Welcome Letter / Newsletter HTML in `lib/resend.ts`
- [ ] Fill real Formspree form IDs into the mapping in
      `app/api/webhooks/formspree/route.ts`
- [ ] Confirm which branch/folder GitHub Pages publishes, so `kimono-admin/`
      source is never served as static text (and set `GITHUB_BRANCH` to match)
- [ ] Commit a real `.env.example` to `kimono-admin/` (currently missing)
- [ ] Test one event and one signup end-to-end before announcing

# Kimono Command Center — Cloudflare Worker

The Florida Kimono Club admin, rebuilt for Cloudflare: **one Worker + a D1
database**, replacing the Vercel/Next.js + GitHub-commits design. Approving
an event is a database write — no git, no tokens, no rebuild — and the
public calendar updates instantly.

| Piece | What it does |
|---|---|
| `src/index.ts` | Routes: 2 webhooks, public `/api/events`, admin API, daily steward cron |
| `src/db.ts` | The storage layer (replaces `lib/github.ts` — no more events.js string surgery) |
| `src/steward.ts` | ROUTINE.md as code: daily queue/calendar/intake report, emailed to you |
| `public/admin/` | The Command Center GUI (same design, no framework) |
| `schema.sql` / `seed.sql` | Tables + your current 8 events, dates normalized to ISO |
| `site-patch/index.html` | The public site, patched to fetch the calendar from the API (upload at cutover, step 9) |

Everything runs on Cloudflare's free tier. Email still goes through Resend
(their recommended path — Cloudflare's own sending is still in beta).

---

## Deploying — do these in order

You'll need: [Node.js](https://nodejs.org) 18+, a free
[Cloudflare account](https://dash.cloudflare.com/sign-up), and this folder
on your computer.

### 1. Move floridakimono.com's DNS to Cloudflare (one-time)

The Worker needs your domain on Cloudflare. In the
[dashboard](https://dash.cloudflare.com): **Add a domain** →
`floridakimono.com` → free plan. Cloudflare imports your existing DNS
records — **check that the records pointing at GitHub Pages came over**
(the four `A` records on the apex, and the `www` CNAME to
`velocirachael.github.io`), then set the two nameservers it gives you at
your domain registrar. The live site keeps working throughout; DNS moves
take minutes to a few hours.

### 2. Install and log in

```bash
cd kimono-worker
npm install
npx wrangler login        # opens a browser window
```

### 3. Create the database

```bash
npx wrangler d1 create kimono
```

Copy the `database_id` it prints into `wrangler.jsonc` (replacing
`PASTE_DATABASE_ID_HERE`).

### 4. Create the tables and import your current events

```bash
npx wrangler d1 execute kimono --remote --file=schema.sql
npx wrangler d1 execute kimono --remote --file=seed.sql
```

`seed.sql` was generated from your live `events.js` (8 events, dates
normalized to ISO). To regenerate it later: `npm run seed`.

### 5. Set the two secrets

```bash
npx wrangler secret put WEBHOOK_SECRET   # paste a long random string; you'll reuse it in step 8
npx wrangler secret put RESEND_API_KEY   # from step 6 — or set it later and redeploy nothing
```

Also open `wrangler.jsonc` and check the `vars` block: `RESEND_FROM` and
`ADMIN_EMAIL` are prefilled — edit if you want a different sender/report
address.

### 6. Resend (email)

At [resend.com](https://resend.com): create the free account → **Domains →
Add domain** → `floridakimono.com` → add the DNS records it lists (easy
now — your DNS is in Cloudflare, same dashboard) → create an API key for
step 5. Until this is done, approvals still work; only the emails fail,
and the GUI shows you which.

### 7. Deploy, then lock the door

```bash
npx wrangler deploy
```

This publishes the Worker at `admin.floridakimono.com` (Cloudflare creates
the DNS record automatically) and starts the daily steward cron.

**Now set up Access — before pointing any forms at it.** In
[one.dash.cloudflare.com](https://one.dash.cloudflare.com) (Zero Trust,
free tier), first pick any team name if asked. Then **Access →
Applications → Add an application → Self-hosted**, three times:

| # | Application domain/path | Policy |
|---|---|---|
| 1 | `admin.floridakimono.com` | **Allow** → Include → Emails → `velocirachael@gmail.com` |
| 2 | `admin.floridakimono.com/api/webhooks` | **Bypass** → Everyone |
| 3 | `admin.floridakimono.com/api/events` | **Bypass** → Everyone |

App 1 is the lock (login via one-time email code by default; add Google
as a login method in Settings → Authentication if you want one-click).
Apps 2 and 3 punch holes for the webhooks (which have their own secret)
and the public calendar. More-specific paths win, so the holes work.

The Worker fails closed: until Access is configured, admin routes return
403 rather than sitting open.

**Test it:** open `https://admin.floridakimono.com/admin` in a private
browser window — you should hit the Access login, then see the Command
Center with an empty queue.

### 8. Point the forms at the new webhooks

In the Tally and Formspree dashboards, set the webhook URLs to:

```
https://admin.floridakimono.com/api/webhooks/tally?secret=YOUR_SECRET
https://admin.floridakimono.com/api/webhooks/formspree?secret=YOUR_SECRET
```

(`YOUR_SECRET` = the WEBHOOK_SECRET from step 5.) If Welcome and
Newsletter are two separate Formspree forms, fill your real form IDs into
`FORMSPREE_FORM_IDS` in `src/webhooks.ts` and redeploy.

### 9. Cut the public site over

Upload `site-patch/index.html` over the root `index.html` in the Kimono
repo (GitHub web UI → the file → edit/upload → commit). That's the only
site change: the calendar now fetches from the API. `events.js` stays in
the repo untouched — it's your rollback (restore the old `index.html` and
you're back on it).

### 10. Test end-to-end

Submit one test event through Tally and one signup through Formspree →
both appear in the admin queue → edit/approve → CONFIRM → the event is on
floridakimono.com immediately and the welcome email arrives. Then check
your inbox the next morning for the steward report.

---

## Day-to-day

- **Approving things:** `admin.floridakimono.com/admin`, from any device.
- **The steward email:** arrives daily (12:00 UTC — 8 AM Florida summer,
  7 AM winter; schedule lives in `wrangler.jsonc`). It flags items waiting
  >48h, stale/duplicate/bad-date events, and silent webhooks. It also
  proves the system is alive — if the emails stop, something's wrong.
  Run it on demand at `/api/steward` (add `?email=1` to also send it).
- **Editing the calendar directly** (the old "edit events.js by hand"):
  ```bash
  npx wrangler d1 execute kimono --remote \
    --command "UPDATE events SET date='2026-09-04' WHERE title LIKE '%Tea Ceremony%'"
  ```
- **Backup:** `npx wrangler d1 export kimono --remote --output backup.sql`
- **Email copy:** the Welcome Letter / Newsletter HTML is placeholder text
  in `src/resend.ts` — swap in real copy and `npx wrangler deploy`.

## Local development

```bash
cp .dev.vars.example .dev.vars                      # REQUIRE_ACCESS=false lives here
npx wrangler d1 execute kimono --local --file=schema.sql
npx wrangler d1 execute kimono --local --file=seed.sql
npm run dev                                         # http://localhost:8787/admin
```

## Security model (short version)

- `/admin` + `/api/pending` + `/api/confirm-batch` + `/api/steward`:
  locked by **Cloudflare Access** at the edge; the Worker additionally
  refuses these routes if Access headers are missing (fail closed).
- `/api/webhooks/*`: locked by the `?secret=` query param, like before.
- `/api/events`: public by design, CORS-limited to floridakimono.com.
- No `workers.dev` URL (`workers_dev: false`) — the custom domain behind
  Access is the only way in. Don't change that.

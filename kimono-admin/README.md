# kimono-admin

Approve/deny/edit queue for event submissions (Tally) and email signups
(Formspree), with a single batch push to `events.js` in the `kimono` repo.

See `DESIGN.md` before touching colors or adding a new admin section — it
records the color-coding scheme and rationale, plus what's built vs. still
backlog from the original Command Center mockup.

## How it works

1. Tally webhook → `/api/webhooks/tally?secret=...` → appends to
   `data/pending-events.json` in the repo. No changes to the live site yet.
2. Formspree webhook → `/api/webhooks/formspree?secret=...` → appends to
   `data/pending-signups.json`. Same, no live changes.
3. You open `/admin`, see everything pending, Approve/Deny/Edit each one.
   These decisions only live in your browser tab until you confirm.
4. "Review & confirm" shows a summary of exactly what's about to go live.
5. Hitting CONFIRM does ONE thing server-side: reads the current `events.js`,
   merges in the approved (possibly edited) events, sorts by date,
   syntax-checks the result, and — only if that check passes — commits
   `events.js` + both pending files in a single atomic Git commit. Approved
   signups get their Welcome Letter / Newsletter email via Resend right
   after the commit succeeds.

If the syntax check fails, nothing is written — you get an error back
instead of a broken live site.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev
```

### Env vars (see `.env.example`)

- `GITHUB_TOKEN` — fine-grained PAT, scoped to the `kimono` repo only,
  Contents: Read and write, nothing else. Create at
  GitHub → Settings → Developer settings → Personal access tokens →
  Fine-grained tokens.
- `RESEND_API_KEY` / `RESEND_FROM` — from resend.com, once that account
  exists (task: create Resend account).
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — whatever you want; this is the
  Basic Auth login for `/admin`.
- `WEBHOOK_SECRET` — random string; append it to the two webhook URLs you
  configure in Tally's and Formspree's dashboards, e.g.
  `https://admin.floridakimono.com/api/webhooks/tally?secret=<value>`.

### Deploying

1. Push this folder into the `kimono` repo (you chose same-repo over a
   separate one — noted below).
2. In Vercel: New Project → import `kimono`. **Set "Root Directory" to
   wherever this folder ends up** (e.g. `admin-app`) — otherwise Vercel
   tries to build your whole static site as a Next.js app and fails.
3. Add all the env vars above in Vercel's project settings.
4. Point a subdomain (`admin.floridakimono.com`) at the Vercel project via
   a CNAME record in your DNS.

### Open item: same-repo placement

Since this lives inside `kimono` rather than a separate repo, double check
how GitHub Pages is configured to publish (root vs. `/docs` vs. a specific
branch). If Pages would otherwise serve this folder's source files as
plain static text, exclude it from whatever Pages treats as its publish
source.

## Known gaps / next hardening pass

- `events.js`'s header comment says dates should be `YYYY-MM-DD`; the live
  file actually uses `"Sep 3, 2026"` style strings. This tool writes in the
  format the file actually uses. Worth fixing the comment, or migrating the
  data, so they agree — your call.
- Tally field matching (`app/api/webhooks/tally/route.ts`) matches by
  question label text via regex. If you reword a question on the form, the
  regex may stop matching — check the `FIELD_MATCHERS` map if a submission
  comes through with a blank field.
- Formspree form → signup type (`app/api/webhooks/formspree/route.ts`) has
  a placeholder mapping (`TALLY_FORM_IDS`) that needs your real Formspree
  form IDs filled in once you have them.
- Every CONFIRM commit rewrites the entire `EVENTS` array (not just the new
  entries) so formatting stays consistent — the tradeoff is a full-file
  diff on every commit rather than a minimal one.
- No PR-review mode — CONFIRM commits straight to `main`, per your call.
  Revert with `git revert <sha>` (the commit link is shown after confirm)
  if something goes out wrong.
- Welcome Letter / Newsletter HTML in `lib/resend.ts` is placeholder copy —
  swap in the real templates before going live.

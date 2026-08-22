# Florida Kimono — Command Center & Outreach System

*Status notes and to-do list. Last updated: August 22, 2026.*

This is the living reference for how the club's systems fit together:
the public website, the Command Center backend, and the outreach
program. Written so future-you (or a future Claude session) can pick
up exactly where this one left off.

---

## How the system fits together

```
                    ┌─────────────────────────────┐
  visitors ───────► │  floridakimono.com          │  public website
                    │  (this repo, GitHub Pages)  │  velocirachael/Kimono
                    └──────────┬──────────────────┘
                               │ signup form POSTs to ─────────┐
                               │ events calendar loads from ───┤
                               ▼                               ▼
                    ┌─────────────────────────────────────────────┐
                    │  admin.floridakimono.com                    │
                    │  Cloudflare Worker: "kimono-admin"          │
                    │  = the Command Center                       │
                    │  · GET  /api/events  → live events JSON     │
                    │  · POST /api/signup  → member signup intake │
                    │  · /admin            → approval dashboard   │
                    └─────────────────────────────────────────────┘
```

## What we know (verified August 19–20, 2026)

- **The backend is alive.** `https://admin.floridakimono.com/api/events`
  returns live event data, including events that exist nowhere in this
  repo (e.g. the Japanese Association of Jacksonville meetup). Events
  are stored in the Worker's own storage — approving one in the admin
  publishes it instantly, no GitHub commit involved.
- **It runs as a Cloudflare Worker named `kimono-admin`** on the club's
  Cloudflare account (confirmed in the dashboard on Aug 20).
- **The website depends on it.** `index.html` no longer reads
  `events.js` — the calendar fetches from the API, and the "Join the
  list" form POSTs to `/api/signup`. (`events.js` still sits in the
  repo but is unused — stale, don't edit it expecting the site to
  change.)
- **The Worker's source code lives in the private `kimono-worker`
  repo** (rescued Aug 20, 2026 — see the resolved to-do #1 below).
  That repo is the source of truth: changes go code → repo →
  `npx wrangler deploy`. Treat Cloudflare's online "Edit code" as
  read-only from now on. The even older Next.js version remains
  viewable in this repo's history:
  `git show d08fbcd^:kimono-admin/README.md`.
- **Privacy principle (the reason a backend exists at all):** this
  repo is **public** — member names and emails must never be committed
  here. The Worker keeps them in Cloudflare's private storage, which
  is the correct place. Any future feature that touches member data
  belongs in the Worker, not in this repo.

## To-do list

### 1. ~~Rescue the Worker's code into a private repo~~ ✅ DONE Aug 20, 2026

The private **`kimono-worker`** repo now holds the Worker's full source
(TypeScript, admin GUI assets, D1 schema and seeds, wrangler config
with the real database_id, and a dated snapshot of the dashboard's
deployed bundle). The code copied from the dashboard was verified
identical to the compiled output of that repo's `src/` — no secrets
were inline; they live in Cloudflare's encrypted variables, where they
belong. Recovery from any mishap is now: clone → `npx wrangler deploy`.

### 2. Test whether membership signup actually works

Suspicion: signups may be failing with a **403 Forbidden** (Cloudflare's
bot protection can mistake the form's submission for spam).

- Open **floridakimono.com**, submit the "Join the list" form with your
  own name and email.
- **Thank-you message** → signups work; cross this off.
- **Red error message** → the 403 is real. Fix in Cloudflare:
  Security → WAF → create a **skip rule** for hostname
  `admin.floridakimono.com`, path starting `/api/` (skip Bot Fight
  Mode / managed rules for those API paths). Re-test after.

### 3. ~~Build "Organizers & Venues" into the Command Center~~ ✅ DONE Aug 20, 2026

Live at **admin.floridakimono.com/admin/outreach.html** (also linked
from the Approvals sidebar — the yellow section the original design
reserved). Contacts live in the Worker's D1 `outreach_contacts` table;
every edit saves to the server through the Access-locked
`/api/outreach` route, so the list is private and identical on every
device. Source, migration, and seed are in the `kimono-worker` repo
(see its README). The static stopgap this repo briefly served at
`/admin` was deleted the same day — its data was seeded into D1
first, and the old page remains in git history if ever needed.

### 4. ~~Build "Calendar" into the Command Center~~ ✅ DONE Aug 22, 2026

Live at **admin.floridakimono.com/admin/calendar.html** (pink in the
Approvals sidebar). Every event on the site, editable in place: fix a
date or link, hide an event without deleting it, delete it, or add a new
one — no more wrangler SQL for routine calendar edits. Data is the same
D1 `events` table the public calendar reads, through the Access-locked
`/api/calendar` route; the public site catches up within ~5 minutes
(edge cache). Source in the `kimono-worker` repo.

Built because JAPAN Fes Florida — Miami (Nov 6) appeared cancelled (or
its page moved) and there was no GUI way to remove it. That event was
deleted from the live calendar and from `seed.sql` the same day.

### 5. Later / nice-to-have

- Delete the stale `events.js` and `index (2).html` from this repo
  once confirmed nothing references them.

## The outreach program itself

Goal: build community and connect Florida Kimono to the Orlando
Asian-American community (and statewide).

- **Tracker:** admin.floridakimono.com/admin/outreach.html (private,
  in the Command Center) — 10 seeded contacts, statuses, priorities,
  next actions, and the email templates.
- **First target:** Gary C.K. Lau, founder/executive director of Asia
  Trend (asiatrend.org) — Orlando 501(c)(3) magazine + community
  learning center, runs the annual Asian Cultural EXPO.
  Contact: info@asiatrend.org · (646) 389-2742.
  The intro email draft is in the tracker's templates ("Asia Trend —
  intro to Gary Lau"): proposes event cross-listing, a kimono
  demo/booth at the EXPO, and contributed articles.
- **Next in line:** Japan Association of Orlando (jorlando.org, runs
  the Orlando Japan Festival), Asian American Chamber of Commerce of
  Central Florida, Mills 50 district, plus the organizers already on
  our events calendar (Morikami, Leu Gardens, JAPAN Fes, JAS of NWFL,
  Ikebana Naples, OKI Fest).
- **Working rhythm:** lead with what's in it for them · one ask per
  email · follow up once after ~2 weeks · update the tracker after
  every send or reply.

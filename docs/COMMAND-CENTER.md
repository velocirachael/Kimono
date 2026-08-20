# Florida Kimono — Command Center & Outreach System

*Status notes and to-do list. Last updated: August 20, 2026.*

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
- **The Worker's source code is not in version control.** The
  `kimono-admin` folder (an earlier Next.js version of the Command
  Center) was deleted from this repo on **Friday, August 14, 2026**
  (commit `d08fbcd`). The running Worker's code exists *only* inside
  Cloudflare right now. It is recoverable from the dashboard — see
  to-do #1. The old Next.js version is still viewable in git history:
  `git show d08fbcd^:kimono-admin/README.md`.
- **Privacy principle (the reason a backend exists at all):** this
  repo is **public** — member names and emails must never be committed
  here. The Worker keeps them in Cloudflare's private storage, which
  is the correct place. Any future feature that touches member data
  belongs in the Worker, not in this repo.

## To-do list

### 1. Rescue the Worker's code into a private repo  ← most important

The running system has no backup. One mis-tap in Cloudflare's online
editor could break events and signups with nothing to restore from.

- **Recon (phone-friendly):** Cloudflare dashboard → Workers →
  `kimono-admin` → **Settings / Bindings** → screenshot it. This shows
  which database (D1) or storage (KV) holds members and events, and
  any secrets/services wired in.
- **The actual copy (needs a computer):** dashboard → `kimono-admin` →
  **Edit code** → select all → copy → paste into a Claude session.
  Claude then commits it to a **new private repo** (private because
  Worker code sometimes contains passwords/secrets inline).
- Note: Claude's remote sandbox cannot reach Cloudflare's API
  directly, so this copy step has to go through a human.

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

### 3. Build "Organizers & Venues" into the Command Center

The outreach tracker's permanent home. The old Command Center design
(`git show d08fbcd^:kimono-admin/DESIGN.md`) already reserved this
section — color yellow — in its plan.

- Port the contact list and email templates from this repo's
  `admin/outreach-data.js` into the Worker, stored in its database.
- Until then, the **stopgap tracker** lives in this repo at `/admin`
  (static page: dashboard counts, contact cards with status editing,
  email templates with mailto compose). Its edits save per-browser;
  "Export data file" produces an updated `outreach-data.js` to commit.

### 4. Later / nice-to-have

- Delete the stale `events.js` and `index (2).html` from this repo
  once confirmed nothing references them.
- Retire the static `/admin` stopgap after the Worker version exists.
- Point `admin.floridakimono.com/admin` nav to include the new section.

## The outreach program itself

Goal: build community and connect Florida Kimono to the Orlando
Asian-American community (and statewide).

- **Tracker (stopgap):** `admin/index.html` + `admin/outreach-data.js`
  in this repo — 10 seeded contacts, statuses, priorities, next
  actions.
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

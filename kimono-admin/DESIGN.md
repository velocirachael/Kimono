# Design system & scope notes

Living memory for this project — read this before adding a new admin
section or touching colors, so decisions don't get re-litigated or drift
as Florida Kimono Club grows. Source mockup: `Command Center.dc.html`,
exported from Claude Design (claude.ai/design). Style tokens live in
`app/globals.css`.

## Palette rationale

- **Pastel gradient background** (pink → lavender → mint → butter, `--bg-1`
  through `--bg-4`) sits behind every screen. Soft on purpose — it's there
  all day.
- **Bright "pop" colors are reserved for section identity, not decoration.**
  Each part of the app owns one:
  - Pink (`--pop-pink`) — Calendar & Events
  - Purple (`--pop-purple`) — Letter / Subscribers / Newsletter
  - Yellow (`--pop-yellow`) — Organizers & Venues
  - Teal (`--pop-teal`) — Settings / general
  A panel border, a stat tile's number, an approved row's tint — all pull
  from the same variable for whatever section they belong to. When a new
  section gets built, give it one of these (or add a fifth) rather than
  reusing another section's color or picking something ad hoc.
- **Sidebar is deep indigo (`#2b2154`), not pink**, on purpose — it's on
  screen on every page regardless of section, so giving it a section color
  would blur the cue instead of reinforcing it. Deliberately closer to dark
  mode: rests the eyes during long review sessions, and makes the colored
  nav dots pop harder by contrast — the actual point of the color-coding is
  fast orientation when you're tired, and a quiet dark sidebar is what
  makes that work.
- Fonts (Caprasimo headings / Figtree body) and the pill/card/rounded-corner
  shape language came straight from the mockup and were never in question —
  only the earlier earth-tone palette got replaced.

## What's built (v1)

Just **Approvals**: the two-screen queue → confirm flow. Pending events
(Tally) and pending signups (Formspree) each get their own panel, tinted
pink and purple respectively, edit-in-place, then one batch commit to
`events.js` on CONFIRM. See `README.md` for the technical setup.

## What's designed but not built (backlog, from the mockup)

Each of these already has a color assigned above and a placeholder nav dot
in `app/admin/page.tsx`'s `NAV` array — wiring one up means giving it a real
route/page, not inventing a color scheme for it.

- **Calendar page** (pink) — the mockup's version fetches `events.js`
  straight from GitHub's raw URL client-side, no auth, since it's already
  public data. Worth reusing that pattern for a public "what's live right
  now" view, separate from the admin-only approval queue.
- **Organizers & Venues / safelist** (yellow) — tracks which organizers are
  vetted ("Safelisted") vs new, and the mockup tags incoming submissions
  "New organizer" vs "Returning organizer" accordingly. Needs its own data
  file and changes the Tally intake logic to cross-check submitters against
  the list.
- **Subscribers page** (purple) — the mockup shows a different model than
  what got built: a signup form posting straight to Formspree, plus a
  manually-managed list where you mark someone "Welcomed" and hit "Send
  newsletter" as a bulk action, rather than the automatic
  detect-type-and-email-on-approve flow in v1. Decide which model you
  actually want before building this one — they're genuinely different
  amounts of automation.
- **Settings page** (teal) — undefined scope, no mockup detail yet.
- **Real stats** — the stat row currently only shows real numbers for
  activity within the current session (pending count, approved/denied this
  session). "Approved this year," "Safelisted organizers," "Newsletter
  subscribers" need real backing data sources (git history, the safelist,
  Formspree/Resend) before they can show real numbers instead of session
  counts.

## When adding a new section

1. Pick (or reuse) a pop color from the palette above — don't invent a new
   hex unless the palette's four are genuinely exhausted.
2. Add its nav dot to `NAV` in `app/admin/page.tsx` if it isn't there
   already.
3. Give its main panel(s) `panel-<color>` and its approved rows a
   `<thing>-approved` variant, following the pattern in `globals.css`.
4. Update this file's "what's built" / "backlog" split so it stays accurate.

// The daily steward, implementing ROUTINE.md as a Cron Trigger instead of a
// Claude session. Watch-only by design: it reads, it reports, it never
// approves, denies, edits, or emails members. Its one email goes to the
// admin. Runs daily; also reachable on demand at GET /api/steward (behind
// Access) for testing.

import { sendEmail } from "./resend";
import type { Env } from "./types";

export type StewardReport = {
  generatedAt: string;
  pendingEvents: number;
  pendingSignups: number;
  oldestPendingHours: number | null;
  overdue: boolean; // anything pending > 48h
  staleEvents: string[]; // published events > 60 days past
  duplicateEvents: string[]; // same date + title
  badDates: string[]; // rows whose date isn't ISO
  daysSinceLastIntake: number | null; // newest submission across both queues, any status
  intakeWarning: boolean; // > 14 days silent
  allQuiet: boolean;
};

export async function buildStewardReport(env: Env): Promise<StewardReport> {
  const db = env.DB;
  const now = Date.now();

  const [pend, oldest, stale, dupes, bad, lastIntake] = await db.batch([
    db.prepare(
      `SELECT (SELECT COUNT(*) FROM pending_events WHERE status = 'pending') AS ev,
              (SELECT COUNT(*) FROM pending_signups WHERE status = 'pending') AS su`
    ),
    db.prepare(
      `SELECT MIN(submitted_at) AS t FROM (
         SELECT submitted_at FROM pending_events WHERE status = 'pending'
         UNION ALL
         SELECT submitted_at FROM pending_signups WHERE status = 'pending')`
    ),
    db.prepare(
      `SELECT date, title FROM events WHERE published = 1 AND date < date('now', '-60 days') ORDER BY date`
    ),
    db.prepare(
      `SELECT date, title, COUNT(*) AS n FROM events WHERE published = 1 GROUP BY date, title HAVING n > 1`
    ),
    db.prepare(
      `SELECT date, title FROM events WHERE published = 1 AND date NOT GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'`
    ),
    db.prepare(
      `SELECT MAX(submitted_at) AS t FROM (
         SELECT submitted_at FROM pending_events
         UNION ALL
         SELECT submitted_at FROM pending_signups)`
    ),
  ]);

  const pendRow = pend.results[0] as { ev: number; su: number };
  const oldestT = (oldest.results[0] as { t: string | null }).t;
  const lastT = (lastIntake.results[0] as { t: string | null }).t;

  const oldestPendingHours = oldestT ? Math.round((now - new Date(oldestT).getTime()) / 3600_000) : null;
  const daysSinceLastIntake = lastT ? Math.round((now - new Date(lastT).getTime()) / 86400_000) : null;

  const fmt = (r: Record<string, unknown>) => `${r.date} — ${r.title}`;
  const report: StewardReport = {
    generatedAt: new Date().toISOString(),
    pendingEvents: pendRow.ev,
    pendingSignups: pendRow.su,
    oldestPendingHours,
    overdue: oldestPendingHours !== null && oldestPendingHours > 48,
    staleEvents: (stale.results as Record<string, unknown>[]).map(fmt),
    duplicateEvents: (dupes.results as Record<string, unknown>[]).map(fmt),
    badDates: (bad.results as Record<string, unknown>[]).map(fmt),
    daysSinceLastIntake,
    // null = the queues have never seen a submission; don't cry wolf before
    // the forms have ever been live.
    intakeWarning: daysSinceLastIntake !== null && daysSinceLastIntake > 14,
    allQuiet: false,
  };
  report.allQuiet =
    report.pendingEvents === 0 &&
    report.pendingSignups === 0 &&
    report.staleEvents.length === 0 &&
    report.duplicateEvents.length === 0 &&
    report.badDates.length === 0 &&
    !report.intakeWarning;
  return report;
}

function reportHtml(r: StewardReport): string {
  const li = (items: string[]) => items.map((i) => `<li>${i}</li>`).join("");
  const section = (title: string, body: string) => `<h3 style="margin:16px 0 4px">${title}</h3>${body}`;
  const parts: string[] = [];

  parts.push(
    section(
      "Pending queue",
      `<p>${r.pendingEvents} event(s), ${r.pendingSignups} signup(s) waiting.` +
        (r.oldestPendingHours !== null ? ` Oldest has waited <b>${r.oldestPendingHours}h</b>.` : "") +
        (r.overdue
          ? ` <b style="color:#c0392b">Over 48 hours — open <a href="https://admin.floridakimono.com/admin">the Command Center</a> and review.</b>`
          : "") +
        `</p>`
    )
  );
  if (r.staleEvents.length) parts.push(section("Events more than 60 days past (consider unpublishing)", `<ul>${li(r.staleEvents)}</ul>`));
  if (r.duplicateEvents.length) parts.push(section("Duplicate events (same date + title)", `<ul>${li(r.duplicateEvents)}</ul>`));
  if (r.badDates.length) parts.push(section("Events with non-ISO dates (won't show on the calendar grid)", `<ul>${li(r.badDates)}</ul>`));
  parts.push(
    section(
      "Intake health",
      r.daysSinceLastIntake === null
        ? `<p>No submissions have ever arrived. If the forms are live, check the Tally/Formspree webhook URLs and secret.</p>`
        : r.intakeWarning
          ? `<p><b style="color:#c0392b">No new submissions in ${r.daysSinceLastIntake} days.</b> If the forms are supposed to be live, the webhooks may be misconfigured (secret mismatch or URL change) rather than it being a quiet week.</p>`
          : `<p>Last submission ${r.daysSinceLastIntake} day(s) ago. Webhooks look alive.</p>`
    )
  );

  return `<div style="font-family: Georgia, serif; max-width: 620px; margin: 0 auto;">
    <h2>floridakimono.com — daily steward</h2>
    ${r.allQuiet ? "<p><b>All quiet — nothing pending, calendar clean.</b></p>" : parts.join("")}
    <p style="color:#888;font-size:12px;margin-top:24px">Generated ${r.generatedAt} · watch-only: this report never changes the site or emails members.</p>
  </div>`;
}

export async function runSteward(env: Env): Promise<StewardReport> {
  const report = await buildStewardReport(env);
  if (env.ADMIN_EMAIL) {
    const subject = report.allQuiet
      ? "Kimono steward: all quiet"
      : `Kimono steward: ${report.pendingEvents + report.pendingSignups} pending${report.overdue ? " — OVERDUE" : ""}`;
    // A daily email even when quiet doubles as a dead-man's switch: if the
    // reports stop arriving, the cron itself is broken.
    await sendEmail(env, env.ADMIN_EMAIL, subject, reportHtml(report));
  }
  return report;
}

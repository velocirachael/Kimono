// The storage layer. Replaces kimono-admin/lib/github.ts (~250 lines of
// GitHub API calls and events.js string surgery) with plain SQL. The
// "atomic commit" of the old design is now a D1 batch — all statements
// succeed or none do.

import type { ConfirmBatchRequest, EventEntry, PendingEvent, PendingSignup } from "./types";

// "Sep 3, 2026" → "2026-09-03"; ISO passes through; unparseable returns null.
export function toISODate(dateStr: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr + " 00:00:00");
  if (isNaN(d.getTime())) return null;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export async function listEvents(db: D1Database): Promise<EventEntry[]> {
  const { results } = await db
    .prepare("SELECT date, title, host, location, description, link FROM events WHERE published = 1 ORDER BY date ASC")
    .all<EventEntry>();
  return results;
}

function rowToPendingEvent(r: Record<string, unknown>): PendingEvent {
  return {
    id: r.id as string,
    source: "tally",
    submittedAt: r.submitted_at as string,
    status: r.status as PendingEvent["status"],
    date: (r.date as string) ?? "",
    title: (r.title as string) ?? "",
    host: (r.host as string) ?? "",
    location: (r.location as string) ?? "",
    description: (r.description as string) ?? "",
    link: (r.link as string) ?? "",
  };
}

function rowToPendingSignup(r: Record<string, unknown>): PendingSignup {
  return {
    id: r.id as string,
    source: "formspree",
    submittedAt: r.submitted_at as string,
    status: r.status as PendingSignup["status"],
    email: r.email as string,
    name: (r.name as string) || undefined,
    type: r.type as PendingSignup["type"],
  };
}

export async function listPending(db: D1Database): Promise<{ events: PendingEvent[]; signups: PendingSignup[] }> {
  const [ev, su] = await db.batch([
    db.prepare("SELECT * FROM pending_events WHERE status = 'pending' ORDER BY submitted_at ASC"),
    db.prepare("SELECT * FROM pending_signups WHERE status = 'pending' ORDER BY submitted_at ASC"),
  ]);
  return {
    events: (ev.results as Record<string, unknown>[]).map(rowToPendingEvent),
    signups: (su.results as Record<string, unknown>[]).map(rowToPendingSignup),
  };
}

export async function insertPendingEvent(db: D1Database, e: PendingEvent): Promise<void> {
  await db
    .prepare(
      `INSERT OR REPLACE INTO pending_events (id, source, submitted_at, status, date, title, host, location, description, link, raw)
       VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(e.id, e.source, e.submittedAt, e.date, e.title, e.host, e.location, e.description, e.link, JSON.stringify(e.raw ?? null))
    .run();
}

export async function insertPendingSignup(db: D1Database, s: PendingSignup): Promise<void> {
  await db
    .prepare(
      `INSERT OR REPLACE INTO pending_signups (id, source, submitted_at, status, email, name, type, raw)
       VALUES (?, ?, ?, 'pending', ?, ?, ?, ?)`
    )
    .bind(s.id, s.source, s.submittedAt, s.email, s.name ?? null, s.type, JSON.stringify(s.raw ?? null))
    .run();
}

// The old design's "one atomic, syntax-checked commit" becomes one atomic
// D1 batch: publish approved events, mark everything decided. Approved and
// denied rows stay in the pending tables with their final status — a free
// audit trail the JSON files never had.
export async function confirmBatch(db: D1Database, req: ConfirmBatchRequest): Promise<void> {
  const stmts: D1PreparedStatement[] = [];

  for (const e of req.approvedEvents) {
    const iso = toISODate(e.date) ?? e.date; // keep as-is if unparseable; steward will flag it
    stmts.push(
      db
        .prepare("INSERT INTO events (date, title, host, location, description, link) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(iso, e.title, e.host, e.location, e.description, e.link),
      db
        .prepare(
          "UPDATE pending_events SET status = 'approved', date = ?, title = ?, host = ?, location = ?, description = ?, link = ? WHERE id = ?"
        )
        .bind(iso, e.title, e.host, e.location, e.description, e.link, e.id)
    );
  }
  for (const id of req.deniedEventIds) {
    stmts.push(db.prepare("UPDATE pending_events SET status = 'denied' WHERE id = ?").bind(id));
  }
  for (const s of req.approvedSignups) {
    stmts.push(db.prepare("UPDATE pending_signups SET status = 'approved', type = ? WHERE id = ?").bind(s.type, s.id));
  }
  for (const id of req.deniedSignupIds) {
    stmts.push(db.prepare("UPDATE pending_signups SET status = 'denied' WHERE id = ?").bind(id));
  }

  if (stmts.length > 0) await db.batch(stmts);
}

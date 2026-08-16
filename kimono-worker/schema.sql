-- Kimono Command Center — D1 schema
-- Three tables, mirroring kimono-admin/lib/types.ts.
-- Dates are stored ISO ("2026-09-03") and formatted for display at render
-- time — ending the events.js header-comment-vs-reality argument for good.

CREATE TABLE IF NOT EXISTS events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  date        TEXT NOT NULL,            -- ISO 8601: 2026-09-03
  title       TEXT NOT NULL,
  host        TEXT DEFAULT '',
  location    TEXT DEFAULT '',
  description TEXT DEFAULT '',
  link        TEXT DEFAULT '',
  published   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events (date);

CREATE TABLE IF NOT EXISTS pending_events (
  id           TEXT PRIMARY KEY,        -- Tally eventId
  source       TEXT NOT NULL DEFAULT 'tally',
  submitted_at TEXT NOT NULL,           -- ISO timestamp, drives the 48h age check
  status       TEXT NOT NULL DEFAULT 'pending',  -- pending | approved | denied
  date         TEXT DEFAULT '',
  title        TEXT DEFAULT '',
  host         TEXT DEFAULT '',
  location     TEXT DEFAULT '',
  description  TEXT DEFAULT '',
  link         TEXT DEFAULT '',
  raw          TEXT                     -- original webhook payload (JSON), for troubleshooting
);

CREATE TABLE IF NOT EXISTS pending_signups (
  id           TEXT PRIMARY KEY,
  source       TEXT NOT NULL DEFAULT 'formspree',
  submitted_at TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending',  -- pending | approved | denied
  email        TEXT NOT NULL,
  name         TEXT,
  type         TEXT NOT NULL DEFAULT 'welcome',  -- welcome | newsletter | both
  raw          TEXT
);

// Ported from kimono-admin/lib/types.ts — same shapes, now backed by D1
// tables instead of JSON files. Dates are ISO ("2026-09-03") everywhere;
// display formatting happens at render time.

export type EventEntry = {
  date: string; // ISO 8601: "2026-09-03"
  title: string;
  host: string;
  location: string;
  description: string;
  link: string;
};

export type PendingStatus = "pending" | "approved" | "denied";

export type PendingEvent = EventEntry & {
  id: string;
  source: "tally";
  submittedAt: string; // ISO timestamp
  status: PendingStatus;
  raw?: unknown; // original Tally payload, kept for troubleshooting
};

export type SignupType = "welcome" | "newsletter" | "both";

export type PendingSignup = {
  id: string;
  source: "web" | "formspree"; // "web" = posted directly by the site's own signup form
  submittedAt: string;
  email: string;
  name?: string;
  type: SignupType;
  status: PendingStatus;
  raw?: unknown;
};

export type ConfirmBatchRequest = {
  approvedEvents: PendingEvent[];
  deniedEventIds: string[];
  approvedSignups: PendingSignup[];
  deniedSignupIds: string[];
};

export type ConfirmBatchResult = {
  ok: boolean;
  error?: string;
  emailResults?: { email: string; type: SignupType; ok: boolean; error?: string }[];
};

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  // secrets (wrangler secret put)
  WEBHOOK_SECRET: string;
  RESEND_API_KEY: string;
  // plain vars (wrangler.jsonc "vars")
  RESEND_FROM: string;   // e.g. "Florida Kimono Club <hello@floridakimono.com>"
  ADMIN_EMAIL: string;   // where the daily steward report goes
  REQUIRE_ACCESS: string; // "true" in production; "false" only for local dev
  ALLOWED_ORIGINS: string; // comma-separated origins allowed to read /api/events
}

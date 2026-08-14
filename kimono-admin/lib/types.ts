// Shapes match the fields your events.js header comment already documents:
// date, title, host, location, description, link.
//
// NOTE: the events.js header comment says dates should be "YYYY-MM-DD", but
// the live file actually uses "Sep 3, 2026" style strings. This tool writes
// in the format the file actually uses today (human-readable, "Mon D, YYYY")
// since that's what's live. Worth fixing the header comment itself at some
// point so it stops lying to whoever edits the file by hand.

export type EventEntry = {
  date: string; // "Sep 3, 2026"
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
  source: "formspree";
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
  commitSha?: string;
  commitUrl?: string;
  emailResults?: { email: string; type: SignupType; ok: boolean; error?: string }[];
};

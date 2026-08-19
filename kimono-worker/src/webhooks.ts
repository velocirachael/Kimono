// Tally + Formspree webhook handlers, ported from
// kimono-admin/app/api/webhooks/*. The field-matching logic is unchanged;
// only the storage call at the end is different (D1 insert instead of a
// GitHub commit).

import { insertPendingEvent, insertPendingSignup } from "./db";
import type { Env, PendingEvent, PendingSignup, SignupType } from "./types";

export function checkWebhookSecret(url: URL, env: Env): boolean {
  if (!env.WEBHOOK_SECRET) return false; // fail closed
  return url.searchParams.get("secret") === env.WEBHOOK_SECRET;
}

// Tally sends: { eventId, eventType, createdAt, data: { fields: [{ key, label, type, value }, ...] } }
// We match fields by label (case-insensitive, loose) rather than hardcoding
// Tally's field keys, since those keys are regenerated if the form is ever
// rebuilt. Adjust FIELD_MATCHERS if your form's question wording changes.
const FIELD_MATCHERS: Record<"date" | "title" | "host" | "location" | "description" | "link", RegExp> = {
  date: /date/i,
  title: /title|event name/i,
  host: /host|organizer|run(ning)?/i,
  location: /location|city/i,
  description: /description/i,
  link: /link|url|website|listing/i,
};

function extractField(fields: any[], matcher: RegExp): string {
  const field = fields.find((f) => matcher.test(f.label ?? ""));
  if (!field) return "";
  if (Array.isArray(field.value)) return field.value.join(", ");
  return String(field.value ?? "");
}

export async function handleTallyWebhook(req: Request, env: Env): Promise<Response> {
  const body: any = await req.json();
  const fields: any[] = body?.data?.fields ?? [];

  const event: PendingEvent = {
    id: body?.eventId ?? `tally-${Date.now()}`,
    source: "tally",
    submittedAt: body?.createdAt ?? new Date().toISOString(),
    status: "pending",
    date: extractField(fields, FIELD_MATCHERS.date),
    title: extractField(fields, FIELD_MATCHERS.title),
    host: extractField(fields, FIELD_MATCHERS.host),
    location: extractField(fields, FIELD_MATCHERS.location),
    description: extractField(fields, FIELD_MATCHERS.description),
    link: extractField(fields, FIELD_MATCHERS.link),
    raw: body,
  };

  await insertPendingEvent(env.DB, event);
  return Response.json({ ok: true });
}

// Formspree webhook payload is basically your form's fields as flat JSON,
// e.g. { email, name, _form_id, ... }. If Welcome and Newsletter are two
// separate Formspree forms, tell them apart by _form_id (fill in your real
// form IDs below); if it's one form with a checkbox, read that field instead.
const FORMSPREE_FORM_IDS: Record<string, SignupType> = {
  // "abc123": "welcome",
  // "def456": "newsletter",
};

export async function handleFormspreeWebhook(req: Request, env: Env): Promise<Response> {
  const body: any = await req.json();
  const email: string = body?.email ?? "";
  const name: string | undefined = body?.name || undefined;
  const type: SignupType = FORMSPREE_FORM_IDS[body?._form_id] ?? body?.type ?? "welcome";

  if (!email) {
    return Response.json({ error: "no email in payload" }, { status: 400 });
  }

  const signup: PendingSignup = {
    id: `formspree-${Date.now()}-${email}`,
    source: "formspree",
    submittedAt: new Date().toISOString(),
    status: "pending",
    email,
    name,
    type,
    raw: body,
  };

  await insertPendingSignup(env.DB, signup);
  return Response.json({ ok: true });
}

// Formspree's free tier only emails you — forwarding to a webhook needs
// their Pro plan. Instead the site's own signup form posts straight here:
// same effect, no third party, no cost. `website` is a honeypot field the
// form keeps visually hidden; a filled-in value means a bot filled every
// field it could find, so we accept the request but silently drop it.
export async function handleDirectSignup(req: Request, env: Env, corsHeaders: HeadersInit): Promise<Response> {
  const body: any = await req.json().catch(() => ({}));

  if (body?.website) {
    return Response.json({ ok: true }, { headers: corsHeaders });
  }

  const email: string = (body?.email ?? "").trim();
  const name: string | undefined = (body?.name ?? "").trim() || undefined;

  if (!email) {
    return Response.json({ error: "Please enter your email." }, { status: 400, headers: corsHeaders });
  }

  const signup: PendingSignup = {
    id: `web-${Date.now()}-${email}`,
    source: "web",
    submittedAt: new Date().toISOString(),
    status: "pending",
    email,
    name,
    type: "both", // one unified "join the list" form; admin can narrow this at approval time
    raw: body,
  };

  await insertPendingSignup(env.DB, signup);
  return Response.json({ ok: true }, { headers: corsHeaders });
}

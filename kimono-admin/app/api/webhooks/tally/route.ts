import { NextRequest, NextResponse } from "next/server";
import { checkWebhookSecret } from "@/lib/auth";
import { appendPendingEvent } from "@/lib/github";
import type { PendingEvent } from "@/lib/types";

// Tally sends: { eventId, eventType, createdAt, data: { fields: [{ key, label, type, value }, ...] } }
// We match fields by label (case-insensitive, loose) rather than hardcoding
// Tally's field keys, since those keys are regenerated if the form is ever
// rebuilt. Adjust FIELD_MATCHERS if your form's question wording changes.
const FIELD_MATCHERS: Record<keyof Pick<PendingEvent, "date" | "title" | "host" | "location" | "description" | "link">, RegExp> = {
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

export async function POST(req: NextRequest) {
  if (!checkWebhookSecret(req)) {
    return NextResponse.json({ error: "invalid or missing secret" }, { status: 401 });
  }

  const body = await req.json();
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

  try {
    await appendPendingEvent(event);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

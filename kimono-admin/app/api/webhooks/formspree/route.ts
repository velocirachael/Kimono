import { NextRequest, NextResponse } from "next/server";
import { checkWebhookSecret } from "@/lib/auth";
import { appendPendingSignup } from "@/lib/github";
import type { PendingSignup, SignupType } from "@/lib/types";

// Formspree webhook payload is basically your form's fields as flat JSON,
// e.g. { email, name, _form_id, ... }. If Welcome and Newsletter are two
// separate Formspree forms, tell them apart by _form_id (fill in your real
// form IDs below); if it's one form with a checkbox, read that field instead.
const TALLY_FORM_IDS: Record<string, SignupType> = {
  // "abc123": "welcome",
  // "def456": "newsletter",
};

export async function POST(req: NextRequest) {
  if (!checkWebhookSecret(req)) {
    return NextResponse.json({ error: "invalid or missing secret" }, { status: 401 });
  }

  const body = await req.json();
  const email: string = body?.email ?? "";
  const name: string | undefined = body?.name || undefined;
  const type: SignupType = TALLY_FORM_IDS[body?._form_id] ?? body?.type ?? "welcome";

  if (!email) {
    return NextResponse.json({ error: "no email in payload" }, { status: 400 });
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

  try {
    await appendPendingSignup(signup);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

// Ported from kimono-admin/lib/resend.ts. The SDK is replaced with a plain
// fetch to Resend's REST API — no dependency needed in a Worker. Templates
// stay version-controlled here, same as before.

import type { Env, SignupType } from "./types";

// Placeholder copy — swap in your real Welcome Letter / Newsletter content.
function welcomeLetterHtml(name?: string) {
  return `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto;">
      <h1>Welcome to the Florida Kimono Club${name ? `, ${name}` : ""}!</h1>
      <p>Thanks for joining us. Replace this placeholder with the real Welcome Letter copy.</p>
    </div>
  `;
}

function newsletterConfirmHtml(name?: string) {
  return `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto;">
      <h1>You're on the list${name ? `, ${name}` : ""}!</h1>
      <p>You'll get our next newsletter with upcoming events and news.</p>
    </div>
  `;
}

export async function sendEmail(
  env: Env,
  to: string,
  subject: string,
  html: string
): Promise<{ ok: boolean; error?: string }> {
  if (!env.RESEND_FROM) return { ok: false, error: "RESEND_FROM not configured" };
  if (!env.RESEND_API_KEY) return { ok: false, error: "RESEND_API_KEY not configured" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: env.RESEND_FROM, to, subject, html }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Resend ${res.status}: ${body.slice(0, 300)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function sendSignupEmail(
  env: Env,
  email: string,
  name: string | undefined,
  type: SignupType
): Promise<{ ok: boolean; error?: string }> {
  if (type === "welcome" || type === "both") {
    const r = await sendEmail(env, email, "Welcome to the Florida Kimono Club", welcomeLetterHtml(name));
    if (!r.ok) return r;
  }
  if (type === "newsletter" || type === "both") {
    const r = await sendEmail(env, email, "You're subscribed — Florida Kimono Club Newsletter", newsletterConfirmHtml(name));
    if (!r.ok) return r;
  }
  return { ok: true };
}

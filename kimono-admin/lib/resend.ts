import { Resend } from "resend";
import type { SignupType } from "./types";

// Instantiated lazily, not at module load — constructing this eagerly threw
// during `next build` (and would throw on any cold start) whenever
// RESEND_API_KEY isn't set yet, which broke the build itself before the
// route ever ran.
function getResendClient(): Resend {
  return new Resend(process.env.RESEND_API_KEY);
}

// Placeholder copy — swap in your real Welcome Letter / Newsletter content.
// Keeping templates here (not in Resend's dashboard) means they're
// version-controlled with everything else, but you can move to Resend's
// template builder later without changing any calling code.
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

export async function sendSignupEmail(
  email: string,
  name: string | undefined,
  type: SignupType
): Promise<{ ok: boolean; error?: string }> {
  const from = process.env.RESEND_FROM;
  if (!from) return { ok: false, error: "RESEND_FROM not configured" };
  if (!process.env.RESEND_API_KEY) return { ok: false, error: "RESEND_API_KEY not configured" };

  const resend = getResendClient();

  try {
    if (type === "welcome" || type === "both") {
      await resend.emails.send({
        from,
        to: email,
        subject: "Welcome to the Florida Kimono Club",
        html: welcomeLetterHtml(name),
      });
    }
    if (type === "newsletter" || type === "both") {
      await resend.emails.send({
        from,
        to: email,
        subject: "You're subscribed — Florida Kimono Club Newsletter",
        html: newsletterConfirmHtml(name),
      });
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

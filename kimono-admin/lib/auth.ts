import { NextRequest, NextResponse } from "next/server";

/**
 * HTTP Basic Auth gate for /admin and the mutating API routes.
 * The two public webhook routes do NOT use this — they check WEBHOOK_SECRET
 * instead, since Tally/Formspree can't send a Basic Auth header.
 */
export function requireBasicAuth(req: NextRequest): NextResponse | null {
  const user = process.env.ADMIN_USERNAME;
  const pass = process.env.ADMIN_PASSWORD;

  if (!user || !pass) {
    // Fail closed: if you forgot to set the env vars, block everything
    // instead of quietly leaving the admin tool open to the internet.
    return new NextResponse("Admin auth is not configured.", { status: 500 });
  }

  const header = req.headers.get("authorization");
  if (!header || !header.startsWith("Basic ")) {
    return new NextResponse("Auth required.", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="kimono-admin"' },
    });
  }

  const decoded = Buffer.from(header.slice(6), "base64").toString("utf-8");
  const sepIndex = decoded.indexOf(":");
  const suppliedUser = decoded.slice(0, sepIndex);
  const suppliedPass = decoded.slice(sepIndex + 1);

  if (suppliedUser !== user || suppliedPass !== pass) {
    return new NextResponse("Invalid credentials.", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="kimono-admin"' },
    });
  }

  return null; // authorized, nothing to return
}

export function checkWebhookSecret(req: NextRequest): boolean {
  const expected = process.env.WEBHOOK_SECRET;
  if (!expected) return false; // fail closed
  const provided = req.nextUrl.searchParams.get("secret");
  return provided === expected;
}

import { NextRequest, NextResponse } from "next/server";
import { requireBasicAuth } from "./lib/auth";

// Gate the admin UI and the two mutating/read API routes with Basic Auth.
// The webhook intake routes are intentionally excluded — they check
// WEBHOOK_SECRET themselves, since Tally/Formspree can't send Basic Auth.
export function middleware(req: NextRequest) {
  const denied = requireBasicAuth(req);
  if (denied) return denied;
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/pending/:path*", "/api/confirm-batch/:path*"],
};

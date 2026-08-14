import { NextRequest, NextResponse } from "next/server";
import { buildUpdatedEventsJs, commitFiles, getFileText, getPendingEvents, getPendingSignups } from "@/lib/github";
import { sendSignupEmail } from "@/lib/resend";
import type { ConfirmBatchRequest, ConfirmBatchResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body: ConfirmBatchRequest = await req.json();
  const { approvedEvents, deniedEventIds, approvedSignups, deniedSignupIds } = body;

  try {
    // --- 1. Build the new events.js. Throws (nothing written yet) if the
    //        result wouldn't be valid JS. ---
    const currentEventsJs = await getFileText(process.env.GITHUB_EVENTS_PATH || "events.js");
    const newEventsJs = buildUpdatedEventsJs(currentEventsJs, approvedEvents);

    // --- 2. Drop approved + denied items out of both pending queues. ---
    const handledEventIds = new Set([...approvedEvents.map((e) => e.id), ...deniedEventIds]);
    const handledSignupIds = new Set([...approvedSignups.map((s) => s.id), ...deniedSignupIds]);

    const [currentPendingEvents, currentPendingSignups] = await Promise.all([getPendingEvents(), getPendingSignups()]);
    const remainingEvents = currentPendingEvents.filter((e) => !handledEventIds.has(e.id));
    const remainingSignups = currentPendingSignups.filter((s) => !handledSignupIds.has(s.id));

    // --- 3. One atomic commit for all three files. All-or-nothing. ---
    const commit = await commitFiles(
      [
        { path: process.env.GITHUB_EVENTS_PATH || "events.js", content: newEventsJs },
        { path: process.env.GITHUB_PENDING_EVENTS_PATH!, content: JSON.stringify(remainingEvents, null, 2) },
        { path: process.env.GITHUB_PENDING_SIGNUPS_PATH!, content: JSON.stringify(remainingSignups, null, 2) },
      ],
      `Admin: approve ${approvedEvents.length} event(s), ${approvedSignups.length} signup(s); deny ${deniedEventIds.length + deniedSignupIds.length}`
    );

    // --- 4. Emails fire AFTER the commit succeeds, and their failure
    //        doesn't roll back the site update — you'll just see which
    //        ones failed and can resend by hand. ---
    const emailResults = await Promise.all(
      approvedSignups.map(async (s) => {
        const result = await sendSignupEmail(s.email, s.name, s.type);
        return { email: s.email, type: s.type, ok: result.ok, error: result.error };
      })
    );

    const result: ConfirmBatchResult = { ok: true, commitSha: commit.sha, commitUrl: commit.url, emailResults };
    return NextResponse.json(result);
  } catch (err) {
    const result: ConfirmBatchResult = { ok: false, error: err instanceof Error ? err.message : String(err) };
    return NextResponse.json(result, { status: 400 });
  }
}

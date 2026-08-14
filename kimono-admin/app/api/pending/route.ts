import { NextResponse } from "next/server";
import { getPendingEvents, getPendingSignups } from "@/lib/github";

export async function GET() {
  try {
    const [events, signups] = await Promise.all([getPendingEvents(), getPendingSignups()]);
    return NextResponse.json({ events, signups });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

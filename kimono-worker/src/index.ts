// Kimono Command Center — one Worker, five routes, one cron.
//
//   POST /api/webhooks/tally?secret=…      Tally event submissions → pending queue
//   POST /api/webhooks/formspree?secret=…  Formspree signups → pending queue
//   GET  /api/events                       public calendar JSON (CORS + edge cache)
//   GET  /api/pending                      admin: both pending queues
//   POST /api/confirm-batch                admin: the one human CONFIRM
//   GET  /api/steward                      admin: run the daily report on demand
//   scheduled()                            daily steward → email report
//
// The admin GUI is served from ./public as static assets on the same origin.
//
// AUTH MODEL — read this before deploying:
// • Webhook routes are locked by ?secret= (WEBHOOK_SECRET), same as before.
// • /api/events is public (it's the public calendar).
// • Everything else is locked by Cloudflare Access at the edge: Access
//   authenticates you BEFORE the request reaches this Worker. The Worker
//   double-checks that Access headers are present and fails closed if
//   they're missing — so a misconfigured deploy blocks instead of exposing.
//   Set REQUIRE_ACCESS="false" only in .dev.vars for local development.

import { confirmBatch, listEvents, listPending, toISODate } from "./db";
import { sendSignupEmail } from "./resend";
import { runSteward, buildStewardReport } from "./steward";
import { checkWebhookSecret, handleDirectSignup, handleFormspreeWebhook, handleTallyWebhook } from "./webhooks";
import type { ConfirmBatchRequest, ConfirmBatchResult, Env } from "./types";

function corsHeaders(req: Request, env: Env): HeadersInit {
  const allowed = (env.ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const origin = req.headers.get("Origin") ?? "";
  if (allowed.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      Vary: "Origin",
    };
  }
  return {};
}

// Access injects these after it authenticates the user at the edge. If
// they're absent, either Access isn't set up yet or someone found a path
// around it — refuse both.
function requireAccess(req: Request, env: Env): Response | null {
  if (env.REQUIRE_ACCESS === "false") return null; // local dev only
  const jwt = req.headers.get("Cf-Access-Jwt-Assertion");
  if (!jwt) {
    return Response.json(
      { error: "Not authenticated. This route must sit behind Cloudflare Access — see README, step 7." },
      { status: 403 }
    );
  }
  return null;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const { pathname } = url;

    // --- webhooks (secret-locked, must be bypassed in Access) ---
    if (pathname === "/api/webhooks/tally" && req.method === "POST") {
      if (!checkWebhookSecret(url, env)) return Response.json({ error: "invalid or missing secret" }, { status: 401 });
      return handleTallyWebhook(req, env);
    }
    if (pathname === "/api/webhooks/formspree" && req.method === "POST") {
      if (!checkWebhookSecret(url, env)) return Response.json({ error: "invalid or missing secret" }, { status: 401 });
      return handleFormspreeWebhook(req, env);
    }

    // --- public calendar (CORS for floridakimono.com, cached at the edge) ---
    if (pathname === "/api/events" && (req.method === "GET" || req.method === "OPTIONS")) {
      const cors = corsHeaders(req, env);
      if (req.method === "OPTIONS") return new Response(null, { headers: cors });
      const events = await listEvents(env.DB);
      return Response.json(events, {
        headers: { ...cors, "Cache-Control": "public, max-age=300" },
      });
    }

    // --- direct signup (replaces Formspree — their free tier won't forward
    //     webhooks, only email; this is the free, no-third-party version) ---
    if (pathname === "/api/signup" && (req.method === "POST" || req.method === "OPTIONS")) {
      const cors = corsHeaders(req, env);
      if (req.method === "OPTIONS") return new Response(null, { headers: cors });
      return handleDirectSignup(req, env, cors);
    }

    // --- admin API (Access-locked) ---
    if (pathname === "/api/pending" && req.method === "GET") {
      const denied = requireAccess(req, env);
      if (denied) return denied;
      try {
        const { events, signups } = await listPending(env.DB);
        return Response.json({ events, signups });
      } catch (err) {
        return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
      }
    }

    if (pathname === "/api/confirm-batch" && req.method === "POST") {
      const denied = requireAccess(req, env);
      if (denied) return denied;
      const body: ConfirmBatchRequest = await req.json();
      try {
        // Normalize dates before they hit the events table; warn later via
        // the steward if anything slips through unparseable.
        for (const e of body.approvedEvents) {
          const iso = toISODate(e.date);
          if (iso) e.date = iso;
        }

        // --- 1. One atomic D1 batch: publish events, mark decisions. ---
        await confirmBatch(env.DB, body);

        // --- 2. Emails fire AFTER the batch succeeds, and their failure
        //        doesn't roll back the site update — you'll see which ones
        //        failed and can resend by hand. ---
        const emailResults = await Promise.all(
          body.approvedSignups.map(async (s) => {
            const result = await sendSignupEmail(env, s.email, s.name, s.type);
            return { email: s.email, type: s.type, ok: result.ok, error: result.error };
          })
        );

        const result: ConfirmBatchResult = { ok: true, emailResults };
        return Response.json(result);
      } catch (err) {
        const result: ConfirmBatchResult = { ok: false, error: err instanceof Error ? err.message : String(err) };
        return Response.json(result, { status: 400 });
      }
    }

    if (pathname === "/api/steward" && req.method === "GET") {
      const denied = requireAccess(req, env);
      if (denied) return denied;
      // ?email=1 also sends the report, exactly as the cron would.
      if (url.searchParams.get("email") === "1") return Response.json(await runSteward(env));
      return Response.json(await buildStewardReport(env));
    }

    return Response.json({ error: "not found" }, { status: 404 });
  },

  // Daily steward — schedule configured in wrangler.jsonc (UTC).
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(runSteward(env));
  },
} satisfies ExportedHandler<Env>;

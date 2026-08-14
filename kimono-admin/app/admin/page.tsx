"use client";

import { useEffect, useState } from "react";
import type { ConfirmBatchResult, PendingEvent, PendingSignup, SignupType } from "@/lib/types";

type Screen = "loading" | "error" | "queue" | "confirm" | "done";

// Other sidebar destinations from the Command Center mockup (Calendar,
// Organizers & Venues, Subscribers-as-its-own-page, Settings) aren't built
// yet — they're real product decisions (an organizer safelist, a live
// calendar view, etc.) that need scoping before writing code, not something
// to guess at silently. Shown here as inert placeholders so the shell
// matches the design; wire them up once scope's confirmed. Dots preview the
// section-color scheme (pink = Calendar & Events, purple = Letter /
// Subscribers, yellow = Organizers & Venues, teal = Settings) so it's
// legible even before those pages exist.
const NAV = [
  { label: "Approvals", active: true, dot: null },
  { label: "Calendar", active: false, dot: "var(--pop-pink)" },
  { label: "Organizers & Venues", active: false, dot: "var(--pop-yellow)" },
  { label: "Subscribers", active: false, dot: "var(--pop-purple)" },
  { label: "Settings", active: false, dot: "var(--pop-teal)" },
];

export default function AdminPage() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [error, setError] = useState<string>("");
  const [events, setEvents] = useState<PendingEvent[]>([]);
  const [signups, setSignups] = useState<PendingSignup[]>([]);
  const [result, setResult] = useState<ConfirmBatchResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/pending")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setEvents(data.events.filter((e: PendingEvent) => e.status === "pending"));
        setSignups(data.signups.filter((s: PendingSignup) => s.status === "pending"));
        setScreen("queue");
      })
      .catch((err) => {
        setError(String(err));
        setScreen("error");
      });
  }, []);

  function updateEvent(id: string, patch: Partial<PendingEvent>) {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function updateSignup(id: string, patch: Partial<PendingSignup>) {
    setSignups((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  const approvedEvents = events.filter((e) => e.status === "approved");
  const deniedEvents = events.filter((e) => e.status === "denied");
  const approvedSignups = signups.filter((s) => s.status === "approved");
  const deniedSignups = signups.filter((s) => s.status === "denied");
  const pendingReviewCount = [...events, ...signups].filter((x) => x.status === "pending").length;

  async function submitConfirm() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/confirm-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvedEvents,
          deniedEventIds: deniedEvents.map((e) => e.id),
          approvedSignups,
          deniedSignupIds: deniedSignups.map((s) => s.id),
        }),
      });
      const data: ConfirmBatchResult = await res.json();
      setResult(data);
      setScreen("done");
    } catch (err) {
      setResult({ ok: false, error: String(err) });
      setScreen("done");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="shell">
      <nav className="side">
        <div className="brand">
          Florida Kimono
          <br />
          Club — Command
        </div>
        {NAV.map((n) => (
          <a key={n.label} className={`navlink ${n.active ? "active" : "disabled"}`} href="#" onClick={(e) => e.preventDefault()}>
            {n.dot && <span className="dot" style={{ background: n.dot }} />}
            {n.label}
          </a>
        ))}
      </nav>

      <main className="main">
        {screen === "loading" && <p>Loading pending submissions…</p>}
        {screen === "error" && <p>Failed to load: {error}</p>}

        {screen !== "loading" && screen !== "error" && (
          <>
            <div className="pagehead">
              <h1>Approvals</h1>
              <p>New event and signup submissions, waiting on a decision.</p>
            </div>

            {screen === "queue" && (
              <>
                <div className="stats">
                  <Stat n={pendingReviewCount} label="Pending review" colorClass="c-pink" />
                  <Stat n={approvedEvents.length} label="Approved this session" colorClass="c-teal" />
                  <Stat n={approvedSignups.length} label="Signups this session" colorClass="c-purple" />
                  <Stat n={deniedEvents.length + deniedSignups.length} label="Denied this session" colorClass="c-yellow" />
                </div>

                <section className="panel panel-pink">
                  <div className="panelhead">
                    <h2>Pending events</h2>
                    <span className="sub">Via Tally form</span>
                  </div>
                  {events.length === 0 && <p style={{ color: "var(--color-neutral-600)" }}>Nothing pending.</p>}
                  {events.map((e) => (
                    <EventRow key={e.id} event={e} onChange={(patch) => updateEvent(e.id, patch)} />
                  ))}
                </section>

                <section className="panel panel-purple">
                  <div className="panelhead">
                    <h2>Pending signups</h2>
                    <span className="sub">Via Formspree</span>
                  </div>
                  {signups.length === 0 && <p style={{ color: "var(--color-neutral-600)" }}>Nothing pending.</p>}
                  {signups.map((s) => (
                    <SignupRow key={s.id} signup={s} onChange={(patch) => updateSignup(s.id, patch)} />
                  ))}
                </section>

                <div className="actions">
                  <button
                    className="btn btn-primary"
                    disabled={approvedEvents.length + deniedEvents.length + approvedSignups.length + deniedSignups.length === 0}
                    onClick={() => setScreen("confirm")}
                  >
                    Review &amp; confirm ({approvedEvents.length + approvedSignups.length} approved)
                  </button>
                  {pendingReviewCount > 0 && (
                    <span style={{ alignSelf: "center", color: "var(--color-neutral-600)", fontSize: 13 }}>
                      {pendingReviewCount} still undecided
                    </span>
                  )}
                </div>
              </>
            )}

            {screen === "confirm" && (
              <section className="panel">
                <div className="panelhead">
                  <h2>Confirm changes</h2>
                  <span className="sub">One commit, all at once</span>
                </div>
                <p style={{ color: "var(--color-neutral-700)" }}>
                  {approvedEvents.length} event(s) and {approvedSignups.length} signup(s) approved.{" "}
                  {deniedEvents.length + deniedSignups.length} denied — nothing happens to those.
                </p>

                <h3>Events going live</h3>
                {approvedEvents.length === 0 && <p style={{ color: "var(--color-neutral-600)" }}>None.</p>}
                {approvedEvents.map((e) => (
                  <div key={e.id} className="approval-row event-approved">
                    <h3>{e.title}</h3>
                    <div className="meta">
                      <span className="tag tag-pink">{e.date}</span>
                      <span className="tag tag-outline">
                        {e.host} · {e.location}
                      </span>
                    </div>
                  </div>
                ))}

                <h3>Signups going out</h3>
                {approvedSignups.length === 0 && <p style={{ color: "var(--color-neutral-600)" }}>None.</p>}
                {approvedSignups.map((s) => (
                  <div key={s.id} className="approval-row signup-approved">
                    <span>{s.email}</span>
                    <span className="tag tag-purple">{s.type}</span>
                  </div>
                ))}

                <div className="actions">
                  <button className="btn btn-secondary" onClick={() => setScreen("queue")} disabled={submitting}>
                    ← Back to queue
                  </button>
                  <button className="btn btn-primary" onClick={submitConfirm} disabled={submitting}>
                    {submitting ? "Pushing…" : "CONFIRM — push to live site"}
                  </button>
                </div>
              </section>
            )}

            {screen === "done" && (
              <section className="panel">
                <div className="panelhead">
                  <h2>{result?.ok ? "Done" : "Something went wrong"}</h2>
                </div>
                {result?.ok ? (
                  <>
                    <p>
                      Committed —{" "}
                      <a href={result.commitUrl} target="_blank" rel="noreferrer">
                        view on GitHub
                      </a>
                    </p>
                    {result.emailResults && result.emailResults.length > 0 && (
                      <>
                        <h3>Emails</h3>
                        {result.emailResults.map((r, i) => (
                          <div key={i} className="approval-row">
                            {r.email} ({r.type}) — {r.ok ? "sent" : `failed: ${r.error}`}
                          </div>
                        ))}
                      </>
                    )}
                  </>
                ) : (
                  <p style={{ color: "#a33" }}>Nothing was pushed. Error: {result?.error}</p>
                )}
                <div className="actions">
                  <button className="btn btn-primary" onClick={() => window.location.reload()}>
                    Back to queue
                  </button>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ n, label, colorClass }: { n: number; label: string; colorClass: string }) {
  return (
    <div className={`stat ${colorClass}`}>
      <div className="n">{n}</div>
      <div className="l">{label}</div>
    </div>
  );
}

function EventRow({ event, onChange }: { event: PendingEvent; onChange: (patch: Partial<PendingEvent>) => void }) {
  const fields: (keyof PendingEvent)[] = ["date", "title", "host", "location", "link"];
  return (
    <div className={`approval-row ${event.status === "approved" ? "event-approved" : event.status === "denied" ? "denied" : ""}`}>
      <div className="fields">
        {fields.map((f) => (
          <input
            key={f}
            className="input"
            value={event[f] as string}
            placeholder={f}
            onChange={(ev) => onChange({ [f]: ev.target.value } as Partial<PendingEvent>)}
          />
        ))}
        <textarea
          className="input"
          value={event.description}
          placeholder="description"
          onChange={(ev) => onChange({ description: ev.target.value })}
        />
      </div>
      <DecisionButtons status={event.status} onApprove={() => onChange({ status: "approved" })} onDeny={() => onChange({ status: "denied" })} />
    </div>
  );
}

function SignupRow({ signup, onChange }: { signup: PendingSignup; onChange: (patch: Partial<PendingSignup>) => void }) {
  return (
    <div className={`approval-row ${signup.status === "approved" ? "signup-approved" : signup.status === "denied" ? "denied" : ""}`}>
      <div>
        {signup.email} {signup.name ? `(${signup.name})` : ""}
      </div>
      <select className="input" value={signup.type} onChange={(ev) => onChange({ type: ev.target.value as SignupType })}>
        <option value="welcome">Welcome Letter</option>
        <option value="newsletter">Newsletter</option>
        <option value="both">Both</option>
      </select>
      <DecisionButtons status={signup.status} onApprove={() => onChange({ status: "approved" })} onDeny={() => onChange({ status: "denied" })} />
    </div>
  );
}

function DecisionButtons({ status, onApprove, onDeny }: { status: string; onApprove: () => void; onDeny: () => void }) {
  return (
    <div className="actions">
      <button className={status === "approved" ? "btn btn-primary" : "btn btn-secondary"} onClick={onApprove}>
        Approve
      </button>
      <button className={status === "denied" ? "btn btn-danger" : "btn btn-secondary"} onClick={onDeny}>
        Deny
      </button>
    </div>
  );
}

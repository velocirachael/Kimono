import type { EventEntry, PendingEvent, PendingSignup } from "./types";

const API = "https://api.github.com";

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function ghHeaders() {
  return {
    Authorization: `Bearer ${env("GITHUB_TOKEN")}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function repoBase() {
  return `${API}/repos/${env("GITHUB_OWNER")}/${env("GITHUB_REPO")}`;
}

async function gh(path: string, init?: RequestInit) {
  const res = await fetch(`${repoBase()}${path}`, {
    ...init,
    headers: { ...ghHeaders(), ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`GitHub API ${init?.method || "GET"} ${path} failed: ${res.status} ${body}`);
  }
  return res;
}

/** Reads a file's raw text + blob sha. Returns nulls if the file doesn't exist yet. */
async function getFileRaw(path: string): Promise<{ content: string; sha: string } | { content: null; sha: null }> {
  const branch = env("GITHUB_BRANCH");
  const res = await fetch(`${repoBase()}/contents/${path}?ref=${branch}`, { headers: ghHeaders() });
  if (res.status === 404) return { content: null, sha: null };
  if (!res.ok) throw new Error(`GitHub read of ${path} failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  const content = Buffer.from(json.content, "base64").toString("utf-8");
  return { content, sha: json.sha };
}

async function getJsonFile<T>(path: string, fallback: T): Promise<T> {
  const { content } = await getFileRaw(path);
  if (content === null) return fallback;
  try {
    return JSON.parse(content) as T;
  } catch {
    throw new Error(`${path} exists but is not valid JSON — fix it manually before continuing.`);
  }
}

export async function getPendingEvents(): Promise<PendingEvent[]> {
  return getJsonFile<PendingEvent[]>(env("GITHUB_PENDING_EVENTS_PATH"), []);
}

export async function getPendingSignups(): Promise<PendingSignup[]> {
  return getJsonFile<PendingSignup[]>(env("GITHUB_PENDING_SIGNUPS_PATH"), []);
}

/**
 * Single-file write via the Contents API. Used only by the two webhook
 * intake routes to append one new pending item — low stakes (it's just
 * queueing, not touching the live site), so a simple one-file commit is
 * fine here.
 */
async function putFile(path: string, content: string, message: string) {
  const { sha } = await getFileRaw(path);
  await gh(`/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf-8").toString("base64"),
      branch: env("GITHUB_BRANCH"),
      ...(sha ? { sha } : {}),
    }),
  });
}

export async function appendPendingEvent(event: PendingEvent) {
  const current = await getPendingEvents();
  current.push(event);
  await putFile(env("GITHUB_PENDING_EVENTS_PATH"), JSON.stringify(current, null, 2), `Queue event submission: ${event.title}`);
}

export async function appendPendingSignup(signup: PendingSignup) {
  const current = await getPendingSignups();
  current.push(signup);
  await putFile(env("GITHUB_PENDING_SIGNUPS_PATH"), JSON.stringify(current, null, 2), `Queue signup: ${signup.email}`);
}

// ---------------------------------------------------------------------------
// events.js serialization
//
// Design choice: rather than text-splicing new entries into the file (fast
// to write, but fragile if hand-edited formatting ever drifts from what a
// splicer expects), this reads the WHOLE existing EVENTS array, merges in
// the newly-approved entries, sorts by date, and regenerates the array from
// scratch with consistent formatting. The header comment and anything after
// the array declaration is left untouched.
//
// Every string field goes through JSON.stringify, which is also a security
// boundary: Tally submissions are public-form input, and JSON.stringify
// guarantees a title/description containing quotes, backslashes, or
// newlines can never break out of its string literal and corrupt the file
// or inject code. This is what actually fixes the "multi-line description
// breaks the whole file" failure mode called out in the header comment.
//
// Tradeoff: the generated commit rewrites the whole array, so the diff
// touches every existing entry, not just the new ones. Fine for a file this
// size; flag if that gets annoying to review.
// ---------------------------------------------------------------------------

function serializeEvent(e: EventEntry): string {
  return [
    "  {",
    `    date: ${JSON.stringify(e.date)},`,
    `    title: ${JSON.stringify(e.title)},`,
    `    host: ${JSON.stringify(e.host)},`,
    `    location: ${JSON.stringify(e.location)},`,
    `    description: ${JSON.stringify(e.description)},`,
    `    link: ${JSON.stringify(e.link)}`,
    "  }",
  ].join("\n");
}

function serializeEvents(events: EventEntry[]): string {
  if (events.length === 0) return "[]";
  return "[\n" + events.map(serializeEvent).join(",\n") + "\n]";
}

function parseExistingEvents(source: string): { before: string; after: string; events: EventEntry[] } {
  const match = source.match(/const\s+EVENTS\s*=\s*(\[[\s\S]*\]);/);
  if (!match) {
    throw new Error(
      "Couldn't find `const EVENTS = [...]` in events.js — the file's structure changed and the parser needs updating before it's safe to write."
    );
  }
  const before = source.slice(0, match.index);
  const after = source.slice((match.index ?? 0) + match[0].length);

  let events: EventEntry[];
  try {
    // Trusted input: this is the file we just read back from our own repo,
    // not attacker-controlled — safe to evaluate as a plain data literal.
    // eslint-disable-next-line no-new-func
    events = new Function(`"use strict"; return (${match[1]});`)();
  } catch (err) {
    throw new Error(`events.js's EVENTS array doesn't parse as valid JS — fix it by hand first. (${err})`);
  }
  return { before, after, events };
}

function sortByDate(events: EventEntry[]): EventEntry[] {
  return [...events].sort((a, b) => {
    const ta = new Date(a.date).getTime();
    const tb = new Date(b.date).getTime();
    if (isNaN(ta) || isNaN(tb)) return 0; // don't reorder things we can't parse
    return ta - tb;
  });
}

/** Throws if `source` isn't syntactically valid JS — the pre-commit safety check. */
function assertValidJs(source: string) {
  try {
    // eslint-disable-next-line no-new-func
    new Function(source);
  } catch (err) {
    throw new Error(`Generated events.js failed a syntax check — nothing was committed. (${err})`);
  }
}

/**
 * Builds the new events.js content given the current file text and the
 * newly-approved entries. Throws (without writing anything) if the result
 * wouldn't be valid JS.
 */
export function buildUpdatedEventsJs(currentSource: string, newEntries: EventEntry[]): string {
  const { before, after, events } = parseExistingEvents(currentSource);
  const merged = sortByDate([...events, ...newEntries]);
  const newSource = `${before}const EVENTS = ${serializeEvents(merged)};${after}`;
  assertValidJs(newSource);
  return newSource;
}

// ---------------------------------------------------------------------------
// Atomic multi-file commit (Git Data API)
//
// The confirm-batch action needs to update events.js AND both pending-*.json
// files together. Doing that as separate Contents API PUTs would create two
// (or three) commits — if the second one failed, you'd be left with events.js
// updated but the queue still showing those items as pending. This bundles
// every file change into ONE commit, so it's all-or-nothing.
// ---------------------------------------------------------------------------

export async function commitFiles(
  files: { path: string; content: string }[],
  message: string
): Promise<{ sha: string; url: string }> {
  const branch = env("GITHUB_BRANCH");

  const refRes = await gh(`/git/ref/heads/${branch}`);
  const refJson = await refRes.json();
  const latestCommitSha: string = refJson.object.sha;

  const commitRes = await gh(`/git/commits/${latestCommitSha}`);
  const commitJson = await commitRes.json();
  const baseTreeSha: string = commitJson.tree.sha;

  const blobs = await Promise.all(
    files.map(async (f) => {
      const res = await gh(`/git/blobs`, {
        method: "POST",
        body: JSON.stringify({ content: f.content, encoding: "utf-8" }),
      });
      const json = await res.json();
      return { path: f.path, sha: json.sha as string };
    })
  );

  const treeRes = await gh(`/git/trees`, {
    method: "POST",
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: blobs.map((b) => ({ path: b.path, mode: "100644", type: "blob", sha: b.sha })),
    }),
  });
  const treeJson = await treeRes.json();

  const newCommitRes = await gh(`/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message, tree: treeJson.sha, parents: [latestCommitSha] }),
  });
  const newCommitJson = await newCommitRes.json();

  await gh(`/git/refs/heads/${branch}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: newCommitJson.sha }),
  });

  return {
    sha: newCommitJson.sha,
    url: `https://github.com/${env("GITHUB_OWNER")}/${env("GITHUB_REPO")}/commit/${newCommitJson.sha}`,
  };
}

export async function getFileText(path: string): Promise<string> {
  const { content } = await getFileRaw(path);
  if (content === null) throw new Error(`${path} does not exist in the repo.`);
  return content;
}

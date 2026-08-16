// One-off importer: reads ../events.js (the live GitHub Pages calendar file)
// and emits seed.sql — INSERT statements for the D1 `events` table, with
// dates normalized to ISO on the way in.
//
//   node scripts/import-events.mjs [path/to/events.js] > seed.sql
//
// Safe to re-run any time before cutover; seed.sql is idempotent only if you
// wipe the table first (it's meant for the initial import).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const src = process.argv[2] ?? join(here, "..", "..", "events.js");
const text = readFileSync(src, "utf8");

// events.js is `const EVENTS = [ ... ];` plus comments. Evaluate it in a
// bare function scope and pull the array out.
const EVENTS = new Function(`${text}; return EVENTS;`)();
if (!Array.isArray(EVENTS)) throw new Error("EVENTS is not an array — check the source file");

function toISO(dateStr) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr + " 00:00:00"); // "Sep 3, 2026" style
  if (isNaN(d)) throw new Error(`Unparseable date: "${dateStr}"`);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const q = (s) => `'${String(s ?? "").replace(/'/g, "''")}'`;

const lines = ["-- Generated from events.js by scripts/import-events.mjs", "DELETE FROM events;"];
for (const ev of EVENTS) {
  lines.push(
    `INSERT INTO events (date, title, host, location, description, link) VALUES (` +
      [toISO(ev.date), ev.title, ev.host, ev.location, ev.description, ev.link].map(q).join(", ") +
      `);`
  );
}
console.log(lines.join("\n"));
console.error(`OK: ${EVENTS.length} events`);

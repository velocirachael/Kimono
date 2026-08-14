import { buildUpdatedEventsJs } from "../lib/github";

// Trimmed version of the real events.js header + the one live entry you pasted.
const currentSource = `/* ============================================================
   FLORIDA KIMONO CLUB — EVENTS DATA
   ============================================================ */
const EVENTS = [
   {
    date: "Sep 3, 2026",
    title: "Japanese Tea Ceremony Beginners Course",
    host: "University of West Florida Continuing Education",
    location: "Pensacola, FL",
    description: "This course blends hands-on tea ceremony lessons with engaging presentations on the history and philosophy behind the practice.",
    link: "https://registration.xendirect.com/uwf/coursedisplay.cfm?schID=1790&check=1"
  },
];
`;

// A submitter typing a description with quotes AND a raw newline — exactly
// the failure mode the header comment warns about ("A multi-line
// description in double quotes will break the whole file").
const trickyNewEvent = {
  date: "Oct 12, 2026",
  title: 'Kimono "Basics" Workshop',
  host: "Sarah O'Brien",
  location: "Tampa, FL",
  description: "Line one.\nLine two with a \"quote\" and a backslash \\ in it.",
  link: "https://example.com/event",
};

const earlierEvent = {
  date: "Aug 20, 2026",
  title: "Obi Tying Basics",
  host: "Kimono Club",
  location: "Miami, FL",
  description: "A beginner-friendly session.",
  link: "https://example.com/obi",
};

const result = buildUpdatedEventsJs(currentSource, [trickyNewEvent, earlierEvent]);
console.log("--- generated events.js ---");
console.log(result);

// Re-parse the generated array the same way the tool itself validates it,
// PLUS actually walk the resulting objects to prove the tricky characters
// survived intact and nothing broke out of its string.
const match = result.match(/const\s+EVENTS\s*=\s*(\[[\s\S]*\]);/);
if (!match) throw new Error("FAIL: could not find EVENTS array in output");
const parsed = new Function(`"use strict"; return (${match[1]});`)();

console.log("\n--- parsed back out ---");
console.log(JSON.stringify(parsed, null, 2));

if (parsed.length !== 3) throw new Error(`FAIL: expected 3 events, got ${parsed.length}`);
if (parsed[0].title !== "Obi Tying Basics") throw new Error("FAIL: not sorted by date (Aug should be first)");
if (parsed[2].description !== trickyNewEvent.description) throw new Error("FAIL: tricky description was mangled");
if (parsed[2].title !== trickyNewEvent.title) throw new Error("FAIL: tricky title was mangled");

console.log("\nOK — sorted correctly, quotes/newlines/backslashes survived, output re-parses as valid JS.");

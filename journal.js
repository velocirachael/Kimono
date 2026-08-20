/* ============================================================
   FLORIDA KIMONO CLUB — JOURNAL DATA
   This is the ONLY file you need to edit to post to the journal.
   journal.html loads this file automatically — no other changes needed.

   Each post needs:
     date    "YYYY-MM-DD"
     title   Post title
     tags    List of short labels, e.g. ["site update", "ideas"]
             (use [] for no tags)
     body    The post itself. Basic HTML is allowed:
             <p>...</p> for paragraphs, <strong>, <em>, <a href="...">,
             <ul><li>...</li></ul> for lists.

   To add a post: copy an existing { ... } block, paste it at the TOP
   of the list (newest first — though the page sorts by date anyway),
   edit the values, and make sure blocks are separated by commas.
   To remove a post: delete its whole { ... } block (and its comma).

   IMPORTANT: wrap body text in backticks (`) so it can span multiple
   lines. Avoid using backticks inside the body itself.
   ============================================================ */
const POSTS = [
  {
    date: "2026-08-20",
    title: "The journal is open",
    tags: ["site update"],
    body: `
      <p>Welcome to the Florida Kimono journal — dispatches from the command center. This is where I'll be posting what I'm working on, what's coming next for the site and the community, and ideas for the future.</p>
      <p>Alongside this page, the site just grew an <a href="aboutus.html">About Us</a> page (purpose, mission, vision, and our principles of kitsuke) and an <a href="art.html">Art</a> page where the community can share kimono-related artwork.</p>
      <p>More soon. Stay cool out there — it's awase weather somewhere, but not in Florida.</p>
    `
  }
];

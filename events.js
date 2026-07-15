/* ============================================================
   FLORIDA KIMONO CLUB — EVENTS DATA
   This is the ONLY file you need to edit to update the calendar.
   index.html loads this file automatically — no other changes needed.

   Each event needs:
     date        "YYYY-MM-DD" — for multi-day events, use the start date
                 and mention the full range in the description
     title       Event name
     host        Who's running it
     location    "City, FL"
     description 1–2 sentences
     link        Organizer's original listing (their site, Instagram, Eventbrite, etc.)

   To add an event: copy an existing { ... } block, edit the values,
   add a comma after the previous entry's closing brace.
   To remove an event: delete its whole { ... } block (and its comma).
   ============================================================ */

const EVENTS = [
  {
    date: "2026-07-31",
    title: "Metrocon",
    host: "Metrocon",
    location: "Tampa, FL",
    description: "Florida's premier anime convention — three days of anime, gaming, and cosplay at the Tampa Convention Center (Jul 31–Aug 2). A high-energy chance to spot kimono and yukata in the wild.",
    link: "https://metroconventions.com/"
  },
  {
    date: "2026-08-15",
    title: "Morikami Summer Yukata Stroll",
    host: "Morikami Museum & Japanese Gardens",
    location: "Delray Beach, FL",
    description: "An evening walk through the gardens in yukata, followed by a short tea demonstration. Casual and beginner-friendly — no kimono required to attend.",
    link: "https://morikami.org"
  },
  {
    date: "2026-08-16",
    title: "SWFL Anime-Fest",
    host: "SWFL Anime-Fest",
    location: "Fort Myers, FL",
    description: "A one-day anime and pop-culture convention at the Hilton DoubleTree, with a cosplay contest, vendors, and a strong fandom crowd on Florida's southwest coast.",
    link: "http://www.swflanimefest.com/"
  },
  {
    date: "2026-09-20",
    title: "Beginner's Obi Tying Workshop",
    host: "Florida Kimono Club",
    location: "Tampa, FL",
    description: "Hands-on workshop covering basic obi musubi for warm-weather kimono. Bring your own kimono or borrow one on-site; limited spots.",
    link: "https://www.facebook.com/groups/floridakimonoclub"
  },
  {
    date: "2026-09-26",
    title: "Spirit of Japan",
    host: "SP-RING USA",
    location: "Miami, FL",
    description: "A two-day cultural festival bringing Japanese food, performances, and traditions to Miami — a good spot to wear kimono somewhere more cultural-festival, less anime-convention.",
    link: "https://www.spirit-jpn.com/"
  },
  {
    date: "2026-11-06",
    title: "JAPAN Fes Florida — Miami",
    host: "JAPAN Fes Florida",
    location: "Miami, FL",
    description: "A three-day Japan-focused festival in Miami with food vendors, performances, and cultural exhibits, part of a growing statewide JAPAN Fes series.",
    link: "https://www.japanfes.com/florida/2026"
  },
  {
    date: "2026-11-08",
    title: "Orlando Japan Festival — Kimono Meetup",
    host: "Japan Association of Orlando",
    location: "Kissimmee, FL",
    description: "Central Florida's largest annual Japan festival at Kissimmee Lakefront Park — taiko drumming, traditional dance, martial arts demos, and a cosplay contest. FKD members are gathering at the festival grounds for photos and a group walk-through. Look for the vermillion banner.",
    link: "https://www.jorlando.org/orlando-japan-festival"
  },
  {
    date: "2026-12-04",
    title: "JAPAN Fes Florida — Miami (Winter)",
    host: "JAPAN Fes Florida",
    location: "Miami, FL",
    description: "The second JAPAN Fes Florida date of the year, again in Miami — food, performances, and cultural exhibits over three days.",
    link: "https://www.japanfes.com/florida/2026"
  },
  {
    date: "2026-12-18",
    title: "Holiday Matsuri",
    host: "Holiday Matsuri",
    location: "Orlando, FL",
    description: "Florida's largest anime convention, drawing 50,000+ fans to the Orange County Convention Center for a holiday-themed weekend of cosplay, gaming, and panels (Dec 18–20).",
    link: "https://holidaymatsuri.com/"
  }
];

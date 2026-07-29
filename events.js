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

   IMPORTANT: description text must stay on ONE line inside double quotes,
   OR be wrapped in backticks (`) if it needs to span multiple lines.
   A multi-line description in double quotes will break the whole file.
   ============================================================ */
const EVENTS = [
  {
    date: "2026-07-27",
    title: "Katsura Sunshine's Rakugo (Japanese Comedic Storytelling) Live in Naples, Florida!",
    host: "Off The Hook Comedy Club",
    location: "Naples, FL",
    description: "A show of hilarity and culture in equal doses! Katsura Sunshine completed his grueling traditional apprenticeship in Rakugo comic storytelling under the great Rakugo Master Katsura Bunshi VI in 2011. His performances have delighted audiences throughout the world as well as all over Japan. Sunshine has graced the Broadway stage with a different delightful Japanese story each month since 2019, at the famous New World Stages in Manhattan.",
    link: "https://www.offthehookcomedy.com/shows/377193"
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
    title: "Ikebana Chabana Japanese Flower Arrangement Class",
    host: "Harry P. Leu Gardens",
    location: "Orlando, FL",
    description: "A specialized workshop focusing on Chabana, the traditional Japanese art of flower arrangement designed for the tea ceremony.",
    link: "https://www.eventbrite.com/e/ikebana-chabana-japanese-flower-arrangement-class-tickets-1992285336071"
  },
  {
    date: "2026-09-09",
    title: "Ikebana International Naples Chapter Programs",
    host: "Ikebana International Naples Chapter #160",
    location: "Naples, FL",
    description: "Ongoing 2026-2027 season of Ikebana demonstrations, workshops, and exhibitions at the Naples Botanical Garden.",
    link: "https://www.ikebananaples.com/programs-and-events"
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
    title: "Orlando Japan Festival",
    host: "Japan Association of Orlando",
    location: "Kissimmee, FL",
    description: `2026年11月8日、キシミーの美しいレークフロントパークにて「日本祭」が開催されます。伝統的な太鼓の演奏や踊り、武道のデモンストレーション、そして美味しい日本食の屋台など、日本の魅力を存分に味わえる一日です。入場は無料ですので、ご家族やご友人と一緒に、秋の風を感じながら日本文化に触れてみませんか？

Join us for the annual Japan Festival at the scenic Kissimmee Lakefront Park! This event celebrates the rich heritage of Japan through captivating Taiko drumming, traditional dance, martial arts demos, and authentic cuisine. Admission is free, making it a perfect day out for families and friends to experience the spirit of Japan right here in Central Florida.`,
    link: "https://www.jorlando.org/orlando-japan-festival"
  }
];

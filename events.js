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
    date: "Sep 3, 2026",
    title: "Japanese Tea Ceremony Beginners Course",
    host: "University of West Florida Continuing Education",
    location: "Pensacola, FL",
    description: "This course blends hands-on tea ceremony lessons with engaging presentations on the history and philosophy behind the practice. Through guided tastings, interactive demonstrations, and thoughtful discussions, you'll uncover the rituals, artistry, and cultural significance of this ancient tradition. Whether you're seeking a meditative escape or fascinated by Japanese culture, this course invites you to slow down, savor the moment, and embrace the beauty of tea.No experience needed, just curiosity and an open mind.",
    link: "https://registration.xendirect.com/uwf/coursedisplay.cfm?schID=1790&check=1"
  },
  {
    date: "2026-08-22",
    title: "BonFest Pensacola 2026",
    host: "Japan-American Society of NWFL",
    location: "Pensacola, FL",
    description: "BonFest Pensacola is coming back! Save the date for Saturday, August 22, 12-4pm, at the Sanders Beach-Corinne Jones Resource Center. Watch this space for details. This will be a FREE event with traditional Obon music and dance, food and craft vendors, and more.",
    link: "https://www.facebook.com/events/sanders-beach-corinne-jones-resource-center/bonfest-pensacola-2026/868908612955901/"
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
    date: "Oct 25, 2026",
    title: "3rd Annual OKI Fest",
    host: "Oki - Okinawa Kulture Impact",
    location: "Fort Walton Beach, FL",
    description: "Celebrate the Spirit of Okinawa Together! ✅ Free Admission & Entertainment!",
    link: "https://facebook.com/events/s/3rd-annual-oki-fest/2020882632120354/"
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

/* ============================================================
   FLORIDA KIMONO CLUB — COMMAND CENTER DATA (outreach-data.js)
   This is the ONLY file you need to edit to update the
   Organizers & Venues outreach list and the email templates.
   admin/index.html loads this file automatically.

   Each contact needs:
     id          short unique slug, never reuse one ("asia-trend")
     priority    "High" | "Medium" | "Low"
     category    "Media" | "Community Org" | "Chamber" | "Organizer"
                 | "Venue" | "Business" | "Individual" | "Government"
     org         Organization name
     contact     Person's name (leave "" if unknown)
     role        Their title/role ("" if unknown)
     city        "City, FL"
     email       "" if unknown
     phone       "" if unknown
     website     domain or full URL, "" if unknown
     status      "Not Contacted" | "Contacted" | "Follow-up Needed"
                 | "Meeting Scheduled" | "Partnered" | "Declined"
     nextAction  what to do next, one sentence
     notes       background + where the info came from (source)

   Edits made in the Command Center page are saved in that browser
   only (localStorage). Use its "Export data file" button to get an
   updated copy of this file to commit, so the list is shared.
   ============================================================ */

const OUTREACH_CONTACTS = [
  {
    id: "asia-trend",
    priority: "High",
    category: "Media",
    org: "Asia Trend / Asia Trend Community Learning Center",
    contact: "Gary C.K. Lau",
    role: "Founder & Executive Director",
    city: "Orlando, FL",
    email: "info@asiatrend.org",
    phone: "(646) 389-2742",
    website: "asiatrend.org",
    status: "Not Contacted",
    nextAction: "Send intro email: event calendar cross-listing, kimono demo/booth at the Asian Cultural EXPO, contributed article.",
    notes: "501(c)(3) founded 2005; online magazine + community learning center; runs the annual Asian Cultural EXPO in Orlando. Our #1 door into the Orlando Asian-American community. Sources: asiatrend.org/contact, causeiq.com, clickorlando.com (2021)."
  },
  {
    id: "japan-association-orlando",
    priority: "High",
    category: "Organizer",
    org: "Japan Association of Orlando (JAO)",
    contact: "",
    role: "",
    city: "Orlando, FL",
    email: "",
    phone: "",
    website: "jorlando.org",
    status: "Not Contacted",
    nextAction: "Find current board contact via jorlando.org; propose a kimono showcase / kitsuke demo at the Orlando Japan Festival (Nov 8, Kissimmee Lakefront Park).",
    notes: "501(c)(3); hosts the annual Orlando Japan Festival — already listed on our events calendar. Closest mission overlap of any Orlando org. Sources: jorlando.org, artsinorlando.com."
  },
  {
    id: "aacc-central-florida",
    priority: "Medium",
    category: "Chamber",
    org: "Asian American Chamber of Commerce of Central Florida",
    contact: "Coco Johnston",
    role: "Principal Officer",
    city: "Orlando, FL",
    email: "",
    phone: "",
    website: "asianamericanchambercfl.org",
    status: "Not Contacted",
    nextAction: "Ask about networking events and potential sponsors/venues for club events.",
    notes: "38+ years active; 3201 E Colonial Dr Unit A20, Orlando FL 32803. Business-focused — good for sponsor and venue leads. Sources: causeiq.com, asianamericanchambercfl.org."
  },
  {
    id: "mills-50",
    priority: "Medium",
    category: "Community Org",
    org: "Mills 50 District",
    contact: "",
    role: "",
    city: "Orlando, FL",
    email: "",
    phone: "",
    website: "mills50.org",
    status: "Not Contacted",
    nextAction: "Contact the main street org about their business directory and district events; scout member businesses as venues.",
    notes: "Orlando's Asian district — main street organization with a member directory full of potential venues and partners. Source: mills50.org."
  },
  {
    id: "morikami",
    priority: "Medium",
    category: "Venue",
    org: "Morikami Museum & Japanese Gardens",
    contact: "",
    role: "",
    city: "Delray Beach, FL",
    email: "",
    phone: "",
    website: "morikami.org",
    status: "Not Contacted",
    nextAction: "Propose partnering on kimono programming (their Yukata Stroll is already on our calendar).",
    notes: "Premier Japanese cultural venue in Florida; already an events-calendar relationship — formalize it. Source: morikami.org."
  },
  {
    id: "leu-gardens",
    priority: "Medium",
    category: "Venue",
    org: "Harry P. Leu Gardens",
    contact: "",
    role: "",
    city: "Orlando, FL",
    email: "",
    phone: "",
    website: "leugardens.org",
    status: "Not Contacted",
    nextAction: "Ask their programs team about hosting a kimono workshop alongside their ikebana classes.",
    notes: "Orlando venue that already hosts Japanese cultural programming (ikebana/chabana classes on our calendar). Source: leugardens.org."
  },
  {
    id: "japan-fes-florida",
    priority: "Medium",
    category: "Organizer",
    org: "JAPAN Fes Florida",
    contact: "",
    role: "",
    city: "Miami, FL",
    email: "",
    phone: "",
    website: "japanfes.com/florida",
    status: "Not Contacted",
    nextAction: "Ask about a kimono booth or stage segment at the November Miami festival.",
    notes: "Growing statewide festival series; Nov 6-8 Miami event is on our calendar. Source: japanfes.com."
  },
  {
    id: "jas-nwfl",
    priority: "Low",
    category: "Organizer",
    org: "Japan-America Society of Northwest Florida",
    contact: "",
    role: "",
    city: "Pensacola, FL",
    email: "",
    phone: "",
    website: "jasnwfl.org",
    status: "Not Contacted",
    nextAction: "Introduce the club; offer a kimono presence at BonFest Pensacola.",
    notes: "Hosts BonFest Pensacola (on our calendar). Panhandle anchor for the statewide network. Source: jasnwfl.org."
  },
  {
    id: "ikebana-naples",
    priority: "Low",
    category: "Organizer",
    org: "Ikebana International Naples Chapter #160",
    contact: "",
    role: "",
    city: "Naples, FL",
    email: "",
    phone: "",
    website: "ikebananaples.com",
    status: "Not Contacted",
    nextAction: "Introduce the club; explore a joint kimono + ikebana program at Naples Botanical Garden.",
    notes: "Active 2026-27 program season at Naples Botanical Garden (on our calendar). Source: ikebananaples.com."
  },
  {
    id: "oki-fest",
    priority: "Low",
    category: "Organizer",
    org: "OKI — Okinawa Kulture Impact",
    contact: "",
    role: "",
    city: "Fort Walton Beach, FL",
    email: "",
    phone: "",
    website: "facebook.com/events/s/3rd-annual-oki-fest/2020882632120354/",
    status: "Not Contacted",
    nextAction: "Reach out via Facebook about OKI Fest (Oct 25); Okinawan textile/kimono angle.",
    notes: "Runs the annual OKI Fest (on our calendar). Source: their Facebook event page."
  }
];

/* Placeholders available in templates:
   {{contact}} {{org}} {{city}} — filled from the selected contact.
   Anything in [square brackets] is for you to personalize by hand. */
const EMAIL_TEMPLATES = [
  {
    id: "asia-trend-intro",
    name: "Asia Trend — intro to Gary Lau",
    subject: "Florida Kimono Club — partnership with Asia Trend?",
    body: `Dear Mr. Lau,

My name is [your name], and I'm reaching out on behalf of the Florida Kimono Club (floridakimono.com), a statewide community for the history, craftsmanship, and everyday appreciation of kimono. We connect kimono enthusiasts, instructors, and sellers across Florida and host gatherings, festivals, and meetups.

I've long admired what Asia Trend has built for Central Florida's Asian-American community — the magazine, the Community Learning Center, and especially the Asian Cultural EXPO. Our missions overlap in a way I think could benefit both communities, and I'd love to explore a few ideas:

- Event listings — sharing Florida Kimono Club events on Asia Trend's community calendar, and pointing our members to Asia Trend's events from our site.
- A kimono presence at the Asian Cultural EXPO — a kitsuke (kimono dressing) demonstration, a try-on booth, or a short stage segment on kimono and its seasons.
- A story or feature — we'd be glad to contribute content on kimono culture in Florida for Asia Trend's readers.

Would you be open to a short call or coffee sometime in the next few weeks? I'm happy to work around your schedule.

Thank you for everything you do for the community — I hope we can weave something together.

Warm regards,

[your name]
Florida Kimono Club
https://www.floridakimono.com`
  },
  {
    id: "general-intro",
    name: "General intro (any organizer/venue)",
    subject: "Florida Kimono Club — [specific idea for {{org}}]",
    body: `Dear {{contact}},

My name is [your name], and I'm reaching out on behalf of the Florida Kimono Club (floridakimono.com), a statewide community for the history, craftsmanship, and everyday appreciation of kimono in Florida.

[One sentence showing you know {{org}} — a recent event, program, or mission point.]

I'd love to explore [one concrete, low-effort idea — e.g., listing each other's events, a kimono demonstration at their event, a joint meetup].

Would you be open to a short call or email exchange? Happy to work around your schedule.

Warm regards,

[your name]
Florida Kimono Club
https://www.floridakimono.com`
  },
  {
    id: "event-listing",
    name: "Event listing request",
    subject: "Event for your calendar — Florida Kimono Club",
    body: `Hello {{contact}},

I help run the Florida Kimono Club (floridakimono.com), and we have an upcoming event I think would interest {{org}}'s audience:

[Event name]
[Date, time]
[Venue, city]
[1-2 sentence description]
[Link]

Would you be able to add it to your events calendar or share it with your community? We're glad to list {{org}}'s events on our statewide kimono events calendar in return — just send us the details.

Thank you!

[your name]
Florida Kimono Club
https://www.floridakimono.com`
  }
];

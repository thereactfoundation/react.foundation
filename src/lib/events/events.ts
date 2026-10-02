/**
 * Events on /events: React Foundation events plus community events across the
 * React ecosystem. Every entry needs confirmed dates, the host, and an official
 * link. An event moves from "upcoming" to "past" automatically the day after it
 * ends, so entries are never edited to change their status.
 *
 * Each slug also needs a branded cover in `src/components/events/event-covers.tsx`
 * (enforced by the type checker).
 */

export type EventFormat = "conference" | "summit" | "meetup";

export interface FoundationEvent {
  slug: string;
  name: string;
  format: EventFormat;
  /** Who runs the event, as shown on the card ("Hosted by …"). */
  host: string;
  /** Local calendar dates at the event, `YYYY-MM-DD`. */
  startDate: string;
  endDate: string;
  city: string;
  country: string;
  venue?: string;
  summary: string;
  attendance: string;
  link: { href: string; label: string; external: boolean };
}

export const EVENT_FORMAT_LABELS: Record<EventFormat, string> = {
  conference: "Conference",
  summit: "Contributors summit",
  meetup: "Meetup",
};

export const FOUNDATION_EVENTS = [
  {
    slug: "react-conf-ghana-2026",
    name: "React Conf Ghana 2026",
    format: "conference",
    host: "the React Foundation",
    startDate: "2026-11-04",
    endDate: "2026-11-05",
    city: "Accra",
    country: "Ghana",
    venue: "West African Genetic Medicine Centre, University of Ghana",
    summary:
      "Two days of talks, hands-on workshops, and community moments for React developers, designers, and educators.",
    attendance: "Tickets available",
    link: { href: "https://reactghana.react.foundation", label: "Visit the event site", external: true },
  },
  {
    slug: "contributors-summit-2026",
    name: "Contributors Summit 2026",
    format: "summit",
    host: "the React Foundation",
    startDate: "2026-11-10",
    endDate: "2026-11-12",
    city: "London",
    country: "United Kingdom",
    venue: "Meta King's Cross, 11-21 Canal Reach",
    summary:
      "Three days for the React Foundation working groups to align, collaborate, and build the roadmap of what comes next for React.",
    attendance: "Invite only",
    link: { href: "/summit", label: "Read the participant guide", external: false },
  },
  {
    slug: "rendercon-kenya-2026",
    name: "RenderCon Kenya 2026",
    format: "conference",
    host: "ReactDevsKe",
    startDate: "2026-10-17",
    endDate: "2026-10-17",
    city: "Nairobi",
    country: "Kenya",
    summary:
      "East Africa's community-first React conference: a day of deep talks, community, and connection for 200+ developers, engineers, and designers.",
    attendance: "Tickets available",
    link: { href: "https://www.rendercon.org", label: "Visit the event site", external: true },
  },
  {
    slug: "react-india-2026",
    name: "React India 2026",
    format: "conference",
    host: "React India",
    startDate: "2026-10-29",
    endDate: "2026-10-31",
    city: "Goa",
    country: "India",
    venue: "Planet Hollywood Beach Resort",
    summary:
      "The final edition: a day of workshops, then two days of keynotes, talks, and lightning sessions for 1,000+ developers on the Goa coast.",
    attendance: "Tickets available",
    link: { href: "https://www.reactindia.io", label: "Visit the event site", external: true },
  },
  {
    slug: "okthink-cdmx-2026",
    name: "okthink in CDMX: AI, React, and the Future of Software Development",
    format: "meetup",
    host: "okthink, sponsored by Expo and the React Foundation",
    startDate: "2026-10-29",
    endDate: "2026-10-29",
    city: "Mexico City",
    country: "Mexico",
    venue: "Colonia Juárez (address shared with registered guests)",
    summary:
      "A bilingual evening on AI, React, and the future of software development during Día de los Muertos season and Mexico Tech Week, with MC Beto Moedano and Expo's Keith Kurak and Jacob Clausen.",
    attendance: "Register on Luma",
    link: { href: "https://okthink.ai/mexico-2026/", label: "Event details", external: true },
  },
] as const satisfies readonly FoundationEvent[];

export type EventSlug = (typeof FOUNDATION_EVENTS)[number]["slug"];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

function parts(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return { year, month, day };
}

/** "4 November 2026", "4–5 November 2026", "30 October – 2 November 2026". */
export function formatEventDateRange(startDate: string, endDate: string): string {
  const start = parts(startDate);
  const end = parts(endDate);
  const month = (n: number) => MONTHS[n - 1];

  if (startDate === endDate) return `${start.day} ${month(start.month)} ${start.year}`;
  if (start.year !== end.year) {
    return `${start.day} ${month(start.month)} ${start.year} – ${end.day} ${month(end.month)} ${end.year}`;
  }
  if (start.month !== end.month) {
    return `${start.day} ${month(start.month)} – ${end.day} ${month(end.month)} ${end.year}`;
  }
  return `${start.day}–${end.day} ${month(start.month)} ${start.year}`;
}

/** True while `today` (`YYYY-MM-DD`) falls inside the event's dates. */
export function isHappeningNow(event: FoundationEvent, today: string): boolean {
  return event.startDate <= today && today <= event.endDate;
}

/**
 * Splits events by `today` (`YYYY-MM-DD`). An event in progress is upcoming.
 * Upcoming events are soonest first; past events are most recent first.
 */
export function partitionEvents(events: readonly FoundationEvent[], today: string) {
  const upcoming = events
    .filter((event) => event.endDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const past = events
    .filter((event) => event.endDate < today)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
  return { upcoming, past };
}

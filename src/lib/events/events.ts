/**
 * React Foundation events.
 *
 * Only list events the foundation runs or presents, with confirmed dates. An
 * event moves from "upcoming" to "past" automatically the day after it ends,
 * so entries are never edited to change their status.
 */

export type EventFormat = "conference" | "summit";

export interface FoundationEvent {
  slug: string;
  name: string;
  format: EventFormat;
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
};

export const FOUNDATION_EVENTS: readonly FoundationEvent[] = [
  {
    slug: "react-conf-ghana-2026",
    name: "React Conf Ghana 2026",
    format: "conference",
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
    startDate: "2026-11-10",
    endDate: "2026-11-12",
    city: "London",
    country: "United Kingdom",
    summary:
      "Three days for the React Foundation working groups to align, collaborate, and build the roadmap of what comes next for React.",
    attendance: "Invite only",
    link: { href: "/summit", label: "Read the participant guide", external: false },
  },
];

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

import type { FoundationEvent } from "./events";

/**
 * Lays events out on a horizontal timeline that spans whole months, from the
 * first month with an event to the last. Offsets are percentages of the width.
 * Pins whose start dates are closer than `minGap` percent are lifted into
 * higher lanes so they never overlap.
 */

const DAY_MS = 86_400_000;

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

export interface TimelineMonth {
  label: string;
  year: number;
  offset: number;
}

export interface TimelineItem {
  slug: string;
  /** Pin position: the event's first day. */
  startOffset: number;
  /** End of the event's last day (exclusive), for the date-span bar. */
  endOffset: number;
  lane: number;
  isPast: boolean;
}

export interface TimelineLayout {
  months: TimelineMonth[];
  items: TimelineItem[];
  /** Null when today falls outside the timeline. */
  todayOffset: number | null;
  laneCount: number;
}

function dayNumber(isoDate: string): number {
  const [year, month, day] = isoDate.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / DAY_MS;
}

function monthStart(year: number, monthIndex: number): number {
  return Date.UTC(year, monthIndex, 1) / DAY_MS;
}

export function layoutTimeline(
  events: readonly FoundationEvent[],
  today: string,
  minGap = 8,
): TimelineLayout {
  if (events.length === 0) return { months: [], items: [], todayOffset: null, laneCount: 0 };

  const earliest = events.reduce((min, e) => (e.startDate < min ? e.startDate : min), events[0].startDate);
  const latest = events.reduce((max, e) => (e.endDate > max ? e.endDate : max), events[0].endDate);
  const [startYear, startMonth] = earliest.split("-").map(Number);
  const [endYear, endMonth] = latest.split("-").map(Number);

  const rangeStart = monthStart(startYear, startMonth - 1);
  const rangeEnd = monthStart(endYear, endMonth); // first day of the month after the last event
  const span = rangeEnd - rangeStart;
  const toOffset = (day: number) => ((day - rangeStart) / span) * 100;

  const months: TimelineMonth[] = [];
  let year = startYear;
  let monthIndex = startMonth - 1;
  while (monthStart(year, monthIndex) < rangeEnd) {
    months.push({ label: MONTH_LABELS[monthIndex], year, offset: toOffset(monthStart(year, monthIndex)) });
    monthIndex += 1;
    if (monthIndex === 12) {
      monthIndex = 0;
      year += 1;
    }
  }

  const laneLastOffsets: number[] = [];
  const items = [...events]
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.endDate.localeCompare(b.endDate))
    .map((event): TimelineItem => {
      const startOffset = toOffset(dayNumber(event.startDate));
      let lane = laneLastOffsets.findIndex((last) => startOffset - last >= minGap);
      if (lane === -1) lane = laneLastOffsets.push(startOffset) - 1;
      else laneLastOffsets[lane] = startOffset;
      return {
        slug: event.slug,
        startOffset,
        endOffset: toOffset(dayNumber(event.endDate) + 1),
        lane,
        isPast: event.endDate < today,
      };
    });

  const todayDay = dayNumber(today);
  const todayOffset = todayDay >= rangeStart && todayDay < rangeEnd ? toOffset(todayDay) : null;

  return { months, items, todayOffset, laneCount: laneLastOffsets.length };
}

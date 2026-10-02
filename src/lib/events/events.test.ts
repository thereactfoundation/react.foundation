import { describe, expect, it } from "vitest";

import {
  FOUNDATION_EVENTS,
  formatEventDateRange,
  isHappeningNow,
  partitionEvents,
  type FoundationEvent,
} from "./events";

const event = (slug: string, startDate: string, endDate: string): FoundationEvent => ({
  slug,
  name: slug,
  format: "conference",
  startDate,
  endDate,
  city: "City",
  country: "Country",
  summary: "Summary",
  attendance: "Open",
  link: { href: "/", label: "Details", external: false },
});

describe("partitionEvents", () => {
  const events = [
    event("older", "2025-03-01", "2025-03-02"),
    event("later", "2026-12-01", "2026-12-03"),
    event("soon", "2026-11-04", "2026-11-05"),
    event("recent", "2026-06-10", "2026-06-10"),
  ];

  it("orders upcoming soonest first and past most recent first", () => {
    const { upcoming, past } = partitionEvents(events, "2026-10-02");
    expect(upcoming.map((e) => e.slug)).toEqual(["soon", "later"]);
    expect(past.map((e) => e.slug)).toEqual(["recent", "older"]);
  });

  it("keeps an event upcoming through its final day, then moves it to past", () => {
    expect(partitionEvents(events, "2026-11-05").upcoming.map((e) => e.slug)).toContain("soon");
    expect(partitionEvents(events, "2026-11-06").past.map((e) => e.slug)).toContain("soon");
  });

  it("does not mutate the source list", () => {
    const before = events.map((e) => e.slug);
    partitionEvents(events, "2026-10-02");
    expect(events.map((e) => e.slug)).toEqual(before);
  });
});

describe("isHappeningNow", () => {
  const summit = event("summit", "2026-11-10", "2026-11-12");

  it("is true only between the first and last day inclusive", () => {
    expect(isHappeningNow(summit, "2026-11-09")).toBe(false);
    expect(isHappeningNow(summit, "2026-11-10")).toBe(true);
    expect(isHappeningNow(summit, "2026-11-12")).toBe(true);
    expect(isHappeningNow(summit, "2026-11-13")).toBe(false);
  });
});

describe("formatEventDateRange", () => {
  it.each([
    ["2026-11-04", "2026-11-04", "4 November 2026"],
    ["2026-11-04", "2026-11-05", "4–5 November 2026"],
    ["2026-10-30", "2026-11-02", "30 October – 2 November 2026"],
    ["2026-12-30", "2027-01-02", "30 December 2026 – 2 January 2027"],
  ])("formats %s → %s", (start, end, expected) => {
    expect(formatEventDateRange(start, end)).toBe(expected);
  });
});

describe("FOUNDATION_EVENTS", () => {
  it("has unique slugs and valid, ordered date ranges", () => {
    const slugs = FOUNDATION_EVENTS.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const e of FOUNDATION_EVENTS) {
      expect(e.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.endDate >= e.startDate).toBe(true);
    }
  });
});

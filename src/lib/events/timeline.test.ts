import { describe, expect, it } from "vitest";

import type { FoundationEvent } from "./events";
import { layoutTimeline } from "./timeline";

const event = (slug: string, startDate: string, endDate = startDate): FoundationEvent => ({
  slug,
  name: slug,
  format: "conference",
  host: "Host",
  startDate,
  endDate,
  city: "City",
  country: "Country",
  summary: "Summary",
  attendance: "Open",
  link: { href: "/", label: "Details", external: false },
});

describe("layoutTimeline", () => {
  const events = [
    event("summit", "2026-11-10", "2026-11-12"),
    event("render", "2026-10-17"),
    event("india", "2026-10-29", "2026-10-31"),
    event("cdmx", "2026-10-29"),
  ];

  it("spans whole months from the first event to the last", () => {
    const { months } = layoutTimeline(events, "2026-10-02");
    expect(months.map((m) => `${m.label} ${m.year}`)).toEqual(["Oct 2026", "Nov 2026"]);
    expect(months[0].offset).toBe(0);
    expect(months[1].offset).toBeCloseTo((31 / 61) * 100);
  });

  it("places pins at start dates and bars through the end of the last day", () => {
    const { items } = layoutTimeline(events, "2026-10-02");
    const india = items.find((i) => i.slug === "india")!;
    expect(india.startOffset).toBeCloseTo((28 / 61) * 100);
    expect(india.endOffset).toBeCloseTo((31 / 61) * 100);
  });

  it("lifts colliding pins into a higher lane and reuses free lanes", () => {
    const { items, laneCount } = layoutTimeline(events, "2026-10-02");
    const lanes = Object.fromEntries(items.map((i) => [i.slug, i.lane]));
    expect(lanes).toEqual({ render: 0, cdmx: 0, india: 1, summit: 0 });
    expect(laneCount).toBe(2);
  });

  it("marks past events and only shows today inside the range", () => {
    const later = layoutTimeline(events, "2026-11-01");
    expect(later.items.filter((i) => i.isPast).map((i) => i.slug).sort()).toEqual(["cdmx", "india", "render"]);
    expect(later.todayOffset).toBeCloseTo((31 / 61) * 100);
    expect(layoutTimeline(events, "2027-02-01").todayOffset).toBeNull();
  });

  it("crosses a year boundary", () => {
    const { months } = layoutTimeline([event("a", "2026-12-30"), event("b", "2027-01-05")], "2026-12-01");
    expect(months.map((m) => `${m.label} ${m.year}`)).toEqual(["Dec 2026", "Jan 2027"]);
  });

  it("handles no events", () => {
    expect(layoutTimeline([], "2026-10-02")).toEqual({ months: [], items: [], todayOffset: null, laneCount: 0 });
  });
});

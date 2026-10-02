import Image from "next/image";

import { cn } from "@/lib/cn";
import {
  formatEventDateRange,
  type EventSlug,
  type FoundationEvent,
} from "@/lib/events/events";
import { layoutTimeline } from "@/lib/events/timeline";

interface PinBrand {
  shortName: string;
  /** Chip fill behind the icon. */
  background: string;
  /** Stem, date-span bar, and base dot. */
  accent: string;
  icon: { src: string; scale: number };
}

/** Pin styling per event, taken from each event's own brand (see event-covers). */
const PIN_BRANDS = {
  "rendercon-kenya-2026": {
    shortName: "RenderCon Kenya",
    background: "#0F0B1E",
    accent: "#8B5CF6",
    icon: { src: "/events/rendercon-kenya-2026/logo.svg", scale: 1 },
  },
  "react-india-2026": {
    shortName: "React India",
    background: "#0F0AA4",
    accent: "#C8F31D",
    icon: { src: "/events/react-india-2026/logo.svg", scale: 0.82 },
  },
  "okthink-cdmx-2026": {
    shortName: "okthink in CDMX",
    background: "#0A0711",
    accent: "#F09040",
    icon: { src: "/events/okthink-cdmx-2026/skull.webp", scale: 0.86 },
  },
  "react-conf-ghana-2026": {
    shortName: "React Conf Ghana",
    background: "#0A1424",
    accent: "#F6B900",
    icon: { src: "/events/react-conf-ghana-2026/pin.svg", scale: 0.58 },
  },
  "contributors-summit-2026": {
    shortName: "Contributors Summit",
    background: "#16181D",
    accent: "#58C4DC",
    icon: { src: "/react-logo.svg", scale: 0.62 },
  },
} satisfies Record<EventSlug, PinBrand>;

function brandFor(slug: string): PinBrand {
  const brand = (PIN_BRANDS as Record<string, PinBrand | undefined>)[slug];
  if (!brand) throw new Error(`No timeline pin brand for event "${slug}"`);
  return brand;
}

const LANE_HEIGHT = 64; // px between stacked pins
const BASE_STEM = 28; // px from the line to the lowest pin
const CHIP = 40; // px

export function EventTimeline({
  events,
  today,
}: {
  events: readonly FoundationEvent[];
  today: string;
}) {
  return (
    <div className="rounded-panel bg-surface-subtle px-6 pb-12 pt-4 sm:px-10">
      <h2 className="sr-only">Timeline</h2>
      {/* Phones get a wider minimum gap between pins, so close dates stack instead of overlapping. */}
      <div className="sm:hidden">
        <TimelineTrack events={events} today={today} minGap={18} />
      </div>
      <div className="hidden sm:block">
        <TimelineTrack events={events} today={today} minGap={8} />
      </div>
    </div>
  );
}

function TimelineTrack({
  events,
  today,
  minGap,
}: {
  events: readonly FoundationEvent[];
  today: string;
  minGap: number;
}) {
  const { months, items, todayOffset, laneCount } = layoutTimeline(events, today, minGap);
  const bySlug = new Map(events.map((event) => [event.slug, event]));
  // Room for the tallest stem, the chip, and its tooltip.
  const trackHeight = BASE_STEM + (laneCount - 1) * LANE_HEIGHT + CHIP + 56;

  return (
    <div className="relative" style={{ height: trackHeight }}>
      {/* Line */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-border-strong" />

      {/* Month ticks */}
      {months.map((month, index) => (
        <div
          key={`${month.year}-${month.label}`}
          aria-hidden="true"
          className="absolute bottom-0"
          style={{ left: `${month.offset}%` }}
        >
          <div className="h-3 w-px translate-y-1/2 bg-border-strong" />
          <p className="absolute left-0 top-full mt-3 w-max font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground">
            {month.label}
            {index === 0 || month.label === "Jan" ? ` ${month.year}` : null}
          </p>
        </div>
      ))}

      {/* Today */}
      {todayOffset !== null ? (
        <div
          aria-hidden="true"
          className="absolute inset-y-0 border-l border-dashed border-primary/50"
          style={{ left: `${todayOffset}%` }}
        >
          <span className="absolute left-1.5 top-0 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-primary">
            Today
          </span>
        </div>
      ) : null}

      {/* Date spans */}
      {items.map((item) => (
        <div
          key={`${item.slug}-span`}
          aria-hidden="true"
          className={cn("absolute -bottom-0.5 h-[5px] min-w-[6px] rounded-full", item.isPast && "opacity-40")}
          style={{
            left: `${item.startOffset}%`,
            width: `${item.endOffset - item.startOffset}%`,
            background: brandFor(item.slug).accent,
          }}
        />
      ))}

      {/* Pins */}
      <ol aria-label="Event timeline" className="absolute inset-0">
        {items.map((item, index) => {
          const event = bySlug.get(item.slug)!;
          const brand = brandFor(item.slug);
          const stem = BASE_STEM + item.lane * LANE_HEIGHT;
          const dates = formatEventDateRange(event.startDate, event.endDate);

          return (
            <li
              key={item.slug}
              className={cn("absolute bottom-0 -translate-x-1/2", item.isPast && "opacity-50 grayscale")}
              style={{ left: `${item.startOffset}%` }}
            >
              <a
                href={`#event-${item.slug}`}
                aria-label={`${event.name}, ${dates}`}
                className="group relative flex flex-col items-center outline-none"
              >
                <span
                  className="relative z-10 animate-pin-float motion-reduce:animate-none"
                  style={{ animationDelay: `${index * -0.7}s` }}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-field bg-foreground px-3 py-2 text-left opacity-0 shadow-raised transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                  >
                    <span className="block text-xs font-semibold text-background">{brand.shortName}</span>
                    <span className="block font-mono text-[0.625rem] tracking-[0.08em] text-background/70">
                      {dates}
                    </span>
                  </span>
                  <span
                    className="flex items-center justify-center overflow-hidden rounded-full shadow-raised ring-4 ring-surface-subtle transition-transform duration-150 group-hover:scale-110 group-focus-visible:scale-110 group-focus-visible:ring-primary"
                    style={{ width: CHIP, height: CHIP, background: brand.background }}
                  >
                    <Image
                      src={brand.icon.src}
                      alt=""
                      width={CHIP}
                      height={CHIP}
                      unoptimized={brand.icon.src.endsWith(".svg")}
                      className="object-contain"
                      style={{ width: CHIP * brand.icon.scale, height: CHIP * brand.icon.scale }}
                    />
                  </span>
                </span>
                {/* Stem tucks under the chip so it stays attached while the chip floats. */}
                <span
                  aria-hidden="true"
                  className="-mt-2 w-px"
                  style={{ height: stem + 8, background: `${brand.accent}99` }}
                />
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 h-2.5 w-2.5 rounded-full ring-2 ring-surface-subtle"
                  style={{ background: brand.accent }}
                />
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

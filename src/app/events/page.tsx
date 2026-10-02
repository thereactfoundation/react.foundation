import type { Metadata } from "next";
import { ArrowUpRight, Building2, CalendarDays, MapPin, UsersRound } from "lucide-react";

import {
  Eyebrow,
  FeatureGrid,
  PageIntro,
  PublicPageShell,
  Section,
  SectionHeader,
  Surface,
} from "@/components/public-site/layout";
import { EventCover } from "@/components/events/event-covers";
import { SemanticBadge } from "@/components/rfds/semantic-components";
import { ButtonLink } from "@/components/ui/button";
import {
  EVENT_FORMAT_LABELS,
  FOUNDATION_EVENTS,
  formatEventDateRange,
  isHappeningNow,
  partitionEvents,
  type FoundationEvent,
} from "@/lib/events/events";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Upcoming and past React events: React Foundation conferences and summits, plus community conferences and meetups around the world.",
};

export default function EventsPage() {
  // Rendered per request (personalized header), so events move from upcoming
  // to past on their own the day after they end.
  const today = new Date().toISOString().slice(0, 10);
  const { upcoming, past } = partitionEvents(FOUNDATION_EVENTS, today);

  return (
    <PublicPageShell>
      <main>
        <Section spacing="intro">
          <PageIntro
            eyebrow="Events"
            title="Where the React community meets"
            description="Conferences, summits, and meetups from the React Foundation and the wider React community, from Accra to Goa."
          />
        </Section>

        <Section id="upcoming" spacing="attached" className="scroll-mt-24">
          <SectionHeader title="Upcoming" />
          {upcoming.length ? (
            <FeatureGrid columns={2}>
              {upcoming.map((event) => (
                <EventCard key={event.slug} event={event} happening={isHappeningNow(event, today)} />
              ))}
            </FeatureGrid>
          ) : (
            <p className="max-w-narrow text-sm leading-6 text-muted-foreground">
              No events are scheduled right now. New events will be announced here.
            </p>
          )}
        </Section>

        <Section id="past" className="scroll-mt-24">
          <SectionHeader title="Past" />
          {past.length ? (
            <FeatureGrid columns={2}>
              {past.map((event) => (
                <EventCard key={event.slug} event={event} />
              ))}
            </FeatureGrid>
          ) : (
            <p className="max-w-narrow text-sm leading-6 text-muted-foreground">
              Past events will be listed here once they have taken place.
            </p>
          )}
        </Section>
      </main>
    </PublicPageShell>
  );
}

function EventCard({ event, happening = false }: { event: FoundationEvent; happening?: boolean }) {
  const details = [
    {
      icon: CalendarDays,
      label: "Dates",
      value: (
        <time dateTime={event.startDate}>{formatEventDateRange(event.startDate, event.endDate)}</time>
      ),
    },
    { icon: MapPin, label: "Location", value: `${event.city}, ${event.country}` },
    ...(event.venue ? [{ icon: Building2, label: "Venue", value: event.venue }] : []),
    { icon: UsersRound, label: "Attendance", value: event.attendance },
  ];

  return (
    <Surface radius="card" className="flex h-full flex-col overflow-hidden">
      <EventCover slug={event.slug} />
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <Eyebrow>{EVENT_FORMAT_LABELS[event.format]}</Eyebrow>
          {happening ? <SemanticBadge variant="success">Happening now</SemanticBadge> : null}
        </div>
        <h3 className="mt-4 text-lg font-semibold tracking-[-0.01em] text-foreground">{event.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">Hosted by {event.host}</p>

        <dl className="mt-4 space-y-2 text-sm text-foreground">
          {details.map(({ icon: Icon, label, value }) => (
            <div key={label}>
              <dt className="sr-only">{label}</dt>
              <dd className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 text-sm leading-6 text-muted-foreground">{event.summary}</p>

        <div className="mt-auto pt-6">
          <ButtonLink
            href={event.link.href}
            variant="secondary"
            size="sm"
            {...(event.link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {event.link.label}
            {event.link.external ? <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /> : null}
          </ButtonLink>
        </div>
      </div>
    </Surface>
  );
}

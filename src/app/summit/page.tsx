import type { Metadata } from "next";

import {
  CtaBand,
  FeatureGrid,
  FeatureItem,
  PublicPageShell,
  Section,
  SectionHeader,
  Surface,
} from "@/components/public-site/layout";
import { RFDS } from "@/components/rfds";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { faqItems, summitDays, summitGoals } from "./summit-data";
import { LondonMap } from "./london-map";
import { SummitCalendarMenu } from "./summit-calendar-menu";
import { SummitFaq } from "./summit-faq";
import { SummitHero } from "./summit-hero";
import "./leaflet.css";

export const metadata: Metadata = {
  title: "React Foundation Contributors Summit 2026",
  description:
    "Participant guide for the first React Foundation Contributors Summit, taking place in London from 10–12 November 2026.",
  openGraph: {
    title: "React Foundation Contributors Summit 2026",
    description: "Three days in London to align, collaborate, and shape what comes next for React.",
    type: "website",
  },
};

/** Anchored sections clear the header plus the sticky Summit nav. */
const anchor = "scroll-mt-36";

export default function SummitPage() {
  return (
    <PublicPageShell>
      <main>
        <SummitHero />

        <Section id="why" className={anchor}>
          <SectionHeader
            eyebrow="Why we’re gathering"
            title="A Foundation becomes real when its people meet."
            lead={
              <p>
                This is our first chance to meet in person, connect across groups, and
                decide what comes next.
              </p>
            }
          />
          <FeatureGrid columns={4}>
            {summitGoals.map((goal, index) => (
              <FeatureItem key={goal.title} index={index + 1} title={goal.title}>
                {goal.description}
              </FeatureItem>
            ))}
          </FeatureGrid>
        </Section>

        <Section id="program" className={anchor}>
          <SectionHeader
            eyebrow="Program at a glance"
            title="Program"
            lead={
              <p>
                Travel days bookend three days together in London: one plenary day
                followed by two days dedicated to working groups.
              </p>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {summitDays.map((summitDay) => (
              <Surface
                key={summitDay.day}
                radius="card"
                tone={summitDay.isTravel ? "plain" : "raised"}
                elevation={summitDay.isTravel ? "none" : "card"}
                className={cn("flex flex-col p-6", summitDay.isTravel && "border-dashed")}
              >
                <p
                  className={cn(
                    "foundation-eyebrow",
                    summitDay.isTravel ? "text-muted-foreground" : "text-primary",
                  )}
                >
                  {summitDay.day}
                </p>
                <p
                  className={cn(
                    "mt-5 text-4xl font-semibold tracking-[-0.04em]",
                    summitDay.isTravel ? "text-muted-foreground" : "text-foreground",
                  )}
                >
                  {summitDay.dateNumber}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{summitDay.date}</p>
                <h3
                  className={cn(
                    "mt-6 text-base font-semibold",
                    summitDay.isTravel ? "text-muted-foreground" : "text-foreground",
                  )}
                >
                  {summitDay.label}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{summitDay.focus}</p>
                {summitDay.audience ? (
                  <p className="mt-auto pt-6 foundation-eyebrow text-muted-foreground">
                    {summitDay.audience}
                  </p>
                ) : null}
              </Surface>
            ))}
          </div>
        </Section>

        <Section id="joining" className={anchor}>
          <SectionHeader
            eyebrow="Joining the Summit"
            title="An invite-only working Summit."
            lead={
              <p>
                Attendance is invite only for members of the React Foundation working
                groups. Interested in taking part? Folks can self-nominate using the form
                below.
              </p>
            }
            actions={
              <ButtonLink
                href="https://forms.gle/HwUngQcCnWhbuBoR6"
                target="_blank"
                rel="noreferrer"
                variant="tertiary"
              >
                Self-nomination form
              </ButtonLink>
            }
          />
        </Section>

        <Section id="plan" className={anchor}>
          <SectionHeader
            eyebrow="Plan your Summit"
            title="Logistics"
            lead={
              <p>
                London and the dates are set. Venue details will be published here once
                confirmed.
              </p>
            }
          />
          <div className="grid gap-5 lg:grid-cols-3">
            <Surface radius="card" className="p-6 sm:p-7 lg:col-span-2">
              <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_18rem] md:items-start">
                <div>
                  <RFDS.SemanticBadge variant="warning">Venue to be confirmed</RFDS.SemanticBadge>
                  <h3 className="mt-5 text-lg font-semibold tracking-[-0.01em] text-foreground">
                    London, United Kingdom
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    London offers direct international connections and a strong local
                    React community. The final venue is being coordinated; capacity,
                    accessibility, and breakout space are part of that decision.
                  </p>
                </div>
                <LondonMap />
              </div>
            </Surface>

            <Surface radius="card" className="flex flex-col p-6 sm:p-7">
              <h3 className="text-lg font-semibold tracking-[-0.01em] text-foreground">
                Before you book
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Plan to arrive on Monday 9 November and depart on Friday 13 November.
                More information about the venue will be shared once it has been
                confirmed.
              </p>
              <SummitCalendarMenu variant="secondary" size="sm" className="mt-6" />
            </Surface>
          </div>
        </Section>

        <Section id="faq" className={anchor}>
          <SectionHeader
            eyebrow="Participant FAQ"
            title="The details, in one place."
            lead={
              <>
                <p>
                  This is the source of truth for Summit participants. Confirmed
                  information is stated plainly; open logistics are marked as such.
                </p>
                <p className="text-xs">Last updated 13 August 2026</p>
              </>
            }
          />
          <div className="max-w-narrow">
            <SummitFaq items={faqItems} />
          </div>
        </Section>

        <Section>
          <CtaBand
            eyebrow="10–12 November · London"
            title="Let’s shape what comes next."
            description="Bring your context and expertise to help build the future of React."
            actions={
              <ButtonLink href="#program" variant="secondary">
                Review the program
              </ButtonLink>
            }
          />
        </Section>
      </main>
    </PublicPageShell>
  );
}

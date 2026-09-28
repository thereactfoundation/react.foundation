import { ArrowDown, CalendarDays, MapPin, UsersRound } from "lucide-react";

import { PageIntro, Section } from "@/components/public-site/layout";
import { ButtonLink } from "@/components/ui/button";
import { SummitCalendarMenu } from "./summit-calendar-menu";

const navigation = [
  { href: "#why", label: "Purpose" },
  { href: "#program", label: "Program" },
  { href: "#joining", label: "Joining" },
  { href: "#plan", label: "Plan" },
  { href: "#faq", label: "FAQ" },
] as const;

const facts = [
  { icon: CalendarDays, label: "Dates", value: "10–12 Nov 2026" },
  { icon: MapPin, label: "Location", value: "London, UK" },
  { icon: UsersRound, label: "Attendance", value: "Invite only" },
] as const;

export function SummitHero() {
  return (
    <>
      <Section spacing="intro">
        <div className="foundation-hero-glow">
          <PageIntro
            eyebrow="Participant guide"
            title="Contributors Summit 2026"
            description="Three days in London to build the roadmap of what comes next for React."
            actions={
              <>
                <ButtonLink href="#program" size="lg">
                  Explore the program
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
                <SummitCalendarMenu variant="tertiary" />
              </>
            }
          />

          <dl className="mt-12 grid max-w-narrow gap-6 sm:grid-cols-3">
            {facts.map(({ icon: Icon, label, value }) => (
              <div key={label}>
                <dt className="flex items-center gap-2 foundation-eyebrow text-muted-foreground">
                  <Icon className="h-4 w-4 text-primary" aria-hidden="true" /> {label}
                </dt>
                <dd className="mt-2 font-semibold text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <nav
        aria-label="Summit sections"
        className="sticky top-[var(--foundation-header-height)] z-40 mt-[var(--foundation-space-attached)] border-b border-border bg-background/90 backdrop-blur-xl"
      >
        <div className="foundation-measure-standard mx-auto overflow-x-auto px-[var(--foundation-page-gutter)] py-2">
          {/* Offset by the pill padding so the first label aligns with the spine. */}
          <div className="-ml-3 flex items-center gap-1">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}

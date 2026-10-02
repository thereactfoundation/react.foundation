import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import {
  CtaBand,
  FeatureGrid,
  FeatureItem,
  Section,
  SectionHeader,
} from "@/components/public-site/layout";

const pillars = [
  {
    title: "Independent stewardship",
    body: "Keep React open, neutral, and shaped by the needs of the global community.",
  },
  {
    title: "Sustainable support",
    body: "Invest in the maintainers, educators, and organizers who move the ecosystem forward.",
  },
  {
    title: "A connected community",
    body: "Create more ways for people to learn, contribute, gather, and build together.",
  },
];

export function HomeMission() {
  return (
    <Section>
      <SectionHeader
        eyebrow="Our mission"
        title="We exist to ensure the React ecosystem thrives."
        lead={
          <>
            <p>
              We support React through independent stewardship, sustainable funding, and
              transparent governance—so the technology can remain open and accessible to
              everyone.
            </p>
            <p>
              Our work supports the people behind the technology—from core maintainers to
              local organizers—so that the next generation can keep experimenting,
              teaching, and creating.
            </p>
          </>
        }
      />
      <FeatureGrid>
        {pillars.map((pillar, index) => (
          <FeatureItem key={pillar.title} index={index + 1} title={pillar.title}>
            {pillar.body}
          </FeatureItem>
        ))}
      </FeatureGrid>
    </Section>
  );
}

export function HomeCommunityCTA() {
  return (
    <Section>
      <CtaBand
        eyebrow="Get involved"
        title="A stronger React ecosystem starts with participation."
        description="Join a community, become a member, or contribute your time and expertise."
        actions={
          <>
            <ButtonLink href="/communities" variant="secondary">
              Find a community
            </ButtonLink>
            <Link
              href="/about"
              className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-background transition hover:text-primary"
            >
              Learn more <span className="ml-2" aria-hidden>→</span>
            </Link>
          </>
        }
      />
    </Section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

import {
  FeatureGrid,
  FeatureItem,
  PageIntro,
  PublicPageShell,
  Section,
  SectionHeader,
  SummaryPanel,
} from "@/components/public-site/layout";

export const metadata: Metadata = {
  title: "Technical Steering Committee",
  description:
    "Learn about the purpose and formation of the React Foundation Technical Steering Committee.",
};

const responsibilities = [
  {
    title: "Technical perspective",
    body: "Bring ecosystem-wide technical context to foundation programs and support decisions.",
  },
  {
    title: "Maintainer consultation",
    body: "Create a practical path for maintainers and technical communities to surface shared needs.",
  },
  {
    title: "Open recommendations",
    body: "Document recommendations and avoid presenting one company's roadmap as ecosystem consensus.",
  },
];

export default function TechnicalSteeringCommitteePage() {
  return (
    <PublicPageShell>
      <main>
        <Section spacing="intro">
          <PageIntro
            eyebrow="Technical governance"
            title="Technical Steering Committee"
            description="The committee will connect foundation programs with the technical needs of React and its wider ecosystem."
          />
        </Section>

        <Section spacing="attached">
          <SummaryPanel eyebrow="Current status" title="Committee formation is in progress">
            <p>
              Membership, terms, and decision-making practices will be published
              after they are confirmed. The site does not use fictional profiles
              to fill open committee roles.
            </p>
            <p>
              Future updates will identify confirmed participants and explain how
              maintainers can bring work to the committee.
            </p>
          </SummaryPanel>
        </Section>

        <Section>
          <SectionHeader eyebrow="Committee remit" title="Technical guidance without invented authority." />
          <FeatureGrid>
            {responsibilities.map((item, index) => (
              <FeatureItem key={item.title} index={index + 1} title={item.title}>
                {item.body}
              </FeatureItem>
            ))}
          </FeatureGrid>
        </Section>

        <Section spacing="attached">
          <Link
            href="/about"
            className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"
          >
            <span aria-hidden>←</span>
            Back to about
          </Link>
        </Section>
      </main>
    </PublicPageShell>
  );
}

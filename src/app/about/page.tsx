import type { Metadata } from "next";
import Link from "next/link";

import { BecomeContributor } from "@/components/home/become-contributor";
import { ExecutiveMessage } from "@/components/home/executive-message";
import { FoundingMembers } from "@/components/home/founding-members";
import {
  FeatureGrid,
  FeatureItem,
  PageIntro,
  PublicPageShell,
  Section,
  SectionHeader,
  SummaryPanel,
  Surface,
} from "@/components/public-site/layout";
import { ButtonLink } from "@/components/ui/button";
import { ecosystemLibraries } from "@/lib/maintainer-tiers";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about the React Foundation's mission, stewardship, and community.",
};

const commitments = [
  {
    title: "Independent stewardship",
    body: "Protect React as an open project with durable, neutral governance.",
  },
  {
    title: "Ecosystem investment",
    body: "Support maintainers, educators, organizers, and the work that benefits everyone.",
  },
  {
    title: "Global participation",
    body: "Make it easier for more people and communities to shape what comes next.",
  },
];

const governanceDetails = [
  {
    title: "Open financials",
    body: "Funding decisions and program reporting should be published for community review when reportable funding activity exists.",
  },
  {
    title: "Community input",
    body: "Major decisions should be informed by maintainer feedback and the needs of the people building with React.",
  },
  {
    title: "Quarterly reports",
    body: "The foundation intends to publish periodic reports once funded work and distributions create public records.",
  },
  {
    title: "Open source values",
    body: "The foundation is grounded in transparency, durable stewardship, and participation across companies and communities.",
  },
];

const governanceBodies = [
  {
    href: "/about/board-of-directors",
    title: "Board of Directors",
    body: "Strategic leadership, fiduciary oversight, and long-term stewardship.",
  },
  {
    href: "/about/technical-steering-committee",
    title: "Technical Steering Committee",
    body: "Technical direction grounded in the needs of React and its ecosystem.",
  },
];

export default function AboutPage() {
  return (
    <PublicPageShell>
      <main>
        <Section spacing="intro">
          <PageIntro
            eyebrow="Who we are"
            title="About The React Foundation"
            description="We're building a sustainable future for the React ecosystem through community funding, transparent governance, and unwavering support for the maintainers who make it all possible."
          />
        </Section>

        <Section spacing="attached" measure="narrow">
          <ExecutiveMessage />
        </Section>

        <Section>
          <SectionHeader
            eyebrow="What we are here to do"
            title="Keep React open, supported, and ready for what comes next."
          />
          <FeatureGrid>
            {commitments.map((commitment, index) => (
              <FeatureItem key={commitment.title} index={index + 1} title={commitment.title}>
                {commitment.body}
              </FeatureItem>
            ))}
          </FeatureGrid>
        </Section>

        <Section>
          <FoundingMembers />
        </Section>

        <Section>
          <SummaryPanel
            eyebrow="Supported ecosystem"
            title={`${ecosystemLibraries.length} tracked repositories across React.`}
            actions={
              <ButtonLink href="/libraries" variant="secondary">
                Explore supported libraries
              </ButtonLink>
            }
          >
            <p>
              The foundation tracks React infrastructure, libraries, frameworks, testing
              tools, UI systems, and styling projects to make contribution recognition and
              support methodology easier to inspect.
            </p>
          </SummaryPanel>
        </Section>

        <Section>
          <SectionHeader
            eyebrow="Governance"
            title="Transparent governance"
            lead={
              <p>
                Governance work combines formal leadership, technical direction, and
                public accountability without claiming reports that have not yet been
                published.
              </p>
            }
          />
          <FeatureGrid columns={2}>
            {governanceDetails.map((detail) => (
              <FeatureItem key={detail.title} title={detail.title}>
                {detail.body}
              </FeatureItem>
            ))}
          </FeatureGrid>
          <FeatureGrid columns={2} className="mt-12">
            {governanceBodies.map((body) => (
              <GovernanceLink key={body.href} {...body} />
            ))}
          </FeatureGrid>
        </Section>

        <Section>
          <BecomeContributor />
        </Section>
      </main>
    </PublicPageShell>
  );
}

function GovernanceLink({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link href={href} className="group block">
      <Surface
        radius="card"
        className="h-full p-6 transition hover:-translate-y-0.5 hover:border-border-strong hover:shadow-raised sm:p-7"
      >
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold tracking-[-0.01em] text-foreground">{title}</h3>
          <span
            aria-hidden
            className="text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary"
          >
            →
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
      </Surface>
    </Link>
  );
}

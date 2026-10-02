import type { Metadata } from "next";

import {
  FeatureGrid,
  FeatureItem,
  PageIntro,
  PublicPageShell,
  Section,
  SectionHeader,
  SummaryPanel,
} from "@/components/public-site/layout";
import { ButtonLink } from "@/components/ui/button";
import { ecosystemLibraries, tierWeights } from "@/lib/maintainer-tiers";

export const metadata: Metadata = {
  title: "Ecosystem Support Assessment",
  description:
    "How contribution activity and support methodology are assessed for the React ecosystem.",
};

const methods = [
  {
    title: "Contribution score",
    body: `PRs × ${tierWeights.pullRequests} + Issues × ${tierWeights.issues} + Commits × ${tierWeights.commits}. This formula recognizes public GitHub activity while acknowledging that reviews, triage, discussions, and maintainer context require additional judgment.`,
  },
  {
    title: "Library impact",
    body: "Funding review can consider ecosystem footprint, maintenance load, security posture, documentation, community benefit, and the role a project plays across React workflows.",
  },
  {
    title: "Funding distribution",
    body: "When an approved pool exists, distribution can be proportional to contribution scores and impact metrics after eligibility review. Public pages should identify the reporting period, inputs, limits, and any material human judgment.",
  },
  {
    title: "Human review",
    body: "Metrics structure the process but do not replace maintainer feedback, community input, or governance review.",
  },
];

export default function ScoringPage() {
  return (
    <PublicPageShell>
      <main>
        <Section spacing="intro">
          <PageIntro
            eyebrow="Assessment methodology"
            title="How ecosystem support is assessed"
            description={`The current public model tracks contribution activity across ${ecosystemLibraries.length} repositories and pairs metrics with review before support decisions are published.`}
            actions={
              <>
                <ButtonLink href="/libraries" variant="secondary">
                  View tracked libraries
                </ButtonLink>
                <ButtonLink href="/impact" variant="ghost">
                  View impact methodology
                </ButtonLink>
              </>
            }
          />
        </Section>

        <Section spacing="attached">
          <SummaryPanel eyebrow="Method status" title="Published inputs before rankings">
            <p>
              Scores and allocations should not appear as public rankings until their
              data sources, time window, eligibility policy, and review limits are
              documented for the relevant reporting period.
            </p>
          </SummaryPanel>
        </Section>

        <Section>
          <SectionHeader
            eyebrow="Scoring model"
            title="Evidence is useful only when its limits are visible."
          />
          <FeatureGrid columns={2}>
            {methods.map((method, index) => (
              <FeatureItem key={method.title} index={index + 1} title={method.title}>
                {method.body}
              </FeatureItem>
            ))}
          </FeatureGrid>
        </Section>
      </main>
    </PublicPageShell>
  );
}

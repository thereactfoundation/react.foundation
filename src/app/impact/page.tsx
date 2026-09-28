import type { Metadata } from "next";

import { EcosystemLibraries } from "@/components/home/ecosystem-libraries";
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
import { ecosystemLibraries } from "@/lib/maintainer-tiers";

export const metadata: Metadata = {
  title: "Impact and Accountability",
  description:
    "How the React Foundation tracks contribution activity, assesses ecosystem support, and reports funded work.",
};

const methodology = [
  {
    title: "Contribution tracking",
    body: `The foundation tracks repository activity across ${ecosystemLibraries.length} supported React ecosystem repositories. GitHub activity is used for pull requests, issues, and commits where the API exposes reliable public signals.`,
  },
  {
    title: "Score calculation",
    body: "The current contribution formula is PRs × 8 + Issues × 3 + Commits × 1. The scoring page explains the limits of this model and where maintainer review remains necessary.",
  },
  {
    title: "Distribution methodology",
    body: "When funding is approved for a reporting period, available funds can be allocated against contribution scores, library impact, eligibility review, and published program constraints.",
  },
];

const reportingAreas = [
  "Revenue and approved funding sources",
  "Maintainer and project support",
  "Education initiatives",
  "Accessibility and global participation work",
  "Impact metrics and known limitations",
  "Community feedback and follow-up actions",
];

export default function ImpactPage() {
  return (
    <PublicPageShell>
      <main>
        <Section spacing="intro">
          <PageIntro
            eyebrow="Public accountability"
            title="Impact and accountability"
            description="The React Foundation publishes how support is measured, how decisions are reviewed, and what will be reported once funded work is underway."
            actions={
              <>
                <ButtonLink href="/libraries" variant="secondary">
                  Browse tracked libraries
                </ButtonLink>
                <ButtonLink href="/scoring" variant="ghost">
                  Read scoring methodology
                </ButtonLink>
              </>
            }
          />
        </Section>

        <Section spacing="attached">
          <SummaryPanel
            eyebrow="Reporting status"
            title="First public report coming after funded work"
          >
            <p>
              The foundation has not published quarterly distribution reports yet. Until
              funded programs produce reportable outcomes, this page separates existing
              methodology from future reports and avoids sample allocation totals.
            </p>
          </SummaryPanel>
        </Section>

        <Section>
          <SectionHeader
            eyebrow="Existing methodology"
            title="Measurement starts with transparent inputs."
          />
          <FeatureGrid>
            {methodology.map((item, index) => (
              <FeatureItem key={item.title} index={index + 1} title={item.title}>
                {item.body}
              </FeatureItem>
            ))}
          </FeatureGrid>
        </Section>

        <Section>
          <SectionHeader
            eyebrow="Intended report categories"
            title="Reports should be checkable records, not projections."
          />
          <FeatureGrid>
            {reportingAreas.map((area, index) => (
              <FeatureItem key={area} index={index + 1} title={area} />
            ))}
          </FeatureGrid>
        </Section>

        <Section>
          <EcosystemLibraries
            description={`These ${ecosystemLibraries.length} tracked repositories define the current public ecosystem surface for contribution tracking. The list includes libraries, tooling, documentation, and React infrastructure repositories.`}
            showMissingLibraryIssue
          />
        </Section>
      </main>
    </PublicPageShell>
  );
}

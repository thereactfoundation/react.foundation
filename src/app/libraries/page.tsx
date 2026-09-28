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
  title: "Ecosystem Support",
  description:
    "Tracked React ecosystem repositories, library categories, and contribution pathways.",
};

const supportNotes = [
  {
    title: "Library categories",
    body: "The tracked ecosystem is grouped by the role each project plays: core React, state, data, routing, frameworks, forms, testing, UI, animation, tooling, tables, and styling.",
  },
  {
    title: "Contribution tracking",
    body: "Public GitHub activity is used to recognize pull requests, issues, and commits across the tracked repositories.",
  },
  {
    title: "Funding-distribution explanation",
    body: "When funding is available for a reporting period, methodology and eligibility rules determine how support is allocated. Public pages do not show allocation totals until there are approved results to publish.",
  },
];

export default function LibrariesPage() {
  return (
    <PublicPageShell>
      <main>
        <Section spacing="intro">
          <PageIntro
            eyebrow="Libraries and tooling"
            title="Ecosystem support"
            description={`The public tracking surface currently includes ${ecosystemLibraries.length} tracked repositories across the React ecosystem.`}
            actions={
              <>
                <ButtonLink href="/scoring" variant="secondary">
                  Read scoring methodology
                </ButtonLink>
                <ButtonLink href="/impact" variant="ghost">
                  View impact methodology
                </ButtonLink>
              </>
            }
          />
        </Section>

        <Section spacing="attached">
          <SummaryPanel
            eyebrow={`${ecosystemLibraries.length} tracked repositories`}
            title="A curated ecosystem list, not a leaderboard"
          >
            <p>
              This page restores the public list of supported React ecosystem projects.
              Repository inclusion supports contribution recognition and methodology
              review; it is not itself a funding announcement.
            </p>
          </SummaryPanel>
        </Section>

        <Section>
          <SectionHeader
            eyebrow="How to read this list"
            title="The list explains scope before scores."
          />
          <FeatureGrid>
            {supportNotes.map((note, index) => (
              <FeatureItem key={note.title} index={index + 1} title={note.title}>
                {note.body}
              </FeatureItem>
            ))}
          </FeatureGrid>
        </Section>

        <Section>
          <EcosystemLibraries
            description={`Browse the ${ecosystemLibraries.length} tracked repositories used for contribution tracking and ecosystem support review.`}
            showMissingLibraryIssue
          />
        </Section>
      </main>
    </PublicPageShell>
  );
}

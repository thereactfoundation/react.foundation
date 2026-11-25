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
  title: "Board of Directors",
  description:
    "Learn about the responsibilities and formation of the React Foundation Board of Directors.",
};

const responsibilities = [
  {
    title: "Steward the mission",
    body: "Keep the foundation focused on durable, independent support for React and its ecosystem.",
  },
  {
    title: "Provide oversight",
    body: "Review strategy, finances, risk, and the foundation's obligations as a public-interest organization.",
  },
  {
    title: "Protect accountability",
    body: "Set expectations for transparent decisions, reporting, and responsible use of foundation resources.",
  },
];

export default function BoardOfDirectorsPage() {
  return (
    <PublicPageShell>
      <main>
        <Section spacing="intro">
          <PageIntro
            eyebrow="Governance"
            title="Board of Directors"
            description="The board provides strategic and fiduciary oversight for the React Foundation."
          />
        </Section>

        <Section spacing="attached">
          <SummaryPanel eyebrow="Current status" title="Appointments are in progress">
            <p>
              Named directors will be published only after appointments are
              complete. Placeholder profiles are intentionally not presented as
              members of the board.
            </p>
            <p>
              This page will be updated with confirmed directors, terms, and
              governance documents as they become public.
            </p>
          </SummaryPanel>
        </Section>

        <Section>
          <SectionHeader eyebrow="Board remit" title="Oversight with a clear public purpose." />
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

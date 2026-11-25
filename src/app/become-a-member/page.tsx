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

const enrollmentUrl =
  "https://enrollment.lfx.linuxfoundation.org/?project=react-foundation";

export const metadata: Metadata = {
  title: "Membership",
  description:
    "React Foundation membership information and Linux Foundation enrollment.",
};

const supportAreas = [
  "Maintainer and project support",
  "Shared ecosystem infrastructure",
  "Community and education programs",
  "Foundation governance and operations",
];

export default function BecomeMemberPage() {
  return (
    <PublicPageShell>
      <main>
        <Section spacing="intro">
          <PageIntro
            eyebrow="Organizations"
            title="Membership"
            description="Organizations can support independent stewardship and shared work across the React ecosystem."
            actions={
              <ButtonLink href={enrollmentUrl} size="lg">
                Open enrollment
              </ButtonLink>
            }
          />
        </Section>

        <Section spacing="attached">
          <SummaryPanel
            eyebrow="Enrollment"
            title="Membership is handled by the Linux Foundation"
          >
            <p>
              The external enrollment form opens with the React Foundation selected. It
              is the authoritative place for current membership terms, levels, and
              organization details.
            </p>
          </SummaryPanel>
        </Section>

        <Section>
          <SectionHeader
            eyebrow="What support enables"
            title="Capacity for work no single project should carry alone."
          />
          <FeatureGrid columns={4}>
            {supportAreas.map((area, index) => (
              <FeatureItem key={area} index={index + 1} title={area} />
            ))}
          </FeatureGrid>
        </Section>
      </main>
    </PublicPageShell>
  );
}

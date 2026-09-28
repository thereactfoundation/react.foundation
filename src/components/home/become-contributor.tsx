import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { RfcPopover } from "@/components/home/rfc-popover";
import { FeatureGrid, FeatureItem, SectionHeader } from "@/components/public-site/layout";
import { ecosystemLibraries } from "@/lib/maintainer-tiers";

type Action = { href: string; label: string; external?: boolean };

const contributorData: {
  variant: 'code' | 'sponsor' | 'member';
  title: string;
  description: string;
  primaryAction: Action;
  secondaryAction: Action | null;
}[] = [
  {
    variant: 'code',
    title: 'Contribute to Repos',
    description:
      'Submit code, RFCs, proposals, documentation, or bug reports to React and the tracked ecosystem repositories. Your contributions directly improve the tools millions of developers use.',
    primaryAction: {
      href: '/libraries',
      label: 'Browse tracked repositories',
    },
    secondaryAction: null,
  },
  {
    variant: 'sponsor' as const,
    title: 'Sponsor a Library',
    description:
      `Review the ${ecosystemLibraries.length} tracked repositories and support the projects you depend on through their own published sponsorship paths where available.`,
    primaryAction: {
      href: '/libraries',
      label: 'Sponsor a library',
    },
    secondaryAction: {
      href: '/scoring',
      label: 'Review methodology',
    },
  },
  {
    variant: 'member' as const,
    title: 'Become a Member',
    description:
      'Organizations can join the React Foundation through Linux Foundation enrollment and support independent stewardship, shared infrastructure, and community programs.',
    primaryAction: {
      href: 'https://enrollment.lfx.linuxfoundation.org/?project=react-foundation',
      label: 'Open membership enrollment',
      external: true,
    },
    secondaryAction: {
      href: '/become-a-member',
      label: 'Membership benefits',
    },
  },
];

/** Content for a `Section`: header, the three pathways, and a contact line. */
export function BecomeContributor() {
  return (
    <div id="contribute" className="scroll-mt-32">
      <SectionHeader
        eyebrow="Ways to contribute"
        title="Become a contributor"
        lead={
          <p>
            Contribute code, organize communities, create educational content, or
            support financially. Every pathway helps build a stronger ecosystem.
          </p>
        }
      />

      <FeatureGrid>
        {contributorData.map((item, index) => (
          <FeatureItem
            key={item.variant}
            index={index + 1}
            title={item.title}
            actions={
              <>
                <ButtonLink
                  href={item.primaryAction.href}
                  variant={index === 0 ? "primary" : "secondary"}
                  size="sm"
                  {...(item.primaryAction.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                >
                  {item.primaryAction.label}
                </ButtonLink>
                {item.variant === 'code' ? (
                  <RfcPopover />
                ) : item.secondaryAction ? (
                  <ButtonLink
                    href={item.secondaryAction.href}
                    variant="ghost"
                    size="sm"
                    {...(item.secondaryAction.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                  >
                    {item.secondaryAction.label}
                  </ButtonLink>
                ) : null}
              </>
            }
          >
            {item.description}
          </FeatureItem>
        ))}
      </FeatureGrid>

      <p className="mt-12 text-sm text-muted-foreground">
        Questions about contributing?{" "}
        <Link
          href="mailto:info@react.foundation"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Get in touch
        </Link>
      </p>
    </div>
  );
}

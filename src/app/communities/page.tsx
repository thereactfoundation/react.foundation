import type { Metadata } from "next";
import { Suspense } from "react";

import { AddCommunityCTA } from "@/components/communities/AddCommunityCTA";
import { CommunityFilters } from "@/components/communities/CommunityFilters";
import { CommunityList } from "@/components/communities/CommunityList";
import { CommunityMap } from "@/components/communities/CommunityMap";
import { CommunitySortDropdown } from "@/components/communities/CommunitySortDropdown";
import { CommunityStats } from "@/components/communities/CommunityStats";
import { CommunitySearch } from "@/components/communities/CommunitySearch";
import {
  SectionHeader,
  PageIntro,
  PublicPageShell,
  Section,
} from "@/components/public-site/layout";
import { REACT_COMMUNITIES } from "@/data/communities";
import "./leaflet.css";

export const metadata: Metadata = {
  title: "React Communities",
  description:
    "Discover React meetups, conferences, and communities around the world.",
};

const communityStats = {
  communities: REACT_COMMUNITIES.length,
  countries: new Set(REACT_COMMUNITIES.map((community) => community.country)).size,
  members: REACT_COMMUNITIES.reduce(
    (sum, community) => sum + community.member_count,
    0,
  ),
};

export default function CommunitiesPage() {
  return (
    <PublicPageShell>
      <main>
        <Section spacing="intro">
          <PageIntro
            eyebrow="Global network"
            title="Find your React community"
            description="Connect with React developers through meetups, conferences, and study groups around the world."
          />
        </Section>

        <Section spacing="attached">
          <CommunityStats {...communityStats} />
        </Section>

        <Section spacing="attached">
          <div className="overflow-hidden rounded-panel border border-border bg-map-water/35 shadow-card">
            <CommunityMap communities={REACT_COMMUNITIES} />
          </div>
          <div className="mt-5">
            <AddCommunityCTA />
          </div>
        </Section>

        <Section id="communities" className="scroll-mt-24">
          <div className="mb-10 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionHeader eyebrow="Community directory" title="Find a community" />
            </div>
            <Suspense fallback={<SortDropdownSkeleton />}>
              <CommunitySortDropdown />
            </Suspense>
          </div>

          <Suspense fallback={null}>
            <CommunitySearch />
          </Suspense>

          <div className="mt-8 grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)]">
            <aside>
              <Suspense fallback={<FiltersSkeleton />}>
                <CommunityFilters />
              </Suspense>
            </aside>
            <div>
              <Suspense fallback={<ListSkeleton />}>
                <CommunityList communities={REACT_COMMUNITIES} />
              </Suspense>
            </div>
          </div>
        </Section>
      </main>
    </PublicPageShell>
  );
}

function FiltersSkeleton() {
  return <div className="h-80 animate-pulse rounded-panel bg-muted" />;
}

function SortDropdownSkeleton() {
  return <div aria-hidden className="h-10 w-40 animate-pulse rounded-field bg-muted" />;
}

function ListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-52 animate-pulse rounded-card border border-border bg-muted"
        />
      ))}
    </div>
  );
}

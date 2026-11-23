import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell, Section } from "@/components/public-site/layout";
import { cn } from "@/lib/cn";

import { VersionA, VersionB, VersionC } from "./variants";

export const metadata: Metadata = {
  title: "Vision, Mission and Goals",
  description:
    "The React Foundation's vision, mission and goals to 2028, agreed at the React Contributors Summit in London.",
};

/* Design review: three candidate layouts behind ?v=. Remove the switcher and the
   unchosen versions before merging. */
const VERSIONS = [
  { id: "a", name: "Refined", Component: VersionA },
  { id: "b", name: "Editorial", Component: VersionB },
  { id: "c", name: "The chain", Component: VersionC },
] as const;

export default async function MissionPage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string | string[] }>;
}) {
  const { v } = await searchParams;
  const current = VERSIONS.find((version) => version.id === v) ?? VERSIONS[0];
  const { Component } = current;

  return (
    <PublicPageShell>
      <main>
        <Section measure="standard" className="pt-6">
          <nav
            aria-label="Design versions"
            className="flex flex-wrap items-center gap-2 rounded-control border border-dashed border-border-strong bg-muted px-3 py-2 text-sm"
          >
            <span className="mr-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Design review
            </span>
            {VERSIONS.map((version) => (
              <Link
                key={version.id}
                href={`/about/mission?v=${version.id}`}
                scroll={false}
                aria-current={version.id === current.id ? "page" : undefined}
                className={cn(
                  "inline-flex rounded-control px-3 py-1 font-medium transition",
                  version.id === current.id
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-background",
                )}
              >
                {version.id.toUpperCase()} · {version.name}
              </Link>
            ))}
          </nav>
        </Section>
        <Component />
      </main>
    </PublicPageShell>
  );
}

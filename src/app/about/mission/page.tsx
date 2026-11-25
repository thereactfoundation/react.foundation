import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell, Section } from "@/components/public-site/layout";
import { cn } from "@/lib/cn";

import { VISIONS } from "./content";
import { VersionA, VersionB, VersionC } from "./variants";

export const metadata: Metadata = {
  title: "Vision, mission and goals",
  description:
    "The React Foundation's vision, mission and goals to 2028, agreed at the React Contributors Summit in London.",
};

/* Design review: three candidate layouts behind ?v=, four visions behind ?vision=. Remove the switcher and the
   unchosen versions before merging. */
const VERSIONS = [
  { id: "a", name: "Refined", Component: VersionA },
  { id: "b", name: "Editorial", Component: VersionB },
  { id: "c", name: "The chain", Component: VersionC },
] as const;

export default async function MissionPage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string | string[]; vision?: string | string[] }>;
}) {
  const params = await searchParams;
  const current =
    VERSIONS.find((version) => version.id === params.v) ?? VERSIONS[0];
  const vision =
    VISIONS.find((option) => option.id === params.vision) ?? VISIONS[0];
  const { Component } = current;
  const rows = [
    {
      label: "Layout",
      items: VERSIONS.map((version) => ({
        key: version.id,
        text: `${version.id.toUpperCase()} · ${version.name}`,
        href: `/about/mission?v=${version.id}&vision=${vision.id}`,
        active: version.id === current.id,
      })),
    },
    {
      label: "Vision",
      items: VISIONS.map((option) => ({
        key: option.id,
        text: `${option.id} · ${option.name}`,
        href: `/about/mission?v=${current.id}&vision=${option.id}`,
        active: option.id === vision.id,
      })),
    },
  ];

  return (
    <PublicPageShell>
      <main>
        <Section measure="standard" className="pt-6">
          <div className="space-y-2 rounded-panel border border-dashed border-border-strong bg-muted px-3 py-2 text-sm">
            {rows.map((row) => (
              <nav
                key={row.label}
                aria-label={`Design review: ${row.label}`}
                className="flex flex-wrap items-center gap-2"
              >
                <span className="mr-1 w-16 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {row.label}
                </span>
                {row.items.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    scroll={false}
                    aria-current={item.active ? "page" : undefined}
                    className={cn(
                      "inline-flex rounded-control px-3 py-1 font-medium transition",
                      item.active
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-background",
                    )}
                  >
                    {item.text}
                  </Link>
                ))}
              </nav>
            ))}
          </div>
        </Section>
        <Component vision={vision.text} />
      </main>
    </PublicPageShell>
  );
}

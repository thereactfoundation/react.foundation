import Image from "next/image";
import type { ReactNode } from "react";

import type { EventSlug } from "@/lib/events/events";

/**
 * Branded covers for /events cards. Each cover uses the event's own assets and
 * colors (taken from its official site), so cards look like the events they
 * link to. Covers are decorative: the card body carries the accessible title.
 */

const coverSizes = "(min-width: 1024px) 31rem, (min-width: 640px) 50vw, 100vw";

function CoverFrame({ background, children }: { background: string; children: ReactNode }) {
  return (
    <div aria-hidden="true" className="relative aspect-[40/21] overflow-hidden" style={{ background }}>
      {children}
    </div>
  );
}

function ReactConfGhanaCover() {
  return (
    <CoverFrame background="#0A1424">
      <Image
        src="/events/react-conf-ghana-2026/accra.webp"
        alt=""
        fill
        sizes={coverSizes}
        className="object-cover opacity-40"
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(90deg, #0A1424 25%, rgba(10,20,36,0.35) 100%)" }}
      />
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: "linear-gradient(90deg, #D21D34 0 33.3%, #F6B900 33.3% 66.6%, #1DA45A 66.6% 100%)" }}
      />
      <Image
        src="/events/react-conf-ghana-2026/wordmark.webp"
        alt=""
        width={640}
        height={483}
        sizes="16rem"
        className="absolute left-6 top-1/2 h-auto w-[44%] -translate-y-1/2"
      />
      <p className="absolute bottom-4 right-5 font-mono text-[0.6875rem] tracking-[0.16em] text-[#3FC1E0]">
        #GhanaBeAwesome
      </p>
    </CoverFrame>
  );
}

function ContributorsSummitCover() {
  return (
    <CoverFrame background="radial-gradient(70% 90% at 85% 15%, rgba(88,196,220,0.32), transparent 70%), #16181D">
      <Image
        src="/react-logo.svg"
        alt=""
        width={76}
        height={68}
        unoptimized
        className="absolute right-6 top-6 w-14"
      />
      <div className="absolute bottom-6 left-6">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[#58C4DC]">
          React Foundation
        </p>
        <p className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.02em] text-white sm:text-3xl">
          Contributors Summit <span className="text-[#58C4DC]">2026</span>
        </p>
      </div>
    </CoverFrame>
  );
}

function RenderConKenyaCover() {
  return (
    <CoverFrame background="radial-gradient(60% 85% at 85% 40%, rgba(124,53,204,0.5), transparent 70%), #0F0B1E">
      <div className="absolute left-6 top-5 flex items-center gap-2">
        <Image src="/events/rendercon-kenya-2026/logo.svg" alt="" width={28} height={28} unoptimized className="h-7 w-7" />
        <span className="text-sm font-bold text-white">
          RenderCon <span className="text-xs font-medium text-[#F4B942]">Kenya</span>
        </span>
      </div>
      <p className="absolute bottom-5 left-6 text-3xl font-extrabold leading-[0.95] tracking-[-0.03em] text-white sm:text-4xl">
        React.
        <br />
        Connect.
        <br />
        <span
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(135deg, #8B5CF6, #F4B942)" }}
        >
          Build.
        </span>
      </p>
    </CoverFrame>
  );
}

function ReactIndiaCover() {
  return (
    <CoverFrame background="radial-gradient(70% 60% at 75% 100%, rgba(35,162,120,0.45), transparent 70%), #0F0AA4">
      <Image
        src="/events/react-india-2026/palm.webp"
        alt=""
        width={640}
        height={589}
        sizes="14rem"
        className="absolute -bottom-6 right-0 h-[105%] w-auto"
      />
      <div className="absolute left-6 top-5 flex items-center gap-2">
        <Image src="/events/react-india-2026/logo.svg" alt="" width={28} height={28} unoptimized className="h-7 w-7" />
        <span className="leading-none">
          <span className="block text-sm font-bold text-white">React India</span>
          <span className="block font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-white/70">
            Final edition · 2026
          </span>
        </span>
      </div>
      <p className="absolute bottom-5 left-6 text-2xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-3xl">
        One last time.
        <br />
        <span
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(90deg, #C8F31D, #F7F41F)" }}
        >
          React India 2026.
        </span>
      </p>
    </CoverFrame>
  );
}

function OkthinkCdmxCover() {
  return (
    <CoverFrame background="#0A0711">
      <Image
        src="/events/okthink-cdmx-2026/cover.webp"
        alt=""
        fill
        sizes={coverSizes}
        className="object-cover"
      />
    </CoverFrame>
  );
}

const EVENT_COVERS = {
  "react-conf-ghana-2026": ReactConfGhanaCover,
  "contributors-summit-2026": ContributorsSummitCover,
  "rendercon-kenya-2026": RenderConKenyaCover,
  "react-india-2026": ReactIndiaCover,
  "okthink-cdmx-2026": OkthinkCdmxCover,
} satisfies Record<EventSlug, () => ReactNode>;

/** The branded cover for an event. Throws for an event without a cover. */
export function EventCover({ slug }: { slug: string }) {
  const Cover = (EVENT_COVERS as Record<string, (() => ReactNode) | undefined>)[slug];
  if (!Cover) throw new Error(`No branded cover for event "${slug}"`);
  return <Cover />;
}

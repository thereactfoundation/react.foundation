import type { HTMLAttributes, ReactNode } from "react";

import { Footer } from "@/components/layout/footer";
import { cn } from "@/lib/cn";

/**
 * Public-site layout primitives.
 *
 * The whole public site is built from these, so layout decisions live here and
 * nowhere else:
 *
 * - One spine. Every section sits on the `standard` measure, aligned with the
 *   header and footer. `narrow` only caps the *line length* of prose inside that
 *   spine; it is never a separately centered container.
 * - One vertical rhythm. A section owns only the space *above* it, chosen from
 *   three steps (`intro`, `section`, `attached`), so gaps never double up.
 *   `PublicPageShell` adds the single gap before the footer.
 * - Three section compositions, each opened by a `SectionHeader`:
 *   `FeatureGrid` of unboxed items, a grid of `Surface` cards (only for
 *   genuinely independent objects), or narrow prose. Plus `SummaryPanel` and
 *   `CtaBand` for the two emphasized moments.
 *
 * Pages must not add their own padding, max-widths, or section borders.
 */

type Measure = "standard" | "narrow";
type Spacing = "intro" | "section" | "attached" | "none";

const spacingClasses: Record<Spacing, string> = {
  intro: "pt-[var(--foundation-space-intro)]",
  section: "pt-[var(--foundation-space-section)]",
  attached: "pt-[var(--foundation-space-attached)]",
  none: "",
};

/**
 * Eyebrow — the single section-label voice across the site. Geist Mono, tracked
 * uppercase caps in React teal.
 */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("foundation-eyebrow text-primary", className)}>{children}</p>
  );
}

export function PublicPageShell({
  children,
  className,
  footer = true,
}: {
  children: ReactNode;
  className?: string;
  footer?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-h-screen overflow-x-clip bg-background pt-[var(--foundation-header-height)] text-foreground",
        className,
      )}
    >
      <div className="pb-[var(--foundation-space-section)]">{children}</div>
      {footer ? <Footer /> : null}
    </div>
  );
}

export function Section({
  children,
  className,
  measure = "standard",
  spacing = "section",
  as: Component = "section",
  ...props
}: HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  measure?: Measure;
  spacing?: Spacing;
  as?: "section" | "div" | "main";
}) {
  return (
    <Component
      className={cn(
        "foundation-measure-standard mx-auto w-full px-[var(--foundation-page-gutter)]",
        spacingClasses[spacing],
        className,
      )}
      {...props}
    >
      {measure === "narrow" ? <div className="max-w-narrow">{children}</div> : children}
    </Component>
  );
}

export function PageIntro({
  title,
  description,
  eyebrow,
  actions,
  align = "left",
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div className={cn("animate-page-appear", centered && "text-center", className)}>
      {eyebrow ? <Eyebrow className="mb-5">{eyebrow}</Eyebrow> : null}
      <h1
        className={cn(
          "max-w-narrow text-title font-semibold leading-[1.04] tracking-[-0.03em] text-balance text-foreground",
          centered && "mx-auto",
        )}
      >
        {title}
      </h1>
      {description ? (
        <p
          className={cn(
            "mt-6 max-w-narrow text-lead leading-8 text-muted-foreground",
            centered && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
      {actions ? (
        <div className={cn("mt-8 flex flex-wrap items-center gap-3", centered && "justify-center")}>
          {actions}
        </div>
      ) : null}
    </div>
  );
}

/** Eyebrow → heading → optional lead/actions. Opens every section. */
export function SectionHeader({
  eyebrow,
  title,
  lead,
  actions,
  id,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-narrow not-last:mb-10 sm:not-last:mb-12", className)}>
      {eyebrow ? <Eyebrow className="mb-4">{eyebrow}</Eyebrow> : null}
      <h2
        id={id}
        className="text-heading font-semibold leading-[1.1] tracking-[-0.02em] text-balance text-foreground"
      >
        {title}
      </h2>
      {lead ? (
        <div className="mt-4 space-y-4 text-base leading-7 text-muted-foreground">{lead}</div>
      ) : null}
      {actions ? <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}

/** The one grid for items and cards: 1 → 2 → 3 (or 4) columns. */
export function FeatureGrid({
  children,
  columns = 3,
  className,
}: {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-x-8 gap-y-10 sm:grid-cols-2",
        columns === 3 && "lg:grid-cols-3",
        columns === 4 && "lg:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** An unboxed feature: optional mono index, title, body, optional actions. */
export function FeatureItem({
  index,
  title,
  children,
  actions,
}: {
  index?: number;
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <article className="flex flex-col">
      {index !== undefined ? (
        <p className="foundation-eyebrow mb-4 text-primary">{String(index).padStart(2, "0")}</p>
      ) : null}
      <h3 className="text-lg font-semibold tracking-[-0.01em] text-foreground">{title}</h3>
      {children ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{children}</p> : null}
      {actions ? <div className="mt-5 flex flex-wrap items-center gap-3">{actions}</div> : null}
    </article>
  );
}

export function Surface({
  children,
  className,
  tone = "raised",
  radius = "panel",
  elevation = "card",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  tone?: "raised" | "subtle" | "plain";
  radius?: "card" | "panel";
  elevation?: "none" | "card" | "soft";
}) {
  return (
    <div
      className={cn(
        "border border-border",
        radius === "card" ? "rounded-card" : "rounded-panel",
        tone === "raised" && "bg-surface-raised",
        tone === "subtle" && "bg-surface-subtle",
        tone === "plain" && "bg-transparent",
        elevation === "card" && "shadow-card",
        elevation === "soft" && "shadow-soft",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * A quiet, borderless status/summary panel: label + title on the left, detail
 * and optional actions on the right. Used once per page, directly under the
 * intro.
 */
export function SummaryPanel({
  eyebrow,
  title,
  children,
  actions,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="grid gap-6 rounded-panel bg-surface-subtle p-7 sm:p-10 md:grid-cols-2 md:gap-12">
      <div>
        <Eyebrow className="mb-4">{eyebrow}</Eyebrow>
        <h2 className="text-2xl font-semibold leading-tight tracking-[-0.02em] text-balance text-foreground">
          {title}
        </h2>
      </div>
      <div>
        <div className="space-y-4 text-sm leading-6 text-muted-foreground">{children}</div>
        {actions ? <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}

/** The single dark call-to-action band. At most one per page, last. */
export function CtaBand({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions: ReactNode;
}) {
  return (
    <div className="rounded-panel bg-foreground px-7 py-11 text-background sm:flex sm:items-center sm:justify-between sm:gap-10 sm:px-12 sm:py-14">
      <div className="max-w-narrow">
        <p className="foundation-eyebrow text-primary">{eyebrow}</p>
        <h2 className="mt-4 text-heading font-semibold leading-[1.1] tracking-[-0.02em] text-balance !text-background">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 text-sm leading-6 text-background/70">{description}</p>
        ) : null}
      </div>
      <div className="mt-8 flex shrink-0 flex-wrap items-center gap-3 sm:mt-0">{actions}</div>
    </div>
  );
}

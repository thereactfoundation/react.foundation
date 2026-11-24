import type { ReactNode } from "react";

import { Section, Surface } from "@/components/public-site/layout";
import { cn } from "@/lib/cn";

import { AGREED, GOALS, GOALS_INTRO, MISSION, NEVERS, SUPPORTING, VISION } from "./content";

const label = "font-mono text-xs uppercase tracking-wider text-primary";

function Nevers() {
  return (
    <div className="grid gap-10 md:grid-cols-[0.75fr_1.25fr] md:gap-16">
      <div>
        <p className="text-sm font-semibold text-primary">Our commitments</p>
        <h2 className="mt-4 text-3xl font-semibold leading-tight">The Foundation will never</h2>
      </div>
      <NeverList />
    </div>
  );
}

function NeverList({ className }: { className?: string }) {
  return (
    <ol className={cn("border-t border-border", className)}>
      {NEVERS.map((never, index) => (
        <li key={never} className="flex gap-4 border-b border-border py-5 text-[0.9375rem] leading-6">
          <span className="font-mono text-primary">{index + 1}</span>
          <span>{never}</span>
        </li>
      ))}
    </ol>
  );
}

function SupportGrid() {
  return (
    <div className="grid gap-px overflow-hidden rounded-panel border border-border bg-border sm:grid-cols-2">
      {SUPPORTING.map((item) => (
        <article key={item.title} className="bg-background p-7">
          <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
        </article>
      ))}
    </div>
  );
}

/* A · Refined: today's structure with clearer hierarchy */
export function VersionA() {
  return (
    <>
      <Section className="pt-16 sm:pt-24" measure="standard">
        <p className="text-sm font-semibold text-primary">Our vision</p>
        <h1 className="mt-5 max-w-[62rem] text-4xl font-semibold leading-[1.08] tracking-tight text-foreground [text-wrap:balance] sm:text-5xl lg:text-[3.5rem]">
          {VISION}
        </h1>
        <p className="mt-7 max-w-[35rem] text-sm leading-6 text-muted-foreground">{AGREED}</p>
      </Section>

      <Section className="pt-16 sm:pt-22" measure="standard">
        <Surface className="grid gap-8 p-7 sm:p-10 md:grid-cols-[0.7fr_1.3fr] md:gap-12">
          <div>
            <p className="text-sm font-semibold text-primary">Mission</p>
            <h2 className="mt-3 text-2xl font-semibold text-foreground">What the Foundation does to get there</h2>
          </div>
          <div className="divide-y divide-border">
            {MISSION.map((part) => (
              <div key={part.label} className="grid gap-2 py-4 sm:grid-cols-[9.5rem_1fr] sm:gap-5">
                <span className={cn(label, "pt-1")}>{part.label}</span>
                <p className="text-base leading-7 text-foreground">{part.text}</p>
              </div>
            ))}
          </div>
        </Surface>
      </Section>

      <Section className="pt-20 sm:pt-28" measure="standard">
        <p className="text-sm font-semibold text-primary">Goals to 2028</p>
        <h2 className="mt-4 text-3xl font-semibold leading-tight text-foreground">
          Three goals, and the work underway in 2027
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">{GOALS_INTRO}</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {GOALS.map((goal) => (
            <a
              key={goal.id}
              href={`#goal-${goal.id}`}
              className="rounded-card border border-border bg-card p-6 transition hover:border-primary"
            >
              <span className="font-mono text-sm text-primary">{goal.id}</span>
              <h3 className="mt-2 text-xl font-semibold text-foreground">{goal.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{goal.claim}</p>
            </a>
          ))}
        </div>
        <div className="mt-12 border-t border-border">
          {GOALS.map((goal) => (
            <article
              key={goal.id}
              id={`goal-${goal.id}`}
              className="grid scroll-mt-24 gap-6 border-b border-border py-8 md:grid-cols-[0.8fr_1.2fr] md:gap-12"
            >
              <div>
                <span className="font-mono text-sm text-primary">{goal.id}</span>
                <h3 className="mt-1 text-2xl font-semibold text-foreground">{goal.title}</h3>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Underway in 2027</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
                  {goal.work.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-col gap-1 rounded-control bg-brand-soft px-4 py-3 sm:flex-row sm:items-baseline sm:gap-3">
                  <span className={label}>Measure</span>
                  <span className="text-sm leading-6 text-foreground">{goal.measure}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section className="pt-20 sm:pt-24" measure="standard">
        <p className="mb-6 text-sm font-semibold text-primary">How the Foundation works</p>
        <SupportGrid />
      </Section>

      <Section className="py-20 sm:py-28" measure="standard">
        <Nevers />
      </Section>
    </>
  );
}

/* B · Editorial: vision as the hero, goals as three columns */
export function VersionB() {
  return (
    <>
      <div className="bg-brand-soft py-20 sm:py-28">
        <Section measure="standard">
          <p className={cn(label, "tracking-widest")}>Vision · Mission · Goals to 2028</p>
          <h1 className="mt-7 max-w-[65rem] text-4xl font-semibold leading-[1.04] tracking-tight text-foreground [text-wrap:balance] sm:text-5xl lg:text-[4rem]">
            {VISION}
          </h1>
          <p className="mt-8 text-sm text-muted-foreground">Agreed in London, November 2026</p>
        </Section>
      </div>

      <Section className="pt-20 sm:pt-26" measure="standard">
        <div className="grid gap-6 md:grid-cols-[0.5fr_1.5fr] md:gap-12">
          <p className="text-sm font-semibold text-primary">Mission</p>
          <p className="text-xl font-medium leading-snug text-muted-foreground [text-wrap:pretty] sm:text-[1.75rem] sm:leading-[1.4]">
            <span className="text-foreground">The React Foundation provides open, neutral stewardship of React</span> so
            people can rely on it as software evolves. We <span className="text-foreground">support maintainers</span>,{" "}
            <span className="text-foreground">run a research lab</span> exploring the future of interfaces, and{" "}
            <span className="text-foreground">help people and companies contribute</span> engineering work, expertise,
            or funding. Together, we advance React so <span className="text-foreground">people and agents</span> can
            efficiently build high-quality interfaces on every platform.
          </p>
        </div>
      </Section>

      <Section className="pt-24 sm:pt-30" measure="standard">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end md:gap-10">
          <div>
            <p className="text-sm font-semibold text-primary">Goals to 2028</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-foreground">Three goals</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">{GOALS_INTRO}</p>
        </div>
        <div className="mt-10 grid border-t-2 border-foreground md:grid-cols-3">
          {GOALS.map((goal, index) => (
            <article
              key={goal.id}
              className={cn(
                "flex flex-col py-7 md:px-7",
                index > 0 && "border-t border-border md:border-l md:border-t-0",
              )}
            >
              <span className="font-mono text-4xl font-medium leading-none text-primary">{goal.id}</span>
              <h3 className="mt-5 text-2xl font-semibold text-foreground">{goal.title}</h3>
              <p className="mt-2 text-[0.9375rem] leading-6 text-foreground">{goal.claim}</p>
              <p className={cn(label, "mt-7 text-foreground")}>Underway in 2027</p>
              <ul className="mt-1">
                {goal.work.map((item) => (
                  <li key={item} className="border-t border-border py-2.5 text-sm leading-[1.375rem] text-muted-foreground">
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-auto border-t border-foreground pt-4">
                <p className={label}>Measured by</p>
                <p className="mt-1 text-sm leading-6 text-foreground">{goal.measure}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section className="pt-24 sm:pt-28" measure="standard">
        <p className="mb-5 text-sm font-semibold text-primary">How the Foundation works</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SUPPORTING.map((item) => (
            <article key={item.title} className="border-t border-border pt-4">
              <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section className="py-24 sm:py-28" measure="standard">
        <Nevers />
      </Section>
    </>
  );
}

/* C · The chain: each layer serves the one above it */
function Step({ name, last = false, children }: { name: string; last?: boolean; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[1.25rem_1fr] gap-x-5 md:grid-cols-[10rem_2rem_1fr] md:gap-x-6">
      <p className={cn(label, "hidden pt-1.5 text-right md:block")}>{name}</p>
      <div className="flex flex-col items-center">
        <span className="mt-1.5 size-3.5 flex-none rounded-full bg-primary ring-[6px] ring-brand-soft" />
        {last ? null : <span className="mt-2 w-0.5 flex-1 bg-border" />}
      </div>
      <div className={cn("min-w-0", last ? "" : "pb-16 md:pb-20")}>
        <p className={cn(label, "mb-3 md:hidden")}>{name}</p>
        {children}
      </div>
    </div>
  );
}

export function VersionC() {
  return (
    <>
      <Section className="pt-16 sm:pt-24" measure="standard">
        <p className="text-sm font-semibold text-primary">About</p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
          Our vision, mission and goals
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground">
          {AGREED}
        </p>
      </Section>

      <Section className="pt-16 sm:pt-20" measure="standard">
        <Step name="Vision">
          <p className="max-w-[52rem] text-3xl font-semibold leading-[1.15] tracking-tight text-foreground [text-wrap:balance] sm:text-[2.5rem]">
            {VISION}
          </p>
        </Step>
        <Step name="Mission">
          <div className="max-w-3xl space-y-3.5">
            {MISSION.map((part) => (
              <p key={part.label} className="text-lg leading-[1.875rem] text-muted-foreground">
                {part.text}
              </p>
            ))}
          </div>
        </Step>
        <Step name="Goals to 2028">
          <p className="mb-5 text-sm text-muted-foreground">
            Each with the 2027 work the working groups have committed to it.
          </p>
          <div className="grid gap-4 lg:grid-cols-3">
            {GOALS.map((goal) => (
              <Surface key={goal.id} className="flex flex-col p-6">
                <span className="font-mono text-sm text-primary">{goal.id}</span>
                <h3 className="mt-2 text-xl font-semibold text-foreground">{goal.title}</h3>
                <p className="mt-2 text-sm leading-6 text-foreground">{goal.claim}</p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-[0.8125rem] leading-[1.3rem] text-muted-foreground">
                  {goal.work.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="mt-auto border-t border-border pt-3 text-[0.8125rem] leading-6 text-muted-foreground">
                  <b className="text-foreground">Measure · </b>
                  {goal.measure}
                </p>
              </Surface>
            ))}
          </div>
        </Step>
        <Step name="Foundations">
          <SupportGrid />
        </Step>
        <Step name="Commitments" last>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-[2.5rem]">
            The Foundation will never
          </h2>
          <NeverList className="mt-8 max-w-3xl" />
        </Step>
      </Section>
    </>
  );
}

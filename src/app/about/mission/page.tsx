import type { Metadata } from "next";

import {
  PageIntro,
  PublicPageShell,
  Section,
  Surface,
} from "@/components/public-site/layout";

export const metadata: Metadata = {
  title: "Vision, Mission and Goals",
  description:
    "The React Foundation's vision, mission and goals to 2028, agreed at the React Contributors Summit in London.",
};

const VISION =
  "Anyone can efficiently bring their ideas to life as user interfaces that fulfill their aspirations, meet their high standards, and work wherever they're needed.";

const MISSION = [
  "The React Foundation provides open, neutral stewardship of React so people can rely on it as software evolves.",
  "We support maintainers, run a research lab exploring the future of interfaces, and help people and companies contribute engineering work, expertise, or funding.",
  "Together, we advance React so people and agents can efficiently build high-quality interfaces on every platform.",
];

const goals = [
  {
    id: "01",
    title: "Every platform",
    claim: "React works wherever interfaces live, on every new device from day one.",
    work: [
      "A shared platform contract, so desktop, TV, HarmonyOS, headsets and the web plug into React Native the same way iOS and Android do",
      "A stable native ABI for C++, Kotlin and Swift",
      "Web APIs in React Native: Intersection and Resize Observer, DOM APIs, CSS Grid, media queries and View Transitions",
      "Support for each new iOS and Android release as it ships",
    ],
    measure: "Platforms building on the shared contract and passing the same public tests.",
  },
  {
    id: "02",
    title: "Chosen on merit",
    claim: "Teams choose React because it is the best option, not out of habit.",
    work: [
      "React Native 1.0, with clearly defined stable APIs",
      "A Foundation-run security program, with its own vulnerability reporting and CVEs",
      "A faster runtime and renderer: a shared animation backend, faster Android rendering, deeper Hermes integration",
      "React Server Components in React Native, a leaner core, and testing that works with no setup",
    ],
    measure: "Adoption, migrations to and from React, and performance as people experience it, around the world.",
  },
  {
    id: "03",
    title: "Agents choose React",
    claim: "Ask an agent for an interface, on the web or native, and it writes good React.",
    work: [
      "Official React skills that make any agent an expert in writing React",
      "A public benchmark of how well agents write React",
      "Tools that let agents see and check their work: a React CLI, MCP, a language server and DevTools extensions",
      "WebMCP support, agreed with browser vendors",
    ],
    measure: "Public benchmark scores across leading models.",
  },
];

const supporting = [
  {
    title: "A published plan",
    body: "A public roadmap with named owners, kept current through the year.",
  },
  {
    title: "Shared ownership",
    body: "Releases and repository health rotate across member companies, so no critical project depends on one company or one person.",
  },
  {
    title: "An open process",
    body: "Changes to React Native go through a public proposal process.",
  },
  {
    title: "Faster delivery",
    body: "Features reach users in weeks, not months.",
  },
];

const nevers = [
  "Gate participation on membership. Contributions clear a bar of quality, not of who pays.",
  "Pick winners among frameworks, libraries or vendors.",
  "Let a critical project depend on one company or one person.",
  "Decide technical direction. That belongs to React's technical leadership.",
  "Take on more than we can staff.",
];

export default function MissionPage() {
  return (
    <PublicPageShell>
      <main>
        <Section className="pt-16 sm:pt-24">
          <PageIntro
            eyebrow="About"
            title="Vision, mission and goals"
            description="Agreed by the Governing Board at the React Contributors Summit in London, November 2026, alongside the working groups that build React."
          />
        </Section>

        <Section className="pt-12 sm:pt-16" measure="standard">
          <p className="text-sm font-semibold text-primary">Vision</p>
          <p className="mt-4 text-3xl font-semibold leading-tight text-foreground [text-wrap:balance] sm:text-4xl">
            {VISION}
          </p>
        </Section>

        <Section className="py-16 sm:py-20" measure="standard">
          <Surface className="grid gap-8 p-7 sm:p-10 md:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-sm font-semibold text-primary">Mission</p>
              <h2 className="mt-3 text-2xl font-semibold text-foreground">
                What the Foundation does to get there
              </h2>
            </div>
            <div className="space-y-4 text-base leading-7 text-muted-foreground">
              {MISSION.map((sentence) => (
                <p key={sentence}>{sentence}</p>
              ))}
            </div>
          </Surface>
        </Section>

        <Section className="pb-16 sm:pb-20" measure="standard">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary">Goals to 2028</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-foreground">
              Three goals, and the work underway in 2027
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              The working groups have mapped their 2027 plans to these goals.
              Each piece of work gets a named owner, paired with a co-owner from
              another company.
            </p>
          </div>
          <div className="mt-10 divide-y divide-border border-y border-border">
            {goals.map((goal) => (
              <article
                key={goal.id}
                className="grid gap-6 py-8 md:grid-cols-[0.8fr_1.2fr] md:gap-12"
              >
                <div>
                  <p className="font-mono text-sm text-primary">{goal.id}</p>
                  <h3 className="mt-2 text-2xl font-semibold text-foreground">
                    {goal.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {goal.claim}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Underway in 2027
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
                    {goal.work.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      How we will measure it:{" "}
                    </span>
                    {goal.measure}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Section>

        <Section className="pb-16 sm:pb-20" measure="standard">
          <p className="text-sm font-semibold text-primary">What makes it possible</p>
          <div className="mt-6 grid gap-px overflow-hidden rounded-panel border border-border bg-border sm:grid-cols-2">
            {supporting.map((item) => (
              <article key={item.title} className="bg-background p-7">
                <h3 className="text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </Section>

        <Section className="pb-20 sm:pb-28" measure="standard">
          <div className="grid gap-10 md:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-sm font-semibold text-primary">Our commitments</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-foreground">
                The Foundation will never
              </h2>
            </div>
            <ol className="divide-y divide-border border-y border-border">
              {nevers.map((never, index) => (
                <li key={never} className="flex gap-4 py-5 text-sm leading-6 text-foreground">
                  <span className="font-mono text-primary">{index + 1}</span>
                  <span>{never}</span>
                </li>
              ))}
            </ol>
          </div>
        </Section>
      </main>
    </PublicPageShell>
  );
}

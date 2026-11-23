export const VISION =
  "Anyone can efficiently bring their ideas to life as user interfaces that fulfill their aspirations, meet their high standards, and work wherever they're needed.";

export const AGREED =
  "Agreed by the Governing Board at the React Contributors Summit in London, November 2026, alongside the working groups that build React.";

export const GOALS_INTRO =
  "The working groups have mapped their 2027 plans to these goals. Each piece of work gets a named owner, paired with a co-owner from another company.";

export const MISSION = [
  {
    label: "Stewardship",
    text: "The React Foundation provides open, neutral stewardship of React so people can rely on it as software evolves.",
  },
  {
    label: "Support and research",
    text: "We support maintainers, run a research lab exploring the future of interfaces, and help people and companies contribute engineering work, expertise, or funding.",
  },
  {
    label: "Together",
    text: "Together, we advance React so people and agents can efficiently build high-quality interfaces on every platform.",
  },
];

export type Goal = {
  id: string;
  title: string;
  claim: string;
  work: string[];
  measure: string;
};

export const GOALS: Goal[] = [
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
    claim: "People, teams and agents choose React because it is the best option, not out of habit.",
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

export const SUPPORTING = [
  { title: "A published plan", body: "A public roadmap with named owners, kept current through the year." },
  {
    title: "Shared ownership",
    body: "Releases and repository health rotate across member companies, so no critical project depends on one company or one person.",
  },
  { title: "An open process", body: "Changes to React Native go through a public proposal process." },
  { title: "Faster delivery", body: "Features reach users in weeks, not months." },
];

export const NEVERS = [
  "Gate participation on membership. Contributions clear a bar of quality, not of who pays.",
  "Pick winners among frameworks, libraries or vendors.",
  "Let a critical project depend on one company or one person.",
  "Decide technical direction. That belongs to React's technical leadership.",
  "Take on more than we can staff.",
];

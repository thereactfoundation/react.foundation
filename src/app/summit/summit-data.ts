export const summitVenue = {
  name: "Meta King's Cross",
  address: "11-21 Canal Reach, London, UK",
  coordinates: [51.5385924, -0.1276989] as [number, number],
  directionsUrl:
    "https://www.google.com/maps/search/?api=1&query=Meta%20King%27s%20Cross%2C%2011-21%20Canal%20Reach%2C%20London",
};

export interface SummitGoal {
  description: string;
  title: string;
}

export interface SummitDay {
  audience?: string;
  date: string;
  dateNumber: string;
  day: string;
  focus: string;
  isTravel: boolean;
  label: string;
}

export interface FaqItem {
  answer: string;
  link?: {
    href: string;
    label: string;
  };
  question: string;
  updatedAt?: string;
}

export const summitGoals: readonly SummitGoal[] = [
  {
    title: "Establish our identity",
    description: "Bring every technical working group together in person for the first time.",
  },
  {
    title: "Shape the roadmap",
    description: "Align working groups and subteams on priorities, active projects, and roadmaps.",
  },
  {
    title: "Build trust",
    description: "Create the relationships that make thoughtful remote collaboration work.",
  },
  {
    title: "Formalize governance",
    description: "Resolve leadership, membership, and cross-cutting coordination questions.",
  },
];
export const summitDays: readonly SummitDay[] = [
  {
    day: "Monday",
    dateNumber: "09",
    date: "November",
    label: "Travel day",
    audience: "Arrivals",
    focus: "Travel to London and settle in ahead of the Summit.",
    isTravel: true,
  },
  {
    day: "Tuesday",
    dateNumber: "10",
    date: "November",
    label: "Plenary sessions",
    focus: "Shared Foundation context, group updates, roadmap alignment, and cross-group priorities.",
    isTravel: false,
  },
  {
    day: "Wednesday",
    dateNumber: "11",
    date: "November",
    label: "Working group day",
    focus: "Roadmap planning, deep dives, and hands-on collaboration within and across groups.",
    isTravel: false,
  },
  {
    day: "Thursday",
    dateNumber: "12",
    date: "November",
    label: "Working group day",
    focus: "Continue working sessions, resolve dependencies, and agree on next steps.",
    isTravel: false,
  },
  {
    day: "Friday",
    dateNumber: "13",
    date: "November",
    label: "Travel day",
    audience: "Departures",
    focus: "Depart London after three days of Summit sessions.",
    isTravel: true,
  },
];

export const faqItems: readonly FaqItem[] = [
  {
    question: "When and where is the Summit?",
    answer: "The Summit sessions take place at Meta King's Cross, 11-21 Canal Reach, London, from Tuesday 10 to Thursday 12 November 2026. Monday 9 and Friday 13 November are travel days.",
  },
  {
    question: "Who is invited?",
    answer: "Attendance is invite only for members of the React Foundation working groups. Folks can also self-nominate using the form linked on this page.",
  },
  {
    question: "Is this a public conference?",
    answer: "No. The current format is a working Summit, not a public conference. Non-members of the React Foundation can",
    link: {
      href: "#joining",
      label: "self-nominate using the form.",
    },
  },
  {
    question: "What is the format?",
    answer: "Tuesday is a shared plenary day covering Foundation context, working group updates, roadmap alignment, and cross-group priorities. Wednesday and Thursday are dedicated to working group sessions.",
  },
  {
    question: "What if I belong to more than one working group?",
    answer: "You are not the only one. Overlapping memberships are a known scheduling constraint, especially across DevX and React Native. Working groups may combine or split sessions, and cross-cutting sessions are encouraged. The detailed schedule will be coordinated around known overlaps.",
  },
  {
    question: "Which working groups will meet?",
    answer: "The current plan includes React Native subteams for Core Runtime & Renderer, Platform Expertise, Stable API, and Distribution, alongside React Fiber, DevX / Developer Tools, Server, and Compiler groups.",
  },
  {
    question: "Are travel and accommodation arranged?",
    answer: "The React Foundation will not be able to sponsor travel for every participant. Where possible, we hope participants’ employers will cover their travel and accommodation costs as a way of supporting the Foundation. If you need additional support to attend, however, please reach out to the Foundation directly.",
  },
  {
    question: "Will meals be provided?",
    answer: "Catering and dietary-request details for the event will be shared when the logistics plan is confirmed.",
  },
  {
    question: "When will the detailed agenda be available?",
    answer: "The final agenda will be published in due course.",
  },
  {
    question: "Where will updates be published?",
    answer: "This page is the participant source of truth and will be updated as logistics, travel, and detailed scheduling decisions are finalized.",
    updatedAt: "2 October 2026",
  },
];

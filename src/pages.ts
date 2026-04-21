import type { FC } from "react";
import type {
  CallToAction,
  HeroFigure,
  PageAnchor,
} from "./components/PageScaffold";
import {
  Attributions,
  Contribution,
  Description,
  Education,
  Engineering,
  Entrepreneurship,
  Experiments,
  Hardware,
  Home,
  HumanPractices,
  Inclusivity,
  Measurement,
  Members,
  Model,
  Notebook,
  Plant,
  Results,
  SafetyAndSecurity,
  Software,
  Sustainability,
  WikiExcellence,
} from "./contents";

export interface PageDefinition {
  name: string;
  title?: string;
  path?: string;
  component?: FC;
  lead?: string;
  summaryBullets?: string[];
  anchorSections?: PageAnchor[];
  heroFigure?: HeroFigure;
  ctaLinks?: CallToAction[];
}

export interface FolderDefinition {
  name: string;
  folder: PageDefinition[];
}

const descriptionAnchors: PageAnchor[] = [
  { id: "overview", label: "Overview" },
  { id: "gap", label: "Gap" },
  { id: "design", label: "Design" },
  { id: "validation", label: "Validation" },
  { id: "references", label: "References" },
];

const engineeringAnchors: PageAnchor[] = [
  { id: "cycle", label: "DBTL Cycle" },
  { id: "build", label: "Build" },
  { id: "test", label: "Test" },
  { id: "learn", label: "Learn" },
  { id: "references", label: "References" },
];

const resultsAnchors: PageAnchor[] = [
  { id: "milestones", label: "Milestones" },
  { id: "evidence", label: "Evidence" },
  { id: "limitations", label: "Limits" },
  { id: "next-steps", label: "Next Steps" },
  { id: "references", label: "References" },
];

const hpAnchors: PageAnchor[] = [
  { id: "stakeholders", label: "Stakeholders" },
  { id: "insights", label: "Insights" },
  { id: "changes", label: "Project Changes" },
  { id: "implementation", label: "Implementation" },
  { id: "references", label: "References" },
];

const notebookAnchors: PageAnchor[] = [
  { id: "timeline", label: "Timeline" },
  { id: "wet-lab", label: "Wet Lab" },
  { id: "dry-lab", label: "Dry Lab" },
  { id: "coordination", label: "Coordination" },
  { id: "references", label: "References" },
];

const wikiExcellenceAnchors: PageAnchor[] = [
  { id: "criteria", label: "Criteria" },
  { id: "navigation", label: "Judge Path" },
  { id: "audit", label: "Audit" },
  { id: "handoff", label: "Handoff" },
  { id: "references", label: "References" },
];

const descriptionFigure: HeroFigure = {
  label: "Platform Logic",
  title: "Need -> Bottlenecks -> Cell Factory -> Platform",
  description:
    "This project is strongest when it is framed as an integrated steroid hormone biomanufacturing platform rather than a single optimized pathway.",
  items: [
    "Explain why steroid hormones matter biologically and industrially.",
    "Show why semisynthetic routes still leave a meaningful manufacturing gap.",
    "Introduce fungi or yeast as de novo production hosts from simple carbon sources.",
    "Present metabolism, catalysis, and transport as one integrated project architecture.",
  ],
};

const engineeringFigure: HeroFigure = {
  label: "Engineering Map",
  title: "Flux -> Catalysis -> Transport -> Iteration",
  description:
    "Engineering success for this project means solving the three-layer platform bottleneck through iterative redesign.",
  items: [
    "Push precursor flux toward the steroid scaffold.",
    "Improve side-chain cleavage and hydroxylation through enzyme and redox design.",
    "Relieve intracellular routing, export, and toxicity constraints.",
    "Use DBTL logic to decide which system layer to redesign next.",
  ],
};

const resultsFigure: HeroFigure = {
  label: "Proof Ladder",
  title: "Scaffold -> Conversion -> Compatibility -> Platform",
  description:
    "The most convincing Results page for this theme shows how separate engineering gains start to assemble into a real steroid production platform.",
  items: [
    "Start by showing precursor readiness and chassis capability.",
    "Highlight the key catalytic breakthrough or remaining bottleneck.",
    "Show whether transport or localization mismatches are being relieved.",
    "End by asking whether the platform is becoming more integrated and scalable.",
  ],
};

const hpFigure: HeroFigure = {
  label: "Implementation Loop",
  title: "Medical Need -> Manufacturing Reality -> Responsible Platform",
  description:
    "Integrated Human Practices should show how medical, industrial, and sustainability concerns changed the project's scientific priorities.",
  items: [
    "Ask what better steroid production changes for real users and experts.",
    "Translate manufacturing and scale-up feedback into project requirements.",
    "Connect sustainability claims to actual engineering choices.",
    "Show how outside input reshaped the platform design itself.",
  ],
};

const notebookFigure: HeroFigure = {
  label: "Notebook Rhythm",
  title: "Date -> Action -> Evidence -> Decision",
  description:
    "The notebook should be a readable operational timeline that connects wet lab, dry lab, and team decisions.",
  items: [
    "Keep entries chronological and clearly dated.",
    "State what happened, not just that work occurred.",
    "Attach outcomes to the people or subgroup responsible.",
    "Capture why the next step changed after each checkpoint.",
  ],
};

const homeFigure: HeroFigure = {
  label: "Core Story",
  title: "Simple Carbon Source -> Steroid Hormone -> Intelligent Platform",
  description:
    "The homepage should let a new reader understand why de novo steroid hormone biomanufacturing is both a scientific challenge and a platform opportunity.",
  items: [
    "Lead with the limitations of current steroid manufacturing.",
    "Explain why fungi or yeast are compelling de novo hosts.",
    "Keep the three bottlenecks visible: flux, catalysis, and transport.",
    "Point toward a sustainable, data-driven production platform.",
  ],
};

const wikiExcellenceFigure: HeroFigure = {
  label: "Best Wiki Readiness",
  title: "Story clarity -> Navigation -> Accessibility -> Evidence traceability",
  description:
    "This page keeps wiki quality visible as a project deliverable, not just a final-week decoration task.",
  items: [
    "Make the project understandable within the first minute.",
    "Keep judging pages reachable through obvious routes and anchors.",
    "Preserve core explanations as real, accessible HTML text.",
    "Tie claims back to results, notebook entries, attributions, and references.",
  ],
};

const descriptionCtas: CallToAction[] = [
  { label: "Jump to design logic", href: "#design", variant: "primary" },
  { label: "See engineering page", href: "/engineering", variant: "secondary" },
];

const engineeringCtas: CallToAction[] = [
  { label: "Review the DBTL cycle", href: "#cycle", variant: "primary" },
  { label: "See results page", href: "/results", variant: "secondary" },
];

const resultsCtas: CallToAction[] = [
  { label: "Open milestone view", href: "#milestones", variant: "primary" },
  { label: "Back to engineering", href: "/engineering", variant: "secondary" },
];

const hpCtas: CallToAction[] = [
  { label: "See stakeholder map", href: "#stakeholders", variant: "primary" },
  { label: "Open implementation", href: "#implementation", variant: "secondary" },
];

const notebookCtas: CallToAction[] = [
  { label: "Jump to timeline", href: "#timeline", variant: "primary" },
  { label: "See coordination notes", href: "#coordination", variant: "secondary" },
];

const wikiExcellenceCtas: CallToAction[] = [
  { label: "Open audit checklist", href: "#audit", variant: "primary" },
  { label: "Back to homepage", href: "/", variant: "secondary" },
];

const Pages: (PageDefinition | FolderDefinition)[] = [
  {
    name: "Home",
    title: "Home",
    path: "/",
    component: Home,
    lead: "A story-first homepage for this year's steroid hormone biomanufacturing theme, from simple carbon sources to an intelligent microbial platform.",
    summaryBullets: [
      "Start from the production need before naming the pathway details.",
      "Show the three bottlenecks that define the project: flux, catalysis, and transport.",
      "Route readers from the scientific story into engineering, proof, and implementation pages.",
    ],
    heroFigure: homeFigure,
    ctaLinks: [
      { label: "Open project story", href: "/description", variant: "primary" },
      { label: "Jump to roadmap", href: "#home-roadmap", variant: "secondary" },
    ],
  },
  {
    name: "Team",
    folder: [
      {
        name: "Members",
        title: "Meet Our Team",
        path: "/team",
        component: Members,
        lead: "This page is dedicated to introducing the individuals who made our iGEM project possible. Here, you'll find information about our team members, instructors, and advisors.",
      },
      {
        name: "Attributions",
        title: "Attributions",
        path: "/attributions",
        component: Attributions,
        lead: "Accurate attribution is essential in the iGEM Competition. It ensures that the judges can properly assess your team's contributions and recognize the support provided by external collaborators. This page is dedicated to fulfilling the Attributions requirement for judging.",
      },
    ],
  },
  {
    name: "Project",
    folder: [
      {
        name: "Description",
        title: "Project Description",
        path: "/description",
        component: Description,
        lead: "Explain why steroid hormone production needs a new route and why an integrated microbial platform is the right scientific response.",
        summaryBullets: [
          "Start with the biological and pharmaceutical importance of steroid hormones.",
          "Show why semisynthetic routes still remain feedstock-dependent and inefficient.",
          "Introduce fungi or yeast as de novo hosts and present the three-layer platform strategy.",
        ],
        anchorSections: descriptionAnchors,
        heroFigure: descriptionFigure,
        ctaLinks: descriptionCtas,
      },
      {
        name: "Engineering",
        title: "Engineering Success",
        path: "/engineering",
        component: Engineering,
        lead: "Show how the platform is engineered across precursor flux, P450 catalysis, and transport compatibility through iterative redesign.",
        summaryBullets: [
          "Document which systems layer is limiting each engineering round.",
          "Use edits and measurements to show how flux, catalysis, or transport were improved.",
          "End every cycle by naming the next barrier to platform integration.",
        ],
        anchorSections: engineeringAnchors,
        heroFigure: engineeringFigure,
        ctaLinks: engineeringCtas,
      },
      {
        name: "Results",
        title: "Results",
        path: "/results",
        component: Results,
        lead: "Present the strongest evidence that the steroid hormone platform is becoming viable, while naming the bottlenecks that still remain.",
        summaryBullets: [
          "Organize the page as a proof ladder from scaffold supply to platform integration.",
          "Show catalytic gains and transport compatibility alongside honest remaining limits.",
          "Use the closing section to identify the next limiting layer for industrial relevance.",
        ],
        anchorSections: resultsAnchors,
        heroFigure: resultsFigure,
        ctaLinks: resultsCtas,
      },
      {
        name: "Wiki Excellence",
        title: "Best Wiki Readiness",
        path: "/wiki-excellence",
        component: WikiExcellence,
        lead: "Reserve a dedicated page for Best Wiki preparation: story clarity, judge navigation, accessibility, visual consistency, and evidence traceability.",
        summaryBullets: [
          "Use this page as an internal audit board before the final wiki freeze.",
          "Make page structure, routes, diagrams, and text accessibility visible to the whole team.",
          "Show that the wiki is designed as a judging experience, not assembled as a static report.",
        ],
        anchorSections: wikiExcellenceAnchors,
        heroFigure: wikiExcellenceFigure,
        ctaLinks: wikiExcellenceCtas,
      },
      {
        name: "Contribution",
        title: "Contribution",
        path: "/contribution",
        component: Contribution,
        lead: "Make a useful contribution for future iGEM teams and document it on this page.",
      },
    ],
  },
  {
    name: "Wet Lab",
    folder: [
      {
        name: "Experiments",
        title: "Experiments",
        path: "/experiments",
        component: Experiments,
        lead: "Describe the research, experiments, and protocols you used in your project. It is designed to provide sufficient information for other teams to replicate our work.",
      },
      {
        name: "Notebook",
        title: "Notebook",
        path: "/notebook",
        component: Notebook,
        lead: "Maintain a dated operational record that connects actions, evidence, and next decisions across the season.",
        summaryBullets: [
          "Chronology matters, but so does showing why each entry changed the next step.",
          "Keep wet lab, dry lab, and team coordination aligned in one timeline.",
          "Use concise entries with links to figures, files, and meeting outcomes.",
        ],
        anchorSections: notebookAnchors,
        heroFigure: notebookFigure,
        ctaLinks: notebookCtas,
      },
      {
        name: "Measurement",
        title: "Measurement",
        path: "/measurement",
        component: Measurement,
        lead: "Synthetic Biology needs great measurement approaches for characterizing parts, and efficient new methods for characterizing many parts at once. Describe your measurement approaches on this page.",
      },
      {
        name: "Plant",
        title: "Plant",
        path: "/plant",
        component: Plant,
        lead: "This award is designed to celebrate exemplary work done in plant synthetic biology.",
      },
      {
        name: "Safety and Security",
        title: "Safety and Security",
        path: "/safety-and-security",
        component: SafetyAndSecurity,
        lead: "Detail the safety and security considerations of your project, adressing potential risks and outlining the measures taken to mitigate them.",
      },
    ],
  },
  {
    name: "Dry Lab",
    folder: [
      {
        name: "Model",
        title: "Model",
        path: "/model",
        component: Model,
        lead: "Explain your model's assumptions, data, parameters, and results in a way that anyone could understand.",
      },
      {
        name: "Software",
        title: "Software",
        path: "/software",
        component: Software,
        lead: "Software in iGEM should make synthetic biology based on standard parts easier, faster, better or more accessible to our community.",
      },
      {
        name: "Hardware",
        title: "Hardware",
        path: "/hardware",
        component: Hardware,
        lead: "Hardware in iGEM should make synthetic biology based on standard parts easier, faster, better, or more accessible to our community.",
      },
    ],
  },
  {
    name: "Engagement",
    folder: [
      {
        name: "Entrepreneurship",
        title: "Entrepreneurship",
        path: "/entrepreneurship",
        component: Entrepreneurship,
        lead: "The entrepreneurship prize recognizes exceptional effort to build a business case and commercialize an iGEM project.",
      },
      {
        name: "Human Practices",
        title: "Human Practices",
        path: "/human-practices",
        component: HumanPractices,
        lead: "Explain how medical relevance, manufacturing reality, and sustainability concerns reshaped the scientific priorities of the platform.",
        summaryBullets: [
          "Map the people and systems affected by better steroid hormone production.",
          "Translate industrial and sustainability feedback into project requirements.",
          "Show how outside input changed which platform bottlenecks mattered most.",
        ],
        anchorSections: hpAnchors,
        heroFigure: hpFigure,
        ctaLinks: hpCtas,
      },
      {
        name: "Education",
        title: "Education",
        path: "/education",
        component: Education,
        lead: "Innovative educational tools and outreach activities have the ability to establish a two-way dialogue with new communities by discussing public values and the science behind synthetic biology.",
      },
      {
        name: "Inclusivity",
        title: "Diversity and Inclusion",
        path: "/inclusivity",
        component: Inclusivity,
        lead: "Every individual, regardless of background or experience, should have an equal opportunity to engage with scientific knowledge and technological development.",
      },
      {
        name: "Sustainability",
        title: "Sustainability",
        path: "/sustainability",
        component: Sustainability,
        lead: "Describe how you have evaluated your project ideas against one or more of the SDGs.",
      },
    ],
  },
];

export default Pages;

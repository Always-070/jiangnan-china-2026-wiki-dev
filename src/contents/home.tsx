import {
  EvidenceGrid,
  FlowDiagram,
  MetricStrip,
  PageIntro,
  ReferenceBlock,
  SectionNav,
} from "../components/PageScaffold";

const homeSections = [
  { id: "home-roadmap", label: "Roadmap" },
  { id: "home-tracks", label: "Modules" },
  { id: "home-progress", label: "Proof Agenda" },
  { id: "home-references", label: "References" },
];

const sceneCards = [
  {
    label: "Pressure",
    title: "Steroid hormones matter, but current production is cumbersome",
    text: "Traditional routes still rely heavily on plant or animal sterol feedstocks and multistep chemical or microbial transformations that are difficult to scale cleanly.",
  },
  {
    label: "Breakthrough",
    title: "Yeasts and fungi can build the steroid scaffold de novo",
    text: "Instead of upgrading external sterols, engineered fungal hosts can turn simple carbon sources into sterol nuclei through the mevalonate pathway.",
  },
  {
    label: "Ambition",
    title: "The project is bigger than a single enzyme or titer",
    text: "Our direction is to integrate flux rewiring, P450 catalysis, and transport redesign into an intelligent steroid hormone biomanufacturing platform.",
  },
];

const roadmapSteps = [
  {
    label: "Need",
    title: "Steroid hormones are essential but hard to make well",
    text: "These molecules regulate metabolism, reproduction, stress adaptation, and are widely used as valuable pharmaceuticals.",
  },
  {
    label: "Gap",
    title: "De novo biosynthesis is blocked by three bottlenecks",
    text: "Precursor supply, side-chain cleavage and hydroxylation, and intracellular transport/export all limit performance in microbial hosts.",
  },
  {
    label: "Build",
    title: "Reprogram the cell factory around those bottlenecks",
    text: "Use metabolic rewiring, enzyme engineering, and transport engineering to push carbon flux, improve catalysis, and relieve toxicity.",
  },
  {
    label: "Impact",
    title: "Move toward an intelligent biomanufacturing platform",
    text: "The long-term goal is a scalable, data-driven, sustainable microbial platform for steroid hormone production from simple carbon sources.",
  },
];

const readingTracks = [
  {
    status: "Description",
    title: "Why steroid hormone biomanufacturing needs a new route",
    description:
      "This track frames the medical and industrial relevance of steroid hormones, the limitations of semisynthesis, and why de novo microbial production is worth pursuing.",
    metric: "Need, chassis, project logic",
    href: "/description",
  },
  {
    status: "Engineering",
    title: "How the cell factory is redesigned",
    description:
      "This page focuses on the three engineering layers: precursor flux rewiring, P450 side-chain cleavage and hydroxylation, and transport compatibility across organelles and membranes.",
    metric: "Flux, catalysis, transport",
    href: "/engineering",
  },
  {
    status: "Results",
    title: "What the platform must eventually prove",
    description:
      "Results will be organized as a proof ladder from sterol scaffold supply to catalytic conversion, export robustness, and integrated platform performance.",
    metric: "Scaffold, conversion, export, platform",
    href: "/results",
  },
  {
    status: "Human Practices",
    title: "Why sustainability and implementation matter",
    description:
      "This track links pharmaceutical access, green manufacturing, biosafety, and industrial feasibility to the decisions made in the project itself.",
    metric: "Stakeholders, responsibility, deployment",
    href: "/human-practices",
  },
  {
    status: "Best Wiki",
    title: "How the wiki itself is designed to compete",
    description:
      "This reserved page keeps the team's wiki-quality checklist visible: story clarity, judge navigation, accessibility, reusable diagrams, and evidence traceability.",
    metric: "Clarity, access, audit",
    href: "/wiki-excellence",
  },
];

const proofAgenda = [
  {
    status: "Workstream 1",
    title: "Increase flux toward the steroid scaffold",
    description:
      "Strengthen precursor supply from simple carbon sources by rewiring the mevalonate pathway, host metabolism, and subcellular organization.",
    metric: "Flux and chassis readiness",
  },
  {
    status: "Workstream 2",
    title: "Break the catalytic bottleneck at side-chain cleavage and hydroxylation",
    description:
      "Improve rate-limiting enzymes, especially P450-driven reactions, through host-compatible design, electron transfer engineering, and pathway balancing.",
    metric: "Catalysis and selectivity",
  },
  {
    status: "Workstream 3",
    title: "Relieve intracellular accumulation and export constraints",
    description:
      "Redesign transport among LDs, ER, mitochondria, plasma membrane, and cell wall so hydrophobic intermediates stop acting like hidden toxicity traps.",
    metric: "Transport and robustness",
  },
  {
    status: "Workstream 4",
    title: "Assemble a data-driven microbial production platform",
    description:
      "Use DBTL logic, AI-guided design, and iterative measurement to turn separate engineering wins into a scalable steroid hormone biomanufacturing workflow.",
    metric: "Platform integration",
  },
];

const referenceItems = [
  {
    label: "Chen et al. 2025 review on steroid hormone biosynthesis",
    href: "https://doi.org/10.1016/j.tibtech.2025.12.012",
    note: "The core review that defines this year's problem framing, bottlenecks, and platform vision.",
  },
  {
    label: "BASIS-China 2023",
    href: "https://2023.igem.wiki/basis-china/",
    note: "A benchmark for long-form scientific storytelling that still keeps the reader oriented.",
  },
  {
    label: "TJI-Seoul 2025",
    href: "https://2025.igem.wiki/tji-seoul",
    note: "Useful for chapter-based homepage pacing and integrated Human Practices logic.",
  },
  {
    label: "UppsalaUniversity 2025",
    href: "https://2025.igem.wiki/uppsalauniversity/index.html",
    note: "Helpful for keeping a scientific homepage readable under judge time pressure.",
  },
  {
    label: "iGEM Team Wiki deliverables",
    href: "https://competition.igem.org/deliverables/team-wiki",
    note: "Official requirements for repository links, hosted assets, and page delivery.",
  },
];

export function Home() {
  return (
    <>
      <section className="home-hero-shell">
        <div className="container">
          <PageIntro
            eyebrow="Jiangnan University x iGEM 2026"
            title="From simple carbon sources to steroid hormones: redesign the cell factory, then let the platform scale."
            summary="This year's wiki is built around one scientific story: replacing feedstock-dependent steroid production with a sustainable and intelligent microbial platform that integrates metabolic rewiring, enzyme engineering, and transport redesign."
            bullets={[
              "Start from the pharmaceutical and manufacturing need, not from a list of enzymes.",
              "Keep the three bottlenecks visible: flux, catalysis, and transport.",
              "End every page by pointing back to the intelligent, scalable platform vision.",
            ]}
            ctaLinks={[
              { label: "Open the project description", href: "/description", variant: "primary" },
              { label: "Jump to the roadmap", href: "#home-roadmap", variant: "secondary" },
              { label: "Best Wiki audit", href: "/wiki-excellence", variant: "secondary" },
            ]}
            heroFigure={{
              label: "Project Arc",
              title: "Need -> Bottlenecks -> Engineered Cell Factory -> Intelligent Platform",
              description:
                "The homepage should let a reader understand the whole project logic before they read a single experiment.",
              items: [
                "Why steroid hormone production still needs a better route",
                "Why fungi and yeasts are attractive chassis",
                "Why P450 catalysis and transport remain decisive bottlenecks",
                "Why the long-term goal is a sustainable, data-driven platform",
              ],
            }}
          />

          <MetricStrip
            items={[
              {
                label: "Target",
                value: "Steroid hormones",
                note: "A medically important family of molecules with broad roles in metabolism, reproduction, stress, and therapy.",
              },
              {
                label: "Starting point",
                value: "Simple carbon source",
                note: "The platform vision is de novo biosynthesis rather than sterol-dependent semisynthesis.",
              },
              {
                label: "Core bottlenecks",
                value: "3 layers",
                note: "Metabolic flux, catalytic conversion, and transport/export are the dominant barriers.",
              },
              {
                label: "Destination",
                value: "Intelligent platform",
                note: "DBTL, AI-guided design, and scalable fermentation define the long-term direction.",
              },
            ]}
          />

          <div className="story-band story-band-hero">
            <div>
              <span className="story-band-label">Theme statement</span>
              <h2 className="story-band-title">This is not just a pathway project. It is a manufacturing-platform project.</h2>
            </div>
            <p className="story-band-text">
              The most important shift in this year's story is moving from isolated biosynthetic
              steps to an integrated and sustainable steroid hormone production system.
            </p>
          </div>

          <div className="scene-grid">
            {sceneCards.map((scene) => (
              <article className="scene-card" key={scene.title}>
                <span>{scene.label}</span>
                <h3>{scene.title}</h3>
                <p>{scene.text}</p>
              </article>
            ))}
          </div>

          <SectionNav sections={homeSections} />
        </div>
      </section>

      <section id="home-roadmap" className="container story-section">
        <div className="section-shell section-shell-emerald">
          <div className="section-heading">
            <h2>The homepage roadmap</h2>
            <p>
              This is the backbone the rest of the wiki should inherit. If a reader understands
              this sequence, every later page becomes easier to justify and easier to remember.
            </p>
          </div>
          <div className="split-layout">
            <FlowDiagram
              title="One scientific arc for the whole project"
              lead="The homepage should move from medical and industrial necessity to the three engineering bottlenecks, and then forward into the platform vision."
              steps={roadmapSteps}
            />
            <aside className="quote-card">
              <span className="quote-mark">Reader memory</span>
              <h3>The site should leave readers with one clear memory: steroid hormone biomanufacturing becomes possible only when flux, catalysis, and transport are solved together.</h3>
              <p>
                That systems view is stronger than presenting the project as just one new enzyme
                or one higher titer.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section id="home-tracks" className="container story-section">
        <div className="story-band">
          <div>
            <span className="story-band-label">Reading logic</span>
            <h2 className="story-band-title">Each page should deepen one part of the same platform story.</h2>
          </div>
          <p className="story-band-text">
            The homepage is where we split the full project into readable modules without
            breaking the scientific continuity.
          </p>
        </div>
        <EvidenceGrid items={readingTracks} />
      </section>

      <section id="home-progress" className="container story-section">
        <div className="section-shell section-shell-amber">
          <div className="section-heading">
            <h2>The proof agenda for this season</h2>
            <p>
              Even before all experiments are finished, the homepage can already tell readers
              exactly what the project needs to prove to become a real platform.
            </p>
          </div>
          <EvidenceGrid items={proofAgenda} />
        </div>
      </section>

      <section id="home-references" className="container story-section story-section-last">
        <ReferenceBlock title="References that shape this year's story" items={referenceItems} />
      </section>
    </>
  );
}

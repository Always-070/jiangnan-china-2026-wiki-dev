import {
  EvidenceGrid,
  FlowDiagram,
  MetricStrip,
  ReferenceBlock,
} from "../components/PageScaffold";

const descriptionReferences = [
  {
    label: "Chen et al. 2025 review on steroid hormone biosynthesis",
    href: "https://doi.org/10.1016/j.tibtech.2025.12.012",
    note: "The direct thematic source for the project's framing around de novo biosynthesis, P450 bottlenecks, and transport redesign.",
  },
  {
    label: "iGEM medal criteria",
    href: "https://competition.igem.org/judging/medals",
    note: "Use the official judging language so the Description page remains competition-aligned.",
  },
  {
    label: "UppsalaUniversity 2025",
    href: "https://2025.igem.wiki/uppsalauniversity/index.html",
    note: "A useful reference for keeping a technically complex project easy to follow.",
  },
];

const pillarCards = [
  {
    status: "Pillar 1",
    title: "Metabolic rewiring toward the steroid scaffold",
    description:
      "The chassis must channel carbon from simple feedstocks into sterol precursors efficiently enough for downstream hormone synthesis to become realistic.",
    metric: "Flux to precursor nucleus",
  },
  {
    status: "Pillar 2",
    title: "Enzyme engineering for side-chain cleavage and hydroxylation",
    description:
      "The project must address the rate-limiting catalytic barrier that separates sterol accumulation from real hormone production.",
    metric: "Catalytic conversion logic",
  },
  {
    status: "Pillar 3",
    title: "Transport and export redesign for hydrophobic intermediates",
    description:
      "A viable cell factory must manage intracellular routing, membrane translocation, and toxicity caused by accumulating steroid intermediates.",
    metric: "Transport-compatible platform",
  },
];

const summaryScenes = [
  {
    label: "Why now",
    title: "Steroid hormones are biologically central and industrially valuable",
    text: "Because these molecules regulate core physiology and underpin important therapeutics, better production systems matter far beyond academic curiosity.",
  },
  {
    label: "Why de novo",
    title: "Semisynthesis still depends on cumbersome feedstocks and processes",
    text: "The transition from plant or animal sterols to simple carbon sources is the real sustainability leap behind the project.",
  },
  {
    label: "Why this project",
    title: "The challenge is not one step but a multi-layer system bottleneck",
    text: "That is why the project is framed as an integrated platform problem spanning metabolism, catalysis, and transport.",
  },
];

export function Description() {
  return (
    <>
      <section id="overview" className="story-section story-section-first">
        <div className="section-heading">
          <h2>One-page summary</h2>
          <p>
            This page should explain why steroid hormone biomanufacturing needs a new route,
            why yeasts or fungi are attractive chassis, and why the project is designed as a
            platform rather than a single-pathway optimization.
          </p>
        </div>
        <MetricStrip
          items={[
            {
              label: "Need",
              value: "High-value therapeutics",
              note: "Steroid hormones regulate core physiology and are widely used in pharmaceutical applications.",
            },
            {
              label: "Barrier",
              value: "Feedstock-dependent semisynthesis",
              note: "Traditional routes remain constrained by agricultural or animal-derived sterols and multistep processing.",
            },
            {
              label: "Host logic",
              value: "Fungal cell factories",
              note: "Yeasts and fungi can construct sterol nuclei de novo from simple carbon sources through the MVA pathway.",
            },
            {
              label: "Vision",
              value: "Intelligent biomanufacturing",
              note: "The project aims beyond one compound toward a scalable, data-driven steroid production platform.",
            },
          ]}
        />

        <div className="story-band">
          <div>
            <span className="story-band-label">Page intention</span>
            <h2 className="story-band-title">Description is where the project stops sounding like a pathway and starts sounding like a strategy.</h2>
          </div>
          <p className="story-band-text">
            Readers should leave this page believing not only that steroid hormone production is
            important, but also that an integrated microbial route is a rational and timely answer.
          </p>
        </div>

        <div className="scene-grid scene-grid-tight">
          {summaryScenes.map((scene) => (
            <article className="scene-card" key={scene.title}>
              <span>{scene.label}</span>
              <h3>{scene.title}</h3>
              <p>{scene.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="gap" className="story-section">
        <div className="section-shell section-shell-steel">
          <FlowDiagram
            title="The project logic in one readable chain"
            lead="This page should move from pharmaceutical relevance to production bottlenecks, and then into the integrated cell-factory solution."
            steps={[
              {
                label: "Need",
                title: "Steroid hormones are essential molecules and major pharmaceuticals",
                text: "They regulate metabolism, reproduction, stress adaptation, and other key physiological programs, which makes reliable production strategically important.",
              },
              {
                label: "Gap",
                title: "Current manufacturing routes are still inefficient and feedstock-bound",
                text: "Semisynthetic and biotransformation-based approaches depend on external sterols and suffer from process complexity and scalability constraints.",
              },
              {
                label: "Chance",
                title: "Engineered fungi can build the sterol scaffold from simple carbon",
                text: "This makes de novo microbial biosynthesis a credible route toward greener and more controllable steroid production.",
              },
              {
                label: "Answer",
                title: "The project integrates metabolism, catalysis, and transport",
                text: "The design targets the system bottlenecks together instead of optimizing one isolated step in an otherwise fragile pathway.",
              },
            ]}
          />
        </div>
      </section>

      <section id="design" className="story-section">
        <div className="section-heading">
          <h2>Three design pillars that define the project</h2>
          <p>
            These pillars come directly from the review article and should stay visible
            throughout the season, even after real experimental detail is added.
          </p>
        </div>
        <div className="split-layout">
          <EvidenceGrid items={pillarCards} />
          <aside className="quote-card">
            <span className="quote-mark">Core framing</span>
            <h3>This project is strongest when presented as a coordinated steroid hormone platform, not as a disconnected list of host edits and enzymes.</h3>
            <p>
              That framing makes later Engineering and Results pages feel like the natural
              continuation of the same scientific argument.
            </p>
          </aside>
        </div>
      </section>

      <section id="validation" className="story-section">
        <div className="story-band">
          <div>
            <span className="story-band-label">Hand-off logic</span>
            <h2 className="story-band-title">Description should hand the reader from necessity to mechanism, then forward to evidence.</h2>
          </div>
          <p className="story-band-text">
            Keep here the medical and manufacturing need, the host logic, and the integrated
            strategy. Let later pages prove the individual modules.
          </p>
        </div>
        <div className="split-layout">
          <article className="content-card narrative-card">
            <span className="track-tag">Keep here</span>
            <ul className="card-list">
              <li>The biological and pharmaceutical importance of steroid hormones.</li>
              <li>The limitations of existing semisynthetic production routes.</li>
              <li>The reason yeasts or fungi are compelling de novo production hosts.</li>
              <li>The integrated project architecture built around three bottlenecks.</li>
            </ul>
          </article>
          <article className="content-card narrative-card">
            <span className="track-tag">Push forward</span>
            <ul className="card-list">
              <li>Detailed pathway rewiring and chassis engineering to Engineering.</li>
              <li>Measured titers, conversions, and bottleneck relief to Results.</li>
              <li>Manufacturing and deployment consequences to Human Practices.</li>
              <li>Chronological lab execution to Notebook and Wet Lab pages.</li>
            </ul>
          </article>
        </div>
      </section>

      <section id="references" className="story-section story-section-last">
        <ReferenceBlock title="References and framing sources" items={descriptionReferences} />
      </section>
    </>
  );
}

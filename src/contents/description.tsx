import {
  EvidenceGrid,
  FlowDiagram,
  ReferenceBlock,
} from "../components/PageScaffold";
import { NextStopBanner, RouteComparison } from "../components/AtlasShowpieces";
import { ProjectArchitectureMap } from "../components/ProjectArchitectureMap";

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

export function Description() {
  return (
    <>
      <section id="overview" className="story-section story-section-first">
        <div className="section-heading">
          <h2>Spatial folding of the steroid manufacturing route</h2>
          <p>
            Scroll through the central scaffold: the feedstock-bound route
            collapses under its scalability burden, while the fungal
            cell-factory route lights up as a platform answer.
          </p>
        </div>
        <RouteComparison />
        <ProjectArchitectureMap variant="story" defaultActiveNode="scaffold" />

        <div className="story-band">
          <div>
            <span className="story-band-label">Reading logic</span>
            <h2 className="story-band-title">
              Need, Gap, and Platform Answer are part of the same spatial
              argument.
            </h2>
          </div>
          <p className="story-band-text">
            The Description page now asks readers to compare two manufacturing
            spaces: a brittle extraction stack on the left and a programmable
            fungal network on the right, both pivoting around the steroid
            four-ring scaffold.
          </p>
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
                title:
                  "Steroid hormones are essential molecules and major pharmaceuticals",
                text: "They regulate metabolism, reproduction, stress adaptation, and other key physiological programs, which makes reliable production strategically important.",
              },
              {
                label: "Gap",
                title:
                  "Current manufacturing routes are still inefficient and feedstock-bound",
                text: "Semisynthetic and biotransformation-based approaches depend on external sterols and suffer from process complexity and scalability constraints.",
              },
              {
                label: "Chance",
                title:
                  "Engineered fungi can build the sterol scaffold from simple carbon",
                text: "This makes de novo microbial biosynthesis a credible route toward greener and more controllable steroid production.",
              },
              {
                label: "Answer",
                title:
                  "The project integrates metabolism, catalysis, and transport",
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
            These pillars come directly from the review article and should stay
            visible throughout the season, even after real experimental detail
            is added.
          </p>
        </div>
        <div className="split-layout">
          <EvidenceGrid items={pillarCards} />
          <aside className="quote-card">
            <span className="quote-mark">Core framing</span>
            <h3>
              This project is strongest when presented as a coordinated steroid
              hormone platform, not as a disconnected list of host edits and
              enzymes.
            </h3>
            <p>
              That framing makes later Engineering and Results pages feel like
              the natural continuation of the same scientific argument.
            </p>
          </aside>
        </div>
      </section>

      <section id="validation" className="story-section">
        <div className="story-band">
          <div>
            <span className="story-band-label">Hand-off logic</span>
            <h2 className="story-band-title">
              Description should hand the reader from necessity to mechanism,
              then forward to evidence.
            </h2>
          </div>
          <p className="story-band-text">
            Keep here the medical and manufacturing need, the host logic, and
            the integrated strategy. Let later pages prove the individual
            modules.
          </p>
        </div>
        <div className="split-layout">
          <article className="content-card narrative-card">
            <span className="track-tag">Keep here</span>
            <ul className="card-list">
              <li>
                The biological and pharmaceutical importance of steroid
                hormones.
              </li>
              <li>
                The limitations of existing semisynthetic production routes.
              </li>
              <li>
                The reason yeasts or fungi are compelling de novo production
                hosts.
              </li>
              <li>
                The integrated project architecture built around three
                bottlenecks.
              </li>
            </ul>
          </article>
          <article className="content-card narrative-card">
            <span className="track-tag">Push forward</span>
            <ul className="card-list">
              <li>
                Detailed pathway rewiring and chassis engineering to
                Engineering.
              </li>
              <li>
                Measured titers, conversions, and bottleneck relief to Results.
              </li>
              <li>
                Manufacturing and deployment consequences to Human Practices.
              </li>
              <li>
                Chronological lab execution to Notebook and Wet Lab pages.
              </li>
            </ul>
          </article>
        </div>
      </section>

      <section id="references" className="story-section story-section-last">
        <ReferenceBlock
          title="References and framing sources"
          items={descriptionReferences}
        />
        <NextStopBanner
          eyebrow="Next Stop"
          title="Engineering turns the platform answer into an interactive control map."
          text="Follow the DBTL loop through flux, P450 catalysis, and transport compatibility."
          href="/engineering"
          actionLabel="Continue to Engineering"
        />
      </section>
    </>
  );
}

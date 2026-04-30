import {
  EvidenceGrid,
  FlowDiagram,
  MetricStrip,
  ReferenceBlock,
} from "../components/PageScaffold";
import { MetabolicControlMap, NextStopBanner } from "../components/AtlasShowpieces";

const engineeringReferences = [
  {
    label: "Chen et al. 2025 review on steroid hormone biosynthesis",
    href: "https://doi.org/10.1016/j.tibtech.2025.12.012",
    note: "Provides the project's core engineering map: precursor supply, P450 catalysis, and transport redesign.",
  },
  {
    label: "iGEM engineering guidance",
    href: "https://technology.igem.org/engineering",
    note: "Keeps the page grounded in DBTL logic instead of turning it into a method archive.",
  },
  {
    label: "iGEM medal criteria",
    href: "https://competition.igem.org/judging/medals",
    note: "Engineering success still needs to read like iterative decision-making for judges.",
  },
];

const engineeringBlocks = [
  {
    status: "Module 1",
    title: "Push carbon toward the steroid scaffold",
    description:
      "Document how the chassis is rewired to increase precursor availability, stabilize flux through the MVA pathway, and support sterol nucleus formation from simple carbon sources.",
    metric: "Flux architecture",
  },
  {
    status: "Module 2",
    title: "Unlock catalytic bottlenecks in side-chain cleavage and hydroxylation",
    description:
      "Show how P450 choice, electron transfer engineering, host compatibility, and redox balance are redesigned to improve steroid conversion efficiency.",
    metric: "Catalytic redesign",
  },
  {
    status: "Module 3",
    title: "Make transport compatible with high-level production",
    description:
      "Explain how organelle routing, storage, plasma membrane export, and cell-wall passage are managed so hydrophobic intermediates stop limiting the platform.",
    metric: "Transport robustness",
  },
];

export function Engineering() {
  return (
    <>
      <section id="cycle" className="story-section story-section-first">
        <div className="section-heading">
          <h2>Engineering success begins by naming the true bottleneck layer</h2>
          <p>
            For this project, engineering is not just about assembling a pathway. It is about
            iteratively solving a three-layer systems problem: precursor flux, catalytic
            conversion, and transport compatibility.
          </p>
        </div>
        <MetricStrip
          items={[
            {
              label: "Flux layer",
              value: "Precursor supply",
              note: "The chassis must reliably push carbon into sterol precursors before later steps become meaningful.",
            },
            {
              label: "Catalysis layer",
              value: "P450 bottlenecks",
              note: "Side-chain cleavage and hydroxylation depend on enzyme choice, redox balance, and host compatibility.",
            },
            {
              label: "Transport layer",
              value: "Hydrophobic routing",
              note: "LDs, ER, mitochondria, membranes, and cell wall all influence productivity and toxicity.",
            },
            {
              label: "Optimization mode",
              value: "DBTL + AI",
              note: "The long-term platform vision relies on iterative learning and data-guided redesign.",
            },
          ]}
        />
        <MetabolicControlMap />
      </section>

      <section id="build" className="story-section">
        <div className="section-shell section-shell-emerald">
          <FlowDiagram
            title="A DBTL loop for a steroid hormone cell factory"
            lead="The page should show how each engineering round identifies which layer is failing, then rebuilds the system around that specific constraint."
            variant="loop"
            steps={[
              {
                label: "Design",
                title: "Map which layer currently limits the platform",
                text: "Decide whether the main failure is flux shortage, poor catalytic conversion, or transport-driven toxicity and accumulation.",
              },
              {
                label: "Build",
                title: "Rewire the host and pathway around that bottleneck",
                text: "Construct the next strain or module through host edits, enzyme redesign, organelle targeting, redox tuning, or transporter engineering.",
              },
              {
                label: "Test",
                title: "Measure conversion, selectivity, and strain behavior together",
                text: "Evaluate not just titer, but also catalytic performance, byproducts, localization mismatch, and cellular stress.",
              },
              {
                label: "Learn",
                title: "Turn the readout into the next systems decision",
                text: "Use the data to decide which layer should be attacked next and whether the platform is becoming more scalable and coherent.",
              },
            ]}
          />
        </div>
      </section>

      <section id="test" className="story-section">
        <div className="section-heading">
          <h2>Three engineering blocks the page should document clearly</h2>
          <p>
            These blocks are the most readable way to show that the project is engineering a
            platform rather than merely stacking experiments.
          </p>
        </div>
        <div className="split-layout">
          <EvidenceGrid items={engineeringBlocks} />
          <aside className="quote-card">
            <span className="quote-mark">Engineering focus</span>
            <h3>The page becomes persuasive when readers can see why each edit exists inside the larger platform logic.</h3>
            <p>
              Strong engineering storytelling is not about volume of detail. It is about making
              each redesign legible and necessary.
            </p>
          </aside>
        </div>
      </section>

      <section id="learn" className="story-section">
        <div className="story-band">
          <div>
            <span className="story-band-label">Judge takeaway</span>
            <h2 className="story-band-title">By the end of Engineering, the reader should know which bottlenecks were attacked and why the platform is technically stronger.</h2>
          </div>
          <p className="story-band-text">
            For this project, strong engineering success means the cell factory becomes more
            flux-capable, more catalytically competent, and more transport-compatible after
            iteration.
          </p>
        </div>
        <div className="split-layout">
          <article className="content-card narrative-card">
            <span className="track-tag">Strong signals</span>
            <ul className="card-list">
              <li>Each round identifies which systems layer is actually limiting progress.</li>
              <li>P450 or transport edits are justified by a specific conversion or toxicity problem.</li>
              <li>Measurements show both product formation and host-level consequences.</li>
              <li>The next redesign is a direct response to the previous failure mode.</li>
            </ul>
          </article>
          <article className="content-card narrative-card">
            <span className="track-tag">Weak signals</span>
            <ul className="card-list">
              <li>Listing edits without saying which bottleneck layer they target.</li>
              <li>Showing titer only, while ignoring byproducts, export, or strain robustness.</li>
              <li>Treating transport issues as downstream cleanup instead of an engineering core.</li>
              <li>Calling pathway assembly alone an iterative success story.</li>
            </ul>
          </article>
        </div>
      </section>

      <section id="references" className="story-section story-section-last">
        <ReferenceBlock title="References and engineering guidance" items={engineeringReferences} />
        <NextStopBanner
          eyebrow="Next Stop"
          title="Results turns the control map into a proof spiral."
          text="Move from design intent into scaffold supply, catalytic conversion, transport compatibility, and platform coherence."
          href="/results"
          actionLabel="Continue to Results"
        />
      </section>
    </>
  );
}

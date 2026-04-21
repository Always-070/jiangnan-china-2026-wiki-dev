import {
  EvidenceGrid,
  FlowDiagram,
  MetricStrip,
  ReferenceBlock,
} from "../components/PageScaffold";

const resultsReferences = [
  {
    label: "Chen et al. 2025 review on steroid hormone biosynthesis",
    href: "https://doi.org/10.1016/j.tibtech.2025.12.012",
    note: "Sets the proof agenda around precursor supply, catalytic conversion, transport, and intelligent platform integration.",
  },
  {
    label: "iGEM medal criteria",
    href: "https://competition.igem.org/judging/medals",
    note: "Use this to keep the Results page aligned with what judges expect to see documented.",
  },
  {
    label: "Patras_Medicine 2022",
    href: "https://2022.igem.wiki/patras-medicine/",
    note: "A useful benchmark for converting technical progress into a readable scientific narrative.",
  },
];

const proofScenes = [
  {
    label: "Flux",
    title: "Did the chassis supply the steroid scaffold effectively?",
    text: "The first proof block should show whether carbon is reaching the intended precursor state strongly enough to justify downstream engineering.",
  },
  {
    label: "Catalysis",
    title: "Did the key conversion actually become possible?",
    text: "Results must show whether side-chain cleavage, hydroxylation, or other rate-limiting steps moved beyond theory into measurable behavior.",
  },
  {
    label: "Transport",
    title: "Did the system remain productive and robust?",
    text: "Because hydrophobic intermediates can become hidden toxicity problems, the page should show whether the platform improved in stability as well as in titer.",
  },
];

const milestoneCards = [
  {
    status: "Milestone 1",
    title: "Sterol scaffold supply becomes credible",
    description:
      "Document the evidence that the host is building or accumulating the upstream steroid precursor state needed for downstream hormone biosynthesis.",
    metric: "Precursor readiness",
  },
  {
    status: "Milestone 2",
    title: "A catalytic bottleneck is measurably relieved",
    description:
      "Show where side-chain cleavage, hydroxylation, or related rate-limiting chemistry begins to move in the intended direction.",
    metric: "Conversion gain",
  },
  {
    status: "Milestone 3",
    title: "Transport or compartment mismatch is reduced",
    description:
      "Present the result that most clearly indicates improved routing, reduced accumulation, stronger export, or better strain robustness.",
    metric: "Compatibility improvement",
  },
  {
    status: "Milestone 4",
    title: "The platform starts to look integrated rather than modular only",
    description:
      "Summarize the result that best proves multiple engineering layers are beginning to work together instead of canceling each other out.",
    metric: "Platform coherence",
  },
];

export function Results() {
  return (
    <>
      <section id="milestones" className="story-section story-section-first">
        <div className="section-heading">
          <h2>Results should read like a platform proof ladder</h2>
          <p>
            The strongest way to organize this year's results is to show how the platform
            gradually becomes viable: first by supplying the scaffold, then by enabling key
            catalysis, then by reducing transport-driven instability.
          </p>
        </div>
        <MetricStrip
          items={[
            {
              label: "Proof 1",
              value: "Scaffold supply",
              note: "Readers need to know whether the upstream metabolic chassis is doing enough work to support the rest of the project.",
            },
            {
              label: "Proof 2",
              value: "Catalytic conversion",
              note: "Side-chain cleavage and hydroxylation should be presented as decisive platform checkpoints.",
            },
            {
              label: "Proof 3",
              value: "Transport compatibility",
              note: "A better cell factory is not only higher titer, but also less burdened by toxic accumulation and routing failure.",
            },
            {
              label: "Proof 4",
              value: "Integrated platform",
              note: "The page should make it clear whether separate improvements now reinforce each other.",
            },
          ]}
        />

        <div className="story-band">
          <div>
            <span className="story-band-label">Page intention</span>
            <h2 className="story-band-title">Results should show whether the platform is becoming real, not just whether one module looks promising.</h2>
          </div>
          <p className="story-band-text">
            That means every block needs to relate back to the integrated production goal,
            rather than reading like an isolated assay success.
          </p>
        </div>

        <div className="scene-grid scene-grid-tight">
          {proofScenes.map((scene) => (
            <article className="scene-card" key={scene.title}>
              <span>{scene.label}</span>
              <h3>{scene.title}</h3>
              <p>{scene.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="evidence" className="story-section">
        <div className="section-shell section-shell-emerald">
          <FlowDiagram
            title="How to sequence this year's results"
            lead="For this project, the Results page should show how evidence moves from chassis readiness to catalytic breakthrough and then to whole-platform stability."
            steps={[
              {
                label: "Scaffold",
                title: "Show the precursor base is strong enough",
                text: "Start with the evidence that simple carbon sources are being translated into the steroid scaffold or its immediate precursor state effectively.",
              },
              {
                label: "Conversion",
                title: "Show the key chemistry begins to work",
                text: "Demonstrate the step where rate-limiting conversion, such as side-chain cleavage or hydroxylation, becomes measurably possible.",
              },
              {
                label: "Compatibility",
                title: "Show the host handles the pathway better",
                text: "Present the evidence that accumulation, localization mismatch, membrane stress, or export limitations are being reduced.",
              },
              {
                label: "Platform",
                title: "Show the system is becoming integrated",
                text: "Use the strongest combined result to argue that metabolism, catalysis, and transport are beginning to function as one production platform.",
              },
            ]}
          />
        </div>
      </section>

      <section id="limitations" className="story-section">
        <div className="section-heading">
          <h2>Milestone blocks to fill with real data later</h2>
          <p>
            These are the result categories most aligned with the review article and with how
            a judge will understand progress toward the final platform vision.
          </p>
        </div>
        <div className="split-layout">
          <EvidenceGrid items={milestoneCards} />
          <aside className="quote-card">
            <span className="quote-mark">Result balance</span>
            <h3>The page is most convincing when it pairs one strong gain with one clearly named remaining bottleneck.</h3>
            <p>
              For a platform project, honesty about the next limiting layer often makes the
              current achievement more credible, not less.
            </p>
          </aside>
        </div>
      </section>

      <section id="next-steps" className="story-section">
        <div className="story-band">
          <div>
            <span className="story-band-label">Closing move</span>
            <h2 className="story-band-title">End by naming the next barrier to industrial relevance.</h2>
          </div>
          <p className="story-band-text">
            Readers should finish this page understanding not just what improved, but also
            whether the next limiting factor is flux, catalysis, transport, or process-scale
            robustness.
          </p>
        </div>
        <div className="split-layout">
          <article className="content-card narrative-card">
            <span className="track-tag">Use this section for</span>
            <ul className="card-list">
              <li>Summarizing which engineering layer advanced most convincingly.</li>
              <li>Explaining which bottleneck still most strongly limits platform performance.</li>
              <li>Pointing to the next experiment or redesign that would unlock further integration.</li>
              <li>Linking current results back to the sustainable manufacturing vision.</li>
            </ul>
          </article>
          <article className="content-card narrative-card">
            <span className="track-tag">Avoid turning this into</span>
            <ul className="card-list">
              <li>A long chronology of assays with no platform interpretation.</li>
              <li>A titer-only summary that ignores export, toxicity, or localization issues.</li>
              <li>A conclusion that pretends all bottlenecks are equally solved.</li>
              <li>A future-work paragraph disconnected from the current limiting layer.</li>
            </ul>
          </article>
        </div>
      </section>

      <section id="references" className="story-section story-section-last">
        <ReferenceBlock title="References and result framing sources" items={resultsReferences} />
      </section>
    </>
  );
}

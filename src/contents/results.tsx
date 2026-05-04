import {
  ReferenceBlock,
  ResultDataCard,
  ResultDataCardGrid,
} from "../components/PageScaffold";
import type { ResultDataCardData } from "../components/PageScaffold";
import { EvidenceSpiral, NextStopBanner } from "../components/AtlasShowpieces";

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

const resultCards: ResultDataCardData[] = [
  {
    id: "EVIDENCE 01",
    title: "Sterol scaffold readiness",
    pathwayNode: "scaffold",
    status: "planned",
    claim:
      "The chassis must support upstream scaffold preparation before downstream catalytic steps can be interpreted.",
    method:
      "Precursor pool assay under growth-compatible induction conditions.",
    figure: {
      type: "placeholder",
      caption: "Reserved for scaffold trace or precursor pool chart.",
    },
    quantitativeResults: [
      { label: "Signal", value: "pending", isHighlight: true },
      { label: "Replicates", value: "pending" },
      { label: "Condition", value: "pending" },
    ],
    interpretation:
      "This evidence will determine whether flux support is sufficient for later P450 engineering.",
    limitations:
      "Without downstream conversion data, this cannot prove final steroid hormone production.",
    notebookHref: "/notebook#wet-lab",
    notebookLabel: "Notebook placeholder: scaffold assay record",
  },
  {
    id: "EVIDENCE 02",
    title: "P450 conversion checkpoint",
    pathwayNode: "catalysis",
    status: "in-progress",
    claim:
      "The P450 module is the current catalytic checkpoint for testing measurable conversion under controlled conditions.",
    method:
      "LC-MS assay under induced expression conditions with replicate condition notes.",
    figure: {
      type: "placeholder",
      caption: "Reserved for conversion chromatogram or peak comparison.",
    },
    quantitativeResults: [
      { label: "Conversion", value: "pending", isHighlight: true },
      { label: "Replicates", value: "pending" },
      { label: "Control", value: "pending" },
    ],
    interpretation:
      "This will support the catalytic layer only if the conversion signal is measurable against the matched control.",
    limitations:
      "A catalytic checkpoint cannot by itself establish full-pathway production or final product titer.",
    notebookHref: "/notebook#wet-lab",
    notebookLabel: "Notebook Week 7 / Assay 03 placeholder",
  },
  {
    id: "EVIDENCE 03",
    title: "Transport and export compatibility",
    pathwayNode: "transport",
    status: "planned",
    claim:
      "The platform needs a host-compatible routing and export window before accumulation data can be trusted.",
    method:
      "Membrane stress readout, growth comparison, and export fraction screening.",
    figure: {
      type: "placeholder",
      caption: "Reserved for burden curve or export fraction panel.",
    },
    quantitativeResults: [
      { label: "Export fraction", value: "pending", isHighlight: true },
      { label: "Growth window", value: "pending" },
      { label: "Stress marker", value: "pending" },
    ],
    interpretation:
      "Transport evidence will show whether catalytic progress is compatible with host physiology.",
    limitations:
      "Transport compatibility does not prove that the pathway is flux-balanced or production-ready.",
    notebookHref: "/notebook#wet-lab",
    notebookLabel: "Notebook placeholder: transport screen",
  },
  {
    id: "EVIDENCE 04",
    title: "Toxicity and growth window",
    pathwayNode: "flux",
    status: "planned",
    claim:
      "Growth-compatible induction is required before product readouts can be interpreted as engineering progress.",
    method:
      "OD time course, induction gradient, and matched empty-vector control.",
    figure: {
      type: "placeholder",
      caption: "Reserved for normalized growth or burden chart.",
    },
    quantitativeResults: [
      { label: "Growth ratio", value: "pending", isHighlight: true },
      { label: "Induction", value: "pending" },
      { label: "n", value: "pending" },
    ],
    interpretation:
      "This card keeps host-level burden visible beside pathway readouts.",
    limitations:
      "A healthy growth window does not guarantee scaffold supply, conversion, or export.",
    notebookHref: "/notebook#wet-lab",
    notebookLabel: "Notebook placeholder: growth assay",
  },
  {
    id: "EVIDENCE 05",
    title: "Integrated platform run",
    pathwayNode: "integrated",
    status: "planned",
    claim:
      "The integrated run should connect flux, catalysis, and transport evidence into one interpretable platform checkpoint.",
    method:
      "Combined strain run with matched controls, raw trace archive, and replicate summary.",
    figure: {
      type: "placeholder",
      caption: "Reserved for integrated evidence summary.",
    },
    quantitativeResults: [
      { label: "Final product", value: "pending", isHighlight: true },
      { label: "Units", value: "pending" },
      { label: "Replicates", value: "pending" },
    ],
    interpretation:
      "This card should only become the lead result when all upstream evidence is linked and comparable.",
    limitations:
      "Until the integrated run is measured, the page should not imply validated full-pathway production.",
    notebookHref: "/notebook#wet-lab",
    notebookLabel: "Notebook placeholder: integrated run",
  },
];

const featuredResult = resultCards[1];

export function Results() {
  return (
    <>
      <section
        id="overview"
        className="story-section story-section-first results-data-hero"
      >
        <div className="results-data-hero-copy">
          <span>Results Figure/Data Card System</span>
          <h1>Every result becomes inspectable evidence.</h1>
          <p>
            Each card answers the judging questions in the same order: what we
            claim, how we measured it, where the figure belongs, what the
            quantitative result says, how to interpret it, what it cannot prove
            yet, and where the raw record should live.
          </p>
        </div>
        <div
          className="results-data-terminal"
          aria-label="Result card field checklist"
        >
          {[
            "Claim",
            "Method",
            "Figure",
            "Quantitative result",
            "Interpretation",
            "Limitations",
            "Notebook link",
          ].map((field, index) => (
            <span key={field}>
              {String(index + 1).padStart(2, "0")} / {field}
            </span>
          ))}
        </div>
      </section>

      <section id="summary" className="story-section results-summary-strip">
        {resultCards.slice(0, 4).map((card) => (
          <a
            key={card.id}
            href={`#${card.id
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "")}`}
          >
            <span>{card.id}</span>
            <strong>{card.title}</strong>
          </a>
        ))}
      </section>

      <section id="featured" className="story-section">
        <div className="section-heading">
          <span className="track-tag">Featured result card</span>
          <h2>
            P450 conversion is treated as a checkpoint, not a claim shortcut.
          </h2>
          <p>
            The card below keeps the catalytic claim, assay method, pending
            quantitative readout, interpretation, and limits in one reviewable
            unit.
          </p>
        </div>
        <ResultDataCard variant="result" featured {...featuredResult} />
      </section>

      <section id="cards" className="story-section">
        <div className="section-heading">
          <span className="track-tag">Evidence grid</span>
          <h2>Filter the result cards by platform layer.</h2>
          <p>
            Empty slots are intentionally labeled as reserved instead of filled
            with artificial charts or invented values.
          </p>
        </div>
        <ResultDataCardGrid cards={resultCards} />
      </section>

      <section id="milestones" className="story-section results-evidence-page">
        <div className="section-heading results-helix-intro">
          <span>Results Evidence Chain</span>
          <h2>Scroll the DNA helix to keep the platform pathway in view.</h2>
          <p>
            The card system handles scrutiny; the helix keeps scaffold supply,
            P450 conversion, transport compatibility, and integrated evidence
            connected as one steroid-platform story.
          </p>
        </div>

        <EvidenceSpiral />
      </section>

      <section
        id="next-experiments"
        className="story-section results-next-experiments"
      >
        <div className="section-heading">
          <span className="track-tag">Limitations and next experiments</span>
          <h2>Cards stay conservative until evidence is linked.</h2>
          <p>
            The next experimental priority is to replace reserved fields with
            raw chromatograms, replicate summaries, calibrated units, and
            control comparisons.
          </p>
        </div>
        <div className="split-layout">
          <article className="content-card narrative-card">
            <h3>Before moving a card to linked</h3>
            <ul className="card-list">
              <li>Attach the figure or raw trace to a dated notebook entry.</li>
              <li>
                Report units, replicate count, and control condition beside the
                metric.
              </li>
              <li>
                Write one restrained interpretation that names the engineering
                checkpoint.
              </li>
            </ul>
          </article>
          <article className="content-card narrative-card">
            <h3>Before moving a card to validated</h3>
            <ul className="card-list">
              <li>
                Repeat the assay with the same protocol and comparable controls.
              </li>
              <li>
                Check whether the evidence supports only a module or the full
                platform.
              </li>
              <li>
                Keep limitations visible when a result is preliminary or
                condition-specific.
              </li>
            </ul>
          </article>
        </div>
      </section>

      <section
        id="references"
        className="story-section story-section-last results-reference-dock"
      >
        <ReferenceBlock
          title="References and result framing sources"
          items={resultsReferences}
        />
        <NextStopBanner
          eyebrow="Next Stop"
          title="Human Practices tests whether the platform should exist in the real world."
          text="Connect scientific progress to stakeholders, manufacturing reality, sustainability, access, and biosafety decisions."
          href="/human-practices"
          actionLabel="Continue to Human Practices"
        />
      </section>
    </>
  );
}

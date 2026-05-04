import { ReferenceBlock, ResultDataCard } from "../components/PageScaffold";
import type { ResultDataCardData } from "../components/PageScaffold";

const protocolCards = [
  {
    label: "LC-MS",
    title: "Conversion assay",
    text: "Use matched induced and control samples, record peak identity assumptions, and keep raw traces linked before drawing catalytic conclusions.",
  },
  {
    label: "Growth",
    title: "Host burden window",
    text: "Pair every production condition with growth and viability context so a strong signal is not separated from host stress.",
  },
  {
    label: "Calibration",
    title: "Units and standards",
    text: "Document internal standards, calibration curves, blank correction, and unit conversion beside the card that uses the metric.",
  },
];

const measurementCards: ResultDataCardData[] = [
  {
    id: "MEASURE 01",
    title: "LC-MS conversion measurement",
    pathwayNode: "catalysis",
    status: "in-progress",
    claim:
      "The conversion assay must distinguish a P450-derived signal from empty-vector background.",
    method:
      "LC-MS assay under induced expression conditions with matched extraction and injection settings.",
    controls:
      "Positive reference standard when available; empty-vector and no-induction negative controls.",
    standardization:
      "Internal standard and calibration curve reserved for final unit reporting.",
    figure: {
      type: "placeholder",
      caption: "Reserved for chromatogram, peak table, or calibration curve.",
    },
    quantitativeResults: [
      { label: "Signal", value: "pending", isHighlight: true },
      { label: "Unit", value: "pending" },
      { label: "n", value: "pending" },
    ],
    interpretation:
      "This method-first card makes the quality of the catalytic readout visible before the claim is evaluated.",
    limitations:
      "Pending calibration and controls mean this card cannot yet support a validated production claim.",
    notebookHref: "/notebook#wet-lab",
    notebookLabel: "Notebook placeholder: LC-MS conversion assay",
  },
  {
    id: "MEASURE 02",
    title: "Growth-normalized fluorescence or burden readout",
    pathwayNode: "transport",
    status: "planned",
    claim:
      "Compatibility measurements should show whether pathway expression changes host growth or stress under the tested condition.",
    method:
      "Time-course growth assay paired with normalized fluorescence or stress-marker readout.",
    controls: "Blank media, empty vector, and uninduced chassis controls.",
    standardization:
      "OD correction and plate-position notes reserved for measurement record.",
    figure: {
      type: "placeholder",
      caption: "Reserved for normalized growth or burden curve.",
    },
    quantitativeResults: [
      { label: "Growth ratio", value: "pending", isHighlight: true },
      { label: "Stress readout", value: "pending" },
      { label: "n", value: "pending" },
    ],
    interpretation:
      "This card prevents transport or toxicity observations from being treated as side notes.",
    limitations:
      "Growth compatibility alone cannot prove scaffold supply, catalytic conversion, or export.",
    notebookHref: "/notebook#wet-lab",
    notebookLabel: "Notebook placeholder: burden assay",
  },
  {
    id: "MEASURE 03",
    title: "Integrated replicate and unit summary",
    pathwayNode: "integrated",
    status: "planned",
    claim:
      "Final platform evidence should use comparable units and replicate summaries across flux, catalysis, and transport.",
    method:
      "Integrated run summary with raw trace archive, unit conversion, replicate count, and control-matched comparison.",
    controls:
      "Full pathway strain, missing-module controls, and extraction blank.",
    standardization:
      "Shared unit table and replicate inclusion criteria reserved for final evidence freeze.",
    figure: {
      type: "placeholder",
      caption: "Reserved for integrated replicate summary table.",
    },
    quantitativeResults: [
      { label: "Final metric", value: "pending", isHighlight: true },
      { label: "Unit", value: "pending" },
      { label: "Replicates", value: "pending" },
    ],
    interpretation:
      "This card is the bridge between Measurement and Results: the method must be inspectable before the result becomes persuasive.",
    limitations:
      "Until the integrated run is linked to raw records and controls, it remains a planned measurement structure.",
    notebookHref: "/notebook#wet-lab",
    notebookLabel: "Notebook placeholder: integrated run",
  },
];

const measurementReferences = [
  {
    label: "iGEM 2020 Judging Handbook: role of measurement",
    href: "https://static.igem.org/mediawiki/2020/7/71/2020_Judging_Handbook.pdf",
    note: "Frames measurement as the way to show whether data are reliable and results are important.",
  },
  {
    label: "iGEM 2019 Judging Handbook: Measurement prize criteria",
    href: "https://static.igem.org/mediawiki/2019/0/08/2019_Judging_Handbook.pdf",
    note: "Highlights repeatability, protocol description, usefulness, controls, and calibrated units.",
  },
  {
    label: "MIT Biological Engineering Communication Lab: Results",
    href: "https://mitcommlab.mit.edu/broad/commkit/journal-article-results/",
    note: "Useful reference for linking figures, methods, conclusions, and limitations without speculation.",
  },
];

export function Measurement() {
  return (
    <>
      <section
        id="protocols"
        className="story-section story-section-first measurement-protocols"
      >
        <div className="section-heading">
          <span className="track-tag">Measurement Protocol Cards</span>
          <h2>Methods come first, then claims.</h2>
          <p>
            Measurement is where the same card system changes priority:
            protocol, controls, standardization, figure, units, and replicates
            appear before interpretation.
          </p>
        </div>
        <div className="measurement-protocol-grid">
          {protocolCards.map((card) => (
            <article className="content-card narrative-card" key={card.title}>
              <span className="track-tag">{card.label}</span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="figure-data-cards"
        className="story-section measurement-card-system"
      >
        <div className="section-heading">
          <span className="track-tag">Figure/Data Card System</span>
          <h2>Method-first cards make reproducibility review faster.</h2>
          <p>
            Each card exposes the experimental method, controls, calibration
            plan, figure slot, unit-bearing result field, restrained claim,
            interpretation, limitations, and notebook pointer.
          </p>
        </div>
        <div className="measurement-card-stack">
          {measurementCards.map((card) => (
            <ResultDataCard key={card.id} variant="measurement" {...card} />
          ))}
        </div>
      </section>

      <section
        id="quality-control"
        className="story-section measurement-quality-panel"
      >
        <div className="section-heading">
          <span className="track-tag">Quality control visible</span>
          <h2>Every reported number needs context beside it.</h2>
          <p>
            The UI keeps the core Measurement award questions close to the data:
            repeatability, described protocol, usefulness, controls, and
            calibrated units.
          </p>
        </div>
        <div className="split-layout">
          <article className="content-card narrative-card">
            <h3>Required before linking a result</h3>
            <ul className="card-list">
              <li>Raw figure or table is reachable from a notebook entry.</li>
              <li>
                Replicate count and inclusion rule are stated next to the
                metric.
              </li>
              <li>
                Positive, negative, blank, or missing-module controls are named.
              </li>
            </ul>
          </article>
          <article className="content-card narrative-card">
            <h3>Required before validation language</h3>
            <ul className="card-list">
              <li>
                Units are calibrated or the reason for relative units is
                explicit.
              </li>
              <li>Protocol conditions are described well enough to repeat.</li>
              <li>Limitations say what the measurement cannot prove yet.</li>
            </ul>
          </article>
        </div>
      </section>

      <section id="references" className="story-section story-section-last">
        <ReferenceBlock
          title="References and measurement framing sources"
          items={measurementReferences}
        />
      </section>
    </>
  );
}

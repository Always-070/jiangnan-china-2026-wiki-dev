import { Inspirations, InspirationLink } from "../components/Inspirations";
import kcatDistributionUrl from "../assets/model/dry-collection/kcat-log10-distribution.svg";
import kcatScatterUrl from "../assets/model/dry-collection/kcat-log10-scatter.svg";
import logfileZeroCurvesUrl from "../assets/model/dry-collection/logfile-0-training-curves.png";
import overallCurvesUrl from "../assets/model/dry-collection/overall-training-curves.png";

const modelMetrics = [
  {
    label: "Best validation PCC",
    value: "0.5428",
    note: "The best grid-search run showed moderate rank correlation, but it was not strong enough for final activity prediction.",
  },
  {
    label: "Best validation SCC",
    value: "0.6182",
    note: "The model retained some ordering signal after fine-tuning, which made it useful for triage rather than precise regression.",
  },
  {
    label: "Best validation R2",
    value: "0.2607",
    note: "The low R2 is the key reason this batch is recorded as a failed modeling round instead of a final result.",
  },
  {
    label: "Best validation RMSE",
    value: "1.3218",
    note: "The error remained too high for confident quantitative prediction of catalytic efficiency.",
  },
];

const publicFigures = [
  {
    src: overallCurvesUrl,
    title: "Training and validation curves",
    caption:
      "The first training record shows stable loss reduction, but regression quality remained limited.",
  },
  {
    src: logfileZeroCurvesUrl,
    title: "Fold 0 curve record",
    caption:
      "logfile_0 and logfile_1 are the two folds from the same 2-fold attempt; fold 0 is shown here as the public example.",
  },
  {
    src: kcatDistributionUrl,
    title: "kcat/Km log10 distribution",
    caption:
      "The distribution view is useful for explaining why log-scale compression may be worth testing in a later round.",
  },
  {
    src: kcatScatterUrl,
    title: "Mean and median scatter summary",
    caption:
      "The scatter summary is retained as iteration evidence, not as proof that the model is ready for deployment.",
  },
];

export function Model() {
  const links: InspirationLink[] = [
    { year: 2024, teamName: "UToronto", pageName: "model" },
    { year: 2024, teamName: "Heidelberg", pageName: "model" },
    { year: 2024, teamName: "Waseda-Tokyo", pageName: "model" },
    { year: 2024, teamName: "BNUZH-China", pageName: "model" },
    { year: 2024, teamName: "CJUH-JLU-China", pageName: "model" },
    { year: 2024, teamName: "Tsinghua", pageName: "model" },
  ];

  return (
    <>
      <section
        id="catapro-iteration"
        className="story-section story-section-first"
      >
        <div className="section-heading">
          <span className="track-tag">Dry-lab iteration</span>
          <h2>Catapro fine-tuning as a failed but useful modeling round</h2>
          <p>
            This April 28 batch is kept as a problem-discovery record. The
            Catapro-based activity predictor was explored for enzyme screening,
            but the best quantitative performance stayed too weak for a final
            claim. We therefore treat the material as evidence for why the next
            dry-lab strategy changed.
          </p>
        </div>

        <div className="metric-strip">
          {modelMetrics.map((metric) => (
            <article className="metric-card" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.note}</p>
            </article>
          ))}
        </div>

        <div className="split-layout dry-model-overview">
          <article className="content-card narrative-card">
            <h3>What was tested</h3>
            <p>
              The team compared fine-tuning routes for enzyme activity
              prediction, including LoRA-style tuning and bottleneck feature
              compression. Grid-search records show that parameter adjustment
              improved some correlations, but did not solve the core regression
              problem.
            </p>
            <ul className="card-list">
              <li>LoRA route: rank and alpha settings were varied.</li>
              <li>
                Bottleneck route: feature compression was tested as a second
                fine-tuning path.
              </li>
              <li>
                logfile_0 and logfile_1 represent the two folds from the same
                2-fold split, not two unrelated experiments.
              </li>
            </ul>
          </article>

          <aside className="quote-card">
            <span>Failure classification</span>
            <h3>Not a final predictive model</h3>
            <p>
              The best R2 stayed near 0.2, which means the model could not
              accurately predict real catalytic-efficiency values. This round is
              therefore most useful as an iteration checkpoint: it showed that
              data balance, label coverage, and target scaling must be handled
              before the model can guide wet-lab choices.
            </p>
          </aside>
        </div>
      </section>

      <section id="diagnosis" className="story-section">
        <div className="section-heading">
          <span className="track-tag">Diagnosis</span>
          <h2>Why this round failed</h2>
          <p>
            The source notes point to data quality and target-distribution
            limits rather than a simple unstable-training issue.
          </p>
        </div>

        <div className="evidence-grid">
          <article className="evidence-card">
            <span className="evidence-status">Data imbalance</span>
            <h3>EC number coverage was uneven</h3>
            <p>
              The training data had an unreasonable ECnumber distribution. Some
              enzyme classes were duplicated or too discrete, and DHCR24-related
              ECnumber coverage was missing from the raw data.
            </p>
          </article>
          <article className="evidence-card">
            <span className="evidence-status">Metric ceiling</span>
            <h3>Correlations improved, but precision did not</h3>
            <p>
              PCC and SCC reached moderate values in the best runs, while R2 and
              RMSE still showed that quantitative prediction remained weak.
            </p>
          </article>
          <article className="evidence-card">
            <span className="evidence-status">Training behavior</span>
            <h3>No clear severe overfitting signal</h3>
            <p>
              The generated reports describe smooth loss reduction and a limited
              train-validation gap. The failure was therefore not simply a
              chaotic or overfit run.
            </p>
          </article>
          <article className="evidence-card">
            <span className="evidence-status">Next hypothesis</span>
            <h3>Target scaling may still help</h3>
            <p>
              The team noted that log-scale compression of the target order of
              magnitude may be useful, but had not yet been tested in this
              batch.
            </p>
          </article>
        </div>
      </section>

      <section id="evidence" className="story-section">
        <div className="section-heading">
          <span className="track-tag">Public evidence</span>
          <h2>Figures kept for the GitHub preview</h2>
          <p>
            These figures are the public-facing layer. Raw logs, spreadsheets,
            zip archives, and generated text reports are kept in local source
            archives rather than displayed directly on the wiki.
          </p>
        </div>

        <div className="dry-figure-grid">
          {publicFigures.map((figure) => (
            <figure className="dry-figure-card" key={figure.title}>
              <img src={figure.src} alt={figure.title} />
              <figcaption>
                <strong>{figure.title}</strong>
                <span>{figure.caption}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="next-step" className="story-section">
        <div className="section-heading">
          <span className="track-tag">Next dry-lab route</span>
          <h2>From raw activity prediction to staged screening</h2>
          <p>
            The dry-lab plan now shifts away from relying on one regression
            model. The next route combines activity prediction, evolutionary
            homology analysis, and molecular dynamics so wet-lab testing can
            focus on fewer, better-supported candidates.
          </p>
        </div>

        <div className="flow-diagram flow-diagram-linear">
          <div className="flow-steps">
            <article className="flow-step">
              <span className="flow-step-label">1</span>
              <h4>Activity triage</h4>
              <p>
                Use Catapro-style predictions as a coarse screen, not a final
                quantitative answer.
              </p>
            </article>
            <article className="flow-step">
              <span className="flow-step-label">2</span>
              <h4>Homology filter</h4>
              <p>
                Add evolutionary-homology reasoning to remove candidates that
                are biologically implausible.
              </p>
            </article>
            <article className="flow-step">
              <span className="flow-step-label">3</span>
              <h4>MD simulation</h4>
              <p>
                Run molecular dynamics on the narrowed set to evaluate the most
                promising enzyme-substrate interactions.
              </p>
            </article>
            <article className="flow-step">
              <span className="flow-step-label">4</span>
              <h4>Wet-lab focus</h4>
              <p>
                Pass a smaller candidate set to experiments, reducing workload
                while keeping the reasoning traceable.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="archive-boundary" className="story-section">
        <div className="split-layout dry-model-overview">
          <article className="content-card narrative-card">
            <h3>Public on this page</h3>
            <ul className="status-list">
              <li>Training curves and selected metric distributions.</li>
              <li>Plain-language failure diagnosis and next-step logic.</li>
              <li>Best-run metric summary with cautious interpretation.</li>
            </ul>
          </article>

          <article className="content-card narrative-card">
            <h3>Local archive only</h3>
            <ul className="status-list">
              <li>Dry_collection zip package and raw CSV logs.</li>
              <li>LoRA parameter spreadsheet and generated text reports.</li>
              <li>Chat screenshots used to interpret the failed round.</li>
            </ul>
          </article>
        </div>
      </section>

      <section id="references" className="story-section story-section-last">
        <div className="row mt-4">
          <div className="col-lg-8">
            <div className="reference-block">
              <h3>Source notes</h3>
              <ul className="reference-list">
                <li>
                  Dry_collection source archive, April 28, 2026: logfile_0,
                  logfile_1, LoRA parameter table, training curves, and metric
                  distribution figures.
                </li>
                <li>
                  Team chat explanation, April 28-29, 2026: data imbalance,
                  two-fold log interpretation, and next-round homology plus MD
                  simulation plan.
                </li>
              </ul>
            </div>
          </div>
          <Inspirations inspirationLinkList={links} />
        </div>
      </section>
    </>
  );
}

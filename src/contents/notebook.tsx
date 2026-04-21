import {
  EvidenceGrid,
  FlowDiagram,
  MetricStrip,
  ReferenceBlock,
} from "../components/PageScaffold";

const notebookReferences = [
  {
    label: "EPFL 2024 Notebook",
    href: "https://2024.igem.wiki/epfl/notebook",
    note: "Useful for organizing records so they remain readable late in the season.",
  },
  {
    label: "JU-Krakow 2024 Notebook",
    href: "https://2024.igem.wiki/ju-krakow/notebook",
    note: "A good benchmark for turning daily work into a coherent timeline.",
  },
  {
    label: "iGEM team wiki deliverables",
    href: "https://competition.igem.org/deliverables/team-wiki",
    note: "Keep notebook content web-readable and hosted within competition constraints.",
  },
];

export function Notebook() {
  return (
    <>
      <section id="timeline" className="story-section story-section-first">
        <div className="section-heading">
          <h2>Make the notebook read like an operational timeline</h2>
          <p>
            The notebook becomes valuable when it tells a clear sequence of actions,
            evidence, and decisions. Readers should be able to reconstruct how the season
            unfolded without reading every file in the repository.
          </p>
        </div>
        <MetricStrip
          items={[
            {
              label: "Order",
              value: "Chronological",
              note: "Entries should be dated and easy to scan from first planning to final polishing.",
            },
            {
              label: "Scope",
              value: "Full project",
              note: "Wet lab, dry lab, meetings, and communication checkpoints should all appear.",
            },
            {
              label: "Evidence",
              value: "Linked outputs",
              note: "Point to figures, protocols, files, or photos instead of relying on memory.",
            },
            {
              label: "Decision",
              value: "Why next changed",
              note: "Each key entry should explain the consequence for the following step.",
            },
          ]}
        />
      </section>

      <section id="wet-lab" className="story-section">
        <FlowDiagram
          title="A notebook rhythm that scales through the season"
          lead="This structure keeps short entries useful. Every line should do at least one job: log action, capture outcome, or justify a next step."
          steps={[
            {
              label: "Date",
              title: "State when the work happened",
              text: "A notebook without clear time anchors becomes difficult to verify and impossible to summarize later.",
            },
            {
              label: "Action",
              title: "Describe what was done",
              text: "Use precise but concise wording for experiments, analyses, meetings, outreach sessions, or planning checkpoints.",
            },
            {
              label: "Evidence",
              title: "Record what was observed or produced",
              text: "Point to measurements, files, screenshots, images, or conclusions so entries remain useful after months have passed.",
            },
            {
              label: "Decision",
              title: "Explain what happens next",
              text: "The notebook becomes strategic when each major event changes the next schedule, experiment, or writing priority.",
            },
          ]}
        />
      </section>

      <section id="dry-lab" className="story-section">
        <div className="section-heading">
          <h2>Suggested entry groupings</h2>
          <p>
            These categories help the notebook stay structured even when many subteams work
            in parallel.
          </p>
        </div>
        <EvidenceGrid
          items={[
            {
              status: "Wet Lab",
              title: "Experiments and protocols",
              description:
                "Include the purpose, setup, core output, and immediate interpretation for each major experimental block.",
              metric: "Bench record",
            },
            {
              status: "Dry Lab",
              title: "Modeling, software, and analysis",
              description:
                "Document assumptions, code changes, parameter updates, and what those outputs changed for the rest of the project.",
              metric: "Computation log",
            },
            {
              status: "Team Ops",
              title: "Meetings and writing decisions",
              description:
                "Capture decisions about task ownership, scope shifts, visuals, judging priorities, and deadlines.",
              metric: "Coordination trail",
            },
          ]}
        />
      </section>

      <section id="coordination" className="story-section">
        <div className="section-heading">
          <h2>How to keep the notebook useful late in the season</h2>
          <p>
            A notebook is most valuable when it supports later writing, attribution, and
            evidence retrieval instead of becoming an isolated archive.
          </p>
        </div>
        <div className="split-layout">
          <article className="content-card narrative-card">
            <span className="track-tag">Keep doing</span>
            <ul className="card-list">
              <li>Use consistent dates, filenames, and team-owner labels.</li>
              <li>Link notebook entries to later figures and wiki sections.</li>
              <li>Record meeting decisions as carefully as experimental outcomes.</li>
              <li>Summarize the takeaway when a long activity spans multiple days.</li>
            </ul>
          </article>
          <article className="content-card narrative-card">
            <span className="track-tag">Avoid</span>
            <ul className="card-list">
              <li>Writing only that a task happened without saying what changed.</li>
              <li>Hiding outputs in local folders with no reference from the entry.</li>
              <li>Separating wet lab and dry lab timelines so decisions become impossible to trace.</li>
              <li>Backfilling weeks later from memory without explicit dates.</li>
            </ul>
          </article>
        </div>
      </section>

      <section id="references" className="story-section story-section-last">
        <ReferenceBlock title="References and notebook benchmarks" items={notebookReferences} />
      </section>
    </>
  );
}

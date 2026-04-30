import {
  EvidenceGrid,
  FlowDiagram,
  ReferenceBlock,
} from "../components/PageScaffold";

const excellencePillars = [
  {
    status: "Story",
    title: "One project arc, repeated consistently",
    description:
      "Every major page should reinforce the same arc: manufacturing need, de novo biosynthesis gap, three bottleneck layers, and the intelligent platform vision.",
    metric: "Need -> Gap -> Design -> Proof",
  },
  {
    status: "Judging",
    title: "Critical evidence reachable in three clicks",
    description:
      "Description, Engineering, Results, Notebook, Attributions, and Human Practices should be visible from global navigation and supported by page-level anchors.",
    metric: "Judge-friendly routes",
  },
  {
    status: "Accessibility",
    title: "Core information remains real text",
    description:
      "Important explanations, captions, methods, and claims should be HTML text rather than baked into images, so they remain searchable, copyable, translatable, and screen-reader friendly.",
    metric: "Readable without interaction",
  },
  {
    status: "Visual system",
    title: "Reusable diagrams instead of one-off decorations",
    description:
      "The site should reuse a small set of diagram grammars: project roadmap, DBTL cycle, module mechanism, and Human Practices feedback loop.",
    metric: "Four diagram masters",
  },
];

const auditItems = [
  {
    status: "Homepage",
    title: "Can a new reader explain the project in 60-90 seconds?",
    description:
      "The homepage must answer what problem we solve, why steroid hormone production needs a better route, and what our platform does differently.",
    metric: "First-read clarity",
  },
  {
    status: "Core pages",
    title: "Does every page follow the same evidence order?",
    description:
      "The preferred reading order is summary, importance, design, validation, results, meaning, and references.",
    metric: "Consistent structure",
  },
  {
    status: "Mobile",
    title: "Do diagrams stack vertically without forcing landscape mode?",
    description:
      "All flow diagrams and evidence cards should stay readable on phone screens, with no essential text hidden in hover-only or click-only interactions.",
    metric: "Responsive by default",
  },
  {
    status: "Traceability",
    title: "Can claims be traced to evidence, people, and sources?",
    description:
      "Results should link to methods, Notebook should explain decisions, Attributions should name contributors, and References should ground external claims.",
    metric: "Evidence chain",
  },
];

const referenceItems = [
  {
    label: "iGEM Team Wiki deliverables",
    href: "https://competition.igem.org/deliverables/team-wiki",
    note: "Use this as the official baseline for repository, hosting, licensing, and wiki delivery requirements.",
  },
  {
    label: "BASIS-China 2023",
    href: "https://2023.igem.wiki/basis-china/",
    note: "A useful benchmark for long-form scientific storytelling and Best Wiki-level orientation.",
  },
  {
    label: "UppsalaUniversity 2025",
    href: "https://2025.igem.wiki/uppsalauniversity/index.html",
    note: "A useful reference for clear scientific structure and judge-friendly navigation.",
  },
];

export function WikiExcellence() {
  return (
    <>
      <section className="award-rainbow-hero" aria-label="Best Wiki rainbow arc signal">
        <div className="award-rainbow-arc" aria-hidden="true" />
        <div>
          <span>Best Wiki / Awards Signal</span>
          <h2>Rainbow arcs appear here as a deliberate achievement marker.</h2>
          <p>
            The team-logo rainbow language is reserved for the homepage and this excellence
            board, so it reads as a rare signal rather than general decoration.
          </p>
        </div>
      </section>

      <section id="criteria" className="story-section story-section-first">
        <div className="section-heading">
          <h2>What this page is for</h2>
          <p>
            This page reserves a dedicated place for Best Wiki preparation. It should become the
            internal audit board for clarity, navigation, accessibility, visual consistency, and
            evidence traceability before the final freeze.
          </p>
        </div>
        <EvidenceGrid items={excellencePillars} />
      </section>

      <section id="navigation" className="story-section">
        <FlowDiagram
          title="The judge path we want to protect"
          lead="A strong wiki should make the important path obvious even before the reader understands every technical detail."
          steps={[
            {
              label: "01",
              title: "Arrive",
              text: "The homepage explains the project problem and the platform solution without requiring hidden clicks.",
            },
            {
              label: "02",
              title: "Orient",
              text: "Page intros and sticky anchors show what each page proves and where the reader is inside the story.",
            },
            {
              label: "03",
              title: "Verify",
              text: "Evidence blocks point to Description, Engineering, Results, Notebook, Human Practices, and Attributions.",
            },
            {
              label: "04",
              title: "Remember",
              text: "The visual system repeats the same project logic so the final memory is clear: flux, catalysis, and transport must work together.",
            },
          ]}
        />
      </section>

      <section id="audit" className="story-section">
        <div className="story-band">
          <div>
            <span className="story-band-label">Best Wiki readiness</span>
            <h2 className="story-band-title">
              The audit should be brutal in draft season and invisible in final season.
            </h2>
          </div>
          <p className="story-band-text">
            If this page is doing its job, it will help the team find confusing routes, missing
            evidence, inconsistent diagrams, and inaccessible text before judges ever see them.
          </p>
        </div>
        <EvidenceGrid items={auditItems} />
      </section>

      <section id="handoff" className="story-section">
        <div className="section-shell section-shell-amber">
          <div className="section-heading">
            <h2>What should be added later</h2>
            <p>
              As the season progresses, this page should collect concrete proof that the wiki was
              designed intentionally rather than assembled at the last minute.
            </p>
          </div>
          <ul className="card-list">
            <li>A sitemap showing that all required judging pages are reachable quickly.</li>
            <li>A diagram inventory explaining where each reusable flow diagram appears.</li>
            <li>A mobile readability checklist with screenshots from key pages.</li>
            <li>A content freeze checklist linking claims to Results, Notebook, and References.</li>
            <li>A short design rationale explaining the Jiangnan laboratory narrative style.</li>
          </ul>
        </div>
      </section>

      <section id="references" className="story-section story-section-last">
        <ReferenceBlock title="Wiki excellence references" items={referenceItems} />
      </section>
    </>
  );
}

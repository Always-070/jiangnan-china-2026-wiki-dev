import {
  EvidenceGrid,
  FlowDiagram,
  MetricStrip,
  ReferenceBlock,
} from "../components/PageScaffold";
import { StakeholderImpactMap } from "../components/StakeholderImpactMap";

const hpReferences = [
  {
    label: "Chen et al. 2025 review on steroid hormone biosynthesis",
    href: "https://doi.org/10.1016/j.tibtech.2025.12.012",
    note: "Provides the sustainability, transport, scalability, and intelligent-platform framing behind this year's project.",
  },
  {
    label: "iGEM Human Practices Hub",
    href: "https://responsibility.igem.org/human-practices/what-is-human-practices",
    note: "The official guide for showing how society shapes the project rather than merely receives it.",
  },
  {
    label: "TJI-Seoul 2025",
    href: "https://2025.igem.wiki/tji-seoul",
    note: "A useful reference for integrating stakeholder feedback into the main scientific narrative.",
  },
];

const hpScenes = [
  {
    label: "Medicine",
    title: "Ask what better steroid production changes for users and patients",
    text: "Stakeholder work should surface what kinds of supply, purity, cost, or therapeutic access improvements actually matter in practice.",
  },
  {
    label: "Industry",
    title: "Ask what a real manufacturing platform must satisfy",
    text: "Bioprocess, scale-up, feedstock, and product-recovery perspectives should inform which engineering layers deserve priority.",
  },
  {
    label: "Responsibility",
    title: "Ask what makes this route sustainable and safe",
    text: "Human Practices should make the environmental, regulatory, and biosafety implications of steroid biomanufacturing visible early.",
  },
];

const changeCards = [
  {
    status: "Stakeholder 1",
    title: "Clinicians, biomedical experts, or end-use specialists",
    description:
      "Use this block to record how medical relevance, hormone class selection, or target use-case priorities change the project's scientific scope.",
    metric: "Clinical relevance",
  },
  {
    status: "Stakeholder 2",
    title: "Bioprocess and manufacturing perspectives",
    description:
      "Document how fermentation practicality, feedstock logic, separation challenges, or cost concerns influence the platform design.",
    metric: "Industrial feasibility",
  },
  {
    status: "Stakeholder 3",
    title: "Safety, sustainability, and governance voices",
    description:
      "Explain how green manufacturing, host robustness, export toxicity, regulation, or containment concerns shape pathway and deployment decisions.",
    metric: "Responsible scaling",
  },
  {
    status: "Education evidence",
    title: "Primary-school and English Corner audiences",
    description:
      "Record outreach as a communication feedback loop: what audiences understood, where language failed, and how the next Education materials changed.",
    metric: "Public learning loop",
    href: "/education",
  },
];

const feedbackRoutes = [
  {
    page: "Human Practices",
    href: "#impact-map",
    question: "Did outside input change what the project should build?",
    currentEvidence:
      "The page now treats every activity as contact -> reason -> feedback -> project response -> next plan.",
    nextUse:
      "Use expert and industry interviews to replace placeholders with direct design changes.",
  },
  {
    page: "Education",
    href: "/education",
    question: "Did public communication improve after listening?",
    currentEvidence:
      "Primary-school outreach and English Corner both include loop dossiers, evidence materials, and iteration plans.",
    nextUse:
      "Reuse the same dossier structure for later community talks, posts, and activity handbooks.",
  },
  {
    page: "Description",
    href: "/description",
    question: "What real-world need should the project background prove?",
    currentEvidence:
      "Education feedback shows that daily health, sunlight, sleep, and stress are understandable public entry points.",
    nextUse:
      "Connect later stakeholder feedback to the public need for clearer, safer, and more sustainable steroid production.",
  },
  {
    page: "Safety",
    href: "/safety-and-security",
    question:
      "Which ethical, regulatory, or acceptance concerns must be addressed?",
    currentEvidence:
      "Public-facing activities reveal where health claims need plain wording and careful boundaries.",
    nextUse:
      "Add safety and governance interviews once HP receives usable records from regulators, teachers, or biosafety advisors.",
  },
  {
    page: "Contribution",
    href: "/contribution",
    question: "What can future teams reuse from this HP work?",
    currentEvidence:
      "Questionnaire-first outreach, bilingual glossary planning, and activity dossier templates are reusable methods.",
    nextUse:
      "Package interview templates, outreach scripts, glossary terms, and evidence checklists after the next material round.",
  },
];

export function HumanPractices() {
  return (
    <>
      <section id="stakeholders" className="story-section story-section-first">
        <div className="section-heading">
          <h2>
            Human Practices should define what a responsible steroid platform
            looks like
          </h2>
          <p>
            This page is strongest when it shows how medical relevance,
            industrial feasibility, and sustainability expectations actively
            shaped the project instead of appearing as separate commentary after
            the science was planned.
          </p>
        </div>
        <MetricStrip
          items={[
            {
              label: "Users",
              value: "Therapeutic relevance",
              note: "Stakeholders should clarify which steroid classes, applications, or supply concerns matter most in practice.",
            },
            {
              label: "Industry",
              value: "Manufacturing logic",
              note: "Feedstock, scalability, recovery, and process robustness are central questions for this project's platform ambition.",
            },
            {
              label: "Responsibility",
              value: "Green production",
              note: "The sustainability claim must be translated into real design choices, not left as a slogan.",
            },
            {
              label: "Outcome",
              value: "Design changes",
              note: "The page should make clear which scientific or implementation decisions changed because of outside input.",
            },
          ]}
        />

        <div className="story-band">
          <div>
            <span className="story-band-label">Page intention</span>
            <h2 className="story-band-title">
              This page should show how the platform becomes medically
              meaningful, industrially realistic, and environmentally
              defensible.
            </h2>
          </div>
          <p className="story-band-text">
            For this project, Human Practices is inseparable from the question
            of whether steroid hormone biosynthesis can become a truly
            sustainable manufacturing route.
          </p>
        </div>

        <div className="scene-grid scene-grid-tight">
          {hpScenes.map((scene) => (
            <article className="scene-card" key={scene.title}>
              <span>{scene.label}</span>
              <h3>{scene.title}</h3>
              <p>{scene.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="impact-map" className="story-section">
        <StakeholderImpactMap variant="human-practices" />
      </section>

      <section id="insights" className="story-section">
        <div className="section-shell section-shell-amber">
          <FlowDiagram
            title="An integrated Human Practices loop for this year's theme"
            lead="Human Practices should explain how outside perspectives refine what kind of steroid platform is worth building, how it should perform, and how it should be deployed."
            variant="loop"
            steps={[
              {
                label: "Listen",
                title:
                  "Start with those closest to use, manufacture, and regulation",
                text: "Choose stakeholders who can clarify therapeutic need, production reality, sustainability pressure, or biosafety constraints.",
              },
              {
                label: "Translate",
                title: "Convert interviews into platform requirements",
                text: "Reduce conversations into concrete needs such as lower feedstock dependence, cleaner export, better process robustness, or clearer deployment scope.",
              },
              {
                label: "Decide",
                title: "Tie those requirements to scientific choices",
                text: "Show how the feedback changed host choice, engineering priorities, target molecules, or the balance between proof-of-concept and manufacturability.",
              },
              {
                label: "Implement",
                title: "Carry the new requirement into later work",
                text: "Link each major insight to actual changes in Engineering, Results, education, safety planning, or entrepreneurial positioning.",
              },
            ]}
          />
        </div>
      </section>

      <section id="feedback-routes" className="story-section">
        <div className="section-heading">
          <span className="section-kicker">HP control panel</span>
          <h2>Where HP feedback lands</h2>
          <p>
            The same feedback should not stay trapped inside one activity
            paragraph. This panel shows how HP records should feed the judging
            pages that depend on them: Human Practices, Education, Description,
            Safety, and Contribution.
          </p>
        </div>
        <div className="hp-route-board">
          {feedbackRoutes.map((route) => (
            <article className="hp-route-item" key={route.page}>
              <a className="hp-route-page" href={route.href}>
                {route.page}
              </a>
              <div className="hp-route-content">
                <h3>{route.question}</h3>
                <p>{route.currentEvidence}</p>
                <span>{route.nextUse}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="changes" className="story-section">
        <div className="section-heading">
          <h2>Recommended stakeholder-change blocks</h2>
          <p>
            These are the most meaningful categories for a project that aims to
            become a sustainable steroid biomanufacturing platform.
          </p>
        </div>
        <div className="split-layout">
          <EvidenceGrid items={changeCards} />
          <aside className="quote-card">
            <span className="quote-mark">Integration test</span>
            <h3>
              If outside input did not change which bottleneck layer mattered
              most, then Human Practices is probably still too far from the
              science.
            </h3>
            <p>
              For this project, meaningful feedback should influence flux goals,
              catalytic priorities, transport concerns, or platform deployment
              logic.
            </p>
          </aside>
        </div>
      </section>

      <section id="implementation" className="story-section">
        <div className="story-band">
          <div>
            <span className="story-band-label">
              What readers should conclude
            </span>
            <h2 className="story-band-title">
              The project is not only about making steroid hormones. It is about
              making them in a better way.
            </h2>
          </div>
          <p className="story-band-text">
            A strong Human Practices page makes it easy to say how the platform
            became more relevant, scalable, sustainable, and socially defensible
            because of stakeholder input.
          </p>
        </div>
        <div className="split-layout">
          <article className="content-card narrative-card">
            <span className="track-tag">Good signals</span>
            <ul className="card-list">
              <li>
                Stakeholders clarify what “better manufacturing” actually means
                in practice.
              </li>
              <li>
                Industrial and sustainability constraints reshape engineering
                priorities.
              </li>
              <li>
                The page links platform goals to access, green chemistry, and
                biosafety.
              </li>
              <li>
                Education activities explain what public audiences understood
                and how communication materials improved.
              </li>
              <li>
                Each major interaction changes how the science is framed or
                executed.
              </li>
            </ul>
          </article>
          <article className="content-card narrative-card">
            <span className="track-tag">Weak signals</span>
            <ul className="card-list">
              <li>
                Generic outreach events with no effect on platform design.
              </li>
              <li>
                Claims about sustainability with no linked engineering
                consequence.
              </li>
              <li>
                Industrial feasibility discussed only as a future dream, not a
                current design pressure.
              </li>
              <li>
                No evidence that stakeholder input influenced which bottlenecks
                mattered most.
              </li>
            </ul>
          </article>
        </div>
      </section>

      <section id="references" className="story-section story-section-last">
        <ReferenceBlock
          title="References and Human Practices framing"
          items={hpReferences}
        />
      </section>
    </>
  );
}

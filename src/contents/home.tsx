import { Inspirations, InspirationLink } from "../components/Inspirations";

const inspirationLinks: InspirationLink[] = [
  { year: 2025, teamName: "Example", pageName: "" },
  { year: 2024, teamName: "Heidelberg", pageName: "" },
  { year: 2024, teamName: "Marburg", pageName: "" },
  { year: 2024, teamName: "BNUZH-China", pageName: "" },
  { year: 2024, teamName: "XMU-China", pageName: "" },
];

const architectureCards = [
  {
    title: "Team",
    summary: "Show the people, the support network, and clean attribution logic early.",
    pages: ["Members", "Attributions"],
  },
  {
    title: "Project",
    summary: "Build the main scientific story around problem framing, engineering, and results.",
    pages: ["Description", "Engineering", "Results", "Contribution"],
  },
  {
    title: "Wet Lab",
    summary: "Keep experiments, protocols, notebook records, and safety material synchronized.",
    pages: ["Experiments", "Notebook", "Measurement", "Plant", "Safety and Security"],
  },
  {
    title: "Dry Lab",
    summary: "Separate modeling, software, and hardware so each track can grow without collisions.",
    pages: ["Model", "Software", "Hardware"],
  },
  {
    title: "Engagement",
    summary: "Connect human practices, education, entrepreneurship, and sustainability with one narrative.",
    pages: ["Human Practices", "Education", "Entrepreneurship", "Inclusivity", "Sustainability"],
  },
];

const weeklyFocus = [
  "Lock the page structure before visual polish grows too large.",
  "Start writing in English now, then refine for clarity with each experiment cycle.",
  "Store every figure, citation, and raw note with a clear filename and date.",
  "Keep React as the competition line and reserve Vue for side learning only.",
];

const workflowRules = [
  "Keep main stable and use one branch per task.",
  "Open a Merge Request for anything larger than a typo or wording tweak.",
  "Write first, restyle second, animate last.",
  "Treat this repository as the drafting space until the official wiki opens.",
];

const migrationSteps = [
  {
    label: "Now",
    text: "Draft content, test layout decisions, and stabilize the navigation tree in this temporary repository.",
  },
  {
    label: "When Wiki Opens",
    text: "Activate the official React wiki from the iGEM Deliverables dashboard and mirror the same structure there.",
  },
  {
    label: "Migration",
    text: "Move polished pages, assets, and styles into the official repository, then update team-specific links.",
  },
  {
    label: "Freeze Phase",
    text: "Run final CI/CD checks, content review, and link validation only on the official team wiki repository.",
  },
];

export function Home() {
  return (
    <>
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="hero-panel hero-grid">
            <div>
              <span className="eyebrow">Jiangnan University x iGEM 2026</span>
              <p className="hero-kicker">Draft early. Organize calmly. Migrate later.</p>
              <h2>Jiangnan-China 2026 Wiki starts here.</h2>
              <p className="hero-copy">
                This React repository is the team&apos;s staging ground before the official
                iGEM Team Wiki activation opens. We can use it to shape our information
                architecture, practice the toolchain, and turn weekly lab progress into
                pages instead of last-minute scramble.
              </p>
              <div className="metric-grid">
                <div className="metric-pill">
                  <span>Team ID</span>
                  <strong>6172</strong>
                </div>
                <div className="metric-pill">
                  <span>Status</span>
                  <strong>Accepted</strong>
                </div>
                <div className="metric-pill">
                  <span>Stack</span>
                  <strong>React + TS + Vite</strong>
                </div>
                <div className="metric-pill">
                  <span>Role</span>
                  <strong>Training + Drafting</strong>
                </div>
              </div>
            </div>
            <div className="hero-note">
              <h3>Current GitLab Setup</h3>
              <ul className="status-list">
                <li>
                  <strong>Repository:</strong> personal temporary repo for Jiangnan-China
                </li>
                <li>
                  <strong>Official team wiki:</strong> not open yet
                </li>
                <li>
                  <strong>Authentication:</strong> HTTPS + Personal Access Token
                </li>
                <li>
                  <strong>Recommended flow:</strong> branch, commit, MR, review
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="status-card">
            <h3>What Is Already Ready</h3>
            <ul className="status-list">
              <li>React template forked into a working team draft repository.</li>
              <li>Local clone and production build verified successfully.</li>
              <li>Navbar, footer, and homepage customized for Jiangnan-China.</li>
              <li>HTTPS push flow tested so local collaboration can start now.</li>
            </ul>
            <div className="bd-callout bd-callout-info compact-callout">
              The goal of this page is not to be final yet. It is the stable launchpad for
              drafting the real final wiki.
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-1">
        <div className="col-lg-4">
          <div className="content-card">
            <h3>This Week&apos;s Focus</h3>
            <ul className="card-list">
              {weeklyFocus.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="content-card">
            <h3>Collaboration Rules</h3>
            <ul className="card-list">
              {workflowRules.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="content-card">
            <h3>Reference Links</h3>
            <ul className="card-list">
              <li>
                <a
                  href="https://competition.igem.org/deliverables/team-wiki"
                  target="_blank"
                >
                  Team Wiki Requirements
                </a>
              </li>
              <li>
                <a href="https://competition.igem.org/judging/medals" target="_blank">
                  Medals
                </a>
              </li>
              <li>
                <a
                  href="https://competition.igem.org/judging/project-prizes"
                  target="_blank"
                >
                  Project Prizes
                </a>
              </li>
              <li>
                <a
                  href="https://competition.igem.org/judging/special-prizes"
                  target="_blank"
                >
                  Special Prizes
                </a>
              </li>
              <li>
                <a href="https://competition.igem.org/calendar" target="_blank">
                  Competition Calendar
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col">
          <h2>Content Architecture</h2>
          <hr />
          <p className="section-intro">
            The navigation tree is already broad enough for medal, prize, and documentation
            needs. What matters now is turning each section into a clean writing track with
            owners, source materials, and a predictable update rhythm.
          </p>
        </div>
      </div>
      <div className="row g-4">
        {architectureCards.map((card) => (
          <div className="col-md-6 col-xl" key={card.title}>
            <div className="content-card track-card">
              <span className="track-tag">{card.title}</span>
              <p>{card.summary}</p>
              <ul className="tag-list">
                {card.pages.map((page) => (
                  <li key={page}>{page}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mt-1">
        <div className="col-lg-8">
          <h2>Migration Roadmap</h2>
          <hr />
          <div className="roadmap">
            {migrationSteps.map((step) => (
              <div className="roadmap-step" key={step.label}>
                <span className="roadmap-label">{step.label}</span>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="col-lg-4">
          <div className="content-card">
            <h3>Priority Pages to Draft First</h3>
            <ul className="card-list">
              <li>Team / Members</li>
              <li>Project Description</li>
              <li>Notebook</li>
              <li>Human Practices</li>
              <li>Results</li>
              <li>Attributions</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-lg-8">
          <h2>Learning Track</h2>
          <hr />
          <p className="section-intro">
            Your team wants both practical delivery and real frontend growth. The safest
            competition strategy is still React first, Vue second.
          </p>
          <div className="content-card">
            <ul className="card-list">
              <li>Use React here for routing, page assembly, reusable sections, and layout control.</li>
              <li>Keep Vue in a side branch or a separate sandbox so the main wiki line stays stable.</li>
              <li>Make figures, writing, references, and captions framework-agnostic from day one.</li>
              <li>After the React version is stable, rebuild one small page in Vue as a study exercise.</li>
            </ul>
          </div>
        </div>
        <Inspirations inspirationLinkList={inspirationLinks} />
      </div>
    </>
  );
}

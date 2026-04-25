import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  EvidenceGrid,
  FlowDiagram,
  MetricStrip,
  ReferenceBlock,
  SectionNav,
} from "../components/PageScaffold";

const homeSections = [
  { id: "home-roadmap", label: "Roadmap" },
  { id: "home-tracks", label: "Modules" },
  { id: "home-progress", label: "Proof Agenda" },
  { id: "home-references", label: "References" },
];

const sceneCards = [
  {
    label: "Pressure",
    title: "Steroid hormones matter, but current production is cumbersome",
    text: "Traditional routes still rely heavily on plant or animal sterol feedstocks and multistep chemical or microbial transformations that are difficult to scale cleanly.",
  },
  {
    label: "Breakthrough",
    title: "Yeasts and fungi can build the steroid scaffold de novo",
    text: "Instead of upgrading external sterols, engineered fungal hosts can turn simple carbon sources into sterol nuclei through the mevalonate pathway.",
  },
  {
    label: "Ambition",
    title: "The project is bigger than a single enzyme or titer",
    text: "Our direction is to integrate flux rewiring, P450 catalysis, and transport redesign into an intelligent steroid hormone biomanufacturing platform.",
  },
];

const roadmapSteps = [
  {
    label: "Need",
    title: "Steroid hormones are essential but hard to make well",
    text: "These molecules regulate metabolism, reproduction, stress adaptation, and are widely used as valuable pharmaceuticals.",
  },
  {
    label: "Gap",
    title: "De novo biosynthesis is blocked by three bottlenecks",
    text: "Precursor supply, side-chain cleavage and hydroxylation, and intracellular transport/export all limit performance in microbial hosts.",
  },
  {
    label: "Build",
    title: "Reprogram the cell factory around those bottlenecks",
    text: "Use metabolic rewiring, enzyme engineering, and transport engineering to push carbon flux, improve catalysis, and relieve toxicity.",
  },
  {
    label: "Impact",
    title: "Move toward an intelligent biomanufacturing platform",
    text: "The long-term goal is a scalable, data-driven, sustainable microbial platform for steroid hormone production from simple carbon sources.",
  },
];

const readingTracks = [
  {
    status: "Description",
    title: "Why steroid hormone biomanufacturing needs a new route",
    description:
      "This track frames the medical and industrial relevance of steroid hormones, the limitations of semisynthesis, and why de novo microbial production is worth pursuing.",
    metric: "Need, chassis, project logic",
    href: "/description",
  },
  {
    status: "Engineering",
    title: "How the cell factory is redesigned",
    description:
      "This page focuses on the three engineering layers: precursor flux rewiring, P450 side-chain cleavage and hydroxylation, and transport compatibility across organelles and membranes.",
    metric: "Flux, catalysis, transport",
    href: "/engineering",
  },
  {
    status: "Results",
    title: "What the platform must eventually prove",
    description:
      "Results will be organized as a proof ladder from sterol scaffold supply to catalytic conversion, export robustness, and integrated platform performance.",
    metric: "Scaffold, conversion, export, platform",
    href: "/results",
  },
  {
    status: "Human Practices",
    title: "Why sustainability and implementation matter",
    description:
      "This track links pharmaceutical access, green manufacturing, biosafety, and industrial feasibility to the decisions made in the project itself.",
    metric: "Stakeholders, responsibility, deployment",
    href: "/human-practices",
  },
  {
    status: "Best Wiki",
    title: "How the wiki itself is designed to compete",
    description:
      "This reserved page keeps the team's wiki-quality checklist visible: story clarity, judge navigation, accessibility, reusable diagrams, and evidence traceability.",
    metric: "Clarity, access, audit",
    href: "/wiki-excellence",
  },
];

const proofAgenda = [
  {
    status: "Workstream 1",
    title: "Increase flux toward the steroid scaffold",
    description:
      "Strengthen precursor supply from simple carbon sources by rewiring the mevalonate pathway, host metabolism, and subcellular organization.",
    metric: "Flux and chassis readiness",
  },
  {
    status: "Workstream 2",
    title: "Break the catalytic bottleneck at side-chain cleavage and hydroxylation",
    description:
      "Improve rate-limiting enzymes, especially P450-driven reactions, through host-compatible design, electron transfer engineering, and pathway balancing.",
    metric: "Catalysis and selectivity",
  },
  {
    status: "Workstream 3",
    title: "Relieve intracellular accumulation and export constraints",
    description:
      "Redesign transport among LDs, ER, mitochondria, plasma membrane, and cell wall so hydrophobic intermediates stop acting like hidden toxicity traps.",
    metric: "Transport and robustness",
  },
  {
    status: "Workstream 4",
    title: "Assemble a data-driven microbial production platform",
    description:
      "Use DBTL logic, AI-guided design, and iterative measurement to turn separate engineering wins into a scalable steroid hormone biomanufacturing workflow.",
    metric: "Platform integration",
  },
];

const referenceItems = [
  {
    label: "Chen et al. 2025 review on steroid hormone biosynthesis",
    href: "https://doi.org/10.1016/j.tibtech.2025.12.012",
    note: "The core review that defines this year's problem framing, bottlenecks, and platform vision.",
  },
  {
    label: "BASIS-China 2023",
    href: "https://2023.igem.wiki/basis-china/",
    note: "A benchmark for long-form scientific storytelling that still keeps the reader oriented.",
  },
  {
    label: "TJI-Seoul 2025",
    href: "https://2025.igem.wiki/tji-seoul",
    note: "Useful for chapter-based homepage pacing and integrated Human Practices logic.",
  },
  {
    label: "UppsalaUniversity 2025",
    href: "https://2025.igem.wiki/uppsalauniversity/index.html",
    note: "Helpful for keeping a scientific homepage readable under judge time pressure.",
  },
  {
    label: "iGEM Team Wiki deliverables",
    href: "https://competition.igem.org/deliverables/team-wiki",
    note: "Official requirements for repository links, hosted assets, and page delivery.",
  },
];

function SteroidSignalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationFrame = 0;
    let startTime = performance.now();

    const draw = (time: number) => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      const ratio = Math.min(window.devicePixelRatio || 1, 2);

      if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
      }

      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);

      const progress = reduceMotion ? 0.48 : ((time - startTime) % 5200) / 5200;
      const centerX = width * 0.52;
      const centerY = height * 0.48;
      const radius = Math.min(width, height) * 0.27;
      const orbitRadius = radius * 1.48;

      context.lineCap = "round";
      context.lineJoin = "round";

      for (let i = 0; i < 5; i += 1) {
        const x = width * (0.16 + i * 0.18);
        context.beginPath();
        context.moveTo(x, height * 0.1);
        context.lineTo(x, height * 0.88);
        context.strokeStyle = "rgba(241, 229, 202, 0.11)";
        context.lineWidth = 1;
        context.stroke();
      }

      context.beginPath();
      context.ellipse(centerX, centerY, radius * 1.42, radius * 0.74, -0.28, 0, Math.PI * 2);
      context.strokeStyle = "rgba(216, 162, 76, 0.4)";
      context.lineWidth = 1.5;
      context.stroke();

      context.beginPath();
      context.ellipse(centerX, centerY, radius * 1.04, radius * 0.58, 0.48, 0, Math.PI * 2);
      context.strokeStyle = "rgba(146, 180, 172, 0.34)";
      context.stroke();

      for (let i = 0; i < 6; i += 1) {
        const angle = progress * Math.PI * 2 + i * (Math.PI / 3);
        const x = centerX + Math.cos(angle) * orbitRadius;
        const y = centerY + Math.sin(angle) * orbitRadius * 0.42;
        const pulse = 0.5 + Math.sin(time / 360 + i) * 0.5;

        context.beginPath();
        context.arc(x, y, 2.8 + pulse * 1.8, 0, Math.PI * 2);
        context.fillStyle = i % 2 ? "rgba(216, 162, 76, 0.72)" : "rgba(146, 180, 172, 0.72)";
        context.fill();
      }

      const nodes = [
        [centerX - radius * 0.78, centerY - radius * 0.38],
        [centerX + radius * 0.08, centerY - radius * 0.62],
        [centerX + radius * 0.76, centerY - radius * 0.04],
        [centerX + radius * 0.3, centerY + radius * 0.66],
        [centerX - radius * 0.65, centerY + radius * 0.42],
      ];

      nodes.forEach(([x, y], index) => {
        const next = nodes[(index + 1) % nodes.length];
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(next[0], next[1]);
        context.strokeStyle = "rgba(246, 239, 222, 0.38)";
        context.lineWidth = 2;
        context.stroke();
      });

      nodes.forEach(([x, y], index) => {
        context.beginPath();
        context.arc(x, y, index === 2 ? 8 : 6, 0, Math.PI * 2);
        context.fillStyle = index === 2 ? "rgba(216, 162, 76, 0.92)" : "rgba(246, 239, 222, 0.86)";
        context.fill();
        context.strokeStyle = "rgba(16, 37, 25, 0.42)";
        context.lineWidth = 1;
        context.stroke();
      });

      const sweep = progress * Math.PI * 2;
      context.beginPath();
      context.arc(centerX, centerY, radius * 1.1, sweep, sweep + Math.PI * 0.92);
      context.strokeStyle = "rgba(216, 162, 76, 0.82)";
      context.lineWidth = 3;
      context.stroke();

      context.beginPath();
      context.moveTo(width * 0.12, height * 0.74);
      context.bezierCurveTo(width * 0.28, height * 0.58, width * 0.38, height * 0.84, width * 0.5, height * 0.66);
      context.bezierCurveTo(width * 0.64, height * 0.46, width * 0.78, height * 0.58, width * 0.9, height * 0.34);
      context.strokeStyle = "rgba(146, 180, 172, 0.48)";
      context.lineWidth = 2;
      context.stroke();

      if (!reduceMotion) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    };

    animationFrame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      startTime = performance.now();
    };
  }, []);

  return <canvas className="steroid-signal-canvas" ref={canvasRef} aria-hidden="true" />;
}

export function Home() {
  return (
    <>
      <section className="home-hero-shell">
        <div className="container home-hero-grid">
          <div className="home-hero-copy">
            <span className="home-hero-kicker">Jiangnan University x iGEM 2026</span>
            <h1>Rewire the cell factory. Manufacture steroid hormones from carbon.</h1>
            <p>
              This wiki frames the project as an integrated biomanufacturing platform:
              metabolic flux, P450 catalysis, and intracellular transport are redesigned
              together so simple carbon sources can move toward steroid hormone production.
            </p>
            <div className="home-hero-actions">
              <Link className="intro-action intro-action-primary" to="/description">
                Open the project description
              </Link>
              <button
                className="intro-action intro-action-secondary"
                type="button"
                onClick={() => {
                  const target = document.getElementById("home-roadmap");

                  if (!target) {
                    return;
                  }

                  window.scrollTo({
                    top: Math.max(target.getBoundingClientRect().top + window.scrollY - 96, 0),
                    behavior: "smooth",
                  });
                  window.requestAnimationFrame(() => {
                    target.setAttribute("tabindex", "-1");
                    target.focus({ preventScroll: true });
                  });
                }}
              >
                Jump to the roadmap
              </button>
              <Link className="intro-action intro-action-secondary" to="/wiki-excellence">
                Best Wiki audit
              </Link>
            </div>
            <div className="home-hero-proof" aria-label="Homepage proof points">
              <span>Need-led story</span>
              <span>Three bottlenecks</span>
              <span>Platform vision</span>
            </div>
          </div>

          <aside className="platform-visual" aria-label="Steroid hormone biomanufacturing platform map">
            <SteroidSignalCanvas />
            <div className="platform-visual-header">
              <span>Cell factory control map</span>
              <strong>de novo steroid route</strong>
            </div>
            <div className="platform-node platform-node-carbon">Simple carbon source</div>
            <div className="platform-node platform-node-flux">Flux rewiring</div>
            <div className="platform-node platform-node-p450">P450 catalysis</div>
            <div className="platform-node platform-node-export">Transport + export</div>
            <ol className="platform-ladder">
              <li>
                <span>01</span>
                <strong>Supply sterol scaffold</strong>
              </li>
              <li>
                <span>02</span>
                <strong>Convert with host-compatible enzymes</strong>
              </li>
              <li>
                <span>03</span>
                <strong>Scale as an intelligent platform</strong>
              </li>
            </ol>
          </aside>
        </div>

      </section>

      <main className="home-main-shell">
        <div className="home-decoration-layer" aria-hidden="true">
          <span className="decor-trace decor-trace-a" />
          <span className="decor-trace decor-trace-b" />
          <span className="decor-chip decor-chip-a">Flux</span>
          <span className="decor-chip decor-chip-b">Catalysis</span>
          <span className="decor-chip decor-chip-c">Transport</span>
        </div>

        <section className="container home-overview story-section">
          <MetricStrip
            items={[
              {
                label: "Target",
                value: "Steroid hormones",
                note: "A medically important family of molecules with broad roles in metabolism, reproduction, stress, and therapy.",
              },
              {
                label: "Starting point",
                value: "Simple carbon source",
                note: "The platform vision is de novo biosynthesis rather than sterol-dependent semisynthesis.",
              },
              {
                label: "Core bottlenecks",
                value: "3 layers",
                note: "Metabolic flux, catalytic conversion, and transport/export are the dominant barriers.",
              },
              {
                label: "Destination",
                value: "Intelligent platform",
                note: "DBTL, AI-guided design, and scalable fermentation define the long-term direction.",
              },
            ]}
          />

          <div className="story-band story-band-hero">
            <div>
              <span className="story-band-label">Theme statement</span>
              <h2 className="story-band-title">This is not just a pathway project. It is a manufacturing-platform project.</h2>
            </div>
            <p className="story-band-text">
              The most important shift in this year's story is moving from isolated biosynthetic
              steps to an integrated and sustainable steroid hormone production system.
            </p>
          </div>

          <div className="scene-grid">
            {sceneCards.map((scene) => (
              <article className="scene-card" key={scene.title}>
                <span>{scene.label}</span>
                <h3>{scene.title}</h3>
                <p>{scene.text}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="container home-sticky-nav">
          <SectionNav sections={homeSections} />
        </div>

        <section id="home-roadmap" className="container story-section">
          <div className="section-shell section-shell-emerald">
            <div className="section-heading">
              <h2>The homepage roadmap</h2>
              <p>
                This is the backbone the rest of the wiki should inherit. If a reader understands
                this sequence, every later page becomes easier to justify and easier to remember.
              </p>
            </div>
            <div className="split-layout">
              <FlowDiagram
                title="One scientific arc for the whole project"
                lead="The homepage should move from medical and industrial necessity to the three engineering bottlenecks, and then forward into the platform vision."
                steps={roadmapSteps}
              />
              <aside className="quote-card">
                <span className="quote-mark">Reader memory</span>
                <h3>The site should leave readers with one clear memory: steroid hormone biomanufacturing becomes possible only when flux, catalysis, and transport are solved together.</h3>
                <p>
                  That systems view is stronger than presenting the project as just one new enzyme
                  or one higher titer.
                </p>
              </aside>
            </div>
          </div>
        </section>

        <section id="home-tracks" className="container story-section">
          <div className="story-band">
            <div>
              <span className="story-band-label">Reading logic</span>
              <h2 className="story-band-title">Each page should deepen one part of the same platform story.</h2>
            </div>
            <p className="story-band-text">
              The homepage is where we split the full project into readable modules without
              breaking the scientific continuity.
            </p>
          </div>
          <EvidenceGrid items={readingTracks} />
        </section>

        <section id="home-progress" className="container story-section">
          <div className="section-shell section-shell-amber">
            <div className="section-heading">
              <h2>The proof agenda for this season</h2>
              <p>
                Even before all experiments are finished, the homepage can already tell readers
                exactly what the project needs to prove to become a real platform.
              </p>
            </div>
            <EvidenceGrid items={proofAgenda} />
          </div>
        </section>

        <section id="home-references" className="container story-section story-section-last">
          <ReferenceBlock title="References that shape this year's story" items={referenceItems} />
        </section>
      </main>
    </>
  );
}

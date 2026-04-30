import { Suspense, lazy, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";

const ControlMapThreeScene = lazy(() =>
  import("./AtlasThreeScenes").then((module) => ({
    default: module.ControlMapThreeScene,
  })),
);
const RouteComparisonThreeScene = lazy(() =>
  import("./AtlasThreeScenes").then((module) => ({
    default: module.RouteComparisonThreeScene,
  })),
);
const EvidenceSpiralThreeScene = lazy(() =>
  import("./AtlasThreeScenes").then((module) => ({
    default: module.EvidenceSpiralThreeScene,
  })),
);

interface NextStopBannerProps {
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  actionLabel: string;
}

const controlModules = [
  {
    id: "flux",
    label: "Flux",
    title: "Precursor flux",
    target: "build",
    description: "Carbon flow is routed toward the steroid scaffold before downstream chemistry can matter.",
  },
  {
    id: "catalysis",
    label: "P450",
    title: "Catalytic hotspot",
    target: "test",
    description: "The amber node marks the side-chain cleavage and hydroxylation bottleneck.",
  },
  {
    id: "transport",
    label: "Transport",
    title: "Organelle routing",
    target: "learn",
    description: "ER, LD, mitochondria, membrane export, and toxicity are treated as one systems layer.",
  },
];

function useElementScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const element = ref.current;

      if (!element) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const raw = (viewportHeight * 0.72 - rect.top) / (rect.height + viewportHeight * 0.32);

      setProgress(Math.min(Math.max(raw, 0), 1));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return { ref, progress };
}

function jumpToSection(sectionId: string) {
  const target = document.getElementById(sectionId);

  if (!target) {
    return;
  }

  const targetTop = target.getBoundingClientRect().top + window.scrollY - 96;

  window.scrollTo({
    top: Math.max(targetTop, 0),
    behavior: "smooth",
  });

  window.requestAnimationFrame(() => {
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });
}

export function RouteComparison() {
  const { ref, progress } = useElementScrollProgress<HTMLElement>();

  return (
    <section
      className="atlas-route-comparison"
      aria-label="Old route and platform answer comparison"
      ref={ref}
      style={{ "--scene-progress": progress } as CSSProperties}
    >
      <div className="route-three-panel" aria-hidden="true">
        <Suspense fallback={null}>
          <RouteComparisonThreeScene scrollProgress={progress} />
        </Suspense>
      </div>
      <div className="route-panel route-panel-old">
        <span>Scalability burden</span>
        <h3>Feedstock-bound semisynthesis</h3>
        <div className="route-stack" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <p>
          Existing production depends on sterol feedstocks, multistep processing, and
          route-specific bottlenecks that do not scale cleanly.
        </p>
      </div>

      <div className="route-hub" aria-hidden="true">
        <span />
        <strong>Steroid scaffold</strong>
      </div>

      <div className="route-panel route-panel-new">
        <span>Platform answer</span>
        <h3>De novo fungal cell factory</h3>
        <div className="route-network" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
        <p>
          Simple carbon sources move through flux rewiring, P450 catalysis, and
          transport redesign as one integrated production architecture.
        </p>
      </div>
    </section>
  );
}

export function MetabolicControlMap() {
  const [activeModule, setActiveModule] = useState(controlModules[1].id);
  const [topologyMode, setTopologyMode] = useState(false);
  const active = controlModules.find((module) => module.id === activeModule) || controlModules[1];

  return (
    <section
      className={`metabolic-control-map ${topologyMode ? "is-topology" : ""}`}
      aria-label="Metabolic control map"
    >
      <div className="control-map-header">
        <div>
          <span>Metabolic Control Map</span>
          <h2>One holographic panel for flux, catalysis, and transport.</h2>
        </div>
        <button type="button" onClick={() => setTopologyMode((value) => !value)}>
          {topologyMode ? "Cell View" : "Topology View"}
        </button>
      </div>

      <div className="control-map-stage">
        <Suspense fallback={null}>
          <ControlMapThreeScene activeModule={activeModule} topologyMode={topologyMode} />
        </Suspense>
        <div className="control-map-cell control-map-cell-fallback" aria-hidden="true">
          <span className="organelle organelle-er" />
          <span className="organelle organelle-ld" />
          <span className="organelle organelle-mito" />
          <span className="transport-path transport-path-green" />
          <span className="transport-path transport-path-blue" />
          <span className="transport-path transport-path-amber" />
          <span className="catalytic-ripple" />
        </div>
        <div className="control-map-label control-map-label-er">ER membrane</div>
        <div className="control-map-label control-map-label-ld">LD node</div>
        <div className="control-map-label control-map-label-mito">Mitochondria</div>
        <ol className="control-map-orbit" aria-label="DBTL orbit">
          <li>Design</li>
          <li>Build</li>
          <li>Test</li>
          <li>Learn</li>
        </ol>
      </div>

      <div className="control-module-rail" role="list">
        {controlModules.map((module) => (
          <button
            type="button"
            role="listitem"
            key={module.id}
            className={activeModule === module.id ? "is-active" : ""}
            onMouseEnter={() => setActiveModule(module.id)}
            onFocus={() => setActiveModule(module.id)}
            onClick={() => jumpToSection(module.target)}
          >
            <span>{module.label}</span>
            <strong>{module.title}</strong>
          </button>
        ))}
      </div>

      <aside className="control-map-readout" aria-live="polite">
        <span>{active.label} focus</span>
        <h3>{active.title}</h3>
        <p>{active.description}</p>
      </aside>
    </section>
  );
}

export function EvidenceSpiral() {
  const { ref, progress } = useElementScrollProgress<HTMLElement>();
  const levels = [
    {
      level: "Level 01",
      title: "Scaffold supply",
      text: "Reserve this slot for evidence that the chassis can support the upstream steroid nucleus.",
    },
    {
      level: "Level 02",
      title: "Catalytic conversion",
      text: "Reserve this slot for verified P450 conversion, hydroxylation, or side-chain cleavage data.",
    },
    {
      level: "Level 03",
      title: "Transport compatibility",
      text: "Reserve this slot for routing, export, accumulation, or toxicity readouts.",
    },
    {
      level: "Level 04",
      title: "Platform coherence",
      text: "Reserve this slot for the strongest combined result across multiple engineering layers.",
    },
  ];

  return (
    <section
      className="evidence-spiral"
      aria-label="DNA helix evidence chain"
      ref={ref}
      style={{ "--scene-progress": progress } as CSSProperties}
    >
      <div className="evidence-spiral-core" aria-hidden="true" />
      <Suspense fallback={null}>
        <EvidenceSpiralThreeScene scrollProgress={progress} />
      </Suspense>
      {levels.map((level, index) => (
        <article className="evidence-spiral-card" key={level.level} style={{ "--level": index } as CSSProperties}>
          <span>{level.level}</span>
          <h3>{level.title}</h3>
          <p>{level.text}</p>
        </article>
      ))}
    </section>
  );
}

export function NextStopBanner({
  eyebrow,
  title,
  text,
  href,
  actionLabel,
}: NextStopBannerProps) {
  return (
    <section className="next-stop-banner">
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <Link className="intro-action intro-action-primary" to={href}>
        {actionLabel}
      </Link>
    </section>
  );
}

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
  const activeIndex = Math.min(3, Math.max(0, Math.round(progress * 3)));
  const levels = [
    {
      level: "Level 01",
      title: "Scaffold supply",
      text: "Reserve the first evidence tier for precursor readiness and upstream steroid nucleus support.",
      slots: ["Assay: precursor pool", "Figure: scaffold trace", "Report: chassis baseline"],
    },
    {
      level: "Level 02",
      title: "Catalytic conversion",
      text: "Open the second tier when P450 conversion, hydroxylation, or side-chain cleavage has measurable support.",
      slots: ["Assay: P450 activity", "Figure: conversion curve", "Report: enzyme checkpoint"],
    },
    {
      level: "Level 03",
      title: "Transport compatibility",
      text: "Use the third tier for routing, export, accumulation, membrane stress, or toxicity readouts.",
      slots: ["Assay: export/routing", "Figure: burden readout", "Report: compatibility note"],
    },
    {
      level: "Level 04",
      title: "Platform coherence",
      text: "Close the spiral with the strongest combined result across flux, catalysis, and transport layers.",
      slots: ["Assay: integrated run", "Figure: evidence summary", "Report: platform milestone"],
    },
  ];
  const helixRungs = Array.from({ length: 18 }, (_, index) => index);

  return (
    <section
      className="evidence-spiral"
      aria-label="DNA helix evidence chain"
      ref={ref}
      style={{ "--scene-progress": progress, "--active-level": activeIndex } as CSSProperties}
    >
      <div className="evidence-spiral-sticky">
        <div className="evidence-spiral-heading">
          <span>DNA Helix Evidence Chain</span>
          <h2>Scroll down the central light column to descend through four proof tiers.</h2>
        </div>

        <div className="evidence-helix-stage" aria-hidden="true">
          <div className="evidence-spiral-core" />
          <Suspense fallback={null}>
            <EvidenceSpiralThreeScene scrollProgress={progress} />
          </Suspense>
          <div className="evidence-helix-world">
            <svg className="evidence-helix-svg" viewBox="0 0 520 1260" preserveAspectRatio="none">
              <path
                className="evidence-helix-path evidence-helix-path-a"
                d="M260 0 C35 86 35 184 260 270 C485 356 485 454 260 540 C35 626 35 724 260 810 C485 896 485 994 260 1080 C35 1166 35 1232 260 1260"
              />
              <path
                className="evidence-helix-path evidence-helix-path-b"
                d="M260 0 C485 86 485 184 260 270 C35 356 35 454 260 540 C485 626 485 724 260 810 C35 896 35 994 260 1080 C485 1166 485 1232 260 1260"
              />
              {helixRungs.map((rung) => {
                const y = 38 + rung * 68;
                const phase = rung % 4;
                const left = phase < 2 ? 114 + phase * 58 : 348 - (phase - 2) * 58;
                const right = 520 - left;

                return (
                  <line
                    className="evidence-helix-rung"
                    key={rung}
                    x1={left}
                    x2={right}
                    y1={y}
                    y2={y + 28}
                  />
                );
              })}
            </svg>
            <ol className="evidence-helix-levels">
              {levels.map((level, index) => (
                <li
                  key={level.level}
                  className={activeIndex === index ? "is-active" : ""}
                  style={
                    {
                      "--level": index,
                      "--level-x": `${Math.sin((index + progress * 3) * Math.PI * 2) * 8}rem`,
                    } as CSSProperties
                  }
                >
                  <span>{level.level.replace("Level ", "L")}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="evidence-datapads">
          {levels.map((level, index) => (
            <article
              className={`evidence-spiral-card ${activeIndex === index ? "is-active" : ""}`}
              key={level.level}
              style={
                {
                  "--level": index,
                  "--depth": index - activeIndex,
                  "--depth-abs": Math.abs(index - activeIndex),
                  zIndex: 12 - Math.abs(index - activeIndex),
                } as CSSProperties
              }
            >
              <span>{level.level}</span>
              <h3>{level.title}</h3>
              <p>{level.text}</p>
              <ul className="evidence-slot-list" aria-label={`${level.level} data slots`}>
                {level.slots.map((slot) => (
                  <li key={slot}>{slot}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
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

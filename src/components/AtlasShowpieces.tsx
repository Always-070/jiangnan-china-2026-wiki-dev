import { Fragment, Suspense, lazy, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";

const ControlMapThreeScene = lazy(() => import("./three/ControlMapThreeScene"));
const RouteComparisonThreeScene = lazy(
  () => import("./three/RouteComparisonThreeScene"),
);
const EvidenceSpiralThreeScene = lazy(
  () => import("./three/EvidenceSpiralThreeScene"),
);

interface NextStopBannerProps {
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  actionLabel: string;
}

export type DBTLPhase = "design" | "build" | "test" | "learn";
export type ControlLayer = "flux" | "catalysis" | "transport";
export type EvidenceStatus =
  | "planned"
  | "in-progress"
  | "linked"
  | "needs-validation";

type DBTLSelection = {
  phase: DBTLPhase;
  layer: ControlLayer;
};

interface DBTLEvidenceMatrixProps {
  activeColumn?: ControlLayer;
  activeCell?: DBTLSelection;
}

type DBTLPhaseMeta = {
  id: DBTLPhase;
  label: string;
  role: string;
};

type ControlLayerMeta = {
  id: ControlLayer;
  label: string;
  subtitle: string;
  color: string;
};

type DBTLEvidenceCell = DBTLSelection & {
  title: string;
  description: string;
  status: EvidenceStatus;
  slot: string;
  claim: string;
  action: string;
  evidenceSlots: string[];
  nextStep: string;
};

const dbtlPhases: DBTLPhaseMeta[] = [
  { id: "design", label: "Design", role: "hypothesis" },
  { id: "build", label: "Build", role: "construct" },
  { id: "test", label: "Test", role: "evidence" },
  { id: "learn", label: "Learn", role: "iteration" },
];

const controlLayers: ControlLayerMeta[] = [
  {
    id: "flux",
    label: "Flux",
    subtitle: "Precursor flow",
    color: "#27C46A",
  },
  {
    id: "catalysis",
    label: "Catalysis",
    subtitle: "P450 hotspot",
    color: "#FFB300",
  },
  {
    id: "transport",
    label: "Transport",
    subtitle: "Organelle route",
    color: "#9EDBFF",
  },
];

const evidenceStatusLabels: Record<EvidenceStatus, string> = {
  planned: "Planned",
  "in-progress": "In progress",
  linked: "Evidence linked",
  "needs-validation": "Needs validation",
};

const defaultDBTLSelection: DBTLSelection = {
  phase: "build",
  layer: "catalysis",
};

const dbtlEvidenceCells: DBTLEvidenceCell[] = [
  {
    phase: "design",
    layer: "flux",
    title: "Route carbon flux",
    description: "toward sterol scaffold.",
    status: "in-progress",
    slot: "design rationale",
    claim:
      "Carbon flow must be routed before downstream steroid chemistry can matter.",
    action: "Tune precursor supply and sterol scaffold support.",
    evidenceSlots: [
      "Figure placeholder",
      "Notebook link placeholder",
      "Assay placeholder",
    ],
    nextStep: "Replace placeholder with verified scaffold-readiness evidence.",
  },
  {
    phase: "design",
    layer: "catalysis",
    title: "Identify P450",
    description: "catalytic bottleneck.",
    status: "linked",
    slot: "enzyme rationale",
    claim:
      "P450 chemistry is the hotspot where conversion, redox balance, and host compatibility converge.",
    action: "Prioritize side-chain cleavage, hydroxylation, and partner-protein choices.",
    evidenceSlots: [
      "Figure placeholder",
      "Notebook link placeholder",
      "Assay placeholder",
    ],
    nextStep: "Attach verified enzyme-screening or conversion evidence.",
  },
  {
    phase: "design",
    layer: "transport",
    title: "Map ER / LD",
    description: "membrane routing burden.",
    status: "planned",
    slot: "routing rationale",
    claim:
      "Hydrophobic intermediates need a routing plan before accumulation becomes a hidden bottleneck.",
    action: "Map ER, LD, membrane, export, and toxicity constraints as one layer.",
    evidenceSlots: [
      "Figure placeholder",
      "Notebook link placeholder",
      "Assay placeholder",
    ],
    nextStep: "Reserve space for verified localization and burden readouts.",
  },
  {
    phase: "build",
    layer: "flux",
    title: "Assemble precursor",
    description: "supporting genetic modules.",
    status: "planned",
    slot: "construct record",
    claim:
      "Scaffold support depends on upstream modules being assembled as controllable parts.",
    action: "Build promoter, dosage, and pathway-support modules for precursor supply.",
    evidenceSlots: [
      "Construct placeholder",
      "Notebook link placeholder",
      "Sequence placeholder",
    ],
    nextStep: "Link verified construct records after module assembly is documented.",
  },
  {
    phase: "build",
    layer: "catalysis",
    title: "Build P450",
    description: "expression and localization module.",
    status: "in-progress",
    slot: "construct record",
    claim:
      "The catalytic hotspot needs expression, localization, and electron-transfer design together.",
    action: "Build P450 expression units and compatible partner-protein modules.",
    evidenceSlots: [
      "Construct placeholder",
      "Notebook link placeholder",
      "Expression placeholder",
    ],
    nextStep: "Replace placeholders with verified construct and expression records.",
  },
  {
    phase: "build",
    layer: "transport",
    title: "Build transporter",
    description: "or compartment-routing strategy.",
    status: "needs-validation",
    slot: "routing construct",
    claim:
      "Product handling should be engineered as deliberately as pathway chemistry.",
    action: "Build transporter, localization, or compartment-routing strategies.",
    evidenceSlots: [
      "Construct placeholder",
      "Notebook link placeholder",
      "Localization placeholder",
    ],
    nextStep: "Validate whether the routing construct reduces accumulation or burden.",
  },
  {
    phase: "test",
    layer: "flux",
    title: "Measure precursor pool",
    description: "or scaffold readiness.",
    status: "needs-validation",
    slot: "assay checkpoint",
    claim:
      "Flux redesign should be judged by scaffold readiness, not intent alone.",
    action: "Measure precursor pools, scaffold-support signals, or supply readiness.",
    evidenceSlots: [
      "Assay placeholder",
      "Figure placeholder",
      "Data table placeholder",
    ],
    nextStep: "Attach verified measurement once the flux checkpoint is available.",
  },
  {
    phase: "test",
    layer: "catalysis",
    title: "Test conversion",
    description: "hydroxylation, or cleavage checkpoint.",
    status: "linked",
    slot: "assay checkpoint",
    claim:
      "Catalysis must be validated by conversion behavior, not enzyme naming.",
    action: "Test conversion, hydroxylation, cleavage, byproduct, or redox checkpoints.",
    evidenceSlots: [
      "Assay placeholder",
      "Figure placeholder",
      "Notebook link placeholder",
    ],
    nextStep: "Replace placeholder with verified conversion or activity data.",
  },
  {
    phase: "test",
    layer: "transport",
    title: "Test toxicity",
    description: "accumulation, export, or routing behavior.",
    status: "planned",
    slot: "assay checkpoint",
    claim:
      "Transport success requires cellular behavior evidence alongside product readout.",
    action: "Measure toxicity, accumulation, export, localization, or routing behavior.",
    evidenceSlots: [
      "Assay placeholder",
      "Figure placeholder",
      "Microscopy placeholder",
    ],
    nextStep: "Link verified burden, export, or localization evidence.",
  },
  {
    phase: "learn",
    layer: "flux",
    title: "Rebalance pathway flux",
    description: "based on scaffold bottleneck data.",
    status: "needs-validation",
    slot: "iteration note",
    claim:
      "Learning should name whether scaffold supply is still the limiting layer.",
    action: "Use scaffold bottleneck data to rebalance pathway flux.",
    evidenceSlots: [
      "Lesson placeholder",
      "Notebook link placeholder",
      "Next-design placeholder",
    ],
    nextStep: "Replace with a verified redesign decision after measurement review.",
  },
  {
    phase: "learn",
    layer: "catalysis",
    title: "Iterate enzyme variants",
    description: "and expression tuning for conversion.",
    status: "in-progress",
    slot: "iteration note",
    claim:
      "Catalytic learning should turn assay results into enzyme and expression choices.",
    action:
      "Iterate enzyme variants, expression levels, and partner proteins for better conversion.",
    evidenceSlots: [
      "Lesson placeholder",
      "Notebook link placeholder",
      "Next-design placeholder",
    ],
    nextStep: "Attach the verified reason for the next enzyme-tuning direction.",
  },
  {
    phase: "learn",
    layer: "transport",
    title: "Reroute product",
    description: "handling to reduce cellular burden.",
    status: "planned",
    slot: "iteration note",
    claim:
      "Transport learning should reduce the cost of product handling inside the cell.",
    action: "Reroute product handling to reduce burden, accumulation, or export failure.",
    evidenceSlots: [
      "Lesson placeholder",
      "Notebook link placeholder",
      "Next-design placeholder",
    ],
    nextStep: "Reserve this slot for validated routing changes after burden testing.",
  },
];

const controlModules = [
  {
    id: "flux",
    label: "Flux",
    title: "Precursor flux",
    target: "build",
    description:
      "Carbon flow is routed toward the steroid scaffold before downstream chemistry can matter.",
  },
  {
    id: "catalysis",
    label: "P450",
    title: "Catalytic hotspot",
    target: "test",
    description:
      "The amber node marks the side-chain cleavage and hydroxylation bottleneck.",
  },
  {
    id: "transport",
    label: "Transport",
    title: "Organelle routing",
    target: "learn",
    description:
      "ER, LD, mitochondria, membrane export, and toxicity are treated as one systems layer.",
  },
];

const routeNarrativeFrames = [
  {
    label: "Need",
    title: "Steroid hormones remain essential, high-value molecules.",
    text: "The center scaffold starts as the reason to care: these four fused rings sit behind therapeutics that need reliable, scalable production.",
    oldSignal: "Supply depends on plant or animal-derived sterol feedstocks.",
    newSignal: "Simple carbon can become the starting point.",
  },
  {
    label: "Gap",
    title: "The old route carries a physical scalability burden.",
    text: "The left stack darkens and breaks apart because extraction, semisynthesis, and route-specific processing add mass, waste, and fragility.",
    oldSignal: "Feedstock, purification, and multistep conversion pile up.",
    newSignal: "The cell-factory space waits for integrated routing.",
  },
  {
    label: "Platform Answer",
    title: "A fungal cell factory turns the scaffold into a network.",
    text: "The right side lights up when flux rewiring, P450 catalysis, and transport redesign connect into one programmable production platform.",
    oldSignal: "Collapsed route logic cannot scale cleanly.",
    newSignal: "Flux, catalysis, and transport are engineered together.",
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
      const raw =
        (viewportHeight * 0.72 - rect.top) /
        (rect.height + viewportHeight * 0.32);

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

function isControlLayer(value: string): value is ControlLayer {
  return controlLayers.some((layer) => layer.id === value);
}

function isDBTLPhase(value: string): value is DBTLPhase {
  return dbtlPhases.some((phase) => phase.id === value);
}

function getDBTLHash(selection: DBTLSelection) {
  return `dbtl-${selection.layer}-${selection.phase}`;
}

function parseDBTLHash(hash: string): DBTLSelection | null {
  const [prefix, layer, phase] = hash.replace(/^#/, "").split("-");

  if (prefix !== "dbtl" || !isControlLayer(layer) || !isDBTLPhase(phase)) {
    return null;
  }

  return { layer, phase };
}

function getDBTLCell(selection: DBTLSelection) {
  return (
    dbtlEvidenceCells.find(
      (cell) => cell.layer === selection.layer && cell.phase === selection.phase,
    ) ||
    dbtlEvidenceCells.find(
      (cell) =>
        cell.layer === defaultDBTLSelection.layer &&
        cell.phase === defaultDBTLSelection.phase,
    ) ||
    dbtlEvidenceCells[0]
  );
}

function getDBTLLayer(layerId: ControlLayer) {
  return controlLayers.find((layer) => layer.id === layerId) || controlLayers[1];
}

function getDBTLPhase(phaseId: DBTLPhase) {
  return dbtlPhases.find((phase) => phase.id === phaseId) || dbtlPhases[1];
}

export function RouteComparison() {
  const { ref, progress } = useElementScrollProgress<HTMLElement>();
  const activeFrameIndex = Math.min(
    routeNarrativeFrames.length - 1,
    Math.max(0, Math.floor(progress * routeNarrativeFrames.length)),
  );
  const activeFrame = routeNarrativeFrames[activeFrameIndex];
  const progressPercent = Math.round(progress * 100);

  return (
    <section
      className="atlas-route-comparison"
      aria-label="Scroll-controlled spatial comparison between old steroid production route and fungal cell-factory platform"
      ref={ref}
      style={
        {
          "--scene-progress": progress,
          "--active-route-step": activeFrameIndex,
        } as CSSProperties
      }
    >
      <div className="route-fold-sticky">
        <div className="route-fold-copy">
          <div>
            <span className="route-fold-kicker">Spatial Folding</span>
            <h2>Old route collapses. Platform route lights up.</h2>
          </div>
          <div
            className="route-fold-meter"
            role="progressbar"
            aria-label="Spatial fold progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercent}
          >
            <span style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="route-three-panel">
          <Suspense fallback={null}>
            <RouteComparisonThreeScene scrollProgress={progress} />
          </Suspense>
          <div className="route-stage-caption route-stage-caption-old">
            <span>Scalability burden</span>
            <strong>Plant / animal extraction stack</strong>
          </div>
          <div className="route-stage-caption route-stage-caption-hub">
            <span>Steroid four-ring hub</span>
            <strong>shared molecular scaffold</strong>
          </div>
          <div className="route-stage-caption route-stage-caption-new">
            <span>Platform answer</span>
            <strong>fungal cell factory network</strong>
          </div>
          <ol className="old-route-stations" aria-hidden="true">
            <li>Feedstock</li>
            <li>Extraction</li>
            <li>Purification</li>
            <li>Semisynthesis</li>
          </ol>
        </div>

        <aside className="route-frame-console" aria-live="polite">
          <div className="route-caption-copy">
            <span>{activeFrame.label}</span>
            <h3>{activeFrame.title}</h3>
            <p>{activeFrame.text}</p>
          </div>
          <dl>
            <div>
              <dt>Old route</dt>
              <dd>{activeFrame.oldSignal}</dd>
            </div>
            <div>
              <dt>New route</dt>
              <dd>{activeFrame.newSignal}</dd>
            </div>
          </dl>
        </aside>

        <ol
          className="route-narrative-rail"
          aria-label="Embedded Description argument"
        >
          {routeNarrativeFrames.map((frame, index) => (
            <li
              key={frame.label}
              className={
                index === activeFrameIndex
                  ? "is-active"
                  : index < activeFrameIndex
                    ? "is-complete"
                    : ""
              }
              aria-current={index === activeFrameIndex ? "step" : undefined}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{frame.label}</strong>
              <p>{frame.title}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function MetabolicControlMap() {
  const [activeModule, setActiveModule] = useState(controlModules[1].id);
  const [topologyMode, setTopologyMode] = useState(false);
  const active =
    controlModules.find((module) => module.id === activeModule) ||
    controlModules[1];

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
        <button
          type="button"
          onClick={() => setTopologyMode((value) => !value)}
        >
          {topologyMode ? "Cell View" : "Topology View"}
        </button>
      </div>

      <div className="control-map-stage">
        <Suspense fallback={null}>
          <ControlMapThreeScene
            activeModule={activeModule}
            topologyMode={topologyMode}
          />
        </Suspense>
        <div
          className="control-map-cell control-map-cell-fallback"
          aria-hidden="true"
        >
          <span className="organelle organelle-er" />
          <span className="organelle organelle-ld" />
          <span className="organelle organelle-mito" />
          <span className="transport-path transport-path-green" />
          <span className="transport-path transport-path-blue" />
          <span className="transport-path transport-path-amber" />
          <span className="catalytic-ripple" />
        </div>
        <div className="control-map-label control-map-label-er">
          ER membrane
        </div>
        <div className="control-map-label control-map-label-ld">LD node</div>
        <div className="control-map-label control-map-label-mito">
          Mitochondria
        </div>
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

export function DBTLEvidenceMatrix({
  activeColumn,
  activeCell,
}: DBTLEvidenceMatrixProps) {
  const matrixRef = useRef<HTMLElement | null>(null);
  const [selectedSelection, setSelectedSelection] = useState<DBTLSelection>(() => {
    if (activeCell) {
      return activeCell;
    }

    if (typeof window === "undefined") {
      return defaultDBTLSelection;
    }

    return parseDBTLHash(window.location.hash) || defaultDBTLSelection;
  });
  const [focusedLayer, setFocusedLayer] = useState<ControlLayer>(
    activeColumn || activeCell?.layer || defaultDBTLSelection.layer,
  );
  const [hoveredLayer, setHoveredLayer] = useState<ControlLayer | null>(null);
  const [hoveredPhase, setHoveredPhase] = useState<DBTLPhase | null>(null);
  const activeCellLayer = activeCell?.layer;
  const activeCellPhase = activeCell?.phase;

  useEffect(() => {
    if (!activeCellLayer || !activeCellPhase) {
      return;
    }

    setSelectedSelection({ layer: activeCellLayer, phase: activeCellPhase });
    setFocusedLayer(activeCellLayer);
  }, [activeCellLayer, activeCellPhase]);

  useEffect(() => {
    if (activeColumn) {
      setFocusedLayer(activeColumn);
    }
  }, [activeColumn]);

  useEffect(() => {
    const syncHashSelection = () => {
      const selection = parseDBTLHash(window.location.hash);

      if (!selection) {
        return;
      }

      setSelectedSelection(selection);
      setFocusedLayer(selection.layer);

      window.requestAnimationFrame(() => {
        const matrix = matrixRef.current;

        if (!matrix) {
          return;
        }

        const cellTargets = Array.from(
          matrix.querySelectorAll<HTMLElement>(
            `[data-dbtl-cell="${getDBTLHash(selection)}"]`,
          ),
        );
        const visibleTarget =
          cellTargets.find((target) => target.offsetParent !== null) || matrix;
        const stickyOffset = window.innerWidth < 768 ? 178 : 154;
        const targetTop =
          visibleTarget.getBoundingClientRect().top +
          window.scrollY -
          stickyOffset;
        window.scrollTo({
          top: Math.max(targetTop, 0),
          behavior: "smooth",
        });
        matrix.setAttribute("tabindex", "-1");
        matrix.focus({ preventScroll: true });
      });
    };

    syncHashSelection();
    window.addEventListener("hashchange", syncHashSelection);

    return () => window.removeEventListener("hashchange", syncHashSelection);
  }, []);

  const selectedCell = getDBTLCell(selectedSelection);
  const selectedLayer = getDBTLLayer(selectedCell.layer);
  const selectedPhase = getDBTLPhase(selectedCell.phase);
  const activeLayer = focusedLayer || selectedCell.layer;
  const mobileCells = dbtlEvidenceCells.filter((cell) => cell.layer === activeLayer);

  const selectCell = (cell: DBTLEvidenceCell) => {
    const selection = { layer: cell.layer, phase: cell.phase };
    setSelectedSelection(selection);
    setFocusedLayer(cell.layer);

    if (typeof window === "undefined") {
      return;
    }

    const nextHash = getDBTLHash(selection);
    const nextUrl = `${window.location.pathname}${window.location.search}#${nextHash}`;
    window.history.replaceState(null, "", nextUrl);
  };

  const switchLayer = (layer: ControlLayer) => {
    selectCell(getDBTLCell({ layer, phase: selectedSelection.phase }));
  };

  const getCellClassName = (cell: DBTLEvidenceCell) =>
    [
      "dbtl-cell",
      `dbtl-status-${cell.status}`,
      cell.layer === activeLayer ? "is-active-layer" : "",
      cell.layer === hoveredLayer || cell.phase === hoveredPhase
        ? "is-hovered-track"
        : "",
      cell.layer === selectedCell.layer && cell.phase === selectedCell.phase
        ? "is-selected"
        : "is-dimmed",
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <section
      id="matrix"
      ref={matrixRef}
      className="dbtl-evidence-matrix"
      aria-label="DBTL evidence matrix"
      data-active-layer={activeLayer}
    >
      <div className="dbtl-matrix-header">
        <div>
          <span>DBTL Evidence Matrix</span>
          <h2>Engineering decisions mapped across the three control layers.</h2>
        </div>
        <p>
          Every slot names what was engineered, how it should be checked, and
          where verified evidence can be attached without pretending the data
          already exists.
        </p>
      </div>

      <div className="dbtl-matrix-workbench">
        <div
          className="dbtl-grid"
          role="grid"
          aria-label="DBTL phases mapped to flux, catalysis, and transport evidence"
        >
          <div className="dbtl-grid-corner" aria-hidden="true" />
          {controlLayers.map((layer) => (
            <button
              type="button"
              role="columnheader"
              key={layer.id}
              className={`dbtl-column-header ${
                layer.id === activeLayer ? "is-active" : ""
              }`}
              style={{ "--layer-color": layer.color } as CSSProperties}
              onMouseEnter={() => setHoveredLayer(layer.id)}
              onMouseLeave={() => setHoveredLayer(null)}
              onFocus={() => setHoveredLayer(layer.id)}
              onBlur={() => setHoveredLayer(null)}
              onClick={() => switchLayer(layer.id)}
            >
              <span>{layer.label}</span>
              <strong>{layer.subtitle}</strong>
            </button>
          ))}

          {dbtlPhases.map((phase) => (
            <Fragment key={phase.id}>
              <button
                type="button"
                role="rowheader"
                className={`dbtl-row-header ${
                  hoveredPhase === phase.id ? "is-active" : ""
                }`}
                onMouseEnter={() => setHoveredPhase(phase.id)}
                onMouseLeave={() => setHoveredPhase(null)}
                onFocus={() => setHoveredPhase(phase.id)}
                onBlur={() => setHoveredPhase(null)}
              >
                <span>{phase.label}</span>
                <strong>{phase.role}</strong>
              </button>
              {controlLayers.map((layer) => {
                const cell = getDBTLCell({ phase: phase.id, layer: layer.id });

                return (
                  <button
                    type="button"
                    role="gridcell"
                    data-dbtl-cell={getDBTLHash(cell)}
                    key={`${cell.phase}-${cell.layer}`}
                    className={getCellClassName(cell)}
                    style={{ "--layer-color": layer.color } as CSSProperties}
                    aria-pressed={
                      cell.layer === selectedCell.layer &&
                      cell.phase === selectedCell.phase
                    }
                    onMouseEnter={() => {
                      setHoveredLayer(cell.layer);
                      setHoveredPhase(cell.phase);
                    }}
                    onMouseLeave={() => {
                      setHoveredLayer(null);
                      setHoveredPhase(null);
                    }}
                    onFocus={() => {
                      setHoveredLayer(cell.layer);
                      setHoveredPhase(cell.phase);
                    }}
                    onBlur={() => {
                      setHoveredLayer(null);
                      setHoveredPhase(null);
                    }}
                    onClick={() => selectCell(cell)}
                  >
                    <span className="dbtl-cell-phase">{phase.label}</span>
                    <strong>{cell.title}</strong>
                    <p>{cell.description}</p>
                    <small>Status: {evidenceStatusLabels[cell.status]}</small>
                    <small>Slot: {cell.slot}</small>
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>

        <div className="dbtl-mobile-panel">
          <div className="dbtl-mobile-tabs" role="tablist" aria-label="Control layers">
            {controlLayers.map((layer) => (
              <button
                type="button"
                role="tab"
                key={layer.id}
                aria-selected={layer.id === activeLayer}
                className={layer.id === activeLayer ? "is-active" : ""}
                style={{ "--layer-color": layer.color } as CSSProperties}
                onClick={() => switchLayer(layer.id)}
              >
                {layer.label}
              </button>
            ))}
          </div>
          <div className="dbtl-mobile-stack">
            {mobileCells.map((cell, index) => {
              const phase = getDBTLPhase(cell.phase);
              const layer = getDBTLLayer(cell.layer);

              return (
                <button
                  type="button"
                  key={`${cell.layer}-${cell.phase}-mobile`}
                  data-dbtl-cell={getDBTLHash(cell)}
                  className={getCellClassName(cell)}
                  style={{ "--layer-color": layer.color } as CSSProperties}
                  onClick={() => selectCell(cell)}
                >
                  <span className="dbtl-cell-phase">
                    {String(index + 1).padStart(2, "0")} {phase.label}
                  </span>
                  <strong>{cell.title}</strong>
                  <p>{`${cell.description} Status: ${evidenceStatusLabels[cell.status]}.`}</p>
                </button>
              );
            })}
          </div>
        </div>

        <aside
          className="dbtl-focus-drawer"
          style={{ "--layer-color": selectedLayer.color } as CSSProperties}
          aria-live="polite"
        >
          <span className="dbtl-drawer-kicker">Selected Evidence Slot</span>
          <h3>
            {selectedLayer.label} / {selectedPhase.label}
          </h3>
          <div className="dbtl-drawer-section">
            <span>Claim</span>
            <p>{selectedCell.claim}</p>
          </div>
          <div className="dbtl-drawer-section">
            <span>Engineering action</span>
            <p>{selectedCell.action}</p>
          </div>
          <div className="dbtl-drawer-section">
            <span>Evidence slot</span>
            <div className="dbtl-slot-terminal">
              {selectedCell.evidenceSlots.map((slot) => (
                <code key={slot}>[ {slot} ]</code>
              ))}
            </div>
          </div>
          <div className="dbtl-drawer-section">
            <span>Next step</span>
            <p>{selectedCell.nextStep}</p>
          </div>
        </aside>
      </div>
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
      slots: [
        "Assay: precursor pool",
        "Figure: scaffold trace",
        "Report: chassis baseline",
      ],
    },
    {
      level: "Level 02",
      title: "Catalytic conversion",
      text: "Open the second tier when P450 conversion, hydroxylation, or side-chain cleavage has measurable support.",
      slots: [
        "Assay: P450 activity",
        "Figure: conversion curve",
        "Report: enzyme checkpoint",
      ],
    },
    {
      level: "Level 03",
      title: "Transport compatibility",
      text: "Use the third tier for routing, export, accumulation, membrane stress, or toxicity readouts.",
      slots: [
        "Assay: export/routing",
        "Figure: burden readout",
        "Report: compatibility note",
      ],
    },
    {
      level: "Level 04",
      title: "Platform coherence",
      text: "Close the spiral with the strongest combined result across flux, catalysis, and transport layers.",
      slots: [
        "Assay: integrated run",
        "Figure: evidence summary",
        "Report: platform milestone",
      ],
    },
  ];
  const helixRungs = Array.from({ length: 18 }, (_, index) => index);

  return (
    <section
      className="evidence-spiral"
      aria-label="DNA helix evidence chain"
      ref={ref}
      style={
        {
          "--scene-progress": progress,
          "--active-level": activeIndex,
        } as CSSProperties
      }
    >
      <div className="evidence-spiral-sticky">
        <div className="evidence-spiral-heading">
          <span>DNA Helix Evidence Chain</span>
          <h2>
            Scroll down the central light column to descend through four proof
            tiers.
          </h2>
        </div>

        <div className="evidence-helix-stage" aria-hidden="true">
          <div className="evidence-spiral-core" />
          <Suspense fallback={null}>
            <EvidenceSpiralThreeScene scrollProgress={progress} />
          </Suspense>
          <div className="evidence-helix-world">
            <svg
              className="evidence-helix-svg"
              viewBox="0 0 520 1260"
              preserveAspectRatio="none"
            >
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
                const left =
                  phase < 2 ? 114 + phase * 58 : 348 - (phase - 2) * 58;
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
              <ul
                className="evidence-slot-list"
                aria-label={`${level.level} data slots`}
              >
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

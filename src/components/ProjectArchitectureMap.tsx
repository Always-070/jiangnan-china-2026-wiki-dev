import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { Link } from "react-router-dom";

export type ArchitectureNodeId =
  | "carbon"
  | "scaffold"
  | "p450"
  | "transport"
  | "evidence";

export interface ArchitectureNode {
  id: ArchitectureNodeId;
  index: string;
  title: string;
  subtitle: string;
  accent: "green" | "ice" | "amber" | "blue" | "white";
  href: string;
  why: string;
  lever: string;
  evidenceSlot: string;
}

export type ProjectArchitectureMapVariant =
  | "compact"
  | "story"
  | "technical"
  | "evidence";

interface ProjectArchitectureMapProps {
  variant?: ProjectArchitectureMapVariant;
  activeNode?: ArchitectureNodeId;
  defaultActiveNode?: ArchitectureNodeId;
  onActiveNodeChange?: (nodeId: ArchitectureNodeId) => void;
  className?: string;
}

const architectureNodes: ArchitectureNode[] = [
  {
    id: "carbon",
    index: "01",
    title: "Carbon Source",
    subtitle: "Simple carbon feeds the engineered chassis.",
    accent: "green",
    href: "/description#overview",
    why: "The map starts with simple carbon so the project reads as de novo biomanufacturing, not feedstock conversion.",
    lever: "Define the chassis and upstream feed assumptions before downstream pathway claims become meaningful.",
    evidenceSlot: "Need statement slot",
  },
  {
    id: "scaffold",
    index: "02",
    title: "MVA / Sterol Scaffold",
    subtitle: "Metabolic flux is routed to assemble the 4-ring nucleus.",
    accent: "ice",
    href: "/description#design",
    why: "The four-ring nucleus is the central shared architecture behind steroid hormone production.",
    lever: "Route MVA flux toward sterol scaffold formation and keep the nucleus hub visible across the project story.",
    evidenceSlot: "Scaffold trace slot",
  },
  {
    id: "p450",
    index: "03",
    title: "P450 Catalysis",
    subtitle: "Targeted hydroxylation unlocks the catalytic bottleneck.",
    accent: "amber",
    href: "/engineering#build",
    why: "P450 chemistry is the project hotspot because catalytic conversion decides whether scaffold supply becomes product logic.",
    lever: "Tune enzyme choice, redox partner compatibility, localization, and catalytic load around the bottleneck.",
    evidenceSlot: "P450 activity slot",
  },
  {
    id: "transport",
    index: "04",
    title: "Transport / Export",
    subtitle: "Organelle routing prevents toxicity and drives accumulation.",
    accent: "blue",
    href: "/engineering#test",
    why: "Hydrophobic intermediates need routing control so accumulation does not turn into burden or toxicity.",
    lever: "Coordinate ER, LD, membrane, and export behavior as a system-level engineering layer.",
    evidenceSlot: "Routing and toxicity slot",
  },
  {
    id: "evidence",
    index: "05",
    title: "Product / Evidence",
    subtitle: "Empirical data validates the theoretical pipeline.",
    accent: "white",
    href: "/results#milestones",
    why: "The endpoint is honest evidence: the map reserves space for results without inventing measurements.",
    lever: "Connect assays, figures, and notebook records back to the carbon-to-product route.",
    evidenceSlot: "Assay slot / Figure slot / Notebook slot",
  },
];

const variantDefaults: Record<ProjectArchitectureMapVariant, ArchitectureNodeId> =
  {
    compact: "carbon",
    story: "scaffold",
    technical: "p450",
    evidence: "evidence",
  };

const variantLabels: Record<ProjectArchitectureMapVariant, string> = {
  compact: "Full route overview",
  story: "Need -> Gap -> Platform Answer",
  technical: "Flux / P450 / Transport",
  evidence: "Evidence terminal",
};

const nodeById = architectureNodes.reduce(
  (lookup, node) => ({ ...lookup, [node.id]: node }),
  {} as Record<ArchitectureNodeId, ArchitectureNode>,
);

function SteroidScaffoldIcon() {
  return (
    <svg
      className="architecture-map-steroid-icon"
      viewBox="0 0 148 62"
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round">
        <polygon points="18 30 31 8 56 8 69 30 56 52 31 52" />
        <polygon points="62 30 75 8 100 8 113 30 100 52 75 52" />
        <polygon points="103 30 116 10 138 18 140 43 119 55" />
        <path d="M17 30H4M141 43l5 10" />
      </g>
      <g fill="currentColor">
        <circle cx="56" cy="8" r="3" />
        <circle cx="100" cy="52" r="3" />
        <circle cx="138" cy="18" r="3.6" />
      </g>
    </svg>
  );
}

function DesktopNode({
  node,
  activeId,
  focusMode,
  onActivate,
  onHover,
  onFocus,
  onBlur,
}: {
  node: ArchitectureNode;
  activeId: ArchitectureNodeId;
  focusMode: boolean;
  onActivate: (nodeId: ArchitectureNodeId) => void;
  onHover: (nodeId: ArchitectureNodeId | null) => void;
  onFocus: (nodeId: ArchitectureNodeId | null) => void;
  onBlur: () => void;
}) {
  const isActive = activeId === node.id;

  return (
    <button
      className={`architecture-map-node architecture-map-node-${node.id} architecture-map-accent-${node.accent} ${
        isActive ? "is-active" : ""
      } ${focusMode && !isActive ? "is-muted" : ""}`.trim()}
      type="button"
      aria-pressed={isActive}
      onClick={() => onActivate(node.id)}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onFocus(node.id)}
      onBlur={onBlur}
    >
      <span className="architecture-map-node-index">{node.index}</span>
      <span className="architecture-map-node-copy">
        <strong>{node.title}</strong>
        <span>{node.subtitle}</span>
      </span>
      {node.id === "scaffold" ? <SteroidScaffoldIcon /> : null}
      {node.id === "p450" ? (
        <span className="architecture-map-p450-rim" aria-hidden="true" />
      ) : null}
      {node.id === "evidence" ? (
        <span className="architecture-map-node-slots" aria-hidden="true">
          <i>Assay slot</i>
          <i>Figure slot</i>
          <i>Notebook slot</i>
        </span>
      ) : null}
    </button>
  );
}

function VariantSignalPanel({
  variant,
  activeId,
  onActivate,
}: {
  variant: ProjectArchitectureMapVariant;
  activeId: ArchitectureNodeId;
  onActivate: (nodeId: ArchitectureNodeId) => void;
}) {
  if (variant === "story") {
    return (
      <div className="architecture-map-variant-panel architecture-map-story-panel">
        <div>
          <span>Old route</span>
          <strong>Feedstock-bound, multistep, hard to scale.</strong>
        </div>
        <div>
          <span>Platform route</span>
          <strong>Carbon enters a controlled scaffold-catalysis-transport path.</strong>
        </div>
      </div>
    );
  }

  if (variant === "technical") {
    return (
      <div className="architecture-map-variant-panel architecture-map-technical-panel">
        {[
          ["scaffold", "Flux"],
          ["p450", "P450"],
          ["transport", "Transport"],
        ].map(([nodeId, label]) => (
          <button
            className={activeId === nodeId ? "is-active" : ""}
            key={nodeId}
            type="button"
            onClick={() => onActivate(nodeId as ArchitectureNodeId)}
          >
            {label}
          </button>
        ))}
      </div>
    );
  }

  if (variant === "evidence") {
    return (
      <div className="architecture-map-variant-panel architecture-map-evidence-panel">
        <span>Assay slot</span>
        <span>Figure slot</span>
        <span>Notebook slot</span>
      </div>
    );
  }

  return (
    <div className="architecture-map-variant-panel architecture-map-compact-panel">
      <span>10-second route</span>
      <strong>Carbon to scaffold to P450 to export to evidence</strong>
    </div>
  );
}

function FocusTerminal({
  node,
  variant,
}: {
  node: ArchitectureNode;
  variant: ProjectArchitectureMapVariant;
}) {
  const isCompact = variant === "compact";

  return (
    <aside className="architecture-map-terminal" aria-live="polite">
      <div className="architecture-map-terminal-topline">
        <span>{node.index} focus</span>
        <strong>{node.title}</strong>
      </div>
      {isCompact ? (
        <div className="architecture-map-terminal-compact">
          <span>{node.subtitle}</span>
          <strong>{node.evidenceSlot}</strong>
        </div>
      ) : (
        <dl>
          <div>
            <dt>Why it matters</dt>
            <dd>{node.why}</dd>
          </div>
          <div>
            <dt>Engineering lever</dt>
            <dd>{node.lever}</dd>
          </div>
          <div>
            <dt>Evidence slot</dt>
            <dd>{node.evidenceSlot}</dd>
          </div>
        </dl>
      )}
      <Link className="architecture-map-terminal-link" to={node.href}>
        Open {node.title}
      </Link>
    </aside>
  );
}

function useScrollProgress<T extends HTMLElement>() {
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
      const start = viewportHeight * 0.78;
      const end = -rect.height * 0.18;
      const raw = (start - rect.top) / Math.max(start - end, 1);

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

export function ProjectArchitectureMap({
  variant = "compact",
  activeNode,
  defaultActiveNode,
  onActiveNodeChange,
  className = "",
}: ProjectArchitectureMapProps) {
  const [hoveredNode, setHoveredNode] = useState<ArchitectureNodeId | null>(null);
  const [focusedNode, setFocusedNode] = useState<ArchitectureNodeId | null>(null);
  const [localActiveNode, setLocalActiveNode] = useState<ArchitectureNodeId | null>(
    defaultActiveNode || null,
  );
  const { ref: mobileRef, progress } = useScrollProgress<HTMLDivElement>();
  const variantDefault = defaultActiveNode || variantDefaults[variant];
  const activeId =
    hoveredNode || focusedNode || activeNode || localActiveNode || variantDefault;
  const active = nodeById[activeId];
  const focusMode = Boolean(
    hoveredNode ||
      focusedNode ||
      activeNode ||
      localActiveNode ||
      variant !== "compact",
  );

  const activateNode = (nodeId: ArchitectureNodeId) => {
    if (!activeNode) {
      setLocalActiveNode(nodeId);
    }

    onActiveNodeChange?.(nodeId);
  };

  const handleMobileKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    nodeId: ArchitectureNodeId,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activateNode(nodeId);
    }
  };

  return (
    <section
      className={`project-architecture-map project-architecture-map-${variant} ${focusMode ? "is-focus-mode" : ""} ${className}`.trim()}
      aria-label="Project Architecture Map"
      style={{ "--mobile-progress": `${Math.round(progress * 100)}%` } as CSSProperties}
    >
      <div className="architecture-map-desktop">
        <header className="architecture-map-header">
          <div>
            <span>PROJECT ARCHITECTURE MAP</span>
            <p>One controlled route from carbon input to verified steroid evidence</p>
          </div>
          <strong>ATLAS CONTROL ROOM</strong>
        </header>

        <div className="architecture-map-control-room">
          <svg
            className="architecture-map-background"
            viewBox="0 0 760 620"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <g className="architecture-map-cell-field">
              <ellipse cx="326" cy="312" rx="276" ry="224" />
              <ellipse cx="510" cy="246" rx="136" ry="96" />
              <path d="M86 214 176 142 300 176 372 92 572 144 690 262" />
              <path d="M90 456 214 392 356 482 504 420 684 488" />
              <path d="M156 92 206 164 154 246 230 326 174 430" />
            </g>
          </svg>

          <div className="architecture-map-topology">
            <svg
              className="architecture-map-flux-svg"
              viewBox="0 0 720 620"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="architectureFluxGradient" x1="0%" y1="0%" x2="62%" y2="100%">
                  <stop offset="0%" stopColor="#27C46A" />
                  <stop offset="42%" stopColor="#9EDBFF" />
                  <stop offset="58%" stopColor="#FFB300" />
                  <stop offset="76%" stopColor="#9EDBFF" />
                  <stop offset="100%" stopColor="#F6FAFF" />
                </linearGradient>
                <marker
                  id="architectureArrow"
                  markerWidth="12"
                  markerHeight="12"
                  refX="8"
                  refY="6"
                  orient="auto"
                >
                  <path d="M1 1 10 6 1 11Z" fill="#9EDBFF" opacity="0.82" />
                </marker>
              </defs>
              <path
                className="architecture-map-flux-shadow"
                d="M108 95 C142 138 173 175 222 205 C284 243 329 278 331 337 C334 403 333 432 332 470 C332 492 332 503 332 512"
              />
              <path
                className="architecture-map-flux-line"
                d="M108 95 C142 138 173 175 222 205 C284 243 329 278 331 337 C334 403 333 432 332 470 C332 492 332 503 332 512"
                markerEnd="url(#architectureArrow)"
              />
              <path
                className="architecture-map-flux-pulse"
                d="M108 95 C142 138 173 175 222 205 C284 243 329 278 331 337 C334 403 333 432 332 470 C332 492 332 503 332 512"
              />
              <path
                className="architecture-map-transport-arc architecture-map-transport-arc-a"
                d="M286 415 C204 424 154 475 132 538"
              />
              <path
                className="architecture-map-transport-arc architecture-map-transport-arc-b"
                d="M378 416 C472 438 535 480 584 538"
              />
            </svg>

            <div className="architecture-map-carbon-particles" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>

            {architectureNodes.map((node) => (
              <DesktopNode
                key={node.id}
                node={node}
                activeId={activeId}
                focusMode={focusMode}
                onActivate={activateNode}
                onHover={setHoveredNode}
                onFocus={setFocusedNode}
                onBlur={() => setFocusedNode(null)}
              />
            ))}
          </div>

          <div className="architecture-map-terminal-wrap">
            <span className="architecture-map-variant-label">
              {variantLabels[variant]}
            </span>
            <VariantSignalPanel
              variant={variant}
              activeId={activeId}
              onActivate={activateNode}
            />
            <FocusTerminal node={active} variant={variant} />
          </div>
        </div>
      </div>

      <div className="architecture-map-mobile" ref={mobileRef}>
        <header>
          <span>PROJECT ARCHITECTURE MAP</span>
          <p>Carbon to evidence, step by step</p>
        </header>
        <div className="architecture-map-mobile-chain">
          <span className="architecture-map-mobile-line" aria-hidden="true" />
          {architectureNodes.map((node) => {
            const isActive = activeId === node.id;

            return (
              <article
                className={`architecture-map-mobile-node architecture-map-accent-${node.accent} ${isActive ? "is-active" : ""}`.trim()}
                key={node.id}
              >
                <button
                  type="button"
                  onClick={() => activateNode(node.id)}
                  onFocus={() => setFocusedNode(node.id)}
                  onBlur={() => setFocusedNode(null)}
                  onKeyDown={(event) => handleMobileKeyDown(event, node.id)}
                  aria-pressed={isActive}
                >
                  <span>{node.index}</span>
                  <strong>{node.title}</strong>
                  <small>{node.subtitle}</small>
                </button>
                {node.id === "evidence" ? (
                  <div className="architecture-map-mobile-slots" aria-label="Evidence slots">
                    <span>Assay slot</span>
                    <span>Figure slot</span>
                    <span>Notebook slot</span>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
        <VariantSignalPanel
          variant={variant}
          activeId={activeId}
          onActivate={activateNode}
        />
        <FocusTerminal node={active} variant={variant} />
      </div>
    </section>
  );
}

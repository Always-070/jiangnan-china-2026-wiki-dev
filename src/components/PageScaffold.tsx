import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

export interface CallToAction {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
  external?: boolean;
}

export interface PageAnchor {
  id: string;
  label: string;
}

export interface HeroFigure {
  label: string;
  title: string;
  description: string;
  items?: string[];
}

interface PageIntroProps {
  eyebrow?: string;
  title: string;
  summary: string;
  bullets?: string[];
  ctaLinks?: CallToAction[];
  heroFigure?: HeroFigure;
  tone?: "light" | "dark";
  className?: string;
}

interface MetricItem {
  label: string;
  value: string;
  note?: string;
}

interface MetricStripProps {
  items: MetricItem[];
}

interface FlowStep {
  label: string;
  title: string;
  text: string;
}

interface FlowDiagramProps {
  title: string;
  lead: string;
  steps: FlowStep[];
  variant?: "linear" | "loop";
}

interface EvidenceItem {
  title: string;
  description: string;
  metric?: string;
  status?: string;
  href?: string;
}

interface EvidenceGridProps {
  items: EvidenceItem[];
}

interface ReferenceItem {
  label: string;
  href: string;
  note?: string;
}

interface ReferenceBlockProps {
  title?: string;
  items: ReferenceItem[];
}

export interface ResultMetric {
  label: string;
  value: string;
  unit?: string;
  note?: string;
  isHighlight?: boolean;
}

export type ResultPathwayNode =
  | "flux"
  | "scaffold"
  | "catalysis"
  | "transport"
  | "integrated";

export type ResultDataCardStatus =
  | "planned"
  | "in-progress"
  | "linked"
  | "needs-validation"
  | "validated";

interface ResultFigure {
  type: "image" | "chart" | "gel" | "table" | "placeholder";
  src?: string;
  alt?: string;
  caption?: string;
}

export interface ResultDataCardData {
  id: string;
  title: string;
  pathwayNode: ResultPathwayNode;
  status: ResultDataCardStatus;
  claim: string;
  method: string;
  controls?: string;
  standardization?: string;
  figure?: ResultFigure;
  quantitativeResults: ResultMetric[];
  interpretation: string;
  limitations: string;
  notebookHref?: string;
  notebookLabel?: string;
}

interface ResultDataCardProps extends ResultDataCardData {
  variant?: "result" | "measurement";
  featured?: boolean;
}

interface ResultDataCardGridProps {
  cards: ResultDataCardData[];
  filterBy?: ResultPathwayNode | "all";
}

const pathwayLabels: Record<ResultPathwayNode, string> = {
  flux: "Flux support",
  scaffold: "Scaffold readiness",
  catalysis: "P450 catalysis",
  transport: "Transport compatibility",
  integrated: "Integrated run",
};

const pathwayShortLabels: Record<ResultPathwayNode, string> = {
  flux: "Flux",
  scaffold: "Scaffold",
  catalysis: "P450",
  transport: "Transport",
  integrated: "Integrated",
};

const pathwayOrder: ResultPathwayNode[] = [
  "flux",
  "scaffold",
  "catalysis",
  "transport",
  "integrated",
];

const statusLabels: Record<ResultDataCardStatus, string> = {
  planned: "Planned",
  "in-progress": "In progress",
  linked: "Linked",
  "needs-validation": "Needs validation",
  validated: "Validated",
};

export function PageIntro({
  eyebrow,
  title,
  summary,
  bullets = [],
  ctaLinks = [],
  heroFigure,
  tone = "light",
  className = "",
}: PageIntroProps) {
  return (
    <section className={`page-intro page-intro-${tone} ${className}`.trim()}>
      <div className="page-intro-grid">
        <div className="page-intro-copy">
          {eyebrow ? (
            <span className="page-intro-eyebrow">{eyebrow}</span>
          ) : null}
          <h1 className="page-intro-title">{title}</h1>
          <p className="page-intro-summary">{summary}</p>
          {bullets.length ? (
            <ul className="page-intro-bullets">
              {bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          ) : null}
          {ctaLinks.length ? (
            <div className="page-intro-actions">
              {ctaLinks.map((action) => (
                <InlineLink
                  key={`${action.label}-${action.href}`}
                  className={`intro-action intro-action-${action.variant || "primary"}`}
                  href={action.href}
                  external={action.external}
                  label={action.label}
                />
              ))}
            </div>
          ) : null}
        </div>
        {heroFigure ? (
          <aside className="hero-figure-card">
            <span className="hero-figure-label">{heroFigure.label}</span>
            <h2>{heroFigure.title}</h2>
            <p>{heroFigure.description}</p>
            {heroFigure.items?.length ? (
              <ul className="hero-figure-list">
                {heroFigure.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </aside>
        ) : null}
      </div>
    </section>
  );
}

export function SectionNav({ sections }: { sections: PageAnchor[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id || "");

  useEffect(() => {
    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter(Boolean) as HTMLElement[];

    if (!targets.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) => right.intersectionRatio - left.intersectionRatio,
          )[0];

        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      {
        rootMargin: "-35% 0px -45% 0px",
        threshold: [0.15, 0.35, 0.6],
      },
    );

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav className="section-nav" aria-label="In-page navigation">
      <span className="section-nav-label">On this page</span>
      <div className="section-nav-links">
        {sections.map((section) => (
          <button
            type="button"
            key={section.id}
            className={activeId === section.id ? "is-active" : ""}
            aria-current={activeId === section.id ? "location" : undefined}
            onClick={() => scrollToSection(section.id)}
          >
            {section.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

export function MetricStrip({ items }: MetricStripProps) {
  return (
    <div className="metric-strip">
      {items.map((item) => (
        <article className="metric-card" key={`${item.label}-${item.value}`}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          {item.note ? <p>{item.note}</p> : null}
        </article>
      ))}
    </div>
  );
}

export function FlowDiagram({
  title,
  lead,
  steps,
  variant = "linear",
}: FlowDiagramProps) {
  return (
    <section className={`flow-diagram flow-diagram-${variant}`}>
      <div className="section-heading">
        <h3>{title}</h3>
        <p>{lead}</p>
      </div>
      <div className="flow-steps" role="list">
        {steps.map((step, index) => (
          <div
            className="flow-step"
            key={`${step.label}-${step.title}`}
            role="listitem"
          >
            <span className="flow-step-label">
              {variant === "loop" ? `0${index + 1}` : step.label}
            </span>
            <h4>{step.title}</h4>
            <p>{step.text}</p>
          </div>
        ))}
      </div>
      {variant === "loop" ? (
        <p className="flow-loop-note">
          Each lesson should feed the next decision instead of being archived at
          the end.
        </p>
      ) : null}
    </section>
  );
}

export function EvidenceGrid({ items }: EvidenceGridProps) {
  return (
    <div className="evidence-grid">
      {items.map((item) => (
        <article className="evidence-card" key={item.title}>
          {item.status ? (
            <span className="evidence-status">{item.status}</span>
          ) : null}
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          {item.metric ? <strong>{item.metric}</strong> : null}
          {item.href ? (
            <InlineLink
              className="evidence-link"
              href={item.href}
              label="Open page"
            />
          ) : null}
        </article>
      ))}
    </div>
  );
}

export function ResultDataCard({
  variant = "result",
  featured = false,
  id,
  title,
  pathwayNode,
  status,
  claim,
  method,
  controls,
  standardization,
  figure,
  quantitativeResults,
  interpretation,
  limitations,
  notebookHref,
  notebookLabel,
}: ResultDataCardProps) {
  const [figureOpen, setFigureOpen] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy citation");
  const [contextOpen, setContextOpen] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return window.matchMedia("(min-width: 768px)").matches;
  });
  const cardAnchor = resultAnchorFromId(id);
  const statusLabel = statusLabels[status];
  const citationText = `${id}: ${title} (${pathwayLabels[pathwayNode]}; status: ${statusLabel})`;
  const methodFirst = variant === "measurement";

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const syncContextState = () => setContextOpen(query.matches);

    syncContextState();
    query.addEventListener("change", syncContextState);

    return () => query.removeEventListener("change", syncContextState);
  }, []);

  async function copyCitation() {
    try {
      await navigator.clipboard.writeText(citationText);
      setCopyLabel("Copied");
    } catch {
      setCopyLabel("Copy unavailable");
    }

    window.setTimeout(() => setCopyLabel("Copy citation"), 1800);
  }

  return (
    <article
      id={cardAnchor}
      className={`result-data-card result-data-card-${variant} result-data-card-${status} ${
        featured ? "is-featured" : ""
      }`.trim()}
    >
      <header className="result-data-card-header">
        <div className="result-data-card-meta">
          <span className="result-pathway-chip">
            {pathwayLabels[pathwayNode]}
          </span>
          <span>{id}</span>
          <span className="result-status-chip">Status: {statusLabel}</span>
        </div>
        <PathwayIndicator activeNode={pathwayNode} />
        <h3>{title}</h3>
      </header>

      {methodFirst ? (
        <section
          className="result-method-console"
          aria-label={`${title} method`}
        >
          <ResultField label="Method" text={method} />
          {controls || standardization ? (
            <div className="result-quality-tags">
              {controls ? (
                <span>
                  <strong>Controls</strong>
                  {controls}
                </span>
              ) : null}
              {standardization ? (
                <span>
                  <strong>Standardization</strong>
                  {standardization}
                </span>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="result-data-card-core">
        <ResultFigurePanel
          figure={figure}
          title={title}
          onOpen={() => setFigureOpen(true)}
        />

        <div className="result-claim-console">
          <ResultField label="Claim" text={claim} prominent />
          {!methodFirst ? <ResultField label="Method" text={method} /> : null}
          <MetricChips metrics={quantitativeResults} />
        </div>
      </div>

      <details
        className="result-context-panel"
        open={contextOpen}
        onToggle={(event) => setContextOpen(event.currentTarget.open)}
      >
        <summary>Experimental context and interpretation</summary>
        <div className="result-context-grid">
          {methodFirst ? <ResultField label="Claim" text={claim} /> : null}
          <ResultField label="Interpretation" text={interpretation} />
          <ResultField label="Limitations" text={limitations} muted />
        </div>
      </details>

      <footer className="result-data-card-footer">
        <NotebookLink href={notebookHref} label={notebookLabel} />
        <button
          type="button"
          className="result-copy-button"
          onClick={copyCitation}
        >
          {copyLabel}
        </button>
      </footer>

      {figureOpen
        ? createPortal(
            <FigureLightbox
              figure={figure}
              title={title}
              onClose={() => setFigureOpen(false)}
            />,
            document.body,
          )
        : null}
    </article>
  );
}

export function ResultDataCardGrid({
  cards,
  filterBy = "all",
}: ResultDataCardGridProps) {
  const [activeFilter, setActiveFilter] = useState<ResultPathwayNode | "all">(
    filterBy,
  );
  const filters: Array<{ id: ResultPathwayNode | "all"; label: string }> = [
    { id: "all", label: "All" },
    ...pathwayOrder.map((node) => ({
      id: node,
      label: pathwayShortLabels[node],
    })),
  ];
  const visibleCards =
    activeFilter === "all"
      ? cards
      : cards.filter((card) => card.pathwayNode === activeFilter);

  useEffect(() => {
    setActiveFilter(filterBy);
  }, [filterBy]);

  return (
    <section
      className="result-data-card-system"
      aria-label="Result data card grid"
    >
      <div className="result-filter-bar" aria-label="Filter evidence cards">
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={activeFilter === filter.id ? "is-active" : ""}
            aria-pressed={activeFilter === filter.id}
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {visibleCards.length ? (
        <div className="result-data-card-grid">
          {visibleCards.map((card) => (
            <ResultDataCard key={card.id} variant="result" {...card} />
          ))}
        </div>
      ) : (
        <p className="result-empty-state">Reserved for verified result.</p>
      )}
    </section>
  );
}

function ResultField({
  label,
  text,
  prominent = false,
  muted = false,
}: {
  label: string;
  text: string;
  prominent?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`result-field ${prominent ? "result-field-prominent" : ""} ${
        muted ? "result-field-muted" : ""
      }`.trim()}
    >
      <span>{label}</span>
      <p>{text}</p>
    </div>
  );
}

function MetricChips({ metrics }: { metrics: ResultMetric[] }) {
  return (
    <section className="result-metric-strip" aria-label="Quantitative result">
      <span>Quantitative result</span>
      <div>
        {metrics.map((metric) => (
          <strong
            className={metric.isHighlight ? "is-highlight" : ""}
            key={`${metric.label}-${metric.value}`}
          >
            <span>{metric.label}</span>
            {metric.value}
            {metric.unit ? <em>{metric.unit}</em> : null}
            {metric.note ? <small>{metric.note}</small> : null}
          </strong>
        ))}
      </div>
    </section>
  );
}

function PathwayIndicator({ activeNode }: { activeNode: ResultPathwayNode }) {
  const activeIndex = pathwayOrder.indexOf(activeNode);

  return (
    <ol className="result-pathway-indicator" aria-label="Pathway context">
      {pathwayOrder.map((node, index) => (
        <li
          key={node}
          className={
            node === activeNode
              ? "is-active"
              : index < activeIndex
                ? "is-before"
                : ""
          }
        >
          <span>{pathwayShortLabels[node]}</span>
        </li>
      ))}
    </ol>
  );
}

function ResultFigurePanel({
  figure,
  title,
  onOpen,
}: {
  figure?: ResultFigure;
  title: string;
  onOpen: () => void;
}) {
  const figureType = figure?.type || "placeholder";
  const caption = figure?.caption || "Reserved for verified result.";

  return (
    <button
      type="button"
      className={`result-figure-panel result-figure-${figureType}`}
      onClick={onOpen}
      aria-label={`Open figure for ${title}`}
    >
      <span className="result-figure-type">{figureType}</span>
      {figure?.src ? (
        <img src={figure.src} alt={figure.alt || title} />
      ) : (
        <span className="result-figure-placeholder">
          <strong>Reserved for verified result</strong>
          <small>{caption}</small>
        </span>
      )}
      <span className="result-figure-caption">{caption}</span>
    </button>
  );
}

function FigureLightbox({
  figure,
  title,
  onClose,
}: {
  figure?: ResultFigure;
  title: string;
  onClose: () => void;
}) {
  return (
    <div
      className="result-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        className="result-lightbox-backdrop"
        aria-label="Close figure preview"
        onClick={onClose}
      />
      <div className="result-lightbox-panel">
        <div className="result-lightbox-header">
          <span>Figure preview</span>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <ResultFigurePanel
          figure={figure}
          title={title}
          onOpen={() => undefined}
        />
      </div>
    </div>
  );
}

function NotebookLink({ href, label }: { href?: string; label?: string }) {
  const resolvedLabel = label || "Notebook record pending";

  if (!href) {
    return (
      <span className="result-notebook-link is-disabled">{resolvedLabel}</span>
    );
  }

  if (href.startsWith("/")) {
    return (
      <Link className="result-notebook-link" to={href}>
        Notebook: {resolvedLabel}
      </Link>
    );
  }

  return (
    <a className="result-notebook-link" href={href}>
      Notebook: {resolvedLabel}
    </a>
  );
}

function resultAnchorFromId(id: string) {
  return id
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function InlineLink({
  className,
  href,
  label,
  external,
}: {
  className: string;
  href: string;
  label: string;
  external?: boolean;
}) {
  if (href.startsWith("#")) {
    const sectionId = href.slice(1);

    return (
      <button
        className={className}
        type="button"
        onClick={() => scrollToSection(sectionId)}
      >
        {label}
      </button>
    );
  }

  if (!external && href.startsWith("/")) {
    return (
      <Link className={className} to={href}>
        {label}
      </Link>
    );
  }

  return (
    <a
      className={className}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
    >
      {label}
    </a>
  );
}

function scrollToSection(sectionId: string) {
  const target = document.getElementById(sectionId);

  if (!target) {
    return;
  }

  const targetTop =
    target.getBoundingClientRect().top + window.scrollY - getAnchorOffset();

  window.scrollTo({
    top: Math.max(targetTop, 0),
    behavior: "smooth",
  });

  window.requestAnimationFrame(() => {
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });
}

function getAnchorOffset() {
  const sectionNav = document.querySelector(
    ".section-nav",
  ) as HTMLElement | null;

  return 96 + (sectionNav ? sectionNav.offsetHeight + 16 : 0);
}

export function ReferenceBlock({
  title = "Reference shortlist",
  items,
}: ReferenceBlockProps) {
  return (
    <section className="reference-block">
      <div className="section-heading">
        <h3>{title}</h3>
        <p>
          Use these references to keep the writing grounded, visual, and
          judge-friendly.
        </p>
      </div>
      <ul className="reference-list">
        {items.map((item) => (
          <li key={item.href}>
            <a href={item.href} target="_blank" rel="noreferrer">
              {item.label}
            </a>
            {item.note ? <span>{item.note}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

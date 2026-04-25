import { useEffect, useState } from "react";
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
          {eyebrow ? <span className="page-intro-eyebrow">{eyebrow}</span> : null}
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
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

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
          <div className="flow-step" key={`${step.label}-${step.title}`} role="listitem">
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
          Each lesson should feed the next decision instead of being archived at the end.
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
          {item.status ? <span className="evidence-status">{item.status}</span> : null}
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          {item.metric ? <strong>{item.metric}</strong> : null}
          {item.href ? (
            <InlineLink className="evidence-link" href={item.href} label="Open page" />
          ) : null}
        </article>
      ))}
    </div>
  );
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
      <button className={className} type="button" onClick={() => scrollToSection(sectionId)}>
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

  const navOffset = 96;
  const targetTop = target.getBoundingClientRect().top + window.scrollY - navOffset;

  window.scrollTo({
    top: Math.max(targetTop, 0),
    behavior: "smooth",
  });

  window.requestAnimationFrame(() => {
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });
}

export function ReferenceBlock({
  title = "Reference shortlist",
  items,
}: ReferenceBlockProps) {
  return (
    <section className="reference-block">
      <div className="section-heading">
        <h3>{title}</h3>
        <p>Use these references to keep the writing grounded, visual, and judge-friendly.</p>
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

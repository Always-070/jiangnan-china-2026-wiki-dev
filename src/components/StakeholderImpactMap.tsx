import { useEffect, useMemo, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";

export type StakeholderCategory =
  | "medical"
  | "industry"
  | "sustainability"
  | "safety"
  | "education"
  | "public";

export type StakeholderImpactStatus =
  | "mapped"
  | "interviewed"
  | "translated"
  | "incorporated"
  | "needs-follow-up"
  | "evidence-linked";

export type StakeholderEvidenceType =
  | "interview"
  | "survey"
  | "notebook"
  | "wiki-section"
  | "placeholder";

export interface StakeholderEvidence {
  label: string;
  href?: string;
  type: StakeholderEvidenceType;
  reason?: string;
}

export interface StakeholderImpactItem {
  id: string;
  category: StakeholderCategory;
  stakeholder: string;
  role: string;
  insight: string;
  requirement: string;
  projectChange: string;
  evidence: StakeholderEvidence[];
  status: StakeholderImpactStatus;
}

export type StakeholderImpactMapVariant = "human-practices" | "sustainability";

interface StakeholderImpactMapProps {
  variant?: StakeholderImpactMapVariant;
  activeCategory?: StakeholderCategory;
  className?: string;
}

type FilterCategory = StakeholderCategory | "all";

const categoryLabels: Record<StakeholderCategory, string> = {
  medical: "Medical",
  industry: "Industry",
  sustainability: "Sustainability",
  safety: "Safety",
  education: "Education",
  public: "Public",
};

const categoryShortLabels: Record<StakeholderCategory, string> = {
  medical: "Med",
  industry: "Ind",
  sustainability: "Sus",
  safety: "Safe",
  education: "Edu",
  public: "Pub",
};

const statusLabels: Record<StakeholderImpactStatus, string> = {
  mapped: "Mapped",
  interviewed: "Interviewed",
  translated: "Translated",
  incorporated: "Incorporated",
  "needs-follow-up": "Needs follow-up",
  "evidence-linked": "Evidence linked",
};

const variantCopy: Record<
  StakeholderImpactMapVariant,
  {
    eyebrow: string;
    title: string;
    lead: string;
    chainLead: string;
    insightLabel: string;
    changeLabel: string;
    drawerTitle: string;
  }
> = {
  "human-practices": {
    eyebrow: "HUMAN PRACTICES",
    title: "STAKEHOLDER IMPACT MAP",
    lead: "From conversation to requirement, from requirement to project change",
    chainLead:
      "Every stakeholder conversation is translated into a concrete requirement, a project decision, and a traceable evidence record.",
    insightLabel: "Insight",
    changeLabel: "Project Change",
    drawerTitle: "Selected Impact",
  },
  sustainability: {
    eyebrow: "SUSTAINABILITY",
    title: "SUSTAINABILITY IMPACT MAP",
    lead: "From route burden to requirement, from requirement to design response",
    chainLead:
      "Every sustainability concern is translated into a project requirement, a design response, and a traceable evidence record.",
    insightLabel: "Sustainability Insight",
    changeLabel: "Design Response",
    drawerTitle: "Selected Sustainability Impact",
  },
};

const humanPracticeItems: StakeholderImpactItem[] = [
  {
    id: "clinician-pharmacist",
    category: "medical",
    stakeholder: "Clinician / pharmacist",
    role: "Endocrinology and steroid-use framing",
    insight:
      "Steroid hormone applications require careful wording, safety framing, and validation before any product-level claim is made.",
    requirement:
      "Avoid overstating therapeutic claims and keep evidence, method, and limitation visible beside each result.",
    projectChange:
      "Results cards keep claim, method, limitation, and notebook slots together so readers can see what is verified and what remains reserved.",
    evidence: [
      {
        label: "Interview note placeholder",
        type: "placeholder",
        reason:
          "Reserved until the clinical or pharmacy interview note is finalized.",
      },
      {
        label: "Results evidence card",
        href: "/results#cards",
        type: "wiki-section",
      },
    ],
    status: "incorporated",
  },
  {
    id: "bioprocess-engineer",
    category: "industry",
    stakeholder: "Bioprocess engineer",
    role: "Scale-up, controllability, and platform feasibility",
    insight:
      "Steroid cell factories are only useful if flux, P450 catalysis, and transport can be controlled together.",
    requirement:
      "Engineering must present these layers as one system, not as isolated pathway fragments.",
    projectChange:
      "Project Architecture Map and DBTL Evidence Matrix connect flux, P450 catalysis, and transport/export as linked control layers.",
    evidence: [
      {
        label: "Meeting summary placeholder",
        type: "placeholder",
        reason: "Reserved until the bioprocess meeting summary is approved.",
      },
      {
        label: "Engineering DBTL matrix",
        href: "/engineering#matrix",
        type: "wiki-section",
      },
    ],
    status: "evidence-linked",
  },
  {
    id: "sustainability-advisor",
    category: "sustainability",
    stakeholder: "Sustainability advisor",
    role: "Feedstock, waste, and route burden",
    insight:
      "Old feedstock routes can carry waste, extraction burden, and supply-chain constraints that the platform must address honestly.",
    requirement:
      "Compare the old route and the platform route by feedstock, waste, scalability, and evidence maturity.",
    projectChange:
      "Description and Sustainability framing separate route-burden logic from future LCA or TEA evidence slots.",
    evidence: [
      {
        label: "Description route comparison",
        href: "/description#gap",
        type: "wiki-section",
      },
      {
        label: "LCA / TEA reserved",
        type: "placeholder",
        reason: "Reserved for future quantitative sustainability analysis.",
      },
    ],
    status: "needs-follow-up",
  },
  {
    id: "public-education-audience",
    category: "public",
    stakeholder: "Primary-school and university education audiences",
    role: "Accessible explanation, feedback, and trust-building",
    insight:
      "Vitamin D, sunlight, sleep, stress, and endocrine rhythms are easier entry points than pathway diagrams when audiences first meet steroid-related biology.",
    requirement:
      "Build education materials around daily habits, hands-on interaction, and bilingual vocabulary support before introducing synthetic biology terms.",
    projectChange:
      "Education now records the questionnaire-to-activity-to-feedback loop and links public questions back to the team's communication requirements.",
    evidence: [
      {
        label: "Education activity records",
        href: "/education#primary-school",
        type: "survey",
      },
      {
        label: "English Corner feedback loop",
        href: "/education#english-corner",
        type: "wiki-section",
      },
      {
        label: "Education page",
        href: "/education",
        type: "wiki-section",
      },
    ],
    status: "evidence-linked",
  },
  {
    id: "safety-advisor",
    category: "safety",
    stakeholder: "Safety advisor",
    role: "Containment, chassis risk, and responsible deployment",
    insight:
      "Engineered chassis and steroid intermediates need clear boundaries around containment, handling, and deployment assumptions.",
    requirement:
      "Connect project design choices to biosafety controls and avoid implying uncontrolled environmental deployment.",
    projectChange:
      "Safety and HP pages cross-reference design constraints so responsibility is tied back to the platform architecture.",
    evidence: [
      {
        label: "Safety section",
        href: "/safety-and-security",
        type: "wiki-section",
      },
      {
        label: "Risk discussion reserved",
        type: "placeholder",
        reason: "Reserved for the final safety advisor record.",
      },
    ],
    status: "translated",
  },
  {
    id: "team-advisors",
    category: "education",
    stakeholder: "Team / advisors",
    role: "Narrative review and implementation discipline",
    insight:
      "The wiki must prove how stakeholder input changed decisions instead of listing outreach as a separate activity.",
    requirement:
      "Keep every HP record in the same chain: stakeholder, insight, requirement, project change, evidence.",
    projectChange:
      "This map becomes the integration console for HP writing, page links, and reserved evidence records.",
    evidence: [
      {
        label: "HP activity record reserved",
        type: "placeholder",
        reason: "Reserved for final activity cards or advisor notes.",
      },
    ],
    status: "mapped",
  },
];

const sustainabilityItems: StakeholderImpactItem[] = [
  {
    id: "environmental-advisor",
    category: "sustainability",
    stakeholder: "Environmental advisor",
    role: "Route burden, feedstock, and waste",
    insight:
      "Feedstock extraction and chemical conversion create burden that should not be hidden behind a simple green-manufacturing claim.",
    requirement:
      "Compare routes by waste, feedstock dependence, scalability, and evidence maturity.",
    projectChange:
      "Sustainability view adds route-burden checkpoints and keeps LCA/TEA as honest reserved evidence slots.",
    evidence: [
      {
        label: "LCA placeholder",
        type: "placeholder",
        reason: "Awaiting quantitative LCA or route-burden analysis.",
      },
      {
        label: "Route-burden section",
        href: "/sustainability#route-burden",
        type: "wiki-section",
      },
    ],
    status: "needs-follow-up",
  },
  {
    id: "industry-scale-up",
    category: "industry",
    stakeholder: "Industry stakeholder",
    role: "Fermentation scale and cost awareness",
    insight:
      "Fermentation must be scalable, controllable, and cost-aware before it can be described as a platform route.",
    requirement:
      "Separate near-term feasibility from future manufacturing vision.",
    projectChange:
      "Implementation readiness distinguishes proof-of-concept evidence, scale assumptions, and future TEA needs.",
    evidence: [
      {
        label: "Interview / TEA slot",
        type: "placeholder",
        reason: "Reserved for industry interview notes or TEA assumptions.",
      },
      {
        label: "Engineering control layers",
        href: "/engineering#matrix",
        type: "wiki-section",
      },
    ],
    status: "translated",
  },
  {
    id: "community-public",
    category: "public",
    stakeholder: "Community / public",
    role: "Plain-language risk and benefit framing",
    insight:
      "Synthetic biology can sound risky without context about containment, purpose, and why the route matters.",
    requirement:
      "Explain containment, benefits, and limitations in plain language before making sustainability claims.",
    projectChange:
      "Human Practices uses requirement cards and evidence placeholders so public concerns feed back into page writing.",
    evidence: [
      {
        label: "Survey / outreach notes reserved",
        type: "placeholder",
        reason: "Reserved for public survey or outreach notes.",
      },
      {
        label: "Human Practices map",
        href: "/human-practices#impact-map",
        type: "wiki-section",
      },
    ],
    status: "mapped",
  },
  {
    id: "lab-safety-expert",
    category: "safety",
    stakeholder: "Lab safety expert",
    role: "Chassis and product-handling boundaries",
    insight:
      "The chassis, intermediates, and product-handling assumptions need risk boundaries before deployment language is credible.",
    requirement:
      "Connect sustainability design to safety controls and responsible deployment constraints.",
    projectChange:
      "Safety evidence is linked from the sustainability map rather than treated as a separate compliance page.",
    evidence: [
      {
        label: "Safety evidence link",
        href: "/safety-and-security",
        type: "wiki-section",
      },
      {
        label: "Handling note reserved",
        type: "placeholder",
        reason: "Reserved until final lab-safety evidence is written.",
      },
    ],
    status: "incorporated",
  },
];

const filterOrder: FilterCategory[] = [
  "all",
  "medical",
  "industry",
  "sustainability",
  "safety",
  "public",
  "education",
];

export function StakeholderImpactMap({
  variant = "human-practices",
  activeCategory,
  className = "",
}: StakeholderImpactMapProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const items =
    variant === "sustainability" ? sustainabilityItems : humanPracticeItems;
  const itemsById = useMemo(
    () =>
      items.reduce(
        (lookup, item) => ({ ...lookup, [item.id]: item }),
        {} as Record<string, StakeholderImpactItem>,
      ),
    [items],
  );
  const requestedCategory = getCategoryFromParam(searchParams.get("category"));
  const requestedStakeholder = searchParams.get("stakeholder") || "";
  const [activeFilter, setActiveFilter] = useState<FilterCategory>(
    activeCategory || requestedCategory || "all",
  );
  const [selectedId, setSelectedId] = useState(
    itemsById[requestedStakeholder]?.id || items[0]?.id || "",
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const copy = variantCopy[variant];
  const availableFilters = filterOrder.filter(
    (filter) =>
      filter === "all" || items.some((item) => item.category === filter),
  );
  const visibleItems =
    activeFilter === "all"
      ? items
      : items.filter((item) => item.category === activeFilter);

  useEffect(() => {
    if (requestedCategory) {
      setActiveFilter(requestedCategory);
    }
  }, [requestedCategory]);

  useEffect(() => {
    if (requestedStakeholder && itemsById[requestedStakeholder]) {
      setSelectedId(requestedStakeholder);
    }
  }, [itemsById, requestedStakeholder]);

  useEffect(() => {
    if (!visibleItems.length) {
      return;
    }

    if (!visibleItems.some((item) => item.id === selectedId)) {
      setSelectedId(visibleItems[0].id);
    }
  }, [selectedId, visibleItems]);

  const selectedItem = itemsById[selectedId] || visibleItems[0] || items[0];
  const activeItem = hoveredId
    ? itemsById[hoveredId] || selectedItem
    : selectedItem;

  const updateUrlState = (itemId: string, category: FilterCategory) => {
    const nextParams = new URLSearchParams(searchParams);

    nextParams.set("stakeholder", itemId);

    if (category === "all") {
      nextParams.delete("category");
    } else {
      nextParams.set("category", category);
    }

    setSearchParams(nextParams, { replace: true });
  };

  const selectItem = (item: StakeholderImpactItem) => {
    setSelectedId(item.id);
    updateUrlState(item.id, activeFilter);
  };

  const selectFilter = (filter: FilterCategory) => {
    const nextItems =
      filter === "all"
        ? items
        : items.filter((item) => item.category === filter);
    const nextItem = nextItems[0] || items[0];

    setActiveFilter(filter);

    if (nextItem) {
      setSelectedId(nextItem.id);
      updateUrlState(nextItem.id, filter);
    }
  };

  return (
    <section
      className={`stakeholder-impact-map stakeholder-impact-map-${variant} ${className}`.trim()}
      aria-label={copy.title}
    >
      <div className="impact-map-desktop">
        <header className="impact-map-header">
          <div>
            <span>{copy.title}</span>
            <p>{copy.lead}</p>
          </div>
          <strong>{copy.eyebrow}</strong>
        </header>

        <div className="impact-map-statement">{copy.chainLead}</div>

        <FilterBar
          filters={availableFilters}
          activeFilter={activeFilter}
          onSelect={selectFilter}
        />

        <div className="impact-map-console">
          <StakeholderOrbit
            items={visibleItems}
            activeId={activeItem.id}
            selectedId={selectedItem.id}
            onSelect={selectItem}
            onHover={setHoveredId}
          />

          <ImpactChain
            items={visibleItems}
            activeId={activeItem.id}
            selectedId={selectedItem.id}
            copy={copy}
            onSelect={selectItem}
            onHover={setHoveredId}
          />

          <ImpactDrawer item={activeItem} copy={copy} />
        </div>
      </div>

      <div className="impact-map-mobile">
        <header className="impact-map-mobile-header">
          <span>{copy.title}</span>
          <p>{copy.chainLead}</p>
        </header>
        <FilterBar
          filters={availableFilters}
          activeFilter={activeFilter}
          onSelect={selectFilter}
        />
        <div className="impact-mobile-cards">
          {visibleItems.map((item) => (
            <MobileImpactCard
              key={item.id}
              item={item}
              copy={copy}
              isActive={item.id === selectedItem.id}
              onSelect={selectItem}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FilterBar({
  filters,
  activeFilter,
  onSelect,
}: {
  filters: FilterCategory[];
  activeFilter: FilterCategory;
  onSelect: (filter: FilterCategory) => void;
}) {
  return (
    <div className="impact-filter-bar" aria-label="Filter stakeholders">
      {filters.map((filter) => (
        <button
          key={filter}
          type="button"
          className={activeFilter === filter ? "is-active" : ""}
          aria-pressed={activeFilter === filter}
          onClick={() => onSelect(filter)}
        >
          {filter === "all" ? "All" : categoryLabels[filter]}
        </button>
      ))}
    </div>
  );
}

function StakeholderOrbit({
  items,
  activeId,
  selectedId,
  onSelect,
  onHover,
}: {
  items: StakeholderImpactItem[];
  activeId: string;
  selectedId: string;
  onSelect: (item: StakeholderImpactItem) => void;
  onHover: (itemId: string | null) => void;
}) {
  return (
    <aside className="impact-orbit" aria-label="Stakeholder Orbit">
      <div className="impact-panel-title">
        <span>Stakeholder Orbit</span>
        <strong>{items.length} mapped nodes</strong>
      </div>
      <div className="impact-orbit-list">
        {items.map((item) => {
          const isActive = item.id === activeId;

          return (
            <button
              key={item.id}
              type="button"
              className={`impact-orbit-node impact-category-${item.category} ${
                isActive ? "is-active" : ""
              } ${selectedId === item.id ? "is-selected" : ""}`.trim()}
              onClick={() => onSelect(item)}
              onMouseEnter={() => onHover(item.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(item.id)}
              onBlur={() => onHover(null)}
            >
              <span className="impact-orbit-avatar">
                {categoryShortLabels[item.category]}
              </span>
              <span className="impact-orbit-copy">
                <strong>{item.stakeholder}</strong>
                <small>{item.role}</small>
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function ImpactChain({
  items,
  activeId,
  selectedId,
  copy,
  onSelect,
  onHover,
}: {
  items: StakeholderImpactItem[];
  activeId: string;
  selectedId: string;
  copy: (typeof variantCopy)[StakeholderImpactMapVariant];
  onSelect: (item: StakeholderImpactItem) => void;
  onHover: (itemId: string | null) => void;
}) {
  return (
    <section className="impact-chain-panel" aria-label="Impact Chain">
      <div className="impact-chain-heading">
        <span>Stakeholder</span>
        <span>{copy.insightLabel}</span>
        <span>Requirement</span>
        <span>{copy.changeLabel}</span>
        <span>Evidence</span>
      </div>
      <div className="impact-chain-rows">
        {items.map((item) => (
          <ImpactRow
            key={item.id}
            item={item}
            copy={copy}
            isActive={item.id === activeId}
            isSelected={item.id === selectedId}
            hasFocus={Boolean(activeId)}
            onSelect={onSelect}
            onHover={onHover}
          />
        ))}
      </div>
    </section>
  );
}

function ImpactRow({
  item,
  copy,
  isActive,
  isSelected,
  hasFocus,
  onSelect,
  onHover,
}: {
  item: StakeholderImpactItem;
  copy: (typeof variantCopy)[StakeholderImpactMapVariant];
  isActive: boolean;
  isSelected: boolean;
  hasFocus: boolean;
  onSelect: (item: StakeholderImpactItem) => void;
  onHover: (itemId: string | null) => void;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(item);
    }
  };

  return (
    <article
      id={`impact-${item.id}`}
      className={`impact-chain-row impact-category-${item.category} ${
        isActive ? "is-active" : ""
      } ${isSelected ? "is-selected" : ""} ${
        hasFocus && !isActive ? "is-muted" : ""
      }`.trim()}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(item)}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => onHover(item.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(item.id)}
      onBlur={() => onHover(null)}
    >
      <div className="impact-row-stakeholder">
        <span>{categoryLabels[item.category]}</span>
        <strong>{item.stakeholder}</strong>
        <small>{item.role}</small>
      </div>
      <div className="impact-row-chain">
        <ChainCell
          label={copy.insightLabel}
          tone="insight"
          text={item.insight}
        />
        <ChainCell
          label="Requirement"
          tone="requirement"
          text={item.requirement}
        />
        <ChainCell
          label={copy.changeLabel}
          tone="change"
          text={item.projectChange}
        />
        <div className="impact-chain-cell impact-chain-cell-evidence">
          <span>Evidence</span>
          <EvidenceLinks evidence={item.evidence} compact />
        </div>
      </div>
      <span className="impact-flow-line" aria-hidden="true">
        <i />
      </span>
    </article>
  );
}

function ChainCell({
  label,
  tone,
  text,
}: {
  label: string;
  tone: "insight" | "requirement" | "change";
  text: string;
}) {
  return (
    <div className={`impact-chain-cell impact-chain-cell-${tone}`}>
      <span>{label}</span>
      <p>{text}</p>
    </div>
  );
}

function ImpactDrawer({
  item,
  copy,
}: {
  item: StakeholderImpactItem;
  copy: (typeof variantCopy)[StakeholderImpactMapVariant];
}) {
  return (
    <aside className="impact-drawer" aria-live="polite">
      <div className="impact-panel-title">
        <span>{copy.drawerTitle}</span>
        <strong>{categoryLabels[item.category]}</strong>
      </div>
      <div className="impact-drawer-identity">
        <span
          className={`impact-drawer-avatar impact-category-${item.category}`}
        >
          {categoryShortLabels[item.category]}
        </span>
        <div>
          <h3>{item.stakeholder}</h3>
          <p>{item.role}</p>
        </div>
      </div>
      <dl className="impact-drawer-record">
        <ImpactDrawerField label={copy.insightLabel} text={item.insight} />
        <ImpactDrawerField label="Requirement" text={item.requirement} />
        <ImpactDrawerField label={copy.changeLabel} text={item.projectChange} />
        <div>
          <dt>Evidence</dt>
          <dd>
            <EvidenceLinks evidence={item.evidence} />
          </dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            <span className={`impact-status-chip impact-status-${item.status}`}>
              {statusLabels[item.status]}
            </span>
          </dd>
        </div>
      </dl>
    </aside>
  );
}

function ImpactDrawerField({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{text}</dd>
    </div>
  );
}

function MobileImpactCard({
  item,
  copy,
  isActive,
  onSelect,
}: {
  item: StakeholderImpactItem;
  copy: (typeof variantCopy)[StakeholderImpactMapVariant];
  isActive: boolean;
  onSelect: (item: StakeholderImpactItem) => void;
}) {
  return (
    <article
      className={`impact-mobile-card impact-category-${item.category} ${
        isActive ? "is-active" : ""
      }`.trim()}
    >
      <button type="button" onClick={() => onSelect(item)}>
        <span>{categoryLabels[item.category]}</span>
        <strong>{item.stakeholder}</strong>
        <small>{item.role}</small>
      </button>
      <ol className="impact-mobile-chain">
        <MobileStep index="1" label={copy.insightLabel} text={item.insight} />
        <MobileStep index="2" label="Requirement" text={item.requirement} />
        <MobileStep
          index="3"
          label={copy.changeLabel}
          text={item.projectChange}
        />
        <li className="impact-mobile-step impact-mobile-evidence">
          <span>4</span>
          <div>
            <strong>Evidence</strong>
            <EvidenceLinks evidence={item.evidence} />
          </div>
        </li>
      </ol>
    </article>
  );
}

function MobileStep({
  index,
  label,
  text,
}: {
  index: string;
  label: string;
  text: string;
}) {
  return (
    <li className="impact-mobile-step">
      <span>{index}</span>
      <div>
        <strong>{label}</strong>
        <p>{text}</p>
      </div>
    </li>
  );
}

function EvidenceLinks({
  evidence,
  compact = false,
}: {
  evidence: StakeholderEvidence[];
  compact?: boolean;
}) {
  return (
    <div className={`impact-evidence-list ${compact ? "is-compact" : ""}`}>
      {evidence.map((entry) => (
        <EvidenceLink key={`${entry.type}-${entry.label}`} evidence={entry} />
      ))}
    </div>
  );
}

function EvidenceLink({ evidence }: { evidence: StakeholderEvidence }) {
  const chipClass = `impact-evidence-chip impact-evidence-${evidence.type} ${
    evidence.href ? "is-linked" : "is-reserved"
  }`.trim();

  const stopRowSelection = (event: MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
  };

  if (!evidence.href) {
    return (
      <span
        className={chipClass}
        title={evidence.reason || "Evidence reserved"}
      >
        {evidence.label}
      </span>
    );
  }

  if (evidence.href.startsWith("/")) {
    return (
      <Link className={chipClass} to={evidence.href} onClick={stopRowSelection}>
        {evidence.label}
      </Link>
    );
  }

  return (
    <a
      className={chipClass}
      href={evidence.href}
      target="_blank"
      rel="noreferrer"
      onClick={stopRowSelection}
    >
      {evidence.label}
    </a>
  );
}

function getCategoryFromParam(
  value: string | null,
): StakeholderCategory | null {
  if (!value) {
    return null;
  }

  return filterOrder.includes(value as FilterCategory) && value !== "all"
    ? (value as StakeholderCategory)
    : null;
}

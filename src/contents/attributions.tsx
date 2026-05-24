import { useEffect, useMemo, useState } from "react";
import attributionData from "./attributions.json";

interface AttributionCategory {
  id: string;
  label: string;
}

interface AttributionDomain {
  id: string;
  categoryId: string;
  title: string;
  summary: string;
}

type AttributionStatus = "draft" | "external" | "pending" | "ready";

interface AttributionEntry {
  id: string;
  name: string;
  role: string;
  domainId: string;
  status: AttributionStatus;
  attributionAreas: string[];
  contribution: string;
  evidenceLabel: string;
  evidenceLink: string;
  affiliation: string;
  startDate: string;
  endDate: string;
  notes: string;
}

interface AttributionData {
  categories: AttributionCategory[];
  domains: AttributionDomain[];
  entries: AttributionEntry[];
}

const ledgerData = attributionData as AttributionData;

const statusLabels: Record<AttributionStatus, string> = {
  draft: "Draft",
  external: "External",
  pending: "Pending",
  ready: "Ready",
};

export function Attributions() {
  const teamID = import.meta.env.VITE_TEAM_ID;
  const [activeCategory, setActiveCategory] = useState("all");
  const [officialFormRequested, setOfficialFormRequested] = useState(false);
  const [officialFormLoaded, setOfficialFormLoaded] = useState(false);

  const domainEntryCounts = useMemo(() => {
    const counts = new Map<string, number>();

    ledgerData.entries.forEach((entry) => {
      counts.set(entry.domainId, (counts.get(entry.domainId) ?? 0) + 1);
    });

    return counts;
  }, []);

  const visibleDomains = useMemo(() => {
    return ledgerData.domains.filter(
      (domain) =>
        (activeCategory === "all" || domain.categoryId === activeCategory) &&
        (domainEntryCounts.get(domain.id) ?? 0) > 0,
    );
  }, [activeCategory, domainEntryCounts]);

  const totalPending = ledgerData.entries.filter(
    (entry) => entry.status === "pending",
  ).length;
  const totalEntries = ledgerData.entries.length;
  const totalDomains = ledgerData.domains.length;
  const activeDomainCount = ledgerData.domains.filter(
    (domain) => (domainEntryCounts.get(domain.id) ?? 0) > 0,
  ).length;
  const totalEvidenceLinks = ledgerData.entries.filter(
    (entry) => entry.evidenceLink,
  ).length;

  useEffect(() => {
    function listenToIframeHeight(event: MessageEvent) {
      if (event.origin !== "https://teams.igem.org") {
        return;
      }

      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "igem-attribution-form") {
          const element = document.getElementById("igem-attribution-form");
          if (element) {
            element.style.height = `${payload.data + 100}px`;
          }
        }
      } catch {
        // Ignore unrelated postMessage payloads from the browser context.
      }
    }

    window.addEventListener("message", listenToIframeHeight);
    return () => window.removeEventListener("message", listenToIframeHeight);
  }, []);

  return (
    <main className="attributions-page">
      <section className="attribution-hero-shell">
        <div className="container attribution-hero">
          <div className="attribution-hero-copy">
            <span className="attribution-eyebrow">Contribution ledger</span>
            <h1>Attributions</h1>
            <p>
              A transparent, filterable record of imported HP, design, dry-lab,
              and external-resource contributions for the steroid platform wiki.
            </p>
            <div className="attribution-hero-proof" aria-label="Ledger summary">
              <HeroMetric
                label="Active domains"
                value={String(activeDomainCount)}
              />
              <HeroMetric label="Rows" value={String(totalEntries)} />
              <HeroMetric
                label="Evidence links"
                value={String(totalEvidenceLinks)}
              />
            </div>
            <div
              className="attribution-hero-actions"
              aria-label="Attribution page shortcuts"
            >
              <a
                href="#ledger"
                className="attribution-action attribution-action-primary"
              >
                Review ledger
              </a>
              <a
                href="#official-form"
                className="attribution-action attribution-action-secondary"
              >
                Official form
              </a>
            </div>
          </div>
          <div
            className="attribution-hero-rail"
            aria-label="Attribution workflow overview"
          >
            <HeroWorkflowStep label="Source" value="JSON schema" />
            <HeroWorkflowStep label="Ledger" value={`${totalEntries} rows`} />
            <HeroWorkflowStep
              label="Evidence"
              value={`${totalPending} pending`}
            />
            <HeroWorkflowStep label="Submit" value="iGEM form" />
          </div>
          <aside className="ledger-snapshot" aria-label="Ledger snapshot">
            <div className="ledger-snapshot-header">
              <span>Schema preview</span>
              <strong>{activeDomainCount} active domains</strong>
              <small>
                {totalDomains} schema domains are mapped; empty domains stay
                hidden until source rows are ready.
              </small>
            </div>
            <div className="ledger-snapshot-lane" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <SteroidMotif />
            <div className="ledger-snapshot-grid">
              <SnapshotItem label="Data source" value="JSON ready" />
              <SnapshotItem
                label="Open entries"
                value={`${totalPending} pending`}
              />
              <SnapshotItem label="Evidence" value="Source archived" />
              <SnapshotItem label="Official form" value="Embedded below" />
            </div>
          </aside>
        </div>
      </section>

      <section id="ledger" className="container attribution-ledger-shell">
        <div className="attribution-section-heading">
          <span>Notion-style view</span>
          <h2>Contribution database</h2>
          <p>
            This preview imports the May 10 HP sheets, May 6 design table, April
            28 logo/IP document, and Dry_collection interpretation notes into a
            judge-readable ledger. Source files remain archived locally for
            audit.
          </p>
        </div>

        <AttributionLedger
          activeCategory={activeCategory}
          categories={ledgerData.categories}
          domains={visibleDomains}
          entries={ledgerData.entries}
          onCategoryChange={setActiveCategory}
        />
      </section>

      <section id="official-form" className="container attribution-form-shell">
        <div className="attribution-section-heading attribution-section-heading-compact">
          <span>iGEM requirement</span>
          <h2>Official iGEM Attribution Form</h2>
          <p>
            The ledger above is designed for readability. The embedded form
            below remains the official attribution record required by iGEM.
          </p>
        </div>

        <div
          className={`attribution-form-loader ${
            officialFormLoaded || !officialFormRequested ? "is-loaded" : ""
          }`.trim()}
          aria-hidden={officialFormLoaded || !officialFormRequested}
        >
          <div className="attribution-loader-ring" />
          <div>
            <strong>Loading official attribution form</strong>
            <span>Fetching the source form from the iGEM team server.</span>
          </div>
        </div>

        <div className="attributions-frame">
          {officialFormRequested ? (
            <iframe
              id="igem-attribution-form"
              className={officialFormLoaded ? "is-loaded" : ""}
              loading="lazy"
              referrerPolicy="no-referrer"
              style={{ width: "100%" }}
              src={`https://teams.igem.org/wiki/${teamID}/attributions`}
              title="iGEM project attributions form"
              onLoad={() => setOfficialFormLoaded(true)}
            />
          ) : (
            <div className="attribution-form-placeholder">
              <SteroidMotif />
              <div>
                <span>Official source</span>
                <h3>
                  Load the iGEM attribution form when you need the raw record.
                </h3>
                <p>
                  The official form is hosted on the iGEM team server, so it may
                  load slowly or require the final team submission to exist.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setOfficialFormLoaded(false);
                    setOfficialFormRequested(true);
                  }}
                >
                  Load official form
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <strong>{value}</strong>
      {label}
    </span>
  );
}

function HeroWorkflowStep({ label, value }: { label: string; value: string }) {
  return (
    <span className="attribution-hero-step">
      <small>{label}</small>
      <strong>{value}</strong>
    </span>
  );
}

function AttributionLedger({
  activeCategory,
  categories,
  domains,
  entries,
  onCategoryChange,
}: {
  activeCategory: string;
  categories: AttributionCategory[];
  domains: AttributionDomain[];
  entries: AttributionEntry[];
  onCategoryChange: (categoryId: string) => void;
}) {
  return (
    <div className="attribution-ledger">
      <div
        className="attribution-filter-bar"
        aria-label="Filter attribution entries"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={activeCategory === category.id ? "is-active" : ""}
            aria-pressed={activeCategory === category.id}
            onClick={() => onCategoryChange(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      {domains.length === 0 ? (
        <div className="attribution-empty-state">
          <strong>No imported rows in this category yet.</strong>
          <span>
            Source files are still archived locally, and this view will fill in
            once that category has judge-ready rows.
          </span>
        </div>
      ) : (
        <div className="attribution-toggle-stack">
          {domains.map((domain) => {
            const domainEntries = entries.filter(
              (entry) => entry.domainId === domain.id,
            );

            return (
              <details className="attribution-toggle" key={domain.id} open>
                <summary>
                  <span
                    className="attribution-toggle-icon"
                    aria-hidden="true"
                  />
                  <span>
                    <strong>{domain.title}</strong>
                    <small>{domain.summary}</small>
                  </span>
                  <em>{domainEntries.length} rows</em>
                </summary>
                <div className="attribution-toggle-panel">
                  <div>
                    <div className="attribution-row attribution-row-header">
                      <span>Name</span>
                      <span>Role</span>
                      <span>Status</span>
                      <span>Contribution</span>
                      <span>Evidence</span>
                    </div>
                    {domainEntries.map((entry) => (
                      <AttributionRow entry={entry} key={entry.id} />
                    ))}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AttributionRow({ entry }: { entry: AttributionEntry }) {
  const hasEvidence = Boolean(entry.evidenceLink);

  return (
    <article className="attribution-row">
      <div className="attribution-name-cell">
        <strong>{entry.name}</strong>
        <span>{entry.affiliation}</span>
      </div>
      <div className="attribution-role-cell">
        <strong>{entry.role}</strong>
        <span>
          {entry.startDate || "Start TBD"} - {entry.endDate || "End TBD"}
        </span>
      </div>
      <div>
        <span
          className={`attribution-status attribution-status-${entry.status}`}
        >
          {statusLabels[entry.status]}
        </span>
      </div>
      <div className="attribution-contribution-cell">
        <p>{entry.contribution}</p>
        <div className="attribution-area-list">
          {entry.attributionAreas.map((area) => (
            <span key={`${entry.id}-${area}`}>{area}</span>
          ))}
        </div>
        {entry.notes ? <small>{entry.notes}</small> : null}
      </div>
      <div className="attribution-evidence-cell">
        {hasEvidence ? (
          <a href={entry.evidenceLink}>{entry.evidenceLabel}</a>
        ) : (
          <span
            className="attribution-evidence-disabled"
            title="Documentation pending"
            aria-label={`${entry.evidenceLabel}: documentation pending`}
          >
            {entry.evidenceLabel}
          </span>
        )}
      </div>
    </article>
  );
}

function SnapshotItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="ledger-snapshot-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SteroidMotif() {
  return (
    <div className="steroid-motif" aria-hidden="true">
      <span className="ring ring-a" />
      <span className="ring ring-b" />
      <span className="ring ring-c" />
      <span className="ring ring-d" />
    </div>
  );
}

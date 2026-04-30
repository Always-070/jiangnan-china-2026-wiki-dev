import { ReferenceBlock } from "../components/PageScaffold";
import { EvidenceSpiral, NextStopBanner } from "../components/AtlasShowpieces";

const resultsReferences = [
  {
    label: "Chen et al. 2025 review on steroid hormone biosynthesis",
    href: "https://doi.org/10.1016/j.tibtech.2025.12.012",
    note: "Sets the proof agenda around precursor supply, catalytic conversion, transport, and intelligent platform integration.",
  },
  {
    label: "iGEM medal criteria",
    href: "https://competition.igem.org/judging/medals",
    note: "Use this to keep the Results page aligned with what judges expect to see documented.",
  },
  {
    label: "Patras_Medicine 2022",
    href: "https://2022.igem.wiki/patras-medicine/",
    note: "A useful benchmark for converting technical progress into a readable scientific narrative.",
  },
];

export function Results() {
  return (
    <>
      <section id="milestones" className="story-section story-section-first results-evidence-page">
        <div className="section-heading results-helix-intro">
          <span>Results Evidence Chain</span>
          <h2>Scroll the DNA helix to move through four proof levels.</h2>
          <p>
            Results is now framed as a central holographic evidence spine. Each scroll step descends
            through one tier of the helix and opens reserved Assay, Figure, and Report slots without
            inventing experimental outcomes before wet-lab data is ready.
          </p>
        </div>

        <EvidenceSpiral />
      </section>

      <section id="references" className="story-section story-section-last results-reference-dock">
        <ReferenceBlock title="References and result framing sources" items={resultsReferences} />
        <NextStopBanner
          eyebrow="Next Stop"
          title="Human Practices tests whether the platform should exist in the real world."
          text="Connect scientific progress to stakeholders, manufacturing reality, sustainability, access, and biosafety decisions."
          href="/human-practices"
          actionLabel="Continue to Human Practices"
        />
      </section>
    </>
  );
}

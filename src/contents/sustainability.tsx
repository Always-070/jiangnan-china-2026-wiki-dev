import { Inspirations, InspirationLink } from "../components/Inspirations";
import {
  EvidenceGrid,
  FlowDiagram,
  MetricStrip,
  ReferenceBlock,
} from "../components/PageScaffold";
import { StakeholderImpactMap } from "../components/StakeholderImpactMap";

const sustainabilityReferences = [
  {
    label: "TJI-Seoul Human Practices",
    href: "https://2025.igem.wiki/tji-seoul/human-practices",
    note: "Reference for translating survey findings into interpretation and application.",
  },
  {
    label: "Munich Human Practices",
    href: "https://2025.igem.wiki/munich/human-practices/",
    note: "Reference for stakeholder mapping, expert summaries, and integration records.",
  },
  {
    label: "Stanford Human Practices",
    href: "https://2025.igem.wiki/stanford/human-practices",
    note: "Reference for showing how feedback shaped project direction.",
  },
];

const readinessCards = [
  {
    status: "Near-term evidence",
    title: "Route burden comparison",
    description:
      "Compare feedstock dependence, waste burden, scalability, and evidence maturity without pretending the final LCA is already complete.",
    metric: "LCA slot reserved",
  },
  {
    status: "Scale-up pressure",
    title: "Implementation readiness",
    description:
      "Separate what the current proof-of-concept can support from future fermentation, downstream processing, and TEA assumptions.",
    metric: "TEA slot reserved",
  },
  {
    status: "Responsible deployment",
    title: "Safety-linked sustainability",
    description:
      "Treat containment, handling, and honest risk boundaries as part of the sustainability claim rather than a separate compliance note.",
    metric: "Safety evidence linked",
  },
];

export function Sustainability() {
  const links: InspirationLink[] = [
    { year: 2024, teamName: "Hangzhou-BioX", pageName: "sustainable" },
    { year: 2024, teamName: "UZurich", pageName: "sustainable" },
    { year: 2024, teamName: "Ulink-SZ", pageName: "sustainable" },
    { year: 2024, teamName: "GEC-Beijing", pageName: "sustainable" },
    { year: 2023, teamName: "Thessaloniki", pageName: "sustainable" },
  ];

  return (
    <>
      <section id="route-burden" className="story-section story-section-first">
        <div className="section-heading">
          <h2>Why route burden matters</h2>
          <p>
            A sustainable steroid platform cannot be judged only by the beauty of
            the pathway. It has to explain which burdens the new route reduces,
            which assumptions remain unproven, and which evidence slots still
            need quantitative support.
          </p>
        </div>
        <MetricStrip
          items={[
            {
              label: "Feedstock",
              value: "Route dependence",
              note: "Track whether the platform reduces reliance on extracted or semisynthetic steroid feedstocks.",
            },
            {
              label: "Waste",
              value: "Conversion burden",
              note: "Keep chemical steps, solvent logic, and product recovery visible as future comparison dimensions.",
            },
            {
              label: "Scale",
              value: "Fermentation readiness",
              note: "Distinguish proof-of-concept biology from future process economics and manufacturability.",
            },
            {
              label: "Evidence",
              value: "Reserved, not invented",
              note: "Use placeholders for LCA, TEA, and outreach records until the team has real material to link.",
            },
          ]}
        />
      </section>

      <section id="sustainability-impact-map" className="story-section">
        <StakeholderImpactMap
          variant="sustainability"
          activeCategory="sustainability"
        />
      </section>

      <section id="implementation-readiness" className="story-section">
        <div className="section-heading">
          <h2>Implementation readiness</h2>
          <p>
            The sustainability story should be honest about time horizon. Some
            design responses can be incorporated now; quantitative LCA and TEA
            evidence should remain marked as reserved until the records exist.
          </p>
        </div>
        <EvidenceGrid items={readinessCards} />
      </section>

      <section id="responsible-deployment" className="story-section">
        <div className="section-shell section-shell-amber">
          <FlowDiagram
            title="Sustainability feedback loop"
            lead="Stakeholder concerns become useful only when they are translated into design requirements and linked back to evidence."
            variant="linear"
            steps={[
              {
                label: "01",
                title: "Hear the burden",
                text: "Identify which environmental, industrial, public, or safety concern changes the route comparison.",
              },
              {
                label: "02",
                title: "Set a requirement",
                text: "Turn the concern into a requirement such as compare feedstocks, separate readiness levels, or explain containment.",
              },
              {
                label: "03",
                title: "Change the design",
                text: "Link the requirement to Description, Engineering, Safety, or HP writing rather than leaving it as a note.",
              },
              {
                label: "04",
                title: "Reserve evidence",
                text: "Attach a real link when available and show Evidence reserved when the record is not finalized.",
              },
            ]}
          />
        </div>
      </section>

      <section
        id="sustainability-references"
        className="story-section story-section-last"
      >
        <ReferenceBlock
          title="References for sustainability integration"
          items={sustainabilityReferences}
        />
        <div className="sustainability-inspiration-strip">
          <Inspirations inspirationLinkList={links} />
        </div>
      </section>
    </>
  );
}

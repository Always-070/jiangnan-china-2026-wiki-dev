export type ProtocolId = "quick" | "full";
export type DimensionId = "EI" | "SN" | "TF" | "JP";
export type Pole = "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";
export type QuestionKind = "classic" | "scenario";
export type PersonalityType = `${"E" | "I"}${"S" | "N"}${"T" | "F"}${"J" | "P"}`;

export interface StrainQuestion {
  id: string;
  protocol: ProtocolId;
  dimension: DimensionId;
  pole: Pole;
  kind: QuestionKind;
  prompt: string;
  glossaryKey?: string;
}

export interface DimensionDefinition {
  id: DimensionId;
  label: string;
  highPole: Pole;
  lowPole: Pole;
}

export interface GlossaryEntry {
  term: string;
  explanation: string;
}

export interface ResultProfile {
  name?: string;
  summary?: string;
  image?: string;
}

export const DIMENSIONS: DimensionDefinition[] = [
  { id: "EI", label: "Energy Direction", highPole: "E", lowPole: "I" },
  { id: "SN", label: "Information Intake", highPole: "S", lowPole: "N" },
  { id: "TF", label: "Decision Style", highPole: "T", lowPole: "F" },
  { id: "JP", label: "Work Rhythm", highPole: "J", lowPole: "P" },
];

export const PROTOCOLS = {
  quick: {
    id: "quick",
    name: "Quick Assay",
    questionCount: 28,
    questionsPerDimension: 7,
    duration: "About 3 minutes",
  },
  full: {
    id: "full",
    name: "Full Protocol",
    questionCount: 64,
    questionsPerDimension: 16,
    duration: "About 8–10 minutes",
  },
} as const;

export const GLOSSARY: Record<string, GlossaryEntry> = {
  biofilm: {
    term: "Biofilm",
    explanation:
      "A structured microbial community whose cells grow close together within a self-produced matrix.",
  },
  "planktonic-growth": {
    term: "Planktonic growth",
    explanation:
      "A growth state in which individual cells remain dispersed and suspended in liquid culture.",
  },
  "metabolite-exchange": {
    term: "Metabolite exchange",
    explanation:
      "The transfer of small molecules or pathway intermediates between nearby cells.",
  },
  "7-dhc": {
    term: "7-DHC",
    explanation:
      "7-dehydrocholesterol, the target sterol in this project and a precursor used to produce vitamin D3.",
  },
  "lipid-droplet": {
    term: "Lipid droplet",
    explanation:
      "An intracellular structure that stores neutral lipids and can accumulate hydrophobic products.",
  },
  raman: {
    term: "Raman spectroscopy",
    explanation:
      "A non-destructive analytical method that reads molecular vibration signals from a sample.",
  },
  "characteristic-peak": {
    term: "Characteristic peak",
    explanation:
      "A Raman signal at a specific position that helps identify a molecular structure or sample component.",
  },
  plasmid: {
    term: "Plasmid",
    explanation:
      "A designed DNA vector used to carry genetic elements into a host cell.",
  },
  "genetic-element": {
    term: "Genetic element",
    explanation:
      "A functional DNA part such as a promoter, coding sequence, terminator, or selection marker.",
  },
  "metabolic-pathway": {
    term: "Metabolic pathway",
    explanation:
      "A linked series of enzyme-catalyzed reactions that converts starting materials into products.",
  },
  "regulatory-network": {
    term: "Regulatory network",
    explanation:
      "The interacting genes, enzymes, and signals that coordinate pathway activity and cell physiology.",
  },
  "cellular-homeostasis": {
    term: "Cellular homeostasis",
    explanation:
      "The balanced internal state that allows a cell to maintain growth and productive metabolism.",
  },
  "cellular-stress": {
    term: "Cellular stress",
    explanation:
      "Pressure caused by factors such as product toxicity, nutrient limits, or dense culture conditions.",
  },
  "induced-expression": {
    term: "Induced expression",
    explanation:
      "Turning on a target gene at a chosen time by applying a defined signal or culture condition.",
  },
  protocol: {
    term: "Protocol",
    explanation:
      "A standardized experimental procedure that records materials, steps, parameters, and quality checks.",
  },
};

type Seed = readonly [Pole, QuestionKind, string, string?];

function buildQuestions(
  protocol: ProtocolId,
  dimension: DimensionId,
  seeds: readonly Seed[],
): StrainQuestion[] {
  return seeds.map(([pole, kind, prompt, glossaryKey], index) => ({
    id: `${protocol}-${dimension.toLowerCase()}-${String(index + 1).padStart(2, "0")}`,
    protocol,
    dimension,
    pole,
    kind,
    prompt,
    glossaryKey,
  }));
}

const QUICK: Record<DimensionId, readonly Seed[]> = {
  EI: [
    ["E", "classic", "After a large gathering, I usually feel energized rather than drained."],
    ["I", "classic", "I prefer not to be the center of attention."],
    ["I", "classic", "Spending a whole day alone helps me relax and recover."],
    ["E", "scenario", "My metabolism performs better in a biofilm community than in a planktonic single-cell state.", "biofilm"],
    ["I", "scenario", "Long periods in a dense cell community drain me, and I need a low-density environment to recover."],
    ["E", "scenario", "Exchanging metabolites with nearby cells makes collaborative 7-DHC production smoother than working alone.", "metabolite-exchange"],
    ["I", "scenario", "I obtain my most consistent results when I perform a precise task such as lipid-droplet extraction on my own.", "lipid-droplet"],
  ],
  SN: [
    ["S", "classic", "I focus more on concrete details than on abstract possibilities."],
    ["N", "classic", "I often consider the deeper meaning and future potential behind an idea."],
    ["S", "classic", "Exploring abstract theory interests me less than studying a concrete procedure."],
    ["S", "scenario", "When using Raman spectroscopy, I first verify the exact value of each characteristic peak.", "characteristic-peak"],
    ["N", "scenario", "When I see a 7-DHC molecule, I first imagine the different downstream products it could enable.", "7-dhc"],
    ["S", "scenario", "Before assembling a plasmid, I confirm the exact parameters of every genetic element.", "plasmid"],
    ["N", "scenario", "I am more interested in the new applications that could emerge after a pathway is redesigned.", "metabolic-pathway"],
  ],
  TF: [
    ["T", "classic", "When making a decision, logical soundness matters more to me than other people's feelings."],
    ["F", "classic", "Even when someone is wrong, I hesitate to point it out directly if it could embarrass them."],
    ["F", "classic", "When a friend is struggling, I offer empathy and reassurance before proposing solutions."],
    ["T", "scenario", "When optimizing a 7-DHC pathway, increasing yield takes priority over maintaining cellular homeostasis.", "cellular-homeostasis"],
    ["F", "scenario", "I prefer a culture strategy that causes less cellular stress even if it sacrifices some yield.", "cellular-stress"],
    ["T", "scenario", "When evaluating a plasmid design, pathway logic matters more than operational convenience.", "plasmid"],
    ["F", "scenario", "When designing vitamin D outreach, audience acceptance matters more than the depth of the scientific material."],
  ],
  JP: [
    ["J", "classic", "I like to plan my schedule in advance and follow it."],
    ["P", "classic", "I prefer a flexible, spontaneous rhythm and dislike being constrained by a timetable."],
    ["J", "classic", "I prepare every important detail before I begin a task."],
    ["P", "classic", "Fixing every detail too early makes me feel constrained."],
    ["J", "scenario", "Before constructing a plasmid, I prepare a complete workflow and backup plan.", "protocol"],
    ["P", "scenario", "When designing a metabolic pathway, I keep several options open and adjust them as results arrive.", "metabolic-pathway"],
    ["J", "scenario", "Before Raman measurements, I arrange and label every sample in sequence.", "raman"],
  ],
};

const FULL: Record<DimensionId, readonly Seed[]> = {
  EI: [
    ["E", "classic", "After a large gathering, I usually feel energized rather than drained."],
    ["I", "classic", "Spending a whole day alone does not bore me; it helps me relax."],
    ["E", "classic", "I tend to clarify my thoughts by discussing them with others before reflecting alone."],
    ["I", "classic", "I prefer not to be the center of attention."],
    ["E", "classic", "Meeting new people is usually easy and enjoyable for me."],
    ["I", "classic", "I prefer a deep conversation with one or two friends to a lively group activity."],
    ["E", "classic", "I often speak up first in group chats or discussions."],
    ["I", "classic", "Crowded settings often make me want to withdraw."],
    ["E", "scenario", "My metabolism performs better in a biofilm community than in a planktonic single-cell state.", "biofilm"],
    ["I", "scenario", "Long periods in a high-density community reduce my performance, and I need a low-density environment to recover."],
    ["E", "scenario", "Metabolite exchange with nearby cells makes collaborative 7-DHC production more efficient than completing the pathway alone.", "metabolite-exchange"],
    ["I", "scenario", "I obtain my most consistent results when I perform precise tasks such as lipid-droplet extraction independently.", "lipid-droplet"],
    ["E", "scenario", "During experiments, I prefer a collaborative workflow with clear division of labor."],
    ["I", "scenario", "Handling many samples and tasks at once reduces my accuracy; I perform better with one deep-focus task."],
    ["E", "scenario", "My overall production improves as cell density and metabolic interaction increase."],
    ["I", "scenario", "Frequent metabolic activity around me disrupts my balance, while low-density conditions keep me stable."],
  ],
  SN: [
    ["S", "classic", "I focus more on concrete details and present facts than on abstract possibilities."],
    ["N", "classic", "I often consider the deeper meaning and future potential behind an idea."],
    ["S", "classic", "When learning something new, I first master the practical procedure."],
    ["N", "classic", "I find abstract concepts more interesting than concrete procedures."],
    ["S", "classic", "I trust verified experience and evidence more than intuitive inspiration."],
    ["N", "classic", "I often generate unusual ideas that other people have not considered."],
    ["S", "classic", "When describing an event, I explain each detail in sequence."],
    ["N", "classic", "Too much attention to detail can make me lose sight of the overall direction."],
    ["S", "scenario", "When collecting Raman spectra, I first verify the exact value of each characteristic peak.", "characteristic-peak"],
    ["N", "scenario", "When I see a 7-DHC molecule, I first imagine the different downstream products it could enable.", "7-dhc"],
    ["S", "scenario", "Before constructing a plasmid, I check the parameters and reaction conditions of every genetic element.", "genetic-element"],
    ["N", "scenario", "When analyzing a metabolic pathway, I focus more on the logic of the regulatory network than on one enzyme parameter.", "regulatory-network"],
    ["S", "scenario", "When observing lipid-droplet phenotypes, I emphasize quantitative data such as size distribution and number.", "lipid-droplet"],
    ["N", "scenario", "When studying a key enzyme, I focus on its role in the whole metabolic network."],
    ["S", "scenario", "When optimizing culture conditions, my central goal is a measurable increase in 7-DHC yield and purity.", "7-dhc"],
    ["N", "scenario", "I am more interested in the new applications that could emerge after a pathway is redesigned.", "metabolic-pathway"],
  ],
  TF: [
    ["T", "classic", "When making a decision, logical soundness matters more to me than other people's feelings."],
    ["F", "classic", "When a friend is struggling, I offer empathy before working with them on a solution."],
    ["T", "classic", "Constructive criticism should identify the problem directly rather than becoming overly indirect."],
    ["F", "classic", "Even when someone is wrong, I hesitate to point it out directly if it could embarrass them."],
    ["T", "classic", "When solving a problem, I prioritize efficiency and correctness over interpersonal harmony."],
    ["F", "classic", "I pay close attention to whether my words or actions could hurt another person's feelings."],
    ["T", "classic", "Separating the issue from the person is a basic principle in my work."],
    ["F", "classic", "Compromising occasionally is worthwhile when it preserves harmony."],
    ["T", "scenario", "When optimizing a 7-DHC pathway, increasing yield takes priority over maintaining cellular homeostasis.", "cellular-homeostasis"],
    ["F", "scenario", "I prefer a culture strategy that causes less cellular stress even if it sacrifices some yield.", "cellular-stress"],
    ["T", "scenario", "When evaluating a plasmid design, internal pathway logic matters more than operational convenience.", "plasmid"],
    ["F", "scenario", "When designing vitamin D outreach, audience acceptance matters more than the depth of the scientific material."],
    ["T", "scenario", "When choosing a detection method, data accuracy and reliability matter more than ease of operation."],
    ["F", "scenario", "During lipid-droplet extraction, I prefer a method that better preserves cellular structure.", "lipid-droplet"],
    ["T", "scenario", "When assessing an experimental strategy, final product yield is the central criterion."],
    ["F", "scenario", "When designing outreach, communicating practical health value matters more than showcasing the newest concept."],
  ],
  JP: [
    ["J", "classic", "I like to plan my schedule in advance and follow it closely."],
    ["P", "classic", "I prefer a flexible, spontaneous rhythm and dislike being constrained by a timetable."],
    ["J", "classic", "I prepare every important detail before I begin a task."],
    ["P", "classic", "Fixing every detail too early makes me feel constrained."],
    ["J", "classic", "My work and living spaces are usually well organized."],
    ["P", "classic", "Keeping several possibilities open matters more to me than reaching an early conclusion."],
    ["J", "classic", "I prefer to finish tasks early rather than leave them until the last moment."],
    ["P", "classic", "Following a strict plan can limit my creativity."],
    ["J", "scenario", "Before constructing a plasmid, I prepare a complete workflow and backup plan.", "protocol"],
    ["P", "scenario", "When designing a metabolic pathway, I keep several candidate plans and revise them as experimental results arrive.", "metabolic-pathway"],
    ["J", "scenario", "For an induced-expression experiment, I set each time point precisely and follow it closely.", "induced-expression"],
    ["P", "scenario", "During induction, I adjust sampling time according to the cells' actual growth state.", "induced-expression"],
    ["J", "scenario", "Before Raman measurements, I number and arrange every sample in sequence.", "raman"],
    ["P", "scenario", "During lipid-droplet extraction, I adjust centrifugation parameters in response to microscopy observations.", "lipid-droplet"],
    ["J", "scenario", "I prepare all reagents and organize the bench before an experiment begins."],
    ["P", "scenario", "I often adjust a protocol and try a new condition after seeing an early result.", "protocol"],
  ],
};

export const QUESTIONS_BY_PROTOCOL: Record<ProtocolId, StrainQuestion[]> = {
  quick: DIMENSIONS.flatMap((dimension) =>
    buildQuestions("quick", dimension.id, QUICK[dimension.id]),
  ),
  full: DIMENSIONS.flatMap((dimension) =>
    buildQuestions("full", dimension.id, FULL[dimension.id]),
  ),
};

export const RESULT_PROFILES: Partial<
  Record<PersonalityType, ResultProfile>
> = {};

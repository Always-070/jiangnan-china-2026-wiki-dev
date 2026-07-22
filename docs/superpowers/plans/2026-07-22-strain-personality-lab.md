# Strain Personality Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an English, browser-only 28/64-question strain personality experience at `/strain-personality-lab`, with accessible free navigation, seven-point scoring, local draft recovery, and a four-letter result.

**Architecture:** Static question and glossary data live outside React. Pure scoring, validation, and session parsing are tested with Node's built-in test runner before the UI consumes them. A route-scoped React component owns the landing, quiz, and result screens; a route-scoped stylesheet supplies the approved GitHub-light visual system without changing other Wiki pages.

**Tech Stack:** React 18, TypeScript, React Router 6, Vite 5, route-scoped CSS, Node test runner, browser `localStorage`.

---

## File map

- Create `src/contents/strain-personality-data.ts`: protocols, English question banks, glossary, dimension metadata, and optional result profiles.
- Create `src/contents/strain-personality-data.test.ts`: data counts, IDs, valid poles, and required English strings.
- Create `src/contents/strain-personality-scoring.ts`: normalization, scoring, completion checks, storage keys, and safe session parsing.
- Create `src/contents/strain-personality-scoring.test.ts`: direct/reverse scoring, midpoint fallback, protocol comparability, incomplete-answer rejection, and stored-session validation.
- Create `src/contents/strain-personality.tsx`: landing, one-question workspace, dimension/question navigation, result, reset, and local-save feedback.
- Create `src/contents/strain-personality.css`: English GitHub-light page, approved 2×2 dimension cards, fixed square question numbers, seven-point control, result, responsive states, focus, and reduced motion.
- Modify `src/contents/index.tsx`: export the new page component.
- Modify `src/pages.ts`: register `/strain-personality-lab`.
- Modify `src/components/Navbar.tsx`: add `Strain Lab` near Education.
- Modify `src/containers/App/App.tsx`: suppress the standard article header and container for the immersive route.

## Source and interaction constraints

- Read question intent from these exact source documents before editing English prompts:
  - `C:/Users/LX/Documents/xwechat_files/wxid_goer98x7syro22_1c2e/msg/attach/febe4b74c97ac821fd459c32f4f7685d/2026-07/Rec/9a1954036567ad0b/F/0/菌株人格测试·_精简版.docx`
  - `C:/Users/LX/Documents/xwechat_files/wxid_goer98x7syro22_1c2e/msg/attach/febe4b74c97ac821fd459c32f4f7685d/2026-07/Rec/9a1954036567ad0b/F/1/菌株人格测试·_完整版 (1).docx`
  - `C:/Users/LX/Documents/xwechat_files/wxid_goer98x7syro22_1c2e/msg/attach/febe4b74c97ac821fd459c32f4f7685d/2026-07/Rec/9a1954036567ad0b/F/2/菌株人格测试_·_HP项目企划书.docx`
  - `C:/Users/LX/Documents/xwechat_files/wxid_goer98x7syro22_1c2e/msg/file/2026-07/精细7档滑块量表（题号#开头+腾讯问卷适配格式）(1).docx`
- Preserve the meaning and pole direction of the four supplied Word documents; translate visible content into English.
- Normalize all `I`, `N`, `F`, and `P` questions with `8 - answer`; do not use isolated reverse labels from the drafts.
- Resolve an exact dimension mean of `4.00` to `E`, `S`, `T`, or `J`.
- Do not send answers through `fetch`, forms, analytics, or another network mechanism.
- Follow the WAI-ARIA button-group approach for dimension and question navigation. Use native buttons with `aria-pressed`/`aria-current`; do not claim a `tablist` pattern without implementing its arrow-key contract.
- Use fixed 44px square question targets that do not stretch across unused space.

---

### Task 1: Build and prove the scoring contract

**Files:**
- Create: `src/contents/strain-personality-scoring.test.ts`
- Create: `src/contents/strain-personality-scoring.ts`
- Create: `src/contents/strain-personality-data.ts`

- [ ] **Step 1: Write the failing scoring and session tests**

Create `src/contents/strain-personality-scoring.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import type { StrainQuestion } from "./strain-personality-data.ts";
import {
  isQuizComplete,
  normalizeAnswer,
  parseStoredSession,
  scoreQuiz,
  storageKeyFor,
} from "./strain-personality-scoring.ts";

const questions: StrainQuestion[] = [
  {
    id: "test-ei-01",
    protocol: "quick",
    dimension: "EI",
    pole: "E",
    kind: "classic",
    prompt: "Direct E item",
  },
  {
    id: "test-ei-02",
    protocol: "quick",
    dimension: "EI",
    pole: "I",
    kind: "classic",
    prompt: "Reverse I item",
  },
  {
    id: "test-sn-01",
    protocol: "quick",
    dimension: "SN",
    pole: "S",
    kind: "classic",
    prompt: "Direct S item",
  },
  {
    id: "test-tf-01",
    protocol: "quick",
    dimension: "TF",
    pole: "T",
    kind: "classic",
    prompt: "Direct T item",
  },
  {
    id: "test-jp-01",
    protocol: "quick",
    dimension: "JP",
    pole: "J",
    kind: "classic",
    prompt: "Direct J item",
  },
];

test("normalizes high-pole answers directly and low-pole answers in reverse", () => {
  assert.equal(normalizeAnswer(6, "E", "EI"), 6);
  assert.equal(normalizeAnswer(6, "I", "EI"), 2);
  assert.equal(normalizeAnswer(1, "P", "JP"), 7);
});

test("uses the configured high pole when a dimension mean is exactly four", () => {
  const midpointQuestions = questions.filter((question) => question.dimension === "EI");
  const result = scoreQuiz(midpointQuestions, {
    "test-ei-01": 4,
    "test-ei-02": 4,
  });

  assert.equal(result.type, "E");
  assert.equal(result.dimensions.EI?.mean, 4);
  assert.equal(result.dimensions.EI?.letter, "E");
});

test("normalizes quick and full protocols to the same dimension mean", () => {
  const quick: StrainQuestion[] = Array.from({ length: 7 }, (_, index) => ({
    id: `quick-ei-${index + 1}`,
    protocol: "quick",
    dimension: "EI",
    pole: index % 2 === 0 ? "E" : "I",
    kind: "classic",
    prompt: `Quick ${index + 1}`,
  }));
  const full: StrainQuestion[] = Array.from({ length: 16 }, (_, index) => ({
    id: `full-ei-${index + 1}`,
    protocol: "full",
    dimension: "EI",
    pole: index % 2 === 0 ? "E" : "I",
    kind: "classic",
    prompt: `Full ${index + 1}`,
  }));
  const quickAnswers = Object.fromEntries(
    quick.map((question) => [question.id, question.pole === "E" ? 6 : 2]),
  );
  const fullAnswers = Object.fromEntries(
    full.map((question) => [question.id, question.pole === "E" ? 6 : 2]),
  );

  assert.equal(scoreQuiz(quick, quickAnswers).dimensions.EI?.mean, 6);
  assert.equal(scoreQuiz(full, fullAnswers).dimensions.EI?.mean, 6);
});

test("rejects result generation when an answer is missing", () => {
  assert.throws(
    () => scoreQuiz(questions, { "test-ei-01": 5 }),
    /Complete every question before scoring/,
  );
});

test("reports completion only when every question has a valid answer", () => {
  const all = Object.fromEntries(questions.map((question) => [question.id, 4]));
  assert.equal(isQuizComplete(questions, all), true);
  assert.equal(isQuizComplete(questions, { ...all, "test-jp-01": 0 }), false);
});

test("uses protocol-specific versioned storage keys", () => {
  assert.equal(storageKeyFor("quick"), "strain-personality-lab:quick:v1");
  assert.equal(storageKeyFor("full"), "strain-personality-lab:full:v1");
});

test("accepts valid stored sessions and rejects corrupt or foreign answers", () => {
  const raw = JSON.stringify({
    protocol: "quick",
    currentQuestionId: "test-ei-01",
    answers: { "test-ei-01": 5, "test-ei-02": 3 },
  });
  assert.deepEqual(parseStoredSession(raw, "quick", questions), {
    protocol: "quick",
    currentQuestionId: "test-ei-01",
    answers: { "test-ei-01": 5, "test-ei-02": 3 },
  });
  assert.equal(parseStoredSession("not json", "quick", questions), null);
  assert.equal(
    parseStoredSession(
      JSON.stringify({
        protocol: "quick",
        currentQuestionId: "test-ei-01",
        answers: { unknown: 7 },
      }),
      "quick",
      questions,
    ),
    null,
  );
});
```

- [ ] **Step 2: Run the scoring test and verify the red state**

Run:

```bash
node --experimental-strip-types --test src/contents/strain-personality-scoring.test.ts
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `strain-personality-scoring.ts`.

- [ ] **Step 3: Implement pure scoring and safe session parsing**

Create the initial type contract in `src/contents/strain-personality-data.ts` so the scoring module has a real dependency boundary before the complete content bank is added in Task 2:

```ts
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
```

Create `src/contents/strain-personality-scoring.ts`:

```ts
import type {
  DimensionId,
  PersonalityType,
  Pole,
  ProtocolId,
  StrainQuestion,
} from "./strain-personality-data.ts";

export type QuizAnswers = Record<string, number>;

export interface QuizSession {
  protocol: ProtocolId;
  currentQuestionId: string;
  answers: QuizAnswers;
}

export interface DimensionScore {
  dimension: DimensionId;
  highPole: Pole;
  lowPole: Pole;
  mean: number;
  letter: Pole;
  strength: number;
  highPolePercent: number;
}

export interface QuizResult {
  type: PersonalityType;
  dimensions: Partial<Record<DimensionId, DimensionScore>>;
}

const DIMENSION_POLES: Record<DimensionId, { high: Pole; low: Pole }> = {
  EI: { high: "E", low: "I" },
  SN: { high: "S", low: "N" },
  TF: { high: "T", low: "F" },
  JP: { high: "J", low: "P" },
};

const DIMENSION_ORDER: DimensionId[] = ["EI", "SN", "TF", "JP"];

export function normalizeAnswer(
  answer: number,
  pole: Pole,
  dimension: DimensionId,
) {
  assertAnswer(answer);
  const { high, low } = DIMENSION_POLES[dimension];

  if (pole !== high && pole !== low) {
    throw new Error(`Pole ${pole} does not belong to ${dimension}`);
  }

  return pole === high ? answer : 8 - answer;
}

export function isQuizComplete(
  questions: StrainQuestion[],
  answers: QuizAnswers,
) {
  return questions.every((question) => isAnswer(answers[question.id]));
}

export function scoreQuiz(
  questions: StrainQuestion[],
  answers: QuizAnswers,
): QuizResult {
  if (!isQuizComplete(questions, answers)) {
    throw new Error("Complete every question before scoring");
  }

  const dimensions: Partial<Record<DimensionId, DimensionScore>> = {};

  for (const dimension of DIMENSION_ORDER) {
    const dimensionQuestions = questions.filter(
      (question) => question.dimension === dimension,
    );

    if (!dimensionQuestions.length) {
      continue;
    }

    const sum = dimensionQuestions.reduce(
      (total, question) =>
        total +
        normalizeAnswer(answers[question.id], question.pole, dimension),
      0,
    );
    const mean = sum / dimensionQuestions.length;
    const { high, low } = DIMENSION_POLES[dimension];

    dimensions[dimension] = {
      dimension,
      highPole: high,
      lowPole: low,
      mean,
      letter: mean >= 4 ? high : low,
      strength: Math.round((Math.abs(mean - 4) / 3) * 100),
      highPolePercent: Math.round(((mean - 1) / 6) * 100),
    };
  }

  const type = DIMENSION_ORDER.map(
    (dimension) => dimensions[dimension]?.letter || "",
  ).join("") as PersonalityType;

  return { type, dimensions };
}

export function storageKeyFor(protocol: ProtocolId) {
  return `strain-personality-lab:${protocol}:v1`;
}

export function parseStoredSession(
  raw: string | null,
  protocol: ProtocolId,
  questions: StrainQuestion[],
): QuizSession | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<QuizSession>;
    const validIds = new Set(questions.map((question) => question.id));

    if (
      parsed.protocol !== protocol ||
      typeof parsed.currentQuestionId !== "string" ||
      !validIds.has(parsed.currentQuestionId) ||
      !parsed.answers ||
      typeof parsed.answers !== "object"
    ) {
      return null;
    }

    const entries = Object.entries(parsed.answers);
    const answers: QuizAnswers = {};

    for (const [id, answer] of entries) {
      if (!validIds.has(id) || !isAnswer(answer)) {
        return null;
      }
      answers[id] = answer;
    }

    return {
      protocol,
      currentQuestionId: parsed.currentQuestionId,
      answers,
    };
  } catch {
    return null;
  }
}

function isAnswer(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 7;
}

function assertAnswer(answer: number) {
  if (!isAnswer(answer)) {
    throw new Error(`Answer ${answer} must be an integer from 1 to 7`);
  }
}
```

- [ ] **Step 4: Run the scoring test and verify the green state**

Run:

```bash
node --experimental-strip-types --test src/contents/strain-personality-scoring.test.ts
```

Expected: 7 tests PASS, 0 tests FAIL.

- [ ] **Step 5: Commit the scoring contract**

```bash
git add src/contents/strain-personality-data.ts src/contents/strain-personality-scoring.ts src/contents/strain-personality-scoring.test.ts
git commit -m "feat: add strain personality scoring contract"
```

---

### Task 2: Build and validate the complete English content model

**Files:**
- Create: `src/contents/strain-personality-data.test.ts`
- Modify: `src/contents/strain-personality-data.ts`

- [ ] **Step 1: Write the failing data-contract test**

Create `src/contents/strain-personality-data.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  DIMENSIONS,
  GLOSSARY,
  PROTOCOLS,
  QUESTIONS_BY_PROTOCOL,
} from "./strain-personality-data.ts";

test("quick has seven and full has sixteen questions in every dimension", () => {
  for (const [protocol, expected] of [
    ["quick", 7],
    ["full", 16],
  ] as const) {
    const questions = QUESTIONS_BY_PROTOCOL[protocol];
    assert.equal(questions.length, expected * 4);

    for (const dimension of DIMENSIONS) {
      assert.equal(
        questions.filter((question) => question.dimension === dimension.id)
          .length,
        expected,
      );
    }
  }
});

test("question ids are unique and poles belong to their dimensions", () => {
  for (const protocol of Object.keys(PROTOCOLS) as Array<keyof typeof PROTOCOLS>) {
    const questions = QUESTIONS_BY_PROTOCOL[protocol];
    assert.equal(new Set(questions.map((question) => question.id)).size, questions.length);

    for (const question of questions) {
      const dimension = DIMENSIONS.find((item) => item.id === question.dimension);
      assert.ok(dimension);
      assert.ok([dimension.highPole, dimension.lowPole].includes(question.pole));
      assert.match(question.prompt, /[A-Za-z]/);
      assert.doesNotMatch(question.prompt, /[\u3400-\u9fff]/);
      if (question.glossaryKey) {
        assert.ok(GLOSSARY[question.glossaryKey]);
      }
    }
  }
});

test("protocol metadata matches the supplied documents", () => {
  assert.deepEqual(PROTOCOLS.quick, {
    id: "quick",
    name: "Quick Assay",
    questionCount: 28,
    questionsPerDimension: 7,
    duration: "About 3 minutes",
  });
  assert.deepEqual(PROTOCOLS.full, {
    id: "full",
    name: "Full Protocol",
    questionCount: 64,
    questionsPerDimension: 16,
    duration: "About 8–10 minutes",
  });
});
```

- [ ] **Step 2: Run the data test and verify the red state**

Run:

```bash
node --experimental-strip-types --test src/contents/strain-personality-data.test.ts
```

Expected: FAIL because the initial type-only module does not yet export `DIMENSIONS`, `GLOSSARY`, `PROTOCOLS`, or `QUESTIONS_BY_PROTOCOL`.

- [ ] **Step 3: Implement the data types, metadata, glossary, and all questions**

Replace the initial type-only contents of `src/contents/strain-personality-data.ts` with the exact complete exports and question content below:

```ts
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
  "planktonic-growth": {
    term: "Planktonic growth",
    explanation:
      "A growth state in which individual cells remain dispersed and suspended in liquid culture.",
  "metabolite-exchange": {
    term: "Metabolite exchange",
    explanation:
      "The transfer of small molecules or pathway intermediates between nearby cells.",
  "7-dhc": {
    term: "7-DHC",
    explanation:
      "7-dehydrocholesterol, the target sterol in this project and a precursor used to produce vitamin D3.",
  "lipid-droplet": {
    term: "Lipid droplet",
    explanation:
      "An intracellular structure that stores neutral lipids and can accumulate hydrophobic products.",
  raman: {
    term: "Raman spectroscopy",
    explanation:
      "A non-destructive analytical method that reads molecular vibration signals from a sample.",
  "characteristic-peak": {
    term: "Characteristic peak",
    explanation:
      "A Raman signal at a specific position that helps identify a molecular structure or sample component.",
  plasmid: {
    term: "Plasmid",
    explanation:
      "A designed DNA vector used to carry genetic elements into a host cell.",
  "genetic-element": {
    term: "Genetic element",
    explanation:
      "A functional DNA part such as a promoter, coding sequence, terminator, or selection marker.",
  "metabolic-pathway": {
    term: "Metabolic pathway",
    explanation:
      "A linked series of enzyme-catalyzed reactions that converts starting materials into products.",
  "regulatory-network": {
    term: "Regulatory network",
    explanation:
      "The interacting genes, enzymes, and signals that coordinate pathway activity and cell physiology.",
  "cellular-homeostasis": {
    term: "Cellular homeostasis",
    explanation:
      "The balanced internal state that allows a cell to maintain growth and productive metabolism.",
  "cellular-stress": {
    term: "Cellular stress",
    explanation:
      "Pressure caused by factors such as product toxicity, nutrient limits, or dense culture conditions.",
  "induced-expression": {
    term: "Induced expression",
    explanation:
      "Turning on a target gene at a chosen time by applying a defined signal or culture condition.",
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
```

- [ ] **Step 4: Run both data and scoring tests**

Run:

```bash
node --experimental-strip-types --test src/contents/strain-personality-data.test.ts src/contents/strain-personality-scoring.test.ts
```

Expected: 10 tests PASS, 0 tests FAIL.

- [ ] **Step 5: Commit the validated English question bank**

```bash
git add src/contents/strain-personality-data.ts src/contents/strain-personality-data.test.ts
git commit -m "feat: add English strain personality question banks"
```

---

### Task 3: Build the browser-only React experience

**Files:**
- Create: `src/contents/strain-personality.tsx`
- Create: `src/contents/strain-personality.css`

- [ ] **Step 1: Add the route-scoped component with landing, quiz, and result states**

Create `src/contents/strain-personality.tsx`. Use these exact state boundaries and handlers; keep the three view components in the same file because they share one local session and are not reused elsewhere:

```tsx
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import "./strain-personality.css";
import {
  DIMENSIONS,
  GLOSSARY,
  PROTOCOLS,
  QUESTIONS_BY_PROTOCOL,
  RESULT_PROFILES,
  type DimensionId,
  type ProtocolId,
  type StrainQuestion,
} from "./strain-personality-data.ts";
import {
  isQuizComplete,
  parseStoredSession,
  scoreQuiz,
  storageKeyFor,
  type QuizAnswers,
} from "./strain-personality-scoring.ts";

type View = "landing" | "quiz" | "result";

export function StrainPersonality() {
  const [protocol, setProtocol] = useState<ProtocolId>("full");
  const [view, setView] = useState<View>("landing");
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [currentQuestionId, setCurrentQuestionId] = useState("");
  const [saveNotice, setSaveNotice] = useState("");
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const questions = QUESTIONS_BY_PROTOCOL[protocol];
  const currentQuestion =
    questions.find((question) => question.id === currentQuestionId) || questions[0];
  const activeDimension = currentQuestion.dimension;
  const dimensionQuestions = questions.filter(
    (question) => question.dimension === activeDimension,
  );
  const answeredCount = questions.filter((question) => answers[question.id]).length;
  const complete = isQuizComplete(questions, answers);

  useEffect(() => {
    const stored = parseStoredSession(
      window.localStorage.getItem(storageKeyFor(protocol)),
      protocol,
      questions,
    );

    setAnswers(stored?.answers || {});
    setCurrentQuestionId(stored?.currentQuestionId || questions[0].id);
    setView("landing");
  }, [protocol, questions]);

  useEffect(() => {
    if (!currentQuestionId) {
      return;
    }

    try {
      window.localStorage.setItem(
        storageKeyFor(protocol),
        JSON.stringify({ protocol, currentQuestionId, answers }),
      );
      setSaveNotice("");
    } catch {
      setSaveNotice("Progress is available in this tab but could not be saved locally.");
    }
  }, [answers, currentQuestionId, protocol]);

  useEffect(() => {
    if (view === "quiz") {
      questionHeadingRef.current?.focus();
    }
    if (view === "result") {
      resultHeadingRef.current?.focus();
    }
  }, [currentQuestionId, view]);

  const result = useMemo(
    () => (view === "result" && complete ? scoreQuiz(questions, answers) : null),
    [answers, complete, questions, view],
  );

  function startQuiz() {
    const firstUnanswered = questions.find((question) => !answers[question.id]);
    setCurrentQuestionId(firstUnanswered?.id || questions[0].id);
    setView("quiz");
  }

  function chooseDimension(dimension: DimensionId) {
    const candidates = questions.filter((question) => question.dimension === dimension);
    const target = candidates.find((question) => !answers[question.id]) || candidates[0];
    setCurrentQuestionId(target.id);
  }

  function moveBy(delta: number) {
    const index = questions.findIndex((question) => question.id === currentQuestion.id);
    const target = questions[Math.min(Math.max(index + delta, 0), questions.length - 1)];
    setCurrentQuestionId(target.id);
  }

  function resetProtocol() {
    if (!window.confirm(`Clear all ${PROTOCOLS[protocol].name} answers?`)) {
      return;
    }
    window.localStorage.removeItem(storageKeyFor(protocol));
    setAnswers({});
    setCurrentQuestionId(questions[0].id);
    setView("landing");
  }

  return (
    <main className="strain-lab">
      <header className="strain-lab-topbar">
        <span className="strain-lab-mark" aria-hidden="true">Y</span>
        <strong>Strain Personality Lab</strong>
        <span className="strain-lab-private">LOCAL ONLY · NO ANSWERS UPLOADED</span>
      </header>

      {view === "landing" ? (
        <Landing
          protocol={protocol}
          answeredCount={answeredCount}
          onProtocolChange={setProtocol}
          onStart={startQuiz}
        />
      ) : null}

      {view === "quiz" ? (
        <QuizWorkspace
          protocol={protocol}
          questions={questions}
          answers={answers}
          currentQuestion={currentQuestion}
          dimensionQuestions={dimensionQuestions}
          activeDimension={activeDimension}
          answeredCount={answeredCount}
          saveNotice={saveNotice}
          headingRef={questionHeadingRef}
          onChooseDimension={chooseDimension}
          onChooseQuestion={setCurrentQuestionId}
          onAnswer={(answer) =>
            setAnswers((current) => ({ ...current, [currentQuestion.id]: answer }))
          }
          onPrevious={() => moveBy(-1)}
          onNext={() => moveBy(1)}
          onResult={() => setView("result")}
          onReset={resetProtocol}
        />
      ) : null}

      {view === "result" && result ? (
        <ResultView
          protocol={protocol}
          result={result}
          headingRef={resultHeadingRef}
          onReview={() => setView("quiz")}
          onReset={resetProtocol}
          onProtocols={() => setView("landing")}
        />
      ) : null}
    </main>
  );
}

function Landing({
  protocol,
  answeredCount,
  onProtocolChange,
  onStart,
}: {
  protocol: ProtocolId;
  answeredCount: number;
  onProtocolChange: (protocol: ProtocolId) => void;
  onStart: () => void;
}) {
  return (
    <section className="strain-lab-landing">
      <div className="strain-lab-hero">
        <div>
          <span className="strain-lab-eyebrow">Find your microbial type</span>
          <h1>Which strain personality runs your cell factory?</h1>
          <p>
            Enter a <em>Yarrowia lipolytica</em> 7-DHC cell factory and explore
            how you collaborate, read data, make trade-offs, and organize experiments.
          </p>
        </div>
        <aside>
          <strong>A creative learning metaphor</strong>
          <p>Microorganisms do not possess human personality traits, and this activity is not a diagnostic assessment.</p>
        </aside>
      </div>

      <fieldset className="strain-lab-protocols">
        <legend>Choose your protocol</legend>
        {(Object.keys(PROTOCOLS) as ProtocolId[]).map((id) => {
          const item = PROTOCOLS[id];
          return (
            <button
              type="button"
              key={id}
              className={protocol === id ? "is-selected" : ""}
              aria-pressed={protocol === id}
              onClick={() => onProtocolChange(id)}
            >
              <span><strong>{item.questionCount}</strong> QUESTIONS</span>
              <span><strong>{item.name}</strong><small>{item.questionsPerDimension} questions per dimension · {item.duration}</small></span>
            </button>
          );
        })}
      </fieldset>

      <div className="strain-lab-dimension-preview">
        {DIMENSIONS.map((dimension) => (
          <span key={dimension.id}><strong>{dimension.highPole} / {dimension.lowPole}</strong>{dimension.label}</span>
        ))}
      </div>

      <div className="strain-lab-start-row">
        <p>Answers are calculated and stored only in this browser.</p>
        <button type="button" className="strain-lab-primary" onClick={onStart}>
          {answeredCount ? `Resume ${PROTOCOLS[protocol].name}` : `Start ${PROTOCOLS[protocol].name}`} →
        </button>
      </div>
    </section>
  );
}

function QuizWorkspace({
  protocol,
  questions,
  answers,
  currentQuestion,
  dimensionQuestions,
  activeDimension,
  answeredCount,
  saveNotice,
  headingRef,
  onChooseDimension,
  onChooseQuestion,
  onAnswer,
  onPrevious,
  onNext,
  onResult,
  onReset,
}: {
  protocol: ProtocolId;
  questions: StrainQuestion[];
  answers: QuizAnswers;
  currentQuestion: StrainQuestion;
  dimensionQuestions: StrainQuestion[];
  activeDimension: DimensionId;
  answeredCount: number;
  saveNotice: string;
  headingRef: RefObject<HTMLHeadingElement>;
  onChooseDimension: (dimension: DimensionId) => void;
  onChooseQuestion: (id: string) => void;
  onAnswer: (answer: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onResult: () => void;
  onReset: () => void;
}) {
  const answer = answers[currentQuestion.id];
  const overallIndex = questions.findIndex((question) => question.id === currentQuestion.id);
  const glossary = currentQuestion.glossaryKey
    ? GLOSSARY[currentQuestion.glossaryKey]
    : undefined;
  const complete = isQuizComplete(questions, answers);
  const nextUnanswered = questions.find((question) => !answers[question.id]);

  return (
    <section className="strain-lab-workspace">
      <div className="strain-lab-dimensions" aria-label="Question dimensions">
        {DIMENSIONS.map((dimension) => {
          const dimensionItems = questions.filter((question) => question.dimension === dimension.id);
          const count = dimensionItems.filter((question) => answers[question.id]).length;
          return (
            <button
              type="button"
              key={dimension.id}
              className={activeDimension === dimension.id ? "is-active" : ""}
              aria-pressed={activeDimension === dimension.id}
              onClick={() => onChooseDimension(dimension.id)}
            >
              <strong>{dimension.highPole} / {dimension.lowPole}</strong>
              <span>{dimension.label}</span>
              <em>{count} / {dimensionItems.length}</em>
            </button>
          );
        })}
      </div>

      <div className="strain-lab-navigator">
        <div className="strain-lab-question-index" aria-label={`Questions in ${activeDimension}`}>
          {dimensionQuestions.map((question, index) => (
            <button
              type="button"
              key={question.id}
              className={`${answers[question.id] ? "is-answered" : ""} ${question.id === currentQuestion.id ? "is-current" : ""}`.trim()}
              aria-current={question.id === currentQuestion.id ? "step" : undefined}
              aria-label={`Question ${index + 1}, ${answers[question.id] ? "answered" : "unanswered"}`}
              onClick={() => onChooseQuestion(question.id)}
            >
              {String(index + 1).padStart(2, "0")}
            </button>
          ))}
        </div>
        <div className="strain-lab-progress">
          <span>Overall progress</span><strong>{answeredCount} / {questions.length}</strong>
          <progress aria-label={`Overall progress: ${answeredCount} of ${questions.length}`} max={questions.length} value={answeredCount}>{answeredCount} of {questions.length}</progress>
        </div>
      </div>

      <article className="strain-lab-question-card">
        <div className="strain-lab-question-grid">
          <div className="strain-lab-question-main">
            <span className="strain-lab-question-meta">{activeDimension} · {currentQuestion.kind.toUpperCase()} QUESTION · #{String(overallIndex + 1).padStart(2, "0")}</span>
            <h1 ref={headingRef} tabIndex={-1}>{currentQuestion.prompt}</h1>
            <label htmlFor="strain-response">Choose a response from 1 to 7</label>
            <div className="strain-lab-scale-labels"><span>Strongly disagree</span><span>Neutral / unsure</span><span>Strongly agree</span></div>
            <input id="strain-response" type="range" min="1" max="7" step="1" value={answer || 4} aria-valuetext={answer ? `${answer} of 7` : "No response selected"} className={answer ? "" : "is-unanswered"} onChange={(event) => onAnswer(Number(event.target.value))} />
            <div className="strain-lab-values" aria-label="Response values">
              {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                <button type="button" key={value} className={answer === value ? "is-selected" : ""} aria-pressed={answer === value} onClick={() => onAnswer(value)}>{value}</button>
              ))}
            </div>
          </div>
          {glossary ? <aside className="strain-lab-note"><span>LAB NOTE</span><h2>{glossary.term}</h2><p>{glossary.explanation}</p><a href="#strain-lab-glossary">Open the full glossary →</a></aside> : null}
        </div>
        {saveNotice ? <p className="strain-lab-save-notice" role="status">{saveNotice}</p> : null}
        <footer className="strain-lab-actions">
          <button type="button" onClick={onPrevious} disabled={overallIndex === 0}>← Previous</button>
          <button type="button" onClick={onReset}>Restart</button>
          {complete ? (
            <button type="button" className="strain-lab-primary" onClick={onResult}>View my strain type →</button>
          ) : (
            <button
              type="button"
              className="strain-lab-primary"
              onClick={() => overallIndex === questions.length - 1 && nextUnanswered ? onChooseQuestion(nextUnanswered.id) : onNext()}
              disabled={!answer}
            >
              {overallIndex === questions.length - 1 ? "Go to unanswered →" : "Save & next →"}
            </button>
          )}
        </footer>
      </article>
      <details id="strain-lab-glossary" className="strain-lab-glossary">
        <summary>Full lab glossary</summary>
        <div>
          {Object.values(GLOSSARY).map((entry) => (
            <article key={entry.term}>
              <h2>{entry.term}</h2>
              <p>{entry.explanation}</p>
            </article>
          ))}
        </div>
      </details>
    </section>
  );
}

function ResultView({ protocol, result, headingRef, onReview, onReset, onProtocols }: {
  protocol: ProtocolId;
  result: ReturnType<typeof scoreQuiz>;
  headingRef: RefObject<HTMLHeadingElement>;
  onReview: () => void;
  onReset: () => void;
  onProtocols: () => void;
}) {
  const profile = RESULT_PROFILES[result.type];
  return (
    <section className="strain-lab-result">
      <span className="strain-lab-eyebrow">Your strain type</span>
      <h1 ref={headingRef} tabIndex={-1}>{result.type}</h1>
      {profile?.name ? <h2>{profile.name}</h2> : null}
      {profile?.summary ? <p>{profile.summary}</p> : null}
      <p>{PROTOCOLS[protocol].name} · {PROTOCOLS[protocol].questionCount} answers</p>
      <div className="strain-lab-result-dimensions">
        {DIMENSIONS.map((dimension) => {
          const score = result.dimensions[dimension.id];
          if (!score) return null;
          return <div key={dimension.id}><span>{score.lowPole}</span><progress aria-label={`${dimension.id}: ${score.highPolePercent}% toward ${score.highPole}`} max="100" value={score.highPolePercent}>{score.highPolePercent}% toward {score.highPole}</progress><span>{score.highPole}</span><strong>{score.letter} · {score.strength}% preference</strong></div>;
        })}
      </div>
      <p className="strain-lab-disclaimer">This creative learning activity is not a diagnostic psychological assessment.</p>
      <div className="strain-lab-result-actions"><button type="button" onClick={onReview}>Review answers</button><button type="button" onClick={onProtocols}>Choose protocol</button><button type="button" onClick={onReset}>Restart</button></div>
    </section>
  );
}
```

- [ ] **Step 2: Add the exact route-scoped visual system**

Create `src/contents/strain-personality.css`. Implement these selector contracts exactly, using the token values below. Keep the approved previous layout: 2×2 dimension cards, fixed 44px number buttons, and a separate progress row.

```css
.strain-lab {
  --sl-bg: #f6f8fa;
  --sl-panel: #ffffff;
  --sl-text: #1f2328;
  --sl-muted: #59636e;
  --sl-border: #d0d7de;
  --sl-blue: #0969da;
  --sl-blue-soft: #ddf4ff;
  --sl-green: #1a7f37;
  min-height: 100dvh;
  padding-top: var(--nav-offset);
  background: var(--sl-bg);
  color: var(--sl-text);
  font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
}

.strain-lab button,
.strain-lab input { touch-action: manipulation; }
.strain-lab button { cursor: pointer; transition: background-color 180ms ease, border-color 180ms ease, color 180ms ease; }
.strain-lab button:focus-visible,
.strain-lab input:focus-visible,
.strain-lab a:focus-visible { outline: 3px solid rgba(9, 105, 218, 0.35); outline-offset: 3px; }
.strain-lab button:disabled { cursor: not-allowed; opacity: 0.45; }

.strain-lab-topbar { min-height: 62px; padding: 12px clamp(18px, 4vw, 52px); display: flex; align-items: center; gap: 10px; background: var(--sl-panel); border-bottom: 1px solid var(--sl-border); }
.strain-lab-mark { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; color: white; background: linear-gradient(145deg, var(--sl-blue), #79c0ff); font-weight: 800; }
.strain-lab-private { margin-left: auto; color: var(--sl-muted); font: 0.72rem ui-monospace, SFMono-Regular, Consolas, monospace; }

.strain-lab-landing,
.strain-lab-workspace,
.strain-lab-result { width: min(1120px, calc(100% - 32px)); margin: 0 auto; padding: clamp(28px, 5vw, 64px) 0; }
.strain-lab-hero { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 28px; align-items: end; }
.strain-lab-eyebrow,
.strain-lab-question-meta,
.strain-lab-note > span { color: var(--sl-blue); font: 700 0.76rem ui-monospace, SFMono-Regular, Consolas, monospace; letter-spacing: 0.08em; text-transform: uppercase; }
.strain-lab-hero h1 { margin: 12px 0; max-width: 760px; font-size: clamp(2.2rem, 5vw, 4.8rem); line-height: 1; letter-spacing: -0.045em; }
.strain-lab-hero p { max-width: 720px; color: var(--sl-muted); line-height: 1.7; }
.strain-lab-hero aside { padding: 22px; border: 1px solid #b6e3ff; border-radius: 12px; background: linear-gradient(145deg, var(--sl-blue-soft), white); }

.strain-lab-protocols { margin: 34px 0 18px; padding: 0; border: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.strain-lab-protocols legend { grid-column: 1 / -1; margin-bottom: 8px; font-size: 1.15rem; font-weight: 700; }
.strain-lab-protocols button { min-height: 112px; padding: 18px; display: grid; grid-template-columns: auto 1fr; gap: 16px; align-items: center; text-align: left; color: var(--sl-text); border: 1px solid var(--sl-border); border-radius: 12px; background: white; }
.strain-lab-protocols button.is-selected { border-color: #54aeff; box-shadow: 0 0 0 3px rgba(84, 174, 255, 0.16); }
.strain-lab-protocols button > span:first-child { min-width: 78px; padding: 10px; color: var(--sl-blue); text-align: center; background: var(--sl-blue-soft); border-radius: 10px; font: 0.68rem ui-monospace, SFMono-Regular, Consolas, monospace; }
.strain-lab-protocols button > span:first-child strong { display: block; font-size: 1.9rem; }
.strain-lab-protocols button > span:last-child strong,
.strain-lab-protocols button > span:last-child small { display: block; }
.strain-lab-protocols button > span:last-child small { margin-top: 5px; color: var(--sl-muted); line-height: 1.45; }
.strain-lab-dimension-preview { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.strain-lab-dimension-preview span { padding: 13px; color: var(--sl-muted); border: 1px solid var(--sl-border); border-radius: 9px; background: white; font-size: 0.75rem; }
.strain-lab-dimension-preview strong { display: block; margin-bottom: 4px; color: var(--sl-blue); font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
.strain-lab-start-row { margin-top: 18px; display: flex; justify-content: space-between; align-items: center; gap: 18px; }
.strain-lab-start-row p { margin: 0; color: var(--sl-muted); }
.strain-lab-primary { min-height: 44px; padding: 0 17px; color: white !important; border: 1px solid #0866ca !important; border-radius: 7px; background: var(--sl-blue) !important; font-weight: 700; }

.strain-lab-dimensions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.strain-lab-dimensions button { min-height: 86px; padding: 16px 18px; display: grid; grid-template-columns: 1fr auto; align-items: center; text-align: left; color: var(--sl-text); border: 1px solid var(--sl-border); border-radius: 12px; background: white; }
.strain-lab-dimensions button strong { font: 700 0.95rem ui-monospace, SFMono-Regular, Consolas, monospace; }
.strain-lab-dimensions button span { grid-column: 1; color: var(--sl-muted); }
.strain-lab-dimensions button em { grid-column: 2; grid-row: 1 / span 2; font: 700 0.82rem ui-monospace, SFMono-Regular, Consolas, monospace; font-style: normal; }
.strain-lab-dimensions button.is-active { border-color: #54aeff; background: var(--sl-blue-soft); box-shadow: 0 0 0 2px rgba(84, 174, 255, 0.14); }

.strain-lab-navigator { margin-top: 16px; padding: 18px; border: 1px solid var(--sl-border); border-radius: 12px; background: white; }
.strain-lab-question-index { display: flex; flex-wrap: wrap; gap: 8px; }
.strain-lab-question-index button { width: 44px; height: 44px; padding: 0; color: var(--sl-muted); border: 1px solid var(--sl-border); border-radius: 7px; background: var(--sl-bg); font: 700 0.74rem ui-monospace, SFMono-Regular, Consolas, monospace; }
.strain-lab-question-index button.is-answered { color: var(--sl-green); border-color: #aceebb; background: #dafbe1; box-shadow: inset 0 -3px 0 var(--sl-green); }
.strain-lab-question-index button.is-current { color: white; border-color: var(--sl-blue); background: var(--sl-blue); outline: 2px solid #54aeff; outline-offset: 2px; box-shadow: none; }
.strain-lab-progress { margin-top: 18px; display: grid; grid-template-columns: 1fr auto; gap: 7px; color: var(--sl-muted); font-size: 0.78rem; }
.strain-lab-progress progress { grid-column: 1 / -1; width: 100%; height: 8px; accent-color: var(--sl-blue); }

.strain-lab-question-card { margin-top: 16px; overflow: hidden; border: 1px solid var(--sl-border); border-radius: 12px; background: white; }
.strain-lab-question-grid { display: grid; grid-template-columns: minmax(0, 1fr) 260px; }
.strain-lab-question-main { padding: clamp(24px, 4vw, 42px); }
.strain-lab-question-main h1 { margin: 12px 0 28px; max-width: 820px; font-size: clamp(1.45rem, 2.6vw, 2.25rem); line-height: 1.35; }
.strain-lab-question-main > label { display: block; margin-bottom: 8px; font-weight: 600; }
.strain-lab-scale-labels { display: flex; justify-content: space-between; gap: 12px; color: var(--sl-muted); font-size: 0.72rem; }
.strain-lab-question-main input[type="range"] { width: 100%; margin: 16px 0 12px; accent-color: var(--sl-blue); }
.strain-lab-question-main input.is-unanswered { opacity: 0.52; }
.strain-lab-values { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
.strain-lab-values button { min-height: 44px; color: var(--sl-muted); border: 1px solid var(--sl-border); border-radius: 7px; background: white; font-weight: 700; }
.strain-lab-values button.is-selected { color: var(--sl-blue); border-color: var(--sl-blue); background: var(--sl-blue-soft); }
.strain-lab-note { padding: 28px 22px; border-left: 1px solid var(--sl-border); background: linear-gradient(180deg, var(--sl-bg), white); }
.strain-lab-note h2 { margin: 10px 0 7px; font-size: 1.2rem; }
.strain-lab-note p { color: var(--sl-muted); line-height: 1.55; }
.strain-lab-note a { color: var(--sl-blue); }
.strain-lab-save-notice { margin: 0; padding: 10px 18px; color: #7d4e00; background: #fff8c5; }
.strain-lab-actions { padding: 13px 18px; display: flex; gap: 10px; border-top: 1px solid var(--sl-border); }
.strain-lab-actions button { min-height: 44px; padding: 0 15px; color: var(--sl-text); border: 1px solid var(--sl-border); border-radius: 7px; background: var(--sl-bg); font-weight: 700; }
.strain-lab-actions .strain-lab-primary { margin-left: auto; }
.strain-lab-glossary { margin-top: 16px; padding: 18px; border: 1px solid var(--sl-border); border-radius: 12px; background: white; }
.strain-lab-glossary summary { cursor: pointer; font-weight: 700; }
.strain-lab-glossary > div { margin-top: 14px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.strain-lab-glossary article { padding: 14px; border: 1px solid var(--sl-border); border-radius: 9px; background: var(--sl-bg); }
.strain-lab-glossary h2 { margin: 0 0 6px; font-size: 1rem; }
.strain-lab-glossary p { margin: 0; color: var(--sl-muted); line-height: 1.5; }

.strain-lab-result { text-align: center; }
.strain-lab-result > h1 { margin: 10px 0; color: var(--sl-blue); font-size: clamp(4rem, 14vw, 9rem); letter-spacing: 0.08em; }
.strain-lab-result-dimensions { width: min(720px, 100%); margin: 28px auto; display: grid; gap: 14px; }
.strain-lab-result-dimensions div { display: grid; grid-template-columns: 32px 1fr 32px auto; gap: 10px; align-items: center; text-align: left; }
.strain-lab-result-dimensions progress { width: 100%; accent-color: var(--sl-blue); }
.strain-lab-result-dimensions strong { min-width: 145px; text-align: right; }
.strain-lab-disclaimer { color: var(--sl-muted); }
.strain-lab-result-actions { display: flex; justify-content: center; flex-wrap: wrap; gap: 10px; }
.strain-lab-result-actions button { min-height: 44px; padding: 0 15px; border: 1px solid var(--sl-border); border-radius: 7px; background: white; }

@media (max-width: 760px) {
  .strain-lab-private { display: none; }
  .strain-lab-hero,
  .strain-lab-protocols,
  .strain-lab-question-grid { grid-template-columns: 1fr; }
  .strain-lab-dimension-preview { grid-template-columns: 1fr 1fr; }
  .strain-lab-dimensions { grid-template-columns: 1fr 1fr; gap: 8px; }
  .strain-lab-dimensions button { min-height: 78px; padding: 12px; }
  .strain-lab-note { border-top: 1px solid var(--sl-border); border-left: 0; }
  .strain-lab-glossary > div { grid-template-columns: 1fr; }
  .strain-lab-actions { flex-wrap: wrap; }
  .strain-lab-actions .strain-lab-primary { width: 100%; margin-left: 0; order: -1; }
  .strain-lab-start-row { align-items: stretch; flex-direction: column; }
  .strain-lab-result-dimensions div { grid-template-columns: 28px 1fr 28px; }
  .strain-lab-result-dimensions strong { grid-column: 1 / -1; text-align: center; }
}

@media (max-width: 380px) {
  .strain-lab-values { gap: 4px; }
}

@media (prefers-reduced-motion: reduce) {
  .strain-lab *, .strain-lab *::before, .strain-lab *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 3: Run lint and build to expose component/type issues**

Run:

```bash
corepack yarn lint
corepack yarn build
```

Expected: both commands exit 0.

- [ ] **Step 4: Commit the complete page component and visual system**

```bash
git add src/contents/strain-personality.tsx src/contents/strain-personality.css
git commit -m "feat: build strain personality quiz experience"
```

---

### Task 4: Register the standalone route and navigation entry

**Files:**
- Modify: `src/contents/index.tsx`
- Modify: `src/pages.ts`
- Modify: `src/components/Navbar.tsx`
- Modify: `src/containers/App/App.tsx`

- [ ] **Step 1: Export the component**

Append to `src/contents/index.tsx`:

```ts
export { StrainPersonality } from "./strain-personality.tsx";
```

- [ ] **Step 2: Register the route definition**

Add `StrainPersonality` to the import list from `./contents` in `src/pages.ts`. Add this page definition inside the existing `Project` folder after `Description`:

```ts
{
  name: "Strain Personality Lab",
  title: "Strain Personality Lab",
  path: "/strain-personality-lab",
  component: StrainPersonality,
  lead: "Choose a 28- or 64-question protocol and explore a synthetic-biology personality metaphor inside a Yarrowia lipolytica cell factory.",
},
```

- [ ] **Step 3: Add the navigation link**

Add this entry to `teamPath` in `src/components/Navbar.tsx`, immediately after Education:

```ts
{ name: "Strain Lab", path: "/strain-personality-lab" },
```

- [ ] **Step 4: Give the route an immersive shell**

In `src/containers/App/App.tsx`, replace the single results flag with:

```ts
const immersivePaths = new Set(["/results", "/strain-personality-lab"]);
const isImmersivePage = immersivePaths.has(currentPath);
```

Use `!isImmersivePage` in `showStandardHeader`. Extend the direct-component branch:

```tsx
{path === "/" ||
path === "/attributions" ||
path === "/strain-personality-lab" ? (
  <Component />
) : (
```

Keep the existing `page-shell-results` class condition unchanged for `/results`.

- [ ] **Step 5: Run all static verification**

Run:

```bash
node --experimental-strip-types --test src/contents/strain-personality-data.test.ts src/contents/strain-personality-scoring.test.ts
corepack yarn lint
corepack yarn build
```

Expected: 10 tests PASS; lint and build exit 0.

- [ ] **Step 6: Commit the route integration**

```bash
git add src/contents/index.tsx src/pages.ts src/components/Navbar.tsx src/containers/App/App.tsx
git commit -m "feat: expose strain personality lab route"
```

---

### Task 5: Browser behavior and accessibility verification

**Files:**
- Modify if a check fails: `src/contents/strain-personality.tsx`
- Modify if a check fails: `src/contents/strain-personality.css`

- [ ] **Step 1: Start the development server**

Run:

```bash
corepack yarn dev --host 127.0.0.1
```

Expected: Vite prints a local URL and remains running without startup errors.

- [ ] **Step 2: Verify Quick Assay at desktop width**

Open `/strain-personality-lab` at 1440×900 and verify:

1. All visible text is English.
2. Quick Assay shows 28 questions and seven fixed square number buttons per dimension.
3. Clicking `E/I`, `S/N`, `T/F`, or `J/P` switches to that dimension.
4. Clicking a number switches directly to that question.
5. Choosing 1–7 updates both the numeric button and range input.
6. Completed/current/unanswered states remain visually distinct without relying only on color.
7. Reload restores answers and the current question.
8. No request containing answers appears in the browser network panel.

- [ ] **Step 3: Verify Full Protocol and scoring**

Switch to Full Protocol and verify:

1. Each dimension shows sixteen fixed square number buttons that wrap naturally and never stretch.
2. Answer all high-pole questions with 7 and all low-pole questions with 1; the result is `ESTJ`.
3. Answer every item with 4; the exact-midpoint result is `ESTJ`.
4. Review answers returns to the saved session.
5. Restart asks for confirmation and clears only the active protocol.
6. Switching back to Quick Assay preserves its separate local session.

- [ ] **Step 4: Verify responsive layouts**

At 1024px, 768px, and 375px widths verify:

- No horizontal page scrolling.
- The four dimension cards remain 2×2 at 375px and wider.
- The question buttons stay square and wrap without stretching.
- `Lab Note` stacks below the question at 760px and below.
- The seven response buttons remain reachable and readable.
- The primary action is not hidden behind the global navbar or footer.

- [ ] **Step 5: Verify keyboard and reduced motion**

Using only the keyboard:

- Tab reaches every protocol, dimension, number, scale, navigation, and result action in logical order.
- Space/Enter activates buttons.
- Arrow keys change the native range input.
- Focus is visible and moves to the question heading after navigation.
- At `prefers-reduced-motion: reduce`, state changes do not animate visibly.
- The console contains no errors or warnings during the complete flow.

- [ ] **Step 6: Commit any browser-discovered corrections**

If browser checks required changes:

```bash
git add src/contents/strain-personality.tsx src/contents/strain-personality.css
git commit -m "fix: polish strain personality interactions"
```

If no files changed, do not create an empty commit.

---

### Task 6: Three consecutive final verification rounds

**Files:**
- Verify: all files changed by Tasks 1–5

- [ ] **Step 1: Verification round 1 — logic and data**

Run:

```bash
node --experimental-strip-types --test src/contents/strain-personality-data.test.ts src/contents/strain-personality-scoring.test.ts
```

Expected: 10 tests PASS, 0 FAIL.

- [ ] **Step 2: Verification round 2 — repository quality gates**

Run:

```bash
corepack yarn lint
corepack yarn build
```

Expected: lint exits 0 with no warnings; build exits 0. An existing Vite chunk-size notice is acceptable only if it is unchanged and clearly a warning rather than a failure.

- [ ] **Step 3: Verification round 3 — browser acceptance**

Repeat one full Quick Assay completion and the focused Full Protocol midpoint case at desktop and 375px widths. Confirm route navigation, local persistence, dimension/question switching, result, reset, focus states, no horizontal overflow, no network answer submission, and zero console errors.

If any round fails, fix the issue and restart the verification count from round 1.

- [ ] **Step 4: Inspect delivery state**

Run:

```bash
git diff --check
git status --short --branch
git log --oneline -5
```

Expected: no whitespace errors; only intentional source/spec/plan changes; commits are grouped by scoring, content, UI, integration, and any browser correction.

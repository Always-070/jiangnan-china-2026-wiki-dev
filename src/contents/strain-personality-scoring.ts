import {
  DIMENSIONS,
  type DimensionId,
  type Locale,
  type PersonalityType,
  type Pole,
  type StrainQuestion,
} from "./strain-personality-data.ts";

export type QuizAnswers = Record<string, number>;

export interface QuizSession {
  version: 2;
  currentQuestionId: string;
  answers: QuizAnswers;
}

export interface DimensionScore {
  dimension: DimensionId;
  highPole: Pole;
  lowPole: Pole;
  total: number;
  letter: Pole;
  strength: number;
  highPolePercent: number;
  usedTieBreak: boolean;
}

export interface QuizResult {
  type: PersonalityType;
  dimensions: Record<DimensionId, DimensionScore>;
}

const MIDPOINT = 20;
const MIN_DIMENSION_SCORE = 8;
const MAX_DIMENSION_SCORE = 32;

export function normalizeAnswer(answer: number, reversed: boolean) {
  assertAnswer(answer);
  return reversed ? 5 - answer : answer;
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

  const dimensions = {} as Record<DimensionId, DimensionScore>;

  for (const dimension of DIMENSIONS) {
    const dimensionQuestions = questions.filter(
      (question) => question.dimension === dimension.id,
    );
    if (!dimensionQuestions.length) {
      throw new Error(`Dimension ${dimension.id} has no questions`);
    }

    const total = dimensionQuestions.reduce(
      (sum, question) =>
        sum + normalizeAnswer(answers[question.id], question.reversed),
      0,
    );
    const usedTieBreak = total === MIDPOINT;
    const tieBreakQuestion = dimensionQuestions.find(
      (question) => question.id === dimension.tieBreakQuestionId,
    );
    if (!tieBreakQuestion) {
      throw new Error(`Tie-break question is missing for ${dimension.id}`);
    }

    const letter =
      total > MIDPOINT ||
      (usedTieBreak && answers[tieBreakQuestion.id] >= 3)
        ? dimension.highPole
        : dimension.lowPole;

    dimensions[dimension.id] = {
      dimension: dimension.id,
      highPole: dimension.highPole,
      lowPole: dimension.lowPole,
      total,
      letter,
      strength: Math.round(
        (Math.abs(total - MIDPOINT) /
          (MAX_DIMENSION_SCORE - MIDPOINT)) *
          100,
      ),
      highPolePercent: Math.round(
        ((total - MIN_DIMENSION_SCORE) /
          (MAX_DIMENSION_SCORE - MIN_DIMENSION_SCORE)) *
          100,
      ),
      usedTieBreak,
    };
  }

  const type = DIMENSIONS.map(
    (dimension) => dimensions[dimension.id].letter,
  ).join("") as PersonalityType;

  return { type, dimensions };
}

export function sessionStorageKey() {
  return "strain-personality-lab:session:v2";
}

export function localeStorageKey() {
  return "strain-personality-lab:locale:v2";
}

export function parseStoredLocale(raw: string | null): Locale | null {
  return raw === "zh-CN" || raw === "en" ? raw : null;
}

export function parseStoredSession(
  raw: string | null,
  questions: StrainQuestion[],
): QuizSession | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<QuizSession>;
    const validIds = new Set(questions.map((question) => question.id));

    if (
      parsed.version !== 2 ||
      typeof parsed.currentQuestionId !== "string" ||
      !validIds.has(parsed.currentQuestionId) ||
      !parsed.answers ||
      typeof parsed.answers !== "object"
    ) {
      return null;
    }

    const answers: QuizAnswers = {};
    for (const [id, answer] of Object.entries(parsed.answers)) {
      if (!validIds.has(id) || !isAnswer(answer)) {
        return null;
      }
      answers[id] = answer;
    }

    return {
      version: 2,
      currentQuestionId: parsed.currentQuestionId,
      answers,
    };
  } catch {
    return null;
  }
}

function isAnswer(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 4;
}

function assertAnswer(answer: number) {
  if (!isAnswer(answer)) {
    throw new Error(`Answer ${answer} must be an integer from 1 to 4`);
  }
}

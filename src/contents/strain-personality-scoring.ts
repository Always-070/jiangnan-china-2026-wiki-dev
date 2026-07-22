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

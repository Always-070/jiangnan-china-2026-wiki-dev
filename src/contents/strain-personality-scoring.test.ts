import assert from "node:assert/strict";
import test from "node:test";
import {
  DIMENSIONS,
  QUESTIONS,
  type DimensionId,
  type PersonalityType,
  type StrainQuestion,
} from "./strain-personality-data.ts";
import {
  isQuizComplete,
  localeStorageKey,
  normalizeAnswer,
  parseStoredLocale,
  parseStoredSession,
  scoreQuiz,
  sessionStorageKey,
  type QuizAnswers,
} from "./strain-personality-scoring.ts";

function rawAnswerForNormalized(question: StrainQuestion, normalized: number) {
  return question.reversed ? 5 - normalized : normalized;
}

function answersForType(type: PersonalityType): QuizAnswers {
  const targetByDimension: Record<DimensionId, string> = {
    SF: type[0],
    AI: type[1],
    HL: type[2],
  };

  return Object.fromEntries(
    QUESTIONS.map((question) => {
      const dimension = DIMENSIONS.find((item) => item.id === question.dimension);
      assert.ok(dimension);
      const normalized =
        targetByDimension[question.dimension] === dimension.highPole ? 4 : 1;
      return [question.id, rawAnswerForNormalized(question, normalized)];
    }),
  );
}

function tieAnswers(
  dimensionId: DimensionId,
  tieBreakAnswer: 2 | 3,
): QuizAnswers {
  const answers = answersForType("SAH");
  const dimension = DIMENSIONS.find((item) => item.id === dimensionId);
  assert.ok(dimension);
  const questions = QUESTIONS.filter((question) => question.dimension === dimensionId);
  const tieBreak = questions.find(
    (question) => question.id === dimension.tieBreakQuestionId,
  );
  assert.ok(tieBreak);

  answers[tieBreak.id] = tieBreakAnswer;
  const otherQuestions = questions.filter((question) => question.id !== tieBreak.id);
  const normalizedValues =
    tieBreakAnswer === 3
      ? [3, 3, 3, 2, 2, 2, 2]
      : [3, 3, 3, 3, 2, 2, 2];

  otherQuestions.forEach((question, index) => {
    answers[question.id] = rawAnswerForNormalized(
      question,
      normalizedValues[index],
    );
  });

  return answers;
}

test("normalizes direct and confirmed reverse-keyed answers on a four-point scale", () => {
  assert.equal(normalizeAnswer(4, false), 4);
  assert.equal(normalizeAnswer(1, false), 1);
  assert.equal(normalizeAnswer(4, true), 1);
  assert.equal(normalizeAnswer(1, true), 4);
  assert.throws(() => normalizeAnswer(0, false), /integer from 1 to 4/);
  assert.throws(() => normalizeAnswer(5, true), /integer from 1 to 4/);
});

test("produces every one of the eight three-letter result types", () => {
  for (const type of [
    "SAH",
    "SAL",
    "SIH",
    "SIL",
    "FAH",
    "FAL",
    "FIH",
    "FIL",
  ] as const) {
    assert.equal(scoreQuiz(QUESTIONS, answersForType(type)).type, type);
  }
});

test("uses question 7, 16, or 17 to resolve a score of twenty", () => {
  for (const dimension of DIMENSIONS) {
    const highResult = scoreQuiz(QUESTIONS, tieAnswers(dimension.id, 3));
    assert.equal(highResult.dimensions[dimension.id].total, 20);
    assert.equal(highResult.dimensions[dimension.id].letter, dimension.highPole);

    const lowResult = scoreQuiz(QUESTIONS, tieAnswers(dimension.id, 2));
    assert.equal(lowResult.dimensions[dimension.id].total, 20);
    assert.equal(lowResult.dimensions[dimension.id].letter, dimension.lowPole);
  }
});

test("requires all 24 answers and accepts only integer values from one to four", () => {
  const complete = answersForType("SAH");
  assert.equal(isQuizComplete(QUESTIONS, complete), true);
  assert.equal(
    isQuizComplete(QUESTIONS, { ...complete, "qinglan-sf-01": 0 }),
    false,
  );
  assert.equal(
    isQuizComplete(QUESTIONS, { ...complete, "qinglan-sf-01": 5 }),
    false,
  );
  assert.throws(
    () => scoreQuiz(QUESTIONS, { "qinglan-sf-01": 4 }),
    /Complete every question before scoring/,
  );
});

test("uses v2 session and locale keys isolated from the old v1 protocols", () => {
  assert.equal(sessionStorageKey(), "strain-personality-lab:session:v2");
  assert.equal(localeStorageKey(), "strain-personality-lab:locale:v2");
  assert.doesNotMatch(sessionStorageKey(), /quick|full|v1/);
  assert.notEqual(sessionStorageKey(), localeStorageKey());
});

test("accepts only supported persisted locales", () => {
  assert.equal(parseStoredLocale("zh-CN"), "zh-CN");
  assert.equal(parseStoredLocale("en"), "en");
  assert.equal(parseStoredLocale("zh"), null);
  assert.equal(parseStoredLocale(null), null);
});

test("loads valid v2 sessions without coupling them to the selected locale", () => {
  const answers = answersForType("FIL");
  const raw = JSON.stringify({
    version: 2,
    currentQuestionId: "qinglan-ai-04",
    answers,
  });
  const expected = {
    version: 2,
    currentQuestionId: "qinglan-ai-04",
    answers,
  };

  assert.deepEqual(parseStoredSession(raw, QUESTIONS), expected);
  assert.equal(parseStoredLocale("en"), "en");
  assert.deepEqual(parseStoredSession(raw, QUESTIONS), expected);
});

test("rejects v1, corrupt, foreign, and out-of-range stored answers", () => {
  assert.equal(parseStoredSession("not json", QUESTIONS), null);
  assert.equal(
    parseStoredSession(
      JSON.stringify({
        protocol: "quick",
        currentQuestionId: "quick-ei-01",
        answers: { "quick-ei-01": 7 },
      }),
      QUESTIONS,
    ),
    null,
  );
  assert.equal(
    parseStoredSession(
      JSON.stringify({
        version: 2,
        currentQuestionId: "qinglan-sf-01",
        answers: { unknown: 4 },
      }),
      QUESTIONS,
    ),
    null,
  );
  assert.equal(
    parseStoredSession(
      JSON.stringify({
        version: 2,
        currentQuestionId: "qinglan-sf-01",
        answers: { "qinglan-sf-01": 7 },
      }),
      QUESTIONS,
    ),
    null,
  );
});

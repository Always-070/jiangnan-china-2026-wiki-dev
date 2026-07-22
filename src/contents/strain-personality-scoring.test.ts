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

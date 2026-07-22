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

import assert from "node:assert/strict";
import test from "node:test";
import {
  DIMENSIONS,
  GLOSSARY,
  QUIZ_META,
  QUESTIONS,
  RESULT_PROFILES,
  SCALE_OPTIONS,
  UI_COPY,
  type LocalizedText,
  type PersonalityType,
} from "./strain-personality-data.ts";

const locales = ["zh-CN", "en"] as const;
const resultTypes: PersonalityType[] = [
  "SAH",
  "SAL",
  "SIH",
  "SIL",
  "FAH",
  "FAL",
  "FIH",
  "FIL",
];

function assertLocalized(text: LocalizedText, label: string) {
  for (const locale of locales) {
    assert.equal(typeof text[locale], "string", `${label} is missing ${locale}`);
    assert.ok(text[locale].trim(), `${label} has empty ${locale} copy`);
  }
}

test("Qinglan Bay quiz contains exactly three dimensions with eight questions each", () => {
  assert.equal(QUIZ_META.questionCount, 24);
  assert.equal(QUIZ_META.questionsPerDimension, 8);
  assert.deepEqual(
    DIMENSIONS.map((dimension) => dimension.id),
    ["SF", "AI", "HL"],
  );
  assert.equal(QUESTIONS.length, 24);

  for (const dimension of DIMENSIONS) {
    assert.equal(
      QUESTIONS.filter((question) => question.dimension === dimension.id).length,
      8,
    );
  }
});

test("questions have unique ids, complete bilingual prompts, and resolvable knowledge entries", () => {
  assert.equal(new Set(QUESTIONS.map((question) => question.id)).size, 24);

  for (const [index, question] of QUESTIONS.entries()) {
    assert.equal(question.number, index + 1);
    assertLocalized(question.prompt, `question ${question.number}`);
    assert.match(question.prompt["zh-CN"], /[\u3400-\u9fff]/);
    assert.match(question.prompt.en, /[A-Za-z]/);
    assert.ok(question.knowledgeKey, `question ${question.number} lacks knowledgeKey`);
    assert.ok(GLOSSARY[question.knowledgeKey]);
  }
});

test("the confirmed reverse-keyed questions are encoded explicitly", () => {
  assert.deepEqual(
    QUESTIONS.filter((question) => question.reversed).map((question) => question.number),
    [2, 6, 8, 10, 14, 15, 20, 24],
  );
});

test("the response scale contains the four confirmed values without a neutral option", () => {
  assert.deepEqual(
    SCALE_OPTIONS.map((option) => option.value),
    [1, 2, 3, 4],
  );
  for (const option of SCALE_OPTIONS) {
    assertLocalized(option.label, `scale option ${option.value}`);
  }
  assert.deepEqual(
    SCALE_OPTIONS.map((option) => option.label["zh-CN"]),
    ["非常不同意", "不太同意", "比较同意", "非常同意"],
  );
});

test("every glossary entry and dimension label is bilingual", () => {
  for (const dimension of DIMENSIONS) {
    assertLocalized(dimension.label, `dimension ${dimension.id}`);
    assertLocalized(dimension.description, `dimension ${dimension.id} description`);
  }

  for (const [key, entry] of Object.entries(GLOSSARY)) {
    assertLocalized(entry.term, `${key} term`);
    assertLocalized(entry.summary, `${key} summary`);
    assertLocalized(entry.explanation, `${key} explanation`);
  }
});

test("all eight results have unique source-image mappings and complete bilingual copy", () => {
  assert.deepEqual(Object.keys(RESULT_PROFILES).sort(), [...resultTypes].sort());
  assert.equal(
    new Set(Object.values(RESULT_PROFILES).map((profile) => profile.image)).size,
    8,
  );

  for (const type of resultTypes) {
    const profile = RESULT_PROFILES[type];
    assert.match(profile.image, /strain-personality\/.+\.(webp|png|jpe?g)$/i);
    assertLocalized(profile.title, `${type} title`);
    assertLocalized(profile.summary, `${type} summary`);
    assertLocalized(profile.projectLink, `${type} project link`);
    assertLocalized(profile.imageAlt, `${type} image alt`);
  }
});

test("all centralized interface copy is bilingual", () => {
  for (const [key, value] of Object.entries(UI_COPY)) {
    assertLocalized(value, `UI_COPY.${key}`);
  }
});

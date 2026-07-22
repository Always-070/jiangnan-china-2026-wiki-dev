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
  activeProtocolStorageKey,
  isQuizComplete,
  parseStoredSession,
  parseStoredProtocol,
  scoreQuiz,
  storageKeyFor,
  type QuizAnswers,
} from "./strain-personality-scoring.ts";

type View = "landing" | "quiz" | "result";

function readInitialProtocol(): ProtocolId {
  try {
    return parseStoredProtocol(
      window.localStorage.getItem(activeProtocolStorageKey()),
    ) || "full";
  } catch {
    return "full";
  }
}

export function StrainPersonality() {
  const [protocol, setProtocol] = useState<ProtocolId>(readInitialProtocol);
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
    let stored = null;

    try {
      stored = parseStoredSession(
        window.localStorage.getItem(storageKeyFor(protocol)),
        protocol,
        questions,
      );
    } catch {
      setSaveNotice("Progress is available in this tab but local storage is unavailable.");
    }

    setAnswers(stored?.answers || {});
    setCurrentQuestionId(stored?.currentQuestionId || questions[0].id);
    setView("landing");
  }, [protocol, questions]);

  useEffect(() => {
    try {
      window.localStorage.setItem(activeProtocolStorageKey(), protocol);
    } catch {
      setSaveNotice("Progress is available in this tab but could not be saved locally.");
    }
  }, [protocol]);

  useEffect(() => {
    if (!currentQuestionId) {
      return;
    }

    if (!questions.some((question) => question.id === currentQuestionId)) {
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
  }, [answers, currentQuestionId, protocol, questions]);

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
    if (!currentQuestionId) {
      const firstUnanswered = questions.find((question) => !answers[question.id]);
      setCurrentQuestionId(firstUnanswered?.id || questions[0].id);
    }
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

    try {
      window.localStorage.removeItem(storageKeyFor(protocol));
    } catch {
      setSaveNotice("The local copy could not be removed, but this tab has been reset.");
    }

    setAnswers({});
    setCurrentQuestionId(questions[0].id);
    setView("landing");
  }

  return (
    <main className="strain-lab">
      <header className="strain-lab-topbar">
        <span className="strain-lab-mark" aria-hidden="true">
          Y
        </span>
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
            Enter a <em>Yarrowia lipolytica</em> 7-DHC cell factory and explore how you
            collaborate, read data, make trade-offs, and organize experiments.
          </p>
        </div>
        <aside>
          <strong>A creative learning metaphor</strong>
          <p>
            Microorganisms do not possess human personality traits, and this activity is not
            a diagnostic assessment.
          </p>
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
              <span>
                <strong>{item.questionCount}</strong> QUESTIONS
              </span>
              <span>
                <strong>{item.name}</strong>
                <small>
                  {item.questionsPerDimension} questions per dimension · {item.duration}
                </small>
              </span>
            </button>
          );
        })}
      </fieldset>

      <div className="strain-lab-dimension-preview">
        {DIMENSIONS.map((dimension) => (
          <span key={dimension.id}>
            <strong>
              {dimension.highPole} / {dimension.lowPole}
            </strong>
            {dimension.label}
          </span>
        ))}
      </div>

      <div className="strain-lab-start-row">
        <p>Answers are calculated and stored only in this browser.</p>
        <button type="button" className="strain-lab-primary" onClick={onStart}>
          {answeredCount
            ? `Resume ${PROTOCOLS[protocol].name}`
            : `Start ${PROTOCOLS[protocol].name}`} {" "}
          →
        </button>
      </div>
    </section>
  );
}

function QuizWorkspace({
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
  const overallIndex = questions.findIndex(
    (question) => question.id === currentQuestion.id,
  );
  const glossary = currentQuestion.glossaryKey
    ? GLOSSARY[currentQuestion.glossaryKey]
    : undefined;
  const complete = isQuizComplete(questions, answers);
  const nextUnanswered = questions.find((question) => !answers[question.id]);

  return (
    <section className="strain-lab-workspace">
      <div className="strain-lab-dimensions" role="group" aria-label="Question dimensions">
        {DIMENSIONS.map((dimension) => {
          const dimensionItems = questions.filter(
            (question) => question.dimension === dimension.id,
          );
          const count = dimensionItems.filter((question) => answers[question.id]).length;

          return (
            <button
              type="button"
              key={dimension.id}
              className={activeDimension === dimension.id ? "is-active" : ""}
              aria-pressed={activeDimension === dimension.id}
              onClick={() => onChooseDimension(dimension.id)}
            >
              <strong>
                {dimension.highPole} / {dimension.lowPole}
              </strong>
              <span>{dimension.label}</span>
              <em>
                {count} / {dimensionItems.length}
              </em>
            </button>
          );
        })}
      </div>

      <div className="strain-lab-navigator">
        <div
          className="strain-lab-question-index"
          role="group"
          aria-label={`Questions in ${activeDimension}`}
        >
          {dimensionQuestions.map((question, index) => (
            <button
              type="button"
              key={question.id}
              className={`${answers[question.id] ? "is-answered" : ""} ${
                question.id === currentQuestion.id ? "is-current" : ""
              }`.trim()}
              aria-current={question.id === currentQuestion.id ? "step" : undefined}
              aria-label={`Question ${index + 1}, ${
                answers[question.id] ? "answered" : "unanswered"
              }`}
              onClick={() => onChooseQuestion(question.id)}
            >
              {String(index + 1).padStart(2, "0")}
            </button>
          ))}
        </div>
        <div className="strain-lab-progress">
          <span>Overall progress</span>
          <strong>
            {answeredCount} / {questions.length}
          </strong>
          <progress
            aria-label={`Overall progress: ${answeredCount} of ${questions.length}`}
            max={questions.length}
            value={answeredCount}
          >
            {answeredCount} of {questions.length}
          </progress>
        </div>
      </div>

      <article className="strain-lab-question-card">
        <div className="strain-lab-question-grid">
          <div className="strain-lab-question-main">
            <span className="strain-lab-question-meta">
              {activeDimension} · {currentQuestion.kind.toUpperCase()} QUESTION · #
              {String(overallIndex + 1).padStart(2, "0")}
            </span>
            <h1 ref={headingRef} tabIndex={-1}>
              {currentQuestion.prompt}
            </h1>
            <label htmlFor="strain-response">Choose a response from 1 to 7</label>
            <div className="strain-lab-scale-labels">
              <span>Strongly disagree</span>
              <span>Neutral / unsure</span>
              <span>Strongly agree</span>
            </div>
            <input
              id="strain-response"
              type="range"
              min="1"
              max="7"
              step="1"
              value={answer || 4}
              aria-valuetext={answer ? `${answer} of 7` : "No response selected"}
              className={answer ? "" : "is-unanswered"}
              onChange={(event) => onAnswer(Number(event.target.value))}
            />
            <div className="strain-lab-values" role="group" aria-label="Response values">
              {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                <button
                  type="button"
                  key={value}
                  className={answer === value ? "is-selected" : ""}
                  aria-pressed={answer === value}
                  onClick={() => onAnswer(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          {glossary ? (
            <aside className="strain-lab-note">
              <span>LAB NOTE</span>
              <h2>{glossary.term}</h2>
              <p>{glossary.explanation}</p>
              <a href="#strain-lab-glossary">Open the full glossary →</a>
            </aside>
          ) : null}
        </div>
        {saveNotice ? (
          <p className="strain-lab-save-notice" role="status">
            {saveNotice}
          </p>
        ) : null}
        <footer className="strain-lab-actions">
          <button type="button" onClick={onPrevious} disabled={overallIndex === 0}>
            ← Previous
          </button>
          <button type="button" onClick={onReset}>
            Restart
          </button>
          {complete ? (
            <button type="button" className="strain-lab-primary" onClick={onResult}>
              View my strain type →
            </button>
          ) : (
            <button
              type="button"
              className="strain-lab-primary"
              onClick={() =>
                overallIndex === questions.length - 1 && nextUnanswered
                  ? onChooseQuestion(nextUnanswered.id)
                  : onNext()
              }
              disabled={!answer}
            >
              {overallIndex === questions.length - 1
                ? "Go to unanswered →"
                : "Save & next →"}
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

function ResultView({
  protocol,
  result,
  headingRef,
  onReview,
  onReset,
  onProtocols,
}: {
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
      <h1 ref={headingRef} tabIndex={-1}>
        {result.type}
      </h1>
      {profile?.name ? <h2>{profile.name}</h2> : null}
      {profile?.summary ? <p>{profile.summary}</p> : null}
      <p>
        {PROTOCOLS[protocol].name} · {PROTOCOLS[protocol].questionCount} answers
      </p>
      <div className="strain-lab-result-dimensions">
        {DIMENSIONS.map((dimension) => {
          const score = result.dimensions[dimension.id];

          if (!score) {
            return null;
          }

          return (
            <div key={dimension.id}>
              <span>{score.lowPole}</span>
              <progress
                aria-label={`${dimension.id}: ${score.highPolePercent}% toward ${score.highPole}`}
                max={100}
                value={score.highPolePercent}
              >
                {score.highPolePercent}% toward {score.highPole}
              </progress>
              <span>{score.highPole}</span>
              <strong>
                {score.letter} · {score.strength}% preference
              </strong>
            </div>
          );
        })}
      </div>
      <p className="strain-lab-disclaimer">
        This creative learning activity is not a diagnostic psychological assessment.
      </p>
      <div className="strain-lab-result-actions">
        <button type="button" onClick={onReview}>
          Review answers
        </button>
        <button type="button" onClick={onProtocols}>
          Choose protocol
        </button>
        <button type="button" onClick={onReset}>
          Restart
        </button>
      </div>
    </section>
  );
}

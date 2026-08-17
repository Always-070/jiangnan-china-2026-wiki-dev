import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import "./strain-personality.css";
import {
  DIMENSIONS,
  GLOSSARY,
  LANGUAGE_OPTIONS,
  QINGLAN_COVER_IMAGE,
  QINGLAN_INTRO,
  QUESTIONS,
  QUIZ_META,
  RESULT_PROFILES,
  SCALE_OPTIONS,
  UI_COPY,
  textFor,
  type DimensionId,
  type Locale,
  type LocalizedText,
  type ScaleValue,
  type StrainQuestion,
} from "./strain-personality-data.ts";
import {
  isQuizComplete,
  localeStorageKey,
  parseStoredLocale,
  parseStoredSession,
  scoreQuiz,
  sessionStorageKey,
  type QuizAnswers,
  type QuizSession,
} from "./strain-personality-scoring.ts";

type View = "landing" | "quiz" | "result";

interface InitialState {
  session: QuizSession | null;
  storageAvailable: boolean;
}

function readInitialState(): InitialState {
  try {
    return {
      session: parseStoredSession(
        window.localStorage.getItem(sessionStorageKey()),
        QUESTIONS,
      ),
      storageAvailable: true,
    };
  } catch {
    return { session: null, storageAvailable: false };
  }
}

function readInitialLocale(): Locale {
  try {
    const stored = parseStoredLocale(
      window.localStorage.getItem(localeStorageKey()),
    );
    if (stored) return stored;
  } catch {
    // The selected locale still works for this tab if storage is unavailable.
  }

  return navigator.language.toLowerCase().startsWith("en") ? "en" : "zh-CN";
}

export function StrainPersonality() {
  const [initialState] = useState(readInitialState);
  const [locale, setLocale] = useState<Locale>(readInitialLocale);
  const [view, setView] = useState<View>("landing");
  const [answers, setAnswers] = useState<QuizAnswers>(
    initialState.session?.answers ?? {},
  );
  const [currentQuestionId, setCurrentQuestionId] = useState(
    initialState.session?.currentQuestionId ?? QUESTIONS[0].id,
  );
  const [storageAvailable, setStorageAvailable] = useState(
    initialState.storageAvailable,
  );
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const currentQuestion =
    QUESTIONS.find((question) => question.id === currentQuestionId) ?? QUESTIONS[0];
  const activeDimension = currentQuestion.dimension;
  const dimensionQuestions = QUESTIONS.filter(
    (question) => question.dimension === activeDimension,
  );
  const answeredCount = QUESTIONS.filter(
    (question) => answers[question.id],
  ).length;
  const complete = isQuizComplete(QUESTIONS, answers);

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      window.localStorage.setItem(localeStorageKey(), locale);
    } catch {
      setStorageAvailable(false);
    }
  }, [locale]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        sessionStorageKey(),
        JSON.stringify({
          version: 2,
          currentQuestionId,
          answers,
        } satisfies QuizSession),
      );
    } catch {
      setStorageAvailable(false);
    }
  }, [answers, currentQuestionId]);

  useEffect(() => {
    if (view === "quiz") questionHeadingRef.current?.focus();
    if (view === "result") resultHeadingRef.current?.focus();
  }, [currentQuestionId, view]);

  const result = useMemo(
    () => (view === "result" && complete ? scoreQuiz(QUESTIONS, answers) : null),
    [answers, complete, view],
  );

  function chooseDimension(dimension: DimensionId) {
    const candidates = QUESTIONS.filter(
      (question) => question.dimension === dimension,
    );
    const target =
      candidates.find((question) => !answers[question.id]) ?? candidates[0];
    setCurrentQuestionId(target.id);
  }

  function moveBy(delta: number) {
    const index = QUESTIONS.findIndex(
      (question) => question.id === currentQuestion.id,
    );
    const target =
      QUESTIONS[Math.min(Math.max(index + delta, 0), QUESTIONS.length - 1)];
    setCurrentQuestionId(target.id);
  }

  function resetQuiz() {
    if (!window.confirm(textFor(UI_COPY.resetConfirm, locale))) return;

    try {
      window.localStorage.removeItem(sessionStorageKey());
    } catch {
      setStorageAvailable(false);
    }

    setAnswers({});
    setCurrentQuestionId(QUESTIONS[0].id);
    setView("landing");
  }

  return (
    <main className="strain-lab">
      <TopBar locale={locale} onLocaleChange={setLocale} />

      {view === "landing" ? (
        <Landing
          locale={locale}
          answeredCount={answeredCount}
          onStart={() => setView("quiz")}
        />
      ) : null}

      {view === "quiz" ? (
        <QuizWorkspace
          locale={locale}
          answers={answers}
          currentQuestion={currentQuestion}
          dimensionQuestions={dimensionQuestions}
          activeDimension={activeDimension}
          answeredCount={answeredCount}
          storageAvailable={storageAvailable}
          headingRef={questionHeadingRef}
          onLocaleChange={setLocale}
          onChooseDimension={chooseDimension}
          onChooseQuestion={setCurrentQuestionId}
          onAnswer={(answer) =>
            setAnswers((current) => ({
              ...current,
              [currentQuestion.id]: answer,
            }))
          }
          onPrevious={() => moveBy(-1)}
          onNext={() => moveBy(1)}
          onResult={() => setView("result")}
          onReset={resetQuiz}
        />
      ) : null}

      {view === "result" && result ? (
        <ResultView
          locale={locale}
          result={result}
          headingRef={resultHeadingRef}
          onReview={() => setView("quiz")}
          onReset={resetQuiz}
          onHome={() => setView("landing")}
        />
      ) : null}
    </main>
  );
}

function TopBar({
  locale,
  onLocaleChange,
}: {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}) {
  return (
    <header className="strain-lab-topbar">
      <span className="strain-lab-mark" aria-hidden="true">
        Q
      </span>
      <strong>{textFor(UI_COPY.brand, locale)}</strong>
      <span className="strain-lab-private">
        {textFor(UI_COPY.localOnly, locale)}
      </span>
      <LanguageToggle locale={locale} onLocaleChange={onLocaleChange} />
    </header>
  );
}

function LanguageToggle({
  locale,
  onLocaleChange,
}: {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}) {
  return (
    <div
      className="strain-lab-language"
      role="group"
      aria-label={textFor(UI_COPY.languageGroup, locale)}
    >
      {LANGUAGE_OPTIONS.map((option) => (
        <button
          type="button"
          key={option.locale}
          className={locale === option.locale ? "is-active" : ""}
          aria-pressed={locale === option.locale}
          onClick={() => onLocaleChange(option.locale)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Landing({
  locale,
  answeredCount,
  onStart,
}: {
  locale: Locale;
  answeredCount: number;
  onStart: () => void;
}) {
  const tx = (text: LocalizedText) => textFor(text, locale);

  return (
    <section className="strain-lab-landing">
      <div className="strain-lab-hero-copy">
        <span className="strain-lab-eyebrow">{tx(UI_COPY.landingEyebrow)}</span>
        <h1>{tx(UI_COPY.landingTitle)}</h1>
        <p className="strain-lab-deck">{tx(UI_COPY.landingDescription)}</p>
        <p className="strain-lab-intro">{tx(QINGLAN_INTRO)}</p>

        <div className="strain-lab-facts" aria-label={tx(UI_COPY.assessmentFacts)}>
          <strong>{tx(UI_COPY.assessmentFacts)}</strong>
          <span>{tx(QUIZ_META.duration)}</span>
        </div>

        <div className="strain-lab-start-row">
          <p>{tx(UI_COPY.privacy)}</p>
          <button type="button" className="strain-lab-primary" onClick={onStart}>
            {answeredCount ? tx(UI_COPY.resume) : tx(UI_COPY.start)}
            <span aria-hidden="true"> →</span>
          </button>
        </div>
      </div>

      <figure className="strain-lab-guide">
        <img src={QINGLAN_COVER_IMAGE} alt={tx(UI_COPY.guideAlt)} />
        <figcaption>
          <strong>{tx(UI_COPY.guideCaption)}</strong>
          <span>{tx(UI_COPY.guideEnglishNote)}</span>
        </figcaption>
      </figure>

      <div className="strain-lab-landing-footer">
        <div className="strain-lab-dimension-preview">
          {DIMENSIONS.map((dimension) => (
            <article key={dimension.id}>
              <strong>
                {dimension.highPole} / {dimension.lowPole}
              </strong>
              <span>{tx(dimension.label)}</span>
              <small>{tx(dimension.description)}</small>
            </article>
          ))}
        </div>
        <aside className="strain-lab-creative-note">
          <strong>{tx(UI_COPY.creativeTitle)}</strong>
          <p>{tx(UI_COPY.creativeBody)}</p>
        </aside>
      </div>
    </section>
  );
}

function QuizWorkspace({
  locale,
  answers,
  currentQuestion,
  dimensionQuestions,
  activeDimension,
  answeredCount,
  storageAvailable,
  headingRef,
  onLocaleChange,
  onChooseDimension,
  onChooseQuestion,
  onAnswer,
  onPrevious,
  onNext,
  onResult,
  onReset,
}: {
  locale: Locale;
  answers: QuizAnswers;
  currentQuestion: StrainQuestion;
  dimensionQuestions: StrainQuestion[];
  activeDimension: DimensionId;
  answeredCount: number;
  storageAvailable: boolean;
  headingRef: RefObject<HTMLHeadingElement>;
  onLocaleChange: (locale: Locale) => void;
  onChooseDimension: (dimension: DimensionId) => void;
  onChooseQuestion: (id: string) => void;
  onAnswer: (answer: ScaleValue) => void;
  onPrevious: () => void;
  onNext: () => void;
  onResult: () => void;
  onReset: () => void;
}) {
  const tx = (text: LocalizedText) => textFor(text, locale);
  const answer = answers[currentQuestion.id];
  const overallIndex = QUESTIONS.findIndex(
    (question) => question.id === currentQuestion.id,
  );
  const knowledge = GLOSSARY[currentQuestion.knowledgeKey];
  const complete = isQuizComplete(QUESTIONS, answers);
  const nextUnanswered = QUESTIONS.find((question) => !answers[question.id]);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const glossaryTriggerRef = useRef<HTMLButtonElement>(null);

  return (
    <section className="strain-lab-workspace">
      <div
        className="strain-lab-dimensions"
        role="group"
        aria-label={tx(UI_COPY.dimensionGroup)}
      >
        {DIMENSIONS.map((dimension) => {
          const items = QUESTIONS.filter(
            (question) => question.dimension === dimension.id,
          );
          const count = items.filter((question) => answers[question.id]).length;

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
              <span>{tx(dimension.label)}</span>
              <em>
                {count} / {items.length}
              </em>
            </button>
          );
        })}
      </div>

      <div className="strain-lab-navigator">
        <div
          className="strain-lab-question-index"
          role="group"
          aria-label={tx(UI_COPY.questionGroup)}
        >
          {dimensionQuestions.map((question, index) => {
            const isAnswered = Boolean(answers[question.id]);
            const isCurrent = question.id === currentQuestion.id;
            return (
              <button
                type="button"
                key={question.id}
                className={`${isAnswered ? "is-answered" : ""} ${
                  isCurrent ? "is-current" : ""
                }`.trim()}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`${tx(UI_COPY.question)} ${index + 1}, ${
                  isAnswered ? tx(UI_COPY.answered) : tx(UI_COPY.unanswered)
                }`}
                onClick={() => onChooseQuestion(question.id)}
              >
                {String(index + 1).padStart(2, "0")}
              </button>
            );
          })}
        </div>
        <div className="strain-lab-progress">
          <span>{tx(UI_COPY.overallProgress)}</span>
          <strong>
            {answeredCount} / {QUESTIONS.length}
          </strong>
          <progress
            aria-label={`${tx(UI_COPY.overallProgress)}: ${answeredCount} / ${QUESTIONS.length}`}
            max={QUESTIONS.length}
            value={answeredCount}
          >
            {answeredCount} / {QUESTIONS.length}
          </progress>
        </div>
      </div>

      <article className="strain-lab-question-card">
        <div className="strain-lab-question-main">
          <span className="strain-lab-question-meta">
            {activeDimension} · {tx(UI_COPY.question)} {String(overallIndex + 1).padStart(2, "0")}
          </span>
          <h1 ref={headingRef} tabIndex={-1}>
            {tx(currentQuestion.prompt)}
          </h1>
          <p className="strain-lab-response-prompt">{tx(UI_COPY.responsePrompt)}</p>
          <div
            className="strain-lab-values"
            role="group"
            aria-label={tx(UI_COPY.responseGroup)}
          >
            {SCALE_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.value}
                className={answer === option.value ? "is-selected" : ""}
                aria-pressed={answer === option.value}
                onClick={() => onAnswer(option.value)}
              >
                <span>{option.value}</span>
                <strong>{tx(option.label)}</strong>
              </button>
            ))}
          </div>
        </div>

        <aside className="strain-lab-note">
          <div>
            <span>{tx(UI_COPY.knowledgeEyebrow)}</span>
            <h2>{tx(knowledge.term)}</h2>
          </div>
          <p>{tx(knowledge.summary)}</p>
          <button
            ref={glossaryTriggerRef}
            type="button"
            className="strain-lab-note-link"
            onClick={() => setGlossaryOpen(true)}
          >
            {tx(UI_COPY.openKnowledge)}
            <span aria-hidden="true"> →</span>
          </button>
        </aside>

        {!storageAvailable ? (
          <p className="strain-lab-save-notice" role="status">
            {tx(UI_COPY.storageUnavailable)}
          </p>
        ) : null}

        <footer className="strain-lab-actions">
          <button type="button" onClick={onPrevious} disabled={overallIndex === 0}>
            <span aria-hidden="true">← </span>
            {tx(UI_COPY.previous)}
          </button>
          <button type="button" onClick={onReset}>
            {tx(UI_COPY.restart)}
          </button>
          {complete ? (
            <button type="button" className="strain-lab-primary" onClick={onResult}>
              {tx(UI_COPY.viewResult)}
              <span aria-hidden="true"> →</span>
            </button>
          ) : (
            <button
              type="button"
              className="strain-lab-primary"
              onClick={() => {
                if (overallIndex === QUESTIONS.length - 1 && nextUnanswered) {
                  onChooseQuestion(nextUnanswered.id);
                } else {
                  onNext();
                }
              }}
              disabled={!answer}
            >
              {overallIndex === QUESTIONS.length - 1
                ? tx(UI_COPY.goUnanswered)
                : tx(UI_COPY.next)}
              <span aria-hidden="true"> →</span>
            </button>
          )}
        </footer>
      </article>

      <GlossaryDialog
        open={glossaryOpen}
        locale={locale}
        activeKey={currentQuestion.knowledgeKey}
        triggerRef={glossaryTriggerRef}
        onLocaleChange={onLocaleChange}
        onRequestClose={() => setGlossaryOpen(false)}
      />
    </section>
  );
}

function GlossaryDialog({
  open,
  locale,
  activeKey,
  triggerRef,
  onLocaleChange,
  onRequestClose,
}: {
  open: boolean;
  locale: Locale;
  activeKey: keyof typeof GLOSSARY;
  triggerRef: RefObject<HTMLButtonElement>;
  onLocaleChange: (locale: Locale) => void;
  onRequestClose: () => void;
}) {
  const tx = (text: LocalizedText) => textFor(text, locale);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function closeDialog() {
    if (dialogRef.current?.open) dialogRef.current.close();
    else onRequestClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className="strain-lab-dialog"
      aria-labelledby="strain-lab-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        closeDialog();
      }}
      onClose={() => {
        onRequestClose();
        triggerRef.current?.focus();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeDialog();
      }}
    >
      <div className="strain-lab-dialog-panel">
        <header>
          <div>
            <span className="strain-lab-question-meta">
              {tx(UI_COPY.knowledgeDialogEyebrow)}
            </span>
            <h2 id="strain-lab-dialog-title">
              {tx(UI_COPY.knowledgeDialogTitle)}
            </h2>
          </div>
          <div className="strain-lab-dialog-tools">
            <LanguageToggle locale={locale} onLocaleChange={onLocaleChange} />
            <button
              type="button"
              className="strain-lab-dialog-close"
              onClick={closeDialog}
              aria-label={tx(UI_COPY.close)}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </header>
        <div className="strain-lab-dialog-list">
          {Object.entries(GLOSSARY).map(([key, entry]) => (
            <article key={key} className={key === activeKey ? "is-current" : ""}>
              <h3>{tx(entry.term)}</h3>
              <p>{tx(entry.explanation)}</p>
            </article>
          ))}
        </div>
      </div>
    </dialog>
  );
}

function ResultView({
  locale,
  result,
  headingRef,
  onReview,
  onReset,
  onHome,
}: {
  locale: Locale;
  result: ReturnType<typeof scoreQuiz>;
  headingRef: RefObject<HTMLHeadingElement>;
  onReview: () => void;
  onReset: () => void;
  onHome: () => void;
}) {
  const tx = (text: LocalizedText) => textFor(text, locale);
  const profile = RESULT_PROFILES[result.type];

  return (
    <section className="strain-lab-result">
      <figure className="strain-lab-result-portrait">
        <img src={profile.image} alt={tx(profile.imageAlt)} />
      </figure>
      <div className="strain-lab-result-copy">
        <span className="strain-lab-eyebrow">{tx(UI_COPY.resultEyebrow)}</span>
        <h1 ref={headingRef} tabIndex={-1}>
          {result.type}
        </h1>
        <h2>{tx(profile.title)}</h2>
        <p className="strain-lab-result-summary">{tx(profile.summary)}</p>
        <p className="strain-lab-result-meta">{tx(UI_COPY.resultSummary)}</p>

        <section className="strain-lab-project-link">
          <strong>{tx(UI_COPY.projectConnection)}</strong>
          <p>{tx(profile.projectLink)}</p>
        </section>

        <section className="strain-lab-result-dimensions" aria-label={tx(UI_COPY.dimensionReading)}>
          {DIMENSIONS.map((dimension) => {
            const score = result.dimensions[dimension.id];
            return (
              <div key={dimension.id}>
                <span>{tx(dimension.lowLabel)}</span>
                <progress
                  aria-label={`${tx(dimension.label)}: ${score.highPolePercent}%`}
                  max={100}
                  value={score.highPolePercent}
                >
                  {score.highPolePercent}%
                </progress>
                <span>{tx(dimension.highLabel)}</span>
                <strong>
                  {score.letter} · {score.strength}% {tx(UI_COPY.preference)}
                </strong>
              </div>
            );
          })}
        </section>

        <aside className="strain-lab-disclaimer">
          <strong>{tx(UI_COPY.disclaimerTitle)}</strong>
          <p>{tx(UI_COPY.disclaimer)}</p>
        </aside>

        <div className="strain-lab-result-actions">
          <button type="button" className="strain-lab-primary" onClick={onReview}>
            {tx(UI_COPY.review)}
          </button>
          <button type="button" onClick={onHome}>
            {tx(UI_COPY.backHome)}
          </button>
          <button type="button" onClick={onReset}>
            {tx(UI_COPY.restart)}
          </button>
        </div>
      </div>
    </section>
  );
}

# Strain Personality Lab Design

## Purpose

Build a standalone English interactive Wiki page that uses a personality quiz as an entry point to the team's *Yarrowia lipolytica* and 7-DHC project. The page must feel like a focused assessment tool rather than a long article, while retaining concise synthetic-biology explanations beside relevant scenario questions.

The experience provides two protocols:

- **Quick Assay:** 28 questions, 7 questions per dimension, approximately 3 minutes.
- **Full Protocol:** 64 questions, 16 questions per dimension, approximately 8–10 minutes.

Both protocols run entirely in the visitor's browser. No answer, score, or result is sent to a server.

## Confirmed product decisions

- Route: `/strain-personality-lab`.
- Language: all visible interface copy, questions, glossary entries, accessibility labels, and result copy are English.
- Visual direction: minimal GitHub-inspired light blue interface using restrained borders, white surfaces, blue selected states, and compact information density.
- Landing page: introduces the activity and lets the visitor choose 28 or 64 questions.
- Quiz layout: one question at a time.
- Navigation: four dimension controls (`E/I`, `S/N`, `T/F`, `J/P`) plus clickable question numbers within the active dimension.
- Result content: display the four-letter type as the primary result. Optional strain names, descriptions, and images are reserved in the data model for later content without changing scoring code.
- Privacy: computation and optional draft persistence remain local to the browser; there is no submission endpoint or analytics event containing answers.

## Experience flow

### 1. Landing page

The standalone page opens with:

1. `Strain Personality Lab` identity and a short explanation of the creative metaphor.
2. A concise project connection: the visitor is entering a *Y. lipolytica* 7-DHC cell-factory scenario.
3. Two protocol cards showing question count, questions per dimension, estimated time, and intended use.
4. A compact preview of the four dimensions.
5. One primary action reflecting the selected protocol.
6. A visible privacy note stating that answers stay in the browser.

The page avoids unsupported MBTI market statistics and does not present the quiz as a diagnostic psychological instrument. It states that “strain personality” is a creative learning metaphor and that microorganisms do not possess human personality traits.

### 2. Question workspace

The workspace keeps the visitor oriented without recreating four large cards:

- A compact four-segment dimension bar occupies one row on desktop and a two-by-two grid on narrow screens.
- Each segment shows the letter pair, a short English label, and `answered / total` for that dimension.
- The active segment uses a blue inset indicator and selected background; the state is not communicated by color alone.
- A compact question-number grid appears immediately below. Full Protocol shows `01–16`; Quick Assay shows `01–07`.
- Completed, current, and unanswered questions have distinct text, border, and background treatments.
- Overall progress shares the same compact control surface instead of occupying a separate tall card.
- No live personality score is shown during the quiz, avoiding answer bias.

All interactive controls keep a minimum 44px target. Desktop question numbers remain on one row when space permits; smaller widths wrap to eight or four columns without horizontal scrolling.

### 3. One-question view

The question card contains:

- Dimension, question kind, and question number metadata.
- One English question.
- A labeled seven-point response scale from `Strongly disagree` to `Strongly agree`, with `Neutral / unsure` at the midpoint.
- Clickable numeric values `1–7` and a synchronized range input for pointer and keyboard use.
- A contextual `Lab Note` only when the question references a glossary concept.
- `Previous` and `Save & next` actions.

No response is assumed by default. The visual midpoint may be shown as the neutral reference, but the question remains unanswered until the visitor explicitly chooses a value. `Save & next` is disabled until the active question has a response. Visitors can still use the dimension and number controls to navigate elsewhere.

### 4. Completion and result

When every question is answered, the primary action becomes `View my strain type`. The result view shows:

- The four-letter result prominently.
- Four dimension rows showing both poles and the normalized preference position.
- The protocol used and completion count.
- A short non-diagnostic disclaimer.
- Actions to review answers, restart the current protocol, or return to protocol selection.

The result profile data supports optional `name`, `summary`, and `image` properties. When those properties are absent, the interface renders the four-letter code without invented strain-personality copy.

## Question data model

Question content is separated from React rendering and scoring:

```ts
type ProtocolId = "quick" | "full";
type DimensionId = "EI" | "SN" | "TF" | "JP";
type Pole = "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";
type QuestionKind = "classic" | "scenario";

interface StrainQuestion {
  id: string;
  protocol: ProtocolId;
  dimension: DimensionId;
  pole: Pole;
  kind: QuestionKind;
  prompt: string;
  glossaryKey?: string;
}
```

IDs are stable and protocol-scoped, for example `quick-ei-01` and `full-sn-09`. Automated validation ensures that Quick Assay has exactly seven questions per dimension and Full Protocol has exactly sixteen, with no duplicate IDs or invalid pole/dimension combinations.

The Word documents are the content authority for question intent. English wording should preserve the direction and meaning of each source question rather than translate mechanically. Scientific terms use consistent glossary wording.

## Scoring model

Each dimension has a configured high pole and low pole:

| Dimension | High pole | Low pole |
| --- | --- | --- |
| EI | E | I |
| SN | S | N |
| TF | T | F |
| JP | J | P |

Responses are integers from 1 to 7. Every question is normalized to the high-pole direction:

```ts
const normalized = question.pole === highPole ? answer : 8 - answer;
```

The dimension score is the mean of its normalized answers. This makes both protocols use the same threshold even though their question counts differ:

- Mean `>= 4.00`: choose the high pole.
- Mean `< 4.00`: choose the low pole.

An exact midpoint therefore resolves to `E`, `S`, `T`, or `J`, as confirmed. The result strength is derived from distance from the midpoint and is descriptive only; it does not change the four-letter result.

This model intentionally treats every low-pole question as reverse-scored. It does not depend on the inconsistent isolated “reverse” labels found in the source drafts.

## Local state and privacy

React state is the live source of truth. A versioned local-storage record preserves progress separately for each protocol so a 64-question session is not lost on refresh:

```text
strain-personality-lab:quick:v1
strain-personality-lab:full:v1
```

Stored data contains only protocol ID, question-answer pairs, current location, and completion state. No personal identifier is requested. No network request sends quiz data. Invalid or outdated stored data is rejected and replaced with a clean session. Restart requires confirmation because it clears local progress for that protocol.

## Visual system

The page uses scoped semantic tokens rather than changing the Wiki's global theme:

- Background: cool gray-white similar to GitHub light surfaces.
- Primary: accessible medium blue.
- Selected surface: pale blue with text and inset indicator.
- Completed state: pale green plus a textual/shape distinction.
- Text: near-black primary and accessible slate secondary.
- Geometry: 1px borders, 7–12px radii, limited shadows, 4/8px spacing rhythm.
- Typography: existing project fonts, with monospaced numerals for counts and question indexes.

Only one primary action appears in each screen state. State changes use 150–250ms color/opacity transitions without layout movement. Motion respects `prefers-reduced-motion`.

## Responsive and accessible behavior

- Test widths: 375px, 768px, 1024px, and 1440px.
- Four dimension segments: four columns on desktop, two-by-two on phones.
- Question number grid: sixteen columns when space allows, eight columns on tablets, four columns on narrow phones.
- `Lab Note`: right column on desktop, stacked below the question on smaller screens.
- All buttons and scale values have at least 44px hit areas and visible focus rings.
- Dimension and question controls expose `aria-current` or `aria-pressed` states.
- Completed status includes accessible text, not color alone.
- Range and numeric controls have a visible label and announce the selected value.
- Keyboard users can answer, move between questions, review previous answers, and reach results.
- Focus moves to the question heading after navigation and to the result heading on completion.

## Application integration

The page follows the existing Wiki route registry while keeping its own immersive shell:

- Register the content component and `/strain-personality-lab` route in `src/pages.ts`.
- Export the component from `src/contents/index.tsx`.
- Add `Strain Lab` under the existing Team navigation group near Education.
- Treat the route as immersive in `src/containers/App/App.tsx`: suppress the standard article header and use a full-width page-shell modifier, while retaining the global Wiki navbar and footer.
- Keep quiz styles in a route-scoped stylesheet so the page does not alter global Wiki pages.

## Planned file boundaries

- `src/contents/strain-personality.tsx` — screen flow and accessible interaction UI.
- `src/contents/strain-personality.css` — route-scoped responsive visual system.
- `src/contents/strain-personality-data.ts` — English questions, glossary, protocol metadata, and optional result-profile fields.
- `src/contents/strain-personality-scoring.ts` — pure scoring, validation, and local-session helpers.
- `src/contents/strain-personality-scoring.test.ts` — scoring, midpoint, reversal, validation, and storage-shape tests.
- `src/contents/strain-personality-data.test.ts` — counts, IDs, dimension/pole validity, and required English content tests.
- Existing registry, app shell, export, and navigation files change only where required to expose the route.

## Error handling

- Starting or finishing with unanswered questions directs focus to the first unanswered question and states what remains.
- Corrupt local progress is discarded safely without breaking the page.
- A storage write failure leaves the active in-memory session usable and shows a non-blocking local-save notice.
- Glossary entries missing from data cause the note panel to be omitted rather than rendering broken content.
- Result generation validates complete answers before scoring.

## Verification strategy

Implementation follows test-driven development for pure logic and data validation:

1. Write and observe failing scoring and data-contract tests.
2. Implement the minimum pure logic and question data needed to pass.
3. Build the React flow against the tested interfaces.
4. Run unit tests, lint, and the production build.
5. Use browser checks for both protocols: free navigation, answer persistence, reversal, exact-midpoint fallback, incomplete-state recovery, result generation, restart, and refresh restore.
6. Check desktop and mobile layouts, keyboard operation, focus visibility, console output, and reduced-motion behavior.
7. Complete three consecutive verification rounds; any failure resets the count after repair.

## Out of scope

- Server-side answer storage, analytics, accounts, or leaderboards.
- Psychological diagnosis or claims of clinical validity.
- Final names, narratives, and illustrations for all sixteen strain profiles.
- Editing the source Word documents.
- Broad restructuring of existing Wiki pages.

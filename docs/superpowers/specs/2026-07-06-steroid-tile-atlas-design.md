# Steroid Tile Atlas Design

## Goal

Build an independent five-level campaign for a dense, playable "羊了个羊"-style elimination game themed around biological steroid production. Each new board must be randomized while preserving the selected level's intended difficulty. The page should feel like a real game board first, while keeping editable science knowledge feedback ready for wet-lab teammates to fill later.

## Route and Placement

- Add a dedicated page at `/steroid-tile-atlas`.
- Register it as an independent innovation/interactive page in the existing wiki navigation structure.
- The page should not depend on the standard article-style header; the game itself is the first-screen experience.

## Core Experience

- Center the screen on a high-density multi-layer tile board with dozens of cards visible.
- Use steroid-related placeholder tile labels such as `Ring`, `P450`, `C27`, `C19`, `C21`, `OH`, `NAD`, `ERG`, and `SCO`.
- Use clear visual hierarchy:
  - uncovered clickable cards look raised and bright;
  - covered cards look darker or muted;
  - selected cards move into the seven-slot tray.
- Add reserve stacks at the left, right, and lower board area. Only the top reserve card is clickable.
- Keep the seven-slot tray fixed near the bottom of the game stage.

## Five-Level Campaign

- Show a compact five-node level track at the top of the game surface.
- Start with Level 1 unlocked. Completing a level unlocks the next level and shows a `Next level` action.
- Let players revisit any unlocked level. Starting or restarting a level always creates a fresh randomized board.
- Store only the highest unlocked level in browser local storage; game-in-progress state does not need persistence.
- Use the following difficulty profiles. Total counts include board and reserve tiles and are divisible by three.

| Level | Total tiles | Layers | Pattern types | Intended difficulty |
| --- | ---: | ---: | ---: | --- |
| 1 | 45 | 2 | 5 | Easy tutorial-like board |
| 2 | 84 | 3 | 7 | Medium board |
| 3 | 126 | 4 | 9 | Very hard, dense board |
| 4 | 168 | 5 | 9 | Very hard, deeper overlaps |
| 5 | 210 | 6 | 9 | Final maximum-density challenge |

## Randomized Level Generation

- Define a data-only difficulty profile for each level: total count, layer count, pattern count, reserve distribution, board footprint, and overlap density.
- Generate positions from several compatible shape motifs, then randomize motif selection, offsets, rotations/reflections where valid, and tile pattern assignment.
- Keep the footprint bounded so higher levels gain density through additional layers rather than an excessively large page.
- Accept an injectable random-number function in the generator. Production uses a fresh random seed, while tests use deterministic sequences.
- Build a legal removal order from currently selectable board tiles and reserve-stack tops, then assign patterns in triples along that order. This provides at least one solution path without making every move safe.
- Increase difficulty through more tiles, more layers, more pattern types, fewer immediately matching choices, and longer blocker chains. Random variations must stay inside the selected profile's bounds.

## Precise Coverage Model

- Use one shared geometry definition for rendering and rule evaluation: tile width, tile height, horizontal step, and vertical step.
- Two board tiles overlap when their rendered rectangles intersect on both axes. A lower tile is blocked by every overlapping, unremoved tile on a higher layer.
- Compute each tile's blocker IDs from generated positions. A tile becomes selectable only after all of its blockers have been removed.
- Render blocked tiles in grayscale with reduced brightness and a subtle hatch overlay. Use the native `disabled` state so blocked tiles cannot be selected by pointer or keyboard.
- Render selectable tiles at full color with a raised edge and a restrained hover/focus lift.

## Rules

- The generated deck total must be divisible by 3.
- Three matching tile patterns in the slot tray are eliminated after a new card is added.
- The slot tray can hold up to 7 cards; after the post-add elimination check, more than 7 means failure.
- Win when the main board, reserve stacks, and slot tray are empty.
- Implement the three tools:
  - Put aside: move the first three tray cards into a temporary aside area if it is empty.
  - Undo: roll back the last placement or aside return operation from a snapshot.
  - Shuffle: reshuffle patterns among remaining board and reserve cards only; tray and aside cards stay unchanged.
- Give each tool two uses in Level 1 and one use in Levels 2-5. Restarting a board resets the allowance for that level.

## Knowledge Feedback

- After each successful elimination, show one feedback card.
- For now, feedback content should remain editable English placeholder text such as "Wet-lab note pending".
- Keep the knowledge data separate from game logic so wet-lab teammates can fill entries without touching mechanics.
- Knowledge feedback must not cover the board or interrupt gameplay.

## Layout

- Desktop: use a compact campaign header, a dominant game stage, and a narrow side panel for status, tools, aside cards, and knowledge feedback.
- Mobile/tablet: stack a compact tool area below the board, keep the seven-slot tray readable, and scale the bounded board footprint to the available width.
- Avoid a marketing hero. The first viewport should immediately show the playable board.

## Visual Direction

- Match the wiki's biological manufacturing style while using a broader functional palette: fresh green field, warm off-white cards, deep green text, cyan process accents, amber progress accents, and coral danger states.
- Use compact 8px-style tile radii and stable card dimensions.
- Give every pattern a distinct scientific pictogram and color treatment while retaining its short text label.
- Use layer shadows and edge offsets to make the pile depth legible. Do not let decorative effects obscure tile boundaries.
- Animate tile selection, triple elimination, tray compaction, knowledge updates, level unlocks, and result transitions with short motion that respects reduced-motion preferences.
- Shift the sixth and seventh tray slots toward warning colors as risk increases.
- Use small molecule/steroid visual motifs only as support; the dense tile pile remains the main visual signal.

## Test and Verification

- Unit-test all five difficulty profiles, total triple divisibility, randomized variation, deterministic seeded generation, and the existence of a generated solution witness.
- Add a regression test proving that a lower tile remains blocked until every geometrically overlapping higher tile is removed.
- Run TypeScript, lint, and production build checks.
- Start the local Vite dev server and verify the page in a real browser.
- Test desktop and mobile viewports, including Level 5's 210-tile board.
- Verify at least these interactions:
  - clickable covered-state behavior;
  - three-card elimination;
  - slot overflow failure;
  - reserve-stack top-card selection;
  - put-aside and return;
  - undo;
  - shuffle;
  - per-level tool limits;
  - reset/new randomized board;
  - level unlock, revisit, and local progress restoration.

## Scope Boundaries

- Do not require final wet-lab knowledge copy in this implementation.
- Do not add external game libraries; the rules are small enough for local React state.
- Do not add backend persistence or leaderboard features.

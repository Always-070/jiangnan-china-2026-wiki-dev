# Steroid Tile Atlas Design

## Goal

Build an independent innovation page for a dense, playable "羊了个羊"-style elimination game themed around biological steroid production. The page should feel like a real game board first, while keeping editable science knowledge feedback ready for wet-lab teammates to fill later.

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

## Rules

- The generated deck total must be divisible by 3.
- Three matching tile patterns in the slot tray are eliminated after a new card is added.
- The slot tray can hold up to 7 cards; after the post-add elimination check, more than 7 means failure.
- Win when the main board, reserve stacks, and slot tray are empty.
- Implement the three tools:
  - Put aside: move the first three tray cards into a temporary aside area if it is empty.
  - Undo: roll back the last placement or aside return operation from a snapshot.
  - Shuffle: reshuffle patterns among remaining board and reserve cards only; tray and aside cards stay unchanged.

## Knowledge Feedback

- After each successful elimination, show one feedback card.
- For now, feedback content should be editable placeholder text such as "待湿实验组补充".
- Keep the knowledge data separate from game logic so wet-lab teammates can fill entries without touching mechanics.
- Knowledge feedback must not cover the board or interrupt gameplay.

## Layout

- Desktop: two-column layout with game stage as the dominant left area and compact side panel for status, tools, aside cards, and knowledge feedback.
- Mobile/tablet: stack the side panel below the board, keep the seven-slot tray readable, and reduce tile size with fixed aspect ratios.
- Avoid a marketing hero. The first viewport should immediately show the playable board.

## Visual Direction

- Match the wiki's existing biological manufacturing style: fresh green field background, warm cream cards, deep green text, and restrained amber highlights.
- Use compact 8px-style tile radii and stable card dimensions.
- Use small molecule/steroid visual motifs only as subtle support; the dense tile pile is the main visual signal.

## Test and Verification

- Run TypeScript/build checks.
- Start the local Vite dev server and verify the page in a real browser.
- Test desktop and mobile viewports.
- Verify at least these interactions:
  - clickable covered-state behavior;
  - three-card elimination;
  - slot overflow failure;
  - reserve-stack top-card selection;
  - put-aside and return;
  - undo;
  - shuffle;
  - reset/new game.

## Scope Boundaries

- Do not require final wet-lab knowledge copy in this implementation.
- Do not add external game libraries; the rules are small enough for local React state.
- Do not add backend persistence or leaderboard features.

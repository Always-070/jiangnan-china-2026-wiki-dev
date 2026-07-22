# Steroid Tile Atlas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the steroid tile game into a randomized five-level campaign with exact geometric coverage, stable difficulty profiles, limited tools, and a polished responsive game interface.

**Architecture:** Keep level generation and game rules as pure TypeScript functions in `steroid-tile-atlas-game.ts`, including injectable randomness and a generated solution witness. Keep campaign persistence and interaction composition in `steroid-tile-atlas.tsx`, and keep all visual states in the existing CSS file. No new runtime dependency or backend is required.

**Tech Stack:** React 18, TypeScript, Vite, existing Bootstrap shell, plain CSS.

---

## Active Campaign Enhancement File Structure

- Modify `src/contents/steroid-tile-atlas-game.ts`: level profiles, geometry, randomized generation, blocker IDs, solution witness, tool allowances, and progress helpers.
- Modify `src/contents/steroid-tile-atlas-game.test.ts`: deterministic generation, coverage regression, solution witness, level progression, and tool-limit tests.
- Modify `src/contents/steroid-tile-atlas.tsx`: level track, unlock persistence, level transitions, tool counters, richer tile faces, and result actions.
- Modify `src/contents/steroid-tile-atlas.css`: campaign layout, board depth, blocked/selectable states, pattern pictograms, tray warnings, transitions, and responsive behavior.

### Task 1: Define Difficulty Profiles and Deterministic Random Generation

**Files:**
- Modify: `src/contents/steroid-tile-atlas-game.test.ts`
- Modify: `src/contents/steroid-tile-atlas-game.ts`

- [ ] **Step 1: Write failing profile and variation tests**

Add imports for `LEVEL_PROFILES`, `createSeededRandom`, and `generateLevel`, then add:

```ts
it("defines five stable difficulty profiles with triple-safe totals", () => {
  assert.deepEqual(
    LEVEL_PROFILES.map(({ level, totalTiles, layers, patternCount }) => ({
      level,
      totalTiles,
      layers,
      patternCount,
    })),
    [
      { level: 1, totalTiles: 45, layers: 2, patternCount: 5 },
      { level: 2, totalTiles: 84, layers: 3, patternCount: 7 },
      { level: 3, totalTiles: 126, layers: 4, patternCount: 9 },
      { level: 4, totalTiles: 168, layers: 5, patternCount: 9 },
      { level: 5, totalTiles: 210, layers: 6, patternCount: 9 },
    ],
  );

  LEVEL_PROFILES.forEach((profile) => {
    assert.equal(profile.totalTiles % 3, 0);
    assert.equal(
      profile.boardCount + profile.reserveSizes.reduce((sum, size) => sum + size, 0),
      profile.totalTiles,
    );
  });
});

it("repeats a level for the same seed and varies it for a different seed", () => {
  const first = generateLevel(3, createSeededRandom(301));
  const repeated = generateLevel(3, createSeededRandom(301));
  const different = generateLevel(3, createSeededRandom(302));
  const signature = (game: GameState) =>
    game.boardTiles.map(({ x, y, layer, pattern }) => `${x}:${y}:${layer}:${pattern}`);

  assert.deepEqual(signature(first.game), signature(repeated.game));
  assert.notDeepEqual(signature(first.game), signature(different.game));
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run:

```bash
node --test --experimental-strip-types src/contents/steroid-tile-atlas-game.test.ts
```

Expected: FAIL because `LEVEL_PROFILES`, `createSeededRandom`, and `generateLevel` do not exist.

- [ ] **Step 3: Implement profiles and position generation**

Add these public types and constants:

```ts
export type LevelNumber = 1 | 2 | 3 | 4 | 5;
export type RandomSource = () => number;

export interface LevelProfile {
  level: LevelNumber;
  totalTiles: number;
  boardCount: number;
  layers: number;
  patternCount: number;
  reserveSizes: number[];
  toolUses: number;
}

export const LEVEL_PROFILES: LevelProfile[] = [
  { level: 1, totalTiles: 45, boardCount: 33, layers: 2, patternCount: 5, reserveSizes: [3, 3, 3, 3], toolUses: 2 },
  { level: 2, totalTiles: 84, boardCount: 60, layers: 3, patternCount: 7, reserveSizes: [6, 6, 6, 6], toolUses: 1 },
  { level: 3, totalTiles: 126, boardCount: 90, layers: 4, patternCount: 9, reserveSizes: [9, 9, 9, 9], toolUses: 1 },
  { level: 4, totalTiles: 168, boardCount: 120, layers: 5, patternCount: 9, reserveSizes: [12, 12, 12, 12], toolUses: 1 },
  { level: 5, totalTiles: 210, boardCount: 150, layers: 6, patternCount: 9, reserveSizes: [15, 15, 15, 15], toolUses: 1 },
];

export function createSeededRandom(seed: number): RandomSource {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
```

Change `shuffleList` to accept `random: RandomSource = Math.random`. Implement `generateBoardPositions(profile, random)` by building staggered candidate coordinates for every layer, shuffling candidates per layer, selecting exactly `boardCount` positions, and sorting by layer. Use half-step offsets and randomized reflection so different seeds change both topology and pattern placement.

- [ ] **Step 4: Implement level generation entry points**

Expose:

```ts
export interface GeneratedLevel {
  game: GameState;
  solutionOrder: string[];
}

export function generateLevel(
  level: LevelNumber,
  random: RandomSource = Math.random,
): GeneratedLevel;

export function createInitialGameState(
  level: LevelNumber = 1,
  random: RandomSource = Math.random,
): GameState {
  return generateLevel(level, random).game;
}
```

Create board and reserve IDs before assigning patterns. Build a legal source-removal order by repeatedly collecting uncovered board IDs plus each non-empty reserve top, selecting one with `random`, and removing it from the simulation. Assign one pattern to every consecutive group of three IDs, cycling through a shuffled subset of `TILE_PATTERNS`. Return that legal order as `solutionOrder`.

- [ ] **Step 5: Run tests and verify GREEN**

Run the Node test command. Expected: all profile and existing rule tests PASS.

- [ ] **Step 6: Commit generator work**

```bash
git add src/contents/steroid-tile-atlas-game.ts src/contents/steroid-tile-atlas-game.test.ts
git commit -m "feat: add randomized level profiles"
```

### Task 2: Make Coverage Geometry Exact

**Files:**
- Modify: `src/contents/steroid-tile-atlas-game.test.ts`
- Modify: `src/contents/steroid-tile-atlas-game.ts`

- [ ] **Step 1: Write the multi-blocker regression test**

```ts
it("keeps a lower tile blocked until every overlapping higher tile is removed", () => {
  const base: BoardTile = { id: "base", pattern: "Ring", layer: 0, x: 2, y: 2, removed: false, blockerIds: ["a", "b"] };
  const a: BoardTile = { id: "a", pattern: "P450", layer: 1, x: 3, y: 2, removed: false, blockerIds: [] };
  const b: BoardTile = { id: "b", pattern: "C27", layer: 2, x: 2, y: 3, removed: false, blockerIds: [] };

  assert.equal(isBoardTileCovered(base, [base, a, b]), true);
  assert.equal(isBoardTileCovered(base, [base, { ...a, removed: true }, b]), true);
  assert.equal(isBoardTileCovered(base, [base, { ...a, removed: true }, { ...b, removed: true }]), false);
});
```

These coordinates deliberately fail the old `< 0.9` center-distance rule while their rendered rectangles overlap.

- [ ] **Step 2: Run the test and verify RED**

Expected: the first assertion fails because the old coverage threshold misses `a` and `b`.

- [ ] **Step 3: Implement shared geometry and blocker IDs**

```ts
export const BOARD_GEOMETRY = {
  tileWidth: 1,
  tileHeight: 1,
  xStep: 0.78,
  yStep: 0.7,
} as const;

export function tilesOverlap(a: BoardTile, b: BoardTile): boolean {
  return (
    Math.abs(a.x - b.x) * BOARD_GEOMETRY.xStep < BOARD_GEOMETRY.tileWidth &&
    Math.abs(a.y - b.y) * BOARD_GEOMETRY.yStep < BOARD_GEOMETRY.tileHeight
  );
}

export function buildBlockerIds(tile: BoardTile, tiles: BoardTile[]): string[] {
  return tiles
    .filter((other) => other.layer > tile.layer && tilesOverlap(tile, other))
    .map((other) => other.id);
}

export function isBoardTileCovered(tile: BoardTile, boardTiles: BoardTile[]): boolean {
  const remainingIds = new Set(
    boardTiles.filter((candidate) => !candidate.removed).map((candidate) => candidate.id),
  );
  return tile.blockerIds.some((id) => remainingIds.has(id));
}
```

Add `blockerIds: string[]` to `BoardTile`, populate it after generating all board positions, and clone the array in snapshots.

- [ ] **Step 4: Run the full rule suite and verify GREEN**

Expected: all coverage and selection tests PASS.

- [ ] **Step 5: Commit the fix**

```bash
git add src/contents/steroid-tile-atlas-game.ts src/contents/steroid-tile-atlas-game.test.ts
git commit -m "fix: require every covering tile to clear"
```

### Task 3: Add Tool Limits, Solution Verification, and Campaign Progress Helpers

**Files:**
- Modify: `src/contents/steroid-tile-atlas-game.test.ts`
- Modify: `src/contents/steroid-tile-atlas-game.ts`

- [ ] **Step 1: Write failing behavior tests**

Add tests that assert:

```ts
it("generates a witness that clears every level", () => {
  LEVEL_PROFILES.forEach(({ level }) => {
    const { game, solutionOrder } = generateLevel(level, createSeededRandom(900 + level));
    const cleared = playSolution(game, solutionOrder);
    assert.equal(cleared.status, "won");
  });
});

it("consumes each tool allowance without replenishing undo", () => {
  const game = createInitialGameState(2, createSeededRandom(42));
  const shuffled = shuffleRemainingTiles(game, createSeededRandom(8));
  assert.equal(shuffled.toolsRemaining.shuffle, 0);
  assert.equal(shuffleRemainingTiles(shuffled), shuffled);

  const snapshot = createSnapshot(game);
  const moved = selectFirstAvailableTile(game);
  const undone = undoToSnapshot(moved, snapshot);
  assert.equal(undone.toolsRemaining.undo, 0);
});

it("unlocks only the next campaign level", () => {
  assert.equal(getNextUnlockedLevel(1, 1), 2);
  assert.equal(getNextUnlockedLevel(4, 2), 4);
  assert.equal(getNextUnlockedLevel(5, 5), 5);
});
```

Implement `playSolution` and `selectFirstAvailableTile` as test helpers using public selection functions.

- [ ] **Step 2: Run tests and verify RED**

Expected: FAIL because tool counters and progress helpers are missing.

- [ ] **Step 3: Implement counters and pure progress helpers**

Add to `GameState`:

```ts
level: LevelNumber;
toolsRemaining: {
  putAside: number;
  undo: number;
  shuffle: number;
};
```

Initialize all counters from `profile.toolUses`. Make `putAside` and `shuffleRemainingTiles` return the same object when their counter is zero, and decrement the matching counter after a successful use. Make `undoToSnapshot(current, snapshot)` restore the snapshot while setting `undo` to `current.toolsRemaining.undo - 1`, never the snapshot's earlier allowance.

Add:

```ts
export function getNextUnlockedLevel(
  highestUnlocked: LevelNumber,
  completedLevel: LevelNumber,
): LevelNumber {
  return Math.min(5, Math.max(highestUnlocked, completedLevel + 1)) as LevelNumber;
}
```

Allow `shuffleRemainingTiles` to receive an injected random source for deterministic tests.

- [ ] **Step 4: Run tests and verify GREEN**

Expected: every level witness reaches `won`, tool counters stop at zero, and all rule tests PASS.

- [ ] **Step 5: Commit state-machine work**

```bash
git add src/contents/steroid-tile-atlas-game.ts src/contents/steroid-tile-atlas-game.test.ts
git commit -m "feat: add campaign progress and tool limits"
```

### Task 4: Build the Five-Level Campaign Interface

**Files:**
- Modify: `src/contents/steroid-tile-atlas.tsx`

- [ ] **Step 1: Add level and persistence state**

Use browser-safe helpers and state initialization:

```tsx
const CAMPAIGN_STORAGE_KEY = "steroid-tile-atlas-highest-level";

function readHighestUnlocked(): LevelNumber {
  const stored = Number(window.localStorage.getItem(CAMPAIGN_STORAGE_KEY));
  return stored >= 1 && stored <= 5 ? (stored as LevelNumber) : 1;
}

const [highestUnlocked, setHighestUnlocked] = useState<LevelNumber>(readHighestUnlocked);
const [game, setGame] = useState<GameState>(() => createInitialGameState(1));
```

Guard local storage access with `typeof window !== "undefined"` so build-time evaluation remains safe.

- [ ] **Step 2: Add campaign transitions**

Add `startLevel(level)`, `handleReset()`, and `handleNextLevel()`. `startLevel` must reject locked levels, create a newly randomized state, and clear undo history. Add an effect that detects `won`, computes `getNextUnlockedLevel`, updates state, and writes the highest value to local storage.

- [ ] **Step 3: Render the compact level track**

Create a `LevelTrack` component that maps `LEVEL_PROFILES` to five stable-size buttons. Use `aria-current="step"` on the active level, disable locked levels, display completed/active/locked state visually, and label nodes `01` through `05`.

- [ ] **Step 4: Upgrade controls and results**

Show each tool's remaining count inside its button, disable it at zero, change `New game` to `New board`, and show `Next level` after wins before Level 5. Keep `Retry level` available after failure. Update the run-status panel to include current level and total tiles.

- [ ] **Step 5: Add scientific pattern pictograms without a dependency**

Extend `PATTERN_META` with `tone` and `iconParts`. Render a semantic text label plus a decorative CSS-based `PatternIcon` using nested spans. Keep the text label visible so tiles remain understandable without color or decoration.

- [ ] **Step 6: Run lint and build**

```bash
corepack yarn lint
corepack yarn build
```

Expected: both commands exit 0.

- [ ] **Step 7: Commit the campaign UI**

```bash
git add src/contents/steroid-tile-atlas.tsx
git commit -m "feat: add five-level campaign interface"
```

### Task 5: Redesign the Visual System and Responsive Board

**Files:**
- Modify: `src/contents/steroid-tile-atlas.css`
- Modify: `src/contents/steroid-tile-atlas.tsx`

- [ ] **Step 1: Replace page and campaign-header styling**

Define a functional palette with CSS custom properties for field green, ink, off-white, cyan, amber, coral, and neutral gray. Remove oversized title treatment and render the level track as the first compact row. Keep all card radii at `8px` or less.

- [ ] **Step 2: Bind visual geometry to rule geometry**

Keep these values synchronized with `BOARD_GEOMETRY`:

```css
.steroid-board {
  --tile-step-x: calc(var(--tile-width) * 0.78);
  --tile-step-y: calc(var(--tile-height) * 0.7);
}
```

Use level modifier classes to adjust only `--tile-width` and bounded board dimensions. Level 5 must fit without horizontal overflow at desktop and mobile viewports.

- [ ] **Step 3: Make covered and free states unmistakable**

```css
.steroid-tile.is-covered {
  cursor: not-allowed;
  filter: grayscale(1) brightness(0.68);
  opacity: 0.78;
  box-shadow: 0 2px 5px rgba(28, 43, 36, 0.16);
}

.steroid-tile.is-covered::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: repeating-linear-gradient(135deg, transparent 0 6px, rgba(25, 38, 31, 0.08) 6px 8px);
  pointer-events: none;
}
```

Keep free tiles at full opacity and add visible keyboard focus. Ensure disabled global styles do not reduce legibility further.

- [ ] **Step 4: Add pattern, tray, and transition states**

Give all nine tile patterns distinct cross-palette treatments. Add pictogram shapes, level-node states, tool-count badges, sixth-slot warning, seventh-slot danger, elimination/knowledge pulse hooks, and a reduced-motion media query that disables transforms and animation.

- [ ] **Step 5: Verify responsive constraints**

At `1180px`, move controls below the board in two columns. At `760px`, use one compact column, scale the board to the viewport, keep the seven slots in one row, and prevent button text from overflowing. At `390px`, hide tile detail text but retain pictograms and short labels.

- [ ] **Step 6: Run lint and build, then commit**

```bash
corepack yarn lint
corepack yarn build
git add src/contents/steroid-tile-atlas.tsx src/contents/steroid-tile-atlas.css
git commit -m "style: refine steroid campaign game board"
```

Expected: lint and build exit 0; Vite may emit only its existing chunk-size advisory.

### Task 6: Browser Verification, Regression Passes, and Deployment

**Files:**
- Verify: `src/contents/steroid-tile-atlas-game.test.ts`
- Verify: `src/contents/steroid-tile-atlas.tsx`
- Verify: `src/contents/steroid-tile-atlas.css`

- [ ] **Step 1: Run automated verification round one**

```bash
node --test --experimental-strip-types src/contents/steroid-tile-atlas-game.test.ts
corepack yarn lint
corepack yarn build
git diff --check
```

Expected: all tests PASS, lint/build exit 0, and `git diff --check` prints no errors.

- [ ] **Step 2: Start the development server**

```bash
corepack yarn dev --host 0.0.0.0
```

Use the first available port and keep the process running until browser checks finish.

- [ ] **Step 3: Browser verification round two**

At `1440x1000`, verify Level 1 load, locked level buttons, selectable-versus-gray tiles, a triple elimination, each tool counter, failure recovery, win unlock, `Next level`, revisit, and random board reset. Inspect the console for errors.

- [ ] **Step 4: Browser verification round three**

At `390x844`, verify Level 5 through a temporary local progress value, confirm 210 tiles render without blank output or incoherent overlap, confirm the tray and controls fit, and capture desktop/mobile screenshots for visual review. Remove the temporary local progress value after the check.

- [ ] **Step 5: Push and verify GitHub Pages**

Push `codex/steroid-platform-wiki`, wait for the Pages workflow to succeed, then open:

```text
https://always-070.github.io/jiangnan-china-2026-wiki-dev/#/steroid-tile-atlas
```

Verify the published page returns successfully and the campaign UI loads in a real browser.

---

## Historical Baseline Plan

The remaining sections document the completed 2026-07-06 first-version implementation and are retained only for project history. Do not execute them as part of the campaign enhancement.

## Historical Baseline File Structure

- Create `src/contents/steroid-tile-atlas.tsx`: React page component, tile data, helper functions, state machine, and rendered game UI.
- Create `src/contents/steroid-tile-atlas.css`: dense board layout, tiles, tray, reserve stacks, tool buttons, status panels, responsive rules.
- Modify `src/contents/index.tsx`: export the new content component.
- Modify `src/pages.ts`: import and register the page at `/steroid-tile-atlas`.
- Modify `src/components/Navbar.tsx`: add "Steroid Game" to the `More` navigation group.
- Modify `src/containers/App/App.tsx`: skip standard article header/container treatment for `/steroid-tile-atlas`.

## Task 1: Add the Self-Contained Game Page

**Files:**
- Create: `src/contents/steroid-tile-atlas.tsx`
- Create: `src/contents/steroid-tile-atlas.css`

- [ ] **Step 1: Create the component and type model**

Add `src/contents/steroid-tile-atlas.tsx` with these building blocks:

```tsx
import { useMemo, useState } from "react";
import "./steroid-tile-atlas.css";

type TilePattern =
  | "Ring"
  | "P450"
  | "C27"
  | "C19"
  | "C21"
  | "OH"
  | "NAD"
  | "ERG"
  | "SCO";

interface BoardTile {
  id: string;
  pattern: TilePattern;
  layer: number;
  x: number;
  y: number;
  removed: boolean;
}

interface ReserveTile {
  id: string;
  pattern: TilePattern;
}

type ReserveStacks = ReserveTile[][];
type GameStatus = "playing" | "won" | "failed";

interface MoveSnapshot {
  boardTiles: BoardTile[];
  reserveStacks: ReserveStacks;
  slot: ReserveTile[];
  aside: ReserveTile[];
  status: GameStatus;
  knowledgeIndex: number;
  lastFact: string;
  moves: number;
  eliminatedSets: number;
}

type GameState = MoveSnapshot;

const TILE_PATTERNS: TilePattern[] = [
  "Ring",
  "P450",
  "C27",
  "C19",
  "C21",
  "OH",
  "NAD",
  "ERG",
  "SCO",
];

const KNOWLEDGE_PLACEHOLDERS = [
  "待湿实验组补充：甾体骨架相关知识。",
  "待湿实验组补充：P450 催化相关知识。",
  "待湿实验组补充：前体流量相关知识。",
  "待湿实验组补充：辅因子与电子传递相关知识。",
];

export function SteroidTileAtlas() {
  const initialState = useMemo(() => createInitialGameState(), []);
  const [game, setGame] = useState<GameState>(initialState);
  const [lastSnapshot, setLastSnapshot] = useState<MoveSnapshot | null>(null);

  return (
    <main className="steroid-game-page">
      <section className="steroid-game-stage" aria-label="Steroid tile atlas game">
        <div className="steroid-game-board-shell">
          <h1>Steroid Tile Atlas</h1>
          <p>Match three steroid-production tiles while clearing the layered board.</p>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Add the initial CSS shell**

Add `src/contents/steroid-tile-atlas.css`:

```css
.steroid-game-page {
  min-height: calc(100vh - 72px);
  padding: clamp(0.75rem, 2vw, 1.4rem);
  background:
    linear-gradient(90deg, rgba(29, 91, 55, 0.07) 1px, transparent 1px),
    linear-gradient(180deg, #c8f590 0%, #b5ec7b 100%);
  background-size: 34px 34px, auto;
  color: #123a24;
}

.steroid-game-stage {
  max-width: 1440px;
  margin: 0 auto;
}

.steroid-game-board-shell {
  min-height: 42rem;
  border: 1px solid rgba(18, 58, 36, 0.16);
  border-radius: 8px;
  background: rgba(255, 254, 248, 0.45);
}
```

- [ ] **Step 3: Run build to catch type/import failures**

Run: `yarn build`

Expected: PASS or only unrelated existing warnings. If TypeScript reports unused state while the shell is incomplete, continue Task 2 immediately and re-run after state is used.

## Task 2: Generate Dense Board and Reserve Stacks

**Files:**
- Modify: `src/contents/steroid-tile-atlas.tsx`

- [ ] **Step 1: Add deterministic layout templates and deck generation**

Add these helpers below constants:

```tsx
const BOARD_LAYOUT = [
  ...Array.from({ length: 9 }, (_, index) => ({ layer: 0, x: index, y: 0 })),
  ...Array.from({ length: 9 }, (_, index) => ({ layer: 0, x: index, y: 1 })),
  ...Array.from({ length: 9 }, (_, index) => ({ layer: 0, x: index, y: 2 })),
  ...Array.from({ length: 7 }, (_, index) => ({ layer: 0, x: index + 1, y: 3 })),
  ...Array.from({ length: 6 }, (_, index) => ({ layer: 1, x: index + 1.5, y: 0.45 })),
  ...Array.from({ length: 5 }, (_, index) => ({ layer: 1, x: index + 2, y: 1.45 })),
  ...Array.from({ length: 4 }, (_, index) => ({ layer: 1, x: index + 2.5, y: 2.45 })),
  ...Array.from({ length: 3 }, (_, index) => ({ layer: 2, x: index + 3, y: 0.95 })),
  ...Array.from({ length: 3 }, (_, index) => ({ layer: 2, x: index + 3, y: 2.05 })),
];

const RESERVE_STACK_SIZES = [6, 6, 6, 6];
const TOTAL_TILE_COUNT = BOARD_LAYOUT.length + RESERVE_STACK_SIZES.reduce((sum, size) => sum + size, 0);

function createDeckPatterns(): TilePattern[] {
  const patternCount = TILE_PATTERNS.length;
  const totalTriples = TOTAL_TILE_COUNT / 3;
  const deck: TilePattern[] = [];

  for (let tripleIndex = 0; tripleIndex < totalTriples; tripleIndex += 1) {
    const pattern = TILE_PATTERNS[tripleIndex % patternCount];
    deck.push(pattern, pattern, pattern);
  }

  return shuffleList(deck);
}

function shuffleList<T>(items: T[]): T[] {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}
```

- [ ] **Step 2: Add `createInitialGameState`**

```tsx
function createInitialGameState(): GameState {
  const deck = createDeckPatterns();
  let deckIndex = 0;

  const boardTiles = BOARD_LAYOUT.map((position, index): BoardTile => {
    const pattern = deck[deckIndex];
    deckIndex += 1;

    return {
      id: `board-${index}`,
      pattern,
      layer: position.layer,
      x: position.x,
      y: position.y,
      removed: false,
    };
  });

  const reserveStacks = RESERVE_STACK_SIZES.map((stackSize, stackIndex) =>
    Array.from({ length: stackSize }, (_, tileIndex): ReserveTile => {
      const pattern = deck[deckIndex];
      deckIndex += 1;

      return {
        id: `reserve-${stackIndex}-${tileIndex}`,
        pattern,
      };
    }),
  );

  return {
    boardTiles,
    reserveStacks,
    slot: [],
    aside: [],
    status: "playing",
    knowledgeIndex: 0,
    lastFact: "消除三张相同牌后，这里会显示湿实验组补充的生物小知识。",
    moves: 0,
    eliminatedSets: 0,
  };
}
```

- [ ] **Step 3: Render the generated board and reserve stack counts**

Use this return structure in `SteroidTileAtlas` so `game.boardTiles`, `game.reserveStacks`, and `game.slot` are all exercised:

```tsx
const remainingBoardCount = game.boardTiles.filter((tile) => !tile.removed).length;
const remainingReserveCount = game.reserveStacks.reduce((sum, stack) => sum + stack.length, 0);

return (
  <main className="steroid-game-page">
    <section className="steroid-game-stage" aria-label="Steroid tile atlas game">
      <div className="steroid-game-board-shell">
        <header className="steroid-game-title">
          <span>Independent innovation page</span>
          <h1>Steroid Tile Atlas</h1>
          <p>Clear the layered steroid-production tiles before the seven-slot tray overflows.</p>
        </header>
        <div className="steroid-board" aria-label="Layered tile board">
          {game.boardTiles.map((tile) =>
            tile.removed ? null : (
              <button
                key={tile.id}
                type="button"
                className="steroid-tile"
                style={{
                  left: `calc(${tile.x} * var(--tile-step-x))`,
                  top: `calc(${tile.y} * var(--tile-step-y))`,
                  zIndex: tile.layer + 1,
                }}
              >
                {tile.pattern}
              </button>
            ),
          )}
        </div>
        <div className="steroid-slot-tray" aria-label="Seven slot tray">
          {Array.from({ length: 7 }, (_, index) => (
            <span className="steroid-slot" key={index}>
              {game.slot[index]?.pattern || ""}
            </span>
          ))}
        </div>
      </div>
      <aside className="steroid-game-panel">
        <strong>{game.status}</strong>
        <span>Board: {remainingBoardCount}</span>
        <span>Reserve: {remainingReserveCount}</span>
        <p>{game.lastFact}</p>
      </aside>
    </section>
  </main>
);
```

- [ ] **Step 4: Run build**

Run: `yarn build`

Expected: PASS.

## Task 3: Implement Coverage, Selection, and Elimination

**Files:**
- Modify: `src/contents/steroid-tile-atlas.tsx`
- Modify: `src/contents/steroid-tile-atlas.css`

- [ ] **Step 1: Add coverage and snapshot helpers**

```tsx
function isBoardTileCovered(tile: BoardTile, boardTiles: BoardTile[]) {
  return boardTiles.some((otherTile) => {
    if (otherTile.removed || otherTile.layer <= tile.layer) {
      return false;
    }

    return Math.abs(otherTile.x - tile.x) < 0.9 && Math.abs(otherTile.y - tile.y) < 0.9;
  });
}

function createSnapshot(game: GameState): MoveSnapshot {
  return {
    boardTiles: game.boardTiles.map((tile) => ({ ...tile })),
    reserveStacks: game.reserveStacks.map((stack) => stack.map((tile) => ({ ...tile }))),
    slot: game.slot.map((tile) => ({ ...tile })),
    aside: game.aside.map((tile) => ({ ...tile })),
    status: game.status,
    knowledgeIndex: game.knowledgeIndex,
    lastFact: game.lastFact,
    moves: game.moves,
    eliminatedSets: game.eliminatedSets,
  };
}
```

- [ ] **Step 2: Add slot insertion and one-time elimination**

```tsx
function addTileToSlot(game: GameState, tile: ReserveTile): GameState {
  const nextSlot = [...game.slot, tile];
  const eliminationTarget = TILE_PATTERNS.find(
    (pattern) => nextSlot.filter((slotTile) => slotTile.pattern === pattern).length >= 3,
  );

  if (!eliminationTarget) {
    return {
      ...game,
      slot: nextSlot,
      status: nextSlot.length > 7 ? "failed" : game.status,
    };
  }

  let removedCount = 0;
  const reducedSlot = nextSlot.filter((slotTile) => {
    if (slotTile.pattern !== eliminationTarget || removedCount >= 3) {
      return true;
    }

    removedCount += 1;
    return false;
  });

  const nextKnowledgeIndex = game.knowledgeIndex + 1;

  return {
    ...game,
    slot: reducedSlot,
    eliminatedSets: game.eliminatedSets + 1,
    knowledgeIndex: nextKnowledgeIndex,
    lastFact: KNOWLEDGE_PLACEHOLDERS[nextKnowledgeIndex % KNOWLEDGE_PLACEHOLDERS.length],
  };
}
```

- [ ] **Step 3: Add win resolution and click handlers for board and reserve tiles**

Add this helper outside the component:

```tsx
function resolveWinState(game: GameState): GameState {
  const boardEmpty = game.boardTiles.every((tile) => tile.removed);
  const reservesEmpty = game.reserveStacks.every((stack) => stack.length === 0);

  if (boardEmpty && reservesEmpty && game.slot.length === 0) {
    return { ...game, status: "won" };
  }

  return game;
}
```

Inside `SteroidTileAtlas`, add these handlers:

```tsx
function selectBoardTile(tileId: string) {
  setGame((current) => {
    if (current.status !== "playing") {
      return current;
    }

    const selectedTile = current.boardTiles.find((tile) => tile.id === tileId);

    if (!selectedTile || selectedTile.removed || isBoardTileCovered(selectedTile, current.boardTiles)) {
      return current;
    }

    setLastSnapshot(createSnapshot(current));

    const boardTiles = current.boardTiles.map((tile) =>
      tile.id === tileId ? { ...tile, removed: true } : tile,
    );
    const withSelectedTile = addTileToSlot(
      { ...current, boardTiles, moves: current.moves + 1 },
      { id: selectedTile.id, pattern: selectedTile.pattern },
    );

    return resolveWinState(withSelectedTile);
  });
}

function selectReserveTile(stackIndex: number) {
  setGame((current) => {
    if (current.status !== "playing") {
      return current;
    }

    const stack = current.reserveStacks[stackIndex];
    const selectedTile = stack.at(-1);

    if (!selectedTile) {
      return current;
    }

    setLastSnapshot(createSnapshot(current));

    const reserveStacks = current.reserveStacks.map((reserveStack, index) =>
      index === stackIndex ? reserveStack.slice(0, -1) : reserveStack,
    );
    const withSelectedTile = addTileToSlot(
      { ...current, reserveStacks, moves: current.moves + 1 },
      selectedTile,
    );

    return resolveWinState(withSelectedTile);
  });
}
```

- [ ] **Step 4: Style clickable and covered tiles**

Add CSS classes:

```css
.steroid-tile {
  position: absolute;
  width: var(--tile-width);
  height: var(--tile-height);
  border: 1.5px solid rgba(18, 58, 36, 0.38);
  border-radius: 8px;
  background: #fffef8;
  color: #123a24;
  box-shadow: 0 2px 0 rgba(29, 91, 55, 0.42), 0 10px 16px rgba(18, 58, 36, 0.16);
}

.steroid-tile.is-covered {
  filter: saturate(0.75) brightness(0.78);
  opacity: 0.72;
}

.steroid-tile:not(.is-covered):hover,
.steroid-reserve-top:hover {
  transform: translateY(-5px);
}
```

- [ ] **Step 5: Run build**

Run: `yarn build`

Expected: PASS.

## Task 4: Implement Tools, Reset, and Status Panels

**Files:**
- Modify: `src/contents/steroid-tile-atlas.tsx`
- Modify: `src/contents/steroid-tile-atlas.css`

- [ ] **Step 1: Add put-aside, aside-return, undo, shuffle, and reset handlers**

Inside `SteroidTileAtlas`, add these handlers:

```tsx
function putAside() {
  setGame((current) => {
    if (current.status !== "playing" || current.slot.length < 3 || current.aside.length > 0) {
      return current;
    }

    setLastSnapshot(createSnapshot(current));

    return {
      ...current,
      slot: current.slot.slice(3),
      aside: current.slot.slice(0, 3),
    };
  });
}

function returnAsideTile(tileId: string) {
  setGame((current) => {
    if (current.status !== "playing") {
      return current;
    }

    const selectedTile = current.aside.find((tile) => tile.id === tileId);

    if (!selectedTile) {
      return current;
    }

    setLastSnapshot(createSnapshot(current));

    return resolveWinState(
      addTileToSlot(
        {
          ...current,
          aside: current.aside.filter((tile) => tile.id !== tileId),
          moves: current.moves + 1,
        },
        selectedTile,
      ),
    );
  });
}

function undoMove() {
  if (!lastSnapshot) {
    return;
  }

  setGame(lastSnapshot);
  setLastSnapshot(null);
}

function shuffleRemainingTiles() {
  setGame((current) => {
    if (current.status !== "playing") {
      return current;
    }

    setLastSnapshot(createSnapshot(current));

    const remainingBoardTiles = current.boardTiles.filter((tile) => !tile.removed);
    const reserveTiles = current.reserveStacks.flat();
    const shuffledPatterns = shuffleList([
      ...remainingBoardTiles.map((tile) => tile.pattern),
      ...reserveTiles.map((tile) => tile.pattern),
    ]);
    let patternIndex = 0;

    const boardTiles = current.boardTiles.map((tile) => {
      if (tile.removed) {
        return tile;
      }

      const pattern = shuffledPatterns[patternIndex];
      patternIndex += 1;
      return { ...tile, pattern };
    });
    const reserveStacks = current.reserveStacks.map((stack) =>
      stack.map((tile) => {
        const pattern = shuffledPatterns[patternIndex];
        patternIndex += 1;
        return { ...tile, pattern };
      }),
    );

    return { ...current, boardTiles, reserveStacks };
  });
}

function resetGame() {
  setGame(createInitialGameState());
  setLastSnapshot(null);
}
```

- [ ] **Step 2: Render tools and side panel**

Side panel includes:

- status;
- moves;
- eliminated sets;
- remaining board/reserve count;
- tool buttons;
- aside area;
- last knowledge feedback.

- [ ] **Step 3: Add disabled states**

Disable:

- all tile clicks when `status !== "playing"`;
- put-aside if `slot.length < 3` or `aside.length > 0`;
- undo if no snapshot;
- shuffle if not playing.

- [ ] **Step 4: Run build**

Run: `yarn build`

Expected: PASS.

## Task 5: Register the Page and Immersive Route

**Files:**
- Modify: `src/contents/index.tsx`
- Modify: `src/pages.ts`
- Modify: `src/components/Navbar.tsx`
- Modify: `src/containers/App/App.tsx`

- [ ] **Step 1: Export the page**

Add to `src/contents/index.tsx`:

```tsx
export { SteroidTileAtlas } from "./steroid-tile-atlas.tsx";
```

- [ ] **Step 2: Register the route**

In `src/pages.ts`, import `SteroidTileAtlas` from `./contents` and add this page to the `More` folder:

```tsx
{
  name: "Steroid Game",
  title: "Steroid Tile Atlas",
  path: "/steroid-tile-atlas",
  component: SteroidTileAtlas,
  lead: "A dense interactive tile-elimination game for learning steroid biomanufacturing concepts.",
}
```

- [ ] **Step 3: Add navigation entry**

In `src/components/Navbar.tsx`, add:

```tsx
{ name: "Steroid Game", path: "/steroid-tile-atlas" },
```

to `morePath`.

- [ ] **Step 4: Skip the standard page header/container**

In `src/containers/App/App.tsx`, add `const isImmersiveGame = currentPath === "/steroid-tile-atlas";`, include it in `showStandardHeader`, and render `<Component />` directly when `path === "/steroid-tile-atlas"`.

- [ ] **Step 5: Run build**

Run: `yarn build`

Expected: PASS.

## Task 6: Browser Verification and Responsive Polish

**Files:**
- Modify: `src/contents/steroid-tile-atlas.tsx` only for defects found in the listed verification checks.
- Modify: `src/contents/steroid-tile-atlas.css` only for layout, overflow, or interaction-state defects found in the listed verification checks.

- [ ] **Step 1: Start local dev server**

Run: `yarn dev --host 127.0.0.1`

Expected: Vite prints a local URL, usually `http://127.0.0.1:5173/`.

- [ ] **Step 2: Verify desktop viewport**

Open `/steroid-tile-atlas` in the browser and check:

- dense board is visible in first viewport;
- covered cards are visibly muted;
- clicking an uncovered board tile moves it into the tray;
- clicking covered board tiles does nothing;
- reserve top cards can be selected;
- three matching tiles eliminate and update the knowledge panel;
- tool buttons work.

- [ ] **Step 3: Verify mobile viewport**

Use a narrow viewport around `390 x 844`. Check:

- board scales without text overflow;
- tray remains readable;
- side panel stacks below the board;
- buttons keep minimum touch size.

- [ ] **Step 4: Final build**

Run: `yarn build`

Expected: PASS.

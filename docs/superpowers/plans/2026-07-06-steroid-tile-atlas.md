# Steroid Tile Atlas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an independent playable steroid-themed "羊了个羊"-style tile elimination page at `/steroid-tile-atlas`.

**Architecture:** Keep the game self-contained in one React content module plus one CSS file. Use pure helper functions inside the module for deck generation, coverage checks, elimination, snapshots, aside, undo, and shuffle, then render those states through a dense game-board UI. Register the page through the existing `pages.ts`, `contents/index.tsx`, `Navbar.tsx`, and a small `App.tsx` immersive-route exception.

**Tech Stack:** React 18, TypeScript, Vite, existing Bootstrap shell, plain CSS.

---

## File Structure

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

export type TilePattern =
  | "Ring"
  | "P450"
  | "C27"
  | "C19"
  | "C21"
  | "OH"
  | "NAD"
  | "ERG"
  | "SCO";

export interface BoardTile {
  id: string;
  pattern: TilePattern;
  layer: number;
  x: number;
  y: number;
  removed: boolean;
}

export interface ReserveTile {
  id: string;
  pattern: TilePattern;
}

export type ReserveStacks = ReserveTile[][];
export type GameStatus = "playing" | "won" | "failed";

export interface GameState {
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

export type MoveSnapshot = GameState;

export const TILE_PATTERNS: TilePattern[] = [
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

export const KNOWLEDGE_PLACEHOLDERS = [
  "Wet-lab note pending: steroid scaffold knowledge.",
  "Wet-lab note pending: P450 catalysis knowledge.",
  "Wet-lab note pending: precursor flux knowledge.",
  "Wet-lab note pending: cofactor and electron-transfer knowledge.",
];

export const BOARD_LAYOUT = [
  ...Array.from({ length: 9 }, (_, index) => ({ layer: 0, x: index, y: 0 })),
  ...Array.from({ length: 9 }, (_, index) => ({ layer: 0, x: index, y: 1 })),
  ...Array.from({ length: 9 }, (_, index) => ({ layer: 0, x: index, y: 2 })),
  ...Array.from({ length: 9 }, (_, index) => ({ layer: 0, x: index, y: 3 })),
  ...Array.from({ length: 7 }, (_, index) => ({ layer: 1, x: index + 1, y: 0.5 })),
  ...Array.from({ length: 7 }, (_, index) => ({ layer: 1, x: index + 1, y: 1.5 })),
  ...Array.from({ length: 6 }, (_, index) => ({ layer: 1, x: index + 1.5, y: 2.5 })),
  ...Array.from({ length: 4 }, (_, index) => ({ layer: 2, x: index + 2.5, y: 1.05 })),
];

export const RESERVE_STACK_SIZES = [6, 6, 6, 6];

const TOTAL_TILE_COUNT =
  BOARD_LAYOUT.length +
  RESERVE_STACK_SIZES.reduce((sum, stackSize) => sum + stackSize, 0);

export function createInitialGameState(): GameState {
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
    lastFact:
      "After matching three identical tiles, this panel will show a wet-lab science note.",
    moves: 0,
    eliminatedSets: 0,
  };
}

export function createDeckPatterns(): TilePattern[] {
  const totalTriples = TOTAL_TILE_COUNT / 3;
  const deck: TilePattern[] = [];

  for (let tripleIndex = 0; tripleIndex < totalTriples; tripleIndex += 1) {
    const pattern = TILE_PATTERNS[tripleIndex % TILE_PATTERNS.length];
    deck.push(pattern, pattern, pattern);
  }

  return shuffleList(deck);
}

export function shuffleList<T>(items: T[]): T[] {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

export function isBoardTileCovered(tile: BoardTile, boardTiles: BoardTile[]) {
  return boardTiles.some((otherTile) => {
    if (otherTile.removed || otherTile.layer <= tile.layer) {
      return false;
    }

    return Math.abs(otherTile.x - tile.x) < 0.9 && Math.abs(otherTile.y - tile.y) < 0.9;
  });
}

export function createSnapshot(game: GameState): MoveSnapshot {
  return cloneGameState(game);
}

export function addTileToSlot(game: GameState, tile: ReserveTile): GameState {
  const nextSlot = [...game.slot, tile];
  const eliminationTarget = TILE_PATTERNS.find(
    (pattern) =>
      nextSlot.filter((slotTile) => slotTile.pattern === pattern).length >= 3,
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
    lastFact:
      KNOWLEDGE_PLACEHOLDERS[
        nextKnowledgeIndex % KNOWLEDGE_PLACEHOLDERS.length
      ],
  };
}

export function resolveWinState(game: GameState): GameState {
  const boardEmpty = game.boardTiles.every((tile) => tile.removed);
  const reservesEmpty = game.reserveStacks.every((stack) => stack.length === 0);

  if (boardEmpty && reservesEmpty && game.slot.length === 0) {
    return { ...game, status: "won" };
  }

  return game;
}

export function selectBoardTile(game: GameState, tileId: string): GameState {
  if (game.status !== "playing") {
    return game;
  }

  const selectedTile = game.boardTiles.find((tile) => tile.id === tileId);

  if (
    !selectedTile ||
    selectedTile.removed ||
    isBoardTileCovered(selectedTile, game.boardTiles)
  ) {
    return game;
  }

  const boardTiles = game.boardTiles.map((tile) =>
    tile.id === tileId ? { ...tile, removed: true } : tile,
  );
  const nextGame = addTileToSlot(
    { ...game, boardTiles, moves: game.moves + 1 },
    { id: selectedTile.id, pattern: selectedTile.pattern },
  );

  return resolveWinState(nextGame);
}

export function selectReserveTile(
  game: GameState,
  stackIndex: number,
): GameState {
  if (game.status !== "playing") {
    return game;
  }

  const selectedTile = game.reserveStacks[stackIndex]?.at(-1);

  if (!selectedTile) {
    return game;
  }

  const reserveStacks = game.reserveStacks.map((stack, index) =>
    index === stackIndex ? stack.slice(0, -1) : stack,
  );
  const nextGame = addTileToSlot(
    { ...game, reserveStacks, moves: game.moves + 1 },
    selectedTile,
  );

  return resolveWinState(nextGame);
}

export function putAside(game: GameState): GameState {
  if (game.status !== "playing" || game.slot.length < 3 || game.aside.length > 0) {
    return game;
  }

  return {
    ...game,
    slot: game.slot.slice(3),
    aside: game.slot.slice(0, 3),
  };
}

export function returnAsideTile(game: GameState, tileId: string): GameState {
  if (game.status !== "playing") {
    return game;
  }

  const selectedTile = game.aside.find((tile) => tile.id === tileId);

  if (!selectedTile) {
    return game;
  }

  const nextGame = addTileToSlot(
    {
      ...game,
      aside: game.aside.filter((tile) => tile.id !== tileId),
      moves: game.moves + 1,
    },
    selectedTile,
  );

  return resolveWinState(nextGame);
}

export function undoToSnapshot(
  _currentGame: GameState,
  snapshot: MoveSnapshot,
): GameState {
  return cloneGameState(snapshot);
}

export function shuffleRemainingTiles(game: GameState): GameState {
  if (game.status !== "playing") {
    return game;
  }

  const remainingBoardTiles = game.boardTiles.filter((tile) => !tile.removed);
  const reserveTiles = game.reserveStacks.flat();
  const shuffledPatterns = shuffleList([
    ...remainingBoardTiles.map((tile) => tile.pattern),
    ...reserveTiles.map((tile) => tile.pattern),
  ]);
  let patternIndex = 0;

  const boardTiles = game.boardTiles.map((tile) => {
    if (tile.removed) {
      return tile;
    }

    const pattern = shuffledPatterns[patternIndex];
    patternIndex += 1;
    return { ...tile, pattern };
  });
  const reserveStacks = game.reserveStacks.map((stack) =>
    stack.map((tile) => {
      const pattern = shuffledPatterns[patternIndex];
      patternIndex += 1;
      return { ...tile, pattern };
    }),
  );

  return {
    ...game,
    boardTiles,
    reserveStacks,
  };
}

function cloneGameState(game: GameState): GameState {
  return {
    boardTiles: game.boardTiles.map((tile) => ({ ...tile })),
    reserveStacks: game.reserveStacks.map((stack) =>
      stack.map((tile) => ({ ...tile })),
    ),
    slot: game.slot.map((tile) => ({ ...tile })),
    aside: game.aside.map((tile) => ({ ...tile })),
    status: game.status,
    knowledgeIndex: game.knowledgeIndex,
    lastFact: game.lastFact,
    moves: game.moves,
    eliminatedSets: game.eliminatedSets,
  };
}

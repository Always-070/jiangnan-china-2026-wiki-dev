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

export type LevelNumber = 1 | 2 | 3 | 4 | 5;
export type RandomSource = () => number;

export interface LevelProfile {
  readonly level: LevelNumber;
  readonly totalTiles: number;
  readonly boardCount: number;
  readonly layers: number;
  readonly patternCount: number;
  readonly reserveSizes: readonly number[];
  readonly toolUses: number;
}

interface BlockerCandidate {
  id: string;
  layer: number;
  x: number;
  y: number;
}

export interface BoardTile extends BlockerCandidate {
  pattern: TilePattern;
  removed: boolean;
  readonly blockerIds: readonly string[];
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

export const LEVEL_PROFILES: readonly LevelProfile[] = [
  {
    level: 1,
    totalTiles: 45,
    boardCount: 33,
    layers: 2,
    patternCount: 5,
    reserveSizes: [3, 3, 3, 3],
    toolUses: 2,
  },
  {
    level: 2,
    totalTiles: 84,
    boardCount: 60,
    layers: 3,
    patternCount: 7,
    reserveSizes: [6, 6, 6, 6],
    toolUses: 1,
  },
  {
    level: 3,
    totalTiles: 126,
    boardCount: 90,
    layers: 4,
    patternCount: 9,
    reserveSizes: [9, 9, 9, 9],
    toolUses: 1,
  },
  {
    level: 4,
    totalTiles: 168,
    boardCount: 120,
    layers: 5,
    patternCount: 9,
    reserveSizes: [12, 12, 12, 12],
    toolUses: 1,
  },
  {
    level: 5,
    totalTiles: 210,
    boardCount: 150,
    layers: 6,
    patternCount: 9,
    reserveSizes: [15, 15, 15, 15],
    toolUses: 1,
  },
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

interface BoardPosition {
  layer: number;
  x: number;
  y: number;
}

interface BoardIdentity extends BlockerCandidate {
  readonly blockerIds: readonly string[];
}

export interface GeneratedLevel {
  game: GameState;
  solutionOrder: string[];
}

const BOARD_COLUMNS = 10;

export const BOARD_FOOTPRINT = {
  minX: 0,
  maxX: BOARD_COLUMNS - 0.5,
  minY: 0,
  maxY: 3.5,
} as const;

export const BOARD_GEOMETRY = {
  tileWidth: 1,
  tileHeight: 1,
  xStep: 0.78,
  yStep: 0.7,
} as const;

function rectanglesOverlap(
  a: Pick<BlockerCandidate, "x" | "y">,
  b: Pick<BlockerCandidate, "x" | "y">,
): boolean {
  const horizontalDistance = Math.abs(a.x - b.x) * BOARD_GEOMETRY.xStep;
  const verticalDistance = Math.abs(a.y - b.y) * BOARD_GEOMETRY.yStep;

  return (
    horizontalDistance < BOARD_GEOMETRY.tileWidth &&
    verticalDistance < BOARD_GEOMETRY.tileHeight
  );
}

function buildBlockerIdsFromCandidates(
  tile: BlockerCandidate,
  tiles: readonly BlockerCandidate[],
): readonly string[] {
  return tiles
    .filter(
      (otherTile) =>
        otherTile.layer > tile.layer && rectanglesOverlap(tile, otherTile),
    )
    .map((otherTile) => otherTile.id);
}

export function tilesOverlap(a: BoardTile, b: BoardTile): boolean {
  return rectanglesOverlap(a, b);
}

export function buildBlockerIds(
  tile: BoardTile,
  tiles: readonly BoardTile[],
): readonly string[] {
  return buildBlockerIdsFromCandidates(tile, tiles);
}

export function createSeededRandom(seed: number): RandomSource {
  let state = seed >>> 0;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function generateLevel(
  level: LevelNumber,
  random: RandomSource = Math.random,
): GeneratedLevel {
  const profile = LEVEL_PROFILES.find((candidate) => candidate.level === level);

  if (!profile) {
    throw new RangeError(`Unknown level: ${level}`);
  }

  const boardPositions = generateBoardPositions(profile, random).map(
    (position, index): BlockerCandidate => ({
      id: `board-${index}`,
      ...position,
    }),
  );
  const boardIdentities = boardPositions.map(
    (tile): BoardIdentity => ({
      ...tile,
      blockerIds: buildBlockerIdsFromCandidates(tile, boardPositions),
    }),
  );
  const reserveIdentities = profile.reserveSizes.map((stackSize, stackIndex) =>
    Array.from(
      { length: stackSize },
      (_, tileIndex) => `reserve-${stackIndex}-${tileIndex}`,
    ),
  );
  const solutionOrder = createSolutionOrder(
    boardIdentities,
    reserveIdentities,
    random,
  );
  const patternById = assignPatternsToSolution(solutionOrder, profile, random);
  const boardTiles = boardIdentities.map(
    (tile): BoardTile => ({
      ...tile,
      pattern: requirePattern(patternById, tile.id),
      removed: false,
    }),
  );
  const reserveStacks = reserveIdentities.map((stack) =>
    stack.map(
      (id): ReserveTile => ({ id, pattern: requirePattern(patternById, id) }),
    ),
  );

  return {
    game: {
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
    },
    solutionOrder,
  };
}

export function createInitialGameState(
  level: LevelNumber = 1,
  random: RandomSource = Math.random,
): GameState {
  return generateLevel(level, random).game;
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

export function shuffleList<T>(
  items: T[],
  random: RandomSource = Math.random,
): T[] {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

function generateBoardPositions(
  profile: LevelProfile,
  random: RandomSource,
): BoardPosition[] {
  const baseLayerCount = Math.floor(profile.boardCount / profile.layers);
  const extraLayerCount = profile.boardCount % profile.layers;
  const maxLayerCount = baseLayerCount + (extraLayerCount > 0 ? 1 : 0);
  const rows = Math.ceil(maxLayerCount / BOARD_COLUMNS) + 1;

  if (rows - 0.5 > BOARD_FOOTPRINT.maxY) {
    throw new RangeError(`Level ${profile.level} exceeds the board footprint`);
  }

  const reflectX = random() < 0.5;
  const reflectY = random() < 0.5;
  const positions: BoardPosition[] = [];

  for (let layer = 0; layer < profile.layers; layer += 1) {
    const layerCount = baseLayerCount + (layer < extraLayerCount ? 1 : 0);
    const candidates: BoardPosition[] = [];

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < BOARD_COLUMNS; column += 1) {
        const rawX = column + ((row + layer) % 2 === 0 ? 0 : 0.5);
        const rawY = row + (layer % 2 === 0 ? 0 : 0.5);

        candidates.push({
          layer,
          x: reflectX ? BOARD_FOOTPRINT.maxX - rawX : rawX,
          y: reflectY ? rows - 0.5 - rawY : rawY,
        });
      }
    }

    positions.push(...shuffleList(candidates, random).slice(0, layerCount));
  }

  return positions.sort((a, b) => a.layer - b.layer);
}

function createSolutionOrder(
  boardTiles: readonly BoardIdentity[],
  reserveStacks: readonly (readonly string[])[],
  random: RandomSource,
): string[] {
  const remainingBoardIds = new Set(boardTiles.map((tile) => tile.id));
  const remainingReserveStacks = reserveStacks.map((stack) => [...stack]);
  const solutionOrder: string[] = [];

  while (
    remainingBoardIds.size > 0 ||
    remainingReserveStacks.some((stack) => stack.length > 0)
  ) {
    const availableIds = boardTiles
      .filter(
        (tile) =>
          remainingBoardIds.has(tile.id) &&
          !tile.blockerIds.some((blockerId) =>
            remainingBoardIds.has(blockerId),
          ),
      )
      .map((tile) => tile.id);

    remainingReserveStacks.forEach((stack) => {
      const topId = stack.at(-1);

      if (topId) {
        availableIds.push(topId);
      }
    });

    const selectedId = chooseRandomItem(availableIds, random);
    solutionOrder.push(selectedId);

    if (remainingBoardIds.delete(selectedId)) {
      continue;
    }

    const reserveStack = remainingReserveStacks.find(
      (stack) => stack.at(-1) === selectedId,
    );

    if (!reserveStack) {
      throw new Error(`Generated tile is not removable: ${selectedId}`);
    }

    reserveStack.pop();
  }

  return solutionOrder;
}

function assignPatternsToSolution(
  solutionOrder: string[],
  profile: LevelProfile,
  random: RandomSource,
): Map<string, TilePattern> {
  const activePatterns = shuffleList(TILE_PATTERNS, random).slice(
    0,
    profile.patternCount,
  );
  const patternById = new Map<string, TilePattern>();

  for (let start = 0; start < solutionOrder.length; start += 3) {
    const pattern = activePatterns[(start / 3) % activePatterns.length];

    if (!pattern) {
      throw new Error(`No pattern available for level ${profile.level}`);
    }

    solutionOrder.slice(start, start + 3).forEach((id) => {
      patternById.set(id, pattern);
    });
  }

  return patternById;
}

function chooseRandomItem<T>(items: T[], random: RandomSource): T {
  const index = Math.floor(random() * items.length);
  const item = items[index];

  if (item === undefined) {
    throw new Error("Cannot choose from an empty generated tile pool");
  }

  return item;
}

function requirePattern(
  patternById: Map<string, TilePattern>,
  id: string,
): TilePattern {
  const pattern = patternById.get(id);

  if (!pattern) {
    throw new Error(`Missing generated pattern for tile: ${id}`);
  }

  return pattern;
}

export function isBoardTileCovered(
  tile: BoardTile,
  boardTiles: readonly BoardTile[],
) {
  const activeTileIds = new Set(
    boardTiles.filter((otherTile) => !otherTile.removed).map((tile) => tile.id),
  );

  return tile.blockerIds.some((blockerId) => activeTileIds.has(blockerId));
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
    boardTiles: game.boardTiles.map((tile) => ({
      ...tile,
      blockerIds: [...tile.blockerIds],
    })),
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

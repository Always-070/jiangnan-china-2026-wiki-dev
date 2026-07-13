import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  BOARD_FOOTPRINT,
  LEVEL_PROFILES,
  addTileToSlot,
  createInitialGameState,
  createSeededRandom,
  createSnapshot,
  generateLevel,
  isBoardTileCovered,
  putAside,
  returnAsideTile,
  selectBoardTile,
  selectReserveTile,
  shuffleRemainingTiles,
  undoToSnapshot,
} from "./steroid-tile-atlas-game.ts";

describe("steroid tile atlas level generation", () => {
  it("defines five exact difficulty profiles", () => {
    assert.deepEqual(LEVEL_PROFILES, [
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
    ]);
  });

  it("keeps every profile total triple-safe and exact", () => {
    LEVEL_PROFILES.forEach((profile) => {
      assert.equal(profile.totalTiles % 3, 0);
      assert.equal(
        profile.boardCount +
          profile.reserveSizes.reduce((sum, size) => sum + size, 0),
        profile.totalTiles,
      );
    });
  });

  it("generates the exact bounded structure for every profile", () => {
    LEVEL_PROFILES.forEach((profile) => {
      const { game } = generateLevel(
        profile.level,
        createSeededRandom(700 + profile.level),
      );
      const ids = [
        ...game.boardTiles.map((tile) => tile.id),
        ...game.reserveStacks.flat().map((tile) => tile.id),
      ];

      assert.equal(game.boardTiles.length, profile.boardCount);
      assert.deepEqual(
        game.reserveStacks.map((stack) => stack.length),
        profile.reserveSizes,
      );
      assert.equal(ids.length, profile.totalTiles);
      assert.equal(new Set(ids).size, ids.length);

      game.boardTiles.forEach((tile) => {
        assert.equal(Number.isInteger(tile.layer), true);
        assert.ok(tile.layer >= 0 && tile.layer < profile.layers);
        assert.equal(Number.isFinite(tile.x), true);
        assert.equal(Number.isFinite(tile.y), true);
        assert.ok(
          tile.x >= BOARD_FOOTPRINT.minX &&
            tile.x <= BOARD_FOOTPRINT.maxX,
        );
        assert.ok(
          tile.y >= BOARD_FOOTPRINT.minY &&
            tile.y <= BOARD_FOOTPRINT.maxY,
        );
      });
    });
  });

  it("repeats entire generated levels and varies combined signatures", () => {
    LEVEL_PROFILES.forEach((profile) => {
      const seed = 300 + profile.level;
      const first = generateLevel(profile.level, createSeededRandom(seed));
      const repeated = generateLevel(profile.level, createSeededRandom(seed));
      const different = generateLevel(
        profile.level,
        createSeededRandom(seed + 100),
      );
      const combinedSignature = ({ game, solutionOrder }: typeof first) => ({
        board: game.boardTiles,
        reserves: game.reserveStacks,
        solutionOrder,
      });

      assert.deepEqual(first, repeated);
      assert.notDeepEqual(
        combinedSignature(first),
        combinedSignature(different),
      );
    });
  });

  it("uses exactly the configured pattern count in triple-safe quantities", () => {
    LEVEL_PROFILES.forEach((profile) => {
      const { game } = generateLevel(
        profile.level,
        createSeededRandom(900 + profile.level),
      );
      const patterns = [
        ...game.boardTiles.map((tile) => tile.pattern),
        ...game.reserveStacks.flat().map((tile) => tile.pattern),
      ];
      const counts = new Map<string, number>();

      patterns.forEach((pattern) => {
        counts.set(pattern, (counts.get(pattern) || 0) + 1);
      });

      assert.equal(patterns.length, profile.totalTiles);
      assert.equal(counts.size, profile.patternCount);
      counts.forEach((count) => assert.equal(count % 3, 0));
    });
  });

  it("returns a legal removal order covering every generated ID", () => {
    const { game, solutionOrder } = generateLevel(5, createSeededRandom(505));
    const remainingBoardIds = new Set(game.boardTiles.map((tile) => tile.id));
    const reserveStacks = game.reserveStacks.map((stack) => [...stack]);

    solutionOrder.forEach((tileId) => {
      const boardTile = game.boardTiles.find((tile) => tile.id === tileId);

      if (boardTile) {
        const simulatedBoard = game.boardTiles.map((tile) => ({
          ...tile,
          removed: !remainingBoardIds.has(tile.id),
        }));
        const simulatedTile = simulatedBoard.find((tile) => tile.id === tileId);

        assert.ok(simulatedTile);
        assert.equal(remainingBoardIds.has(tileId), true);
        assert.equal(isBoardTileCovered(simulatedTile, simulatedBoard), false);
        remainingBoardIds.delete(tileId);
        return;
      }

      const stackIndex = reserveStacks.findIndex(
        (stack) => stack.at(-1)?.id === tileId,
      );
      assert.notEqual(stackIndex, -1);
      reserveStacks[stackIndex].pop();
    });

    assert.equal(solutionOrder.length, LEVEL_PROFILES[4].totalTiles);
    assert.equal(remainingBoardIds.size, 0);
    assert.equal(reserveStacks.every((stack) => stack.length === 0), true);
  });
});

describe("steroid tile atlas game rules", () => {
  it("creates a dense deck whose patterns can theoretically be eliminated in triples", () => {
    const game = createInitialGameState();
    const patterns = [
      ...game.boardTiles.map((tile) => tile.pattern),
      ...game.reserveStacks.flat().map((tile) => tile.pattern),
    ];
    const counts = new Map<string, number>();

    patterns.forEach((pattern) => {
      counts.set(pattern, (counts.get(pattern) || 0) + 1);
    });

    assert.equal(patterns.length % 3, 0);
    counts.forEach((count) => assert.equal(count % 3, 0));
  });

  it("treats a lower tile as covered when a higher unremoved tile overlaps its center", () => {
    const base = {
      id: "base",
      pattern: "Ring" as const,
      layer: 0,
      x: 2,
      y: 2,
      removed: false,
    };
    const cover = {
      id: "cover",
      pattern: "P450" as const,
      layer: 1,
      x: 2.4,
      y: 2.4,
      removed: false,
    };

    assert.equal(isBoardTileCovered(base, [base, cover]), true);
    assert.equal(isBoardTileCovered(cover, [base, cover]), false);
  });

  it("eliminates exactly one matching triple after a tile enters the tray", () => {
    const game = {
      ...createInitialGameState(),
      slot: [
        { id: "slot-1", pattern: "OH" as const },
        { id: "slot-2", pattern: "P450" as const },
        { id: "slot-3", pattern: "OH" as const },
        { id: "slot-4", pattern: "Ring" as const },
      ],
      knowledgeIndex: 0,
      eliminatedSets: 0,
    };

    const next = addTileToSlot(game, { id: "new", pattern: "OH" });

    assert.deepEqual(
      next.slot.map((tile) => tile.pattern),
      ["P450", "Ring"],
    );
    assert.equal(next.eliminatedSets, 1);
    assert.match(next.lastFact, /Wet-lab note pending/);
  });

  it("only allows uncovered board tiles and top reserve tiles to enter the tray", () => {
    const game = {
      ...createInitialGameState(),
      boardTiles: [
        { id: "base", pattern: "Ring" as const, layer: 0, x: 0, y: 0, removed: false },
        { id: "cover", pattern: "P450" as const, layer: 1, x: 0.4, y: 0.4, removed: false },
      ],
      reserveStacks: [[{ id: "bottom", pattern: "C27" as const }, { id: "top", pattern: "OH" as const }]],
      slot: [],
    };

    const coveredAttempt = selectBoardTile(game, "base");
    assert.equal(coveredAttempt.slot.length, 0);
    assert.equal(coveredAttempt.boardTiles[0].removed, false);

    const uncoveredAttempt = selectBoardTile(game, "cover");
    assert.deepEqual(uncoveredAttempt.slot.map((tile) => tile.id), ["cover"]);

    const reserveAttempt = selectReserveTile(uncoveredAttempt, 0);
    assert.deepEqual(reserveAttempt.slot.map((tile) => tile.id), ["cover", "top"]);
    assert.deepEqual(reserveAttempt.reserveStacks[0].map((tile) => tile.id), ["bottom"]);
  });

  it("moves the first three tray cards aside, returns one through the tray, and can undo to a snapshot", () => {
    const game = {
      ...createInitialGameState(),
      slot: [
        { id: "a", pattern: "Ring" as const },
        { id: "b", pattern: "P450" as const },
        { id: "c", pattern: "C27" as const },
        { id: "d", pattern: "OH" as const },
      ],
      aside: [],
    };
    const snapshot = createSnapshot(game);
    const asideGame = putAside(game);

    assert.deepEqual(asideGame.aside.map((tile) => tile.id), ["a", "b", "c"]);
    assert.deepEqual(asideGame.slot.map((tile) => tile.id), ["d"]);

    const returned = returnAsideTile(asideGame, "b");
    assert.deepEqual(returned.aside.map((tile) => tile.id), ["a", "c"]);
    assert.deepEqual(returned.slot.map((tile) => tile.id), ["d", "b"]);

    assert.deepEqual(undoToSnapshot(returned, snapshot).slot.map((tile) => tile.id), [
      "a",
      "b",
      "c",
      "d",
    ]);
  });

  it("shuffles remaining board and reserve patterns without changing tray or aside patterns", () => {
    const game = {
      ...createInitialGameState(),
      slot: [{ id: "slot", pattern: "Ring" as const }],
      aside: [{ id: "aside", pattern: "P450" as const }],
    };
    const beforePool = [
      ...game.boardTiles.filter((tile) => !tile.removed).map((tile) => tile.pattern),
      ...game.reserveStacks.flat().map((tile) => tile.pattern),
    ].sort();
    const shuffled = shuffleRemainingTiles(game);
    const afterPool = [
      ...shuffled.boardTiles.filter((tile) => !tile.removed).map((tile) => tile.pattern),
      ...shuffled.reserveStacks.flat().map((tile) => tile.pattern),
    ].sort();

    assert.deepEqual(afterPool, beforePool);
    assert.deepEqual(shuffled.slot, game.slot);
    assert.deepEqual(shuffled.aside, game.aside);
  });
});

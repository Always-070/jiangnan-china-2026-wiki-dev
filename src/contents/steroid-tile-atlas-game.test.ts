import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  addTileToSlot,
  createInitialGameState,
  createSnapshot,
  isBoardTileCovered,
  putAside,
  returnAsideTile,
  selectBoardTile,
  selectReserveTile,
  shuffleRemainingTiles,
  undoToSnapshot,
} from "./steroid-tile-atlas-game.ts";

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

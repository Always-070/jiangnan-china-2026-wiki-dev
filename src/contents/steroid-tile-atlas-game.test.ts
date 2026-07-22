import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  type BoardTile,
  BOARD_FOOTPRINT,
  BOARD_GEOMETRY,
  LEVEL_PROFILES,
  addTileToSlot,
  buildBlockerIds,
  createInitialGameState,
  createSeededRandom,
  createSnapshot,
  generateLevel,
  getNextUnlockedLevel,
  isBoardTileCovered,
  putAside,
  returnAsideTile,
  selectBoardTile,
  selectReserveTile,
  shuffleList,
  shuffleRemainingTiles,
  tilesOverlap,
  undoToSnapshot,
} from "./steroid-tile-atlas-game.ts";

const rendererSource = readFileSync(
  new URL("./steroid-tile-atlas.tsx", import.meta.url),
  "utf8",
);
const rendererStyles = readFileSync(
  new URL("./steroid-tile-atlas.css", import.meta.url),
  "utf8",
);

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

  it("initializes every level with its exact campaign and tool allowances", () => {
    LEVEL_PROFILES.forEach((profile) => {
      const generated = generateLevel(
        profile.level,
        createSeededRandom(1000 + profile.level),
      ).game;
      const initial = createInitialGameState(
        profile.level,
        createSeededRandom(1000 + profile.level),
      );
      const expectedTools = {
        putAside: profile.toolUses,
        undo: profile.toolUses,
        shuffle: profile.toolUses,
      };

      assert.equal(generated.level, profile.level);
      assert.deepEqual(generated.toolsRemaining, expectedTools);
      assert.equal(initial.level, profile.level);
      assert.deepEqual(initial.toolsRemaining, expectedTools);
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

  it("replays every generated solution through the public selection API", () => {
    LEVEL_PROFILES.forEach((profile) => {
      const generated = generateLevel(
        profile.level,
        createSeededRandom(500 + profile.level),
      );
      let game = generated.game;

      generated.solutionOrder.forEach((tileId) => {
        const boardTile = game.boardTiles.find((tile) => tile.id === tileId);
        const previousMoves = game.moves;

        if (boardTile) {
          game = selectBoardTile(game, tileId);
          assert.equal(game.moves, previousMoves + 1, tileId);
          assert.equal(
            game.boardTiles.find((tile) => tile.id === tileId)?.removed,
            true,
            tileId,
          );
          return;
        }

        const stackIndex = game.reserveStacks.findIndex(
          (stack) => stack.at(-1)?.id === tileId,
        );
        assert.notEqual(stackIndex, -1, tileId);
        const previousLength = game.reserveStacks[stackIndex].length;

        game = selectReserveTile(game, stackIndex);
        assert.equal(game.moves, previousMoves + 1, tileId);
        assert.equal(
          game.reserveStacks[stackIndex].length,
          previousLength - 1,
          tileId,
        );
      });

      assert.equal(generated.solutionOrder.length, profile.totalTiles);
      assert.equal(game.status, "won", `level ${profile.level}`);
    });
  });
});

describe("steroid tile atlas game rules", () => {
  it("shares board geometry factors with the renderer", () => {
    assert.match(rendererSource, /BOARD_GEOMETRY\.xStep/);
    assert.match(rendererSource, /BOARD_GEOMETRY\.yStep/);
    assert.match(rendererSource, /--tile-step-x/);
    assert.match(rendererSource, /--tile-step-y/);
    assert.match(rendererStyles, /var\(--tile-step-x\)/);
    assert.match(rendererStyles, /var\(--tile-step-y\)/);
    assert.doesNotMatch(
      rendererStyles,
      new RegExp(`--tile-step-x\\s*:[^;]+${BOARD_GEOMETRY.xStep}`),
    );
    assert.doesNotMatch(
      rendererStyles,
      new RegExp(`--tile-step-y\\s*:[^;]+${BOARD_GEOMETRY.yStep}`),
    );
  });

  it("exposes blocker IDs as an immutable graph", () => {
    const tile: BoardTile = {
      id: "readonly",
      pattern: "Ring",
      layer: 0,
      x: 0,
      y: 0,
      removed: false,
      blockerIds: [],
    };

    const mutateBlockers = () => {
      // @ts-expect-error BoardTile blocker graphs are immutable.
      tile.blockerIds.push("other");
    };

    assert.equal(typeof mutateBlockers, "function");
    assert.deepEqual(tile.blockerIds, []);
  });

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
      blockerIds: ["cover"],
    };
    const cover = {
      id: "cover",
      pattern: "P450" as const,
      layer: 1,
      x: 2.4,
      y: 2.4,
      removed: false,
      blockerIds: [],
    };

    assert.equal(isBoardTileCovered(base, [base, cover]), true);
    assert.equal(isBoardTileCovered(cover, [base, cover]), false);
  });

  it("keeps a tile covered until every rendered blocker is removed", () => {
    const baseCandidate = {
      id: "base",
      pattern: "Ring" as const,
      layer: 0,
      x: 2,
      y: 2,
      removed: false,
      blockerIds: [],
    };
    const blockerA = {
      id: "blocker-a",
      pattern: "P450" as const,
      layer: 1,
      x: 3,
      y: 2,
      removed: false,
      blockerIds: [],
    };
    const blockerB = {
      id: "blocker-b",
      pattern: "C27" as const,
      layer: 2,
      x: 2,
      y: 3,
      removed: false,
      blockerIds: [],
    };
    const blockerIds = buildBlockerIds(baseCandidate, [
      baseCandidate,
      blockerA,
      blockerB,
    ]);
    const base = { ...baseCandidate, blockerIds };

    assert.deepEqual(blockerIds, ["blocker-a", "blocker-b"]);

    assert.equal(isBoardTileCovered(base, [base, blockerA, blockerB]), true);
    assert.equal(
      isBoardTileCovered(base, [base, { ...blockerA, removed: true }, blockerB]),
      true,
    );
    assert.equal(
      isBoardTileCovered(base, [
        base,
        { ...blockerA, removed: true },
        { ...blockerB, removed: true },
      ]),
      false,
    );
  });

  it("uses rendered rectangle geometry with strict non-overlap at touching edges", () => {
    const base = {
      id: "base",
      pattern: "Ring" as const,
      layer: 0,
      x: 0,
      y: 0,
      removed: false,
      blockerIds: [],
    };

    assert.equal(tilesOverlap(base, { ...base, id: "x-overlap", x: 1 }), true);
    assert.equal(tilesOverlap(base, { ...base, id: "y-overlap", y: 1 }), true);
    assert.equal(
      tilesOverlap(base, {
        ...base,
        id: "x-touching",
        x: BOARD_GEOMETRY.tileWidth / BOARD_GEOMETRY.xStep,
      }),
      false,
    );
    assert.equal(
      tilesOverlap(base, {
        ...base,
        id: "y-touching",
        y: BOARD_GEOMETRY.tileHeight / BOARD_GEOMETRY.yStep,
      }),
      false,
    );
  });

  it("builds blockers from every overlapping tile that renders above", () => {
    const base = {
      id: "base",
      pattern: "Ring" as const,
      layer: 1,
      x: 2,
      y: 2,
      removed: false,
      blockerIds: [],
    };
    const higher = {
      ...base,
      id: "higher",
      layer: 2,
      x: 3,
      removed: true,
    };
    const sameLayer = { ...base, id: "same-layer", x: 3 };
    const lower = { ...base, id: "lower", layer: 0, y: 3 };
    const touching = {
      ...base,
      id: "touching",
      layer: 3,
      x: base.x + BOARD_GEOMETRY.tileWidth / BOARD_GEOMETRY.xStep,
    };

    assert.deepEqual(
      buildBlockerIds(base, [base, higher, sameLayer, lower, touching]),
      ["higher", "same-layer"],
    );

    assert.deepEqual(
      buildBlockerIds(sameLayer, [base, higher, sameLayer, lower, touching]),
      ["higher", "touching"],
    );
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
        { id: "base", pattern: "Ring" as const, layer: 0, x: 0, y: 0, removed: false, blockerIds: ["cover"] },
        { id: "cover", pattern: "P450" as const, layer: 1, x: 0.4, y: 0.4, removed: false, blockerIds: [] },
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

    assert.notStrictEqual(
      snapshot.boardTiles[0].blockerIds,
      game.boardTiles[0].blockerIds,
    );

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

  it("spends one put-aside use and leaves the other tool counters unchanged", () => {
    const game = {
      ...createInitialGameState(),
      slot: [
        { id: "a", pattern: "Ring" as const },
        { id: "b", pattern: "P450" as const },
        { id: "c", pattern: "C27" as const },
        { id: "d", pattern: "OH" as const },
      ],
    };

    const next = putAside(game);

    assert.deepEqual(next.slot.map((tile) => tile.id), ["d"]);
    assert.deepEqual(next.aside.map((tile) => tile.id), ["a", "b", "c"]);
    assert.deepEqual(next.toolsRemaining, {
      putAside: 1,
      undo: 2,
      shuffle: 2,
    });
    assert.notStrictEqual(next.toolsRemaining, game.toolsRemaining);
  });

  it("does not spend put-aside uses on rejected attempts", () => {
    const game = createInitialGameState();
    const tooShortGame = {
      ...game,
      slot: [
        { id: "a", pattern: "Ring" as const },
        { id: "b", pattern: "P450" as const },
      ],
    };
    const occupiedGame = {
      ...game,
      slot: [
        { id: "a", pattern: "Ring" as const },
        { id: "b", pattern: "P450" as const },
        { id: "c", pattern: "C27" as const },
      ],
      aside: [{ id: "aside", pattern: "OH" as const }],
    };
    const notPlayingGame = {
      ...game,
      status: "won" as const,
      slot: [
        { id: "a", pattern: "Ring" as const },
        { id: "b", pattern: "P450" as const },
        { id: "c", pattern: "C27" as const },
      ],
    };

    assert.strictEqual(putAside(tooShortGame), tooShortGame);
    assert.strictEqual(putAside(occupiedGame), occupiedGame);
    assert.strictEqual(putAside(notPlayingGame), notPlayingGame);
  });

  it("returns the same game when no put-aside uses remain", () => {
    const game = {
      ...createInitialGameState(),
      slot: [
        { id: "a", pattern: "Ring" as const },
        { id: "b", pattern: "P450" as const },
        { id: "c", pattern: "C27" as const },
      ],
      toolsRemaining: { putAside: 0, undo: 2, shuffle: 2 },
    };

    assert.strictEqual(putAside(game), game);
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

  it("uses seeded randomness once while preserving shuffle geometry and tile identity", () => {
    const game = {
      ...createInitialGameState(2, createSeededRandom(44)),
      slot: [{ id: "slot", pattern: "Ring" as const }],
      aside: [{ id: "aside", pattern: "P450" as const }],
    };
    const boardIdentity = game.boardTiles.map(
      ({ id, layer, x, y, removed, blockerIds }) => ({
        id,
        layer,
        x,
        y,
        removed,
        blockerIds,
      }),
    );
    const reserveIds = game.reserveStacks.map((stack) =>
      stack.map((tile) => tile.id),
    );
    const beforePool = [
      ...game.boardTiles
        .filter((tile) => !tile.removed)
        .map((tile) => tile.pattern),
      ...game.reserveStacks.flat().map((tile) => tile.pattern),
    ];
    const expectedPatterns = shuffleList(
      beforePool,
      createSeededRandom(91),
    );

    const shuffled = shuffleRemainingTiles(game, createSeededRandom(91));
    const repeated = shuffleRemainingTiles(game, createSeededRandom(91));
    const afterPool = [
      ...shuffled.boardTiles
        .filter((tile) => !tile.removed)
        .map((tile) => tile.pattern),
      ...shuffled.reserveStacks.flat().map((tile) => tile.pattern),
    ];

    assert.deepEqual(shuffled, repeated);
    assert.deepEqual(afterPool, expectedPatterns);
    assert.deepEqual([...afterPool].sort(), [...beforePool].sort());
    assert.deepEqual(
      shuffled.boardTiles.map(
        ({ id, layer, x, y, removed, blockerIds }) => ({
          id,
          layer,
          x,
          y,
          removed,
          blockerIds,
        }),
      ),
      boardIdentity,
    );
    assert.deepEqual(
      shuffled.reserveStacks.map((stack) => stack.map((tile) => tile.id)),
      reserveIds,
    );
    assert.deepEqual(shuffled.slot, game.slot);
    assert.deepEqual(shuffled.aside, game.aside);
    assert.deepEqual(shuffled.toolsRemaining, {
      putAside: 1,
      undo: 1,
      shuffle: 0,
    });
  });

  it("returns the same game when no shuffle uses remain", () => {
    const game = {
      ...createInitialGameState(),
      toolsRemaining: { putAside: 2, undo: 2, shuffle: 0 },
    };

    assert.strictEqual(shuffleRemainingTiles(game, createSeededRandom(5)), game);
  });

  it("returns the same unchanged game when shuffling a completed state", () => {
    (["failed", "won"] as const).forEach((status, index) => {
      const game = {
        ...createInitialGameState(1, createSeededRandom(120 + index)),
        status,
        toolsRemaining: { putAside: 2, undo: 2, shuffle: 2 },
      };
      const before = structuredClone(game);

      const rejected = shuffleRemainingTiles(
        game,
        createSeededRandom(220 + index),
      );

      assert.strictEqual(rejected, game, status);
      assert.equal(rejected.toolsRemaining.shuffle, 2, status);
      assert.deepEqual(rejected, before, status);
      assert.deepEqual(game, before, status);
    });
  });

  it("clones snapshot tool counters into a separate object", () => {
    const game = createInitialGameState();
    const snapshot = createSnapshot(game);

    assert.deepEqual(snapshot.toolsRemaining, game.toolsRemaining);
    assert.notStrictEqual(snapshot.toolsRemaining, game.toolsRemaining);
  });

  it("undoes a failed move using the current allowance without replenishing undo", () => {
    const original = {
      ...createInitialGameState(),
      slot: [{ id: "before-slot", pattern: "Ring" as const }],
      aside: [{ id: "before-aside", pattern: "P450" as const }],
    };
    const snapshot = createSnapshot(original);
    const current = {
      ...original,
      boardTiles: original.boardTiles.map((tile, index) =>
        index === 0 ? { ...tile, removed: true } : tile,
      ),
      reserveStacks: original.reserveStacks.map((stack, index) =>
        index === 0 ? stack.slice(0, -1) : stack,
      ),
      slot: Array.from({ length: 8 }, (_, index) => ({
        id: `overflow-${index}`,
        pattern: "C27" as const,
      })),
      aside: [],
      status: "failed" as const,
      toolsRemaining: { putAside: 0, undo: 1, shuffle: 0 },
    };
    const currentBefore = structuredClone(current);
    const snapshotBefore = structuredClone(snapshot);

    const restored = undoToSnapshot(current, snapshot);

    assert.deepEqual(restored.boardTiles, snapshot.boardTiles);
    assert.deepEqual(restored.reserveStacks, snapshot.reserveStacks);
    assert.deepEqual(restored.slot, snapshot.slot);
    assert.deepEqual(restored.aside, snapshot.aside);
    assert.equal(restored.status, "playing");
    assert.deepEqual(restored.toolsRemaining, {
      putAside: 2,
      undo: 0,
      shuffle: 2,
    });
    assert.deepEqual(current, currentBefore);
    assert.deepEqual(snapshot, snapshotBefore);
    assert.notStrictEqual(restored, snapshot);
    assert.notStrictEqual(restored.toolsRemaining, snapshot.toolsRemaining);
  });

  it("returns the same failed game when no undo uses remain", () => {
    const snapshot = createSnapshot(createInitialGameState());
    const current = {
      ...snapshot,
      status: "failed" as const,
      toolsRemaining: { putAside: 2, undo: 0, shuffle: 2 },
    };

    assert.strictEqual(undoToSnapshot(current, snapshot), current);
  });
});

describe("steroid tile atlas campaign progress", () => {
  it("unlocks only the level immediately after a completed frontier", () => {
    assert.equal(getNextUnlockedLevel(1, 1), 2);
  });

  it("never lowers progress when replaying an earlier level", () => {
    assert.equal(getNextUnlockedLevel(4, 2), 4);
    assert.equal(getNextUnlockedLevel(5, 1), 5);
  });

  it("caps campaign progress at level five", () => {
    assert.equal(getNextUnlockedLevel(5, 5), 5);
    assert.equal(getNextUnlockedLevel(4, 5), 5);
  });
});

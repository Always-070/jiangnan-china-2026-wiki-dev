import { useMemo, useState } from "react";
import {
  type BoardTile,
  type GameState,
  type MoveSnapshot,
  type ReserveTile,
  type TilePattern,
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
import "./steroid-tile-atlas.css";

interface PatternMeta {
  shortLabel: string;
  fullLabel: string;
  detail: string;
}

const PATTERN_META: Record<TilePattern, PatternMeta> = {
  Ring: {
    shortLabel: "Ring",
    fullLabel: "Steroid ring",
    detail: "Four fused rings",
  },
  P450: {
    shortLabel: "P450",
    fullLabel: "P450 enzyme",
    detail: "Catalytic step",
  },
  C27: {
    shortLabel: "C27",
    fullLabel: "C27 precursor",
    detail: "Sterol pool",
  },
  C19: {
    shortLabel: "C19",
    fullLabel: "C19 steroid",
    detail: "Hormone branch",
  },
  C21: {
    shortLabel: "C21",
    fullLabel: "C21 steroid",
    detail: "Hormone branch",
  },
  OH: {
    shortLabel: "OH",
    fullLabel: "Hydroxylation",
    detail: "Oxygenation",
  },
  NAD: {
    shortLabel: "NAD",
    fullLabel: "Redox cofactor",
    detail: "Electron supply",
  },
  ERG: {
    shortLabel: "ERG",
    fullLabel: "Ergosterol route",
    detail: "Host pathway",
  },
  SCO: {
    shortLabel: "SCO",
    fullLabel: "Side-chain cleavage",
    detail: "Scaffold edit",
  },
};

const RESERVE_LABELS = ["Left stack", "Right stack", "Lower left", "Lower right"];

export function SteroidTileAtlas() {
  const [game, setGame] = useState<GameState>(() => createInitialGameState());
  const [lastSnapshot, setLastSnapshot] = useState<MoveSnapshot | null>(null);
  const visibleBoardTiles = useMemo(
    () => game.boardTiles.filter((tile) => !tile.removed),
    [game.boardTiles],
  );
  const remainingReserveCount = game.reserveStacks.reduce(
    (sum, stack) => sum + stack.length,
    0,
  );
  const remainingTotal = visibleBoardTiles.length + remainingReserveCount;
  const canPutAside =
    game.status === "playing" && game.slot.length >= 3 && game.aside.length === 0;

  function applyMove(reducer: (current: GameState) => GameState) {
    setGame((current) => {
      const next = reducer(current);

      if (next === current) {
        return current;
      }

      setLastSnapshot(createSnapshot(current));
      return next;
    });
  }

  function handleBoardTileClick(tile: BoardTile) {
    applyMove((current) => selectBoardTile(current, tile.id));
  }

  function handleReserveClick(stackIndex: number) {
    applyMove((current) => selectReserveTile(current, stackIndex));
  }

  function handlePutAside() {
    applyMove(putAside);
  }

  function handleReturnAside(tile: ReserveTile) {
    applyMove((current) => returnAsideTile(current, tile.id));
  }

  function handleShuffle() {
    applyMove(shuffleRemainingTiles);
  }

  function handleUndo() {
    if (!lastSnapshot) {
      return;
    }

    setGame((current) => undoToSnapshot(current, lastSnapshot));
    setLastSnapshot(null);
  }

  function handleReset() {
    setGame(createInitialGameState());
    setLastSnapshot(null);
  }

  return (
    <main className="steroid-game-page">
      <section className="steroid-game-stage" aria-label="Steroid Tile Atlas game">
        <div className="steroid-game-table">
          <header className="steroid-game-title">
            <div>
              <span>Independent innovation page</span>
              <h1>Steroid Tile Atlas</h1>
              <p>
                Clear dense, layered steroid-production tiles before the
                seven-slot tray overflows.
              </p>
            </div>
            <StatusBadge status={game.status} remainingTotal={remainingTotal} />
          </header>

          <div className="steroid-game-field">
            <ReserveStack
              stack={game.reserveStacks[0]}
              label={RESERVE_LABELS[0]}
              position="left"
              disabled={game.status !== "playing"}
              onSelect={() => handleReserveClick(0)}
            />
            <ReserveStack
              stack={game.reserveStacks[1]}
              label={RESERVE_LABELS[1]}
              position="right"
              disabled={game.status !== "playing"}
              onSelect={() => handleReserveClick(1)}
            />
            <ReserveStack
              stack={game.reserveStacks[2]}
              label={RESERVE_LABELS[2]}
              position="bottom-left"
              disabled={game.status !== "playing"}
              onSelect={() => handleReserveClick(2)}
            />
            <ReserveStack
              stack={game.reserveStacks[3]}
              label={RESERVE_LABELS[3]}
              position="bottom-right"
              disabled={game.status !== "playing"}
              onSelect={() => handleReserveClick(3)}
            />

            <div className="steroid-board" aria-label="Layered main board">
              {visibleBoardTiles.map((tile, index) => {
                const covered = isBoardTileCovered(tile, game.boardTiles);

                return (
                  <button
                    key={tile.id}
                    type="button"
                    className={`steroid-tile steroid-tile-${tile.pattern.toLowerCase()} ${
                      covered ? "is-covered" : "is-free"
                    }`.trim()}
                    style={{
                      left: `calc(1rem + ${tile.x} * var(--tile-step-x))`,
                      top: `calc(1rem + ${tile.y} * var(--tile-step-y))`,
                      zIndex: tile.layer * 20 + index,
                    }}
                    disabled={covered || game.status !== "playing"}
                    aria-label={`${PATTERN_META[tile.pattern].fullLabel}${
                      covered ? " covered" : " selectable"
                    }`}
                    onClick={() => handleBoardTileClick(tile)}
                  >
                    <TileFace pattern={tile.pattern} />
                  </button>
                );
              })}
            </div>

            {game.status !== "playing" ? (
              <div className="steroid-game-result" role="status">
                <strong>{game.status === "won" ? "Cleared" : "Tray overflow"}</strong>
                <span>
                  {game.status === "won"
                    ? "All steroid tiles have been eliminated."
                    : "The seven-slot tray is full. Reset or undo to continue testing."}
                </span>
                <button type="button" onClick={handleReset}>
                  New game
                </button>
              </div>
            ) : null}
          </div>

          <SlotTray slot={game.slot} />
        </div>

        <aside className="steroid-control-panel" aria-label="Game controls">
          <section className="steroid-panel-block steroid-panel-score">
            <span>Run status</span>
            <dl>
              <div>
                <dt>Moves</dt>
                <dd>{game.moves}</dd>
              </div>
              <div>
                <dt>Eliminated</dt>
                <dd>{game.eliminatedSets}</dd>
              </div>
              <div>
                <dt>Remaining</dt>
                <dd>{remainingTotal}</dd>
              </div>
            </dl>
          </section>

          <section className="steroid-panel-block">
            <span>Tools</span>
            <div className="steroid-tool-grid">
              <button type="button" disabled={!canPutAside} onClick={handlePutAside}>
                Put aside
              </button>
              <button
                type="button"
                disabled={!lastSnapshot}
                onClick={handleUndo}
              >
                Undo
              </button>
              <button
                type="button"
                disabled={game.status !== "playing"}
                onClick={handleShuffle}
              >
                Shuffle
              </button>
              <button type="button" onClick={handleReset}>
                New game
              </button>
            </div>
          </section>

          <section className="steroid-panel-block">
            <span>Put-aside area</span>
            <div className="steroid-aside-zone">
              {Array.from({ length: 3 }, (_, index) => {
                const tile = game.aside[index];

                return tile ? (
                  <button
                    key={tile.id}
                    type="button"
                    className="steroid-aside-tile"
                    disabled={game.status !== "playing"}
                    onClick={() => handleReturnAside(tile)}
                  >
                    <TileFace pattern={tile.pattern} compact />
                  </button>
                ) : (
                  <span className="steroid-aside-empty" key={`empty-${index}`} />
                );
              })}
            </div>
          </section>

          <section className="steroid-panel-block steroid-knowledge-panel">
            <span>Knowledge feedback</span>
            <h2>Wet-lab note pending</h2>
            <p>{game.lastFact}</p>
            <small>
              This panel refreshes after each triple match; wet-lab teammates can
              update the knowledge array later.
            </small>
          </section>
        </aside>
      </section>
    </main>
  );
}

function TileFace({
  pattern,
  compact = false,
}: {
  pattern: TilePattern;
  compact?: boolean;
}) {
  const meta = PATTERN_META[pattern];

  return (
    <>
      <span className="steroid-tile-symbol">{meta.shortLabel}</span>
      {!compact ? <small>{meta.detail}</small> : null}
    </>
  );
}

function ReserveStack({
  stack,
  label,
  position,
  disabled,
  onSelect,
}: {
  stack: ReserveTile[];
  label: string;
  position: "left" | "right" | "bottom-left" | "bottom-right";
  disabled: boolean;
  onSelect: () => void;
}) {
  const topTile = stack.at(-1);

  return (
    <div className={`steroid-reserve-stack steroid-reserve-${position}`}>
      {stack.slice(0, 5).map((tile, index) => (
        <span
          className="steroid-reserve-back"
          key={tile.id}
          style={{ transform: `translate(${index * 4}px, ${index * -2}px)` }}
        />
      ))}
      {topTile ? (
        <button
          type="button"
          className="steroid-reserve-top"
          disabled={disabled}
          aria-label={`Select ${label} top tile`}
          onClick={onSelect}
        >
          <TileFace pattern={topTile.pattern} compact />
        </button>
      ) : (
        <span className="steroid-reserve-empty">Empty</span>
      )}
      <small>{stack.length} left</small>
    </div>
  );
}

function SlotTray({ slot }: { slot: ReserveTile[] }) {
  return (
    <div className="steroid-slot-tray" aria-label="Seven slot tray">
      {Array.from({ length: 7 }, (_, index) => {
        const tile = slot[index];

        return (
          <span
            className={`steroid-slot ${tile ? "is-filled" : ""}`.trim()}
            key={tile?.id || `slot-${index}`}
          >
            {tile ? <TileFace pattern={tile.pattern} compact /> : null}
          </span>
        );
      })}
    </div>
  );
}

function StatusBadge({
  status,
  remainingTotal,
}: {
  status: GameState["status"];
  remainingTotal: number;
}) {
  const label =
    status === "playing"
      ? "Playing"
      : status === "won"
        ? "Completed"
        : "Failed";

  return (
    <div className={`steroid-status-badge steroid-status-${status}`}>
      <strong>{label}</strong>
      <span>{remainingTotal} tiles on field</span>
    </div>
  );
}

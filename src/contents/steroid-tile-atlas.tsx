import { type CSSProperties, useEffect, useMemo, useState } from "react";
import {
  type BoardTile,
  type GameState,
  type LevelNumber,
  type MoveSnapshot,
  type ReserveTile,
  type TilePattern,
  BOARD_GEOMETRY,
  LEVEL_PROFILES,
  createInitialGameState,
  createSnapshot,
  getNextUnlockedLevel,
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

type BoardGeometryStyle = CSSProperties & {
  "--tile-step-x": string;
  "--tile-step-y": string;
};

const BOARD_GEOMETRY_STYLE: BoardGeometryStyle = {
  "--tile-step-x": `calc(var(--tile-width) * ${BOARD_GEOMETRY.xStep})`,
  "--tile-step-y": `calc(var(--tile-height) * ${BOARD_GEOMETRY.yStep})`,
};

const CAMPAIGN_STORAGE_KEY = "steroid-tile-atlas-highest-level";

function readHighestUnlockedLevel(): LevelNumber {
  if (typeof window === "undefined") {
    return 1;
  }

  try {
    const storedValue = window.localStorage.getItem(CAMPAIGN_STORAGE_KEY);

    if (storedValue === null) {
      return 1;
    }

    const parsedValue = Number(storedValue);

    if (!Number.isInteger(parsedValue) || parsedValue < 1 || parsedValue > 5) {
      return 1;
    }

    return parsedValue as LevelNumber;
  } catch {
    return 1;
  }
}

function writeHighestUnlockedLevel(level: LevelNumber) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(CAMPAIGN_STORAGE_KEY, String(level));
  } catch {
    // Campaign progress persistence must never interrupt play.
  }
}

export function SteroidTileAtlas() {
  const [highestUnlocked, setHighestUnlocked] = useState<LevelNumber>(
    readHighestUnlockedLevel,
  );
  const [game, setGame] = useState<GameState>(() => createInitialGameState(1));
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
    game.status === "playing" &&
    game.slot.length >= 3 &&
    game.aside.length === 0 &&
    game.toolsRemaining.putAside > 0;
  const canUndo = lastSnapshot !== null && game.toolsRemaining.undo > 0;
  const canShuffle =
    game.status === "playing" && game.toolsRemaining.shuffle > 0;

  useEffect(() => {
    if (game.status !== "won") {
      return;
    }

    const nextHighest = getNextUnlockedLevel(highestUnlocked, game.level);

    if (nextHighest <= highestUnlocked) {
      return;
    }

    setHighestUnlocked(nextHighest);
    writeHighestUnlockedLevel(nextHighest);
  }, [game.level, game.status, highestUnlocked]);

  function startLevel(level: LevelNumber) {
    if (level > highestUnlocked) {
      return;
    }

    setGame(createInitialGameState(level));
    setLastSnapshot(null);
  }

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
    if (!lastSnapshot || game.toolsRemaining.undo <= 0) {
      return;
    }

    setGame((current) => undoToSnapshot(current, lastSnapshot));
    setLastSnapshot(null);
  }

  function handleReset() {
    setGame(createInitialGameState(game.level));
    setLastSnapshot(null);
  }

  function handleNextLevel() {
    if (game.status !== "won" || game.level >= 5) {
      return;
    }

    const nextLevel = (game.level + 1) as LevelNumber;

    if (nextLevel > highestUnlocked) {
      return;
    }

    startLevel(nextLevel);
  }

  return (
    <main className={`steroid-game-page steroid-level-${game.level}`}>
      <section className="steroid-game-stage" aria-label="Steroid Tile Atlas game">
        <div className="steroid-game-table">
          <header className="steroid-game-title">
            <div className="steroid-game-heading">
              <span className="steroid-game-context">
                Campaign / Level {String(game.level).padStart(2, "0")}
              </span>
              <h1>Steroid Tile Atlas</h1>
            </div>
            <LevelTrack
              currentLevel={game.level}
              highestUnlocked={highestUnlocked}
              onSelectLevel={startLevel}
            />
            <StatusBadge
              level={game.level}
              status={game.status}
              remainingTotal={remainingTotal}
            />
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

            <div
              className={`steroid-board steroid-level-${game.level}`}
              style={BOARD_GEOMETRY_STYLE}
              aria-label="Layered main board"
            >
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
              <div className="steroid-game-result" role="status" aria-live="polite">
                {game.status === "won" ? (
                  game.level < 5 ? (
                    <>
                      <strong>
                        Level {String(game.level).padStart(2, "0")} complete
                      </strong>
                      <span>Next level unlocked.</span>
                      <div className="steroid-result-actions">
                        <button
                          type="button"
                          className="steroid-result-primary"
                          disabled={game.level + 1 > highestUnlocked}
                          onClick={handleNextLevel}
                        >
                          Next level
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <strong>Campaign complete</strong>
                      <span>All five levels cleared.</span>
                      <div className="steroid-result-actions">
                        <button
                          type="button"
                          className="steroid-result-primary"
                          onClick={() => startLevel(1)}
                        >
                          Play again
                        </button>
                      </div>
                    </>
                  )
                ) : (
                  <>
                    <strong>
                      Level {String(game.level).padStart(2, "0")} failed
                    </strong>
                    <span>The seven-slot tray reached capacity.</span>
                    <div className="steroid-result-actions">
                      <button
                        type="button"
                        className="steroid-result-primary"
                        onClick={handleReset}
                      >
                        Retry level
                      </button>
                      {canUndo ? (
                        <button type="button" onClick={handleUndo}>
                          Undo
                        </button>
                      ) : null}
                    </div>
                  </>
                )}
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
                <dt>Level</dt>
                <dd>{String(game.level).padStart(2, "0")}</dd>
              </div>
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
              <button
                type="button"
                disabled={!canPutAside}
                aria-label={`Put aside, ${game.toolsRemaining.putAside} remaining`}
                onClick={handlePutAside}
              >
                <span>Put aside</span>
                <span className="steroid-tool-count">
                  {game.toolsRemaining.putAside}
                </span>
              </button>
              <button
                type="button"
                disabled={!canUndo}
                aria-label={`Undo, ${game.toolsRemaining.undo} remaining`}
                onClick={handleUndo}
              >
                <span>Undo</span>
                <span className="steroid-tool-count">
                  {game.toolsRemaining.undo}
                </span>
              </button>
              <button
                type="button"
                disabled={!canShuffle}
                aria-label={`Shuffle, ${game.toolsRemaining.shuffle} remaining`}
                onClick={handleShuffle}
              >
                <span>Shuffle</span>
                <span className="steroid-tool-count">
                  {game.toolsRemaining.shuffle}
                </span>
              </button>
              <button type="button" onClick={handleReset}>
                New board
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

function LevelTrack({
  currentLevel,
  highestUnlocked,
  onSelectLevel,
}: {
  currentLevel: LevelNumber;
  highestUnlocked: LevelNumber;
  onSelectLevel: (level: LevelNumber) => void;
}) {
  return (
    <nav className="steroid-level-track" aria-label="Campaign levels">
      <ol>
        {LEVEL_PROFILES.map((profile) => {
          const isCurrent = profile.level === currentLevel;
          const isCompleted = profile.level < highestUnlocked;
          const isLocked = profile.level > highestUnlocked;
          const isAvailable = !isCurrent && !isCompleted && !isLocked;
          const className = [
            "steroid-level-button",
            isCurrent ? "is-current" : "",
            isCompleted ? "is-completed" : "",
            isAvailable ? "is-available" : "",
            isLocked ? "is-locked" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <li key={profile.level}>
              <button
                type="button"
                className={className}
                disabled={isLocked}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Level ${profile.level}${isLocked ? ", locked" : ""}`}
                onClick={() => onSelectLevel(profile.level)}
              >
                {String(profile.level).padStart(2, "0")}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function PatternIcon({ pattern }: { pattern: TilePattern }) {
  return (
    <span
      className={`steroid-pattern-icon steroid-pattern-icon-${pattern.toLowerCase()}`}
      aria-hidden="true"
    >
      <span className="steroid-pattern-shape steroid-pattern-shape-1" />
      <span className="steroid-pattern-shape steroid-pattern-shape-2" />
      <span className="steroid-pattern-shape steroid-pattern-shape-3" />
      <span className="steroid-pattern-shape steroid-pattern-shape-4" />
    </span>
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
    <span
      className={`steroid-tile-face ${compact ? "is-compact" : ""}`.trim()}
    >
      <PatternIcon pattern={pattern} />
      <span className="steroid-tile-symbol">{meta.shortLabel}</span>
      <small className="steroid-tile-detail">{meta.detail}</small>
    </span>
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
  const pressureClass =
    slot.length >= 7 ? "is-full" : slot.length >= 6 ? "is-warning" : "";

  return (
    <div
      className={`steroid-slot-tray ${pressureClass}`.trim()}
      aria-label={`Seven slot tray, ${slot.length} occupied`}
    >
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
  level,
  status,
  remainingTotal,
}: {
  level: LevelNumber;
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
      <strong>
        Level {String(level).padStart(2, "0")} / {label}
      </strong>
      <span>{remainingTotal} tiles on field</span>
    </div>
  );
}

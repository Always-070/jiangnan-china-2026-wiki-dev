import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent, WheelEvent } from "react";
import { Link } from "react-router-dom";
import teamLogoUrl from "../assets/team-logo-symbol.svg";
import { SectionNav } from "../components/PageScaffold";

const HomeAtlasThreeScene = lazy(
  () => import("../components/three/HomeAtlasThreeScene"),
);

const homeSections = [
  { id: "atlas-story", label: "Story Mode" },
  { id: "atlas-modules", label: "Modules" },
  { id: "atlas-proof", label: "Proof Slots" },
  { id: "atlas-next", label: "Next Stop" },
];

const storySteps = [
  {
    label: "Need",
    title: "Steroid hormones matter, but today's routes stay heavy.",
    text: "The wiki opens from manufacturing pressure: valuable molecules, complex routes, and a clear reason to search for cleaner de novo production.",
  },
  {
    label: "Gap",
    title: "Flux, catalysis, and transport block the cell factory together.",
    text: "The first-round narrative keeps the three bottlenecks visible so judges remember the system challenge rather than one isolated pathway step.",
  },
  {
    label: "Answer",
    title: "A fungal cell factory becomes the project atlas.",
    text: "The Atlas Engine turns ER, LD, mitochondria, P450 hotspots, and transport arcs into one visual control map for the whole site.",
  },
];

const moduleCards = [
  {
    label: "Description",
    title: "Old route vs. cell-factory answer",
    text: "Frame Need, Gap, and Platform Answer before diving into pathway details.",
    href: "/description",
  },
  {
    label: "Engineering",
    title: "Metabolic control map",
    text: "Turn DBTL, ER membrane, P450 catalysis, and transport into a judge-friendly interface.",
    href: "/engineering",
  },
  {
    label: "Results",
    title: "Evidence spiral",
    text: "Reserve clean slots for assays, figures, and milestone evidence without inventing data.",
    href: "/results",
  },
  {
    label: "Human Practices",
    title: "Responsible platform loop",
    text: "Connect manufacturing reality, stakeholder feedback, sustainability, and safety decisions.",
    href: "/human-practices",
  },
];

const proofSlots = [
  "Sterol scaffold readiness",
  "P450 conversion checkpoint",
  "Transport and toxicity readout",
  "Integrated platform milestone",
];

type HomeIntroPhase = "atom" | "travel" | "scaffold" | "docking" | "docked";

const introTitleWords = "Build a steroid hormone cell factory from simple carbon.".split(" ");
const INTRO_ANIMATION_MS = 3400;

function clampIntroProgress(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function easeIntroProgress(value: number) {
  const t = clampIntroProgress(value);

  return t * t * t * (t * (t * 6 - 15) + 10);
}

function drawRoundedCell(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
}

function AtlasCellCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationFrame = 0;
    const startTime = performance.now();

    const draw = (time: number) => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      const ratio = Math.min(window.devicePixelRatio || 1, 2);

      if (
        canvas.width !== Math.round(width * ratio) ||
        canvas.height !== Math.round(height * ratio)
      ) {
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
      }

      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);

      const elapsed = reduceMotion ? 2400 : time - startTime;
      const progress = (elapsed % 7600) / 7600;
      const centerX = width * 0.55;
      const centerY = height * 0.48;
      const cellRadius = Math.min(width, height) * 0.36;

      const background = context.createRadialGradient(
        centerX,
        centerY,
        cellRadius * 0.1,
        centerX,
        centerY,
        cellRadius * 1.7,
      );
      background.addColorStop(0, "rgba(18, 103, 216, 0.28)");
      background.addColorStop(0.52, "rgba(6, 27, 104, 0.16)");
      background.addColorStop(1, "rgba(6, 27, 104, 0)");
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);

      context.lineCap = "round";
      context.lineJoin = "round";

      for (let i = 0; i < 12; i += 1) {
        const waveY = height * (0.08 + i * 0.08);
        const phase = progress * Math.PI * 2 + i * 0.5;

        context.beginPath();
        context.moveTo(width * -0.05, waveY);

        for (let x = -20; x <= width + 40; x += 40) {
          const y = waveY + Math.sin(x * 0.018 + phase) * 14;
          context.lineTo(x, y);
        }

        context.strokeStyle = i % 2
          ? "rgba(158, 219, 255, 0.08)"
          : "rgba(18, 103, 216, 0.08)";
        context.lineWidth = 1;
        context.stroke();
      }

      drawRoundedCell(
        context,
        centerX - cellRadius * 1.12,
        centerY - cellRadius * 0.8,
        cellRadius * 2.24,
        cellRadius * 1.6,
        cellRadius * 0.55,
      );
      context.fillStyle = "rgba(158, 219, 255, 0.045)";
      context.fill();
      context.strokeStyle = "rgba(158, 219, 255, 0.22)";
      context.lineWidth = 1.5;
      context.stroke();

      const ldX = centerX + cellRadius * 0.38;
      const ldY = centerY - cellRadius * 0.08;
      const mitoX = centerX - cellRadius * 0.48;
      const mitoY = centerY + cellRadius * 0.18;
      const erX = centerX - cellRadius * 0.16;
      const erY = centerY - cellRadius * 0.42;

      context.beginPath();
      context.ellipse(mitoX, mitoY, cellRadius * 0.42, cellRadius * 0.18, -0.25, 0, Math.PI * 2);
      context.fillStyle = "rgba(7, 21, 140, 0.36)";
      context.fill();
      context.strokeStyle = "rgba(158, 219, 255, 0.34)";
      context.lineWidth = 2;
      context.stroke();

      for (let i = 0; i < 4; i += 1) {
        context.beginPath();
        context.moveTo(mitoX - cellRadius * 0.22 + i * cellRadius * 0.13, mitoY - cellRadius * 0.08);
        context.quadraticCurveTo(
          mitoX - cellRadius * 0.12 + i * cellRadius * 0.13,
          mitoY,
          mitoX - cellRadius * 0.22 + i * cellRadius * 0.13,
          mitoY + cellRadius * 0.08,
        );
        context.strokeStyle = "rgba(158, 219, 255, 0.34)";
        context.lineWidth = 1.2;
        context.stroke();
      }

      for (let i = 0; i < 4; i += 1) {
        context.beginPath();
        const offset = i * cellRadius * 0.1;
        context.moveTo(erX - cellRadius * 0.5 + offset, erY + i * 6);
        context.bezierCurveTo(
          erX - cellRadius * 0.18 + offset,
          erY - cellRadius * 0.22,
          erX + cellRadius * 0.26 + offset,
          erY + cellRadius * 0.2,
          erX + cellRadius * 0.52,
          erY - cellRadius * 0.05 + i * 8,
        );
        context.strokeStyle = "rgba(158, 219, 255, 0.42)";
        context.lineWidth = 3.2;
        context.stroke();
      }

      const ldGlow = context.createRadialGradient(ldX, ldY, 0, ldX, ldY, cellRadius * 0.34);
      ldGlow.addColorStop(0, "rgba(255, 232, 74, 0.95)");
      ldGlow.addColorStop(0.35, "rgba(255, 232, 74, 0.32)");
      ldGlow.addColorStop(1, "rgba(255, 232, 74, 0)");
      context.fillStyle = ldGlow;
      context.beginPath();
      context.arc(ldX, ldY, cellRadius * 0.34, 0, Math.PI * 2);
      context.fill();
      context.beginPath();
      context.arc(ldX, ldY, cellRadius * 0.14, 0, Math.PI * 2);
      context.fillStyle = "rgba(255, 232, 74, 0.94)";
      context.fill();

      const steroidNodes = [
        [centerX - cellRadius * 0.15, centerY - cellRadius * 0.2],
        [centerX + cellRadius * 0.16, centerY - cellRadius * 0.34],
        [centerX + cellRadius * 0.45, centerY - cellRadius * 0.16],
        [centerX + cellRadius * 0.34, centerY + cellRadius * 0.16],
        [centerX + cellRadius * 0.02, centerY + cellRadius * 0.22],
        [centerX - cellRadius * 0.26, centerY + cellRadius * 0.05],
      ];

      context.beginPath();
      steroidNodes.forEach(([x, y], index) => {
        if (index === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      });
      context.closePath();
      context.strokeStyle = "rgba(246, 250, 255, 0.78)";
      context.lineWidth = 2.4;
      context.stroke();

      context.beginPath();
      context.moveTo(steroidNodes[2][0], steroidNodes[2][1]);
      context.lineTo(centerX + cellRadius * 0.72, centerY - cellRadius * 0.34);
      context.lineTo(centerX + cellRadius * 0.86, centerY - cellRadius * 0.02);
      context.strokeStyle = "rgba(246, 250, 255, 0.48)";
      context.stroke();

      steroidNodes.forEach(([x, y], index) => {
        context.beginPath();
        context.arc(x, y, index === 2 ? 6 : 4.5, 0, Math.PI * 2);
        context.fillStyle = index === 2 ? "rgba(217, 155, 77, 0.95)" : "rgba(246, 250, 255, 0.86)";
        context.fill();
      });

      const paths = [
        {
          startX: width * 0.08,
          startY: height * 0.68,
          midX: centerX - cellRadius * 0.55,
          midY: centerY - cellRadius * 0.08,
          endX: ldX,
          endY: ldY,
          color: "rgba(39, 196, 106, 0.72)",
        },
        {
          startX: width * 0.18,
          startY: height * 0.34,
          midX: erX,
          midY: erY,
          endX: centerX + cellRadius * 0.46,
          endY: centerY - cellRadius * 0.15,
          color: "rgba(158, 219, 255, 0.78)",
        },
        {
          startX: mitoX,
          startY: mitoY,
          midX: centerX + cellRadius * 0.05,
          midY: centerY + cellRadius * 0.52,
          endX: centerX + cellRadius * 0.82,
          endY: centerY - cellRadius * 0.03,
          color: "rgba(217, 155, 77, 0.72)",
        },
      ];

      paths.forEach((path, pathIndex) => {
        context.beginPath();
        context.moveTo(path.startX, path.startY);
        context.quadraticCurveTo(path.midX, path.midY, path.endX, path.endY);
        context.strokeStyle = path.color.replace("0.72", "0.28").replace("0.78", "0.28");
        context.lineWidth = 2;
        context.stroke();

        for (let i = 0; i < 18; i += 1) {
          const t = (progress + i / 18 + pathIndex * 0.16) % 1;
          const x =
            (1 - t) * (1 - t) * path.startX +
            2 * (1 - t) * t * path.midX +
            t * t * path.endX;
          const y =
            (1 - t) * (1 - t) * path.startY +
            2 * (1 - t) * t * path.midY +
            t * t * path.endY;

          context.beginPath();
          context.arc(x, y, 1.8 + Math.sin(t * Math.PI) * 1.8, 0, Math.PI * 2);
          context.fillStyle = path.color;
          context.fill();
        }
      });

      const ripple = reduceMotion ? 0.7 : Math.sin(progress * Math.PI * 2) * 0.5 + 0.5;
      context.beginPath();
      context.arc(steroidNodes[2][0], steroidNodes[2][1], 18 + ripple * 32, 0, Math.PI * 2);
      context.strokeStyle = `rgba(217, 155, 77, ${0.32 - ripple * 0.18})`;
      context.lineWidth = 2;
      context.stroke();

      if (!reduceMotion) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    };

    animationFrame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas className="atlas-canvas" ref={canvasRef} aria-hidden="true" />;
}

function scrollToHomeSection(sectionId: string) {
  const target = document.getElementById(sectionId);

  if (!target) {
    return;
  }

  const targetTop = target.getBoundingClientRect().top + window.scrollY - 92;

  window.scrollTo({
    top: Math.max(targetTop, 0),
    behavior: "smooth",
  });

  window.requestAnimationFrame(() => {
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });
}

function HomeCinematicIntro({
  phase,
  progress,
  onBegin,
  onScrub,
  onDock,
}: {
  phase: Exclude<HomeIntroPhase, "docked">;
  progress: number;
  onBegin: () => void;
  onScrub: (deltaY: number) => void;
  onDock: () => void;
}) {
  const isScaffold = phase === "scaffold";
  const isDocking = phase === "docking";
  const titleOpacity = phase === "atom" ? 0 : clampIntroProgress((progress - 0.58) / 0.28);
  const carbonOpacity = clampIntroProgress(1 - progress * 1.45);
  const introStyle = {
    "--intro-progress": progress,
    "--title-opacity": titleOpacity,
    "--title-offset": `${(1 - titleOpacity) * 2.8}rem`,
    "--title-scale": 0.94 + titleOpacity * 0.06,
    "--carbon-opacity": carbonOpacity,
    "--carbon-scale": 1 + progress * 5.5,
    "--carbon-rotate-x": "0deg",
    "--carbon-rotate-y": "0deg",
    "--scene-shift-x": "0px",
    "--scene-shift-y": "0px",
    "--title-rotate-x": "8deg",
    "--title-rotate-y": "0deg",
    "--fluid-x": `${progress * -5}%`,
    "--fluid-y": `${progress * 3}%`,
    "--fluid-rotate": `${progress * 16}deg`,
  } as CSSProperties;

  const updatePointerVars = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    event.currentTarget.style.setProperty("--carbon-rotate-x", `${y * -18}deg`);
    event.currentTarget.style.setProperty("--carbon-rotate-y", `${x * 24}deg`);
    event.currentTarget.style.setProperty("--scene-shift-x", `${x * 24}px`);
    event.currentTarget.style.setProperty("--scene-shift-y", `${y * -18}px`);
    event.currentTarget.style.setProperty("--title-rotate-x", `${8 + y * -4}deg`);
    event.currentTarget.style.setProperty("--title-rotate-y", `${x * 6}deg`);
  };

  const resetPointerVars = (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--carbon-rotate-x", "0deg");
    event.currentTarget.style.setProperty("--carbon-rotate-y", "0deg");
    event.currentTarget.style.setProperty("--scene-shift-x", "0px");
    event.currentTarget.style.setProperty("--scene-shift-y", "0px");
    event.currentTarget.style.setProperty("--title-rotate-x", "8deg");
    event.currentTarget.style.setProperty("--title-rotate-y", "0deg");
  };

  const handleWheel = (event: WheelEvent<HTMLElement>) => {
    if (isScaffold || isDocking) {
      return;
    }

    event.preventDefault();
    onScrub(event.deltaY);
  };

  return (
    <section
      className={`home-cinematic home-cinematic-${phase}`}
      style={introStyle}
      onClick={() => {
        if (isScaffold) {
          onDock();
          return;
        }

        if (!isDocking) {
          onBegin();
        }
      }}
      onPointerMove={updatePointerVars}
      onPointerLeave={resetPointerVars}
      onWheel={handleWheel}
      aria-label="Atlas Engine cinematic entry"
    >
      <Suspense fallback={<div className="cinematic-carbon-fallback" aria-hidden="true" />}>
        <HomeAtlasThreeScene logoUrl={teamLogoUrl} mode={phase} progress={progress} />
      </Suspense>

      <div className="cinematic-carbon-shell" aria-hidden="true">
        <div className="cinematic-carbon-orbit cinematic-carbon-orbit-a" />
        <div className="cinematic-carbon-orbit cinematic-carbon-orbit-b" />
        <div className="cinematic-carbon-orbit cinematic-carbon-orbit-c" />
        <div className="cinematic-carbon-core">C</div>
      </div>

      <div className="cinematic-title-wrap" aria-hidden={phase === "atom"}>
        <span className="cinematic-kicker">The Atlas Engine</span>
        <h1 aria-label="Build a steroid hormone cell factory from simple carbon.">
          {introTitleWords.map((word, index) => (
            <span key={`${word}-${index}`} data-word={word} style={{ "--word-index": index } as CSSProperties}>
              {word}
            </span>
          ))}
        </h1>
      </div>

      {isScaffold ? (
        <button
          className="cinematic-dock-button"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDock();
          }}
        >
          Enter Atlas
        </button>
      ) : null}
    </section>
  );
}

export function Home() {
  const heroRef = useRef<HTMLElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const dockTimeoutRef = useRef<number | null>(null);
  const [introPhase, setIntroPhase] = useState<HomeIntroPhase>("atom");
  const [introProgress, setIntroProgress] = useState(0);

  const stopDockTimer = useCallback(() => {
    if (dockTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(dockTimeoutRef.current);
    dockTimeoutRef.current = null;
  }, []);

  const stopIntroAnimation = useCallback(() => {
    if (animationRef.current === null) {
      return;
    }

    window.cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
  }, []);

  useEffect(
    () => () => {
      stopIntroAnimation();
      stopDockTimer();
    },
    [stopDockTimer, stopIntroAnimation],
  );

  const commitIntroProgress = useCallback(
    (nextProgress: number) => {
      const next = clampIntroProgress(nextProgress);

      setIntroProgress(next);

      if (next >= 0.995) {
        setIntroProgress(1);
        setIntroPhase("scaffold");
        stopIntroAnimation();
        return;
      }

      setIntroPhase(next <= 0.02 ? "atom" : "travel");
    },
    [stopIntroAnimation],
  );

  const beginIntro = useCallback(() => {
    if (introPhase === "scaffold" || introPhase === "docking" || introPhase === "docked") {
      return;
    }

    stopIntroAnimation();
    setIntroPhase("travel");

    const startedAt = performance.now();
    const startProgress = introProgress;
    const remaining = Math.max(0.08, 1 - startProgress);

    const tick = (time: number) => {
      const elapsed = time - startedAt;
      const rawProgress = clampIntroProgress(elapsed / (INTRO_ANIMATION_MS * remaining));
      const easedProgress = startProgress + (1 - startProgress) * easeIntroProgress(rawProgress);

      commitIntroProgress(easedProgress);

      if (easedProgress < 0.995) {
        animationRef.current = window.requestAnimationFrame(tick);
      }
    };

    animationRef.current = window.requestAnimationFrame(tick);
  }, [commitIntroProgress, introPhase, introProgress, stopIntroAnimation]);

  const scrubIntro = useCallback(
    (deltaY: number) => {
      if (introPhase === "scaffold" || introPhase === "docking" || introPhase === "docked") {
        return;
      }

      stopIntroAnimation();
      commitIntroProgress(introProgress + deltaY * 0.00125);
    },
    [commitIntroProgress, introPhase, introProgress, stopIntroAnimation],
  );

  const dockIntro = useCallback(() => {
    stopIntroAnimation();
    stopDockTimer();
    setIntroProgress(1);
    setIntroPhase("docking");

    dockTimeoutRef.current = window.setTimeout(() => {
      setIntroPhase("docked");
      dockTimeoutRef.current = null;

      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }, 1250);
  }, [stopDockTimer, stopIntroAnimation]);

  return (
    <>
      {introPhase !== "docked" ? (
        <HomeCinematicIntro
          phase={introPhase}
          progress={introProgress}
          onBegin={beginIntro}
          onScrub={scrubIntro}
          onDock={dockIntro}
        />
      ) : null}
      <section
        className={`atlas-hero ${introPhase === "docked" ? "is-docked" : "is-waiting"}`}
        ref={heroRef}
        onMouseMove={(event) => {
          const target = heroRef.current;

          if (!target) {
            return;
          }

          const rect = target.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width - 0.5).toFixed(3);
          const y = ((event.clientY - rect.top) / rect.height - 0.5).toFixed(3);

          target.style.setProperty("--hero-x", x);
          target.style.setProperty("--hero-y", y);
        }}
        onMouseLeave={() => {
          const target = heroRef.current;

          if (!target) {
            return;
          }

          target.style.setProperty("--hero-x", "0");
          target.style.setProperty("--hero-y", "0");
        }}
      >
        <div className="atlas-fluid" aria-hidden="true" />
        <div className="container atlas-hero-grid">
          <div className="atlas-copy">
            <span className="atlas-kicker">Jiangnan-China iGEM 2026 / The Atlas Engine</span>
            <h1>Build a steroid hormone cell factory from simple carbon.</h1>
            <p>
              A blue scientific atlas for an engineered fungal platform: carbon flux,
              P450 catalysis, lipid droplets, ER membranes, and transport routes are
              drawn as one living cell-factory system.
            </p>
            <div className="atlas-actions">
              <Link className="intro-action intro-action-primary" to="/description">
                Enter judge path
              </Link>
              <button
                className="intro-action intro-action-secondary"
                type="button"
                onClick={() => scrollToHomeSection("atlas-story")}
              >
                Open story mode
              </button>
            </div>
            <div className="atlas-badges" aria-label="Atlas engine signals">
              <span>ER membrane</span>
              <span>P450 hotspot</span>
              <span>LD node</span>
            </div>
          </div>

          <aside className="atlas-stage" aria-label="3D-inspired cell factory atlas">
            <div className="atlas-stage-rainbow" aria-hidden="true" />
            <AtlasCellCanvas />
            {introPhase === "docked" ? (
              <Suspense fallback={null}>
                <HomeAtlasThreeScene logoUrl={teamLogoUrl} mode="docked" progress={1} />
              </Suspense>
            ) : null}
            <img className="atlas-team-mark" src={teamLogoUrl} alt="Jiangnan-China iGEM 2026 team symbol" />
            <div className="atlas-stage-label atlas-stage-label-er">ER membrane</div>
            <div className="atlas-stage-label atlas-stage-label-ld">LD</div>
            <div className="atlas-stage-label atlas-stage-label-mito">Mitochondria</div>
            <div className="atlas-stage-label atlas-stage-label-p450">P450 catalysis</div>
            <ol className="atlas-orbit" aria-label="DBTL loop">
              <li>Design</li>
              <li>Build</li>
              <li>Test</li>
              <li>Learn</li>
            </ol>
          </aside>
        </div>
      </section>

      <main className="atlas-main">
        <div className="container atlas-sticky-nav">
          <SectionNav sections={homeSections} />
        </div>

        <section id="atlas-story" className="container atlas-section atlas-story-section">
          <div className="atlas-section-heading">
            <span>Story Mode</span>
            <h2>From manufacturing burden to a programmable steroid cell factory.</h2>
            <p>
              The first round keeps the homepage focused and judge-readable: one visual
              world, one scientific arc, and no invented experimental claims.
            </p>
          </div>
          <div className="atlas-story-grid">
            {storySteps.map((step, index) => (
              <article className="atlas-story-card" key={step.title}>
                <span>{step.label}</span>
                <strong>{`0${index + 1}`}</strong>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="atlas-modules" className="container atlas-section">
          <div className="atlas-band">
            <div>
              <span>Wiki Architecture</span>
              <h2>Two routes through the same atlas.</h2>
            </div>
            <p>
              Judge Path follows the story. Lab Path keeps experiments, notebook,
              model, and software within reach for technical readers.
            </p>
          </div>
          <div className="atlas-module-grid">
            {moduleCards.map((module) => (
              <Link className="atlas-module-card" to={module.href} key={module.title}>
                <span>{module.label}</span>
                <h3>{module.title}</h3>
                <p>{module.text}</p>
              </Link>
            ))}
          </div>
        </section>

        <section id="atlas-proof" className="container atlas-section">
          <div className="atlas-section-heading">
            <span>Proof Slots</span>
            <h2>Evidence placeholders are visible, honest, and ready for real data.</h2>
            <p>
              The homepage marks the scientific proof ladder without fabricating assays,
              charts, or titers before the wet-lab evidence is available.
            </p>
          </div>
          <div className="atlas-proof-spiral" aria-label="Reserved proof agenda">
            {proofSlots.map((slot, index) => (
              <article className="atlas-proof-card" key={slot}>
                <span>{`Level 0${index + 1}`}</span>
                <h3>{slot}</h3>
                <p>Reserved for verified figures, assay notes, or notebook-linked evidence.</p>
              </article>
            ))}
          </div>
        </section>

        <section id="atlas-next" className="container atlas-section atlas-section-last">
          <div className="atlas-next-banner">
            <div>
              <span>Next Stop</span>
              <h2>Description turns the atlas into a project argument.</h2>
              <p>
                Start with the burden of current steroid production, then move into the
                platform answer: flux, catalysis, transport, and responsible deployment.
              </p>
            </div>
            <Link className="intro-action intro-action-primary" to="/description">
              Continue to Description
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

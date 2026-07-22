import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface MolecularLoaderProps {
  routeKey: string;
}

export function MolecularLoader({ routeKey }: MolecularLoaderProps) {
  const [visible, setVisible] = useState(true);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const shell = shellRef.current;

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setVisible(true);

    if (!shell || reduceMotion) {
      timeoutRef.current = window.setTimeout(() => setVisible(false), 420);
      return () => {
        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current);
        }
      };
    }

    const hideLoader = () => {
      if (shell) {
        gsap.set(shell, { autoAlpha: 0 });
      }

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      setVisible(false);
    };

    timeoutRef.current = window.setTimeout(hideLoader, 1400);

    const timeline = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: hideLoader,
    });

    timeline
      .set(shell, { autoAlpha: 1 })
      .fromTo(
        shell.querySelectorAll(".molecular-loader-line"),
        { strokeDashoffset: 260, opacity: 0.25 },
        { strokeDashoffset: 0, opacity: 1, stagger: 0.06, duration: 0.5 },
      )
      .to(
        shell.querySelector(".molecular-loader-node"),
        { scale: 1.18, duration: 0.18, yoyo: true, repeat: 1 },
        0.24,
      )
      .to(shell, { autoAlpha: 0, duration: 0.28 }, 0.62);

    return () => {
      timeline.kill();
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [routeKey]);

  return (
    <div
      className={`molecular-loader ${visible ? "is-visible" : ""}`}
      ref={shellRef}
      aria-hidden={!visible}
    >
      <svg
        viewBox="0 0 260 120"
        role="img"
        aria-label="Steroid scaffold loading animation"
      >
        <path
          className="molecular-loader-line"
          d="M35 60 L62 36 L96 48 L103 82 L70 94 Z"
        />
        <path
          className="molecular-loader-line"
          d="M96 48 L130 35 L163 52 L156 87 L103 82 Z"
        />
        <path
          className="molecular-loader-line"
          d="M163 52 L196 40 L222 62 L207 94 L156 87 Z"
        />
        <path className="molecular-loader-line" d="M207 94 L238 82 L246 48" />
        <circle className="molecular-loader-node" cx="163" cy="52" r="8" />
      </svg>
      <span>Constructing atlas</span>
    </div>
  );
}

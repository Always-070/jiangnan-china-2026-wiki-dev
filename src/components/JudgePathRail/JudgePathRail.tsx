import { Link, useLocation } from "react-router-dom";
import { judgePathSteps } from "./judgePathRailData";
import "./JudgePathRail.css";

export function JudgePathRail({ className = "" }: { className?: string }) {
  const location = useLocation();
  const currentPath = location.pathname || "/";

  return (
    <nav
      className={`judge-path-rail ${className}`.trim()}
      aria-label="Judge path"
    >
      <div className="judge-path-rail-copy">
        <span>Judge Path</span>
        <strong>One readable route from problem to proof.</strong>
      </div>
      <ol className="judge-path-steps">
        {judgePathSteps.map((step) => {
          const active =
            step.path === "/"
              ? currentPath === "/"
              : currentPath.startsWith(step.path);

          return (
            <li className={active ? "is-active" : ""} key={step.path}>
              <Link to={step.path} aria-current={active ? "page" : undefined}>
                <span>{step.number}</span>
                <strong>{step.label}</strong>
                <small>{step.role}</small>
                <em>{step.proof}</em>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

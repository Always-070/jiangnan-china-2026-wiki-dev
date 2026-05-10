export const judgePathSteps = [
  {
    path: "/",
    number: "01",
    label: "Home",
    role: "Project signal",
    proof: "Need + platform",
  },
  {
    path: "/description",
    number: "02",
    label: "Description",
    role: "Why this route",
    proof: "Route compare",
  },
  {
    path: "/engineering",
    number: "03",
    label: "Engineering",
    role: "How it is built",
    proof: "DBTL control",
  },
  {
    path: "/results",
    number: "04",
    label: "Results",
    role: "What is proven",
    proof: "Evidence ledger",
  },
  {
    path: "/human-practices",
    number: "05",
    label: "Human Practices",
    role: "What changed",
    proof: "Decision trace",
  },
  {
    path: "/safety-and-security",
    number: "06",
    label: "Safety",
    role: "Responsible boundary",
    proof: "Risk controls",
  },
] as const;

export function isJudgePathRoute(pathname: string) {
  return judgePathSteps.some((step) =>
    step.path === "/" ? pathname === "/" : pathname.startsWith(step.path),
  );
}

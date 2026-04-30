import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { stringToSlug } from "./src/utils/stringToSlug";

function normalizeBasePath(basePath: string) {
  if (!basePath) {
    return "/";
  }

  const withLeadingSlash = basePath.startsWith("/") ? basePath : `/${basePath}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

function resolveBasePath(teamSlug: string) {
  const explicitBasePath = process.env.VITE_BASE_PATH?.trim();
  if (explicitBasePath) {
    return normalizeBasePath(explicitBasePath);
  }

  const ciProjectNamespace = process.env.CI_PROJECT_NAMESPACE?.trim();
  if (!ciProjectNamespace) {
    return `/${teamSlug}/`;
  }

  // 官方比赛仓库通常位于年份命名空间下，例如 `2026/team-name`。
  if (/^20\d{2}$/.test(ciProjectNamespace)) {
    return `/${teamSlug}/`;
  }

  return "/";
}

// https://vitejs.dev/config/
export default () => {
  const env = loadEnv("dev", process.cwd());
  const teamSlug = stringToSlug(env.VITE_TEAM_NAME);

  return defineConfig({
    base: resolveBasePath(teamSlug),
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: 6172,
      strictPort: true,
    },
    preview: {
      host: "0.0.0.0",
      port: 6172,
      strictPort: true,
    },
  });
};

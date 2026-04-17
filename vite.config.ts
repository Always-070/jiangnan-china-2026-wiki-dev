import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { stringToSlug } from "./src/utils";

// https://vitejs.dev/config/
export default () => {
  const env = loadEnv("dev", process.cwd());
  const teamSlug = stringToSlug(env.VITE_TEAM_NAME);

  return defineConfig({
    base: `/${teamSlug}/`,
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

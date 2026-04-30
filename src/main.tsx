import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/space-grotesk/latin-400.css";
import "@fontsource/space-grotesk/latin-600.css";
import "@fontsource/space-grotesk/latin-700.css";
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-500.css";
import "@fontsource/ibm-plex-sans/latin-600.css";
import "@fontsource/ibm-plex-sans/latin-700.css";
import App from "./containers/App/App.tsx";
import { BrowserRouter, HashRouter } from "react-router-dom";

const useHashRouter = import.meta.env.VITE_ROUTER_MODE === "hash";

if (useHashRouter) {
  const sectionFallbacks: Record<string, string> = {
    design: "/description",
    cycle: "/engineering",
    milestones: "/results",
    stakeholders: "/human-practices",
    implementation: "/human-practices",
  };
  const rawHash = window.location.hash.slice(1);

  if (rawHash && !rawHash.startsWith("/")) {
    const route = sectionFallbacks[rawHash] || "/";
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${route}`);
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {useHashRouter ? (
      <HashRouter>
        <App />
      </HashRouter>
    ) : (
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    )}
  </React.StrictMode>,
);

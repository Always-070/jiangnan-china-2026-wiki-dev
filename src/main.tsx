import React from "react";
import ReactDOM from "react-dom/client";
import App from "./containers/App/App.tsx";
import { BrowserRouter, HashRouter } from "react-router-dom";

const useHashRouter = import.meta.env.VITE_ROUTER_MODE === "hash";

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

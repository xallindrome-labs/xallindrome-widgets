import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { ensureWidgetStyles } from "./styles";

ensureWidgetStyles();

const container = document.getElementById("root");
if (!container) {
  throw new Error("Missing #root mount node.");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);

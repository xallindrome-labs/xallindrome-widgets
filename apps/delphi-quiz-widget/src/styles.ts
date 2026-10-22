import widgetStyles from "./index.css?inline";

export const WIDGET_STYLE_ID = "delphi-quiz-widget-style";

export function ensureWidgetStyles(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(WIDGET_STYLE_ID)) return;

  const styleTag = document.createElement("style");
  styleTag.id = WIDGET_STYLE_ID;
  styleTag.textContent = widgetStyles;
  document.head.appendChild(styleTag);
}

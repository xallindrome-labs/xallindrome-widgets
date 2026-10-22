import { createRoot, type Root } from "react-dom/client";
import { DelphiQuizWidget, type DelphiQuizWidgetProps } from "./DelphiQuizWidget";
import { ensureWidgetStyles } from "./styles";

const roots = new Map<HTMLElement, Root>();

function resolveTarget(target: string | HTMLElement): HTMLElement | null {
  return typeof target === "string"
    ? (document.querySelector(target) as HTMLElement | null)
    : target;
}

export function mount(target: string | HTMLElement, options?: DelphiQuizWidgetProps): void {
  const element = resolveTarget(target);
  if (!element) {
    throw new Error("Mount target not found.");
  }

  ensureWidgetStyles();

  const existing = roots.get(element);
  if (existing) {
    existing.render(<DelphiQuizWidget {...options} />);
    return;
  }

  const root = createRoot(element);
  roots.set(element, root);
  root.render(<DelphiQuizWidget {...options} />);
}

export function unmount(target: string | HTMLElement): void {
  const element = resolveTarget(target);
  if (!element) return;
  const root = roots.get(element);
  if (!root) return;
  root.unmount();
  roots.delete(element);
}

export function autoMount(): void {
  const nodes = document.querySelectorAll<HTMLElement>("[data-delphi-quiz-widget]");
  nodes.forEach((node) => {
    if (roots.has(node)) return;
    mount(node, {
      apiBaseUrl: node.dataset.apiBaseUrl,
      calendarEmbedUrl: node.dataset.calendarEmbedUrl,
      bookingUrl: node.dataset.bookingUrl,
      niche: node.dataset.niche,
      source: node.dataset.source
    });
  });
}

declare global {
  interface Window {
    DelphiQuizWidget?: {
      mount: typeof mount;
      unmount: typeof unmount;
      autoMount: typeof autoMount;
    };
  }
}

const api = { mount, unmount, autoMount };
window.DelphiQuizWidget = api;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoMount);
} else {
  autoMount();
}

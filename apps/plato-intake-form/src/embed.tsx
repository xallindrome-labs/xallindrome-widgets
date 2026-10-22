import { createRoot, type Root } from "react-dom/client";
import { PlatoIntakeForm, type PlatoIntakeFormProps } from "./PlatoIntakeForm";
import { ensureWidgetStyles } from "./styles";

const roots = new Map<HTMLElement, Root>();

function resolveTarget(target: string | HTMLElement): HTMLElement | null {
  return typeof target === "string"
    ? (document.querySelector(target) as HTMLElement | null)
    : target;
}

export function mount(target: string | HTMLElement, options?: PlatoIntakeFormProps): void {
  const element = resolveTarget(target);
  if (!element) {
    throw new Error("Mount target not found.");
  }

  ensureWidgetStyles();

  const existing = roots.get(element);
  if (existing) {
    existing.render(<PlatoIntakeForm {...options} />);
    return;
  }

  const root = createRoot(element);
  roots.set(element, root);
  root.render(<PlatoIntakeForm {...options} />);
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
  const nodes = document.querySelectorAll<HTMLElement>("[data-plato-intake-form]");
  nodes.forEach((node) => {
    if (roots.has(node)) return;
    mount(node, {
      storageKey: node.dataset.storageKey,
      source: node.dataset.source,
      apiBaseUrl: node.dataset.apiBaseUrl,
      proceedUrl: node.dataset.proceedUrl,
      turnstileSiteKey: node.dataset.turnstileSiteKey
    });
  });
}

declare global {
  interface Window {
    PlatoIntakeForm?: {
      mount: typeof mount;
      unmount: typeof unmount;
      autoMount: typeof autoMount;
    };
  }
}

const api = { mount, unmount, autoMount };
window.PlatoIntakeForm = api;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoMount);
} else {
  autoMount();
}

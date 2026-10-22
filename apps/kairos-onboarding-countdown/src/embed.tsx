import { createRoot, type Root } from "react-dom/client";
import {
  KairosOnboardingCountdown,
  type KairosOnboardingCountdownProps
} from "./KairosOnboardingCountdown";
import type { ChecklistColumn } from "./types";
import { ensureWidgetStyles } from "./styles";

const roots = new Map<HTMLElement, Root>();

function resolveTarget(target: string | HTMLElement): HTMLElement | null {
  return typeof target === "string"
    ? (document.querySelector(target) as HTMLElement | null)
    : target;
}

export function mount(
  target: string | HTMLElement,
  options?: KairosOnboardingCountdownProps
): void {
  const element = resolveTarget(target);
  if (!element) {
    throw new Error("Mount target not found.");
  }

  ensureWidgetStyles();

  const existing = roots.get(element);
  if (existing) {
    existing.render(<KairosOnboardingCountdown {...options} />);
    return;
  }

  const root = createRoot(element);
  roots.set(element, root);
  root.render(<KairosOnboardingCountdown {...options} />);
}

export function unmount(target: string | HTMLElement): void {
  const element = resolveTarget(target);
  if (!element) return;
  const root = roots.get(element);
  if (!root) return;
  root.unmount();
  roots.delete(element);
}

function parseColumns(raw: string | undefined): ChecklistColumn[] | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ChecklistColumn[]) : undefined;
  } catch {
    return undefined;
  }
}

export function autoMount(): void {
  const nodes = document.querySelectorAll<HTMLElement>(
    "[data-kairos-onboarding-countdown]"
  );
  nodes.forEach((node) => {
    if (roots.has(node)) return;
    mount(node, {
      targetDate: node.dataset.targetDate,
      targetLabel: node.dataset.targetLabel,
      targetTime: node.dataset.targetTime,
      refIndex: node.dataset.refIndex,
      eyebrow: node.dataset.eyebrow,
      topRight: node.dataset.topRight,
      headlineLine1: node.dataset.headlineLine1,
      headlineLine2: node.dataset.headlineLine2,
      subtitle: node.dataset.subtitle,
      timerLabel: node.dataset.timerLabel,
      footerLeft: node.dataset.footerLeft,
      footerRight: node.dataset.footerRight,
      columns: parseColumns(node.dataset.columns),
      apiBaseUrl: node.dataset.apiBaseUrl,
      appointmentType: node.dataset.appointmentType,
      email: node.dataset.email,
      storageKey: node.dataset.storageKey
    });
  });
}

declare global {
  interface Window {
    KairosOnboardingCountdown?: {
      mount: typeof mount;
      unmount: typeof unmount;
      autoMount: typeof autoMount;
    };
  }
}

const api = { mount, unmount, autoMount };
window.KairosOnboardingCountdown = api;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoMount);
} else {
  autoMount();
}

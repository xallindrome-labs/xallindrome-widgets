import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const repoRoot = resolve(__dirname, "..", "..");
export const publicWidgetCatalogPath = resolve(
  repoRoot,
  "libs",
  "public-widget-catalog",
  "catalog.json"
);

export async function loadPublicWidgetCatalog() {
  const raw = await readFile(publicWidgetCatalogPath, "utf8");
  return JSON.parse(raw);
}

export async function getPublicWidgetCatalogEntry(widgetId) {
  const catalog = await loadPublicWidgetCatalog();
  const widget = catalog.widgets.find((entry) => entry.id === widgetId);
  if (!widget) {
    throw new Error(`Unknown public widget id: ${widgetId}`);
  }
  return widget;
}

export async function getPublicWidgetVersion(widget) {
  const packageJsonPath = resolve(repoRoot, widget.appDir, "package.json");
  const raw = await readFile(packageJsonPath, "utf8");
  const pkg = JSON.parse(raw);
  if (!pkg.version) {
    throw new Error(`Missing version in ${packageJsonPath}`);
  }
  return String(pkg.version);
}

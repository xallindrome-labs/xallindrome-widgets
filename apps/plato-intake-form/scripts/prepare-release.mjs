#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { preparePublicWidgetRelease } from "../../../tools/widgets/prepare-public-widget-release.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const packageJsonPath = resolve(projectRoot, "package.json");

const pkg = JSON.parse(await readFile(packageJsonPath, "utf8"));
const args = process.argv.slice(2).filter((arg) => arg !== "--");
const version = args[0] || pkg.version;
const widgetBaseUrl = (args[1] || "https://widgets.example.com").replace(/\/$/, "");

if (!version) {
  throw new Error("Missing version. Provide an argument or set package.json version.");
}

const apiBaseUrl = (
  process.env.PUBLIC_INTAKE_WIDGET_API_BASE_URL ||
  process.env.PUBLIC_PRICING_WIDGET_API_BASE_URL ||
  process.env.PUBLIC_WIDGET_API_BASE_URL ||
  ""
).trim();

await preparePublicWidgetRelease({
  widgetId: "plato-intake-form",
  projectRoot,
  version,
  widgetBaseUrl,
  defaultProps: apiBaseUrl ? { apiBaseUrl } : {}
});

console.log(
  `Prepared plato-intake-form release for v${version}${apiBaseUrl ? ` (apiBaseUrl=${apiBaseUrl})` : ""}`
);

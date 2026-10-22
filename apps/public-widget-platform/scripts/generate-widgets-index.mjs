import fs from "node:fs";
import path from "node:path";
import {
  getPublicWidgetVersion,
  loadPublicWidgetCatalog,
} from "../../../tools/widgets/load-public-widget-catalog.mjs";

const args = process.argv.slice(2).filter((arg) => arg !== "--");
const outputPath = args[0] ?? "dist/widgets-index.json";
const maybeBaseArg = args[1] ?? "";
const maybeLegacyBaseArg = args[2] ?? "";
const cdnBase = (
  (maybeLegacyBaseArg || (maybeBaseArg.startsWith("http") ? maybeBaseArg : "")) ||
  "https://widgets.example.com"
).replace(/\/$/, "");

const catalog = await loadPublicWidgetCatalog();
const widgets = [];

for (const widget of catalog.widgets) {
  const version = await getPublicWidgetVersion(widget);
  widgets.push({
    id: widget.id,
    title: widget.title,
    latest: version,
    globalName: widget.globalName,
    scriptUrl: `${cdnBase}/widgets/${widget.id}/latest/widget.iife.js`,
    esmUrl: `${cdnBase}/widgets/${widget.id}/latest/widget.esm.js`,
    embedUrl: `${cdnBase}/embed/${widget.id}/latest/index.html`,
    versions: [
      {
        version,
        scriptUrl: `${cdnBase}/widgets/${widget.id}/v${version}/widget.iife.js`,
        esmUrl: `${cdnBase}/widgets/${widget.id}/v${version}/widget.esm.js`,
        embedUrl: `${cdnBase}/embed/${widget.id}/v${version}/index.html`,
        globalName: widget.globalName,
      },
    ],
  });
}

const index = {
  version: 2,
  updatedAt: new Date().toISOString(),
  widgets,
};

const fullPath = path.resolve(outputPath);
fs.mkdirSync(path.dirname(fullPath), { recursive: true });
fs.writeFileSync(fullPath, JSON.stringify(index, null, 2));
console.log(`wrote ${fullPath}`);

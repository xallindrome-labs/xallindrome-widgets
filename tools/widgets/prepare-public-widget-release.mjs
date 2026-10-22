import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  getPublicWidgetCatalogEntry,
  repoRoot,
} from "./load-public-widget-catalog.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

function trimTrailingSlash(value) {
  return value.replace(/\/$/, "");
}

function toKebabCase(value) {
  return value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
}

function toDatasetAttributes(props) {
  return Object.entries(props)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => {
      const attrName = `data-${toKebabCase(key)}`;
      const attrValue =
        typeof value === "boolean" ? String(value) : String(value);
      return `${attrName}="${escapeAttribute(attrValue)}"`;
    });
}

async function copyArtifactIfPresent(sourcePath, targetPath) {
  try {
    await copyFile(sourcePath, targetPath);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return;
    }
    throw error;
  }
}

function buildEmbedHtml({
  title,
  widgetAttribute,
  wrapperMaxWidth,
  dataAttributes,
  queryParams,
  scriptUrl,
  layout,
}) {
  const hostAttributes = [widgetAttribute, ...dataAttributes]
    .filter(Boolean)
    .join("\n      ");
  const mappings = JSON.stringify(queryParams ?? []);

  const bodyStyle =
    layout === "fullscreen"
      ? `html, body { margin: 0; height: 100%; overflow: hidden; background: transparent; }
      #widget-host { width: 100%; height: 100%; }`
      : `body {
        margin: 0;
        min-height: 100vh;
        padding: 18px;
        background: transparent;
      }

      #widget-host {
        max-width: ${wrapperMaxWidth}px;
        margin: 0 auto;
      }`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      ${bodyStyle}
    </style>
  </head>
  <body>
    <div
      id="widget-host"
      ${hostAttributes}
    ></div>

    <script>
      const host = document.getElementById("widget-host");
      const params = new URLSearchParams(window.location.search);
      const mappings = ${mappings};

      for (const mapping of mappings) {
        const value = params.get(mapping.queryParam);
        if (value) {
          host.dataset[mapping.datasetKey] = value;
        }
      }
    </script>
    <script src="${scriptUrl}"></script>
  </body>
</html>
`;
}

export async function preparePublicWidgetRelease({
  widgetId,
  projectRoot,
  version,
  widgetBaseUrl = "https://widgets.example.com",
  defaultProps = {},
}) {
  const widget = await getPublicWidgetCatalogEntry(widgetId);
  const resolvedProjectRoot = projectRoot
    ? resolve(projectRoot)
    : resolve(repoRoot, widget.appDir);
  const distDir = resolve(resolvedProjectRoot, "dist");
  const normalizedBaseUrl = trimTrailingSlash(widgetBaseUrl);
  const effectiveDefaultProps = {
    ...(widget.hostedEmbed?.defaultProps ?? {}),
    ...defaultProps,
  };

  const sourceFiles = [
    [widget.artifacts.iifeSource, widget.artifacts.iifeTarget],
    [`${widget.artifacts.iifeSource}.map`, `${widget.artifacts.iifeTarget}.map`],
    [widget.artifacts.esmSource, widget.artifacts.esmTarget],
    [`${widget.artifacts.esmSource}.map`, `${widget.artifacts.esmTarget}.map`],
  ];

  const versionedWidgetDir = resolve(
    distDir,
    "release",
    "widgets",
    widget.id,
    `v${version}`
  );
  const latestWidgetDir = resolve(distDir, "release", "widgets", widget.id, "latest");
  await mkdir(versionedWidgetDir, { recursive: true });
  await mkdir(latestWidgetDir, { recursive: true });

  for (const [sourceName, targetName] of sourceFiles) {
    await copyArtifactIfPresent(
      resolve(distDir, sourceName),
      resolve(versionedWidgetDir, targetName)
    );
    await copyArtifactIfPresent(
      resolve(distDir, sourceName),
      resolve(latestWidgetDir, targetName)
    );
  }

  const versionedEmbedDir = resolve(
    distDir,
    "release",
    "embed",
    widget.id,
    `v${version}`
  );
  const latestEmbedDir = resolve(distDir, "release", "embed", widget.id, "latest");
  await mkdir(versionedEmbedDir, { recursive: true });
  await mkdir(latestEmbedDir, { recursive: true });

  const dataAttributes = toDatasetAttributes(effectiveDefaultProps);
  const hostedEmbedTitle = widget.hostedEmbed?.title ?? widget.title;
  const wrapperMaxWidth = widget.hostedEmbed?.wrapperMaxWidth ?? 1120;
  const queryParams = widget.hostedEmbed?.queryParams ?? [];
  const layout = widget.hostedEmbed?.layout;

  await writeFile(
    resolve(versionedEmbedDir, "index.html"),
    buildEmbedHtml({
      title: hostedEmbedTitle,
      widgetAttribute: widget.autoMountAttribute,
      wrapperMaxWidth,
      dataAttributes,
      queryParams,
      layout,
      scriptUrl: `${normalizedBaseUrl}/widgets/${widget.id}/v${version}/${widget.artifacts.iifeTarget}`,
    }),
    "utf8"
  );

  await writeFile(
    resolve(latestEmbedDir, "index.html"),
    buildEmbedHtml({
      title: hostedEmbedTitle,
      widgetAttribute: widget.autoMountAttribute,
      wrapperMaxWidth,
      dataAttributes,
      queryParams,
      layout,
      scriptUrl: `${normalizedBaseUrl}/widgets/${widget.id}/latest/${widget.artifacts.iifeTarget}`,
    }),
    "utf8"
  );

  await writeFile(
    resolve(distDir, "release", "widgets", widget.id, "latest.json"),
    JSON.stringify(
      {
        widgetVersion: version,
        generatedAt: new Date().toISOString(),
        scriptUrl: `${normalizedBaseUrl}/widgets/${widget.id}/latest/${widget.artifacts.iifeTarget}`,
        embedUrl: `${normalizedBaseUrl}/embed/${widget.id}/latest/index.html`,
      },
      null,
      2
    ),
    "utf8"
  );

  return { widget, distDir };
}

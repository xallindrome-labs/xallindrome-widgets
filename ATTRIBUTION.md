# Attribution and third-party licenses

This repository's own code is MIT-licensed (see [LICENSE](LICENSE)). This file lists everything else that ships with or is loaded by it. Audit date: 2026-10-22.

## Bundled assets

None. The repository contains no fonts, sprites, audio, video, 3D models or raster artwork other than three small JPEG screenshots of the widgets themselves in `docs/img/`.

The icons in `apps/delphi-quiz-widget/src/icons.tsx` are inline SVG path data written for this project (24x24, stroke-based, `currentColor`). They are not imported from an icon package. Their visual style is close to common open line-icon sets such as Lucide (ISC) and Feather (MIT); if you believe a specific path was adapted from one of them, please open an issue and it will be credited or replaced.

## Fonts (loaded from Google Fonts at runtime, not bundled)

The widget stylesheets `@import` these from `fonts.googleapis.com`. Visitors' browsers fetch them from Google; nothing is copied into this repo. All three are licensed under the SIL Open Font License 1.1.

| Font | Used in |
|---|---|
| Space Grotesk | quiz, intake form, countdown |
| Inter | quiz, intake form, countdown |
| JetBrains Mono | intake form, countdown |

To avoid the third-party request, self-host the fonts and replace the `@import` line at the top of each `src/index.css`.

## Runtime dependencies (end up in the widget bundles)

| Package | License |
|---|---|
| react, react-dom | MIT |
| scheduler (via react-dom) | MIT |

The loader SDK (`apps/public-widget-platform`) and `libs/pricing-domain` have no runtime dependencies.

## Optional third-party service

- **Cloudflare Turnstile** (bot protection in the intake form): the widget loads `https://challenges.cloudflare.com/turnstile/v0/api.js` only if you pass a `turnstileSiteKey`. It is subject to Cloudflare's own terms.

## Build and dev dependencies (not shipped)

| Package | License |
|---|---|
| vite, @vitejs/plugin-react, @types/react, @types/react-dom | MIT |
| typescript | Apache-2.0 |
| Transitive tooling (e.g. picocolors, semver, electron-to-chromium) | MIT / ISC / BSD-3-Clause / Apache-2.0 |
| caniuse-lite (browser-data used by the build) | CC-BY-4.0 |

The full list, with versions, is in `package-lock.json`. At the time of the audit every package in it was licensed MIT, ISC, BSD-3-Clause, Apache-2.0 or CC-BY-4.0 (the last is data, build-time only).

## Trademarks

Product and service names used in text (for example Turnstile, Google Fonts, React) belong to their owners. This project is not affiliated with or endorsed by them.

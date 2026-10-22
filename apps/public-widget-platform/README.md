# @xallindrome-labs/widget-sdk

A tiny browser SDK that loads externally hosted, versioned widget scripts into a page:

- `window.XallindromeWidgets.mount(target, options)`
- `window.XallindromeWidgets.unmount(target, widgetId?)`

Widget metadata (ids, global names, artifact names, hosted-embed query params) lives in `libs/public-widget-catalog/catalog.json`.

## Install

```bash
npm install @xallindrome-labs/widget-sdk
```

```js
import { mount } from "@xallindrome-labs/widget-sdk";
```

Or load the browser build straight from a CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/@xallindrome-labs/widget-sdk/dist/xallindrome-widgets-sdk.iife.js"></script>
```

The SDK has no dependencies and is about 1 kB. It only loads and mounts scripts; the widgets themselves live in [xallindrome-widgets](https://github.com/xallindrome-labs/xallindrome-widgets) and you host their built files yourself.

## Build (from the repository)

From the repository root:

```bash
npm install
npm run build -w @xallindrome-labs/widget-sdk
npm run release:prepare -w @xallindrome-labs/widget-sdk
```

`release:prepare` copies SDK files into:

- `dist/release/sdk/v<version>/...`
- `dist/release/sdk/latest/...`
- `dist/release/sdk/latest.json`

## Generate widget index metadata

```bash
npm run generate:index -w @xallindrome-labs/widget-sdk -- dist/widgets-index.json https://widgets.example.com
```

This reads every widget entry in the catalog and writes a multi-widget `dist/widgets-index.json`. The last argument is the base URL where you host the built files.

## Hosting

The output of `release:prepare` is plain static files. Put them on any static host or CDN. Use a long cache for versioned paths (`v1.0.0/`) and a short one for `latest/` and `widgets-index.json`.

## Website embed usage

```html
<div id="quiz"></div>
<script src="https://widgets.example.com/sdk/latest/xallindrome-widgets-sdk.iife.js"></script>
<script>
  window.XallindromeWidgets.mount("#quiz", {
    widgetId: "delphi-quiz",
    scriptUrl: "https://widgets.example.com/widgets/delphi-quiz/latest/widget.iife.js",
    globalName: "DelphiQuizWidget",
    props: {
      apiBaseUrl: "https://api.example.com",
      source: "website"
    }
  });
</script>
```

---

**Built by [Xallindrome](https://xallindrome.co)**: we build automation and AI workflows for small businesses. If you'd like something like this for your business, [book a diagnostic](https://xallindrome.co).

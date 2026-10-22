# Plato Intake Form Widget

Standalone, embeddable thought-leadership intake form. Save-as-you-go, two intake modes (Minimum Viable / Full Strategic), 12 sections, plus a review screen and confirmation.

The widget stores answers in `localStorage` under the key `plato_intake_v1`. **Submission is intentionally local-only** — the final "Submit intake" action transitions to the confirmation screen but does not POST anywhere. Wire your backend by passing an `onSubmit` callback (or by replacing the success transition in `PlatoIntakeForm.tsx`).

## Scripts

```bash
npm install
npm run dev
npm run build
npm run release:prepare
```

For local dev, copy `.env.example` to `.env` and set `VITE_TURNSTILE_SITE_KEY` if you want to test the bot-protection challenge (see [Bot protection](#bot-protection) below).

## Embedding

```html
<div data-plato-intake-form></div>
<script src="https://widgets.example.com/widgets/plato-intake-form/latest/widget.iife.js"></script>
```

Or programmatically:

```html
<div id="intake"></div>
<script src="https://widgets.example.com/widgets/plato-intake-form/latest/widget.iife.js"></script>
<script>
  PlatoIntakeForm.mount("#intake", {
    storageKey: "plato_intake_v1"
  });
</script>
```

### Props

| Prop          | Type                            | Notes                                                            |
| ------------- | ------------------------------- | ---------------------------------------------------------------- |
| `storageKey`        | `string`                        | Override the localStorage key. Default: `plato_intake_v1`.       |
| `source`            | `string`                        | Free-form attribution string (e.g. `website`, `landing-page`).         |
| `apiBaseUrl`        | `string`                        | When set, submit POSTs the payload to `${apiBaseUrl}/public/intake`. |
| `proceedUrl`        | `string`                        | Where the post-submit "Proceed" button navigates to.             |
| `turnstileSiteKey`  | `string`                        | Cloudflare Turnstile site key. See [Bot protection](#bot-protection). |
| `onSubmit`          | `(payload) => Promise \| void`  | Called when the user clicks "Submit intake" on the review step.  |
| `onChange`          | `(state) => void`               | Called on every field change with `{ mode, stepIdx, data }`.     |

If `onSubmit` is omitted the widget transitions to its built-in success screen and emits a `console.info` with the payload — drop in a fetch when you're ready to wire it.

## Bot protection

Pass `turnstileSiteKey` (or set `data-turnstile-site-key` on an auto-mounted element) to render a [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) widget on the review step. Submit is blocked until it solves, and the resulting token is sent as `turnstileToken` in the payload.

The site key here is the **public** key, safe to embed. Verify the token server-side with your Turnstile **secret** key before accepting a submission; the widget only collects the token.

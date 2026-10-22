# Security policy

## Reporting a vulnerability

Please report security problems privately through GitHub:
**Security → Report a vulnerability** on https://github.com/xallindrome-labs/xallindrome-widgets/security/advisories/new

Please don't open a public issue for a vulnerability. This is a one-person project, so expect an acknowledgement within a week, not hours.

## What matters for security here

- These are **browser widgets**. They run inside your page and, if you give them `apiBaseUrl`, send visitor input (names, emails, answers) to **your** backend. This repository contains no backend and no credentials.
- **Never put secrets in widget props, `data-` attributes or `.env` files that get bundled.** Anything the widget can read, the visitor can read. The Turnstile site key is public by design; the Turnstile secret key belongs on your server only.
- The Plato intake form stores answers unencrypted in the visitor's `localStorage` (key `plato_intake_v1` by default) so they can resume. Don't use it for data that must not rest in the browser, and use a different `storageKey` per form.
- The SDK loads a script from the `scriptUrl` you give it. Host the files yourself and pass `integrity` (Subresource Integrity) if you load them from a CDN.
- Your webhook and API endpoints (for example the appointment webhook the Kairos countdown can read from) must verify a shared secret and validate input server-side. The widgets do not do that for you.

Reports about any of the above not holding true are in scope.

## Supported versions

Only the latest release.

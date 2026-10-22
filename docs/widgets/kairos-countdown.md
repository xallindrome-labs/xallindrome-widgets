# Kairos — onboarding countdown

**One-line:** A live countdown to a booked call, personalised with the visitor's name, designed to sit on the thank-you page right after someone books.

## What it does

The moment between "I booked a call" and the call itself is usually a generic "thanks, see you Tuesday" page. Kairos replaces it with a branded confirmation: a `Days · Hrs · Min · Sec` timer, a four-column checklist (done, next 24 to 48 hours, on the call, your only job) and a headline that reads `You're in, {firstName}.` when it knows the name.

## Where the call time comes from

The widget tries three sources, in priority order:

1. **URL query string.** Your calendar tool's redirect-after-booking URL carries the start time as a merge field, for example `?targetDate=...&type=onboarding&email=...`. This needs no backend.
2. **Backend lookup.** If you pass `apiBaseUrl`, it calls `GET ${apiBaseUrl}/public/appointments/{emailSlug}/{type}`. Your booking tool's "appointment booked" webhook is expected to have stored the time there beforehand. The email comes from `?email=`, the `email` prop, or `localStorage[storageKey].data.primaryEmail` (the key the Plato intake form writes).
3. **Prop or data attribute.** `targetDate` on the mount call; with nothing else set it falls back to about two days from page load.

The email slug rule is: lowercase, replace every non-alphanumeric run with `_` (`alice@example.com` becomes `alice_example_com`).

## The API contract (optional, you build it)

Only needed if you want option 2:

- `POST /public/appointments/booked` with JSON `{ email, type, startTime, endTime, calendarId, contactId, source, raw }`. Protect it with a shared secret header of your choosing.
- `GET /public/appointments/{emailSlug}/{type}` returns the stored appointment, or 404.

This repository does not include a backend. Any small function plus a key-value or object store will do.

## Where things are

- **Source:** `apps/kairos-onboarding-countdown/`
- **Script tag (after you publish it):** `https://widgets.example.com/widgets/kairos-onboarding-countdown/latest/widget.iife.js`. It auto-mounts elements that carry `data-kairos-onboarding-countdown`.

## Props

See the table in [the widget README](../../apps/kairos-onboarding-countdown/README.md#props).

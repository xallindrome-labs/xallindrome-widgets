# Kairos Onboarding Countdown Widget

Embeddable onboarding-confirmation marquee with a live countdown to the booked onboarding call. Displays a bold creator-brand anchor headline, a `Days · Hrs · Min · Sec` timer band with a red seconds digit, an animated hairline weave panel synced to the seconds, and four checklist columns (Done / Next 24–48h / On the call / Your only job).

## Scripts

```bash
npm install
npm run dev
npm run build
npm run release:prepare
```

## Embedding

```html
<div data-kairos-onboarding-countdown></div>
<script src="https://widgets.example.com/widgets/kairos-onboarding-countdown/latest/widget.iife.js"></script>
```

Or programmatically:

```html
<div id="countdown"></div>
<script src="https://widgets.example.com/widgets/kairos-onboarding-countdown/latest/widget.iife.js"></script>
<script>
  KairosOnboardingCountdown.mount("#countdown", {
    targetDate: "2026-05-04T17:00:00Z",
    targetLabel: "FRI 04 MAY",
    targetTime: "10:00 PT"
  });
</script>
```

## Props

| Prop | Type | Default |
| --- | --- | --- |
| `targetDate` | ISO 8601 string | ~2 days from page load |
| `targetLabel` | string | derived from `targetDate` |
| `targetTime` | string | derived from `targetDate` |
| `refIndex` | string | `"14.0"` |
| `eyebrow` | string | `"ONBOARDING CONFIRMED"` |
| `topRight` | string | `"Welcome — let's build."` |
| `headlineLine1` | string | `"You're"` |
| `headlineLine2` | string | `"in"` |
| `subtitle` | string | onboarding handoff copy |
| `timerLabel` | string | `"Onboarding call begins in"` |
| `columns` | `ChecklistColumn[]` (length 4) | shipped defaults |
| `footerLeft` | string | `"Live — counting to call"` |
| `footerRight` | string | `"Xallindrome / Thought Leadership · v 1.0"` |
| `apiBaseUrl` | string | unset |
| `appointmentType` | string | `"onboarding"` |
| `email` | string | resolved from URL or localStorage |
| `storageKey` | string | `"plato_intake_v1"` |

When mounted via `data-kairos-onboarding-countdown` the dataset keys map to the
same props (kebab-case → camelCase). Pass `data-columns` as a JSON-stringified
array.

## Resolving the appointment date

The widget tries three sources for the target date, in priority order:

1. **URL query string**: `?targetDate=` or `?appointmentDate=` (ISO 8601). Optionally `?targetLabel=` / `?targetTime=` to override the formatted display.
2. **Backend lookup** at `${apiBaseUrl}/public/appointments/{emailSlug}/{type}`. The email comes from `?email=`, the `email` prop, or `localStorage[storageKey].data.primaryEmail` (the same key the Plato intake form writes to). The slug is the lowercased email with every non-alphanumeric run replaced by `_` (`alice@example.com` becomes `alice_example_com`).
3. **`targetDate` prop / data attr**: falls back to about 2 days from page load when nothing else is provided.

If `data.primaryName` is present in localStorage, the headline becomes
`You're in, {firstName}.` automatically.

## Calendar / CRM configuration

There are two ways to drive the date. Pick whichever your booking tool supports.

### Option A: redirect carries merge fields (no backend needed)

Set your booking calendar's "redirect after booking" URL to a page hosting the widget, with the start time as a merge field (the merge-field syntax depends on your tool):

```
https://example.com/thank-you?targetDate={{appointment.start_time}}&type=onboarding&email={{contact.email}}
```

`targetDate` (or `appointmentDate`) wins over the backend lookup, so this works even if no webhook is configured.

### Option B: webhook to your own backend (survives a refresh)

Add a webhook action to the "appointment booked" workflow that POSTs to an endpoint you run:

```
POST https://api.example.com/public/appointments/booked
Content-Type: application/json
x-webhook-secret: <a shared secret you choose and verify>
```

Body:

```json
{
  "email": "{{contact.email}}",
  "type": "onboarding",
  "startTime": "{{appointment.start_time}}",
  "endTime": "{{appointment.end_time}}",
  "calendarId": "{{appointment.calendar_id}}",
  "contactId": "{{contact.id}}",
  "source": "crm",
  "raw": { "appointmentId": "{{appointment.id}}" }
}
```

Store it keyed by `{emailSlug}/{typeSlug}` and serve it back from `GET /public/appointments/{emailSlug}/{typeSlug}`. This repository ships the widget only, not that backend.

### `type` slug rules

`type` is a free string, but the slug your backend derives should be path-safe:
lowercased, non-`[a-z0-9_-]` collapsed to `_`, leading/trailing `_` and `-`
trimmed, capped at 64 chars. So `Discovery Call`, `discovery call`, and
`discovery_call` all map to the same `discovery_call`.

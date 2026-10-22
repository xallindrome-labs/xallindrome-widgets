# Plato — long-form intake

**One-line:** A self-contained, embeddable intake form that captures everything you need to start an engagement. It saves as the visitor types and posts the finished brief to your own backend on submit.

## What it does

Plato is a long-form discovery brief. It has **two modes**, Minimum Viable (the essentials, about 12 minutes) and Full Strategic (the whole picture, about 45 minutes), so people pick the depth they have time for. There are 12 sections plus a review screen: contact, business, audience, positioning, voice, content, channels, brand, proof, calendar, success metrics and review.

Answers are written to `localStorage` on every change, so a visitor can close the tab and pick up where they left off. On submit the widget calls your `onSubmit` callback or, if you pass `apiBaseUrl`, POSTs the payload to `${apiBaseUrl}/public/intake`.

## How it fits with the other widgets

```
Plato   writes name + email to localStorage["plato_intake_v1"]
Kairos  reads the same key to personalise its countdown headline
```

Plato never talks to Kairos directly; they share one browser storage key. Use a different `storageKey` on each side if you want them independent.

## Where things are

- **Source:** `apps/plato-intake-form/`
- **Hosted embed (after you publish it):** `https://widgets.example.com/embed/plato-intake-form/latest/index.html`
- **Script tag:** `https://widgets.example.com/widgets/plato-intake-form/latest/widget.iife.js`. It auto-mounts elements that carry `data-plato-intake-form`.
- **Storage:** `localStorage["plato_intake_v1"]` in the browser.
- **API (optional, you build it):** `POST ${apiBaseUrl}/public/intake` with the answers as JSON. The payload includes `turnstileToken` when bot protection is on.

## Why it exists

Generic CRM intake forms ask for company name and budget. Thought-leadership and content work needs more: voice, audience pain, what the client won't say, what proof they have. Asking all that over email loses momentum. Plato turns the longest part of onboarding into a self-paced form that respects the client's time.

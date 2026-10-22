import { useEffect, useState } from "react";
import type { ChecklistColumn } from "./types";

const DEFAULT_STORAGE_KEY = "plato_intake_v1";
const DEFAULT_APPOINTMENT_TYPE = "onboarding";

function slugifyEmail(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace("@", "_")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function slugifyType(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^[_-]+|[_-]+$/g, "")
    .slice(0, 64);
}

interface PlatoIntakeStored {
  data?: {
    primaryEmail?: string;
    primaryName?: string;
    businessName?: string;
  };
}

function readIntakeStorage(storageKey: string): PlatoIntakeStored | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as PlatoIntakeStored) : null;
  } catch {
    return null;
  }
}

function readQueryParams(): URLSearchParams | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search);
}

function firstName(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.split(/\s+/)[0]!.slice(0, 24);
}

export interface KairosOnboardingCountdownProps {
  /**
   * ISO 8601 datetime for the appointment. When omitted the widget resolves
   * the target through three layers in priority order:
   *   1. URL query param (`?targetDate=` / `?appointmentDate=`)
   *   2. Backend lookup at `${apiBaseUrl}/public/appointments/{slug}/{type}`
   *      keyed by the email stored in `localStorage[storageKey].data.primaryEmail`
   *   3. A built-in fallback (~2 days out) so dev/preview always renders.
   */
  targetDate?: string;
  /** Optional pre-formatted target date label (e.g. "FRI 04 MAY"). */
  targetLabel?: string;
  /** Optional pre-formatted target time label (e.g. "10:00 PT"). */
  targetTime?: string;
  /** Reference index shown top-left (e.g. "14.0"). */
  refIndex?: string;
  /** Eyebrow shown after the reference index (e.g. "ONBOARDING CONFIRMED"). */
  eyebrow?: string;
  /** Right-aligned status line in the top bar. */
  topRight?: string;
  /** First line of the headline (default "You're"). */
  headlineLine1?: string;
  /** Second line of the headline (default "in"). */
  headlineLine2?: string;
  /** Subtitle paragraph below the headline. */
  subtitle?: string;
  /** Label above the timer digits. */
  timerLabel?: string;
  /** Override the four checklist columns. Provide 4 entries for best layout. */
  columns?: ChecklistColumn[];
  /** Footer left text (defaults to a "Live" indicator label). */
  footerLeft?: string;
  /** Footer right text (e.g. brand attribution). */
  footerRight?: string;
  /**
   * Base URL of your backend for the appointment lookup. Without this,
   * Layer 2 is skipped and the widget falls through to the URL query / prop
   * default.
   */
  apiBaseUrl?: string;
  /** Appointment type slug for the backend lookup (default "onboarding"). */
  appointmentType?: string;
  /** Explicit email override; when absent we read it from localStorage / URL. */
  email?: string;
  /** localStorage key the Plato intake form uses (default "plato_intake_v1"). */
  storageKey?: string;
}

const DEFAULT_COLUMNS: ChecklistColumn[] = [
  {
    title: "Done",
    ord: "04 of 11",
    items: [
      { ix: "01", text: "Welcome video", done: true },
      { ix: "02", text: "Intake form", done: true },
      { ix: "03", text: "Call scheduled", done: true },
      { ix: "04", text: "Account access", done: true }
    ]
  },
  {
    title: "Next 24–48h",
    ord: "on us",
    items: [
      { ix: "05", text: "Review intake — surface positioning & angles" },
      { ix: "06", text: "Finalize your content workspace — scripts, approvals, cadence" },
      { ix: "07", text: "Confirm access & capture baseline metrics" }
    ]
  },
  {
    title: "On the call",
    ord: "together",
    items: [
      { ix: "08", text: "Lock 90-day focus — offer + audience" },
      { ix: "09", text: "Confirm voice & boundaries" },
      { ix: "10", text: "Book first recording — align weekly cadence" }
    ]
  },
  {
    title: "Your only job",
    ord: "right now",
    items: [
      { ix: "11", text: "Show up with real opinions, not perfect answers." },
      { ix: "·", text: "Be ready to confirm 2FA / access prompts." },
      { ix: "·", text: "Protect recording time like it matters — because it does." }
    ]
  }
];

const FALLBACK_OFFSET_MS =
  2 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000 + 22 * 60 * 1000 + 8 * 1000;

function pad(n: number): string {
  return String(Math.max(0, Math.floor(n))).padStart(2, "0");
}

function parseTarget(targetDate: string | undefined): Date {
  if (targetDate) {
    const parsed = new Date(targetDate);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date(Date.now() + FALLBACK_OFFSET_MS);
}

function formatDayLabel(target: Date): string {
  return target
    .toLocaleString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short"
    })
    .toUpperCase();
}

function formatTimeLabel(target: Date): string {
  return target
    .toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    })
    .toUpperCase();
}

interface Parts {
  d: string;
  h: string;
  m: string;
  s: string;
}

function partsFor(target: Date): Parts {
  let diff = Math.max(0, target.getTime() - Date.now());
  const d = Math.floor(diff / 86400000);
  diff -= d * 86400000;
  const h = Math.floor(diff / 3600000);
  diff -= h * 3600000;
  const m = Math.floor(diff / 60000);
  diff -= m * 60000;
  const s = Math.floor(diff / 1000);
  return { d: pad(d), h: pad(h), m: pad(m), s: pad(s) };
}

export function KairosOnboardingCountdown(
  props: KairosOnboardingCountdownProps = {}
): React.ReactElement {
  const {
    targetDate,
    targetLabel,
    targetTime,
    refIndex = "14.0",
    eyebrow = "ONBOARDING CONFIRMED",
    topRight = "Welcome — let's build.",
    headlineLine1 = "You're",
    headlineLine2 = "in",
    subtitle = "Setup is done. From here forward, we drive — recording, edits, approvals, posting. Your job is opinions, not perfection.",
    timerLabel = "Onboarding call begins in",
    columns = DEFAULT_COLUMNS,
    footerLeft = "Live — counting to call",
    footerRight = "Xallindrome / Thought Leadership · v 1.0",
    apiBaseUrl,
    appointmentType,
    email: emailProp,
    storageKey = DEFAULT_STORAGE_KEY
  } = props;

  const [target, setTarget] = useState<Date>(() => parseTarget(targetDate));
  const [resolvedDayLabel, setResolvedDayLabel] = useState<string | null>(null);
  const [resolvedTimeLabel, setResolvedTimeLabel] = useState<string | null>(null);
  const [resolvedHeadlineSecond, setResolvedHeadlineSecond] = useState<string | null>(null);
  const [parts, setParts] = useState<Parts>(() => partsFor(parseTarget(targetDate)));

  // Re-seed when the prop changes; the resolver effect below may overwrite this.
  useEffect(() => {
    setTarget(parseTarget(targetDate));
  }, [targetDate]);

  // Three-layer date resolution: URL query → backend lookup → prop fallback.
  useEffect(() => {
    let cancelled = false;
    const qp = readQueryParams();

    // Personalization (runs regardless of which date layer wins).
    const stored = readIntakeStorage(storageKey);
    const first = firstName(stored?.data?.primaryName);
    if (first) {
      setResolvedHeadlineSecond(`${headlineLine2}, ${first}`);
    } else {
      setResolvedHeadlineSecond(null);
    }

    // Layer 1: URL query params.
    const queryDate = qp?.get("targetDate") ?? qp?.get("appointmentDate") ?? null;
    if (queryDate && !Number.isNaN(Date.parse(queryDate))) {
      setTarget(new Date(queryDate));
      setResolvedDayLabel(qp?.get("targetLabel") ?? null);
      setResolvedTimeLabel(qp?.get("targetTime") ?? null);
      return;
    }

    // Layer 2: backend lookup.
    const email =
      emailProp ??
      qp?.get("email") ??
      stored?.data?.primaryEmail ??
      null;
    const type =
      appointmentType ?? qp?.get("type") ?? DEFAULT_APPOINTMENT_TYPE;

    if (!email || !apiBaseUrl) {
      // Nothing to fetch; the prop-default already seeded `target`.
      return;
    }

    const slug = slugifyEmail(email);
    const typeSlug = slugifyType(type);
    if (!slug || !typeSlug) return;

    const base = apiBaseUrl.replace(/\/$/, "");
    const url = `${base}/public/appointments/${encodeURIComponent(slug)}/${encodeURIComponent(typeSlug)}`;

    fetch(url, { method: "GET" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { appointmentDate?: string } | null) => {
        if (cancelled || !json?.appointmentDate) return;
        if (Number.isNaN(Date.parse(json.appointmentDate))) return;
        setTarget(new Date(json.appointmentDate));
      })
      .catch((err) => {
        // Soft-fail: keep whatever target we already have.
        // eslint-disable-next-line no-console
        console.warn("[kairos-onboarding-countdown] appointment lookup failed", err);
      });

    return () => {
      cancelled = true;
    };
  }, [
    apiBaseUrl,
    appointmentType,
    emailProp,
    storageKey,
    headlineLine2
  ]);

  useEffect(() => {
    setParts(partsFor(target));
    const id = window.setInterval(() => {
      setParts(partsFor(target));
    }, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  const dayLabel = targetLabel ?? resolvedDayLabel ?? formatDayLabel(target);
  const timeLabel =
    targetTime ?? resolvedTimeLabel ?? formatTimeLabel(target) + " LOCAL";
  const effectiveHeadlineSecond = resolvedHeadlineSecond ?? headlineLine2;

  const dotX = ((Number(parts.s) % 60) / 60) * 1200;

  return (
    <div className="koc-root">
      <div className="koc-marquee">
        <div className="koc-top">
          <div className="koc-index">
            <span className="koc-n">{refIndex}</span>
            &nbsp;/&nbsp;
            {eyebrow}
          </div>
          <div>{topRight}</div>
        </div>

        <div className="koc-anchor">
          <h2>
            {headlineLine1}
            <br />
            {effectiveHeadlineSecond}
            <span className="koc-period">.</span>
          </h2>
          <p className="koc-sub">{subtitle}</p>
        </div>

        <div className="koc-timer">
          <div>
            <div className="koc-label">{timerLabel}</div>
            <div className="koc-clock">
              <span>{parts.d}</span>
              <span className="koc-sep">:</span>
              <span>{parts.h}</span>
              <span className="koc-sep">:</span>
              <span>{parts.m}</span>
              <span className="koc-sep">:</span>
              <span className="koc-secs">{parts.s}</span>
              <span className="koc-units">Days · Hrs · Min · Sec</span>
            </div>
          </div>
          <div className="koc-target">
            <strong>{dayLabel}</strong>
            <br />
            {timeLabel}
          </div>
        </div>

        <div className="koc-pattern" aria-hidden="true">
          <svg viewBox="0 0 1200 96" preserveAspectRatio="none">
            <defs>
              <pattern
                id="koc-weave"
                x="0"
                y="0"
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M0 0 L24 24 M24 0 L0 24"
                  stroke="#2A2A31"
                  strokeWidth="0.5"
                  fill="none"
                />
              </pattern>
            </defs>
            <rect x="0" y="0" width="1200" height="96" fill="url(#koc-weave)" />
            <g stroke="#3A3A44" strokeWidth="0.75" fill="none">
              <line x1="0" y1="20" x2="1200" y2="20" />
              <line x1="0" y1="48" x2="1200" y2="48" />
              <line x1="0" y1="76" x2="1200" y2="76" />
            </g>
            <g transform={`translate(${dotX.toFixed(1)},0)`}>
              <circle cx="0" cy="48" r="2.5" fill="#E50914" />
            </g>
          </svg>
        </div>

        <div className="koc-grid">
          {columns.map((column, columnIndex) => (
            <div className="koc-col" key={`${column.title}-${columnIndex}`}>
              <h4>
                <span>{column.title}</span>
                {column.ord ? <span className="koc-ord">{column.ord}</span> : null}
              </h4>
              <ul>
                {column.items.map((item, itemIndex) => (
                  <li
                    key={`${column.title}-${itemIndex}`}
                    className={item.done ? "koc-done" : undefined}
                  >
                    <span className="koc-ix">{item.ix ?? ""}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="koc-foot">
          <span className="koc-live">{footerLeft}</span>
          <span>{footerRight}</span>
        </div>
      </div>
    </div>
  );
}

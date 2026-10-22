import { useEffect, useMemo, useState } from "react";
import { Field, isFieldComplete, isFieldVisible, sectionStatus } from "./fields";
import { PRE_POST_FIELDS, PRE_RECORDING_FIELDS, SECTIONS } from "./sections";
import type {
  FieldDef,
  FieldValue,
  IntakeData,
  IntakeMode,
  IntakeState,
  IntakeSubmitPayload,
  SectionDef
} from "./types";

const DEFAULT_STORAGE_KEY = "plato_intake_v1";
const DEFAULT_MODE: IntakeMode = "minimum";
const DEFAULT_PROCEED_URL = "https://example.com/next-step";
const TURNSTILE_SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

export interface PlatoIntakeFormProps {
  /** localStorage key. Default: "plato_intake_v1". */
  storageKey?: string;
  /** Free-form attribution (e.g. "website", "landing-page"). Forwarded to onSubmit. */
  source?: string;
  /**
   * Public API base URL (no trailing slash). When set, the submit button POSTs
   * the payload to `${apiBaseUrl}/public/intake`. The server stores the brief
   * in S3 under captures/{slug}/intake.json keyed by Primary contact email.
   */
  apiBaseUrl?: string;
  /** URL the post-submit "Proceed" button navigates to. Default: client onboarding step 3. */
  proceedUrl?: string;
  /**
   * Cloudflare Turnstile site key. When set, a Turnstile widget renders on the
   * review screen and submit is blocked until it solves. The resulting token is
   * sent to the server as `turnstileToken` for verification.
   */
  turnstileSiteKey?: string;
  /** Called when the user clicks Submit on the review screen. Runs after the API POST (if wired). */
  onSubmit?: (payload: IntakeSubmitPayload) => void | Promise<void>;
  /** Called on every change with the latest local state. */
  onChange?: (state: IntakeState) => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

let turnstileScriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (turnstileScriptPromise) return turnstileScriptPromise;
  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${TURNSTILE_SCRIPT_SRC}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Turnstile.")));
      return;
    }
    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Turnstile."));
    document.head.appendChild(script);
  });
  return turnstileScriptPromise;
}

interface TurnstileWidgetProps {
  siteKey: string;
  onToken: (token: string | null) => void;
}

function TurnstileWidget({ siteKey, onToken }: TurnstileWidgetProps) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!container) return;
    let widgetId: string | undefined;
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !window.turnstile) return;
        widgetId = window.turnstile.render(container, {
          sitekey: siteKey,
          callback: (token) => onToken(token),
          "expired-callback": () => onToken(null),
          "error-callback": () => onToken(null)
        });
      })
      .catch(() => onToken(null));

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) {
        window.turnstile.remove(widgetId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container, siteKey]);

  return <div className="turnstile-widget" style={{ margin: "16px 0" }} ref={setContainer} />;
}

function loadState(key: string): Partial<IntakeState> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<IntakeState> | null;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function saveState(key: string, state: IntakeState): void {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    /* noop */
  }
}

export function PlatoIntakeForm(props: PlatoIntakeFormProps = {}): React.ReactElement {
  const storageKey = props.storageKey ?? DEFAULT_STORAGE_KEY;

  const initial = useMemo(() => loadState(storageKey), [storageKey]);
  const [mode, setMode] = useState<IntakeMode | null>(initial.mode ?? DEFAULT_MODE);
  const [stepIdx, setStepIdx] = useState<number>(initial.stepIdx ?? -1);
  const [data, setData] = useState<IntakeData>(initial.data ?? {});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const proceedUrl = props.proceedUrl ?? DEFAULT_PROCEED_URL;

  // Save-as-you-go on every state change.
  useEffect(() => {
    const state: IntakeState = { mode, stepIdx, data };
    saveState(storageKey, state);
    props.onChange?.(state);
  }, [mode, stepIdx, data, storageKey, props]);

  const visibleSections = useMemo<SectionDef[]>(
    () => SECTIONS.filter((s) => !(mode === "minimum" && s.fullOnly)),
    [mode]
  );

  const totalFields = useMemo(
    () =>
      visibleSections.reduce(
        (acc, s) => acc + s.fields.filter((f) => isFieldVisible(f, data, mode)).length,
        0
      ),
    [visibleSections, data, mode]
  );

  const doneFields = useMemo(
    () =>
      visibleSections.reduce(
        (acc, s) =>
          acc +
          s.fields.filter((f) => isFieldVisible(f, data, mode) && isFieldComplete(f, data)).length,
        0
      ),
    [visibleSections, data, mode]
  );

  const progressPct = totalFields ? Math.round((doneFields / totalFields) * 100) : 0;

  const setField = (id: string, value: FieldValue) =>
    setData((d) => ({ ...d, [id]: value }));

  const reset = () => {
    setStepIdx(-1);
    setMode(DEFAULT_MODE);
    setData({});
    setSubmitError(null);
    setIsSubmitting(false);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* noop */
    }
  };

  const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

  const handleSubmit = async () => {
    if (!mode || isSubmitting) return;
    if (props.turnstileSiteKey && !turnstileToken) {
      setSubmitError("Please complete the verification challenge before submitting.");
      return;
    }
    const payload: IntakeSubmitPayload = {
      mode,
      data,
      submittedAt: new Date().toISOString(),
      source: props.source,
      turnstileToken: turnstileToken ?? undefined
    };

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      if (props.apiBaseUrl) {
        const url = `${trimTrailingSlash(props.apiBaseUrl)}/public/intake`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          let message = `Submit failed (${response.status}).`;
          try {
            const errBody = (await response.json()) as { error?: string };
            if (errBody?.error) message = errBody.error;
          } catch {
            /* response had no JSON body */
          }
          throw new Error(message);
        }
      } else {
        // No backend wired — log so the embedder can verify the payload shape.
        // eslint-disable-next-line no-console
        console.info("[plato-intake-form] submission held locally (no apiBaseUrl):", payload);
      }

      if (props.onSubmit) {
        await props.onSubmit(payload);
      }

      setStepIdx(visibleSections.length + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong submitting your brief.";
      // eslint-disable-next-line no-console
      console.error("[plato-intake-form] submit failed:", err);
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCover = stepIdx === -1;
  const isReview = stepIdx === visibleSections.length;
  const isSuccess = stepIdx === visibleSections.length + 1;
  const currentSection = !isCover && !isReview && !isSuccess ? visibleSections[stepIdx] : null;

  if (isCover) {
    return (
      <div className="pif-root">
        <Cover mode={mode} setMode={setMode} onStart={() => setStepIdx(0)} />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="pif-root">
        <Success data={data} mode={mode} onRestart={reset} proceedUrl={proceedUrl} />
      </div>
    );
  }

  return (
    <div className="pif-root">
      <header className="intake-top">
        <div className="brand">
          <span className="mark"></span>
          <span className="word">Xallindrome</span>
          <span className="title-row" style={{ marginLeft: 24 }}>
            <span className="doc-title">
              <strong>INTAKE</strong> · Thought Leadership Intake
            </span>
          </span>
        </div>
        <div className="progress-mini">
          <span>
            Progress ·{" "}
            <strong style={{ color: "var(--fg-2)" }}>
              {doneFields}/{totalFields}
            </strong>
          </span>
          <span
            className="progress-bar"
            style={{ ["--progress" as string]: progressPct + "%" } as React.CSSProperties}
          ></span>
          <span>{progressPct}%</span>
        </div>
      </header>

      <div className="intake-shell">
        <aside className="intake-side">
          <div className="head">
            <span className="x-micro">Sections</span>
            <span className="x-nano">{visibleSections.length} TOTAL</span>
          </div>
          {visibleSections.map((s, i) => {
            const status = sectionStatus(s, data, mode);
            const isActive = stepIdx === i;
            return (
              <button
                key={s.id}
                className={`step ${isActive ? "is-active" : ""}`}
                onClick={() => setStepIdx(i)}
              >
                <span className="step-ref">REF.{s.ref}</span>
                <span className="step-name">{s.name}</span>
                <span
                  className={`step-dot ${status.isComplete ? "is-done" : isActive ? "is-active" : ""}`}
                ></span>
              </button>
            );
          })}

          <button
            className={`step ${isReview ? "is-active" : ""}`}
            style={{ marginTop: 8 }}
            onClick={() => setStepIdx(visibleSections.length)}
          >
            <span className="step-ref">REF.13</span>
            <span className="step-name">Review &amp; Submit</span>
            <span className={`step-dot ${isReview ? "is-active" : ""}`}></span>
          </button>

          <div className="mode-toggle">
            <span className="x-micro">Intake Mode</span>
            <div className="mode-row" onClick={() => setMode("minimum")}>
              <span className={`radio ${mode === "minimum" ? "on" : ""}`}></span>
              <span>Minimum Viable</span>
              <span className="meta">~12 MIN</span>
            </div>
            <div className="mode-row" onClick={() => setMode("full")}>
              <span className={`radio ${mode === "full" ? "on" : ""}`}></span>
              <span>Full Strategic</span>
              <span className="meta">~45 MIN</span>
            </div>
          </div>
        </aside>

        <main className="intake-main">
          {currentSection && (
            <SectionView
              key={currentSection.id}
              section={currentSection}
              data={data}
              setField={setField}
              mode={mode}
              index={stepIdx}
              total={visibleSections.length}
            />
          )}
          {isReview && (
            <ReviewView
              sections={visibleSections}
              data={data}
              mode={mode}
              onJump={(i) => setStepIdx(i)}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitError={submitError}
              turnstileSiteKey={props.turnstileSiteKey}
              onTurnstileToken={setTurnstileToken}
            />
          )}
        </main>
      </div>

      <footer className="intake-footer">
        <div className="nav-meta">
          {currentSection ? (
            <>
              SECTION <strong>{currentSection.ref}</strong> / 12 · {currentSection.name}
            </>
          ) : isReview ? (
            <>
              REVIEW · {doneFields}/{totalFields} fields complete
            </>
          ) : null}
        </div>
        <div className="actions">
          <button
            className="btn btn-ghost"
            onClick={() => setStepIdx(Math.max(-1, stepIdx - 1))}
            disabled={stepIdx <= 0}
          >
            <span className="x-arrow">←</span> Back
          </button>
          {!isReview && (
            <button className="btn btn-primary" onClick={() => setStepIdx(stepIdx + 1)}>
              {stepIdx === visibleSections.length - 1 ? "Review" : "Continue"}{" "}
              <span className="x-arrow">→</span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

/* ---------- COVER ---------- */

interface CoverProps {
  mode: IntakeMode | null;
  setMode: (m: IntakeMode) => void;
  onStart: () => void;
}

function Cover({ mode, setMode, onStart }: CoverProps) {
  const stamp = new Date().toISOString().split("T")[0].replace(/-/g, ".");
  return (
    <div className="intake-cover">
      <div className="grid"></div>
      <div className="meta-tl">
        <span>INTAKE</span>
        <span>v1.0</span>
        <span>STATUS · LIVE</span>
      </div>
      <div className="meta-tr">
        <span>{stamp}</span>
        <span>NEW CLIENT INTAKE</span>
      </div>
      <div className="meta-bl">
        <span>FORM · 12 SECTIONS</span>
        <span>SAVE-AS-YOU-GO</span>
      </div>
      <div className="meta-br">
        <span>XALLINDROME · 2026</span>
      </div>
      <div className="num">001</div>
      <h1 className="cover">
        Tell us
        <br />
        what you <span className="acc">know.</span>
      </h1>
      <p className="lede">
        Before we research, script, film, or post a single piece of content, we need a clear picture of
        your business, your voice, and your hard nos. This brief becomes the operating system every
        script, post, and approval flows through. Save as you go — your answers are stored locally until
        you submit.
      </p>
      <div className="modes">
        <div className={`mode-card ${mode === "minimum" ? "is-on" : ""}`} onClick={() => setMode("minimum")}>
          <div className="mode-head">
            <h3 className="mode-name">
              Minimum
              <br />
              Viable Intake
            </h3>
            <span className="x-micro">REF.A</span>
          </div>
          <p className="mode-desc">
            The smallest set of answers we need to start filming and posting. Perfect for kicking off
            fast and filling in detail later.
          </p>
          <div className="mode-stats">
            <div className="stat">
              <span className="v">12</span>
              <span className="l">Min to complete</span>
            </div>
            <div className="stat">
              <span className="v">~38</span>
              <span className="l">Required fields</span>
            </div>
            <div className="stat">
              <span className="v">6</span>
              <span className="l">Sections</span>
            </div>
          </div>
        </div>
        <div className={`mode-card ${mode === "full" ? "is-on" : ""}`} onClick={() => setMode("full")}>
          <div className="mode-head">
            <h3 className="mode-name">
              Full
              <br />
              Strategic Intake
            </h3>
            <span className="x-micro">REF.B</span>
          </div>
          <p className="mode-desc">
            The full brief — audience profiling, voice calibration, automation mapping, risk surfacing.
            Recommended for high-ticket engagements.
          </p>
          <div className="mode-stats">
            <div className="stat">
              <span className="v">45</span>
              <span className="l">Min to complete</span>
            </div>
            <div className="stat">
              <span className="v">~90</span>
              <span className="l">Total fields</span>
            </div>
            <div className="stat">
              <span className="v">12</span>
              <span className="l">Sections</span>
            </div>
          </div>
        </div>
      </div>
      <div className="cover-cta">
        <button className="btn btn-primary" onClick={onStart} disabled={!mode}>
          Begin intake <span className="x-arrow">→</span>
        </button>
        <span className="x-micro" style={{ color: mode ? "var(--fg-3)" : "var(--fg-4)" }}>
          {mode
            ? `Mode locked → ${mode === "minimum" ? "MINIMUM VIABLE" : "FULL STRATEGIC"}`
            : "Select an intake mode to continue"}
        </span>
      </div>
    </div>
  );
}

/* ---------- SECTION VIEW ---------- */

interface SectionViewProps {
  section: SectionDef;
  data: IntakeData;
  setField: (id: string, value: FieldValue) => void;
  mode: IntakeMode | null;
  index: number;
  total: number;
}

function SectionView({ section, data, setField, mode, index, total }: SectionViewProps) {
  const visibleFields = section.fields.filter((f) => isFieldVisible(f, data, mode));
  return (
    <>
      <div className="intake-section-head">
        <div className="title-block">
          <span className="x-micro">
            REF.{section.ref} / {String(total).padStart(2, "0")} · Section {index + 1}
          </span>
          <h1>{section.name}</h1>
          <p className="desc">{section.desc}</p>
        </div>
        <span className="sect-num">{section.ref}</span>
      </div>
      <div className="field-list">
        {visibleFields.map((f, i) => (
          <Field
            key={f.id}
            field={f}
            value={data[f.id]}
            onChange={(v) => setField(f.id, v)}
            idx={i + 1}
          />
        ))}
      </div>
    </>
  );
}

/* ---------- REVIEW ---------- */

interface ReviewViewProps {
  sections: SectionDef[];
  data: IntakeData;
  mode: IntakeMode | null;
  onJump: (i: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitError: string | null;
  turnstileSiteKey?: string;
  onTurnstileToken: (token: string | null) => void;
}

function buildSummary(section: SectionDef, data: IntakeData): string {
  const bits: string[] = [];
  for (const f of section.fields) {
    const v = data[f.id];
    if (
      v === undefined ||
      v === null ||
      v === "" ||
      (Array.isArray(v) && v.length === 0)
    )
      continue;
    let str = Array.isArray(v)
      ? (v as Array<string | { name?: string }>)
          .map((x) => (typeof x === "object" && x !== null && "name" in x ? x.name ?? "" : String(x)))
          .join(", ")
      : String(v);
    if (str.length > 64) str = str.slice(0, 64) + "…";
    bits.push(`${f.q.replace(/\?$/, "")}: ${str}`);
    if (bits.length >= 3) break;
  }
  return bits.join(" · ");
}

function fieldSeed(id: string, data: IntakeData): FieldDef {
  return {
    id,
    q: id,
    type: typeof data[id] === "object" && data[id] !== null ? "multi" : "text"
  };
}

function ReviewView({
  sections,
  data,
  mode,
  onJump,
  onSubmit,
  isSubmitting,
  submitError,
  turnstileSiteKey,
  onTurnstileToken
}: ReviewViewProps) {
  const totalRequired = sections.reduce((acc, s) => acc + sectionStatus(s, data, mode).requiredTotal, 0);
  const doneRequired = sections.reduce((acc, s) => acc + sectionStatus(s, data, mode).requiredDone, 0);
  const allRequiredDone = doneRequired === totalRequired;

  const recReady = PRE_RECORDING_FIELDS.filter((id) => isFieldComplete(fieldSeed(id, data), data)).length;
  const postReady = PRE_POST_FIELDS.filter((id) => isFieldComplete(fieldSeed(id, data), data)).length;

  return (
    <>
      <div className="intake-section-head">
        <div className="title-block">
          <span className="x-micro">REF.13 · REVIEW</span>
          <h1>
            Last look
            <br />
            before submit.
          </h1>
          <p className="desc">
            Skim each section. Click any card to jump back and edit. We'll only accept submissions where
            every required field is filled — that's how we keep the back-and-forth low later.
          </p>
        </div>
        <span className="sect-num">13</span>
      </div>

      <div className="row-2" style={{ marginBottom: 32 }}>
        <div style={{ padding: 24, border: "1px solid var(--line-1)", background: "var(--bg-2)" }}>
          <div className="x-micro" style={{ marginBottom: 8 }}>
            Pre-Recording Readiness
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 36, color: "var(--fg-1)" }}>
            {recReady}
            <span className="x-faint">/{PRE_RECORDING_FIELDS.length}</span>
          </div>
          <div className="x-nano" style={{ marginTop: 8 }}>
            Fields needed before first film day
          </div>
        </div>
        <div style={{ padding: 24, border: "1px solid var(--line-1)", background: "var(--bg-2)" }}>
          <div className="x-micro" style={{ marginBottom: 8 }}>
            Pre-Publish Readiness
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 36, color: "var(--fg-1)" }}>
            {postReady}
            <span className="x-faint">/{PRE_POST_FIELDS.length}</span>
          </div>
          <div className="x-nano" style={{ marginTop: 8 }}>
            Fields needed before first live post
          </div>
        </div>
      </div>

      <div className="review-grid">
        {sections.map((s, i) => {
          const status = sectionStatus(s, data, mode);
          const summary = buildSummary(s, data);
          const pct = status.requiredTotal
            ? Math.round((status.requiredDone / status.requiredTotal) * 100)
            : status.allTotal
              ? Math.round((status.allDone / status.allTotal) * 100)
              : 0;
          return (
            <div key={s.id} className="review-cell">
              <div className="head">
                <span className="x-micro">
                  REF.{s.ref} · {s.name}
                </span>
                <span className={`pct ${pct === 100 ? "full" : ""}`}>{pct}%</span>
              </div>
              <p className="summary">
                {summary || <span className="x-faint">No answers yet.</span>}
              </p>
              <button className="edit" onClick={() => onJump(i)}>
                Edit section <span className="x-arrow">→</span>
              </button>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 48,
          padding: 24,
          borderTop: "1px solid var(--line-1)"
        }}
      >
        <div>
          <div className="x-micro">Submission status</div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 24,
              color: allRequiredDone ? "var(--fg-1)" : "var(--volcanic-000)",
              marginTop: 6
            }}
          >
            {allRequiredDone
              ? "Ready to submit."
              : `${totalRequired - doneRequired} required field${
                  totalRequired - doneRequired === 1 ? "" : "s"
                } remaining`}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          {turnstileSiteKey && (
            <TurnstileWidget siteKey={turnstileSiteKey} onToken={onTurnstileToken} />
          )}
          <button
            className="btn btn-primary"
            disabled={!allRequiredDone || isSubmitting}
            onClick={onSubmit}
          >
            {isSubmitting ? "Submitting…" : "Submit intake"} <span className="x-arrow">→</span>
          </button>
          {submitError && (
            <span
              className="x-micro"
              style={{ color: "var(--volcanic-000)", maxWidth: 360, textAlign: "right" }}
            >
              {submitError}
            </span>
          )}
        </div>
      </div>
    </>
  );
}

/* ---------- SUCCESS ---------- */

interface SuccessProps {
  data: IntakeData;
  mode: IntakeMode | null;
  onRestart: () => void;
  proceedUrl: string;
}

function Success({ data, mode, onRestart, proceedUrl }: SuccessProps) {
  const name = typeof data.businessName === "string" && data.businessName ? data.businessName : "Client";
  const commsArr = Array.isArray(data.commsPref) ? (data.commsPref as string[]) : null;
  const platforms = Array.isArray(data.platforms) ? (data.platforms as string[]) : null;
  const firstTopics =
    typeof data.firstTopics === "string"
      ? data.firstTopics.length > 80
        ? data.firstTopics.slice(0, 80) + "…"
        : data.firstTopics
      : "from your first-recording list.";
  const tool = typeof data.tool === "string" && data.tool ? data.tool : "recording";
  const scriptApprover =
    typeof data.scriptApprover === "string" && data.scriptApprover
      ? `${data.scriptApprover} reviews and approves.`
      : "Your script approver reviews and approves.";
  const reportingCadence =
    typeof data.reportingCadence === "string" && data.reportingCadence
      ? data.reportingCadence
      : "monthly written report";

  return (
    <>
      <header className="intake-top">
        <div className="brand">
          <span className="mark"></span>
          <span className="word">Xallindrome</span>
          <span className="title-row" style={{ marginLeft: 24 }}>
            <span className="doc-title">
              <strong>INTAKE</strong> · Submitted
            </span>
          </span>
        </div>
        <div className="progress-mini">
          <span>
            STATUS · <strong style={{ color: "var(--volcanic-000)" }}>RECEIVED</strong>
          </span>
        </div>
      </header>

      <main className="intake-success-main">
        <div className="success-wrap">
          <span className="x-micro">REF.13 · CONFIRMATION</span>
          <h2>
            Brief locked.
            <br />
            The work <span className="acc">starts now.</span>
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "var(--fg-2)",
              lineHeight: 1.6,
              margin: 0,
              maxWidth: "60ch"
            }}
          >
            Thanks, {name}. Your intake has been received and routed to our team. Here's what happens
            next, in order, with the humans who own each step.
          </p>

          <div
            style={{
              padding: 24,
              border: "1px solid var(--volcanic-000)",
              background: "rgba(229, 9, 20, 0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
              flexWrap: "wrap"
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
              <span className="x-micro">Next step · Onboarding call</span>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 22,
                  letterSpacing: "-0.015em",
                  color: "var(--fg-1)",
                  lineHeight: 1.2
                }}
              >
                Now book your onboarding call.
              </span>
            </div>
            <a
              className="btn btn-primary"
              href={proceedUrl}
              target="_top"
              rel="noopener noreferrer"
            >
              Proceed <span className="x-arrow">→</span>
            </a>
          </div>

          <div className="next">
            <span className="x-micro">+0 DAYS</span>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 22,
                  color: "var(--fg-1)",
                  marginBottom: 4
                }}
              >
                Internal review
              </div>
              <p style={{ margin: 0, color: "var(--fg-3)", fontSize: 14, lineHeight: 1.55 }}>
                Our strategist reads the brief end to end and flags any gaps. You'll get a confirmation
                in {commsArr ? commsArr.join(" / ") : "email"} within one business day.
              </p>
            </div>
          </div>
          <div className="next">
            <span className="x-micro">+2 DAYS</span>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 22,
                  color: "var(--fg-1)",
                  marginBottom: 4
                }}
              >
                Kickoff call
              </div>
              <p style={{ margin: 0, color: "var(--fg-3)", fontSize: 14, lineHeight: 1.55 }}>
                30-minute alignment call. We confirm the brief, lock the topic universe, and finalize
                the {tool} setup.
              </p>
            </div>
          </div>
          <div className="next">
            <span className="x-micro">+5 DAYS</span>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 22,
                  color: "var(--fg-1)",
                  marginBottom: 4
                }}
              >
                First scripts delivered
              </div>
              <p style={{ margin: 0, color: "var(--fg-3)", fontSize: 14, lineHeight: 1.55 }}>
                10 scripts in your queue, written against your voice profile. {scriptApprover}
              </p>
            </div>
          </div>
          <div className="next">
            <span className="x-micro">+7 DAYS</span>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 22,
                  color: "var(--fg-1)",
                  marginBottom: 4
                }}
              >
                First recording session
              </div>
              <p style={{ margin: 0, color: "var(--fg-3)", fontSize: 14, lineHeight: 1.55 }}>
                We record your first batch — enough raw footage for ~30 days of content. Topics:{" "}
                {firstTopics}
              </p>
            </div>
          </div>
          <div className="next">
            <span className="x-micro">+14 DAYS</span>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 22,
                  color: "var(--fg-1)",
                  marginBottom: 4
                }}
              >
                First live post
              </div>
              <p style={{ margin: 0, color: "var(--fg-3)", fontSize: 14, lineHeight: 1.55 }}>
                Your first piece of approved content goes live across{" "}
                {platforms ? platforms.join(" + ") : "your platforms"}. Reporting cadence:{" "}
                {reportingCadence}.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 24,
              borderTop: "1px solid var(--line-1)"
            }}
          >
            <span className="x-micro">
              Need to update something? Reply to your confirmation email any time.
            </span>
            <button className="btn btn-secondary" onClick={onRestart}>
              Start a new brief
            </button>
          </div>
        </div>

        <div
          style={{
            marginTop: 48,
            display: "flex",
            justifyContent: "space-between",
            color: "var(--fg-4)",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.16em",
            textTransform: "uppercase"
          }}
        >
          <span>INTAKE · {mode === "minimum" ? "MINIMUM VIABLE" : "FULL STRATEGIC"} · v1.0</span>
          <span>RECEIVED · {new Date().toISOString().split("T")[0]}</span>
        </div>
      </main>
    </>
  );
}

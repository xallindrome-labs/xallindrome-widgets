import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Icon, type IconName } from "./icons";
import {
  ARCHETYPES,
  INTERSTITIAL_COPY,
  LEAK_LABELS,
  NICHE_CHOICES,
  NICHE_IDS,
  QUESTION_IDS,
  REVENUE_OPTIONS,
  REVENUE_PROMPT,
  buildQuestions,
  computeLocalLeakResult,
  severityForScore,
  type ArchetypeMeta,
  type NicheId,
  type QuestionId,
  type QuizOption,
  type RevenueBand
} from "./quizContent";

export interface DelphiQuizWidgetProps {
  /** Base URL of your backend; the quiz posts to `${apiBaseUrl}/public/automation/quiz`. */
  apiBaseUrl?: string;
  /** Calendar embed URL (e.g. a booking-page embed) rendered inline on the result screen, pre-filled with the lead's details. */
  calendarEmbedUrl?: string;
  /** Fallback booking link when no calendar embed is configured. */
  bookingUrl?: string;
  /** Skip the niche picker and lock the quiz to one niche. */
  niche?: string;
  source?: string;
}

type Step =
  | { kind: "intro" }
  | { kind: "niche" }
  | { kind: "question"; questionIndex: number }
  | { kind: "interstitial" }
  | { kind: "revenue" }
  | { kind: "gate" }
  | { kind: "analyzing" }
  | { kind: "result" };

interface QuizResult {
  leakScore: number;
  archetype: ArchetypeMeta;
  topLeak: { questionId: QuestionId; label: string };
}

const TOTAL_PROGRESS_STEPS = 7; // niche + 5 scored questions + revenue

// Every line must describe something the scorer actually does. There is no
// benchmark dataset — the Leak Score is a fixed five-question rubric — so any
// "compared against N businesses" phrasing would be an invented claim.
// Each badge maps to a stated commitment in the Moat & 3-Tier Offer doc:
// fixed-fee scoping, written SOPs ("not left in someone's head"), and the dual
// automation + content capability. No claim here is invented.
const TRUST_BADGES: { icon: IconName; label: string }[] = [
  { icon: "lock", label: "Fixed scope, fixed fee" },
  { icon: "note", label: "Every build documented" },
  { icon: "rings", label: "Automation + content, one team" }
];

const ANALYZING_LINES = [
  "Scoring your speed-to-lead…",
  "Checking your after-hours coverage…",
  "Weighing follow-up and rebooking…",
  "Locating your #1 leak…"
];

const ANALYZING_MIN_MS = 3400;
const ADVANCE_DELAY_MS = 240;

function isNicheId(value: string | undefined): value is NicheId {
  return Boolean(value) && (NICHE_IDS as readonly string[]).includes(value as string);
}

function collectUtms(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const utms: Record<string, string> = {};
  params.forEach((value, key) => {
    if (key.startsWith("utm_") && value) {
      utms[key] = value;
    }
  });
  return utms;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}

function OptionCheck() {
  return (
    <span className="aqw-option-check" aria-hidden="true">
      <svg width="12" height="12" viewBox="0 0 12 12">
        <path d="M2 6.2 L4.8 9 L10 3.4" />
      </svg>
    </span>
  );
}

function CountUp({ target, duration, suffix }: { target: number; duration: number; suffix?: string }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return (
    <>
      {value}
      {suffix ?? ""}
    </>
  );
}

const CONFETTI_COLORS = ["#d9b47c", "#6fcf97", "#e8c468", "#f4f0e8", "#e89a5b"];

function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 22 }, (_, index) => ({
        x: (index * 41 + 13) % 100,
        delay: (index * 53) % 420,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length]
      })),
    []
  );

  return (
    <div className="aqw-confetti" aria-hidden="true">
      {pieces.map((piece, index) => (
        <i
          key={index}
          style={
            {
              "--aqw-x": piece.x,
              "--aqw-d": piece.delay,
              "--aqw-c": piece.color
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const [displayed, setDisplayed] = useState(0);
  const radius = 74;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const duration = 1400;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(score * eased));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const offset = circumference * (1 - displayed / 100);

  return (
    <div className="aqw-ring-wrap">
      <svg width="168" height="168" viewBox="0 0 168 168">
        <circle
          cx="84"
          cy="84"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="11"
        />
        <circle
          cx="84"
          cy="84"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 84 84)"
        />
      </svg>
      <div className="aqw-ring-score">
        <div className="aqw-ring-number" style={{ color }}>
          {displayed}
        </div>
        <div className="aqw-ring-caption">Leak Score</div>
      </div>
    </div>
  );
}

export function DelphiQuizWidget(props: DelphiQuizWidgetProps) {
  const lockedNiche = isNicheId(props.niche) ? props.niche : undefined;
  const [step, setStep] = useState<Step>({ kind: "intro" });
  const [niche, setNiche] = useState<NicheId>(lockedNiche ?? "med-spa");
  const [answers, setAnswers] = useState<Partial<Record<QuestionId, QuizOption>>>({});
  const [revenueBand, setRevenueBand] = useState<RevenueBand | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; phone?: string }>({});
  const [analyzingLine, setAnalyzingLine] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(null);
  const advanceTimer = useRef<number | null>(null);
  // Direction drives which way a screen slides, so motion tells you whether you
  // moved forward or went back. The exit plays inside the tap-confirm delay that
  // already existed, so seamlessness costs zero added latency.
  const [direction, setDirection] = useState<"fwd" | "back">("fwd");
  const [isExiting, setIsExiting] = useState(false);
  // The card swings ~116px across the flow (480 on the intro, 596 on the gate).
  // Left alone that snaps the moment content swaps; measuring each screen and
  // transitioning the height turns it into a morph. The result screen is
  // excluded — its calendar iframe resizes after load and must stay auto.
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageHeight, setStageHeight] = useState<number | null>(null);

  const questions = useMemo(() => buildQuestions(niche), [niche]);

  // Tall screens (gate, result) leave a phone scrolled mid-page; without this the
  // next screen arrives already scrolled past its own headline.
  useEffect(() => {
    const card = stageRef.current?.closest(".aqw-card");
    if (!card) return;
    const top = card.getBoundingClientRect().top + window.scrollY - 16;
    if (window.scrollY > top + 4) window.scrollTo({ top, behavior: "smooth" });
  }, [step]);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    if (step.kind === "result") {
      setStageHeight(null);
      return;
    }
    const locked = el.style.height;
    el.style.height = "auto";
    const natural = el.scrollHeight;
    el.style.height = locked;
    setStageHeight(natural);
  }, [step]);

  useEffect(() => {
    return () => {
      if (advanceTimer.current !== null) {
        window.clearTimeout(advanceTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (step.kind !== "analyzing") return;
    setAnalyzingLine(0);
    const interval = window.setInterval(() => {
      setAnalyzingLine((line) => Math.min(line + 1, ANALYZING_LINES.length - 1));
    }, 900);
    return () => window.clearInterval(interval);
  }, [step.kind]);

  const progressSteps = (() => {
    switch (step.kind) {
      case "intro":
        return 0;
      case "niche":
        return lockedNiche ? 1 : 0.5;
      case "question":
        return 1 + step.questionIndex + 0.5;
      case "interstitial":
        return 3;
      case "revenue":
        return 6.5;
      default:
        return TOTAL_PROGRESS_STEPS;
    }
  })();
  const progressPercent = Math.min(100, (progressSteps / TOTAL_PROGRESS_STEPS) * 100);

  // Back and the step count live in a fixed bar instead of at the end of each
  // screen, so they stop moving as screens change height.
  const canGoBack =
    step.kind === "question" || step.kind === "revenue" || step.kind === "gate";
  const stepCount = (() => {
    if (step.kind === "niche") return "1 of 7";
    if (step.kind === "question") return `${step.questionIndex + 2} of 7`;
    if (step.kind === "revenue") return "7 of 7";
    return "";
  })();

  function transitionTo(next: Step, dir: "fwd" | "back" = "fwd") {
    if (advanceTimer.current !== null) {
      window.clearTimeout(advanceTimer.current);
    }
    setDirection(dir);
    setIsExiting(true);
    advanceTimer.current = window.setTimeout(() => {
      setSelectedOptionId(null);
      setStep(next);
      setIsExiting(false);
    }, ADVANCE_DELAY_MS);
  }

  function advanceAfterTap(next: Step) {
    transitionTo(next, "fwd");
  }

  function handleStart() {
    transitionTo(lockedNiche ? { kind: "question", questionIndex: 0 } : { kind: "niche" }, "fwd");
  }

  function handleNicheTap(nicheId: NicheId) {
    setNiche(nicheId);
    setAnswers({});
    setSelectedOptionId(nicheId);
    advanceAfterTap({ kind: "question", questionIndex: 0 });
  }

  function handleAnswerTap(questionIndex: number, option: QuizOption) {
    const question = questions[questionIndex];
    setAnswers((current) => ({ ...current, [question.id]: option }));
    setSelectedOptionId(option.id);
    const next: Step =
      question.id === "followup"
        ? { kind: "interstitial" }
        : questionIndex + 1 < questions.length
          ? { kind: "question", questionIndex: questionIndex + 1 }
          : { kind: "revenue" };
    advanceAfterTap(next);
  }

  function handleRevenueTap(band: RevenueBand) {
    setRevenueBand(band);
    setSelectedOptionId(band);
    advanceAfterTap({ kind: "gate" });
  }

  function goBackFrom(current: Step) {
    if (current.kind === "question") {
      if (current.questionIndex === 0) {
        transitionTo(lockedNiche ? { kind: "intro" } : { kind: "niche" }, "back");
      } else {
        transitionTo({ kind: "question", questionIndex: current.questionIndex - 1 }, "back");
      }
      return;
    }
    if (current.kind === "revenue") {
      transitionTo({ kind: "question", questionIndex: questions.length - 1 }, "back");
      return;
    }
    if (current.kind === "gate") {
      transitionTo({ kind: "revenue" }, "back");
    }
  }

  async function handleGateSubmit() {
    // Validate per field so the message sits under the input that's wrong,
    // rather than one generic line the reader has to map back to a field.
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const errors: { email?: string; phone?: string } = {};
    if (!trimmedEmail) {
      errors.email = "We need an email to send your report.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "That email looks incomplete.";
    }
    if (trimmedPhone && trimmedPhone.replace(/\D/g, "").length < 10) {
      errors.phone = "That number looks too short.";
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    transitionTo({ kind: "analyzing" }, "fwd");

    const completeAnswers = answers as Record<QuestionId, QuizOption>;
    const startedAt = performance.now();
    let quizResult: QuizResult | null = null;

    if (props.apiBaseUrl) {
      try {
        const response = await fetch(
          `${trimTrailingSlash(props.apiBaseUrl)}/public/automation/quiz`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: trimmedEmail,
              firstName: firstName.trim() || undefined,
              phone: phone.trim() || undefined,
              niche,
              revenueBand,
              answers: Object.fromEntries(
                QUESTION_IDS.map((id) => [id, completeAnswers[id].id])
              ),
              source: props.source ?? "leak-score-quiz",
              raw: { utms: collectUtms(), page: window.location.href }
            })
          }
        );
        if (response.ok) {
          const body = (await response.json()) as {
            leakScore: number;
            archetype: { id: keyof typeof ARCHETYPES };
            topLeak: { questionId: QuestionId; label: string };
          };
          quizResult = {
            leakScore: body.leakScore,
            archetype: ARCHETYPES[body.archetype.id],
            topLeak: body.topLeak
          };
        }
      } catch {
        // Fall through to the local mirror below.
      }
    }

    if (!quizResult) {
      const local = computeLocalLeakResult(completeAnswers);
      quizResult = {
        leakScore: local.leakScore,
        archetype: local.archetype,
        topLeak: { questionId: local.topLeak.questionId, label: local.topLeak.label }
      };
    }

    const elapsed = performance.now() - startedAt;
    const remaining = Math.max(0, ANALYZING_MIN_MS - elapsed);
    window.setTimeout(() => {
      setResult(quizResult);
      setStep({ kind: "result" });
    }, remaining);
  }

  function renderIntro() {
    return (
      <div className="aqw-screen">
        <div className="aqw-step-label">The 60-second diagnostic</div>
        <span className="aqw-drip" aria-hidden="true">
          <Icon name="drop" />
        </span>
        <h2 className="aqw-title">Where is your business leaking bookings?</h2>
        <p className="aqw-subtitle">
          8 taps. 60 seconds. Get your Leak Score, your leak archetype, and the #1
          fix that would move revenue first.
        </p>
        <div className="aqw-badges">
          {TRUST_BADGES.map((b) => (
            <span className="aqw-badge" key={b.label}>
              <Icon name={b.icon} />
              {b.label}
            </span>
          ))}
        </div>
        <div className="aqw-options">
          <button type="button" className="aqw-cta aqw-cta-glow" onClick={handleStart}>
            Find my leaks →
          </button>
        </div>
        <div className="aqw-trust">No spam. Instant on-screen results.</div>
      </div>
    );
  }

  function renderNiche() {
    return (
      <div className="aqw-screen">
        <h2 className="aqw-prompt">First: what kind of empire are we talking about?</h2>
        <div className="aqw-options">
          {NICHE_CHOICES.map((choice, index) => (
            <button
              key={choice.id}
              type="button"
              className={`aqw-option${selectedOptionId === choice.id ? " aqw-selected" : ""}`}
              style={{ "--aqw-i": index } as CSSProperties}
              onClick={() => handleNicheTap(choice.id)}
            >
              <span className="aqw-option-ic"><Icon name={choice.icon} /></span>
              <span>{choice.label}</span>
              <OptionCheck />
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderQuestion(questionIndex: number) {
    const question = questions[questionIndex];
    return (
      <div className="aqw-screen" key={question.id}>
        <h2 className="aqw-prompt">{question.prompt}</h2>
        <div className="aqw-options">
          {question.options.map((option, index) => (
            <button
              key={option.id}
              type="button"
              className={`aqw-option${selectedOptionId === option.id ? " aqw-selected" : ""}`}
              style={{ "--aqw-i": index } as CSSProperties}
              onClick={() => handleAnswerTap(questionIndex, option)}
            >
              <span className="aqw-option-ic"><Icon name={option.icon} /></span>
              <span>{option.label}</span>
              <OptionCheck />
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderInterstitial() {
    return (
      <div className="aqw-screen">
        <div className="aqw-interstitial">
          <div className="aqw-interstitial-emoji">📊</div>
          <div className="aqw-interstitial-number">
            <CountUp target={60} duration={1100} suffix="×" />
          </div>
          <p className="aqw-interstitial-copy">{INTERSTITIAL_COPY}</p>
          <div className="aqw-options">
            <button
              type="button"
              className="aqw-cta"
              onClick={() => transitionTo({ kind: "question", questionIndex: 2 }, "fwd")}
            >
              3 to go →
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderRevenue() {
    return (
      <div className="aqw-screen">
        <h2 className="aqw-prompt">{REVENUE_PROMPT}</h2>
        <div className="aqw-options">
          {REVENUE_OPTIONS.map((option, index) => (
            <button
              key={option.id}
              type="button"
              className={`aqw-option${selectedOptionId === option.id ? " aqw-selected" : ""}`}
              style={{ "--aqw-i": index } as CSSProperties}
              onClick={() => handleRevenueTap(option.id)}
            >
              <span className="aqw-option-ic"><Icon name={option.icon} /></span>
              <span>{option.label}</span>
              <OptionCheck />
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderGate() {
    return (
      <div className="aqw-screen">
        <div className="aqw-step-label">Your report is ready</div>
        <h2 className="aqw-title">Where should we send your Leak Report?</h2>
        <p className="aqw-subtitle">
          Your score shows on screen instantly. The full report with your fixes
          lands in your inbox.
        </p>
        <div className="aqw-field">
          <label htmlFor="aqw-first-name">First name</label>
          <input
            id="aqw-first-name"
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
          />
        </div>
        <div className="aqw-field">
          <label htmlFor="aqw-email">Email</label>
          <input
            id="aqw-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            className={fieldErrors.email ? "aqw-input-err" : undefined}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {fieldErrors.email ? <span className="aqw-field-msg">{fieldErrors.email}</span> : null}
        </div>
        <div className="aqw-field">
          <label htmlFor="aqw-phone">Phone for the fast lane (optional)</label>
          <input
            id="aqw-phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            className={fieldErrors.phone ? "aqw-input-err" : undefined}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
          {fieldErrors.phone ? <span className="aqw-field-msg">{fieldErrors.phone}</span> : null}
        </div>
        <div className="aqw-options">
          <button type="button" className="aqw-cta" onClick={() => void handleGateSubmit()}>
            Show my Leak Score
          </button>
        </div>
      </div>
    );
  }

  function renderAnalyzing() {
    return (
      <div className="aqw-screen">
        <div className="aqw-analyzing">
          <div className="aqw-steps">
            {ANALYZING_LINES.map((line, i) => (
              <div
                key={line}
                className={`aqw-step${i < analyzingLine ? " is-done" : i === analyzingLine ? " is-active" : ""}`}
              >
                <span className="aqw-step-dot">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4"
                    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                {line}
              </div>
            ))}
          </div>
          <div className="aqw-tbar" aria-hidden="true"><span /></div>
        </div>
      </div>
    );
  }

  function renderResult() {
    if (!result) return null;
    const severity = severityForScore(result.leakScore);
    const completeAnswers = answers as Record<QuestionId, QuizOption>;
    const worstTwo = [...QUESTION_IDS]
      .sort((a, b) => completeAnswers[b].points - completeAnswers[a].points)
      .slice(0, 2);

    const calendarUrl = (() => {
      if (!props.calendarEmbedUrl) return null;
      try {
        const url = new URL(props.calendarEmbedUrl);
        if (email.trim()) url.searchParams.set("email", email.trim());
        if (firstName.trim()) url.searchParams.set("first_name", firstName.trim());
        if (phone.trim()) url.searchParams.set("phone", phone.trim());
        return url.toString();
      } catch {
        return props.calendarEmbedUrl;
      }
    })();

    return (
      <div className="aqw-screen">
        <ConfettiBurst />
        <div className="aqw-result-header">
          <ScoreRing score={result.leakScore} color={severity.color} />
          <div className="aqw-severity" style={{ color: severity.color }}>
            {severity.label.toUpperCase()}
          </div>
        </div>
        <div className="aqw-archetype aqw-reveal-1">
          <div className="aqw-archetype-ic"><Icon name={result.archetype.icon} /></div>
          <div>
            <p className="aqw-archetype-title">
              {firstName.trim() ? `${firstName.trim()}, you're ` : "You're "}
              {result.archetype.title}
            </p>
            <p className="aqw-archetype-tagline">{result.archetype.tagline}</p>
          </div>
        </div>
        <div className="aqw-echo aqw-reveal-2">
          <p className="aqw-echo-title">What you told us</p>
          {worstTwo.map((questionId) => (
            <div className="aqw-echo-item" key={questionId}>
              <span>{LEAK_LABELS[questionId]}</span>
              <span>{completeAnswers[questionId].label}</span>
            </div>
          ))}
        </div>
        <div className="aqw-fix aqw-reveal-3">
          <strong>Your #1 fix: {result.topLeak.label.toLowerCase()}.</strong>{" "}
          {result.archetype.fix}. That's what we'd install first. Grab a spot below
          and we'll map it to your business on a 45-minute Leak Fix call.
        </div>
        {calendarUrl ? (
          <iframe
            className="aqw-calendar-frame aqw-reveal-4"
            src={calendarUrl}
            title="Book your Leak Fix Map call"
          />
        ) : props.bookingUrl ? (
          <div className="aqw-options aqw-reveal-4">
            <a
              className="aqw-cta"
              style={{ textAlign: "center", textDecoration: "none" }}
              href={props.bookingUrl}
            >
              Book my Leak Fix Map call →
            </a>
          </div>
        ) : null}
        <div className="aqw-footer">Xallindrome · Automation for local businesses</div>
      </div>
    );
  }

  return (
    <div className="aqw-root">
      <div className="aqw-card">
        <div className="aqw-topbar">
          {canGoBack ? (
            <button type="button" className="aqw-back" onClick={() => goBackFrom(step)}>
              <span aria-hidden="true">&#8592;</span> Back
            </button>
          ) : (
            <span />
          )}
          {stepCount ? <span className="aqw-step-count">{stepCount}</span> : <span />}
        </div>
        <div className="aqw-progress">
          <div className="aqw-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <div
          className="aqw-stage"
          ref={stageRef}
          data-dir={direction}
          data-exiting={isExiting ? "1" : undefined}
          style={stageHeight !== null ? { height: stageHeight } : undefined}
        >
          {step.kind === "intro" && renderIntro()}
          {step.kind === "niche" && renderNiche()}
          {step.kind === "question" && renderQuestion(step.questionIndex)}
          {step.kind === "interstitial" && renderInterstitial()}
          {step.kind === "revenue" && renderRevenue()}
          {step.kind === "gate" && renderGate()}
          {step.kind === "analyzing" && renderAnalyzing()}
          {step.kind === "result" && renderResult()}
        </div>
      </div>
    </div>
  );
}

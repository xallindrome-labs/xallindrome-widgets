import type { IconName } from "./icons";

// Contract with your backend: option ids,
// niche ids and revenue bands must match what your server and CRM fields expect.

export const NICHE_IDS = [
  "med-spa",
  "home-services",
  "wellness-fitness",
  "dental",
  "real-estate"
] as const;
export type NicheId = (typeof NICHE_IDS)[number];

export const QUESTION_IDS = [
  "speedToLead",
  "followup",
  "afterHours",
  "rebooking",
  "ownerTime"
] as const;
export type QuestionId = (typeof QUESTION_IDS)[number];

export const REVENUE_BANDS = [
  "under-20k",
  "20-50k",
  "50-100k",
  "100k-plus",
  "undisclosed"
] as const;
export type RevenueBand = (typeof REVENUE_BANDS)[number];

export interface QuizOption {
  id: string;
  icon: IconName;
  label: string;
  points: number;
}

export interface QuizQuestion {
  id: QuestionId;
  prompt: string;
  options: QuizOption[];
}

export interface NicheChoice {
  id: NicheId;
  icon: IconName;
  label: string;
}

export const NICHE_CHOICES: NicheChoice[] = [
  { id: "med-spa", icon: "sparkle", label: "Med spa / aesthetics" },
  { id: "home-services", icon: "wrench", label: "Home services / contracting" },
  { id: "wellness-fitness", icon: "leaf", label: "Wellness or fitness studio" },
  { id: "dental", icon: "tooth", label: "Dental practice" },
  { id: "real-estate", icon: "home", label: "Real estate" }
];

const SPEED_PROMPTS: Record<NicheId, string> = {
  "med-spa": "A new Botox consult inquiry lands at 7:41pm. When does she hear back?",
  "home-services": "A quote request comes in at 7:41pm. When does that homeowner hear back?",
  "wellness-fitness": "Someone asks about a trial class at 7:41pm. When do they hear back?",
  dental: "A new-patient inquiry lands at 7:41pm. When do they hear back?",
  "real-estate": "A buyer asks for a showing at 7:41pm. When do they hear back?"
};

const FOLLOWUP_PROMPTS: Record<NicheId, string> = {
  "med-spa": "She doesn't reply to your first message. How many more times does she hear from you?",
  "home-services": "They don't reply to your first message. How many more times do they hear from you?",
  "wellness-fitness": "They don't reply to your first message. How many more times do they hear from you?",
  dental: "They don't reply to your first message. How many more times do they hear from you?",
  "real-estate": "They don't reply to your first message. How many more times do they hear from you?"
};

const AFTER_HOURS_PROMPTS: Record<NicheId, string> = {
  "med-spa": "It's Sunday night. A DM asks “do you have anything this week?” What happens?",
  "home-services": "It's Sunday night. “Can someone come look at this leak?” What happens?",
  "wellness-fitness": "It's Sunday night. “Can I join tomorrow's 6am class?” What happens?",
  dental: "It's Sunday night. “My crown just came off, can you fit me in?” What happens?",
  "real-estate": "It's Sunday night. “Is this listing still available?” What happens?"
};

const REBOOKING_PROMPTS: Record<NicheId, string> = {
  "med-spa": "A client no-shows her appointment. What actually happens next?",
  "home-services": "A customer goes quiet after the estimate. What actually happens next?",
  "wellness-fitness": "A member stops showing up. What actually happens next?",
  dental: "A patient misses their appointment. What actually happens next?",
  "real-estate": "A lead goes cold after a showing. What actually happens next?"
};

const OWNER_TIME_PROMPT =
  "Real talk: how many hours a week do YOU personally spend on DMs, reminders, and scheduling?";

export function buildQuestions(niche: NicheId): QuizQuestion[] {
  return [
    {
      id: "speedToLead",
      prompt: SPEED_PROMPTS[niche],
      options: [
        { id: "under-5-min", icon: "bolt", label: "Under 5 minutes, it's automated", points: 0 },
        { id: "within-hour", icon: "clock", label: "Within the hour", points: 7 },
        { id: "same-day", icon: "sun", label: "Later that day", points: 14 },
        { id: "next-day-or-later", icon: "hourglass", label: "Next day… or later", points: 20 }
      ]
    },
    {
      id: "followup",
      prompt: FOLLOWUP_PROMPTS[niche],
      options: [
        { id: "five-plus-touches", icon: "repeat", label: "5+ touches, the system keeps going", points: 0 },
        { id: "three-to-four", icon: "messages", label: "3–4 times", points: 7 },
        { id: "one-or-two", icon: "message", label: "Once or twice", points: 14 },
        { id: "one-and-done", icon: "messageOff", label: "One message, then we move on", points: 20 }
      ]
    },
    {
      id: "afterHours",
      prompt: AFTER_HOURS_PROMPTS[niche],
      options: [
        { id: "auto-books", icon: "moonCheck", label: "Instant reply that books them", points: 0 },
        { id: "auto-reply-only", icon: "message", label: "Auto-reply, but no booking", points: 7 },
        { id: "next-morning", icon: "sunrise", label: "They wait until morning", points: 14 },
        { id: "whenever-i-see-it", icon: "shrug", label: "Whenever someone sees it", points: 20 }
      ]
    },
    {
      id: "rebooking",
      prompt: REBOOKING_PROMPTS[niche],
      options: [
        { id: "automated", icon: "repeat", label: "Automatic win-back sequence", points: 0 },
        { id: "sometimes-manual", icon: "note", label: "We reach out when we remember", points: 7 },
        { id: "rarely", icon: "clockOff", label: "Rarely anything", points: 14 },
        { id: "never", icon: "circleSlash", label: "Nothing. Gone is gone", points: 20 }
      ]
    },
    {
      id: "ownerTime",
      prompt: OWNER_TIME_PROMPT,
      options: [
        { id: "under-2h", icon: "bars1", label: "Under 2, the system runs it", points: 0 },
        { id: "2-5h", icon: "bars2", label: "2–5 hours", points: 7 },
        { id: "5-10h", icon: "bars3", label: "5–10 hours", points: 14 },
        { id: "10h-plus", icon: "bars4", label: "10+, and it runs me", points: 20 }
      ]
    }
  ];
}

export interface RevenueOption {
  id: RevenueBand;
  icon: IconName;
  label: string;
}

export const REVENUE_OPTIONS: RevenueOption[] = [
  { id: "under-20k", icon: "seed", label: "Under $20k / month" },
  { id: "20-50k", icon: "chartUp", label: "$20–50k / month" },
  { id: "50-100k", icon: "rocket", label: "$50–100k / month" },
  { id: "100k-plus", icon: "crown", label: "$100k+ / month" },
  { id: "undisclosed", icon: "lock", label: "Prefer not to say" }
];

export const REVENUE_PROMPT =
  "Last one. Roughly where's monthly revenue today? (This calibrates your benchmarks.)";

// Anchored to a real, citable study (Oldroyd/McElheran/Elkington, HBR 2011):
// firms contacting a lead within an hour were >60x likelier to qualify it than
// those waiting 24 hours. Never replace this with an unsourced number.
export const INTERSTITIAL_COPY =
  "likelier to qualify a lead when you answer within the hour instead of waiting a day. That gap is exactly what we're measuring. (Harvard Business Review)";

export type ArchetypeId =
  | "leaky-bucket"
  | "ghost-protocol"
  | "nine-to-fiver"
  | "one-person-circus";

export interface ArchetypeMeta {
  id: ArchetypeId;
  title: string;
  icon: IconName;
  tagline: string;
  fix: string;
}

export const ARCHETYPES: Record<ArchetypeId, ArchetypeMeta> = {
  "leaky-bucket": {
    id: "leaky-bucket",
    title: "The Leaky Bucket",
    icon: "bucket",
    tagline: "Leads come in fine. They just drip out before they ever book.",
    fix: "Speed-to-lead + no-show recovery automation"
  },
  "ghost-protocol": {
    id: "ghost-protocol",
    title: "The Ghost Protocol",
    icon: "ghost",
    tagline: "One follow-up, then silence. Your leads aren't dead, just unattended.",
    fix: "A follow-up engine that never gets tired"
  },
  "nine-to-fiver": {
    id: "nine-to-fiver",
    title: "The 9-to-5er",
    icon: "moon",
    tagline: "Your business sleeps when you do. Your leads don't.",
    fix: "After-hours auto-booking"
  },
  "one-person-circus": {
    id: "one-person-circus",
    title: "The One-Person Circus",
    icon: "rings",
    tagline: "Everything works because you personally touch it. That's the ceiling.",
    fix: "Handing the repetitive 80% to a system"
  }
};

const QUESTION_ARCHETYPES: Record<QuestionId, ArchetypeId> = {
  speedToLead: "leaky-bucket",
  followup: "ghost-protocol",
  afterHours: "nine-to-fiver",
  rebooking: "leaky-bucket",
  ownerTime: "one-person-circus"
};

const ARCHETYPE_PRIORITY: ArchetypeId[] = [
  "leaky-bucket",
  "ghost-protocol",
  "nine-to-fiver",
  "one-person-circus"
];

export const LEAK_LABELS: Record<QuestionId, string> = {
  speedToLead: "Speed to lead",
  followup: "Follow-up persistence",
  afterHours: "After-hours coverage",
  rebooking: "Rebooking & no-show recovery",
  ownerTime: "Owner hours on repetitive work"
};

export interface LocalLeakResult {
  leakScore: number;
  archetype: ArchetypeMeta;
  topLeak: { questionId: QuestionId; label: string; points: number };
}

// Fallback mirror of the server's computeLeakResult, used only when the API is
// unreachable so the visitor still gets their result.
export function computeLocalLeakResult(
  answers: Record<QuestionId, QuizOption>
): LocalLeakResult {
  const leakScore = QUESTION_IDS.reduce((sum, id) => sum + answers[id].points, 0);

  const totals = new Map<ArchetypeId, { sum: number; count: number }>();
  for (const id of QUESTION_IDS) {
    const archetype = QUESTION_ARCHETYPES[id];
    const entry = totals.get(archetype) ?? { sum: 0, count: 0 };
    entry.sum += answers[id].points;
    entry.count += 1;
    totals.set(archetype, entry);
  }

  let winner: ArchetypeId = ARCHETYPE_PRIORITY[0];
  let winnerAverage = -1;
  for (const archetypeId of ARCHETYPE_PRIORITY) {
    const entry = totals.get(archetypeId);
    if (!entry) continue;
    const average = entry.sum / entry.count;
    if (average > winnerAverage) {
      winner = archetypeId;
      winnerAverage = average;
    }
  }

  let worst: QuestionId = QUESTION_IDS[0];
  for (const id of QUESTION_IDS) {
    if (answers[id].points > answers[worst].points) {
      worst = id;
    }
  }

  return {
    leakScore,
    archetype: ARCHETYPES[winner],
    topLeak: { questionId: worst, label: LEAK_LABELS[worst], points: answers[worst].points }
  };
}

export function severityForScore(score: number): { label: string; color: string } {
  if (score <= 30) return { label: "Tight ship", color: "#6FCF97" };
  if (score <= 55) return { label: "Slow drip", color: "#E8C468" };
  if (score <= 75) return { label: "Steady leak", color: "#E89A5B" };
  return { label: "Open faucet", color: "#E86A5B" };
}

import type { SectionDef } from "./types";

export const SECTIONS: SectionDef[] = [
  {
    id: "basics",
    ref: "01",
    name: "Client Basics",
    desc: "Who you are and how we reach you. Required for every project.",
    fields: [
      { id: "businessName", q: "Business name", type: "text", required: true, mapsTo: ["workspace", "crm"] },
      {
        id: "website",
        q: "Website",
        type: "url",
        required: true,
        mapsTo: ["workspace", "crm"],
        help: "Primary domain. https:// included."
      },
      {
        id: "industry",
        q: "Industry",
        type: "select",
        required: true,
        mapsTo: ["workspace", "crm"],
        options: [
          "Professional services",
          "Real estate",
          "Health & wellness",
          "Coaching & consulting",
          "Finance",
          "Legal",
          "Tech / SaaS",
          "E-commerce",
          "Trades & home services",
          "Other"
        ]
      },
      {
        id: "mainOffer",
        q: "Your main offer",
        type: "text",
        required: true,
        mapsTo: ["workspace"],
        help: "One sentence. The thing you sell first."
      },
      {
        id: "serviceArea",
        q: "Location or service area",
        type: "text",
        required: true,
        mapsTo: ["workspace", "crm"],
        help: "City, region, or 'remote / global'."
      },
      { id: "primaryName", q: "Primary contact — name", type: "text", required: true, mapsTo: ["crm"] },
      { id: "primaryEmail", q: "Primary contact — email", type: "email", required: true, mapsTo: ["crm"] },
      { id: "primaryPhone", q: "Primary contact — phone", type: "phone", required: true, mapsTo: ["crm"] },
      { id: "backupName", q: "Backup contact — name", type: "text", required: false, fullOnly: true, mapsTo: ["crm"] },
      { id: "backupEmail", q: "Backup contact — email", type: "email", required: false, fullOnly: true, mapsTo: ["crm"] },
      {
        id: "commsPref",
        q: "How should we reach you?",
        type: "multi",
        required: true,
        mapsTo: ["crm"],
        options: ["Email", "SMS", "Phone call", "Slack", "WhatsApp"]
      }
    ]
  },
  {
    id: "positioning",
    ref: "02",
    name: "Positioning",
    desc: "What you sell, who you serve, and why people choose you.",
    fields: [
      {
        id: "offer",
        q: "What do you sell?",
        type: "longtext",
        required: true,
        mapsTo: ["workspace"],
        help: "Short description of your offers, packages, and price ranges."
      },
      { id: "audience", q: "Who do you serve?", type: "longtext", required: true, mapsTo: ["workspace"] },
      { id: "problem", q: "What problem do you solve?", type: "longtext", required: true, mapsTo: ["workspace"] },
      {
        id: "differentiator",
        q: "What makes you different?",
        type: "longtext",
        required: true,
        mapsTo: ["workspace"],
        help: "Three things, in your own words."
      },
      {
        id: "whyChoose",
        q: "Why do clients ultimately choose you?",
        type: "longtext",
        required: false,
        fullOnly: true,
        mapsTo: ["workspace"]
      },
      {
        id: "objections",
        q: "Common objections you hear",
        type: "longtext",
        required: false,
        fullOnly: true,
        mapsTo: ["workspace"],
        help: "Price, timing, trust — the real ones, in their words."
      },
      {
        id: "proof",
        q: "Best proof, testimonials, or case studies",
        type: "longtext",
        required: false,
        fullOnly: true,
        mapsTo: ["workspace"],
        help: "Drop quotes, links, or attach files later in Existing Assets."
      }
    ]
  },
  {
    id: "audience",
    ref: "03",
    name: "Target Audience",
    desc: "The buyer in detail. Used to write hooks, scripts, and CTAs.",
    fullOnly: true,
    fields: [
      {
        id: "icp",
        q: "Ideal customer profile",
        type: "longtext",
        required: true,
        mapsTo: ["workspace"],
        help: "Role, industry, business stage, income, life stage."
      },
      { id: "painPoints", q: "Buyer pain points", type: "longtext", required: true, mapsTo: ["workspace"] },
      { id: "buyerGoals", q: "Buyer goals", type: "longtext", required: true, mapsTo: ["workspace"] },
      { id: "buyerObjections", q: "Buyer objections", type: "longtext", required: false, mapsTo: ["workspace"] },
      {
        id: "buyerLanguage",
        q: "Phrases your buyers actually use",
        type: "longtext",
        required: false,
        mapsTo: ["workspace"]
      },
      {
        id: "audienceWhere",
        q: "Where does your audience spend time?",
        type: "multi",
        required: false,
        mapsTo: ["workspace"],
        options: [
          "LinkedIn",
          "Instagram",
          "TikTok",
          "YouTube",
          "Twitter / X",
          "Facebook",
          "Podcasts",
          "Email newsletters",
          "Industry events",
          "Other"
        ]
      },
      {
        id: "decisionMakers",
        q: "Decision-makers vs influencers",
        type: "longtext",
        required: false,
        mapsTo: ["workspace"],
        help: "Who signs the check vs who recommends you?"
      }
    ]
  },
  {
    id: "strategy",
    ref: "04",
    name: "Thought Leadership Strategy",
    desc: "Topics, opinions, stories, and the things you refuse to say.",
    fields: [
      {
        id: "knownFor",
        q: "Three topics you want to be known for",
        type: "longtext",
        required: true,
        mapsTo: ["workspace"]
      },
      {
        id: "noFlyTopics",
        q: "Topics you refuse to discuss",
        type: "longtext",
        required: true,
        mapsTo: ["workspace"],
        help: "Hard nos. We will not script anything in these areas."
      },
      {
        id: "opinions",
        q: "Strong opinions or beliefs",
        type: "longtext",
        required: true,
        mapsTo: ["workspace"],
        help: "The takes you'd say at dinner if you had a glass of wine."
      },
      {
        id: "stories",
        q: "Stories from your career we can mine",
        type: "longtext",
        required: false,
        fullOnly: true,
        mapsTo: ["workspace"]
      },
      {
        id: "faq",
        q: "Questions clients ask you all the time",
        type: "longtext",
        required: false,
        fullOnly: true,
        mapsTo: ["workspace"]
      },
      {
        id: "myths",
        q: "Myths in your industry you'd love to challenge",
        type: "longtext",
        required: false,
        fullOnly: true,
        mapsTo: ["workspace"]
      },
      {
        id: "creatorsLike",
        q: "Creators or competitors you respect",
        type: "longtext",
        required: false,
        fullOnly: true,
        mapsTo: ["workspace"]
      },
      {
        id: "creatorsDislike",
        q: "Creators or competitors you do NOT want to sound like",
        type: "longtext",
        required: false,
        fullOnly: true,
        mapsTo: ["workspace"]
      }
    ]
  },
  {
    id: "voice",
    ref: "05",
    name: "Brand Voice",
    desc: "Tone, vocabulary, and the lines you don't cross.",
    fields: [
      {
        id: "tone",
        q: "Pick the tones that fit",
        type: "multi",
        required: true,
        mapsTo: ["workspace"],
        options: [
          "Direct",
          "Warm",
          "Witty",
          "Educational",
          "Provocative",
          "Quiet authority",
          "Hype / energetic",
          "Story-driven",
          "Plainspoken",
          "Polished"
        ]
      },
      {
        id: "wordsUse",
        q: "Words and phrases you use",
        type: "longtext",
        required: false,
        fullOnly: true,
        mapsTo: ["workspace"]
      },
      {
        id: "wordsAvoid",
        q: "Words and phrases to avoid",
        type: "longtext",
        required: true,
        mapsTo: ["workspace"],
        help: "Buzzwords, jargon, brand names, profanity — anything."
      },
      {
        id: "boldness",
        q: "Boldness level (0 polite ↔ 10 contrarian)",
        type: "select",
        required: true,
        mapsTo: ["workspace"],
        options: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
      },
      {
        id: "humor",
        q: "Humor preference",
        type: "select",
        required: true,
        mapsTo: ["workspace"],
        options: ["None", "Dry / occasional", "Conversational", "Self-deprecating", "Sharp / sarcastic"]
      },
      {
        id: "formality",
        q: "Formal or casual",
        type: "select",
        required: true,
        mapsTo: ["workspace"],
        options: ["Very formal", "Formal-leaning", "Conversational", "Casual", "Very casual"]
      },
      {
        id: "personal",
        q: "Personal or professional emphasis",
        type: "select",
        required: true,
        mapsTo: ["workspace"],
        options: [
          "Strictly professional",
          "Mostly professional",
          "Balanced",
          "Mostly personal",
          "Highly personal"
        ]
      },
      {
        id: "examples",
        q: "Links to content (yours or others) you'd want yours to feel like",
        type: "longtext",
        required: false,
        fullOnly: true,
        mapsTo: ["workspace"]
      }
    ]
  },
  {
    id: "assets",
    ref: "06",
    name: "Existing Assets",
    desc: "Logo, colors, fonts, headshots, b-roll, past content, results.",
    fullOnly: true,
    fields: [
      {
        id: "logo",
        q: "Logo files",
        type: "file",
        required: true,
        mapsTo: ["workspace"],
        help: "SVG or PNG. Light + dark if you have them."
      },
      {
        id: "brandColors",
        q: "Brand colors",
        type: "colors",
        required: false,
        mapsTo: ["workspace"],
        help: "Pick up to five hex values that define your brand."
      },
      {
        id: "fonts",
        q: "Brand fonts",
        type: "fonts",
        required: false,
        mapsTo: ["workspace"],
        help: "Add the typefaces you use. Start typing — common fonts will autocomplete."
      },
      { id: "headshots", q: "Headshots", type: "file", required: true, mapsTo: ["workspace"] },
      {
        id: "broll",
        q: "B-roll footage",
        type: "file",
        required: false,
        mapsTo: ["workspace"],
        help: "Office, work, lifestyle clips. Drop a Drive/Dropbox link in the URL field below if files are large."
      },
      { id: "brollLink", q: "B-roll link (optional)", type: "url", required: false, mapsTo: ["workspace"] },
      {
        id: "pastContent",
        q: "Past content links",
        type: "longtext",
        required: false,
        fullOnly: true,
        mapsTo: ["workspace"],
        help: "Posts that performed well, podcast appearances, articles."
      },
      { id: "testimonials", q: "Testimonials", type: "longtext", required: false, fullOnly: true, mapsTo: ["workspace"] },
      { id: "caseStudies", q: "Case studies", type: "file", required: false, fullOnly: true, mapsTo: ["workspace"] },
      {
        id: "clientResults",
        q: "Client results / numbers",
        type: "longtext",
        required: false,
        fullOnly: true,
        mapsTo: ["workspace"]
      },
      { id: "mediaMentions", q: "Media mentions", type: "longtext", required: false, fullOnly: true, mapsTo: ["workspace"] },
      { id: "leadMagnet", q: "Lead magnets", type: "longtext", required: false, fullOnly: true, mapsTo: ["workspace"] },
      {
        id: "offers",
        q: "Offers and landing pages",
        type: "longtext",
        required: false,
        fullOnly: true,
        mapsTo: ["workspace"]
      }
    ]
  },
  {
    id: "platforms",
    ref: "07",
    name: "Platforms",
    desc: "Profile URLs, current performance, and the access we'll need.",
    fields: [
      {
        id: "platforms",
        q: "Select at least one platform. (Each additional platform is $100 dollars a month.)",
        type: "multi",
        required: true,
        mapsTo: ["workspace", "crm"],
        options: ["LinkedIn", "Instagram", "YouTube", "TikTok", "Facebook", "Twitter / X", "Threads"]
      },
      {
        id: "linkedinUrl",
        q: "LinkedIn URL",
        type: "url",
        required: false,
        mapsTo: ["workspace", "crm"],
        condIf: { field: "platforms", contains: "LinkedIn" }
      },
      {
        id: "instagramUrl",
        q: "Instagram URL",
        type: "url",
        required: false,
        mapsTo: ["workspace", "crm"],
        condIf: { field: "platforms", contains: "Instagram" }
      },
      {
        id: "youtubeUrl",
        q: "YouTube channel URL",
        type: "url",
        required: false,
        mapsTo: ["workspace"],
        condIf: { field: "platforms", contains: "YouTube" }
      },
      {
        id: "tiktokUrl",
        q: "TikTok URL",
        type: "url",
        required: false,
        mapsTo: ["workspace"],
        condIf: { field: "platforms", contains: "TikTok" }
      },
      {
        id: "access",
        q: "How will we get posting access?",
        type: "multi",
        required: true,
        mapsTo: ["workspace"],
        options: [
          "Direct login (we'll send 1Password)",
          "Meta Business Manager invite",
          "LinkedIn page admin invite",
          "You will post from approved drafts",
          "Other"
        ]
      },
      {
        id: "followers",
        q: "Current follower counts (per platform)",
        type: "longtext",
        required: false,
        fullOnly: true,
        mapsTo: ["workspace"]
      },
      {
        id: "avgReach",
        q: "Current average reach / impressions",
        type: "longtext",
        required: false,
        fullOnly: true,
        mapsTo: ["workspace"]
      },
      {
        id: "topPosts",
        q: "Top 3 best-performing posts (links)",
        type: "longtext",
        required: false,
        fullOnly: true,
        mapsTo: ["workspace"]
      }
    ]
  },
  {
    id: "filming",
    ref: "08",
    name: "Filming Logistics",
    desc: "When you're available, what kit you have, what you wear, what we record first.",
    fields: [
      {
        id: "availability",
        q: "Recording availability",
        type: "longtext",
        required: true,
        mapsTo: ["workspace"],
        help: "Days, times, time zone, frequency."
      },
      {
        id: "preferredSlot",
        q: "Preferred recurring slot",
        type: "datetime",
        required: false,
        fullOnly: true,
        mapsTo: ["workspace", "crm"]
      },
      {
        id: "tool",
        q: "Recording tool comfort",
        type: "select",
        required: true,
        mapsTo: ["workspace"],
        options: [
          "Comfortable with Riverside",
          "Used Zoom recordings before",
          "New to all of this — we'll guide you",
          "I have my own setup / videographer"
        ]
      },
      {
        id: "kit",
        q: "Camera & mic setup",
        type: "longtext",
        required: true,
        mapsTo: ["workspace"],
        help: "Phone, webcam, DSLR, lav mic, USB mic — whatever you have."
      },
      { id: "background", q: "Background / environment", type: "text", required: true, mapsTo: ["workspace"] },
      {
        id: "lighting",
        q: "Lighting available",
        type: "select",
        required: true,
        mapsTo: ["workspace"],
        options: [
          "Natural window light only",
          "Ring light",
          "Softbox / studio kit",
          "None — we'll advise"
        ]
      },
      { id: "wardrobe", q: "Wardrobe preferences", type: "longtext", required: false, fullOnly: true, mapsTo: ["workspace"] },
      {
        id: "firstTopics",
        q: "Topics for the first recording session",
        type: "longtext",
        required: true,
        mapsTo: ["workspace"],
        help: "5–10 topics we can script against immediately."
      },
      {
        id: "approvalAfter",
        q: "How do you want to approve raw footage?",
        type: "select",
        required: true,
        mapsTo: ["workspace"],
        options: [
          "Trust the team — skip raw approval",
          "Quick async review on Frame.io",
          "Live review call",
          "Per-clip Loom walkthrough"
        ]
      }
    ]
  },
  {
    id: "workflow",
    ref: "09",
    name: "Approval Workflow",
    desc: "Who signs off, how fast, and what should never be published.",
    fields: [
      {
        id: "complianceNeeded",
        q: "Does any content need legal or compliance review?",
        type: "select",
        required: true,
        mapsTo: ["workspace"],
        options: ["No", "Yes — sometimes", "Yes — every post"]
      },
      {
        id: "complianceWho",
        q: "Compliance reviewer name & email",
        type: "text",
        required: false,
        mapsTo: ["workspace", "crm"],
        condIf: { field: "complianceNeeded", equalsAnyOf: ["Yes — sometimes", "Yes — every post"] }
      },
      {
        id: "neverPublish",
        q: "Things that should never be published",
        type: "longtext",
        required: true,
        mapsTo: ["workspace"],
        help: "Names, numbers, claims, photos, locations."
      },
      {
        id: "takedown",
        q: "Emergency takedown process",
        type: "longtext",
        required: false,
        fullOnly: true,
        mapsTo: ["workspace"]
      },
      {
        id: "preferredCTA",
        q: "Preferred call-to-action",
        type: "select",
        required: true,
        mapsTo: ["workspace", "crm"],
        options: [
          "Book a call",
          "Visit landing page",
          "DM a keyword",
          "Comment a keyword",
          "Subscribe to newsletter",
          "No CTA — pure authority"
        ]
      },
      {
        id: "leadRouting",
        q: "Where should new leads go?",
        type: "longtext",
        required: true,
        mapsTo: ["crm"],
        help: "CRM pipeline, email inbox, calendar, Slack channel."
      }
    ]
  },
  {
    id: "metrics",
    ref: "10",
    name: "Success Metrics",
    desc: "What success looks like at 30 and 90 days.",
    fields: [
      {
        id: "success30",
        q: "What does success look like in 30 days?",
        type: "longtext",
        required: true,
        mapsTo: ["workspace", "crm"]
      },
      {
        id: "success90",
        q: "What does success look like in 90 days?",
        type: "longtext",
        required: true,
        mapsTo: ["workspace", "crm"]
      },
      {
        id: "primaryGoal",
        q: "Primary outcome you want from content",
        type: "select",
        required: true,
        mapsTo: ["workspace", "crm"],
        options: [
          "Inbound leads",
          "Discovery calls booked",
          "Visibility / reach",
          "Industry authority",
          "Recruitment",
          "Strategic partnerships",
          "Client referrals"
        ]
      },
      {
        id: "baseline",
        q: "Baseline metrics (today's numbers)",
        type: "longtext",
        required: false,
        fullOnly: true,
        mapsTo: ["workspace"]
      },
      {
        id: "targets",
        q: "Target metrics (90-day)",
        type: "longtext",
        required: false,
        fullOnly: true,
        mapsTo: ["workspace"]
      }
    ]
  },
  {
    id: "automation",
    ref: "11",
    name: "Automation & Tools",
    desc: "Your stack — so we can wire content into your funnel.",
    fullOnly: true,
    fields: [
      { id: "crm", q: "CRM", type: "text", required: true, mapsTo: ["crm"] },
      { id: "calendar", q: "Calendar booking tool", type: "text", required: true, mapsTo: ["crm"] },
      { id: "emailTool", q: "Email / SMS marketing tool", type: "text", required: false, mapsTo: ["crm"] },
      { id: "leadForms", q: "Existing lead capture forms", type: "longtext", required: false, mapsTo: ["crm"] },
      {
        id: "existingAutos",
        q: "Existing automations worth knowing about",
        type: "longtext",
        required: false,
        mapsTo: ["workspace"]
      },
      {
        id: "desiredAutos",
        q: "Automations you want us to set up",
        type: "multi",
        required: false,
        mapsTo: ["crm"],
        options: [
          "DM keyword auto-reply",
          "Comment keyword auto-reply",
          "New lead → CRM",
          "New lead → Slack",
          "New lead → SMS to you",
          "Booked call → confirmation sequence",
          "Lead magnet delivery",
          "Re-engagement sequence"
        ]
      },
      {
        id: "leadDestination",
        q: "When a lead comes in, where should they land?",
        type: "longtext",
        required: false,
        mapsTo: ["crm"]
      },
      {
        id: "notifyWho",
        q: "Who should get notified on a new lead?",
        type: "longtext",
        required: false,
        mapsTo: ["crm"]
      },
      {
        id: "engagementResponse",
        q: "What should happen when someone replies, comments, or DMs?",
        type: "longtext",
        required: false,
        mapsTo: ["workspace", "crm"]
      }
    ]
  },
  {
    id: "blockers",
    ref: "12",
    name: "Risk & Blockers",
    desc: "Things that could slow us down. Surface them now, not in week three.",
    fields: [
      { id: "missingAssets", q: "Assets you know are missing", type: "longtext", required: false, mapsTo: ["workspace"] },
      {
        id: "regulated",
        q: "Are you in a regulated industry?",
        type: "select",
        required: true,
        mapsTo: ["workspace"],
        options: [
          "No",
          "Yes — light (advisory disclaimers)",
          "Yes — heavy (legal/medical/financial compliance)"
        ]
      },
      {
        id: "regulatedDetail",
        q: "Regulated specifics",
        type: "longtext",
        required: false,
        mapsTo: ["workspace"],
        condIf: {
          field: "regulated",
          equalsAnyOf: [
            "Yes — light (advisory disclaimers)",
            "Yes — heavy (legal/medical/financial compliance)"
          ]
        }
      },
      {
        id: "legalConstraints",
        q: "Brand or legal constraints",
        type: "longtext",
        required: false,
        fullOnly: true,
        mapsTo: ["workspace"]
      },
      {
        id: "stakeholders",
        q: "Internal stakeholders we should know",
        type: "longtext",
        required: false,
        fullOnly: true,
        mapsTo: ["workspace"]
      },
      {
        id: "scheduling",
        q: "Travel, blackouts, or scheduling constraints",
        type: "longtext",
        required: false,
        fullOnly: true,
        mapsTo: ["workspace"]
      },
      {
        id: "consent",
        q: "I understand I can update this brief at any time, and that delayed approvals delay publishing.",
        type: "checkbox-group",
        required: true,
        mapsTo: ["workspace"],
        options: ["I understand."]
      }
    ]
  }
];

export const PRE_RECORDING_FIELDS: string[] = [
  "businessName",
  "website",
  "mainOffer",
  "primaryName",
  "primaryEmail",
  "knownFor",
  "noFlyTopics",
  "tone",
  "wordsAvoid",
  "boldness",
  "headshots",
  "logo",
  "platforms",
  "access",
  "availability",
  "tool",
  "kit",
  "background",
  "lighting",
  "firstTopics",
  "approvalAfter",
  "scriptApprover",
  "neverPublish"
];

export const PRE_POST_FIELDS: string[] = [
  ...PRE_RECORDING_FIELDS,
  "linkedinUrl",
  "instagramUrl",
  "youtubeUrl",
  "tiktokUrl",
  "postApprover",
  "reviewSpeed",
  "preferredCTA",
  "leadRouting",
  "regulated"
];

export type ActionType = "alert" | "remind";
export type TraceStep = 1 | 2 | 3 | 4;

export interface VoiceScenario {
  id: string;
  pillTitle: string;
  pillMeta: string;
  language: string;
  speechLang: string;
  week: number;
  motherUtterance: string;
  motherDevanagari: string;
  translation: string;
  followUpQuestion: string;
  followUpTranslation: string;
  motherReply: string;
  repeatBack: string;
  action: ActionType;
  actionTitle: string;
  actionDetail: string;
  recipients: string[];
}

export const VOICE_SCENARIOS: VoiceScenario[] = [
  {
    id: "headache-swelling",
    pillTitle: "Headache & Swollen Feet",
    pillMeta: "Hindi · Week 32 · Clear Danger Sign",
    language: "Hindi",
    speechLang: "hi-IN",
    week: 32,
    motherUtterance: "“Do din se sar dard hai aur pair sujhe hue hain.”",
    motherDevanagari: "दो दिन से सर दर्द है और पैर सूजे हुए हैं।",
    translation: "I have had a headache and swollen feet for two days.",
    followUpQuestion: "“Dhundhla dikh raha hai?”",
    followUpTranslation: "Is your vision blurred?",
    motherReply: "“Haan, subah se thoda dhundhla lag raha hai.”",
    repeatBack:
      "“32ve hafte mein 2 din se sar dard, pairon mein sujan aur dhundhla dikhna hai. Kya yeh sahi hai?”",
    action: "alert",
    actionTitle: "Alert · Go to Hospital Now",
    actionDetail:
      "Matches Ministry of Health pre-eclampsia danger-sign rules. Tells her to go to the hospital now and alerts her ASHA worker and chosen family member.",
    recipients: ["Patient (Voice)", "ASHA Worker", "Chosen Family Member"],
  },
  {
    id: "fetal-movement",
    pillTitle: "Less Baby Movement",
    pillMeta: "Marathi · Week 35 · Escalate on Doubt",
    language: "Marathi",
    speechLang: "mr-IN",
    week: 35,
    motherUtterance: "“Aaj sakalpasun balachi halchal kami watat aahe.”",
    motherDevanagari: "आज सकाळपासून बाळाची हालचाल कमी वाटत आहे.",
    translation: "Since this morning, the baby’s movement feels less.",
    followUpQuestion: "“Kiti velapasun halchal janavali nahi?”",
    followUpTranslation: "For how many hours have you not felt movement?",
    motherReply: "“Nakki mahit nahi, pan sakalpasun kami aahe.”",
    repeatBack:
      "“35va aathavda aahe aani sakalpasun halchal kami watte aahe. Sakhi yala gambhir manat aahe.”",
    action: "alert",
    actionTitle: "Alert · Escalate on Doubt",
    actionDetail:
      "When timing or speech remains unsure, Sakhi never guesses or reassures falsely. It treats the case as more serious and connects her to her ASHA worker and hospital.",
    recipients: ["Patient (Voice)", "ASHA Worker", "Hospital Care Team"],
  },
  {
    id: "iron-tablets",
    pillTitle: "Missed Iron Tablet",
    pillMeta: "Hindi · Week 22 · Save & Remind",
    language: "Hindi",
    speechLang: "hi-IN",
    week: 22,
    motherUtterance:
      "“Kal raat iron ki goli lena bhool gayi, aur thakan lag rahi hai.”",
    motherDevanagari: "कल रात आयरन की गोली लेना भूल गई, और थकान लग रही है।",
    translation: "I forgot to take my iron tablet last night, and I feel tired.",
    followUpQuestion: "“Kya aapko chakkar ya saans phoolne ki dikkat hai?”",
    followUpTranslation: "Are you feeling dizzy or short of breath?",
    motherReply: "“Nahi, bas thoda thakan hai.”",
    repeatBack:
      "“22ve hafte mein kal ki iron goli chhoot gayi aur halki thakan hai, par chakkar nahi hain. Sahi hai?”",
    action: "remind",
    actionTitle: "Save & Remind · Care Continuity",
    actionDetail:
      "Saves the missed iron tablet and mild fatigue to her dated hospital timeline, sets a warm evening voice reminder, and prepares her pre-visit recap.",
    recipients: ["Saved to Hospital Record", "Evening Voice Reminder"],
  },
];

export const NFHS_STATS = [
  {
    value: "~23M",
    label: "Births in India every year",
    detail: "Across cities, towns, and villages (UN WPP 2024)",
  },
  {
    value: "~8M",
    label: "Miss 4 antenatal check-ups",
    detail: "34.8% of mothers (NFHS-6, 2023-24) face silent gaps",
  },
  {
    value: "54.9%",
    label: "Take iron tablets for 100 days",
    detail: "Only 37.8% reach 180 days (NFHS-6, 2023-24)",
  },
  {
    value: "10.6%",
    label: "Speak English in India",
    detail: "Census of India 2011 (1st, 2nd & 3rd language)",
  },
];

export const COUPLE_MOMENTS = [
  {
    moment: "Late-night worry",
    question: "“Is this headache or swelling normal, or should we go in now?”",
    answer:
      "Speak for ten seconds. Sakhi checks Ministry of Health danger signs and tells you both what to do next, without guessing.",
  },
  {
    moment: "Daily care rhythm",
    question: "“Did I take my iron tablet today, and when is our next check-up?”",
    answer:
      "Gentle voice reminders in her language keep iron tablets and visit dates on track, with zero nagging.",
  },
  {
    moment: "Short clinic visits",
    question: "“How do we share four weeks of symptoms in one quick visit?”",
    answer:
      "Before you walk in, Sakhi reads her a short recap and shares a dated one-page timeline with her doctor in her own words.",
  },
];

export const GUARDRAILS = [
  {
    title: "Always Confirms What She Said",
    body: "Before Sakhi acts, it repeats back what it heard in her own language and asks her to confirm.",
  },
  {
    title: "When Unsure, Connects Her to Care",
    body: "If a symptom is unclear, it asks one short follow-up question. If anything is still unsure, it treats the case as serious and connects her to her ASHA worker or hospital.",
  },
  {
    title: "Tested With Doctors Across Languages",
    body: "Regional speech and mixed phrasing vary across India. Doctors test Sakhi on realistic cases before launch, and every conversation is logged for hospital review.",
  },
];

export const IMPACT_SIGNALS = [
  {
    pillar: "Speed",
    metric: "9 in 10",
    body: "danger alerts get a human response within 2 hours, and 8 in 10 of those women reach a facility the same day.",
  },
  {
    pillar: "Habits",
    metric: "+10 pp",
    body: "higher iron tablet adherence and check-up attendance compared to similar women not using Sakhi.",
  },
  {
    pillar: "Safety",
    metric: "0 missed",
    body: "danger signs in monthly doctor reviews of sampled conversations, with fewer than 1 false alarm in 5.",
  },
];

export interface DataSource {
  claim: string;
  citation: string;
}

export const DATA_SOURCES: DataSource[] = [
  {
    claim: "Annual births (~23M)",
    citation:
      "United Nations World Population Prospects (2024) and UNICEF India estimates of annual live births.",
  },
  {
    claim: "Antenatal care & iron tablets (34.8% miss 4+ ANC; 54.9% IFA 100+ days)",
    citation:
      "National Family Health Survey-6 (NFHS-6, 2023-24), Ministry of Health & Family Welfare (MoHFW) and IIPS (65.2% complete 4+ ANC visits; 54.9% take IFA for 100+ days; 37.8% for 180+ days).",
  },
  {
    claim: "Maternal mortality (88 per 100,000 live births; 20,000+ deaths/year)",
    citation:
      "Sample Registration System (SRS) Special Bulletin on Maternal Mortality 2020-22, Office of the Registrar General, India (RGI).",
  },
  {
    claim: "English speakers (10.6%)",
    citation:
      "Census of India 2011, Language Table C-17 (combined first, second, and third language speakers).",
  },
  {
    claim: "Clinical rules & pilot targets",
    citation:
      "Escalation protocols follow MoHFW Maternal Health danger-sign guidelines. The three baseline metrics above (9 in 10, +10 pp, 0 missed) are Sakhi's hospital pilot evaluation targets, not yet published clinical outcomes.",
  },
];

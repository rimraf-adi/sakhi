import type { PatientRecord } from "./types";

/**
 * The demo record. Onboarding is off for now, so the phone opens straight on
 * Sakhi's voice screen and reads this profile. Every screen still reads its
 * fields from the record, so swapping this object swaps the whole demo.
 *
 * Pure data on purpose: the client can import it as well as the server.
 */
export const DEMO_PATIENT: PatientRecord = {
  id: "sunita-demo",
  name: "Sunita",
  gestationWeek: 28,
  gestationDay: 2,
  language: "English",
  speechLang: "en-IN",
  nextVisitLabel: "ANC 3 · 24 Nov",
  ashaName: "Meena didi",
  familyName: "Rakesh (pati)",
  supplementName: "Iron + folic acid",
  supplementDaysCompleted: 12,
  supplementDaysTotal: 28,
  supplementTakenToday: false,
  vitals: { bpSystolic: 118, bpDiastolic: 76, bpTrend: [112, 116, 118], weightGainKg: 8 },
  entries: [
    {
      id: "demo-entry-1",
      dateLabel: "3 Nov",
      kind: "saved",
      spokenQuote: "I forgot my tablet last night and I have been feeling a bit tired.",
      englishTranslation: "Missed the tablet last night, feeling a little tired.",
      outcomeNote: "Saved · 8 PM reminder set",
      ruleMatched: "MoHFW routine care · tiredness",
    },
  ],
};

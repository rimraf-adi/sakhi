/**
 * Shared types for the Sakhi agent app.
 * Pure data shapes only - no Node APIs - so both server routes and
 * client components can import from here.
 */

/**
 * English is what the demo runs in. Hindi and Marathi stay in the type and in
 * the copy tables so a real rollout can switch her language on - see README
 * "Future scope".
 */
export type PatientLanguage = "English" | "Hindi" | "Marathi";
export type SpeechLang = "en-IN" | "hi-IN" | "mr-IN";
export type MobileTab = "feed" | "voice" | "journal";
export type TriageEngine = "llm-rules" | "rules";

export type FlowPhase =
  | "idle"
  | "recording_initial"
  | "thinking"
  | "followup"
  | "recording_followup"
  | "consent"
  | "alert"
  | "declined"
  | "saved";

export interface Vitals {
  bpSystolic: number;
  bpDiastolic: number;
  /** Most recent systolic readings, oldest first. */
  bpTrend: number[];
  weightGainKg: number;
}

export interface TimelineEntry {
  id: string;
  dateLabel: string;
  kind: "alert" | "saved";
  spokenQuote: string;
  englishTranslation: string;
  outcomeNote: string;
  ruleMatched: string;
}

export interface PatientRecord {
  id: string;
  name: string;
  gestationWeek: number;
  gestationDay: number;
  language: PatientLanguage;
  speechLang: SpeechLang;
  nextVisitLabel: string;
  ashaName: string;
  familyName: string;
  /** The daily care item this mother tracks, chosen by her at onboarding. */
  supplementName: string;
  supplementDaysCompleted: number;
  supplementDaysTotal: number;
  supplementTakenToday: boolean;
  vitals: Vitals;
  entries: TimelineEntry[];
}

/** What the onboarding form collects; the store fills in the derived fields. */
export interface NewPatientInput {
  name: string;
  gestationWeek: number;
  gestationDay?: number;
  language: string;
  ashaName?: string;
  familyName?: string;
  nextVisitLabel?: string;
  supplementName?: string;
  supplementDaysTotal?: number;
}

export type Patient = PatientRecord;

export interface CircleReply {
  author: string;
  badge: string;
  avatar: string;
  timeLabel: string;
  text: string;
}

export interface CirclePost {
  id: string;
  patientId: string;
  author: string;
  badge: string;
  avatar: string;
  avatarBg: string;
  avatarText: string;
  createdAtIso: string;
  text: string;
  voiceDuration?: string;
  voiceLang?: string;
  likes: number;
  replies: number;
  reply?: CircleReply;
}

export interface EscalationAlert {
  id: string;
  patientId: string;
  patientName: string;
  gestationWeek: number;
  language: PatientLanguage;
  severity: "urgent" | "doubt";
  summary: string;
  spokenQuote: string;
  ashaName: string;
  familyName: string;
  acknowledged: boolean;
  responseNote: string;
  /** Who picked it up at the desk, so her phone can say a name. */
  acknowledgedBy?: string;
  acknowledgedAtIso?: string;
  createdAtIso: string;
}

export interface AuditLogEntry {
  id: string;
  patientName: string;
  timestampLabel: string;
  action: "alert" | "save_remind";
  ruleMatched: string;
  transcript: string;
  verifiedByDoctor: boolean;
}

export interface SakhiStoreData {
  patients: PatientRecord[];
  alerts: EscalationAlert[];
  auditLogs: AuditLogEntry[];
  circlePosts: CirclePost[];
}

export interface AgentFindingView {
  id: string;
  label: string;
  present: boolean;
  uncertain: boolean;
}

/**
 * One completed agent turn. `action` is already decided by the rules engine:
 * ask = one more question, alert = consent to escalate, save_remind = routine.
 */
export interface AgentTurn {
  action: "ask" | "alert" | "save_remind";
  severity: "urgent" | "doubt" | "routine";
  /** Sakhi's single line for this turn. */
  message: string;
  /** Present only when action is "alert": the consent ask. */
  consentPrompt: string | null;
  /** What she says once the mother agrees to escalate. */
  guidanceAfterConsent: string | null;
  reminderNote: string;
  ruleMatched: string;
  rationale: string;
  questionId: string | null;
  findings: AgentFindingView[];
  engine: "rules" | "llm-rules";
}

export interface CaptionItem {
  id: string;
  isSakhi: boolean;
  dotColor?: string;
  text: string;
  /** Set for stored history lines, so they are not read as Sakhi's live words. */
  speakerLabel?: string;
}

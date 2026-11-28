import fs from "fs";
import path from "path";

export type PatientLanguage = "Hindi" | "Marathi";

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
  speechLang: "hi-IN" | "mr-IN";
  nextVisitLabel: string;
  ashaName: string;
  familyName: string;
  /** The daily care item this mother tracks, chosen at intake or onboarding. */
  supplementName: string;
  supplementDaysCompleted: number;
  supplementDaysTotal: number;
  supplementTakenToday: boolean;
  entries: TimelineEntry[];
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
  /** Written here, read on her phone so the loop closes on both screens. */
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
  reviewedBy?: string;
  reviewedAtIso?: string;
}

export interface SakhiStore {
  patients: PatientRecord[];
  alerts: EscalationAlert[];
  auditLogs: AuditLogEntry[];
  /** Written by the mobile app; carried through so a desk write never drops it. */
  circlePosts?: unknown[];
}

const STORE_PATH = path.resolve(process.cwd(), "../../data/sakhi-store.json");

/** The desk starts with an empty cohort; every record comes from an intake. */
export function createInitialStore(): SakhiStore {
  return { patients: [], alerts: [], auditLogs: [] };
}

/** Store files written before onboarding carried the iron-specific fields. */
type StoredPatient = PatientRecord & {
  ironDaysCompleted?: number;
  ironDaysTotal?: number;
  ironTakenToday?: boolean;
};

function normalizePatient(stored: StoredPatient): PatientRecord {
  const { ironDaysCompleted, ironDaysTotal, ironTakenToday, ...patient } = stored;

  return {
    ...patient,
    supplementName: patient.supplementName?.trim() || "Daily supplement",
    supplementDaysCompleted: patient.supplementDaysCompleted ?? ironDaysCompleted ?? 0,
    supplementDaysTotal: patient.supplementDaysTotal ?? ironDaysTotal ?? 28,
    supplementTakenToday: patient.supplementTakenToday ?? ironTakenToday ?? false,
    entries: patient.entries ?? [],
  };
}

export function readStore(): SakhiStore {
  const fallback = createInitialStore();
  try {
    if (!fs.existsSync(STORE_PATH)) return fallback;

    const raw = JSON.parse(fs.readFileSync(STORE_PATH, "utf-8")) as Partial<SakhiStore>;
    return {
      patients: (raw.patients ?? []).map((patient) =>
        normalizePatient(patient as StoredPatient),
      ),
      alerts: raw.alerts ?? [],
      auditLogs: raw.auditLogs ?? [],
      circlePosts: raw.circlePosts ?? [],
    };
  } catch {
    return fallback;
  }
}

export function writeStore(store: SakhiStore): void {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export function resetStore(): SakhiStore {
  const seed = createInitialStore();
  writeStore(seed);
  return seed;
}

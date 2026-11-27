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
  ironDaysCompleted: number;
  ironDaysTotal: number;
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

export interface SakhiStore {
  patients: PatientRecord[];
  alerts: EscalationAlert[];
  auditLogs: AuditLogEntry[];
}

const STORE_PATH = path.resolve(process.cwd(), "../../data/sakhi-store.json");

export function createInitialStore(): SakhiStore {
  return {
    patients: [
      {
        id: "priya-sharma",
        name: "Priya Sharma",
        gestationWeek: 32,
        gestationDay: 2,
        language: "Hindi",
        speechLang: "hi-IN",
        nextVisitLabel: "ANC Visit #3 · 24 Nov",
        ashaName: "Meena Devi",
        familyName: "Rohit Sharma (Husband)",
        ironDaysCompleted: 24,
        ironDaysTotal: 28,
        entries: [
          {
            id: "e-priya-1",
            dateLabel: "14 Nov",
            kind: "saved",
            spokenQuote: "“Kal raat iron ki goli lena bhool gayi, aur thakan lag rahi hai.”",
            englishTranslation: "Forgot iron tablet last night and feeling tired.",
            outcomeNote: "Ruled out dizziness · Evening voice reminder scheduled",
            ruleMatched: "MoHFW Routine ANC Adherence",
          },
        ],
      },
      {
        id: "sunita-patil",
        name: "Sunita Patil",
        gestationWeek: 35,
        gestationDay: 4,
        language: "Marathi",
        speechLang: "mr-IN",
        nextVisitLabel: "ANC Visit #4 · 26 Nov",
        ashaName: "Savita Jadhav",
        familyName: "Suresh Patil (Husband)",
        ironDaysCompleted: 26,
        ironDaysTotal: 28,
        entries: [],
      },
      {
        id: "kavita-devi",
        name: "Kavita Devi",
        gestationWeek: 22,
        gestationDay: 1,
        language: "Hindi",
        speechLang: "hi-IN",
        nextVisitLabel: "ANC Visit #2 · 28 Nov",
        ashaName: "Rekha Kumari",
        familyName: "Anil Kumar (Husband)",
        ironDaysCompleted: 18,
        ironDaysTotal: 28,
        entries: [],
      },
    ],
    alerts: [
      {
        id: "alert-seed-sunita",
        patientId: "sunita-patil",
        patientName: "Sunita Patil",
        gestationWeek: 35,
        language: "Marathi",
        severity: "doubt",
        summary: "Reduced baby movement with uncertain onset timing",
        spokenQuote: "“Aaj sakalpasun balachi halchal kami watat aahe.”",
        ashaName: "Savita Jadhav",
        familyName: "Suresh Patil (Husband)",
        acknowledged: true,
        responseNote: "Hospital called · Monitoring scheduled",
        createdAtIso: new Date(Date.now() - 14 * 60_000).toISOString(),
      },
    ],
    auditLogs: [
      {
        id: "audit-1",
        patientName: "Sunita Patil",
        timestampLabel: "14m ago",
        action: "alert",
        ruleMatched: "Escalate on Doubt · Reduced Fetal Movement",
        transcript: "Aaj sakalpasun balachi halchal kami watat aahe.",
        verifiedByDoctor: true,
      },
      {
        id: "audit-2",
        patientName: "Priya Sharma",
        timestampLabel: "14 Nov",
        action: "save_remind",
        ruleMatched: "MoHFW Routine ANC Adherence",
        transcript: "Kal raat iron ki goli lena bhool gayi.",
        verifiedByDoctor: true,
      },
    ],
  };
}

export function readStore(): SakhiStore {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      const seed = createInitialStore();
      writeStore(seed);
      return seed;
    }
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    return JSON.parse(raw) as SakhiStore;
  } catch {
    const seed = createInitialStore();
    writeStore(seed);
    return seed;
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

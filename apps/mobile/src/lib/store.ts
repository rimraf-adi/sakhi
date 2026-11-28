import fs from "fs";
import path from "path";
import type {
  AuditLogEntry,
  CirclePost,
  EscalationAlert,
  NewPatientInput,
  PatientRecord,
  SakhiStoreData,
  Vitals,
} from "./types";

export type { PatientRecord } from "./types";

const STORE_PATH = path.resolve(process.cwd(), "../../data/sakhi-store.json");

/** New profiles start with no clinical readings, so nothing is invented. */
const EMPTY_VITALS: Vitals = {
  bpSystolic: 0,
  bpDiastolic: 0,
  bpTrend: [],
  weightGainKg: 0,
};

/**
 * A fresh device has no mothers on it: the app opens on onboarding and the
 * record is built from what the mother (or the OPD desk) actually enters.
 */
export function createInitialStore(): SakhiStoreData {
  return { patients: [], alerts: [], auditLogs: [], circlePosts: [] };
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
    supplementDaysCompleted:
      patient.supplementDaysCompleted ?? ironDaysCompleted ?? 0,
    supplementDaysTotal: patient.supplementDaysTotal ?? ironDaysTotal ?? 28,
    supplementTakenToday: patient.supplementTakenToday ?? ironTakenToday ?? false,
    vitals: patient.vitals ?? EMPTY_VITALS,
    entries: patient.entries ?? [],
  };
}

export function readStore(): SakhiStoreData {
  const fallback = createInitialStore();
  try {
    if (!fs.existsSync(STORE_PATH)) return fallback;

    const raw = JSON.parse(fs.readFileSync(STORE_PATH, "utf-8")) as Partial<SakhiStoreData>;
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

export function writeStore(store: SakhiStoreData): void {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export function resetStore(): SakhiStoreData {
  const seed = createInitialStore();
  writeStore(seed);
  return seed;
}

const SPEECH_LANG = { Hindi: "hi-IN", Marathi: "mr-IN" } as const;

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "mother";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

/** Builds a patient record from onboarding input, with derived fields filled in. */
export function createPatient(input: NewPatientInput): PatientRecord {
  const language = input.language === "Marathi" ? "Marathi" : "Hindi";

  return {
    id: `${slugify(input.name)}-${Date.now().toString().slice(-5)}`,
    name: input.name.trim(),
    gestationWeek: clamp(input.gestationWeek, 1, 42),
    gestationDay: clamp(input.gestationDay ?? 0, 0, 6),
    language,
    speechLang: SPEECH_LANG[language],
    nextVisitLabel: input.nextVisitLabel?.trim() || "Next ANC visit",
    ashaName: input.ashaName?.trim() || "ASHA worker",
    familyName: input.familyName?.trim() || "Family contact",
    supplementName: input.supplementName?.trim() || "Daily supplement",
    supplementDaysCompleted: 0,
    supplementDaysTotal: clamp(input.supplementDaysTotal ?? 28, 1, 365),
    supplementTakenToday: false,
    vitals: EMPTY_VITALS,
    entries: [],
  };
}

/** Adds a mother to the shared record and returns her new profile. */
export function enrollPatient(
  store: SakhiStoreData,
  input: NewPatientInput,
): PatientRecord {
  const patient = createPatient(input);
  store.patients = [patient, ...store.patients];
  return patient;
}

const AVATAR_STYLES = [
  { bg: "#C8643B", text: "#FFFFFF" },
  { bg: "#0F4C3A", text: "#FFFFFF" },
  { bg: "#E4DAC7", text: "#101828" },
  { bg: "#F3D3A7", text: "#101828" },
];

export function findPatient(
  store: SakhiStoreData,
  patientId: string | undefined,
): PatientRecord | undefined {
  if (!patientId) return store.patients[0];
  return store.patients.find((patient) => patient.id === patientId) ?? store.patients[0];
}

/** Persists a new circle post written by an enrolled mother. */
export function appendCirclePost(
  store: SakhiStoreData,
  input: { patient: PatientRecord; text: string; withVoice: boolean },
): CirclePost {
  const style = AVATAR_STYLES[store.circlePosts.length % AVATAR_STYLES.length]!;
  const post: CirclePost = {
    id: `post-${Date.now()}`,
    patientId: input.patient.id,
    author: input.patient.name,
    badge: `Wk ${input.patient.gestationWeek}`,
    avatar: input.patient.name.charAt(0).toUpperCase(),
    avatarBg: style.bg,
    avatarText: style.text,
    createdAtIso: new Date().toISOString(),
    text: input.text,
    ...(input.withVoice
      ? { voiceDuration: "0:12", voiceLang: input.patient.language }
      : {}),
    likes: 0,
    replies: 0,
  };
  store.circlePosts = [post, ...store.circlePosts];
  return post;
}

/** Flips today's care item and keeps the completed-day tally in sync. */
export function toggleSupplementToday(
  store: SakhiStoreData,
  patientId: string,
): PatientRecord | undefined {
  const patient = store.patients.find((item) => item.id === patientId);
  if (!patient) return undefined;

  const taking = !patient.supplementTakenToday;
  patient.supplementTakenToday = taking;
  patient.supplementDaysCompleted = clamp(
    patient.supplementDaysCompleted + (taking ? 1 : -1),
    0,
    patient.supplementDaysTotal,
  );
  return patient;
}

export type { AuditLogEntry, CirclePost, EscalationAlert, SakhiStoreData };

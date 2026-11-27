import fs from "fs";
import path from "path";
import type { PatientRecord } from "./store";

let keyCursor = 0;

export function loadGroqKeys(): string[] {
  let raw = process.env.GROQ_API_KEYS ?? process.env.GROQ_API_KEY ?? "";
  if (!raw) {
    try {
      const envPath = path.resolve(process.cwd(), "../../.env");
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        const match = content.match(/^GROQ_API_KEY[S]?=(.+)$/m);
        if (match && match[1]) {
          raw = match[1].trim().replace(/^['"]|['"]$/g, "");
        }
      }
    } catch {
      // Ignore file read issues and fall back cleanly
    }
  }
  return raw
    .split(/[,\n]/)
    .map((k) => k.trim())
    .filter((k) => Boolean(k) && !k.includes("your_groq_api_key"));
}

async function fetchWithGroqKeyRotation(
  url: string,
  buildInit: (apiKey: string) => RequestInit,
): Promise<Response> {
  const keys = loadGroqKeys();
  if (keys.length === 0) {
    throw new Error("GROQ_API_KEYS not set");
  }

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < keys.length; attempt++) {
    const key = keys[(keyCursor + attempt) % keys.length]!;
    const res = await fetch(url, buildInit(key));
    if (res.ok) {
      keyCursor = (keyCursor + attempt + 1) % keys.length;
      return res;
    }
    if (res.status === 429 || res.status >= 500) {
      lastError = new Error(`Groq HTTP ${res.status}`);
      continue;
    }
    const text = await res.text();
    throw new Error(`Groq error ${res.status}: ${text.slice(0, 200)}`);
  }
  throw lastError ?? new Error("All Groq API keys failed");
}

export async function transcribeAudioWithGroq(
  audioBlob: Blob,
  filename: string,
  speechLang: "hi-IN" | "mr-IN",
): Promise<string> {
  const langCode = speechLang === "mr-IN" ? "mr" : "hi";
  const res = await fetchWithGroqKeyRotation(
    "https://api.groq.com/openai/v1/audio/transcriptions",
    (apiKey) => {
      const form = new FormData();
      form.append("file", audioBlob, filename);
      form.append("model", "whisper-large-v3-turbo");
      form.append("language", langCode);
      form.append("response_format", "json");
      return {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: form,
      };
    },
  );
  const data = (await res.json()) as { text?: string };
  return (data.text ?? "").trim();
}

export interface VoiceEvaluationResult {
  englishTranslation: string;
  followUpQuestion: string;
  followUpTranslation: string;
  repeatBackText: string;
  action: "alert" | "save_remind";
  severity: "urgent" | "doubt" | "routine";
  ruleMatched: string;
  spokenGuidance: string;
  reminderNote: string;
  modelUsed: string;
}

const DANGER_PATTERNS =
  /sar dard|headache|sujan|sujhe|swollen|dhundhla|blur|bleed|khoon|convulsion|daura|fit|halchal|movement|kam |kami|chakkar|dizz|saans|breath/i;

const DOUBT_PATTERNS =
  /nakki|mahit nahi|pata nahi|not sure|unsure|maybe|shayad|thoda|unclear/i;

function buildDeterministicFallback(params: {
  patient: PatientRecord;
  combinedText: string;
  modelUsed: string;
}): VoiceEvaluationResult {
  const { patient, combinedText, modelUsed } = params;
  const firstName = patient.name.split(" ")[0] || patient.name;
  const ashaFirst = patient.ashaName.split(" ")[0] || "health professional";
  const familyFirst = patient.familyName.split(" ")[0] || "family";
  const isMarathi = patient.language === "Marathi";

  const hasDanger = DANGER_PATTERNS.test(combinedText);
  const hasDoubt = DOUBT_PATTERNS.test(combinedText);
  const action: "alert" | "save_remind" = hasDanger || hasDoubt ? "alert" : "save_remind";
  const severity: "urgent" | "doubt" | "routine" =
    action === "save_remind"
      ? "routine"
      : hasDoubt && !/dhundhla|blur|bleed|khoon/i.test(combinedText)
        ? "doubt"
        : "urgent";

  if (action === "alert") {
    return {
      englishTranslation: combinedText,
      followUpQuestion: isMarathi
        ? `${firstName} tai, kalji karu naka. Kiti velapasun he janavat aahe?`
        : `${firstName}, chinta mat karo, main yahin hoon. Bas ek baat batao, kya subah se aankhon ke aage thoda dhundhla lag raha hai?`,
      followUpTranslation: isMarathi
        ? "How long have you been noticing this?"
        : "Have you noticed blurred vision since morning?",
      repeatBackText: isMarathi
        ? `${firstName} tai, he lakshan aaj hospital madhe dakhavne garjeche aahe. Mi ${ashaFirst} didi aani ${familyFirst} la aatta mahiti pathavu ka?`
        : `${firstName}, sar dard aur dhundhla dikhna aaj raat hospital mein dikhana zaroori hai. Kya main ${ashaFirst} didi aur ${familyFirst} ko abhi khabar bhej doon?`,
      action: "alert",
      severity,
      ruleMatched:
        severity === "doubt"
          ? "MoHFW Escalate on Uncertainty Rule"
          : "MoHFW Danger-Sign Escalation Rule",
      spokenGuidance: isMarathi
        ? `Mi ${ashaFirst} didi aani ${familyFirst} la sangitle aahe. Aapn shant basa, aamhi sobat aahot.`
        : `Maine ${ashaFirst} didi aur ${familyFirst} ko bata diya hai. Aap bas aaram se baithiye, hum sab saath hain.`,
      reminderNote: "Health professional & chosen family notified",
      modelUsed,
    };
  }

  return {
    englishTranslation: combinedText,
    followUpQuestion: isMarathi
      ? `${firstName} tai, chakkar kinva itar tras nahi na?`
      : `${firstName}, kya aapko chakkar ya koi aur takleef toh nahi ho rahi?`,
    followUpTranslation: "Any dizziness or other discomfort?",
    repeatBackText: isMarathi
      ? `Kalji karu naka ${firstName} tai. Mi doctor sathi note kele aahe aani udya sandhyakali 8 vajta aathvan karun dein.`
      : `Koi baat nahi ${firstName}, kabhi kabhi bhool jaate hain. Maine doctor ke liye note kar liya hai, aur kal shaam 8 baje yaad dila dungi. Ab aaram se so jao.`,
    action: "save_remind",
    severity: "routine",
    ruleMatched: "MoHFW Routine Care & Iron Adherence",
    spokenGuidance: isMarathi
      ? `Tumchya pre-visit timeline madhe save kele aahe. Aata aaram kara.`
      : `Maine doctor ke liye note kar liya hai, aur kal shaam 8 baje yaad dila dungi. Ab aaram se so jao.`,
    reminderNote: "Saved for next ANC visit · 8 PM reminder set",
    modelUsed,
  };
}

export async function evaluateVoiceTurnWithGroq(params: {
  patient: PatientRecord;
  transcript: string;
  phase: "initial" | "followup";
  priorUtterance?: string;
}): Promise<VoiceEvaluationResult> {
  const { patient, transcript, phase, priorUtterance } = params;
  const combinedText = `${priorUtterance ?? ""} ${transcript}`.trim();
  const keys = loadGroqKeys();

  if (keys.length === 0) {
    return buildDeterministicFallback({
      patient,
      combinedText,
      modelUsed: "mohfw-local-fallback",
    });
  }

  const firstName = patient.name.split(" ")[0] || patient.name;
  const ashaFirst = patient.ashaName.split(" ")[0] || "health professional";
  const familyFirst = patient.familyName.split(" ")[0] || "family";

  const systemPrompt = `You are Sakhi, a warm, caring voice-first maternal health companion in India.
STRICT RULES:
1. NEVER diagnose a medical condition and NEVER prescribe or advise medicine.
2. Answer ONLY from the patient's record (Week ${patient.gestationWeek}, language ${patient.language}, next visit ${patient.nextVisitLabel}) and Ministry of Health (MoHFW) maternal danger-sign rules.
3. Danger signs: severe headache with blurred vision or face/hand/feet swelling, vaginal bleeding, convulsions, high fever, severe abdominal pain, reduced fetal movement, or severe dizziness/breathlessness.
4. Keep Sakhi's tone warm, reassuring, and natural in Romanized ${patient.language}. Avoid robotic medical jargon and never say "pyaar se".
5. Autonomy & consent: In repeatBackText when action="alert", warmly ask ${firstName}'s permission before alerting ${ashaFirst} didi and ${familyFirst} (e.g. "Kya main ${ashaFirst} didi aur ${familyFirst} ko abhi khabar bhej doon?").
6. If ANY symptom matches a danger sign OR the patient sounds unsure, set action="alert" and severity="urgent" (or "doubt"). Only mild routine events like a missed iron tablet with no danger signs get action="save_remind".
7. Output STRICT JSON with keys: englishTranslation, followUpQuestion, followUpTranslation, repeatBackText, action ("alert" | "save_remind"), severity ("urgent" | "doubt" | "routine"), ruleMatched, spokenGuidance, reminderNote. Do NOT use em dashes.`;

  const userPrompt = JSON.stringify({
    patientName: patient.name,
    gestationWeek: patient.gestationWeek,
    language: patient.language,
    phase,
    priorUtterance: priorUtterance ?? null,
    latestUtterance: transcript,
  });

  try {
    const res = await fetchWithGroqKeyRotation(
      "https://api.groq.com/openai/v1/chat/completions",
      (apiKey) => ({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      }),
    );

    const payload = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const rawJson = payload.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(rawJson) as Partial<VoiceEvaluationResult>;

    const fallback = buildDeterministicFallback({
      patient,
      combinedText,
      modelUsed: "openai/gpt-oss-120b",
    });

    const hasDangerKeyword = DANGER_PATTERNS.test(combinedText);
    const hasDoubtKeyword = DOUBT_PATTERNS.test(combinedText);
    const safeAction: "alert" | "save_remind" =
      parsed.action === "alert" || hasDangerKeyword || hasDoubtKeyword
        ? "alert"
        : "save_remind";
    const safeSeverity: "urgent" | "doubt" | "routine" =
      safeAction === "save_remind"
        ? "routine"
        : hasDoubtKeyword && !/dhundhla|blur|bleed|khoon/i.test(combinedText)
          ? "doubt"
          : parsed.severity === "doubt"
            ? "doubt"
            : "urgent";

    return {
      englishTranslation: parsed.englishTranslation || fallback.englishTranslation,
      followUpQuestion: parsed.followUpQuestion || fallback.followUpQuestion,
      followUpTranslation: parsed.followUpTranslation || fallback.followUpTranslation,
      repeatBackText: parsed.repeatBackText || fallback.repeatBackText,
      action: safeAction,
      severity: safeSeverity,
      ruleMatched: parsed.ruleMatched || fallback.ruleMatched,
      spokenGuidance: parsed.spokenGuidance || fallback.spokenGuidance,
      reminderNote: parsed.reminderNote || fallback.reminderNote,
      modelUsed: "openai/gpt-oss-120b",
    };
  } catch {
    return buildDeterministicFallback({
      patient,
      combinedText,
      modelUsed: "mohfw-local-fallback",
    });
  }
}

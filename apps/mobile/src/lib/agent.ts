/**
 * The Sakhi agent turn.
 *
 * Layering, deliberately one-way:
 *   1. the model reads her words and lists symptoms (extraction only)
 *   2. triage.ts decides urgency from those symptoms
 *   3. agentCopy.ts phrases that decision in her language
 *
 * The model never chooses to escalate, which is why it cannot invent a danger
 * sign or page the ASHA over a missed iron tablet.
 */

import {
  acknowledgement,
  afterConsent,
  consentPrompt,
  questionFor,
  reminderNote,
  routineGuidance,
  type AgentLanguage,
} from "./agentCopy";
import { structuredCompletion } from "./groq";
import {
  assess,
  decisiveSigns,
  extractFindings,
  planQuestion,
  type Finding,
  type QuestionId,
  type SignId,
} from "./triage";
import type { AgentFindingView, AgentTurn, PatientRecord } from "./types";

/**
 * Question budget. A routine night gets one clarifying question and then an
 * answer; only an unresolved danger-adjacent sign earns a second.
 */
function questionBudget(level: "urgent" | "doubt" | "routine"): number {
  return level === "routine" ? 1 : 2;
}

const SIGN_LABELS: Record<SignId, string> = {
  bleeding: "vaginal bleeding",
  convulsion: "convulsions",
  fever: "high fever",
  breathing: "breathlessness",
  reduced_movement: "reduced fetal movement",
  vision_change: "blurred vision",
  swelling: "face or hand swelling",
  abdominal_pain: "severe abdominal pain",
  headache: "headache",
  dizziness: "dizziness",
  tiredness: "tiredness",
};

const SIGN_IDS = Object.keys(SIGN_LABELS) as SignId[];

const EXTRACTION_SYSTEM = `You are a clinical scribe for an Indian maternal-health helpline.
Read one message from a pregnant woman, written in Romanized Hindi or Marathi, sometimes with English words.
List only the symptoms she actually talks about. Allowed sign ids:
${SIGN_IDS.join(", ")}.
State rules:
- "present" when she affirms it
- "negated" when she denies it (nahi, nahin, nako, no, nahi aa rahe)
- "uncertain" when she hedges (thoda, shayad, pata nahi, nakki nahi, kami vatat)
Copy the exact words she used in "quote". Never add a symptom she did not mention.
Return strict JSON only: {"findings":[{"sign":"<id>","state":"present|negated|uncertain","quote":"..."}]}`;

function toFinding(id: SignId, present: boolean, uncertain: boolean, quote: string): Finding {
  return { id, label: SIGN_LABELS[id], present, uncertain, quote };
}

/** Model extraction, validated against the allowed signs. Null means "use regex". */
async function extractWithModel(
  transcript: string,
  language: string,
): Promise<Finding[] | null> {
  // SAKHI_STRICT_RULES=1 keeps the demo on the deterministic extractor.
  if (process.env.SAKHI_STRICT_RULES === "1") return null;

  const raw = await structuredCompletion(
    EXTRACTION_SYSTEM,
    JSON.stringify({ language, message: transcript }),
  );
  if (!raw || typeof raw !== "object" || !("findings" in raw)) return null;

  const listed = (raw as { findings?: unknown }).findings;
  if (!Array.isArray(listed)) return null;

  const findings: Finding[] = [];
  for (const item of listed) {
    if (!item || typeof item !== "object") continue;
    const record = item as { sign?: unknown; state?: unknown; quote?: unknown };
    const sign = record.sign as SignId;
    if (!SIGN_IDS.includes(sign)) continue;
    const state = record.state;
    if (state !== "present" && state !== "negated" && state !== "uncertain") continue;
    findings.push(
      toFinding(
        sign,
        state !== "negated",
        state === "uncertain",
        typeof record.quote === "string" ? record.quote : "",
      ),
    );
  }
  return findings;
}

/** Later turns win, so a denial in the follow-up clears the earlier mention. */
function mergeFindings(prior: Finding[], fresh: Finding[]): Finding[] {
  const merged = new Map<SignId, Finding>();
  for (const finding of [...prior, ...fresh]) {
    merged.set(finding.id, finding);
  }
  return [...merged.values()];
}

function toViews(findings: Finding[]): AgentFindingView[] {
  return findings.map(({ id, label, present, uncertain }) => ({ id, label, present, uncertain }));
}

export interface AgentTurnInput {
  patient: PatientRecord;
  transcript: string;
  phase: "initial" | "followup";
  priorFindings?: AgentFindingView[];
  askedQuestions?: string[];
}

export async function runAgentTurn(input: AgentTurnInput): Promise<AgentTurn> {
  const language: AgentLanguage = input.patient.language === "Marathi" ? "Marathi" : "Hindi";
  const voice = {
    name: input.patient.name.split(" ")[0] || input.patient.name,
    asha: input.patient.ashaName.split(" ")[0] || "ASHA",
    family: input.patient.familyName.split(" (")[0] || "parivaar",
  };

  const prior = (input.priorFindings ?? [])
    .filter((finding) => SIGN_IDS.includes(finding.id as SignId))
    .map((finding) =>
      toFinding(finding.id as SignId, finding.present, finding.uncertain, ""),
    );

  const modelFindings = await extractWithModel(input.transcript, input.patient.language);
  const fresh = modelFindings ?? extractFindings(input.transcript);
  const engine: AgentTurn["engine"] = modelFindings ? "llm-rules" : "rules";

  const findings = mergeFindings(prior, fresh);
  const assessment = assess(findings);
  const asked = (input.askedQuestions ?? []) as QuestionId[];
  const opener = acknowledgement(findings, language, voice);

  if (assessment.action === "alert") {
    const signs = decisiveSigns(assessment);
    const consent = consentPrompt(signs, assessment.level === "doubt" ? "doubt" : "urgent", language, voice);
    return {
      action: "alert",
      severity: assessment.level,
      message: `${opener} ${consent}`,
      consentPrompt: consent,
      guidanceAfterConsent: afterConsent(language, voice),
      reminderNote: "Health professional and family notified",
      ruleMatched: assessment.ruleMatched,
      rationale: assessment.rationale,
      questionId: null,
      findings: toViews(findings),
      engine,
    };
  }

  const planned =
    asked.length >= questionBudget(assessment.level) ? null : planQuestion(findings, asked);
  const question = planned ? questionFor(planned.id, language) : null;

  if (planned && question) {
    return {
      action: "ask",
      severity: "routine",
      message: `${opener} ${question}`,
      consentPrompt: null,
      guidanceAfterConsent: null,
      reminderNote: "",
      ruleMatched: assessment.ruleMatched,
      rationale: assessment.rationale,
      questionId: planned.id,
      findings: toViews(findings),
      engine,
    };
  }

  return {
    action: "save_remind",
    severity: "routine",
    message: `${opener} ${routineGuidance(findings, language)}`,
    consentPrompt: null,
    guidanceAfterConsent: null,
    reminderNote: reminderNote(findings, language, input.patient.supplementName),
    ruleMatched: assessment.ruleMatched,
    rationale: assessment.rationale,
    questionId: null,
    findings: toViews(findings),
    engine,
  };
}

/**
 * Deterministic MoHFW danger-sign triage.
 *
 * The model never decides escalation. It extracts what the mother said, this
 * file decides what it means, and the copy layer only phrases that decision.
 * That is why a missed tablet with "no dizziness" stays routine instead of
 * paging the ASHA.
 */

export type SignId =
  | "bleeding"
  | "convulsion"
  | "fever"
  | "breathing"
  | "reduced_movement"
  | "vision_change"
  | "swelling"
  | "abdominal_pain"
  | "headache"
  | "dizziness"
  | "tiredness";

interface SignRule {
  id: SignId;
  /** English clinical label, used in rationale and on the clinic desk. */
  label: string;
  /** A danger sign on its own, no companion needed. */
  dangerAlone: boolean;
  pattern: RegExp;
}

const SIGN_RULES: SignRule[] = [
  {
    id: "bleeding",
    label: "vaginal bleeding",
    dangerAlone: true,
    pattern: /bleed|khoon|blood|rakta|रक्त|खून/i,
  },
  {
    id: "convulsion",
    label: "convulsions or fits",
    dangerAlone: true,
    pattern: /convuls|daura|fit(s)?\b|jhatka|झटका|दौरा/i,
  },
  {
    id: "fever",
    label: "high fever",
    dangerAlone: true,
    pattern: /bukhar|fever|taap|ताप|बुखार/i,
  },
  {
    id: "breathing",
    label: "breathlessness",
    dangerAlone: true,
    pattern: /saans|breath|dama|दम|सांस|श्वास/i,
  },
  {
    id: "reduced_movement",
    label: "reduced fetal movement",
    dangerAlone: true,
    pattern: /halchal|movement|harkat|balachi|bachche.*(chal|mov)|हलचल/i,
  },
  {
    id: "vision_change",
    label: "blurred vision",
    dangerAlone: true,
    pattern: /dhundhla|dhundla|blur|dhoka|andhera|chakachak|धुंधल|धुंध/i,
  },
  {
    id: "swelling",
    label: "face or hand swelling",
    dangerAlone: false,
    pattern: /sujan|sujhe|sujha|swollen|swelling|sooj|sujli|सूज/i,
  },
  {
    id: "abdominal_pain",
    label: "severe abdominal pain",
    dangerAlone: true,
    pattern: /(tez|severe|bahut|kadak).{0,12}(pet|abdomen|pait).{0,12}dard|pet ?dard|पेट ?दर्द/i,
  },
  {
    id: "headache",
    label: "headache",
    dangerAlone: false,
    pattern: /sar ?dard|sir ?dard|headache|dokedukhi|डोकेदुखी|सिर ?दर्द/i,
  },
  {
    id: "dizziness",
    label: "dizziness",
    dangerAlone: false,
    pattern: /chakkar|dizzi|dizz|giddiness|चक्कर/i,
  },
  {
    id: "tiredness",
    label: "tiredness",
    dangerAlone: false,
    pattern: /thakan|thakwa|tired|kamjori|कमजोरी|थकान/i,
  },
];

const NEGATION =
  /\b(nahi|nahin|nai|nako|naahi|no|not|never|bilkul nahi|kadhi nahi|nahi aa rahe|nahi ho raha|नहीं|नको)\b/i;

const UNCERTAINTY =
  /\b(thoda|thodi|shayad|maybe|pata nahi|mahit nahi|nakki nahi|not sure|unsure|kami vatat|sometimes|kabhi kabhi|थोड़ा|शायद)\b/i;

export interface Finding {
  id: SignId;
  label: string;
  present: boolean;
  uncertain: boolean;
  quote: string;
}

export interface TriageAssessment {
  level: "urgent" | "doubt" | "routine";
  action: "alert" | "save_remind";
  confirmed: Finding[];
  uncertain: Finding[];
  negated: Finding[];
  ruleMatched: string;
  /** English one-liner for the audit trail and the clinic desk. */
  rationale: string;
}

/** Splits on sentence and clause boundaries: negation scope matters. */
function clauses(text: string): string[] {
  return text
    .split(/[.,;!?]|\band\b|\baur\b|\baani\b|\bpan\b|\blekin\b|\bbut\b/gi)
    .map((clause) => clause.trim())
    .filter(Boolean);
}

/** Finds every sign she mentioned, with whether she affirmed or denied it. */
export function extractFindings(text: string): Finding[] {
  const findings: Finding[] = [];
  const seen = new Set<SignId>();

  for (const clause of clauses(text)) {
    for (const rule of SIGN_RULES) {
      if (!rule.pattern.test(clause) || seen.has(rule.id)) continue;
      seen.add(rule.id);
      const negated = NEGATION.test(clause);
      findings.push({
        id: rule.id,
        label: rule.label,
        present: !negated,
        uncertain: !negated && UNCERTAINTY.test(clause),
        quote: clause,
      });
    }
  }
  return findings;
}

/** Escalation needs a danger sign on its own, or the classic pre-eclampsia pair. */
export function assess(findings: Finding[]): TriageAssessment {
  const confirmed = findings.filter((finding) => finding.present && !finding.uncertain);
  const uncertain = findings.filter((finding) => finding.present && finding.uncertain);
  const negated = findings.filter((finding) => !finding.present);

  const confirmedDanger = confirmed.filter(
    (finding) => SIGN_RULES.find((rule) => rule.id === finding.id)?.dangerAlone,
  );
  const uncertainDanger = uncertain.filter(
    (finding) => SIGN_RULES.find((rule) => rule.id === finding.id)?.dangerAlone,
  );

  const ids = new Set(confirmed.map((finding) => finding.id));
  // Severe pre-eclampsia: headache, vision change and swelling cluster together.
  const preEclampsiaPair = ids.has("headache") && (ids.has("vision_change") || ids.has("swelling"));
  const swellingCluster = ids.has("swelling") && (ids.has("vision_change") || ids.has("headache"));

  if (confirmedDanger.length > 0 || preEclampsiaPair || swellingCluster) {
    const names = [
      ...confirmedDanger.map((finding) => finding.label),
      ...(preEclampsiaPair || swellingCluster
        ? confirmed
            .filter((finding) => ["headache", "vision_change", "swelling"].includes(finding.id))
            .map((finding) => finding.label)
        : []),
    ];
    const uniqueNames = [...new Set(names)];
    return {
      level: "urgent",
      action: "alert",
      confirmed,
      uncertain,
      negated,
      ruleMatched: `MoHFW danger sign · ${uniqueNames.join(" + ")}`,
      rationale: `Escalate: ${uniqueNames.join(", ")} confirmed.`,
    };
  }

  if (uncertainDanger.length > 0) {
    return {
      level: "doubt",
      action: "alert",
      confirmed,
      uncertain,
      negated,
      ruleMatched: `MoHFW escalate on uncertainty · ${uncertainDanger.map((f) => f.label).join(" + ")}`,
      rationale: `Escalate: ${uncertainDanger
        .map((finding) => finding.label)
        .join(", ")} reported but not clearly confirmed.`,
    };
  }

  const mild = confirmed.map((finding) => finding.label);
  return {
    level: "routine",
    action: "save_remind",
    confirmed,
    uncertain,
    negated,
    ruleMatched: mild.length > 0 ? `MoHFW routine care · ${mild.join(" + ")}` : "MoHFW routine care",
    rationale:
      mild.length > 0
        ? `No danger sign. Noted: ${mild.join(", ")}.`
        : "No danger sign reported.",
  };
}

export type QuestionId =
  | "vision_and_swelling"
  | "movement_timing"
  | "pain_level"
  | "dizziness_check"
  | "fever_check"
  | "general";

export interface PlannedQuestion {
  id: QuestionId;
  /** Which sign this question is designed to settle. */
  targets: SignId[];
}

/**
 * One question per turn, aimed at the sign that would change the decision.
 * Never a checklist, and never the same question twice.
 */
/** The signs that actually carried the decision, for the consent sentence. */
export function decisiveSigns(assessment: TriageAssessment): SignId[] {
  if (assessment.level === "doubt") return assessment.uncertain.map((finding) => finding.id);

  const danger = assessment.confirmed
    .filter((finding) => SIGN_RULES.find((rule) => rule.id === finding.id)?.dangerAlone)
    .map((finding) => finding.id);
  const cluster = assessment.confirmed
    .filter((finding) => ["headache", "vision_change", "swelling"].includes(finding.id))
    .map((finding) => finding.id);

  return [...new Set([...danger, ...(cluster.length >= 2 ? cluster : [])])];
}

export function planQuestion(
  findings: Finding[],
  asked: QuestionId[],
): PlannedQuestion | null {
  const present = new Set(findings.filter((finding) => finding.present).map((f) => f.id));
  const candidates: PlannedQuestion[] = [];

  if (present.has("headache")) {
    candidates.push({ id: "vision_and_swelling", targets: ["vision_change", "swelling"] });
  }
  if (present.has("reduced_movement")) {
    candidates.push({ id: "movement_timing", targets: ["reduced_movement"] });
  }
  if (present.has("abdominal_pain")) {
    candidates.push({ id: "pain_level", targets: ["abdominal_pain"] });
  }
  if (present.has("tiredness") || present.has("headache")) {
    candidates.push({ id: "dizziness_check", targets: ["dizziness"] });
  }
  if (present.has("fever")) {
    candidates.push({ id: "fever_check", targets: ["fever"] });
  }
  candidates.push({ id: "general", targets: [] });

  const answered = new Set(findings.map((finding) => finding.id));

  return (
    candidates.find(
      (candidate) =>
        !asked.includes(candidate.id) &&
        // Never ask about a sign she has already answered either way.
        (candidate.targets.length === 0 || candidate.targets.some((sign) => !answered.has(sign))),
    ) ?? null
  );
}

/**
 * Sakhi's spoken copy, in her own voice.
 *
 * Everything here is keyed to a decision from triage.ts: the same turnaround
 * she would give her own neighbour. Short sentences, her name once, a reason
 * before any ask, and no echo of what she just heard.
 */

import type { Finding, QuestionId, SignId } from "./triage";

export type AgentLanguage = "Hindi" | "Marathi";

interface Voice {
  name: string;
  asha: string;
  family: string;
}

const SIGN_PHRASE: Record<SignId, { hi: string; mr: string }> = {
  bleeding: { hi: "khoon aana", mr: "rakta yet aahe" },
  convulsion: { hi: "jhatke aana", mr: "jhatke yetat" },
  fever: { hi: "tez bukhar", mr: "teev taap" },
  breathing: { hi: "saans lena mushkil hona", mr: "shwaas ghenyas traas hona" },
  reduced_movement: { hi: "bacche ki halchal kam hona", mr: "balachi halchal kami hona" },
  vision_change: { hi: "aankhon ke aage dhundhla dikhna", mr: "dolyansamor dhundhla disne" },
  swelling: { hi: "chehre ya haath par sujan", mr: "chehra kinva hatavar suj" },
  abdominal_pain: { hi: "pet mein tez dard", mr: "potat tivra vedna" },
  headache: { hi: "sar dard", mr: "dokedukhi" },
  dizziness: { hi: "chakkar aana", mr: "chakkar yene" },
  tiredness: { hi: "thakan", mr: "thakan" },
};

function phrase(sign: SignId, language: AgentLanguage): string {
  const entry = SIGN_PHRASE[sign];
  return language === "Marathi" ? entry.mr : entry.hi;
}

function listOf(signs: SignId[], language: AgentLanguage): string {
  const words = signs.map((sign) => phrase(sign, language));
  if (words.length <= 1) return words.join("");
  const last = words[words.length - 1];
  const head = words.slice(0, -1).join(", ");
  return language === "Marathi" ? `${head} aani ${last}` : `${head} aur ${last}`;
}

/** Opens the turn by naming one concrete thing, not the whole transcript. */
export function acknowledgement(
  findings: Finding[],
  language: AgentLanguage,
  voice: Voice,
): string {
  const present = findings.filter((finding) => finding.present);
  const tired = present.some((finding) => finding.id === "tiredness");
  const missedTablet = /goli|tablet|dawa|dav|iron/i.test(
    findings.map((finding) => finding.quote).join(" "),
  );

  if (language === "Marathi") {
    if (tired && missedTablet) return `Kalji ghe ${voice.name}, goli chukli tar thakan jhalte.`;
    if (tired) return `Kalji ghe ${voice.name}, thakan ajun jhalte.`;
    return `Samajle ${voice.name}.`;
  }

  if (tired && missedTablet) return `Samajh gayi ${voice.name}, goli chhoot jaye to thakan hoti hai.`;
  if (tired) return `Samajh gayi ${voice.name}, thakan abhi bhi hai.`;
  if (present.length > 0) return `Samajh gayi ${voice.name}.`;
  return `Sun rahi hoon, ${voice.name}.`;
}

/** The single next question, chosen by planQuestion(). */
export function questionFor(id: QuestionId, language: AgentLanguage): string | null {
  const copy: Record<QuestionId, { hi: string; mr: string }> = {
    vision_and_swelling: {
      hi: "Roshni ke saamne dhundhla dikhta hai, ya chehre-haath par sujan hai?",
      mr: "Ujalyaat dhundhla disat, kinva chehra-hatavar suj aahe ka?",
    },
    movement_timing: {
      hi: "Halchal kal se kam hai, ya aaj subah se?",
      mr: "Halchal kalapasun kami aahe, ki aaj sakalpasun?",
    },
    pain_level: {
      hi: "Dard lagata rehta hai, ya uthta-baithta hai?",
      mr: "Vedna kadhi kadhi yete, ki satat aste?",
    },
    dizziness_check: {
      hi: "Chakkar aa rahe hain ya nahi?",
      mr: "Chakkar yetat ka, nahi ka?",
    },
    fever_check: {
      hi: "Tan garam laga ya bukhar hai aaj?",
      mr: "Aaj ang garam vatat kinva taap aahe ka?",
    },
    general: {
      hi: "Thakan ke alawa aaj kuch aur takleef ho rahi hai?",
      mr: "Thakan shivay aaj kahi aur tras hoto ka?",
    },
  };
  const entry = copy[id];
  return language === "Marathi" ? entry.mr : entry.hi;
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Consent ask, only ever after the rules engine confirmed a danger sign. */
export function consentPrompt(
  signs: SignId[],
  level: "urgent" | "doubt",
  language: AgentLanguage,
  voice: Voice,
): string {
  const listed = capitalise(listOf(signs, language));

  if (language === "Marathi") {
    return level === "urgent"
      ? `${listed} dhangar ahe. Aaj hospital dakhvave lagel. Mi ${voice.asha} didi aani ${voice.family} la khabar pathvu ka?`
      : `${listed} kade laksh dene garjeche aahe. Aaj hospital madhe ekda dakhva. Mi ${voice.asha} didi aani ${voice.family} la khabar pathvu ka?`;
  }
  return level === "urgent"
    ? `${listed} danger sign hai. Aaj hospital dikhana zaroori hai. Kya main ${voice.asha} didi aur ${voice.family} ko khabar bhej doon?`
    : `${listed} par dhyaan dena zaroori hai. Aaj hospital mein ek baar dikha lein. Kya main ${voice.asha} didi aur ${voice.family} ko khabar bhej doon?`;
}

/** What she hears after a routine turn: the action, not a recap. */
export function routineGuidance(findings: Finding[], language: AgentLanguage): string {
  const tired = findings.some((finding) => finding.present && finding.id === "tiredness");
  const night = new Date().getHours() >= 20 || new Date().getHours() < 5;

  if (language === "Marathi") {
    return tired
      ? `Aaj paani tar pya ani lavkar zop. Udya sakali goli ghetli ki thakan kami hoil.`
      : `Note karun ghetle. Aaram kara, mi udya yaad dilaen.`;
  }
  return tired
    ? `Aaj paani zyada piyo aur jaldi so jao. Kal subah goli lene se thakan kam hogi.`
    : night
      ? `Main note kar liya. Ab aaram se so jao, subah yaad dila dungi.`
      : `Main note kar liya. Aaj paani zyada piyo aur aaram karo.`;
}

/** The care item comes from her own record, so nothing is assumed about it. */
export function reminderNote(
  findings: Finding[],
  language: AgentLanguage,
  careItem = "Daily supplement",
): string {
  const tired = findings.some((finding) => finding.present && finding.id === "tiredness");
  if (language === "Marathi") {
    return tired
      ? `${careItem} + paani · udya sakali phone: 8:00 AM`
      : "Timeline madhe save · udya phone 8:00 AM";
  }
  return tired
    ? `${careItem} + paani · Kal subah 8 baje reminder`
    : "Saved for ANC visit · 8 AM reminder";
}

export function declineAcknowledgement(language: AgentLanguage): string {
  return language === "Marathi" ? "Theek aahe, kahi pathavle nahi." : "Theek hai, abhi kuch nahi bheja.";
}

/** What she says once the mother agrees to escalate. */
export function afterConsent(language: AgentLanguage, voice: Voice): string {
  return language === "Marathi"
    ? `Theek aahe, mi aatta ${voice.asha} didi aani ${voice.family} la khabar pathavte. Tu shant basa, aamhi sobat aahot.`
    : `Theek hai, main abhi ${voice.asha} didi aur ${voice.family} ko khabar bhej rahi hoon. Aap shant baithiye, hum saath hain.`;
}

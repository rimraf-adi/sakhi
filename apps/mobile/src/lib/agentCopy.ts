/**
 * Sakhi's spoken copy, in her own voice.
 *
 * Everything here is keyed to a decision from triage.ts: the same turnaround
 * she would give her own neighbour. Short sentences, her name once, a reason
 * before any ask, and no echo of what she just heard.
 *
 * English is the default track; Hindi and Marathi are the two the mother can
 * pick at onboarding. All three are static strings, so the flow never needs an
 * API key to speak.
 */

import type { Finding, QuestionId, SignId } from "./triage";

export type AgentLanguage = "English" | "Hindi" | "Marathi";

interface Lines {
  en: string;
  hi: string;
  mr: string;
}

interface Voice {
  name: string;
  asha: string;
  family: string;
}

function pick(lines: Lines, language: AgentLanguage): string {
  return language === "Marathi" ? lines.mr : language === "Hindi" ? lines.hi : lines.en;
}

const SIGN_PHRASE: Record<SignId, Lines> = {
  bleeding: { en: "bleeding", hi: "khoon aana", mr: "rakta yet aahe" },
  convulsion: { en: "fits", hi: "jhatke aana", mr: "jhatke yetat" },
  fever: { en: "high fever", hi: "tez bukhar", mr: "teev taap" },
  breathing: {
    en: "difficulty breathing",
    hi: "saans lena mushkil hona",
    mr: "shwaas ghenyas traas hona",
  },
  reduced_movement: {
    en: "less baby movement",
    hi: "bacche ki halchal kam hona",
    mr: "balachi halchal kami hona",
  },
  vision_change: {
    en: "blurred vision",
    hi: "aankhon ke aage dhundhla dikhna",
    mr: "dolyansamor dhundhla disne",
  },
  swelling: {
    en: "swelling on the face or hands",
    hi: "chehre ya haath par sujan",
    mr: "chehra kinva hatavar suj",
  },
  abdominal_pain: { en: "severe stomach pain", hi: "pet mein tez dard", mr: "potat tivra vedna" },
  headache: { en: "headache", hi: "sar dard", mr: "dokedukhi" },
  dizziness: { en: "dizziness", hi: "chakkar aana", mr: "chakkar yene" },
  tiredness: { en: "tiredness", hi: "thakan", mr: "thakan" },
};

function phrase(sign: SignId, language: AgentLanguage): string {
  return pick(SIGN_PHRASE[sign], language);
}

function listOf(signs: SignId[], language: AgentLanguage): string {
  const words = signs.map((sign) => phrase(sign, language));
  if (words.length <= 1) return words.join("");
  const last = words[words.length - 1] ?? "";
  const head = words.slice(0, -1).join(", ");
  if (language === "Marathi") return `${head} aani ${last}`;
  if (language === "Hindi") return `${head} aur ${last}`;
  return `${head} and ${last}`;
}

/** Opens the turn by naming one concrete thing, not the whole transcript. */
export function acknowledgement(
  findings: Finding[],
  language: AgentLanguage,
  voice: Voice,
): string {
  const present = findings.filter((finding) => finding.present);
  const tired = present.some((finding) => finding.id === "tiredness");
  const missedTablet = /goli|tablet|dawa|dav|iron|medicin|pill/i.test(
    findings.map((finding) => finding.quote).join(" "),
  );

  if (tired && missedTablet) {
    return pick(
      {
        en: `I hear you ${voice.name}. A missed tablet can leave you feeling tired.`,
        hi: `Samajh gayi ${voice.name}, goli chhoot jaye to thakan hoti hai.`,
        mr: `Kalji ghe ${voice.name}, goli chukli tar thakan jhalte.`,
      },
      language,
    );
  }
  if (tired) {
    return pick(
      {
        en: `I hear you ${voice.name}, you're still feeling tired.`,
        hi: `Samajh gayi ${voice.name}, thakan abhi bhi hai.`,
        mr: `Kalji ghe ${voice.name}, thakan ajun jhalte.`,
      },
      language,
    );
  }
  if (present.length > 0) {
    return pick(
      {
        en: `I've got it, ${voice.name}.`,
        hi: `Samajh gayi ${voice.name}.`,
        mr: `Samajle ${voice.name}.`,
      },
      language,
    );
  }
  return pick(
    {
      en: `I'm listening, ${voice.name}.`,
      hi: `Sun rahi hoon, ${voice.name}.`,
      mr: `Aikat aahe, ${voice.name}.`,
    },
    language,
  );
}

/** The single next question, chosen by planQuestion(). */
export function questionFor(id: QuestionId, language: AgentLanguage): string | null {
  const copy: Record<QuestionId, Lines> = {
    vision_and_swelling: {
      en: "Is your vision blurred when you look at light, or is there swelling on your face or hands?",
      hi: "Roshni ke saamne dhundhla dikhta hai, ya chehre-haath par sujan hai?",
      mr: "Ujalyaat dhundhla disat, kinva chehra-hatavar suj aahe ka?",
    },
    movement_timing: {
      en: "Has the movement been less since yesterday, or only since this morning?",
      hi: "Halchal kal se kam hai, ya aaj subah se?",
      mr: "Halchal kalapasun kami aahe, ki aaj sakalpasun?",
    },
    pain_level: {
      en: "Is the pain there all the time, or does it come and go?",
      hi: "Dard lagata rehta hai, ya uthta-baithta hai?",
      mr: "Vedna kadhi kadhi yete, ki satat aste?",
    },
    dizziness_check: {
      en: "Are you feeling dizzy, or not?",
      hi: "Chakkar aa rahe hain ya nahi?",
      mr: "Chakkar yetat ka, nahi ka?",
    },
    fever_check: {
      en: "Do you feel hot today, or do you have a fever?",
      hi: "Tan garam laga ya bukhar hai aaj?",
      mr: "Aaj ang garam vatat kinva taap aahe ka?",
    },
    general: {
      en: "Apart from tiredness, is anything else troubling you today?",
      hi: "Thakan ke alawa aaj kuch aur takleef ho rahi hai?",
      mr: "Thakan shivay aaj kahi aur tras hoto ka?",
    },
  };
  return pick(copy[id], language);
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
  if (language === "Hindi") {
    return level === "urgent"
      ? `${listed} danger sign hai. Aaj hospital dikhana zaroori hai. Kya main ${voice.asha} didi aur ${voice.family} ko khabar bhej doon?`
      : `${listed} par dhyaan dena zaroori hai. Aaj hospital mein ek baar dikha lein. Kya main ${voice.asha} didi aur ${voice.family} ko khabar bhej doon?`;
  }
  return level === "urgent"
    ? `${listed} is a danger sign. You need to go to the hospital today. Shall I tell ${voice.asha} and ${voice.family}?`
    : `We should pay attention to ${listed}. Please get checked at the hospital today. Shall I tell ${voice.asha} and ${voice.family}?`;
}

/** What she hears after a routine turn: the action, not a recap. */
export function routineGuidance(findings: Finding[], language: AgentLanguage): string {
  const tired = findings.some((finding) => finding.present && finding.id === "tiredness");
  const night = new Date().getHours() >= 20 || new Date().getHours() < 5;

  if (language === "Marathi") {
    return tired
      ? "Aaj paani tar pya ani lavkar zop. Udya sakali goli ghetli ki thakan kami hoil."
      : "Note karun ghetle. Aaram kara, mi udya yaad dilaen.";
  }
  if (language === "Hindi") {
    return tired
      ? "Aaj paani zyada piyo aur jaldi so jao. Kal subah goli lene se thakan kam hogi."
      : night
        ? "Main note kar liya. Ab aaram se so jao, subah yaad dila dungi."
        : "Main note kar liya. Aaj paani zyada piyo aur aaram karo.";
  }
  return tired
    ? "Drink more water today and sleep early. Taking your tablet in the morning will help."
    : night
      ? "I've noted it. Rest now - I'll remind you in the morning."
      : "I've noted it. Drink more water today and rest.";
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
  if (language === "Hindi") {
    return tired
      ? `${careItem} + paani · Kal subah 8 baje reminder`
      : "Saved for ANC visit · 8 AM reminder";
  }
  return tired
    ? `${careItem} + water · reminder tomorrow 8:00 AM`
    : "Saved for your ANC visit · 8 AM reminder";
}

export function declineAcknowledgement(language: AgentLanguage): string {
  return pick(
    {
      en: "All right, I haven't sent anything.",
      hi: "Theek hai, abhi kuch nahi bheja.",
      mr: "Theek aahe, kahi pathavle nahi.",
    },
    language,
  );
}

/** What she says once the mother agrees to escalate. */
export function afterConsent(language: AgentLanguage, voice: Voice): string {
  return pick(
    {
      en: `All right, I'm telling ${voice.asha} and ${voice.family} now. Stay calm - we're with you.`,
      hi: `Theek hai, main abhi ${voice.asha} didi aur ${voice.family} ko khabar bhej rahi hoon. Aap shant baithiye, hum saath hain.`,
      mr: `Theek aahe, mi aatta ${voice.asha} didi aani ${voice.family} la khabar pathavte. Tu shant basa, aamhi sobat aahot.`,
    },
    language,
  );
}

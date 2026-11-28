/**
 * Sample utterances for the voice flow.
 *
 * They are *inputs* used when a live microphone is unavailable (no STT key,
 * denied permission, or a noisy room). They are attached to whichever mother
 * is active, in her own language - never to a named demo persona - and the
 * agent's reply always comes from /api/voice/respond.
 */
import type { PatientLanguage } from "./types";

export interface DemoScenario {
  id: string;
  short: string;
  label: string;
  language: PatientLanguage;
  utterance: string;
  followupReply: string;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "danger-headache",
    short: "Headache + swelling",
    label: "Hindi: late-night headache with swollen feet",
    language: "Hindi",
    utterance: "Do din se sar dard hai aur pair sujhe hue hain.",
    followupReply: "Haan, subah se thoda dhundhla lag raha hai.",
  },
  {
    id: "doubt-movement",
    short: "Baby movement",
    label: "Marathi: reduced baby movement, unsure",
    language: "Marathi",
    utterance: "Aaj baalachi halchal thodi kami vatat aahe, pan mala nakki mahit nahi.",
    followupReply: "Sakaal pasun thoda kami vatat aahe.",
  },
  {
    id: "routine-tablet",
    short: "Missed tablet",
    label: "Hindi: missed the daily tablet, feeling tired",
    language: "Hindi",
    utterance: "Kal raat goli lena bhool gayi, aur thodi thakan lag rahi hai.",
    followupReply: "Nahi, chakkar nahi aa rahe.",
  },
  {
    id: "routine-tablet-mr",
    short: "Missed tablet",
    label: "Marathi: missed the daily tablet, feeling tired",
    language: "Marathi",
    utterance: "Kal raatri goli ghetli nahi, aani thoda thakan vatat aahe.",
    followupReply: "Nahi, chakkar yet nahit.",
  },
];

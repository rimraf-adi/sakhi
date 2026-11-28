import type { CaptionItem, Patient } from "./types";

/** Stored quotes keep their typographic quotes; the bubbles do not need them. */
function plain(text: string): string {
  return text.replace(/^[\s"“”']+|[\s"“”']+$/g, "");
}

/**
 * Previous conversation shown above the live turn, taken from the patient's
 * stored timeline instead of a hardcoded transcript.
 */
export function captionsFromHistory(patient: Patient | null): CaptionItem[] {
  const entry = patient?.entries?.[0];
  if (!entry) return [];

  return [
    { id: `history-user-${entry.id}`, isSakhi: false, text: plain(entry.spokenQuote) },
    {
      id: `history-${entry.id}`,
      isSakhi: true,
      dotColor: entry.kind === "alert" ? "#EAB685" : "#58B98E",
      text: entry.outcomeNote,
      speakerLabel: entry.kind === "alert" ? "Care trail" : "Saved",
    },
  ];
}

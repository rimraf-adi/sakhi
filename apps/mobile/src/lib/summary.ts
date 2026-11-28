import { supplementWindow } from "./journal";
import type { Patient } from "./types";

/**
 * The one page a doctor reads before she walks in. Everything here is derived
 * from the record she and Sakhi already wrote - no new data, no diagnoses.
 */
export interface SummaryLine {
  dateLabel: string;
  quote: string;
  translated: string;
  ruleMatched: string;
  advice: string;
}

export interface PreVisitSummary {
  headline: string;
  meta: string;
  lines: SummaryLine[];
  watchItems: string[];
  counts: string;
  spoken: string;
}

const WATCH_BY_RULE: { match: RegExp; watch: string }[] = [
  { match: /preeclamp|headache|swelling|vision|bp/i, watch: "Pre-eclampsia triad watched" },
  { match: /movement|kick/i, watch: "Reduced fetal movement raised" },
  { match: /bleed/i, watch: "Bleeding raised" },
  { match: /iron|folic|tablet|supplement/i, watch: "Iron adherence discussed" },
];

export function buildPreVisitSummary(patient: Patient): PreVisitSummary {
  const firstName = patient.name.split(" ")[0] || patient.name;
  const entries = patient.entries.slice(0, 4);
  const lines: SummaryLine[] = entries.map((entry) => ({
    dateLabel: entry.dateLabel,
    quote: entry.spokenQuote,
    translated: entry.englishTranslation,
    ruleMatched: entry.ruleMatched,
    advice: entry.outcomeNote,
  }));

  const alerts = entries.filter((entry) => entry.kind === "alert").length;
  const watchItems = [
    ...new Set(
      entries.flatMap((entry) =>
        WATCH_BY_RULE.filter((rule) => rule.match.test(entry.ruleMatched)).map(
          (rule) => rule.watch,
        ),
      ),
    ),
  ];

  const counts = `${entries.length} conversation${entries.length === 1 ? "" : "s"} · ${alerts} escalated · 0 diagnoses generated`;
  const headline = `${firstName} · Week ${patient.gestationWeek}`;
  const meta = `${patient.nextVisitLabel} · ${patient.language} · zero-typing home notes`;

  const spoken = [
    `${firstName}, week ${patient.gestationWeek}. ${patient.nextVisitLabel}.`,
    ...lines.map(
      (line) =>
        `${line.dateLabel} she said: ${line.quote}${line.translated ? `. In English: ${line.translated}` : ""}. ${line.ruleMatched}. ${line.advice}.`,
    ),
    watchItems.length > 0 ? `Watch for: ${watchItems.join(", ")}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return { headline, meta, lines, watchItems, counts, spoken };
}

/** Trailing run of completed days in the current grid, today included. */
export function adherenceStreak(patient: Patient): number {
  const cells = supplementWindow(patient);
  const todayIndex = cells.findIndex((cell) => cell.state === "today");
  const upto = todayIndex === -1 ? cells.length : todayIndex;
  let streak = 0;
  for (let index = upto; index >= 0; index -= 1) {
    const cell = cells[index];
    if (!cell) continue;
    const taken = cell.state === "done" || (cell.state === "today" && patient.supplementTakenToday);
    if (!taken) break;
    streak += 1;
  }
  return streak;
}

export interface WeeklyRecap {
  title: string;
  line: string;
  spoken: string;
}

/** Sunday-style recap of the care item: what she did, what it protects. */
export function weeklyRecap(patient: Patient): WeeklyRecap {
  const firstName = patient.name.split(" ")[0] || patient.name;
  const cells = supplementWindow(patient);
  const done = cells.filter((cell) => cell.state === "done").length;
  const remaining = Math.max(0, patient.supplementDaysTotal - patient.supplementDaysCompleted);
  const streak = adherenceStreak(patient);

  const line =
    remaining === 0
      ? `${firstName} finished all ${patient.supplementDaysTotal} days of ${patient.supplementName}.`
      : `${done} of ${cells.length} days this grid · ${remaining} left in the course${
          streak > 1 ? ` · ${streak}-day streak` : ""
        }.`;

  const spoken =
    remaining === 0
      ? `${firstName}, your ${patient.supplementName} course is complete. Well done. Keep the habit till your next visit.`
      : `${firstName}, this week you took ${patient.supplementName} on ${done} of ${cells.length} days. ` +
        `${remaining} days are left. ${streak > 1 ? `You are on a ${streak}-day streak. ` : ""}` +
        `This is what keeps your blood and your baby's growth steady.`;

  return { title: "This week", line, spoken };
}

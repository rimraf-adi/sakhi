import type { Patient } from "./types";

/** Everything the journal draws is derived from the patient record. */
export const PREGNANCY_WEEKS = 40;

export function gestationProgress(week: number, day: number): number {
  const elapsedDays = week * 7 + day;
  return Math.min(1, elapsedDays / (PREGNANCY_WEEKS * 7));
}

export function daysRemaining(week: number, day: number): number {
  return Math.max(0, PREGNANCY_WEEKS * 7 - (week * 7 + day));
}

export function trimesterOf(week: number): 1 | 2 | 3 {
  if (week <= 13) return 1;
  if (week <= 27) return 2;
  return 3;
}

/** Point on the journal's 42px-radius gestation arc; progress 0 renders at the left. */
export function arcPoint(progress: number): { x: number; y: number } {
  const clamped = Math.min(1, Math.max(0, progress));
  const radians = Math.PI * (1 - clamped);
  return {
    x: Number((52 + 42 * Math.cos(radians)).toFixed(2)),
    y: Number((54 - 42 * Math.sin(radians)).toFixed(2)),
  };
}

export type SupplementCellState = "done" | "today" | "empty";

export interface SupplementCell {
  day: number;
  state: SupplementCellState;
}

/** The last `size` days of the care-item cycle, ending on the current day. */
export function supplementWindow(patient: Patient, size = 14): SupplementCell[] {
  const { supplementDaysCompleted, supplementDaysTotal, supplementTakenToday } = patient;
  const currentDay = Math.min(
    supplementDaysTotal,
    supplementDaysCompleted + (supplementTakenToday ? 0 : 1),
  );
  const startDay = Math.max(1, currentDay - (size - 1));

  return Array.from({ length: size }, (_, index) => {
    const day = startDay + index;
    if (day < currentDay) return { day, state: "done" };
    if (day === currentDay) return { day, state: supplementTakenToday ? "done" : "today" };
    return { day, state: "empty" };
  });
}

export function bpSparklinePoints(values: number[], width = 64, height = 20): string {
  if (values.length === 0) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  return values
    .map((value, index) => {
      const x = 4 + (index * (width - 8)) / Math.max(1, values.length - 1);
      const y = 4 + (1 - (value - min) / span) * (height - 8);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

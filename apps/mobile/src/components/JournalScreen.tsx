"use client";

import { ShieldCheck, Volume2 } from "lucide-react";
import {
  adherenceStreak,
  buildPreVisitSummary,
  weeklyRecap,
} from "@/lib/summary";
import {
  arcPoint,
  bpSparklinePoints,
  daysRemaining,
  gestationProgress,
  supplementWindow,
  trimesterOf,
} from "@/lib/journal";
import type { FlowPhase, Patient } from "@/lib/types";

interface JournalScreenProps {
  patient: Patient;
  phase: FlowPhase;
  initialUtterance: string;
  latestOutcome: string | null;
  playingId: string | null;
  onPlay: (id: string, text: string) => void;
  onToggleSupplement: () => void;
}

export function JournalScreen({
  patient,
  phase,
  initialUtterance,
  latestOutcome,
  playingId,
  onPlay,
  onToggleSupplement,
}: JournalScreenProps) {
  const progress = gestationProgress(patient.gestationWeek, patient.gestationDay);
  const point = arcPoint(progress);
  const supplementCells = supplementWindow(patient);
  const hasBp = patient.vitals.bpSystolic > 0 && patient.vitals.bpDiastolic > 0;
  const hasWeight = patient.vitals.weightGainKg > 0;
  const latestEntry = patient.entries[0] ?? null;
  const showLive = (phase === "alert" || phase === "saved") && initialUtterance.length > 0;
  // Derived, never authored: the doctor page and the recap both read her record.
  const summary = buildPreVisitSummary(patient);
  const recap = weeklyRecap(patient);
  const streak = adherenceStreak(patient);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      <div className="flex shrink-0 items-center justify-between border-b border-[#EAE3D5] px-4 pb-2 pt-3">
        <span className="font-serif text-[18px] font-bold text-[#101828]">Pregnancy Journal</span>
        <div className="flex items-center gap-1.5">
          {latestEntry && (
            <button
              type="button"
              onClick={() => onPlay("journal-latest", latestEntry.spokenQuote)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-[#0F4C3A] px-2.5 py-1 text-[10.5px] font-semibold text-white"
            >
              <Volume2 size={11} />
              {playingId === "journal-latest" ? "Playing…" : "Listen"}
            </button>
          )}

        </div>
      </div>

      {/* The one page the doctor reads before she walks in. */}
      <div className="shrink-0 border-b border-[#EAE3D5] bg-[#F7F2E7] px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#0F4C3A]">
              For your doctor
            </div>
            <div className="mt-0.5 text-[12.5px] font-bold text-[#101828]">{summary.headline}</div>
            <div className="truncate text-[10.5px] text-[#475467]">{summary.meta}</div>
          </div>
          <button
            type="button"
            onClick={() => onPlay("previsit-summary", summary.spoken)}
            className="shrink-0 cursor-pointer rounded-full bg-[#0F4C3A] px-2.5 py-1 text-[10.5px] font-semibold text-white"
          >
            {playingId === "previsit-summary" ? "Playing…" : "Listen"}
          </button>
        </div>

        {summary.lines.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {summary.lines.slice(0, 3).map((line) => (
              <div
                key={`${line.dateLabel}-${line.ruleMatched}-${line.quote}`}
                className="text-[11px] leading-snug text-[#344054]"
              >
                <span className="font-semibold text-[#101828]">{line.dateLabel}</span> {line.quote}
                {line.translated && (
                  <span className="text-[10px] text-[#667085]"> · {line.translated}</span>
                )}
                <div className="text-[10px] text-[#0F4C3A]">{line.ruleMatched}</div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {summary.watchItems.map((item) => (
            <span
              key={item}
              className="rounded-md border border-[#DDD3C0] bg-white px-1.5 py-0.5 text-[10px] font-medium text-[#475467]"
            >
              {item}
            </span>
          ))}
          <span className="text-[10px] text-[#667085]">{summary.counts}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3.5 border-b border-[#EAE3D5] px-4 py-3">
        <svg width={98} height={58} viewBox="0 0 104 62" className="shrink-0">
          <path d="M 10 54 A 42 42 0 0 1 94 54" fill="none" stroke="#E7DFD0" strokeWidth={9} strokeLinecap="round" />
          <path
            d={`M 10 54 A 42 42 0 0 1 ${point.x} ${point.y}`}
            fill="none"
            stroke="#0F4C3A"
            strokeWidth={9}
            strokeLinecap="round"
          />
          <circle cx={point.x} cy={point.y} r={5} fill="#C8643B" stroke="#FAF6EE" strokeWidth={2} />
          <text x="52" y="46" textAnchor="middle" fontSize="14" fontWeight="700" fill="#101828">
            Wk {patient.gestationWeek}
          </text>
          <text x="52" y="59" textAnchor="middle" fontSize="9" fill="#667085">
            of 40
          </text>
        </svg>
        <div>
          <div className="text-xs font-bold text-[#101828]">
            Trimester {trimesterOf(patient.gestationWeek)} ·{" "}
            {daysRemaining(patient.gestationWeek, patient.gestationDay)} days left
          </div>
          <div className="mt-0.5 text-[11px] text-[#475467]">Next: {patient.nextVisitLabel}</div>
          <div className="mt-1 inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#0F4C3A]">
            <ShieldCheck size={12} />
            Hospital-owned record
          </div>
        </div>
      </div>

      <div className="shrink-0 border-b border-[#EAE3D5] px-4 py-3">
        <div className="mb-2 flex items-center justify-between text-[11px] font-bold">
          <span>{patient.supplementName} (14-Day Grid)</span>
          <span className="text-[#0F4C3A]">
            {patient.supplementDaysCompleted} / {patient.supplementDaysTotal} days
          </span>
        </div>

        <div className="mb-2 flex items-center gap-1.5 rounded-lg border border-[#EAE3D5] bg-[#FBF7EF] px-2 py-1.5">
          <span className="text-[10.5px]">{streak > 0 ? "🔥" : "•"}</span>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold text-[#101828]">
              {streak > 1 ? `${streak}-day streak` : "Start your streak today"} · {recap.title}
            </div>
            <div className="truncate text-[10px] text-[#475467]">{recap.line}</div>
          </div>
          <button
            type="button"
            onClick={() => onPlay("weekly-recap", recap.spoken)}
            aria-label="Listen to this week's recap"
            className="shrink-0 cursor-pointer text-[#0F4C3A]"
          >
            <Volume2 size={12} />
          </button>
        </div>

        <div className="grid grid-cols-7 justify-items-center gap-1.5">
          {supplementCells.map((cell) => (
            <button
              key={cell.day}
              type="button"
              disabled={cell.state !== "today"}
              onClick={onToggleSupplement}
              title={`Day ${cell.day}`}
              className={`grid h-5 w-5 place-items-center rounded-full text-[9px] font-bold ${
                cell.state === "done"
                  ? "bg-[#0F4C3A] text-white"
                  : cell.state === "today"
                    ? "border-2 border-dashed border-[#0F4C3A] bg-[#EFE6D5] text-[#101828]"
                    : "border border-[#DDD3C0] text-[#98A2B3]"
              } ${cell.state === "today" ? "cursor-pointer" : "cursor-default"}`}
            >
              {cell.state === "done" ? "✓" : cell.state === "today" ? "•" : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-3 border-b border-[#EAE3D5] px-4 py-3">
        <div>
          <div className="text-[10px] font-semibold text-[#667085]">BP Trend</div>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="text-sm font-bold text-[#101828]">
              {hasBp ? `${patient.vitals.bpSystolic}/${patient.vitals.bpDiastolic}` : "Not recorded"}
            </span>
            <svg width={64} height={20} viewBox="0 0 74 22">
              <polyline
                points={bpSparklinePoints(patient.vitals.bpTrend)}
                fill="none"
                stroke="#0F4C3A"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
        <div className="border-l border-[#EAE3D5] pl-3">
          <div className="text-[10px] font-semibold text-[#667085]">Weight Gain</div>
          <div className="mt-0.5 text-sm font-bold text-[#101828]">
            {hasWeight ? `+${patient.vitals.weightGainKg} kg` : "Not recorded"}
          </div>
        </div>
      </div>

      <div className="space-y-3 px-4 py-3">
        {showLive && (
          <div className="flex gap-2.5">
            <div className="flex flex-col items-center">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#C8643B]" />
              <div className="mt-1 w-[1.5px] flex-1 bg-[#DDD3C0]" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-[#C8643B]">
                Just now · {phase === "alert" ? "Care alerted" : "Saved"}
              </div>
              <div className="text-[11.5px] font-medium text-[#101828]">“{initialUtterance}”</div>
              {latestOutcome && (
                <div className="mt-0.5 text-[10.5px] text-[#475467]">{latestOutcome}</div>
              )}
            </div>
          </div>
        )}

        {patient.entries.map((entry, index) => (
          <div key={entry.id} className="flex gap-2.5">
            <div className="flex flex-col items-center">
              <span
                className={`mt-1 h-2 w-2 rounded-full ${
                  entry.kind === "alert" ? "bg-[#C8643B]" : "bg-[#0F4C3A]"
                }`}
              />
              {index < patient.entries.length - 1 && (
                <div className="mt-1 w-[1.5px] flex-1 bg-[#DDD3C0]" />
              )}
            </div>
            <div>
              <div className="text-[10px] font-semibold text-[#667085]">{entry.dateLabel}</div>
              <div className="text-[11.5px] font-medium text-[#101828]">{entry.spokenQuote}</div>
              <div className="mt-0.5 text-[10.5px] text-[#475467]">{entry.outcomeNote}</div>
            </div>
          </div>
        ))}

        {patient.entries.length === 0 && !showLive && (
          <p className="text-[11.5px] text-[#667085]">
            Nothing recorded yet. Tonight’s conversation will appear here.
          </p>
        )}
      </div>
    </div>
  );
}

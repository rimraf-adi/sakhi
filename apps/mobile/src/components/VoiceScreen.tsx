"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Mic, RotateCcw, Square } from "lucide-react";
import { AcousticField } from "./AcousticField";
import { DEMO_SCENARIOS } from "@/lib/scenarios";
import type { EscalationAlert, MobileTab, Patient } from "@/lib/types";
import { useVoiceStatus } from "@/hooks/useVoiceStatus";
import type { VoiceSession } from "@/hooks/useVoiceSession";

interface VoiceScreenProps {
  patient: Patient;
  session: VoiceSession;
  onOpenTab: (tab: MobileTab) => void;
}

/** The few control labels that follow her language switch. */
const UI = {
  English: {
    mic: "Tap and speak",
    stop: "Send it",
    yes: "Yes, send it",
    no: "Not now",
    privacy: "Only your care team receives this.",
    waiting: "Waiting for the care team…",
    seen: "has seen this",
    paused: "Nobody was told",
    journalLink: "Open Journal →",
    thinking: "Sakhi is thinking…",
  },
  Hindi: {
    mic: "Boliye, main sun rahi hoon",
    stop: "Bas, bhej do",
    yes: "Haan, bhej do",
    no: "Abhi nahi",
    privacy: "Aapki baat sirf aapki care team tak jaati hai.",
    waiting: "Care team ka jawab aa raha hai…",
    seen: "ne dekh liya hai",
    paused: "Kisi ko khabar nahi bheji",
    journalLink: "Journal kholiye →",
    thinking: "Sakhi soch rahi hai…",
  },
  Marathi: {
    mic: "Bola, mi aikte aahe",
    stop: "Bas, pathva",
    yes: "Ho, pathva",
    no: "Aata nahi",
    privacy: "Tumchi baat fakt tumchya care team paryant jaate.",
    waiting: "Care team cha uttar yet aahe…",
    seen: "ne pahile aahe",
    paused: "Konala khabar pathavli nahi",
    journalLink: "Journal ughda →",
    thinking: "Sakhi vichar karat aahe…",
  },
} as const;

const GLOW_BY_PHASE = {
  alert: "rgba(224,98,70,0.36)",
  saved: "rgba(88,185,142,0.28)",
  listen: "rgba(127,209,174,0.28)",
  calm: "rgba(234,182,133,0.30)",
} as const;

/** Warm, in-language greeting shown before the first turn of the night. */
function greetingFor(patient: Patient): string {
  const firstName = patient.name.split(" ")[0] || patient.name;
  if (patient.language === "Marathi") {
    return `${firstName} tai, mi ithe aahe. Jabhi bolaych asel, mic dabaa.`;
  }
  if (patient.language === "Hindi") {
    return `${firstName}, main yahin hoon. Jab bhi baat karni ho, mic dabaiye.`;
  }
  return `${firstName}, I'm right here. Tap the mic whenever you want to talk.`;
}

function ThinkingRow() {
  return (
    <div className="flex items-center gap-2 pl-9">
      <span className="flex items-center gap-1">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#EAB685]/80"
            style={{ animationDelay: `${dot * 160}ms` }}
          />
        ))}
      </span>
      <span className="text-[11px] text-[#8EA39C]">Sakhi is listening…</span>
    </div>
  );
}

export function VoiceScreen({ patient, session, onOpenTab }: VoiceScreenProps) {
  const threadRef = useRef<HTMLDivElement | null>(null);
  const { phase, captions, lastTurn, statusNotice, engine, isRecording, recordingLabel } = session;
  const status = useVoiceStatus();
  const [alert, setAlert] = useState<EscalationAlert | null>(null);
  const ui = UI[patient.language];

  // The desk acknowledges on its own screen; her phone picks it up here.
  useEffect(() => {
    if (phase !== "alert") return;
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/alerts?patientId=${encodeURIComponent(patient.id)}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = (await res.json()) as { alert: EscalationAlert | null };
        if (alive) setAlert(json.alert);
      } catch {
        // Keep whatever state we already showed.
      }
    };
    void load();
    const timer = window.setInterval(() => void load(), 3000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [phase, patient.id]);

  const sentLabel = alert
    ? new Date(alert.createdAtIso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : "";
  const notificationText = alert
    ? `${patient.name} (Wk ${patient.gestationWeek}): ${alert.spokenQuote} — ${alert.summary}. Please call or visit now.`
    : `${patient.name} needs help tonight.`;
  const ackLine = alert?.acknowledged
    ? `${alert.acknowledgedBy ?? "Care desk"} ${ui.seen}`
    : ui.waiting;

  useEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTo({ top: thread.scrollHeight, behavior: "smooth" });
  }, [captions, phase]);

  const glow =
    phase === "alert"
      ? GLOW_BY_PHASE.alert
      : phase === "saved"
        ? GLOW_BY_PHASE.saved
        : phase === "followup" || phase === "consent"
          ? GLOW_BY_PHASE.listen
          : GLOW_BY_PHASE.calm;

  const firstName = patient.name.split(" ")[0] || patient.name;
  const initial = firstName.charAt(0).toUpperCase();
  const inLanguage = DEMO_SCENARIOS.filter((scenario) => scenario.language === patient.language);
  const tryScenarios = inLanguage.length > 0 ? inLanguage : DEMO_SCENARIOS;
  const engineLabel =
    engine === "llm-rules" ? "Groq + rules" : engine === "rules" ? "rules" : null;
  const thinking = phase === "thinking";

  return (
    <>
      <div
        className="pointer-events-none absolute bottom-24 left-1/2 h-64 w-72 -translate-x-1/2 rounded-full transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${glow} 0%, rgba(234,182,133,0.04) 54%, transparent 76%)`,
        }}
      />

      <div className="relative z-10 flex shrink-0 items-center justify-between gap-3 px-6 pb-1 pt-5">
        <div>
          <div className="font-serif text-[15px] font-medium text-[#F4E9DA]">
            {firstName} · Week {patient.gestationWeek}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-[#8EA39C]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7FD1AE]" />
            Sakhi is here with you
          </div>
        </div>
        <div className="flex items-center gap-3">
          {engineLabel && (
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-wider text-[#7E938C]">
              {engineLabel}
            </span>
          )}
          {status && (!status.voiceOutput || !status.voiceInput) && (
            <span
              title={
                status.voiceOutput
                  ? "Sarvam voice on · microphone uses this device"
                  : "Sarvam key unavailable: this device's voice reads Sakhi; the mic uses on-device recognition"
              }
              className="rounded-full border border-[#EAB685]/25 px-2 py-0.5 text-[9.5px] font-medium text-[#EAB685]/80"
            >
              {[!status.voiceOutput && "device voice", !status.voiceInput && "device mic"]
                .filter(Boolean)
                .join(" · ")}
            </span>
          )}
          <span className="text-xs font-medium text-[#8EA39C]">{patient.language}</span>
          <button
            type="button"
            onClick={session.reset}
            title="Start a fresh conversation"
            className="cursor-pointer text-[#8EA39C] transition hover:text-[#F4E9DA]"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      <div
        ref={threadRef}
        className="relative z-10 flex flex-1 flex-col overflow-y-auto px-5 pb-4 pt-5"
        style={{
          scrollbarWidth: "none",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 10%, black 26%, black 94%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 10%, black 26%, black 94%, transparent 100%)",
        }}
      >
        <div className="mt-auto space-y-4">
          {captions.map((item, index) => {
            const isCurrent = index === captions.length - 1;
            const fade = isCurrent ? 1 : 0.72;

            if (item.speakerLabel) {
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-2 pl-9 text-[11px] leading-relaxed text-[#8EA39C]"
                  style={{ opacity: fade }}
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#8EA39C]/60" />
                  <span>
                    <span className="font-semibold uppercase tracking-[0.12em] text-[#7E938C]">
                      {item.speakerLabel}
                    </span>{" "}
                    <span className="text-[#A9BAB4]">{item.text}</span>
                  </span>
                </div>
              );
            }

            if (item.isSakhi) {
              return (
                <div key={item.id} className="flex gap-2.5 transition-opacity duration-500" style={{ opacity: fade }}>
                  <span
                    className="mt-1.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border"
                    style={{
                      borderColor: `${item.dotColor ?? "#EAB685"}55`,
                      backgroundColor: `${item.dotColor ?? "#EAB685"}1f`,
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: item.dotColor ?? "#EAB685" }}
                    />
                  </span>
                  <div className="min-w-0 max-w-[86%]">
                    <div className="mb-1 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#EAB685]/75">
                      Sakhi
                    </div>
                    <p className="rounded-[18px] rounded-tl-md border border-[#EAB685]/10 bg-[#EAB685]/[0.07] px-3.5 py-2.5 font-serif text-[19px] leading-[1.38] text-[#FBF4E7]">
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={item.id}
                className="flex justify-end gap-2 transition-opacity duration-500"
                style={{ opacity: fade }}
              >
                <div className="min-w-0 max-w-[86%]">
                  <p className="rounded-[18px] rounded-br-md border border-[#F3E3CC]/12 bg-[#F3E3CC]/[0.07] px-3.5 py-2.5 text-[14px] leading-[1.5] text-[#EDE0CE]">
                    {item.text}
                  </p>
                </div>
                <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#C8643B] text-[10px] font-bold text-white">
                  {initial}
                </span>
              </div>
            );
          })}

          {thinking && <ThinkingRow />}

          {captions.length === 0 && !thinking && (
            <p className="max-w-[85%] font-serif text-[17px] leading-[1.5] text-[#D8CDBC]">
              {greetingFor(patient)}
            </p>
          )}
        </div>
      </div>

      <div className="relative z-10 shrink-0 pt-1">
        <AcousticField phase={phase} micLevel={session.micLevel} className="block h-[124px] w-full" />
      </div>

      <div className="relative z-10 shrink-0 px-5 pb-3 pt-1">
        {statusNotice && (
          <div className="mb-2 rounded-xl border border-[#F6C667]/35 bg-[#F6C667]/10 px-3 py-2 text-[11px] leading-relaxed text-[#F6C667]">
            {statusNotice}
          </div>
        )}

        {phase === "consent" ? (
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={session.declineAlert}
              className="cursor-pointer rounded-xl border border-white/15 bg-white/[0.04] px-3 py-3 text-xs font-medium text-[#C8D3CF] transition hover:bg-white/[0.1]"
            >
              {ui.no}
            </button>
            <button
              type="button"
              onClick={() => void session.confirmAlert()}
              className="cursor-pointer rounded-xl bg-[#D96B4F] px-3 py-3 text-xs font-semibold text-[#FAF6EE] transition hover:bg-[#E07A60]"
            >
              {ui.yes}
            </button>
          </div>
        ) : phase === "alert" ? (
          <div className="space-y-2">
            {/* What actually left her phone, so escalation is an artefact, not a log row. */}
            <div className="rounded-xl border border-white/12 bg-[#1B2A26] px-3 py-2.5">
              <div className="mb-1 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.12em] text-[#7E938C]">
                <span>
                  WhatsApp · {patient.ashaName.split(" ")[0]} + {patient.familyName.split(" ")[0]}
                </span>
                <span>{sentLabel}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#EDE0CE]">{notificationText}</p>
              <div className="mt-1 flex items-center gap-1 text-[9.5px] text-[#8EA39C]">
                <Check size={9} /> {alert?.acknowledged ? "Seen" : "Delivered"}
              </div>
            </div>

            <div
              className={`space-y-1.5 rounded-2xl border px-3.5 py-2.5 ${
                alert?.acknowledged
                  ? "border-[#58B98E]/45 bg-[#58B98E]/15"
                  : "border-[#E06246]/40 bg-[#E06246]/15"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-[#FAF6EE]">{ackLine}</span>
                <span
                  className={`shrink-0 text-[10px] font-semibold ${
                    alert?.acknowledged ? "text-[#7FD1AE]" : "text-[#F6AD94]"
                  }`}
                >
                  {alert?.acknowledged ? "Picked up" : "Care sent"}
                </span>
              </div>
              {alert?.acknowledged && alert.responseNote && (
                <p className="text-[10px] text-[#C8D3CF]">{alert.responseNote}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => onOpenTab("journal")}
              className="w-full cursor-pointer rounded-lg bg-[#D96B4F] py-1.5 text-[11px] font-semibold text-[#FAF6EE]"
            >
              {ui.journalLink}
            </button>
          </div>
        ) : phase === "saved" ? (
          <div className="space-y-2 rounded-2xl border border-[#58B98E]/35 bg-[#58B98E]/15 px-3.5 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-[#FAF6EE]">
                {lastTurn?.reminderNote || "Saved for the next ANC visit"}
              </span>
              <span className="shrink-0 text-[10px] font-semibold text-[#58B98E]">Saved</span>
            </div>
            <button
              type="button"
              onClick={() => onOpenTab("journal")}
              className="w-full cursor-pointer rounded-lg bg-[#0F4C3A] py-1.5 text-[11px] font-semibold text-[#FAF6EE]"
            >
              Open Journal →
            </button>
          </div>
        ) : phase === "declined" ? (
          <div className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/[0.05] px-3.5 py-2.5">
            <span className="text-[11px] font-medium text-[#C8D3CF]">{ui.paused}</span>
            <span className="text-[10px] font-medium text-[#8EA39C]">Paused</span>
          </div>
        ) : phase === "followup" && session.followupSuggestion ? (
          <button
            type="button"
            onClick={session.sendFollowupSuggestion}
            className="w-full cursor-pointer rounded-xl border border-white/15 bg-white/[0.08] px-3.5 py-2.5 text-xs font-medium text-[#FAF6EE] transition hover:bg-white/[0.14]"
          >
            Speak reply: “{session.followupSuggestion}”
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3">
              {isRecording ? (
                <button
                  type="button"
                  onClick={session.stopRecording}
                  aria-label="Stop recording and send"
                  className="animate-record-halo inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-[#D96B4F] px-5 py-3 text-sm font-semibold text-[#FAF6EE] transition hover:bg-[#E07A60]"
                >
                  <Square size={13} fill="currentColor" />
                  <span className="tabular-nums">
                    {ui.stop} · {recordingLabel}
                  </span>
                </button>
              ) : thinking ? (
                <button
                  type="button"
                  disabled
                  aria-busy="true"
                  className="inline-flex cursor-progress items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-medium text-[#C8D3CF] disabled:opacity-100"
                >
                  <Loader2 size={14} className="animate-spin text-[#EAB685]" />
                  {ui.thinking}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={session.startRecording}
                  className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-[#EAB685]/25 bg-[#EAB685]/[0.08] px-5 py-3 text-sm font-medium text-[#F6EBDC] transition hover:bg-[#EAB685]/15"
                >
                  <Mic size={15} className="text-[#EAB685]" />
                  {ui.mic}
                </button>
              )}
            </div>

            {phase === "idle" && (
              <>
                <div className="flex items-center gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-[#7E938C]">
                    Try
                  </span>
                  {tryScenarios.map((scenario) => (
                    <button
                      key={scenario.id}
                      type="button"
                      title={scenario.label}
                      onClick={() => session.runScenario(scenario)}
                      className="shrink-0 cursor-pointer rounded-full border border-white/15 bg-white/[0.05] px-2.5 py-1 text-[10.5px] font-medium text-[#C8D3CF] transition hover:bg-white/[0.12] hover:text-[#FAF6EE]"
                    >
                      {scenario.short}
                    </button>
                  ))}
                </div>
                <p className="text-center text-[10px] text-[#6F847D]">{ui.privacy}</p>
                {status && !status.voiceInput && (
                  <p className="text-center text-[10px] text-[#EAB685]/70">
                    Voice fallback: no transcription key on this build, so the mic uses this
                    device&apos;s own recogniser. The prompts below run the same flow.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

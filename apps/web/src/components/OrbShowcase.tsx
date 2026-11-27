"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BellRing,
  CheckCircle2,
  Mic,
  Pause,
  Play,
  ShieldAlert,
  Volume2,
} from "lucide-react";
import {
  type TraceStep,
  VOICE_SCENARIOS,
} from "@/data/sakhi-content";

const STEP_LABELS: { step: TraceStep; label: string }[] = [
  { step: 1, label: "1. Speaks" },
  { step: 2, label: "2. Question" },
  { step: 3, label: "3. Confirms" },
  { step: 4, label: "4. Action" },
];

const ORB_THEMES = {
  alert: {
    animationClass: "animate-orb-alert",
    background:
      "radial-gradient(circle at 35% 30%, #ffd8c9 0%, #e4694c 42%, #c23b2b 82%, #7d1d14 100%)",
    rippleColor: "border-[#c23b2b]/45",
  },
  remind: {
    animationClass: "animate-orb-sage",
    background:
      "radial-gradient(circle at 35% 30%, #e7f8ef 0%, #98cfb4 45%, #2b7a5b 84%, #154231 100%)",
    rippleColor: "border-[#98cfb4]/45",
  },
  idle: {
    animationClass: "animate-orb-breathe",
    background:
      "radial-gradient(circle at 35% 30%, #fff0d4 0%, #f6c478 38%, #d97745 78%, #8f411c 100%)",
    rippleColor: "border-[#f6c478]/40",
  },
} as const;

export function OrbShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [step, setStep] = useState<TraceStep>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scenario = VOICE_SCENARIOS[activeIndex] ?? VOICE_SCENARIOS[0]!;

  const stopPlayback = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakLine = (text: string, lang: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.92;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Fallback gracefully if speech synthesis is unavailable
    }
  };

  const handlePlayCall = () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    setIsPlaying(true);
    setStep(1);
    speakLine(scenario.motherDevanagari, scenario.speechLang);

    const runStep = (nextStep: TraceStep) => {
      timerRef.current = setTimeout(() => {
        setStep(nextStep);
        if (nextStep === 2) {
          speakLine(scenario.followUpQuestion, scenario.speechLang);
          runStep(3);
        } else if (nextStep === 3) {
          speakLine(scenario.repeatBack, scenario.speechLang);
          runStep(4);
        } else if (nextStep === 4) {
          timerRef.current = setTimeout(() => {
            setIsPlaying(false);
          }, 2600);
        }
      }, 2400);
    };

    runStep(2);
  };

  const handleSelectScenario = (idx: number) => {
    stopPlayback();
    setActiveIndex(idx);
    setStep(1);
  };

  const orbStyle =
    step === 4 && scenario.action === "alert"
      ? ORB_THEMES.alert
      : step === 4 && scenario.action === "remind"
        ? ORB_THEMES.remind
        : ORB_THEMES.idle;

  return (
    <div className="overflow-hidden rounded-[28px] border border-[#0F181A]/12 bg-[#0F181A] shadow-[0_28px_80px_-32px_rgba(15,24,26,0.34)]">
      <div className="grid lg:grid-cols-12">
        {/* Left Panel: Editorial Copy + Clean Compact Scenario List */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-[#EFE8DA] p-6 text-[#0F181A] sm:p-8 lg:col-span-5 lg:p-9">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#9C4B22] uppercase">
              Voice-First · Every Language
            </p>
            <h3 className="mt-2.5 font-serif text-2xl leading-tight font-semibold text-[#0F181A] sm:text-[1.75rem]">
              No apps to learn.
              <br />
              No forms. Just speak.
            </h3>
            <p className="mt-2.5 max-w-xs text-sm leading-relaxed text-[#536360]">
              Pick a real spoken moment and press play.
            </p>
          </div>

          <div
            className="mt-8 grid grid-cols-1 gap-1.5 md:grid-cols-3 lg:grid-cols-1"
            role="group"
            aria-label="Spoken pregnancy scenarios"
          >
            {VOICE_SCENARIOS.map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleSelectScenario(idx)}
                  className={`min-h-[44px] w-full cursor-pointer rounded-xl px-4 py-3 text-left transition-[background-color,color,transform] duration-200 active:scale-[0.99] ${
                    isActive
                      ? "bg-[#0F181A] text-[#F7F4ED]"
                      : "bg-transparent text-[#0F181A] hover:bg-[#0F181A]/[0.06]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{item.pillTitle}</span>
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 rounded-full ${
                        isActive ? "bg-[#F6C478]" : "bg-[#0F181A]/20"
                      }`}
                    />
                  </div>
                  <p
                    className={`mt-0.5 text-[11px] ${
                      isActive ? "text-[#F5D6AE]/85" : "text-[#536360]"
                    }`}
                  >
                    {item.pillMeta}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Deep Obsidian Ink + Single Minimal Glowing Orb Stage */}
        <div className="bg-grain relative flex flex-col justify-between gap-6 bg-[#0F181A] p-6 text-[#F7F4ED] sm:p-8 lg:col-span-7 lg:p-9">
          {/* Top Context Bar */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-[#F7F4ED]/75">
              <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-[#98CFB4]" />
              <span className="tabular-nums">
                Week {scenario.week} · {scenario.language}
              </span>
            </div>

            <button
              type="button"
              aria-pressed={isPlaying}
              onClick={handlePlayCall}
              className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-[#F7F4ED] transition-[background-color,transform] duration-200 hover:bg-white/14 active:scale-[0.985] sm:w-auto"
            >
              {isPlaying ? (
                <>
                  <Pause aria-hidden="true" className="h-3.5 w-3.5 text-[#F6C478]" />
                  Pause
                </>
              ) : (
                <>
                  <Play aria-hidden="true" className="h-3.5 w-3.5 text-[#F6C478]" />
                  Play Demo
                </>
              )}
            </button>
          </div>

          {/* Clickable Center Orb */}
          <div className="relative z-10 flex flex-col items-center py-2">
            <button
              type="button"
              onClick={handlePlayCall}
              aria-label={isPlaying ? "Pause call demo" : "Play voice call demo"}
              className="group flex cursor-pointer flex-col items-center focus:outline-none"
            >
              <div className="relative flex h-28 w-28 items-center justify-center" aria-hidden="true">
                <span
                  className={`animate-orb-ripple absolute inset-0 rounded-full border ${orbStyle.rippleColor}`}
                />
                <span
                  className={`animate-orb-ripple-delayed absolute inset-0 rounded-full border ${orbStyle.rippleColor}`}
                />
                <div
                  className={`${orbStyle.animationClass} relative flex h-20 w-20 items-center justify-center rounded-full transition-[background,box-shadow,transform] duration-500 group-hover:scale-[1.03] group-active:scale-95`}
                  style={{ background: orbStyle.background }}
                >
                  {isPlaying ? (
                    <div className="flex items-center gap-1">
                      <span className="animate-voice-bar h-4 w-1 rounded-full bg-white/90" />
                      <span
                        className="animate-voice-bar h-7 w-1 rounded-full bg-white/90"
                        style={{ animationDelay: "0.18s" }}
                      />
                      <span
                        className="animate-voice-bar h-5 w-1 rounded-full bg-white/90"
                        style={{ animationDelay: "0.35s" }}
                      />
                      <span
                        className="animate-voice-bar h-3.5 w-1 rounded-full bg-white/90"
                        style={{ animationDelay: "0.52s" }}
                      />
                    </div>
                  ) : (
                    <Volume2 className="h-6 w-6 text-white/95 drop-shadow-sm" />
                  )}
                </div>
              </div>

              <span className="mt-2.5 text-xs tracking-wide text-[#F7F4ED]/65 transition-colors group-hover:text-[#F6C478]">
                {isPlaying ? `Speaking in ${scenario.language}…` : "Tap to listen"}
              </span>
            </button>
          </div>

          {/* Minimal 4-Step Hairline Tabs + Focused Single-Step Stage */}
          <div className="relative z-10 space-y-4">
            <div
              className="grid grid-cols-2 gap-1 border-y border-white/10 py-1 sm:grid-cols-4"
              role="group"
              aria-label="Conversation steps"
            >
              {STEP_LABELS.map((item) => {
                const active = step === item.step;
                return (
                  <button
                    key={item.step}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      stopPlayback();
                      setStep(item.step);
                    }}
                    className={`min-h-[44px] cursor-pointer rounded-lg px-2 py-2 text-xs font-medium transition-[background-color,color] duration-200 ${
                      active
                        ? "bg-white/10 font-semibold text-[#F6C478]"
                        : "text-[#F7F4ED]/55 hover:bg-white/[0.04] hover:text-[#F7F4ED]"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Active Step Output (Directly on Stage, Zero Nested Boxes) */}
            <div aria-live="polite" className="min-h-[136px] pt-1">
              {step === 1 ? (
                <div key={`${scenario.id}-s1`} className="animate-step-in">
                  <div className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.16em] text-[#F5D6AE]/80 uppercase">
                    <Mic aria-hidden="true" className="h-3.5 w-3.5 text-[#F6C478]" />
                    <span>She Speaks</span>
                  </div>
                  <p className="mt-2.5 font-serif text-xl leading-snug font-medium text-white sm:text-2xl">
                    {scenario.motherUtterance}
                  </p>
                  <p className="mt-1.5 text-sm text-[#F7F4ED]/65">{scenario.translation}</p>
                </div>
              ) : null}

              {step === 2 ? (
                <div key={`${scenario.id}-s2`} className="animate-step-in">
                  <p className="text-[10px] font-semibold tracking-[0.16em] text-[#F6C478] uppercase">
                    Sakhi Asks
                  </p>
                  <p className="mt-2.5 font-serif text-xl leading-snug font-medium text-white sm:text-2xl">
                    {scenario.followUpQuestion}
                  </p>
                  <p className="mt-1.5 text-sm text-[#F7F4ED]/65">
                    {scenario.followUpTranslation}
                  </p>
                  <p className="mt-2.5 text-xs text-[#F5D6AE]/90 italic">
                    Her reply: {scenario.motherReply}
                  </p>
                </div>
              ) : null}

              {step === 3 ? (
                <div key={`${scenario.id}-s3`} className="animate-step-in">
                  <div className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.16em] text-[#98CFB4] uppercase">
                    <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5 text-[#98CFB4]" />
                    <span>Confirms Back</span>
                  </div>
                  <p className="mt-2.5 font-serif text-xl leading-snug font-medium text-white sm:text-[1.4rem]">
                    {scenario.repeatBack}
                  </p>
                </div>
              ) : null}

              {step === 4 ? (
                <div key={`${scenario.id}-s4`} className="animate-step-in">
                  <div
                    className={`inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.16em] uppercase ${
                      scenario.action === "alert" ? "text-[#FF9E92]" : "text-[#98CFB4]"
                    }`}
                  >
                    {scenario.action === "alert" ? (
                      <ShieldAlert aria-hidden="true" className="h-3.5 w-3.5" />
                    ) : (
                      <BellRing aria-hidden="true" className="h-3.5 w-3.5" />
                    )}
                    <span>{scenario.actionTitle}</span>
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#F7F4ED]/90 sm:text-base">
                    {scenario.actionDetail}
                  </p>
                  <p className="mt-3 text-xs text-[#F7F4ED]/60">
                    Notifies: {scenario.recipients.join(" · ")}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

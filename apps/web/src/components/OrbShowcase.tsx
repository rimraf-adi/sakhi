"use client";

import { useEffect, useRef, useState } from "react";
import {
  BellRing,
  CheckCircle2,
  Mic,
  Pause,
  Play,
  ShieldAlert,
  Volume2,
} from "lucide-react";

type ActionType = "alert" | "remind";
type TraceStep = 1 | 2 | 3 | 4;

interface VoiceScenario {
  id: string;
  pillTitle: string;
  pillMeta: string;
  language: string;
  speechLang: string;
  week: number;
  motherUtterance: string;
  motherDevanagari: string;
  translation: string;
  followUpQuestion: string;
  followUpTranslation: string;
  motherReply: string;
  repeatBack: string;
  action: ActionType;
  actionTitle: string;
  actionDetail: string;
  recipients: string[];
}

const SCENARIOS: VoiceScenario[] = [
  {
    id: "headache-swelling",
    pillTitle: "Headache & Swollen Feet",
    pillMeta: "Hindi · Week 32 · Clear Danger Sign",
    language: "Hindi",
    speechLang: "hi-IN",
    week: 32,
    motherUtterance: "“Do din se sar dard hai aur pair sujhe hue hain.”",
    motherDevanagari: "दो दिन से सर दर्द है और पैर सूजे हुए हैं।",
    translation: "I have had a headache and swollen feet for two days.",
    followUpQuestion: "“Dhundhla dikh raha hai?”",
    followUpTranslation: "Is your vision blurred?",
    motherReply: "“Haan, subah se thoda dhundhla lag raha hai.”",
    repeatBack:
      "“32ve hafte mein 2 din se sar dard, pairon mein sujan aur dhundhla dikhna hai. Kya yeh sahi hai?”",
    action: "alert",
    actionTitle: "Alert · Go to Hospital Now",
    actionDetail:
      "Matches Ministry of Health pre-eclampsia danger-sign rules. Tells her to go to the hospital now and alerts her ASHA worker and chosen family member.",
    recipients: ["Patient (Voice)", "ASHA Worker", "Chosen Family Member"],
  },
  {
    id: "fetal-movement",
    pillTitle: "Less Baby Movement",
    pillMeta: "Marathi · Week 35 · Escalate on Doubt",
    language: "Marathi",
    speechLang: "mr-IN",
    week: 35,
    motherUtterance: "“Aaj sakalpasun balachi halchal kami watat aahe.”",
    motherDevanagari: "आज सकाळपासून बाळाची हालचाल कमी वाटत आहे.",
    translation: "Since this morning, the baby's movement feels less.",
    followUpQuestion: "“Kiti velapasun halchal janavali nahi?”",
    followUpTranslation: "For how many hours have you not felt movement?",
    motherReply: "“Nakki mahit nahi, pan sakalpasun kami aahe.”",
    repeatBack:
      "“35va aathavda aahe aani sakalpasun halchal kami watte aahe. Sakhi yala gambhir manat aahe.”",
    action: "alert",
    actionTitle: "Alert · Escalate on Doubt",
    actionDetail:
      "When timing or speech remains unsure, Sakhi never guesses or reassures falsely. It treats the case as more serious and connects her to her ASHA worker & hospital.",
    recipients: ["Patient (Voice)", "ASHA Worker", "Hospital Desk"],
  },
  {
    id: "iron-tablets",
    pillTitle: "Missed Iron Tablet",
    pillMeta: "Hindi · Week 22 · Save & Remind",
    language: "Hindi",
    speechLang: "hi-IN",
    week: 22,
    motherUtterance:
      "“Kal raat iron ki goli lena bhool gayi, aur thakan lag rahi hai.”",
    motherDevanagari: "कल रात आयरन की गोली लेना भूल गई, और थकान लग रही है।",
    translation: "I forgot to take my iron tablet last night, and I feel tired.",
    followUpQuestion: "“Kya aapko chakkar ya saans phoolne ki dikkat hai?”",
    followUpTranslation: "Are you feeling dizzy or short of breath?",
    motherReply: "“Nahi, bas thoda thakan hai.”",
    repeatBack:
      "“22ve hafte mein kal ki iron goli chhoot gayi aur halki thakan hai, par chakkar nahi hain. Sahi hai?”",
    action: "remind",
    actionTitle: "Save & Remind · Care Continuity",
    actionDetail:
      "Saves the missed iron tablet and mild fatigue to her dated hospital timeline, sets a warm evening voice reminder, and prepares her pre-visit recap.",
    recipients: ["Saved to Hospital Record", "Evening Voice Reminder"],
  },
];

const STEP_LABELS: { step: TraceStep; label: string }[] = [
  { step: 1, label: "1. She Speaks" },
  { step: 2, label: "2. 1 Question" },
  { step: 3, label: "3. Repeat-Back" },
  { step: 4, label: "4. MoH Action" },
];

export function OrbShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [step, setStep] = useState<TraceStep>(4);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scenario = SCENARIOS[activeIndex] ?? SCENARIOS[0]!;

  const stopPlayback = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

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
    setStep(4);
  };

  const isAlertOutcome = step === 4 && scenario.action === "alert";
  const isRemindOutcome = step === 4 && scenario.action === "remind";

  const orbStyle = isAlertOutcome
    ? {
        animationClass: "animate-orb-alert",
        background:
          "radial-gradient(circle at 35% 30%, #ffd8c9 0%, #e4694c 42%, #c23b2b 82%, #7d1d14 100%)",
        rippleColor: "border-[#c23b2b]/45",
      }
    : isRemindOutcome
      ? {
          animationClass: "animate-orb-sage",
          background:
            "radial-gradient(circle at 35% 30%, #e7f8ef 0%, #98cfb4 45%, #2b7a5b 84%, #154231 100%)",
          rippleColor: "border-[#98cfb4]/45",
        }
      : {
          animationClass: "animate-orb-breathe",
          background:
            "radial-gradient(circle at 35% 30%, #fff0d4 0%, #f6c478 38%, #d97745 78%, #8f411c 100%)",
          rippleColor: "border-[#f6c478]/40",
        };

  return (
    <div className="overflow-hidden rounded-[32px] border border-[#0F181A]/15 bg-[#0F181A] shadow-[0_32px_90px_-32px_rgba(15,24,26,0.38)]">
      <div className="grid lg:grid-cols-12">
        {/* Left Panel: Warm Editorial Paper + Zero-Menu Spoken Scenario Selector */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-[#EFE8DA] text-[#0F181A] lg:col-span-5">
          {/* Subtle warm sunlight radial glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -right-16 h-72 w-72 rounded-full opacity-55 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(246,196,120,0.55) 0%, rgba(217,119,69,0.16) 55%, transparent 75%)",
            }}
          />

          <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-8">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-[#9C4B22] uppercase">
                Zero Typing · Zero Menus
              </p>
              <h3 className="mt-2.5 font-serif text-2xl leading-tight font-semibold text-[#0F181A] sm:text-3xl">
                She never types.
                <br />
                She just speaks.
              </h3>
              <p className="mt-3 max-w-sm text-xs leading-relaxed text-[#536360] sm:text-sm">
                Only 10.6% of Indians speak English. Choose a real voice moment below—no text box,
                just how women already describe symptoms at home.
              </p>
            </div>

            {/* Scenario Selector Pills */}
            <div className="mt-8 space-y-2.5">
              <p className="text-[11px] font-semibold tracking-wider text-[#536360] uppercase">
                Select a spoken scenario
              </p>
              <div className="space-y-2.5">
                {SCENARIOS.map((item, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectScenario(idx)}
                      className={`w-full cursor-pointer rounded-2xl border px-4 py-3.5 text-left transition-all ${
                        isActive
                          ? "border-[#0F181A] bg-[#0F181A] text-[#F7F4ED] shadow-md"
                          : "border-[#0F181A]/12 bg-white/75 text-[#0F181A] hover:border-[#0F181A]/30 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">{item.pillTitle}</span>
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isActive ? "bg-[#F6C478]" : "bg-[#0F181A]/20"
                          }`}
                        />
                      </div>
                      <p
                        className={`mt-0.5 text-[11px] ${
                          isActive ? "text-[#F5D6AE]" : "text-[#536360]"
                        }`}
                      >
                        {item.pillMeta}
                      </p>
                    </button>
                  );
                })}
              </div>

              <p className="pt-2 text-[11px] leading-relaxed text-[#536360]">
                Wait changes from <span className="italic">“until my next visit”</span> to minutes.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel: Deep Obsidian Ink + Film Grain + Interactive Glowing Orb */}
        <div className="bg-grain relative flex flex-col justify-between bg-[#0F181A] p-6 text-[#F7F4ED] sm:p-9 lg:col-span-7">
          {/* Top Context Bar */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/12 pb-4">
            <div className="flex items-center gap-2 text-xs font-medium text-[#F7F4ED]/80">
              <span className="inline-block h-2 w-2 rounded-full bg-[#98CFB4]" />
              <span>
                Registered by Hospital · Week {scenario.week} · {scenario.language}
              </span>
            </div>

            <button
              type="button"
              onClick={handlePlayCall}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold text-[#F7F4ED] transition-colors hover:bg-white/18"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3.5 w-3.5 text-[#F6C478]" />
                  Pause Call Demo
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 text-[#F6C478]" />
                  Play Warm Voice Call
                </>
              )}
            </button>
          </div>

          {/* Center Orb Stage */}
          <div className="relative z-10 my-7 flex flex-col items-center">
            <div className="relative flex h-36 w-36 items-center justify-center">
              <span
                className={`animate-orb-ripple absolute inset-0 rounded-full border ${orbStyle.rippleColor}`}
              />
              <span
                className={`animate-orb-ripple-delayed absolute inset-0 rounded-full border ${orbStyle.rippleColor}`}
              />
              <div
                className={`${orbStyle.animationClass} relative flex h-24 w-24 items-center justify-center rounded-full transition-all duration-500`}
                style={{ background: orbStyle.background }}
              >
                {isPlaying ? (
                  <div className="flex items-center gap-1">
                    <span className="animate-voice-bar h-5 w-1 rounded-full bg-white/90" />
                    <span
                      className="animate-voice-bar h-8 w-1 rounded-full bg-white/90"
                      style={{ animationDelay: "0.18s" }}
                    />
                    <span
                      className="animate-voice-bar h-6 w-1 rounded-full bg-white/90"
                      style={{ animationDelay: "0.35s" }}
                    />
                    <span
                      className="animate-voice-bar h-4 w-1 rounded-full bg-white/90"
                      style={{ animationDelay: "0.52s" }}
                    />
                  </div>
                ) : (
                  <Volume2 className="h-7 w-7 text-white/95 drop-shadow-sm" />
                )}
              </div>
            </div>

            <p className="mt-3 text-xs tracking-wide text-[#F7F4ED]/70">
              {isPlaying
                ? `Speaking in ${scenario.language}…`
                : `Calm female voice · Answers only from her record & MoH rules`}
            </p>
          </div>

          {/* 4-Step Protocol Controls */}
          <div className="relative z-10">
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {STEP_LABELS.map((item) => {
                const active = step === item.step;
                const reached = step >= item.step;
                return (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => {
                      stopPlayback();
                      setStep(item.step);
                    }}
                    className={`cursor-pointer rounded-full border px-3 py-2 text-[11px] font-semibold transition-all ${
                      active
                        ? "border-[#F6C478] bg-[#F6C478]/18 text-[#F6C478]"
                        : reached
                          ? "border-white/25 bg-white/8 text-[#F7F4ED]"
                          : "border-white/10 text-[#F7F4ED]/50 hover:border-white/25"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Live Bounded Trace */}
            <div className="space-y-3 rounded-2xl border border-white/12 bg-white/[0.04] p-4 text-sm sm:p-5">
              {/* Step 1: She Speaks */}
              <div className="flex items-start gap-3">
                <Mic className="mt-0.5 h-4 w-4 shrink-0 text-[#F6C478]" />
                <div>
                  <p className="font-medium text-[#F7F4ED]">{scenario.motherUtterance}</p>
                  <p className="mt-0.5 text-xs text-[#F7F4ED]/65">{scenario.translation}</p>
                </div>
              </div>

              {/* Step 2: 1 Stage-Aware Question */}
              {step >= 2 && (
                <div className="border-t border-white/10 pt-3">
                  <p className="text-[11px] font-semibold tracking-wider text-[#F6C478] uppercase">
                    Stage-aware follow-up · 1 short question
                  </p>
                  <p className="mt-1 font-medium text-[#F7F4ED]">{scenario.followUpQuestion}</p>
                  <p className="text-xs text-[#F7F4ED]/65">{scenario.followUpTranslation}</p>
                  <p className="mt-1.5 text-xs text-[#F5D6AE]/90 italic">
                    Her reply: {scenario.motherReply}
                  </p>
                </div>
              )}

              {/* Step 3: Repeat-Back Confirmation */}
              {step >= 3 && (
                <div className="flex items-start gap-2.5 rounded-xl border border-[#98CFB4]/25 bg-[#98CFB4]/10 p-3 text-xs text-[#F7F4ED]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#98CFB4]" />
                  <div>
                    <span className="font-semibold text-[#98CFB4]">
                      Repeat-back confirmation:{" "}
                    </span>
                    <span className="text-[#F7F4ED]/90">{scenario.repeatBack}</span>
                  </div>
                </div>
              )}

              {/* Step 4: Bounded MoH Action */}
              {step === 4 && (
                <div
                  className={`rounded-xl border p-4 ${
                    scenario.action === "alert"
                      ? "border-[#C23B2B]/55 bg-[#C23B2B]/18"
                      : "border-[#98CFB4]/35 bg-[#98CFB4]/14"
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 text-xs font-bold tracking-wide uppercase ${
                      scenario.action === "alert" ? "text-[#FF9E92]" : "text-[#98CFB4]"
                    }`}
                  >
                    {scenario.action === "alert" ? (
                      <ShieldAlert className="h-4 w-4" />
                    ) : (
                      <BellRing className="h-4 w-4" />
                    )}
                    {scenario.actionTitle}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#F7F4ED]/90">
                    {scenario.actionDetail}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {scenario.recipients.map((rec) => (
                      <span
                        key={rec}
                        className="rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-[#F7F4ED]"
                      >
                        {rec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  HeartHandshake,
  Lock,
  Mic,
  PhoneCall,
  RotateCcw,
  ShieldCheck,
  Square,
  Users,
  Volume2,
} from "lucide-react";

type Language = "Hindi" | "Marathi";
type MobileTab = "voice" | "today" | "journal" | "family";
type FlowPhase =
  | "idle"
  | "recording_initial"
  | "thinking"
  | "followup"
  | "recording_followup"
  | "consent"
  | "alert"
  | "declined"
  | "saved";

interface Patient {
  id: string;
  name: string;
  gestationWeek: number;
  gestationDay: number;
  language: Language;
  speechLang: "hi-IN" | "mr-IN";
  nextVisitLabel: string;
  ashaName: string;
  familyName: string;
}

interface Evaluation {
  englishTranslation: string;
  followUpQuestion: string;
  followUpTranslation: string;
  repeatBackText: string;
  action: "alert" | "save_remind";
  severity: "urgent" | "doubt" | "routine";
  ruleMatched: string;
  spokenGuidance: string;
  reminderNote: string;
  modelUsed: string;
}

interface CaptionItem {
  id: string;
  isSakhi: boolean;
  dotColor?: string;
  text: string;
}

const PRIOR_ARCHIVE: CaptionItem[] = [
  {
    id: "arch-1",
    isSakhi: false,
    text: '"Kal raat iron ki goli lena bhool gayi, aur thakan lag rahi hai."',
  },
  {
    id: "arch-2",
    isSakhi: true,
    dotColor: "#58B98E",
    text: "Maine note kar liya hai Priya. Kal shaam 8 baje yaad dila dungi.",
  },
];

const QUICK_SCENARIOS = [
  {
    label: "11 PM Hindi: Headache & Swelling",
    patientId: "priya-sharma",
    utterance: "Do din se sar dard hai aur pair sujhe hue hain.",
    followupReply: "Haan, subah se thoda dhundhla lag raha hai.",
  },
  {
    label: "Marathi Doubt: Baby Movement",
    patientId: "sunita-patil",
    utterance: "Aaj baalachi halchal thodi kami vatat aahe, pan mala nakki mahit nahi.",
    followupReply: "Sakaal pasun thoda kami vatat aahe.",
  },
  {
    label: "Routine: Missed Iron Tablet",
    patientId: "kavita-devi",
    utterance: "Kal raat iron ki goli lena bhool gayi, aur thodi thakan lag rahi hai.",
    followupReply: "Nahi, chakkar nahi aa rahe.",
  },
];

export default function MobileVoiceApp() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("priya-sharma");
  const [phase, setPhase] = useState<FlowPhase>("idle");
  const [captions, setCaptions] = useState<CaptionItem[]>(PRIOR_ARCHIVE);
  const [initialUtterance, setInitialUtterance] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [activeScenarioFollowup, setActiveScenarioFollowup] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<MobileTab>("voice");
  const [ironTakenToday, setIronTakenToday] = useState(false);
  const [shareUpdatesWithFamily, setShareUpdatesWithFamily] = useState(true);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const captionsRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const micLevelRef = useRef<number>(0);

  const patient =
    patients.find((p) => p.id === selectedPatientId) ?? {
      id: "priya-sharma",
      name: "Priya Sharma",
      gestationWeek: 32,
      gestationDay: 2,
      language: "Hindi" as Language,
      speechLang: "hi-IN" as const,
      nextVisitLabel: "ANC Visit 3, 24 Nov",
      ashaName: "Meena Devi",
      familyName: "Rohit Sharma",
    };

  const loadPatients = useCallback(async () => {
    try {
      const res = await fetch("/api/patients", { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as { patients: Patient[] };
      if (json.patients?.length) {
        setPatients(json.patients);
      }
    } catch {
      // Offline or transient reload
    }
  }, []);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  useEffect(() => {
    if (captionsRef.current) {
      captionsRef.current.scrollTo({
        top: captionsRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [captions]);

  const speak = useCallback((text: string, lang: "hi-IN" | "mr-IN") => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = 0.94;
      window.speechSynthesis.speak(u);
    } catch {
      // Ignore speech synthesis errors
    }
  }, []);

  const appendCaption = useCallback((item: Omit<CaptionItem, "id">) => {
    setCaptions((prev) => [
      ...prev,
      { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
    ]);
  }, []);

  const runEvaluation = useCallback(
    async (transcript: string, evalPhase: "initial" | "followup", prior?: string) => {
      setPhase("thinking");
      setStatusNotice(null);
      try {
        const res = await fetch("/api/voice/respond", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: patient.id,
            transcript,
            phase: evalPhase,
            priorUtterance: prior,
          }),
        });
        const data = (await res.json()) as { evaluation?: Evaluation; error?: string };
        if (!res.ok || !data.evaluation) {
          setStatusNotice(data.error || "Unable to reach triage engine");
          setPhase("idle");
          return;
        }

        const ev = data.evaluation;
        setEvaluation(ev);

        if (evalPhase === "initial") {
          setInitialUtterance(transcript);
          appendCaption({
            isSakhi: true,
            dotColor: "#7FD1AE",
            text: `"${ev.followUpQuestion}"`,
          });
          setPhase("followup");
          speak(ev.followUpQuestion, patient.speechLang);
        } else if (ev.action === "alert") {
          appendCaption({
            isSakhi: true,
            dotColor: "#EAB685",
            text: `"${ev.repeatBackText}"`,
          });
          setPhase("consent");
          speak(ev.repeatBackText, patient.speechLang);
        } else {
          // Routine save & remind
          await fetch("/api/voice/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              patientId: patient.id,
              spokenQuote: `${prior ?? ""} ${transcript}`.trim(),
              englishTranslation: ev.englishTranslation,
              action: "save_remind",
              severity: "routine",
              ruleMatched: ev.ruleMatched,
              reminderNote: ev.reminderNote,
            }),
          });
          appendCaption({
            isSakhi: true,
            dotColor: "#58B98E",
            text: ev.spokenGuidance,
          });
          setPhase("saved");
          speak(ev.spokenGuidance, patient.speechLang);
        }
      } catch {
        setStatusNotice("Network unavailable. Saved locally.");
        setPhase("idle");
      }
    },
    [appendCaption, patient.id, patient.speechLang, speak],
  );

  const handleConfirmAlert = async () => {
    if (!evaluation) return;
    appendCaption({ isSakhi: false, text: '"Haan, bhej do."' });
    await fetch("/api/voice/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: patient.id,
        spokenQuote: initialUtterance,
        englishTranslation: evaluation.englishTranslation,
        action: "alert",
        severity: evaluation.severity,
        ruleMatched: evaluation.ruleMatched,
        reminderNote: evaluation.reminderNote,
      }),
    });
    appendCaption({
      isSakhi: true,
      dotColor: "#E06246",
      text: evaluation.spokenGuidance,
    });
    setPhase("alert");
    speak(evaluation.spokenGuidance, patient.speechLang);
  };

  const handleDeclineAlert = () => {
    appendCaption({ isSakhi: false, text: '"Abhi nahi."' });
    const first = patient.name.split(" ")[0] || patient.name;
    const msg = `Theek hai ${first}, abhi kisi ko nahi bhej rahi. Agar takleef badhe ya mann badle, bas bol dena.`;
    appendCaption({
      isSakhi: true,
      dotColor: "#8EA39C",
      text: msg,
    });
    setPhase("declined");
    speak(msg, patient.speechLang);
  };

  const startRecording = async (targetPhase: "recording_initial" | "recording_followup") => {
    setStatusNotice(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current = recorder;

      // Live audio energy meter for the 60fps acoustic field
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      const freqData = new Uint8Array(analyser.frequencyBinCount);
      let alive = true;
      const sampleMeter = () => {
        if (!alive) return;
        analyser.getByteFrequencyData(freqData);
        const avg = freqData.reduce((a, b) => a + b, 0) / Math.max(1, freqData.length);
        micLevelRef.current = Math.min(1.2, avg / 90);
        requestAnimationFrame(sampleMeter);
      };
      sampleMeter();

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        alive = false;
        micLevelRef.current = 0;
        stream.getTracks().forEach((t) => t.stop());
        void audioCtx.close();

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const form = new FormData();
        form.append("audio", blob, "voice-note.webm");
        form.append("speechLang", patient.speechLang);

        setPhase("thinking");
        try {
          const res = await fetch("/api/voice/transcribe", { method: "POST", body: form });
          const data = (await res.json()) as {
            transcript?: string;
            keyNotSet?: boolean;
            error?: string;
          };
          if (data.keyNotSet) {
            setStatusNotice("Groq API key not set for live mic STT. Use quick voice scenarios on the right.");
            setPhase(targetPhase === "recording_followup" ? "followup" : "idle");
            return;
          }
          const text = (data.transcript ?? "").trim();
          if (!text) {
            setStatusNotice("Could not hear clearly. Please speak again or tap a quick scenario.");
            setPhase(targetPhase === "recording_followup" ? "followup" : "idle");
            return;
          }
          appendCaption({ isSakhi: false, text: `"${text}"` });
          if (targetPhase === "recording_initial") {
            await runEvaluation(text, "initial");
          } else {
            await runEvaluation(text, "followup", initialUtterance);
          }
        } catch {
          setStatusNotice("Transcription failed. Please try a quick scenario.");
          setPhase("idle");
        }
      };

      recorder.start();
      setPhase(targetPhase);
    } catch {
      setStatusNotice("Microphone permission unavailable. Use the quick voice scenarios.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const resetSession = () => {
    setPhase("idle");
    setCaptions(PRIOR_ARCHIVE);
    setInitialUtterance("");
    setEvaluation(null);
    setStatusNotice(null);
    setActiveScenarioFollowup(null);
  };

  // 60fps Living Acoustic Field (48-Band Hairlines + 3 Silk Ribbons)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const BANDS = 48;
    const bandVals = new Float32Array(BANDS).fill(0.1);
    let animId = 0;
    let t = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const isRecording = phase === "recording_initial" || phase === "recording_followup";
      const isCalm = phase === "idle" || phase === "saved" || phase === "declined";
      const speed = isCalm ? 0.025 : 0.072;
      t += speed;

      const micBoost = isRecording ? Math.max(0.55, micLevelRef.current) : 0;
      const energy = isRecording
        ? 0.65 + micBoost * 0.55
        : phase === "alert"
          ? 1.05
          : isCalm
            ? 0.28
            : 0.85;
      const midY = h * 0.54;

      const palette =
        phase === "alert"
          ? {
              bar: "rgba(224,98,70,0.42)",
              r1: "rgba(224,98,70,0.88)",
              r2: "rgba(246,173,148,0.45)",
              r3: "rgba(224,98,70,0.22)",
            }
          : phase === "followup" || phase === "consent"
            ? {
                bar: "rgba(127,209,174,0.36)",
                r1: "rgba(127,209,174,0.88)",
                r2: "rgba(234,182,133,0.45)",
                r3: "rgba(127,209,174,0.20)",
              }
            : phase === "saved"
              ? {
                  bar: "rgba(88,185,142,0.28)",
                  r1: "rgba(88,185,142,0.75)",
                  r2: "rgba(158,176,170,0.32)",
                  r3: "rgba(88,185,142,0.16)",
                }
              : {
                  bar: "rgba(234,182,133,0.36)",
                  r1: "rgba(234,182,133,0.92)",
                  r2: "rgba(255,224,188,0.48)",
                  r3: "rgba(234,182,133,0.20)",
                };

      const step = w / BANDS;
      const center = (BANDS - 1) / 2;
      for (let i = 0; i < BANDS; i++) {
        const dist = Math.abs(i - center) / center;
        const win = Math.pow(Math.max(0.05, 1 - dist * 0.9), 1.5);
        const mod =
          0.48 +
          0.32 * Math.sin(t * 1.9 + i * 0.35) +
          0.2 * Math.cos(t * 3.1 - i * 0.6);
        const target = Math.min(0.95, win * mod * energy);
        const prev = bandVals[i] ?? 0.1;
        const next = prev + (target - prev) * 0.18;
        bandVals[i] = next;

        const bh = Math.max(3, next * (h * 0.72));
        const x = i * step + step * 0.5;
        ctx.strokeStyle = palette.bar;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(x, midY - bh / 2);
        ctx.lineTo(x, midY + bh / 2);
        ctx.stroke();
      }

      [
        { amp: 22 * energy, freq: 0.022, spd: 1.0, color: palette.r1, lw: 2.0 },
        { amp: 15 * energy, freq: 0.031, spd: -1.35, color: palette.r2, lw: 1.3 },
        { amp: 10 * energy, freq: 0.017, spd: 0.7, color: palette.r3, lw: 1.1 },
      ].forEach((rb) => {
        ctx.strokeStyle = rb.color;
        ctx.lineWidth = rb.lw;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 3) {
          const taper = Math.sin((x / w) * Math.PI);
          const y =
            midY +
            Math.sin(x * rb.freq + t * rb.spd) *
              Math.cos(x * 0.011 - t * 0.5) *
              rb.amp *
              taper;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [phase]);

  const glowColor =
    phase === "alert"
      ? "rgba(224,98,70,0.36)"
      : phase === "saved"
        ? "rgba(88,185,142,0.28)"
        : phase === "followup" || phase === "consent"
          ? "rgba(127,209,174,0.28)"
          : "rgba(234,182,133,0.30)";

  const isDaylightTab = activeTab !== "voice";
  const patientFirst = patient.name.split(" ")[0] || patient.name;
  const playSampleAudio = (id: string, text: string) => {
    setPlayingAudioId(id);
    speak(text, patient.speechLang);
    window.setTimeout(() => {
      setPlayingAudioId((curr) => (curr === id ? null : curr));
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#101828] flex flex-col lg:flex-row items-center justify-center gap-8 p-4 sm:p-8">
      {/* Bedside Voice-Native + Post-Voice Patient Phone Frame */}
      <div
        className={`w-[330px] h-[640px] shrink-0 rounded-[44px] border-[6px] border-[#1A201E] overflow-hidden relative flex flex-col shadow-xl transition-colors duration-300 ${
          isDaylightTab ? "bg-[#FAF6EE] text-[#101828]" : "bg-[#0B1715] text-[#FAF6EE]"
        }`}
      >
        {/* Ambient Lantern Glow (Voice mode only) */}
        {!isDaylightTab && (
          <div
            className="absolute bottom-24 left-1/2 -translate-x-1/2 w-72 h-64 rounded-full pointer-events-none transition-all duration-700"
            style={{
              background: `radial-gradient(circle, ${glowColor} 0%, rgba(234,182,133,0.04) 54%, transparent 76%)`,
            }}
          />
        )}

        {/* Status Bar */}
        <div
          className={`px-6 pt-3.5 flex items-center justify-between text-[11px] relative z-10 shrink-0 ${
            isDaylightTab ? "text-[#475467]" : "text-[#8EA39C]"
          }`}
        >
          <span>{isDaylightTab ? "8:15 AM" : "11:14 PM"}</span>
          <div className="w-16 h-4 rounded-full bg-[#040908]" />
          <span>4G</span>
        </div>

        {/* Whisper-Quiet Context Header */}
        <div
          className={`px-6 pt-3 pb-2 flex items-center justify-between relative z-10 shrink-0 ${
            isDaylightTab ? "border-b border-[#E7DFD0]" : ""
          }`}
        >
          <span
            className={`text-xs font-medium ${
              isDaylightTab ? "text-[#101828]" : "text-[#C8D3CF]"
            }`}
          >
            {patientFirst} · Week {patient.gestationWeek}
          </span>
          <span
            className={`text-[11px] font-medium ${
              isDaylightTab ? "text-[#667085]" : "text-[#8EA39C]"
            }`}
          >
            {isDaylightTab ? `Next: ${patient.nextVisitLabel}` : patient.language}
          </span>
        </div>

        {activeTab === "voice" ? (
          <>
            {/* Receding Kinetic Voice Captions (Sakhi-only labels, zero chat bubbles) */}
            <div
              ref={captionsRef}
              className="flex-1 overflow-y-auto px-6 pt-4 pb-3 space-y-5 relative z-10"
              style={{
                scrollbarWidth: "none",
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.45) 14%, black 34%, black 92%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.45) 14%, black 34%, black 92%, transparent 100%)",
              }}
            >
              {captions.map((item, idx) => {
                const isCurrent = idx === captions.length - 1;
                const opacity = isCurrent ? 1 : idx === captions.length - 2 ? 0.42 : 0.22;
                return (
                  <div key={item.id} className="transition-opacity duration-500" style={{ opacity }}>
                    {item.isSakhi && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: item.dotColor || "#7FD1AE" }}
                        />
                        <span
                          className="text-[10.5px] font-medium tracking-wide"
                          style={{ color: isCurrent ? item.dotColor || "#7FD1AE" : "#9EB0AA" }}
                        >
                          Sakhi
                        </span>
                      </div>
                    )}
                    <div
                      className={
                        isCurrent
                          ? "font-serif text-[19px] leading-[1.35] text-[#FAF6EE]"
                          : "font-serif text-[13.5px] leading-[1.4] text-[#C8D3CF]"
                      }
                    >
                      {item.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Full-Width Living Acoustic Field */}
            <div className="relative z-10 shrink-0 pt-1">
              <canvas ref={canvasRef} className="w-full h-[104px] block" />
            </div>

            {/* Bottom Autonomy Consent / Voice Control */}
            <div className="px-5 pb-3 pt-1 relative z-10 shrink-0">
              {phase === "consent" ? (
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleDeclineAlert}
                    className="px-3 py-2.5 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.1] text-xs font-medium text-[#C8D3CF] transition cursor-pointer"
                  >
                    Abhi nahi
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAlert}
                    className="px-3 py-2.5 rounded-xl bg-[#D96B4F] hover:bg-[#E07A60] text-xs font-semibold text-[#FAF6EE] transition cursor-pointer"
                  >
                    Haan, bhej do
                  </button>
                </div>
              ) : phase === "alert" ? (
                <div className="rounded-2xl border border-[#E06246]/40 bg-[#E06246]/15 px-3.5 py-2.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-[#FAF6EE]">
                      {patient.ashaName.split(" ")[0]} · {patient.familyName.split(" ")[0]} · Hospital notified
                    </span>
                    <span className="text-[10px] font-semibold text-[#F6AD94] shrink-0">Care sent</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("today")}
                    className="w-full py-1.5 rounded-lg bg-[#D96B4F] text-[11px] font-semibold text-[#FAF6EE] cursor-pointer"
                  >
                    Open Care Plan &rarr;
                  </button>
                </div>
              ) : phase === "saved" ? (
                <div className="rounded-2xl border border-[#58B98E]/35 bg-[#58B98E]/15 px-3.5 py-2.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-[#FAF6EE]">
                      {evaluation?.reminderNote || "Saved for next ANC visit"}
                    </span>
                    <span className="text-[10px] font-semibold text-[#58B98E] shrink-0">Saved</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("journal")}
                    className="w-full py-1.5 rounded-lg bg-[#0F4C3A] text-[11px] font-semibold text-[#FAF6EE] cursor-pointer"
                  >
                    View Journal &rarr;
                  </button>
                </div>
              ) : phase === "declined" ? (
                <div className="rounded-2xl border border-white/15 bg-white/[0.05] px-3.5 py-2.5 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#C8D3CF]">
                    Kisi ko khabar nahi bheji
                  </span>
                  <span className="text-[10px] font-medium text-[#8EA39C]">Paused</span>
                </div>
              ) : phase === "followup" && activeScenarioFollowup ? (
                <button
                  type="button"
                  onClick={() => {
                    const reply = activeScenarioFollowup;
                    setActiveScenarioFollowup(null);
                    appendCaption({ isSakhi: false, text: `"${reply}"` });
                    void runEvaluation(reply, "followup", initialUtterance);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-xs font-medium text-[#FAF6EE] transition cursor-pointer"
                >
                  Speak reply: &ldquo;{activeScenarioFollowup}&rdquo;
                </button>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  {phase === "recording_initial" || phase === "recording_followup" ? (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D96B4F] text-[#FAF6EE] text-xs font-semibold cursor-pointer"
                    >
                      <Square size={12} fill="currentColor" />
                      Tap to finish
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={phase === "thinking"}
                      onClick={() =>
                        void startRecording(
                          phase === "followup" ? "recording_followup" : "recording_initial",
                        )
                      }
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] text-[#FAF6EE] text-xs font-medium transition cursor-pointer disabled:opacity-50"
                    >
                      <Mic size={13} className="text-[#EAB685]" />
                      {phase === "thinking" ? "Listening..." : "Tap to speak"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        ) : activeTab === "today" ? (
          <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3" style={{ scrollbarWidth: "none" }}>
            {/* Voice Recap Card */}
            <div className="rounded-2xl bg-white border border-[#E7DFD0] p-3.5 shadow-sm">
              <div className="text-[10.5px] font-semibold uppercase tracking-wider text-[#9C5A3C]">
                Aaj · Care Plan
              </div>
              <div className="font-serif text-[17px] leading-snug text-[#101828] mt-1">
                Listen to Sakhi&apos;s advice
              </div>
              <p className="text-[11.5px] text-[#475467] mt-1 leading-relaxed">
                {evaluation?.spokenGuidance ||
                  "Aaram karein, paani piyein, aur agar sar dard ya sujan badhe toh turant bolein."}
              </p>
              <button
                type="button"
                onClick={() =>
                  playSampleAudio(
                    "recap",
                    evaluation?.spokenGuidance ||
                      "Priya, aaram karein, paani piyein, aur agar sar dard badhe toh turant bolein.",
                  )
                }
                className="mt-2.5 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#C8643B] hover:bg-[#B45630] text-white text-xs font-semibold transition cursor-pointer"
              >
                <Volume2 size={14} />
                {playingAudioId === "recap" ? "Playing in Hindi..." : "Play voice recap"}
              </button>
            </div>

            {/* Active Care Card */}
            {phase === "alert" ? (
              <div className="rounded-2xl bg-[#FFF4F1] border border-[#F3C5B8] p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#9C331A]">Care team notified</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FDE4DC] text-[#9C331A]">
                    Urgent
                  </span>
                </div>
                <div className="space-y-1.5 text-[11.5px] text-[#344054]">
                  <div className="flex justify-between">
                    <span>{patient.ashaName} (Health Pro)</span>
                    <span className="text-[#0F4C3A] font-medium">Called 2m ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{patient.familyName} (Partner)</span>
                    <span className="text-[#0F4C3A] font-medium">Notified</span>
                  </div>
                  <div className="flex justify-between">
                    <span>District Women&apos;s Hospital</span>
                    <span className="text-[#0F4C3A] font-medium">Desk alerted</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    playSampleAudio(
                      "call",
                      `${patient.ashaName.split(" ")[0]} didi ko call lagaya ja raha hai.`,
                    )
                  }
                  className="w-full mt-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#101828] text-white text-xs font-semibold cursor-pointer"
                >
                  <PhoneCall size={13} />
                  Call {patient.ashaName.split(" ")[0]}
                </button>
              </div>
            ) : (
              <div className="rounded-2xl bg-white border border-[#E7DFD0] p-3.5 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10.5px] font-semibold text-[#0F4C3A]">Tonight · 8:00 PM</div>
                  <div className="text-xs font-semibold text-[#101828] mt-0.5">Iron Tablet (IFA)</div>
                  <div className="text-[11px] text-[#475467]">Take after dinner with lemon water</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIronTakenToday((v) => !v)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold shrink-0 transition cursor-pointer ${
                    ironTakenToday
                      ? "bg-[#0F4C3A] text-white"
                      : "bg-[#EFE6D5] text-[#101828] hover:bg-[#E5D9C3]"
                  }`}
                >
                  {ironTakenToday ? "Taken today" : "Mark taken"}
                </button>
              </div>
            )}

            {/* Week 32 Quiet Guide */}
            <div className="rounded-2xl bg-[#F3ECE0] border border-[#E4DAC7] p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#101828] flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-[#0F4C3A]" />
                  Week {patient.gestationWeek} Verified Guide
                </span>
                <button
                  type="button"
                  onClick={() =>
                    playSampleAudio(
                      "guide",
                      "Aathvein mahine mein din mein do ghante baayein karwat aaram karein.",
                    )
                  }
                  className="text-[11px] font-semibold text-[#C8643B] cursor-pointer"
                >
                  {playingAudioId === "guide" ? "Playing..." : "Listen"}
                </button>
              </div>
              <p className="text-[11.5px] text-[#475467] mt-1.5 leading-relaxed">
                Rest on your left side in the afternoon and stay hydrated. Always speak up if headache or blurred vision starts.
              </p>
            </div>
          </div>
        ) : activeTab === "journal" ? (
          <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3" style={{ scrollbarWidth: "none" }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-[#9C5A3C]">
                  Diary
                </div>
                <div className="font-serif text-lg font-bold text-[#101828]">My Health Journal</div>
              </div>
              <button
                type="button"
                onClick={() =>
                  playSampleAudio(
                    "journal",
                    "Doctor se milne se pehle: aapki iron ki goli 118 din poori hui hai aur pichle hafte BP normal tha.",
                  )
                }
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0F4C3A] text-white text-[11px] font-semibold cursor-pointer"
              >
                <Volume2 size={12} />
                {playingAudioId === "journal" ? "Playing..." : "Listen before visit"}
              </button>
            </div>

            {/* IFA Iron Streak */}
            <div className="rounded-2xl bg-white border border-[#E7DFD0] p-3.5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#101828]">
                <span>Iron Tablet Streak</span>
                <span className="text-[#0F4C3A]">{ironTakenToday ? 119 : 118} / 180 days</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#EFE6D5] mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#0F4C3A] transition-all"
                  style={{ width: `${Math.round(((ironTakenToday ? 119 : 118) / 180) * 100)}%` }}
                />
              </div>
            </div>

            {/* Plain-Language Timeline */}
            <div className="space-y-2">
              {(phase === "alert" || phase === "saved") && (
                <div className="rounded-2xl bg-white border border-[#C8643B]/40 p-3">
                  <div className="flex items-center justify-between text-[10.5px] font-semibold text-[#C8643B]">
                    <span>Just now · Voice check-in</span>
                    <span>{phase === "alert" ? "Care alerted" : "Saved"}</span>
                  </div>
                  <div className="text-xs text-[#101828] mt-1 font-medium">
                    &ldquo;{initialUtterance}&rdquo;
                  </div>
                </div>
              )}

              <div className="rounded-2xl bg-white border border-[#E7DFD0] p-3">
                <div className="flex items-center justify-between text-[10.5px] text-[#667085]">
                  <span>Yesterday · 8:10 PM</span>
                  <span className="text-[#0F4C3A] font-medium flex items-center gap-1">
                    <CheckCircle2 size={11} />
                    Saved
                  </span>
                </div>
                <div className="text-xs font-medium text-[#101828] mt-1">
                  Missed iron tablet noted; 8 PM reminder set
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-[#E7DFD0] p-3">
                <div className="flex items-center justify-between text-[10.5px] text-[#667085]">
                  <span>10 Nov · ANC Visit 2</span>
                  <span className="text-[#0F4C3A] font-medium">Doctor verified</span>
                </div>
                <div className="text-xs font-medium text-[#101828] mt-1">
                  BP normal (116/74), baby heartbeat steady
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-[#E7DFD0] p-3">
                <div className="flex items-center justify-between text-[10.5px] text-[#667085]">
                  <span>28 Oct · Mild swelling checked</span>
                  <span className="text-[#475467] font-medium">No danger signs</span>
                </div>
                <div className="text-xs font-medium text-[#101828] mt-1">
                  Noted for clinic review
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3" style={{ scrollbarWidth: "none" }}>
            {/* Closed Family Circle Header */}
            <div className="rounded-2xl bg-white border border-[#E7DFD0] p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#101828]">
                  <Lock size={13} className="text-[#0F4C3A]" />
                  Closed Family Circle · 3 members
                </span>
              </div>
              <div className="text-[11px] text-[#475467]">
                Maa (Savitri) · Saas (Kamla) · {patient.familyName.split(" ")[0]}
              </div>
              <div className="pt-1 border-t border-[#F0EAE0] flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#344054]">
                  Share weekly care notes
                </span>
                <button
                  type="button"
                  onClick={() => setShareUpdatesWithFamily((v) => !v)}
                  className={`px-2.5 py-1 rounded-full text-[10.5px] font-semibold transition cursor-pointer ${
                    shareUpdatesWithFamily
                      ? "bg-[#0F4C3A] text-white"
                      : "bg-[#EFE6D5] text-[#475467]"
                  }`}
                >
                  {shareUpdatesWithFamily ? "On" : "Private"}
                </button>
              </div>
            </div>

            {shareUpdatesWithFamily && (
              <div className="rounded-2xl bg-[#F3ECE0] border border-[#E4DAC7] p-3.5">
                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-[#0F4C3A]">
                  Hospital-Verified Note for Family
                </div>
                <p className="text-xs text-[#101828] mt-1 leading-relaxed">
                  Week {patient.gestationWeek} care: warm iron-rich meals, afternoon rest, and check-up on {patient.nextVisitLabel}.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    playSampleAudio(
                      "family-note",
                      "Parivar ke liye hospital salaah: Priya ko roz dopahar aaram aur garam poshtik khana dein.",
                    )
                  }
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#101828] text-white text-[11px] font-semibold cursor-pointer"
                >
                  <Volume2 size={12} />
                  {playingAudioId === "family-note" ? "Playing..." : "Play in Hindi · 0:18"}
                </button>
              </div>
            )}

            {/* Voice Blessing from Maa */}
            <div className="rounded-2xl bg-white border border-[#E7DFD0] p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#9C5A3C] flex items-center gap-1.5">
                  <HeartHandshake size={13} />
                  Voice note from Maa (Savitri Devi)
                </span>
              </div>
              <p className="font-serif text-[13.5px] text-[#101828] mt-1.5 leading-snug">
                &ldquo;Beta, dal-palak bana rakha hai, shaam ko iron ki goli yaad se kha lena.&rdquo;
              </p>
              <button
                type="button"
                onClick={() =>
                  playSampleAudio(
                    "maa",
                    "Beta, dal palak bana rakha hai, shaam ko iron ki goli yaad se kha lena.",
                  )
                }
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EFE6D5] hover:bg-[#E6DAC4] text-[#101828] text-[11px] font-semibold cursor-pointer"
              >
                <Volume2 size={12} />
                {playingAudioId === "maa" ? "Playing..." : "Listen to Maa · 0:14"}
              </button>
            </div>

            {/* Myth-Free Doctor Note */}
            <div className="rounded-2xl bg-white border border-[#E7DFD0] p-3.5">
              <div className="text-[10.5px] font-semibold text-[#0F4C3A]">
                Myth-Free Doctor Note
              </div>
              <p className="text-[11.5px] text-[#344054] mt-1 leading-relaxed">
                Swollen feet with headache in Month 8 is never &apos;just heat&apos;. Always check BP at the hospital.
              </p>
              <button
                type="button"
                onClick={() =>
                  playSampleAudio(
                    "myth",
                    "Aathvein mahine mein pair ki sujan aur sar dard ko garmi samajhkar nazarandaz na karein.",
                  )
                }
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F4C3A] text-white text-[11px] font-semibold cursor-pointer"
              >
                <Volume2 size={12} />
                {playingAudioId === "myth" ? "Playing..." : "Play in Hindi · 0:22"}
              </button>
            </div>
          </div>
        )}

        {/* 4-Item Bottom Tab Bar */}
        <div
          className={`px-3 py-2 grid grid-cols-4 gap-1 shrink-0 relative z-10 border-t ${
            isDaylightTab
              ? "bg-[#FAF6EE] border-[#E7DFD0] text-[#475467]"
              : "bg-[#081210] border-white/10 text-[#8EA39C]"
          }`}
        >
          {[
            { id: "voice" as const, label: "Voice", icon: Mic },
            { id: "today" as const, label: "Today", icon: Calendar },
            { id: "journal" as const, label: "Journal", icon: BookOpen },
            { id: "family" as const, label: "Family", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-semibold transition cursor-pointer ${
                  active
                    ? isDaylightTab
                      ? "bg-[#EFE6D5] text-[#101828]"
                      : "bg-white/10 text-[#FAF6EE]"
                    : "hover:opacity-80"
                }`}
              >
                <Icon size={14} className={active && !isDaylightTab ? "text-[#EAB685]" : ""} />
                <span className="mt-0.5">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Evaluator Controls (Outside Phone Frame) */}
      <div className="w-full max-w-[340px] space-y-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#9C5A3C]">
            Sakhi Patient Companion
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#101828] mt-1">
            Voice-native + post-voice UX
          </h1>
          <p className="text-xs text-[#475467] mt-1 leading-relaxed">
            Powered by Groq Whisper STT + bounded MoHFW triage, followed by her Care Plan, Journal, and Closed Family Circle.
          </p>
        </div>

        <div>
          <div className="text-xs font-semibold text-[#344054] mb-1.5">Jump to screen</div>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: "voice" as const, label: "Voice" },
              { id: "today" as const, label: "Today" },
              { id: "journal" as const, label: "Journal" },
              { id: "family" as const, label: "Family" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#101828] text-white border-[#101828]"
                    : "bg-white text-[#344054] border-[#E4E7EC] hover:border-[#0F4C3A]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {statusNotice && (
          <div className="rounded-lg border border-[#FEDF89] bg-[#FFFAEB] px-3 py-2 text-xs text-[#B54708]">
            {statusNotice}
          </div>
        )}

        <div className="space-y-2">
          <div className="text-xs font-semibold text-[#344054]">Quick voice scenarios</div>
          {QUICK_SCENARIOS.map((sc) => (
            <button
              key={sc.label}
              type="button"
              onClick={() => {
                setSelectedPatientId(sc.patientId);
                setCaptions(PRIOR_ARCHIVE);
                setEvaluation(null);
                setActiveScenarioFollowup(sc.followupReply);
                appendCaption({ isSakhi: false, text: `"${sc.utterance}"` });
                void runEvaluation(sc.utterance, "initial");
              }}
              className="w-full text-left rounded-lg border border-[#E4E7EC] bg-white px-3.5 py-2.5 hover:border-[#0F4C3A] transition cursor-pointer"
            >
              <div className="text-xs font-semibold text-[#101828]">{sc.label}</div>
              <div className="text-[11px] text-[#475467] mt-0.5">&ldquo;{sc.utterance}&rdquo;</div>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#E4E7EC]">
          <button
            type="button"
            onClick={resetSession}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#475467] hover:text-[#101828] cursor-pointer"
          >
            <RotateCcw size={13} />
            Reset voice session
          </button>
          <a
            href="http://localhost:3002"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-[#0F4C3A] hover:underline"
          >
            Open Clinic Desk &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}

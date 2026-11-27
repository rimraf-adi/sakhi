"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Heart,
  Lock,
  MessageCircle,
  Mic,
  RotateCcw,
  Send,
  ShieldCheck,
  Square,
  Users,
  Volume2,
} from "lucide-react";

type Language = "Hindi" | "Marathi";
type MobileTab = "feed" | "voice" | "journal";

interface CirclePost {
  id: string;
  author: string;
  badge: string;
  avatar: string;
  avatarBg: string;
  avatarText: string;
  time: string;
  text: string;
  voiceDuration?: string;
  voiceLang?: string;
  likes: number;
  replies: number;
  reply?: {
    author: string;
    badge: string;
    avatar: string;
    time: string;
    text: string;
  };
}

const INITIAL_CIRCLE_POSTS: CirclePost[] = [
  {
    id: "p1",
    author: "Anjali Verma",
    badge: "Wk 33",
    avatar: "A",
    avatarBg: "#E4DAC7",
    avatarText: "#101828",
    time: "14m",
    text: "Anyone else waking up with calf cramps at 3 AM? Warm water helped a bit.",
    voiceDuration: "0:19",
    likes: 12,
    replies: 3,
    reply: {
      author: "Sunita Patil",
      badge: "Wk 34",
      avatar: "S",
      time: "6m",
      text: "Yes! Flexing toes upward and a pillow between knees really helped me.",
    },
  },
  {
    id: "p2",
    author: "Kavita Devi",
    badge: "Wk 31",
    avatar: "K",
    avatarBg: "#F3D3A7",
    avatarText: "#101828",
    time: "1h",
    text: '"Aaj iron ki goli ke saath nimbu paani liya, chakkar bilkul nahi aaya."',
    voiceDuration: "0:24",
    voiceLang: "Hindi",
    likes: 18,
    replies: 5,
  },
  {
    id: "p3",
    author: "Dr. Anita Deshmukh",
    badge: "Clinic",
    avatar: "Dr",
    avatarBg: "#0F4C3A",
    avatarText: "#FFFFFF",
    time: "3h",
    text: "If headache and swollen feet show up together, do not wait till morning. Speak to Sakhi right away.",
    likes: 26,
    replies: 4,
  },
];
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
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [circlePosts, setCirclePosts] = useState<CirclePost[]>(INITIAL_CIRCLE_POSTS);
  const [composerText, setComposerText] = useState("");
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});

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

  const handlePublishPost = (withVoice = false) => {
    const trimmed = composerText.trim();
    if (!trimmed && !withVoice) return;
    const newPost: CirclePost = {
      id: `user-${Date.now()}`,
      author: patient.name,
      badge: `Wk ${patient.gestationWeek}`,
      avatar: patientFirst.charAt(0).toUpperCase(),
      avatarBg: "#C8643B",
      avatarText: "#FFFFFF",
      time: "Just now",
      text: trimmed || '"Aaj aaram kiya aur paani zyada piya, thoda behtar lag raha hai."',
      ...(withVoice ? { voiceDuration: "0:12", voiceLang: patient.language } : {}),
      likes: 0,
      replies: 0,
    };
    setCirclePosts((prev) => [newPost, ...prev]);
    setComposerText("");
  };

  const dotStates = [
    "done",
    "done",
    "done",
    "done",
    "done",
    "missed",
    "done",
    "done",
    "done",
    "done",
    "done",
    "done",
    "done",
    ironTakenToday ? "done" : "today",
  ] as const;

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#101828] flex flex-col lg:flex-row items-center justify-center gap-8 p-4 sm:p-8">
      {/* Bedside Voice-Native + Threads Closed Circle + Graphical Journal Phone */}
      <div
        className={`w-[330px] h-[640px] shrink-0 rounded-[44px] border-[6px] border-[#1A201E] overflow-hidden relative flex flex-col shadow-xl transition-colors duration-300 ${
          isDaylightTab ? "bg-[#FAF6EE] text-[#101828]" : "bg-[#0B1715] text-[#FAF6EE]"
        }`}
      >
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

        {activeTab === "voice" ? (
          <>
            <div className="px-6 pt-3 pb-2 flex items-center justify-between relative z-10 shrink-0">
              <span className="text-xs font-medium text-[#C8D3CF]">
                {patientFirst} · Week {patient.gestationWeek}
              </span>
              <span className="text-[11px] font-medium text-[#8EA39C]">{patient.language}</span>
            </div>

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

            <div className="relative z-10 shrink-0 pt-1">
              <canvas ref={canvasRef} className="w-full h-[104px] block" />
            </div>

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
                    onClick={() => setActiveTab("feed")}
                    className="w-full py-1.5 rounded-lg bg-[#D96B4F] text-[11px] font-semibold text-[#FAF6EE] cursor-pointer"
                  >
                    Open Circle &rarr;
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
                    Open Journal &rarr;
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
        ) : activeTab === "feed" ? (
          /* Threads/Twitter-style Closed Circle for Enrolled Pregnant Women ONLY */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Crisp Hairline Header */}
            <div className="px-4 pt-2.5 pb-2 flex items-center justify-between border-b border-[#EAE3D5] shrink-0">
              <span className="font-serif text-[19px] font-bold text-[#101828]">Sakhi</span>
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#0F4C3A]">
                <Lock size={10} />
                Week 30-34 Circle · 24 mothers
              </span>
            </div>

            {/* Subtle Post-Voice Care Strip */}
            <div
              className={`px-4 py-1.5 border-b border-[#EAE3D5] flex items-center justify-between text-[11px] shrink-0 ${
                phase === "alert" ? "bg-[#FFF4F1]" : "bg-[#F5EFE4]"
              }`}
            >
              <span className={`font-semibold ${phase === "alert" ? "text-[#9C331A]" : "text-[#344054]"}`}>
                {phase === "alert"
                  ? "Care team notified · Meena alerted"
                  : "Tonight 8:00 PM · Iron tablet"}
              </span>
              {phase === "alert" ? (
                <button
                  type="button"
                  onClick={() =>
                    playSampleAudio(
                      "care-recap",
                      evaluation?.spokenGuidance ||
                        "Priya, Meena didi aur Rohit ko khabar bhej di hai. Aaram karein.",
                    )
                  }
                  className="font-bold text-[#C8643B] cursor-pointer"
                >
                  {playingAudioId === "care-recap" ? "Playing..." : "Replay advice"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIronTakenToday((v) => !v)}
                  className="font-bold text-[#0F4C3A] cursor-pointer"
                >
                  {ironTakenToday ? "Taken ✓" : "Mark taken"}
                </button>
              )}
            </div>

            {/* Quick Text + Voice Composer Row */}
            <div className="px-4 py-2 border-b border-[#EAE3D5] flex items-center gap-2 shrink-0">
              <div className="w-6 h-6 rounded-full bg-[#C8643B] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                {patientFirst.charAt(0)}
              </div>
              <input
                type="text"
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handlePublishPost(false);
                }}
                placeholder="Share text or voice with your circle..."
                className="flex-1 bg-transparent text-[11.5px] text-[#101828] placeholder:text-[#667085] focus:outline-none min-w-0"
              />
              <button
                type="button"
                title="Post voice note"
                onClick={() => handlePublishPost(true)}
                className="text-[#C8643B] hover:opacity-80 cursor-pointer"
              >
                <Mic size={14} />
              </button>
              <button
                type="button"
                title="Post text"
                onClick={() => handlePublishPost(false)}
                className="text-[#101828] hover:opacity-80 cursor-pointer"
              >
                <Send size={13} />
              </button>
            </div>

            {/* Edge-to-Edge Threads Feed */}
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
              {circlePosts.map((post) => {
                const liked = Boolean(likedIds[post.id]);
                return (
                  <div key={post.id} className="px-4 py-2.5 border-b border-[#EAE3D5]">
                    <div className="flex gap-2.5">
                      <div className="flex flex-col items-center shrink-0">
                        <div
                          className="w-7 h-7 rounded-full text-[10.5px] font-bold flex items-center justify-center"
                          style={{ backgroundColor: post.avatarBg, color: post.avatarText }}
                        >
                          {post.avatar}
                        </div>
                        {post.reply && <div className="w-[1.5px] flex-1 bg-[#DDD3C0] my-1" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[#101828] truncate">
                            {post.author}{" "}
                            <span className="font-medium text-[#667085]">· {post.badge}</span>
                          </span>
                          <span className="text-[10px] text-[#98A2B3] shrink-0">{post.time}</span>
                        </div>
                        <p className="text-[11.5px] text-[#101828] mt-0.5 leading-[1.38]">
                          {post.text}
                        </p>

                        {post.voiceDuration && (
                          <button
                            type="button"
                            onClick={() => playSampleAudio(post.id, post.text)}
                            className={`mt-1.5 inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10.5px] font-semibold cursor-pointer ${
                              post.voiceLang
                                ? "bg-[#0F4C3A] text-[#FAF6EE]"
                                : "bg-[#EFE6D5] text-[#101828]"
                            }`}
                          >
                            <Volume2 size={11} />
                            <span>
                              {playingAudioId === post.id
                                ? "Playing..."
                                : `${post.voiceDuration}${post.voiceLang ? ` · ${post.voiceLang}` : ""}`}
                            </span>
                          </button>
                        )}

                        <div className="mt-1.5 flex items-center gap-4 text-[10.5px] text-[#667085]">
                          <button
                            type="button"
                            onClick={() =>
                              setLikedIds((prev) => ({ ...prev, [post.id]: !prev[post.id] }))
                            }
                            className={`inline-flex items-center gap-1 cursor-pointer ${
                              liked ? "text-[#C8643B] font-semibold" : ""
                            }`}
                          >
                            <Heart size={11} fill={liked ? "#C8643B" : "none"} />
                            {post.likes + (liked ? 1 : 0)}
                          </button>
                          <span className="inline-flex items-center gap-1">
                            <MessageCircle size={11} />
                            {post.replies}
                          </span>
                        </div>
                      </div>
                    </div>

                    {post.reply && (
                      <div className="flex gap-2.5 mt-1.5">
                        <div className="w-7 flex justify-center shrink-0">
                          <div className="w-6 h-6 rounded-full bg-[#D6E8DF] text-[#0F4C3A] text-[10px] font-bold flex items-center justify-center">
                            {post.reply.avatar}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-[10.5px]">
                            <span className="font-bold text-[#101828]">
                              {post.reply.author}{" "}
                              <span className="font-medium text-[#667085]">· {post.reply.badge}</span>
                            </span>
                            <span className="text-[10px] text-[#98A2B3]">{post.reply.time}</span>
                          </div>
                          <p className="text-[11px] text-[#344054] mt-0.5 leading-[1.35]">
                            {post.reply.text}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Graphical Pregnancy & Health Journal */
          <div className="flex-1 flex flex-col overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            <div className="px-4 pt-2.5 pb-2 flex items-center justify-between border-b border-[#EAE3D5] shrink-0">
              <span className="font-serif text-[18px] font-bold text-[#101828]">
                Pregnancy Journal
              </span>
              <button
                type="button"
                onClick={() =>
                  playSampleAudio(
                    "journal-recap",
                    "Doctor se milne se pehle: aapki iron ki goli 118 din poori hui hai aur BP normal hai.",
                  )
                }
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0F4C3A] text-white text-[10.5px] font-semibold cursor-pointer"
              >
                <Volume2 size={11} />
                {playingAudioId === "journal-recap" ? "Playing..." : "Listen"}
              </button>
            </div>

            {/* Graphical SVG Gestation Arc */}
            <div className="px-4 py-2.5 border-b border-[#EAE3D5] flex items-center gap-3.5 shrink-0">
              <svg width={98} height={58} viewBox="0 0 104 62" className="shrink-0">
                <path
                  d="M 10 54 A 42 42 0 0 1 94 54"
                  fill="none"
                  stroke="#E7DFD0"
                  strokeWidth={9}
                  strokeLinecap="round"
                />
                <path
                  d="M 10 54 A 42 42 0 0 1 83 25"
                  fill="none"
                  stroke="#0F4C3A"
                  strokeWidth={9}
                  strokeLinecap="round"
                />
                <circle cx="83" cy="25" r="5" fill="#C8643B" stroke="#FAF6EE" strokeWidth="2" />
                <text x="52" y="46" textAnchor="middle" fontSize="14" fontWeight="700" fill="#101828">
                  Wk {patient.gestationWeek}
                </text>
                <text x="52" y="59" textAnchor="middle" fontSize="9" fill="#667085">
                  of 40
                </text>
              </svg>
              <div>
                <div className="text-xs font-bold text-[#101828]">Trimester 3 · 56 days left</div>
                <div className="text-[11px] text-[#475467] mt-0.5">
                  Next: {patient.nextVisitLabel}
                </div>
                <div className="mt-1 inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#0F4C3A]">
                  <ShieldCheck size={12} />
                  Hospital-owned record
                </div>
              </div>
            </div>

            {/* Graphical 14-Day Iron Dot Calendar */}
            <div className="px-4 py-2.5 border-b border-[#EAE3D5] shrink-0">
              <div className="flex items-center justify-between text-[11px] font-bold mb-2">
                <span>Iron Tablets (14-Day Grid)</span>
                <span className="text-[#0F4C3A]">{ironTakenToday ? 119 : 118} / 180 days</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5 justify-items-center">
                {dotStates.map((st, idx) => {
                  const isToday = idx === 13;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!isToday}
                      onClick={() => isToday && setIronTakenToday((v) => !v)}
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                        st === "done"
                          ? "bg-[#0F4C3A] text-white"
                          : st === "missed"
                            ? "border-2 border-[#C8643B] text-[#C8643B]"
                            : "border-2 border-dashed border-[#0F4C3A] bg-[#EFE6D5] text-[#101828]"
                      } ${isToday ? "cursor-pointer" : "cursor-default"}`}
                    >
                      {st === "done" ? "✓" : st === "today" ? "•" : ""}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Graphical BP Sparkline & Weight */}
            <div className="px-4 py-2.5 border-b border-[#EAE3D5] grid grid-cols-2 gap-3 shrink-0">
              <div>
                <div className="text-[10px] font-semibold text-[#667085]">BP Trend</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-bold text-[#101828]">116/74</span>
                  <svg width={64} height={20} viewBox="0 0 74 22">
                    <polyline
                      points="4,15 26,11 48,13 70,8"
                      fill="none"
                      stroke="#0F4C3A"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                    <circle cx="70" cy="8" r="3" fill="#0F4C3A" />
                  </svg>
                </div>
              </div>
              <div className="border-l border-[#EAE3D5] pl-3">
                <div className="text-[10px] font-semibold text-[#667085]">Weight Gain</div>
                <div className="text-sm font-bold text-[#101828] mt-0.5">+8.2 kg</div>
              </div>
            </div>

            {/* Vertical Hairline Timeline Spine */}
            <div className="px-4 py-2.5 space-y-2.5">
              {(phase === "alert" || phase === "saved") && (
                <div className="flex gap-2.5">
                  <div className="flex flex-col items-center">
                    <span className="w-2 h-2 rounded-full bg-[#C8643B] mt-1" />
                    <div className="w-[1.5px] flex-1 bg-[#DDD3C0] mt-1" />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-[#C8643B]">
                      Just now · {phase === "alert" ? "Care alerted" : "Saved"}
                    </div>
                    <div className="text-[11.5px] font-medium text-[#101828]">
                      &ldquo;{initialUtterance}&rdquo;
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2.5">
                <div className="flex flex-col items-center">
                  <span className="w-2 h-2 rounded-full bg-[#C8643B] mt-1" />
                  <div className="w-[1.5px] flex-1 bg-[#DDD3C0] mt-1" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-[#667085]">Tonight · 11:14 PM</div>
                  <div className="text-[11.5px] font-medium text-[#101828]">
                    Headache &amp; swollen feet alerted to care team
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5">
                <div className="flex flex-col items-center">
                  <span className="w-2 h-2 rounded-full bg-[#0F4C3A] mt-1" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-[#667085]">10 Nov · ANC Visit 2</div>
                  <div className="text-[11.5px] font-medium text-[#101828]">
                    Baby heartbeat steady · Verified by Dr. Deshmukh
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3-Tab Bottom Navigation (Circle · Voice · Journal) */}
        <div
          className={`px-4 py-1.5 grid grid-cols-3 items-center shrink-0 relative z-10 border-t ${
            isDaylightTab
              ? "bg-[#FAF6EE] border-[#EAE3D5] text-[#475467]"
              : "bg-[#081210] border-white/10 text-[#8EA39C]"
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab("feed")}
            className={`flex flex-col items-center justify-center py-1 text-[10px] font-semibold cursor-pointer ${
              activeTab === "feed" ? "text-[#101828]" : ""
            }`}
          >
            <Users size={15} />
            <span className="mt-0.5">Circle</span>
          </button>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setActiveTab("voice")}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer ${
                activeTab === "voice"
                  ? "bg-[#D96B4F] text-[#FAF6EE]"
                  : "bg-[#0B1715] text-[#EAB685]"
              }`}
              title="Bedside Voice"
            >
              <Mic size={15} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab("journal")}
            className={`flex flex-col items-center justify-center py-1 text-[10px] font-semibold cursor-pointer ${
              activeTab === "journal" ? "text-[#101828]" : ""
            }`}
          >
            <BookOpen size={15} />
            <span className="mt-0.5">Journal</span>
          </button>
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
            Bedside voice triage, a private community platform for enrolled mothers, and a graphical pregnancy journal.
          </p>
        </div>

        <div>
          <div className="text-xs font-semibold text-[#344054] mb-1.5">Jump to screen</div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: "voice" as const, label: "Voice" },
              { id: "feed" as const, label: "Circle Feed" },
              { id: "journal" as const, label: "Journal" },
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

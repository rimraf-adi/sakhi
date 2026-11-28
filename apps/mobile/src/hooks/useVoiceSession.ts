"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { captionsFromHistory } from "@/lib/archive";
import { clockLabel } from "@/lib/format";
import type { DemoScenario } from "@/lib/scenarios";
import type {
  AgentFindingView,
  AgentTurn,
  CaptionItem,
  FlowPhase,
  Patient,
  TriageEngine,
} from "@/lib/types";
import type { Speech } from "./useSpeech";

/** Ignore taps that hold less than this - a stray tap is not an utterance. */
const MIN_RECORDING_MS = 700;
/** Peak input level below this reads as silence (quiet nights are fine). */
const SILENCE_PEAK = 0.02;

/**
 * The browser's own speech recogniser (Chrome/Edge/Safari). It needs no key, so
 * it keeps the mic alive on the keyless demo; the TS DOM lib does not ship its
 * types, so the surface we use is declared here.
 */
interface RecognitionItem {
  0?: { transcript?: string };
}
interface RecognitionEvent {
  results: { length: number; [index: number]: RecognitionItem | undefined };
}
interface RecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}
type RecognitionCtor = new () => RecognitionInstance;

/** How her "yes"/"no" is echoed back into the thread, in her language. */
const CONFIRM_WORDS = {
  English: { yes: "Yes, send it.", no: "Not now." },
  Hindi: { yes: "Haan, bhej do.", no: "Abhi nahi." },
  Marathi: { yes: "Ho, pathva.", no: "Aata nahi." },
} as const;

function getRecognition(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const scope = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}

export interface VoiceSession {
  phase: FlowPhase;
  captions: CaptionItem[];
  lastTurn: AgentTurn | null;
  initialUtterance: string;
  statusNotice: string | null;
  engine: TriageEngine | null;
  isRecording: boolean;
  recordingLabel: string;
  followupSuggestion: string | null;
  micLevel: React.RefObject<number>;
  startRecording: () => void;
  stopRecording: () => void;
  runScenario: (scenario: DemoScenario) => void;
  sendFollowupSuggestion: () => void;
  confirmAlert: () => Promise<void>;
  declineAlert: () => void;
  reset: () => void;
}

interface Options {
  patient: Patient | null;
  speech: Speech;
  onDataChanged: () => void;
}

export function useVoiceSession({ patient, speech, onDataChanged }: Options): VoiceSession {
  const [phase, setPhase] = useState<FlowPhase>("idle");
  const [liveCaptions, setLiveCaptions] = useState<CaptionItem[]>([]);
  const [lastTurn, setLastTurn] = useState<AgentTurn | null>(null);
  const [initialUtterance, setInitialUtterance] = useState("");
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [followupSuggestion, setFollowupSuggestion] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // What the agent already knows about this conversation.
  const [findings, setFindings] = useState<AgentFindingView[]>([]);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<RecognitionInstance | null>(null);
  /** Server transcription needs a Groq key; the device recogniser does not. */
  const serverVoiceInputRef = useRef(false);
  const chunksRef = useRef<Blob[]>([]);
  const micLevelRef = useRef(0);
  const peakLevelRef = useRef(0);
  const startedAtRef = useRef(0);
  /** Last patient id seen, so a plain data refresh keeps the live conversation. */
  const lastPatientIdRef = useRef<string | null>(null);

  const isRecording = phase === "recording_initial" || phase === "recording_followup";

  const appendCaption = useCallback((item: Omit<CaptionItem, "id">) => {
    setLiveCaptions((current) => [
      ...current,
      { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
    ]);
  }, []);

  const resetTurn = useCallback(() => {
    setLiveCaptions([]);
    setPhase("idle");
    setLastTurn(null);
    setInitialUtterance("");
    setStatusNotice(null);
    setFollowupSuggestion(null);
    setFindings([]);
    setAskedQuestions([]);
  }, []);

  // Keyless demo: with no Groq key the mic falls back to the browser recogniser.
  useEffect(() => {
    let alive = true;
    fetch("/api/status", { cache: "no-store" })
      .then((res) => (res.ok ? (res.json() as Promise<{ voiceInput?: boolean }>) : null))
      .then((json) => {
        if (alive) serverVoiceInputRef.current = Boolean(json?.voiceInput);
      })
      .catch(() => {
        // Unknown: the recorder path still runs and says why if it is blocked.
      });
    return () => {
      alive = false;
    };
  }, []);

  // A different patient starts a fresh turn. A store refresh of the same
  // patient must not wipe the conversation on screen.
  useEffect(() => {
    const patientId = patient?.id ?? "";
    if (lastPatientIdRef.current === patientId) return;
    lastPatientIdRef.current = patientId;
    resetTurn();
  }, [patient, resetTurn]);

  useEffect(() => {
    if (!isRecording) {
      setRecordingSeconds(0);
      return;
    }
    const startedAt = Date.now();
    setRecordingSeconds(0);
    const timer = window.setInterval(() => {
      setRecordingSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 250);
    return () => window.clearInterval(timer);
  }, [isRecording]);

  const runTurn = useCallback(
    async (
      transcript: string,
      turnPhase: "initial" | "followup",
      target: Patient | null,
    ) => {
      if (!target) return;
      setPhase("thinking");
      setStatusNotice(null);

      try {
        const res = await fetch("/api/voice/respond", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: target.id,
            transcript,
            phase: turnPhase,
            priorFindings: findings,
            askedQuestions,
          }),
        });
        const data = (await res.json()) as { turn?: AgentTurn; error?: string };
        if (!res.ok || !data.turn) {
          setStatusNotice(data.error ?? "Sakhi could not reach the care rules just now.");
          setPhase(turnPhase === "initial" ? "idle" : "followup");
          return;
        }

        const turn = data.turn;
        setLastTurn(turn);
        setFindings(turn.findings);
        if (turn.questionId) setAskedQuestions((current) => [...current, turn.questionId!]);

        if (turn.action === "alert") {
          appendCaption({ isSakhi: true, dotColor: "#EAB685", text: turn.message });
          setPhase("consent");
          void speech.speak(turn.message, target.speechLang);
          return;
        }

        if (turn.action === "ask") {
          appendCaption({ isSakhi: true, dotColor: "#7FD1AE", text: turn.message });
          setPhase("followup");
          void speech.speak(turn.message, target.speechLang);
          return;
        }

        await fetch("/api/voice/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: target.id,
            spokenQuote: transcript,
            englishTranslation: turn.rationale,
            action: "save_remind",
            severity: "routine",
            ruleMatched: turn.ruleMatched,
            reminderNote: turn.reminderNote,
          }),
        });
        appendCaption({ isSakhi: true, dotColor: "#58B98E", text: turn.message });
        setPhase("saved");
        void speech.speak(turn.message, target.speechLang);
        onDataChanged();
      } catch {
        setStatusNotice("Network unavailable. Nothing was sent.");
        setPhase(turnPhase === "initial" ? "idle" : "followup");
      }
    },
    [appendCaption, askedQuestions, findings, onDataChanged, speech],
  );

  const startRecording = useCallback(async () => {
    if (!patient) return;
    const targetPhase: "recording_initial" | "recording_followup" =
      phase === "followup" ? "recording_followup" : "recording_initial";
    const idlePhase: FlowPhase =
      targetPhase === "recording_followup" ? "followup" : "idle";
    setStatusNotice(null);

    // No Groq key on this deployment: the browser speaks to Chrome's own
    // recogniser, so a judge can still talk to Sakhi with no keys at all.
    const Recognition = serverVoiceInputRef.current ? null : getRecognition();
    if (Recognition) {
      try {
        const recognition = new Recognition();
        recognition.lang = patient.speechLang;
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.onresult = (event) => {
          const said = Array.from({ length: event.results.length })
            .map((_, index) => event.results[index]?.[0]?.transcript ?? "")
            .join(" ")
            .trim();
          if (!said) {
            setPhase(idlePhase);
            return;
          }
          setPhase("thinking");
          appendCaption({ isSakhi: false, text: said });
          if (targetPhase === "recording_initial") setInitialUtterance(said);
          void runTurn(said, targetPhase === "recording_initial" ? "initial" : "followup", patient);
        };
        recognition.onerror = () => {
          recognitionRef.current = null;
          setStatusNotice(
            "Device voice input stopped. Tap the mic again, or use a prompt below.",
          );
          setPhase(idlePhase);
        };
        recognition.onend = () => {
          recognitionRef.current = null;
          setPhase((current) => (current === targetPhase ? idlePhase : current));
        };
        recognitionRef.current = recognition;
        recognition.start();
        setPhase(targetPhase);
        return;
      } catch {
        // Falls through to the recorder, which either works or explains itself.
        recognitionRef.current = null;
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      startedAtRef.current = Date.now();
      peakLevelRef.current = 0;

      // Live energy meter for the acoustic field and the silence check.
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      audioContext.createMediaStreamSource(stream).connect(analyser);
      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      let alive = true;
      const sampleMeter = () => {
        if (!alive) return;
        analyser.getByteFrequencyData(frequencyData);
        const average =
          frequencyData.reduce((total, value) => total + value, 0) /
          Math.max(1, frequencyData.length);
        micLevelRef.current = Math.min(1.2, average / 90);
        peakLevelRef.current = Math.max(peakLevelRef.current, micLevelRef.current);
        requestAnimationFrame(sampleMeter);
      };
      sampleMeter();

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        alive = false;
        micLevelRef.current = 0;
        stream.getTracks().forEach((track) => track.stop());
        void audioContext.close();

        const idlePhase: FlowPhase = targetPhase === "recording_followup" ? "followup" : "idle";
        const heldFor = Date.now() - startedAtRef.current;

        // Nothing was said: stay quiet instead of inventing a turn.
        if (heldFor < MIN_RECORDING_MS || peakLevelRef.current < SILENCE_PEAK) {
          setPhase(idlePhase);
          return;
        }

        const form = new FormData();
        form.append("audio", new Blob(chunksRef.current, { type: "audio/webm" }), "voice-note.webm");
        form.append("speechLang", patient.speechLang);

        setPhase("thinking");
        try {
          const res = await fetch("/api/voice/transcribe", { method: "POST", body: form });
          const data = (await res.json()) as {
            transcript?: string;
            keyNotSet?: boolean;
            silent?: boolean;
            message?: string;
            error?: string;
          };

          if (data.keyNotSet) {
            setStatusNotice(
              data.message ?? "Live microphone needs a Groq key. The scenarios run the same flow.",
            );
            setPhase(idlePhase);
            return;
          }

          const transcript = (data.transcript ?? "").trim();
          if (!transcript || data.silent) {
            setPhase(idlePhase);
            return;
          }

          appendCaption({ isSakhi: false, text: transcript });
          if (targetPhase === "recording_initial") {
            setInitialUtterance(transcript);
            await runTurn(transcript, "initial", patient);
          } else {
            await runTurn(transcript, "followup", patient);
          }
        } catch {
          setStatusNotice("Voice note could not be transcribed. Tap a scenario to continue.");
          setPhase(idlePhase);
        }
      };

      recorder.start();
      setPhase(targetPhase);
    } catch {
      setStatusNotice("Microphone permission unavailable. Tap a scenario to run the same flow.");
    }
  }, [appendCaption, patient, phase, runTurn]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      const recognition = recognitionRef.current;
      recognitionRef.current = null;
      recognition.stop();
      return;
    }
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      setPhase("thinking");
      recorderRef.current.stop();
    }
  }, []);

  const runScenario = useCallback(
    (scenario: DemoScenario) => {
      if (!patient) return;
      setLiveCaptions([]);
      setLastTurn(null);
      setFindings([]);
      setAskedQuestions([]);
      setInitialUtterance(scenario.utterance);
      setFollowupSuggestion(scenario.followupReply);
      setStatusNotice(null);
      appendCaption({ isSakhi: false, text: scenario.utterance });
      void runTurn(scenario.utterance, "initial", patient);
    },
    [appendCaption, patient, runTurn],
  );

  const sendFollowupSuggestion = useCallback(() => {
    if (!followupSuggestion || !patient) return;
    const reply = followupSuggestion;
    setFollowupSuggestion(null);
    appendCaption({ isSakhi: false, text: reply });
    void runTurn(reply, "followup", patient);
  }, [appendCaption, followupSuggestion, patient, runTurn]);

  const confirmAlert = useCallback(async () => {
    if (!patient || !lastTurn) return;
    appendCaption({
      isSakhi: false,
      text: CONFIRM_WORDS[patient.language].yes,
    });
    try {
      await fetch("/api/voice/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient.id,
          spokenQuote: initialUtterance,
          englishTranslation: lastTurn.rationale,
          action: "alert",
          severity: lastTurn.severity,
          ruleMatched: lastTurn.ruleMatched,
          reminderNote: lastTurn.reminderNote,
        }),
      });
    } catch {
      // The store write is best effort; the screen still reflects the consent.
    }

    const said = lastTurn.guidanceAfterConsent ?? lastTurn.message;
    appendCaption({ isSakhi: true, dotColor: "#E06246", text: said });
    setPhase("alert");
    void speech.speak(said, patient.speechLang);
    onDataChanged();
  }, [appendCaption, initialUtterance, lastTurn, onDataChanged, patient, speech]);

  const declineAlert = useCallback(() => {
    const language = patient?.language ?? "English";
    appendCaption({ isSakhi: false, text: CONFIRM_WORDS[language].no });
    setPhase("declined");
    // No scripted consolation line: the agent stays quiet until she speaks again.
    setStatusNotice(null);
  }, [appendCaption, patient?.language]);

  const reset = useCallback(() => {
    speech.stop();
    resetTurn();
  }, [resetTurn, speech]);

  const history = useMemo(() => {
    const stored = captionsFromHistory(patient);
    const firstLive = liveCaptions[0]?.text.trim();
    if (!firstLive) return stored;
    // Do not replay a stored quote she has just said again.
    return stored.filter((item) => !(!item.isSakhi && item.text.trim() === firstLive));
  }, [liveCaptions, patient]);

  return {
    phase,
    captions: [...history, ...liveCaptions],
    lastTurn,
    initialUtterance,
    statusNotice,
    engine: lastTurn?.engine ?? null,
    isRecording,
    recordingLabel: clockLabel(recordingSeconds),
    followupSuggestion,
    micLevel: micLevelRef,
    startRecording: () => void startRecording(),
    stopRecording,
    runScenario,
    sendFollowupSuggestion,
    confirmAlert,
    declineAlert,
    reset,
  };
}

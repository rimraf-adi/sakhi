"use client";

import { useEffect, useState } from "react";

export interface VoiceStatus {
  voiceInput: boolean;
  voiceOutput: boolean;
  /** live = both keys present; demo = at least one fallback in use. */
  mode: "live" | "demo";
  /** Env var names this build is missing, for the on-screen notice. */
  missing: string[];
}

/** What the screen must assume when the probe cannot answer: no live voice. */
const UNKNOWN_STATUS: VoiceStatus = {
  voiceInput: false,
  voiceOutput: false,
  mode: "demo",
  missing: ["GROQ_API_KEYS", "SARVAM_API_KEY"],
};

/**
 * Which live voice features this deployment has keys for. Null only until the
 * probe answers; a failed probe resolves to demo mode, because silently
 * claiming live voice would be worse than saying the keys are missing.
 */
export function useVoiceStatus(): VoiceStatus | null {
  const [status, setStatus] = useState<VoiceStatus | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/status", { cache: "no-store" })
      .then((res) => (res.ok ? (res.json() as Promise<VoiceStatus>) : null))
      .then((json) => {
        if (alive) setStatus(json ?? UNKNOWN_STATUS);
      })
      .catch(() => {
        if (alive) setStatus(UNKNOWN_STATUS);
      });
    return () => {
      alive = false;
    };
  }, []);

  return status;
}

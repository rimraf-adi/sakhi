"use client";

import { useEffect, useState } from "react";

export interface VoiceStatus {
  voiceInput: boolean;
  voiceOutput: boolean;
}

/**
 * Which live voice features this deployment has keys for. Null while unknown,
 * so the UI says nothing rather than guessing.
 */
export function useVoiceStatus(): VoiceStatus | null {
  const [status, setStatus] = useState<VoiceStatus | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/status", { cache: "no-store" })
      .then((res) => (res.ok ? (res.json() as Promise<VoiceStatus>) : null))
      .then((json) => {
        if (alive && json) setStatus(json);
      })
      .catch(() => {
        // Keyless is the normal demo mode; a failed probe just means no chips.
      });
    return () => {
      alive = false;
    };
  }, []);

  return status;
}

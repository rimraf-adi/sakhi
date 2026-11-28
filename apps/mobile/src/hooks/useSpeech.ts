"use client";

import { useCallback, useRef, useState } from "react";
import type { SpeechLang } from "@/lib/types";

export interface Speech {
  /** Speaks the text and resolves when playback ends. */
  speak: (text: string, lang: SpeechLang) => Promise<void>;
  /** Speaks a feed/journal item while tracking which id is playing. */
  play: (id: string, text: string, lang: SpeechLang) => Promise<void>;
  stop: () => void;
  playingId: string | null;
}

/**
 * Sarvam Bulbul audio from /api/voice/tts, with the browser voice as a
 * fallback so the demo never goes silent (including when no key is set).
 */
export function useSpeech(): Speech {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speakWithBrowser = useCallback((text: string, lang: SpeechLang) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.94;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch {
      return false;
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speak = useCallback(
    async (text: string, lang: SpeechLang) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      stop();

      try {
        const res = await fetch("/api/voice/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmed, lang }),
        });
        if (!res.ok) throw new Error(`tts ${res.status}`);

        const url = URL.createObjectURL(await res.blob());
        const audio = new Audio(url);
        audioRef.current = audio;
        try {
          await audio.play();
        } catch {
          URL.revokeObjectURL(url);
          throw new Error("playback blocked");
        }

        await new Promise<void>((resolve) => {
          audio.onended = () => resolve();
          audio.onerror = () => resolve();
        });
        URL.revokeObjectURL(url);
        if (audioRef.current === audio) audioRef.current = null;
      } catch {
        if (!speakWithBrowser(trimmed, lang)) return;
        await new Promise((resolve) =>
          setTimeout(resolve, Math.min(14_000, Math.max(2_200, trimmed.length * 85))),
        );
      }
    },
    [speakWithBrowser, stop],
  );

  const play = useCallback(
    async (id: string, text: string, lang: SpeechLang) => {
      setPlayingId(id);
      await speak(text, lang);
      setPlayingId((current) => (current === id ? null : current));
    },
    [speak],
  );

  return { speak, play, stop, playingId };
}

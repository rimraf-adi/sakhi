import { interpolate, useCurrentFrame } from "remotion";
import { SANS } from "./ScreenChrome";

interface CaptionCue {
  startSec: number;
  endSec: number;
  text: string;
}

const CAPTION_CUES: CaptionCue[] = [
  {
    startSec: 0.0,
    endSec: 6.0,
    text: "Between monthly hospital visits, a pregnant mother should never have to guess at 11 PM.",
  },
  {
    startSec: 6.0,
    endSec: 14.0,
    text: "When worried at night, searching online or reading forwarded messages often brings scary, misleading information.",
  },
  {
    startSec: 14.0,
    endSec: 22.5,
    text: "Sakhi is a warm, voice-first companion built to give safe, accurate guidance and settle anxiety right away.",
  },
  {
    startSec: 22.5,
    endSec: 35.0,
    text: "In 60 seconds at her hospital desk, a nurse enters her pregnancy week, language, check-up date, health professional, and family contact.",
  },
  {
    startSec: 35.0,
    endSec: 39.0,
    text: "The mother never fills out a form or sets a password.",
  },
  {
    startSec: 39.0,
    endSec: 49.0,
    text: "At 11:14 PM at home, a mother in her eighth month has had a headache for two days and her feet feel swollen.",
  },
  {
    startSec: 49.0,
    endSec: 64.0,
    text: "Instead of panicking over search results, she speaks in her own language. Sakhi's calm voice asks one gentle question: has her vision felt blurred since morning?",
  },
  {
    startSec: 64.0,
    endSec: 78.0,
    text: "She says yes. Engineered strictly around Ministry of Health rules and her hospital record, Sakhi never gives misleading advice, never guesses, and never prescribes medicine.",
  },
  {
    startSec: 78.0,
    endSec: 90.0,
    text: "It respects her autonomy and asks permission first: should I alert your health professional and partner now? With one confirmation, her care team is notified within minutes.",
  },
  {
    startSec: 90.0,
    endSec: 109.0,
    text: "After she finishes speaking, her personal health journal quietly saves every symptom, check-in, and 8 PM iron reminder, even on weak mobile networks.",
  },
  {
    startSec: 109.0,
    endSec: 125.0,
    text: "Inside Sakhi's closed circle, experienced women share short, comforting voice notes and everyday wisdom, moderated without misleading medical claims.",
  },
  {
    startSec: 125.0,
    endSec: 137.0,
    text: "Before her next appointment, her doctor opens one clear pre-visit timeline from her journal, backed by a full hospital safety audit with zero missed danger signs.",
  },
  {
    startSec: 137.0,
    endSec: 145.0,
    text: "Alert when urgent. Save her journal. Connect with trusted wisdom. Summarize for her doctor.",
  },
  {
    startSec: 145.0,
    endSec: 156.5,
    text: "Moving maternal care from weeks of waiting to minutes of action. Sakhi. She speaks, Sakhi listens, and acts.",
  },
];

export function CaptionOverlay() {
  const frame = useCurrentFrame();
  const fps = 30;

  const active = CAPTION_CUES.find((c) => {
    const startF = Math.round(c.startSec * fps);
    const endF = Math.round(c.endSec * fps);
    return frame >= startF && frame < endF;
  });

  if (!active) return null;

  const startF = Math.round(active.startSec * fps);
  const endF = Math.round(active.endSec * fps);
  const opacity = interpolate(
    frame,
    [startF, startF + 6, endF - 6, endF],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        position: "absolute",
        bottom: 54,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 90,
        opacity,
        backgroundColor: "rgba(15, 24, 26, 0.92)",
        border: "1px solid rgba(255, 255, 255, 0.16)",
        borderRadius: 16,
        padding: "14px 32px",
        maxWidth: 1420,
        fontFamily: SANS,
        fontSize: 31,
        fontWeight: 600,
        lineHeight: 1.32,
        color: "#FAF6EE",
        textAlign: "center",
        boxShadow: "0 14px 36px rgba(0, 0, 0, 0.3)",
        pointerEvents: "none",
      }}
    >
      {active.text}
    </div>
  );
}

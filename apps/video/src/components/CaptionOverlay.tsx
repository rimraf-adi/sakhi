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
    endSec: 5.5,
    text: "Between monthly hospital visits, a pregnant mother should never have to guess at 11 PM.",
  },
  {
    startSec: 5.5,
    endSec: 13.5,
    text: "When worried at night, searching online or reading forwarded messages often brings scary, misleading information.",
  },
  {
    startSec: 13.5,
    endSec: 21.0,
    text: "Sakhi is a warm, voice-first companion built to give safe, accurate guidance and settle anxiety right away.",
  },
  {
    startSec: 21.0,
    endSec: 34.0,
    text: "In 60 seconds at her hospital desk, a nurse enters her pregnancy week, language, check-up date, health professional, and family contact.",
  },
  {
    startSec: 34.0,
    endSec: 40.0,
    text: "The mother never fills out a form, never sets a password, and never sees a complicated menu.",
  },
  {
    startSec: 40.0,
    endSec: 49.0,
    text: "At 11:14 PM at home, a mother in her eighth month has had a headache for two days and her feet feel swollen.",
  },
  {
    startSec: 49.0,
    endSec: 63.0,
    text: "Instead of panicking over search results, she speaks in Hindi. Sakhi's calm voice asks one gentle question: has her vision felt blurred since morning?",
  },
  {
    startSec: 63.0,
    endSec: 76.0,
    text: "She says yes. Engineered strictly around Ministry of Health rules, Sakhi never gives misleading advice, never guesses, and never prescribes medicine.",
  },
  {
    startSec: 76.0,
    endSec: 84.5,
    text: "Instead, it respects her autonomy and asks permission first: should I alert your health professional and partner now?",
  },
  {
    startSec: 84.5,
    endSec: 92.0,
    text: "With one confirmation, her health professional, her partner, and the hospital care team are notified within minutes.",
  },
  {
    startSec: 92.0,
    endSec: 105.0,
    text: "Whether in a city or a village, if a mother speaking Marathi feels unsure about her baby's movement, Sakhi connects her with care right away.",
  },
  {
    startSec: 105.0,
    endSec: 117.0,
    text: "When another mother misses an iron tablet with no danger signs, Sakhi reassures her warmly, sets an 8 PM reminder, and saves it to her health journal.",
  },
  {
    startSec: 117.0,
    endSec: 124.0,
    text: "In a busy 5-minute clinic session, patients easily forget symptoms or dates from weeks earlier.",
  },
  {
    startSec: 124.0,
    endSec: 136.0,
    text: "Sakhi keeps a complete journal of every check-in intact, giving her doctor one clear timeline verified by a full hospital safety audit.",
  },
  {
    startSec: 136.0,
    endSec: 143.0,
    text: "Alert when urgent. Save her health journal. Remind gently. Summarize for her doctor.",
  },
  {
    startSec: 143.0,
    endSec: 153.5,
    text: "Moving maternal care from weeks of waiting to minutes of action. Sakhi. She speaks. Sakhi listens, and acts.",
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

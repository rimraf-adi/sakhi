import { useCurrentFrame } from "remotion";
import { WifiOff } from "lucide-react";
import { PhoneFrame, SANS, SERIF } from "../components/ScreenChrome";

function CompactAcousticField({
  frame,
  color,
  energy,
}: {
  frame: number;
  color: string;
  energy: number;
}) {
  const width = 340;
  const height = 84;
  const midY = height * 0.52;
  const bands = 42;
  const step = width / bands;
  const center = (bands - 1) / 2;
  const phase = frame * 0.12;

  const pts: string[] = [];
  for (let x = 0; x <= width; x += 4) {
    const taper = Math.sin((x / width) * Math.PI);
    const y =
      midY +
      Math.sin(x * 0.024 + phase) *
        Math.cos(x * 0.011 - phase * 0.5) *
        18 *
        energy *
        taper;
    pts.push(`${x === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      {Array.from({ length: bands }).map((_, i) => {
        const dist = Math.abs(i - center) / center;
        const win = Math.pow(Math.max(0.05, 1 - dist * 0.9), 1.5);
        const mod = 0.5 + 0.3 * Math.sin(phase * 1.7 + i * 0.38);
        const bh = Math.max(3, Math.min(0.95, win * mod * energy) * (height * 0.68));
        const x = i * step + step * 0.5;
        return (
          <line
            key={i}
            x1={x}
            y1={midY - bh / 2}
            x2={x}
            y2={midY + bh / 2}
            stroke={color}
            strokeOpacity={0.36}
            strokeWidth={1.3}
          />
        );
      })}
      <path d={pts.join(" ")} stroke={color} strokeWidth={2} fill="none" />
    </svg>
  );
}

export function Scene4MobileEdgeCases() {
  const frame = useCurrentFrame();

  // 0-450: Sunita · Marathi · Escalate on Doubt (with consent)
  // 450-660: Kavita · Hindi · Missed Iron Tablet -> Saved & Reminded
  // 660-780: Offline Network Fallback
  const mode = frame < 360 ? "doubt" : frame < 600 ? "mild" : "offline";

  const glowColor =
    mode === "doubt"
      ? "rgba(224,98,70,0.34)"
      : mode === "mild"
        ? "rgba(88,185,142,0.28)"
        : "rgba(142,163,156,0.22)";

  const waveColor =
    mode === "doubt" ? "#E06246" : mode === "mild" ? "#58B98E" : "#8EA39C";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#FAF6EE",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 110,
        padding: "0 120px",
        fontFamily: SANS,
      }}
    >
      {/* Left Context Panel */}
      <div style={{ width: 580, color: "#132623" }}>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.18em",
            color: "#9C5A3C",
            textTransform: "uppercase",
          }}
        >
          SAFETY GUARDRAILS · EVERY CONDITION
        </p>
        <h2
          style={{
            margin: "12px 0 0",
            fontFamily: SERIF,
            fontSize: 48,
            lineHeight: 1.1,
            fontWeight: 700,
          }}
        >
          {mode === "doubt"
            ? "Never guesses. Escalates on doubt."
            : mode === "mild"
              ? "Routine updates saved gently."
              : "Works on low-signal mobile networks."}
        </h2>
        <p style={{ marginTop: 18, fontSize: 19, lineHeight: 1.5, color: "#4A5A55" }}>
          {mode === "doubt"
            ? "Even when Sunita is unsure in Marathi about reduced baby movement, Sakhi asks warmly and connects her with her health professional and clinic."
            : mode === "mild"
              ? "When Kavita misses an iron tablet with no danger signs, Sakhi reassures her, notes it for her doctor, and sets an 8 PM reminder."
              : "When mobile data drops mid-sentence, Sakhi saves the voice note locally and syncs automatically as soon as signal returns."}
        </p>

        <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
          {[
            { id: "doubt", label: "Escalate on Doubt" },
            { id: "mild", label: "Save & Remind" },
            { id: "offline", label: "Offline Fallback" },
          ].map((tab) => {
            const active = tab.id === mode;
            return (
              <div
                key={tab.id}
                style={{
                  padding: "10px 18px",
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 600,
                  backgroundColor: active ? "#132623" : "#EFE6D5",
                  color: active ? "#FAF6EE" : "#132623",
                }}
              >
                {tab.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Voice-Native Bedside Phone */}
      <PhoneFrame nightMode time={mode === "doubt" ? "10:42 PM" : mode === "mild" ? "8:10 PM" : "7:30 PM"} offline={mode === "offline"}>
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#0B1715",
            color: "#FAF6EE",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: 80,
              left: "50%",
              transform: "translateX(-50%)",
              width: 290,
              height: 240,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${glowColor} 0%, transparent 74%)`,
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              padding: "16px 24px 10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "relative",
              zIndex: 2,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 500, color: "#C8D3CF" }}>
              {mode === "doubt"
                ? "Sunita · Week 35"
                : mode === "mild"
                  ? "Kavita · Week 26"
                  : "Priya · Week 32"}
            </span>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#8EA39C" }}>
              {mode === "doubt" ? "Marathi" : mode === "mild" ? "Hindi" : "Offline"}
            </span>
          </div>

          <div
            style={{
              flex: 1,
              padding: "20px 24px 10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              gap: 18,
              position: "relative",
              zIndex: 2,
            }}
          >
            {mode === "doubt" ? (
              <>
                <div style={{ opacity: 0.42 }}>
                  <div style={{ fontFamily: SERIF, fontSize: 15, color: "#C8D3CF", lineHeight: 1.4 }}>
                    &ldquo;Aaj baalachi halchal thodi kami vatat aahe, pan mala nakki mahit nahi.&rdquo;
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 99, backgroundColor: "#E06246" }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#E06246" }}>Sakhi</span>
                  </div>
                  <div style={{ fontFamily: SERIF, fontSize: 20, lineHeight: 1.36, color: "#FAF6EE" }}>
                    Sunita tai, kalji karu naka. Shanka ahe mhanun me tumchya health professional aani hospital la mahiti pathavli ahe.
                  </div>
                </div>
              </>
            ) : mode === "mild" ? (
              <>
                <div style={{ opacity: 0.42 }}>
                  <div style={{ fontFamily: SERIF, fontSize: 15, color: "#C8D3CF", lineHeight: 1.4 }}>
                    &ldquo;Kal raat iron ki goli lena bhool gayi, aur thodi thakan lag rahi hai.&rdquo;
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 99, backgroundColor: "#58B98E" }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#58B98E" }}>Sakhi</span>
                  </div>
                  <div style={{ fontFamily: SERIF, fontSize: 20, lineHeight: 1.36, color: "#FAF6EE" }}>
                    Koi baat nahi Kavita. Maine doctor ke liye note kar liya hai, aur kal shaam 8 baje yaad dila dungi.
                  </div>
                </div>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <WifiOff size={28} color="#EAB685" />
                <div style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.35, color: "#FAF6EE" }}>
                  Network kamzor hai, par aapki baat surakshit save ho gayi hai.
                </div>
              </div>
            )}
          </div>

          <div style={{ position: "relative", zIndex: 2 }}>
            <CompactAcousticField
              frame={frame}
              color={waveColor}
              energy={mode === "offline" ? 0.25 : mode === "mild" ? 0.42 : 0.92}
            />
          </div>

          <div style={{ padding: "6px 20px 22px", position: "relative", zIndex: 2 }}>
            <div
              style={{
                borderRadius: 14,
                border:
                  mode === "doubt"
                    ? "1px solid rgba(224,98,70,0.38)"
                    : mode === "mild"
                      ? "1px solid rgba(88,185,142,0.32)"
                      : "1px solid rgba(255,255,255,0.14)",
                backgroundColor:
                  mode === "doubt"
                    ? "rgba(224,98,70,0.14)"
                    : mode === "mild"
                      ? "rgba(88,185,142,0.12)"
                      : "rgba(255,255,255,0.05)",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 500, color: "#FAF6EE" }}>
                {mode === "doubt"
                  ? "Care team & Hospital alerted"
                  : mode === "mild"
                    ? "Saved for 24 Nov · 8 PM reminder"
                    : "Saved locally · Syncs on signal"}
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, color: waveColor }}>
                {mode === "doubt" ? "Care sent" : mode === "mild" ? "Saved" : "Queued"}
              </span>
            </div>
          </div>
        </div>
      </PhoneFrame>
    </div>
  );
}

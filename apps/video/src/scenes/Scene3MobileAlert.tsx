import { useCurrentFrame } from "remotion";
import { PhoneFrame, SANS, SERIF } from "../components/ScreenChrome";

type AcousticMode = "priya" | "sakhi" | "urgent";

function LivingAcousticField({
  frame,
  mode,
}: {
  frame: number;
  mode: AcousticMode;
}) {
  const width = 340;
  const height = 104;
  const midY = height * 0.54;
  const bands = 48;
  const step = width / bands;
  const center = (bands - 1) / 2;
  const phase = frame * 0.14;
  const energy = mode === "urgent" ? 1.05 : 0.9;

  const palette =
    mode === "urgent"
      ? {
          bar: "rgba(224,98,70,0.44)",
          r1: "rgba(224,98,70,0.88)",
          r2: "rgba(246,173,148,0.48)",
          r3: "rgba(224,98,70,0.22)",
        }
      : mode === "sakhi"
        ? {
            bar: "rgba(127,209,174,0.38)",
            r1: "rgba(127,209,174,0.9)",
            r2: "rgba(234,182,133,0.45)",
            r3: "rgba(127,209,174,0.2)",
          }
        : {
            bar: "rgba(234,182,133,0.38)",
            r1: "rgba(234,182,133,0.92)",
            r2: "rgba(255,224,188,0.48)",
            r3: "rgba(234,182,133,0.2)",
          };

  const buildRibbonPath = (amp: number, freq: number, spd: number) => {
    const pts: string[] = [];
    for (let x = 0; x <= width; x += 4) {
      const taper = Math.sin((x / width) * Math.PI);
      const y =
        midY +
        Math.sin(x * freq + phase * spd) *
          Math.cos(x * 0.011 - phase * 0.5) *
          amp *
          taper;
      pts.push(`${x === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(" ");
  };

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      {Array.from({ length: bands }).map((_, i) => {
        const dist = Math.abs(i - center) / center;
        const win = Math.pow(Math.max(0.05, 1 - dist * 0.9), 1.5);
        const mod =
          0.48 +
          0.32 * Math.sin(phase * 1.8 + i * 0.35) +
          0.2 * Math.cos(phase * 2.9 - i * 0.6);
        const val = Math.min(0.95, win * mod * energy);
        const bh = Math.max(4, val * (height * 0.72));
        const x = i * step + step * 0.5;
        return (
          <line
            key={i}
            x1={x}
            y1={midY - bh / 2}
            x2={x}
            y2={midY + bh / 2}
            stroke={palette.bar}
            strokeWidth={1.4}
          />
        );
      })}
      <path d={buildRibbonPath(23 * energy, 0.022, 1.0)} stroke={palette.r1} strokeWidth={2.1} fill="none" />
      <path d={buildRibbonPath(16 * energy, 0.031, -1.35)} stroke={palette.r2} strokeWidth={1.4} fill="none" />
      <path d={buildRibbonPath(11 * energy, 0.017, 0.7)} stroke={palette.r3} strokeWidth={1.1} fill="none" />
    </svg>
  );
}

export function Scene3MobileAlert() {
  const frame = useCurrentFrame();

  // 0-330: Step 1 Mother speaks
  // 330-720: Step 2 Sakhi asks warmly + Mother replies
  // 720-1230: Step 3 Sakhi asks permission (cursor taps Haan, bhej do at f=1200)
  // 1230-1560: Step 4 Care team alerted after consent
  const step = frame < 330 ? 1 : frame < 720 ? 2 : frame < 1230 ? 3 : 4;
  const showConsent = step === 3;
  const consentConfirmed = frame >= 1205;

  const acousticMode: AcousticMode =
    step === 4 ? "urgent" : step === 2 || step === 3 ? "sakhi" : "priya";

  const glowColor =
    step === 4
      ? "rgba(224,98,70,0.36)"
      : step === 2 || step === 3
        ? "rgba(127,209,174,0.28)"
        : "rgba(234,182,133,0.32)";

  const chapters = [
    {
      num: "01",
      title: "She Speaks Naturally",
      desc: "Zero typing, zero chat boxes. Priya speaks naturally in Hindi at 11 PM.",
    },
    {
      num: "02",
      title: "Warm, Stage-Aware Check",
      desc: "Sakhi responds warmly and asks one focused question about blurred vision.",
    },
    {
      num: "03",
      title: "Autonomy & Consent First",
      desc: "Sakhi asks Priya before alerting anyone. Priya confirms with voice or one tap.",
    },
    {
      num: "04",
      title: "Care Team Notified",
      desc: "Meena Devi, Rohit, and the hospital OPD receive the alert within minutes.",
    },
  ];

  const captions = [
    {
      isSakhi: false,
      text: '"Kal raat iron ki goli lena bhool gayi, aur thakan lag rahi hai."',
      visibleFrom: 0,
    },
    {
      isSakhi: true,
      dotColor: "#58B98E",
      text: "Maine note kar liya hai Priya. Kal shaam 8 baje yaad dila dungi.",
      visibleFrom: 0,
    },
    {
      isSakhi: false,
      text: '"Do din se sar dard hai aur pair sujhe hue hain."',
      visibleFrom: 0,
    },
    {
      isSakhi: true,
      dotColor: "#7FD1AE",
      text: '"Priya, chinta mat karo, main yahin hoon. Bas ek baat batao, kya subah se aankhon ke aage thoda dhundhla lag raha hai?"',
      visibleFrom: 330,
    },
    {
      isSakhi: false,
      text: '"Haan, subah se thoda dhundhla lag raha hai."',
      visibleFrom: 630,
    },
    {
      isSakhi: true,
      dotColor: "#EAB685",
      text: '"Priya, sar dard aur dhundhla dikhna aaj raat hospital mein dikhana zaroori hai. Kya main Meena didi aur Rohit ko abhi khabar bhej doon?"',
      visibleFrom: 720,
    },
    {
      isSakhi: false,
      text: '"Haan, bhej do."',
      visibleFrom: 1205,
    },
    {
      isSakhi: true,
      dotColor: "#E06246",
      text: "Maine Meena didi aur Rohit ko bata diya hai. Aap bas aaram se baithiye, hum sab saath hain.",
      visibleFrom: 1230,
    },
  ].filter((c) => frame >= c.visibleFrom);

  const visibleCaptions = captions.slice(-4);

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
        position: "relative",
      }}
    >
      {/* Left Context Storyboard */}
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
          11 PM VOICE-NATIVE CARE FLOW
        </p>
        <h2
          style={{
            margin: "12px 0 0",
            fontFamily: SERIF,
            fontSize: 48,
            lineHeight: 1.1,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          She speaks. Sakhi asks first, then acts.
        </h2>

        <div style={{ marginTop: 34, display: "flex", flexDirection: "column", gap: 14 }}>
          {chapters.map((c, idx) => {
            const active = idx + 1 === step;
            return (
              <div
                key={c.num}
                style={{
                  padding: "16px 20px",
                  borderRadius: 16,
                  backgroundColor: active ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                  border: active
                    ? "1.5px solid #132623"
                    : "1px solid rgba(19,38,35,0.08)",
                  opacity: idx + 1 <= step ? 1 : 0.45,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: active ? "#C93B2B" : "#5A6D67",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {c.num}
                  </span>
                  <span style={{ fontSize: 17, fontWeight: 700 }}>{c.title}</span>
                </div>
                <p style={{ margin: "6px 0 0 28px", fontSize: 14, color: "#5A6D67", lineHeight: 1.45 }}>
                  {c.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Voice-Native Bedside Phone */}
      <PhoneFrame nightMode time="11:14 PM">
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
          {/* Ambient Glow */}
          <div
            style={{
              position: "absolute",
              bottom: 90,
              left: "50%",
              transform: "translateX(-50%)",
              width: 300,
              height: 260,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${glowColor} 0%, rgba(234,182,133,0.04) 55%, transparent 76%)`,
              pointerEvents: "none",
            }}
          />

          {/* Whisper-Quiet Header */}
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
              Priya · Week 32
            </span>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#8EA39C" }}>Hindi</span>
          </div>

          {/* Receding Voice Caption Stream (Sakhi-only labels, zero chat bubbles) */}
          <div
            style={{
              flex: 1,
              padding: "16px 24px 8px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              gap: 18,
              position: "relative",
              zIndex: 2,
              overflow: "hidden",
            }}
          >
            {visibleCaptions.map((item, idx) => {
              const isCurrent = idx === visibleCaptions.length - 1;
              const opacity = isCurrent ? 1 : idx === visibleCaptions.length - 2 ? 0.42 : 0.2;
              return (
                <div key={item.text} style={{ opacity }}>
                  {item.isSakhi ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 99,
                          backgroundColor: item.dotColor,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: isCurrent ? item.dotColor : "#9EB0AA",
                        }}
                      >
                        Sakhi
                      </span>
                    </div>
                  ) : null}
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontSize: isCurrent ? 21 : 14.5,
                      lineHeight: 1.35,
                      color: isCurrent ? "#FAF6EE" : "#C8D3CF",
                    }}
                  >
                    {item.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Living Acoustic Field */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <LivingAcousticField frame={frame} mode={acousticMode} />
          </div>

          {/* Bottom Autonomy Consent or Care Confirmation */}
          <div style={{ padding: "6px 20px 22px", position: "relative", zIndex: 2 }}>
            {showConsent ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div
                  style={{
                    padding: "11px 12px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.16)",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    textAlign: "center",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#C8D3CF",
                  }}
                >
                  Abhi nahi
                </div>
                <div
                  style={{
                    padding: "11px 12px",
                    borderRadius: 12,
                    backgroundColor: consentConfirmed ? "#E06246" : "#D96B4F",
                    textAlign: "center",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#FAF6EE",
                    transform: consentConfirmed ? "scale(0.97)" : "scale(1)",
                  }}
                >
                  Haan, bhej do
                </div>
              </div>
            ) : step === 4 ? (
              <div
                style={{
                  borderRadius: 14,
                  border: "1px solid rgba(224,98,70,0.38)",
                  backgroundColor: "rgba(224,98,70,0.14)",
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 99,
                      backgroundColor: "#E06246",
                    }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#FAF6EE" }}>
                    Meena Devi · Rohit · Hospital notified
                  </span>
                </div>
                <span style={{ fontSize: 11, color: "#F6AD94", fontWeight: 600 }}>
                  Care sent
                </span>
              </div>
            ) : (
              <div
                style={{
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 99,
                    backgroundColor: step === 2 ? "#7FD1AE" : "#EAB685",
                  }}
                />
                <span style={{ fontSize: 12, fontWeight: 500, color: "#8EA39C" }}>
                  {step === 2 ? "Sakhi" : "Listening"}
                </span>
              </div>
            )}
          </div>
        </div>
      </PhoneFrame>
    </div>
  );
}

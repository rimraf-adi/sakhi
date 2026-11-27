import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ArrowDown, ArrowRight, ShieldCheck } from "lucide-react";
import { AnimatedCursor, BrowserFrame, SERIF } from "../components/ScreenChrome";

const STATS = [
  {
    prefix: "~",
    target: 23,
    decimals: 0,
    suffix: "M",
    label: "Births in India every year",
    detail: "Across cities, towns, and villages",
  },
  {
    prefix: "~",
    target: 8,
    decimals: 0,
    suffix: "M",
    label: "Miss 4 antenatal check-ups",
    detail: "1 in 3 mothers (NFHS-6) face silent gaps",
  },
  {
    prefix: "",
    target: 54.9,
    decimals: 1,
    suffix: "%",
    label: "Take iron tablets for 100 days",
    detail: "Only 37.8% reach 180 days",
  },
  {
    prefix: "",
    target: 10.6,
    decimals: 1,
    suffix: "%",
    label: "Speak English in India",
    detail: "Forms and text chats exclude most mothers",
  },
];

function useRevealStyle(frame: number, fps: number, delay: number) {
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 140, mass: 0.9 },
  });
  return {
    opacity: interpolate(progress, [0, 1], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    transform: `translateY(${interpolate(progress, [0, 1], [22, 0])}px)`,
  };
}

export function Scene1Landing() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Browser entrance zoom + fade
  const browserSpring = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 120 },
  });
  const browserScale = interpolate(browserSpring, [0, 1], [0.975, 1]);
  const browserOpacity = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Staggered hero element reveals
  const headerStyle = useRevealStyle(frame, fps, 0);
  const eyebrowStyle = useRevealStyle(frame, fps, 8);
  const h1Style = useRevealStyle(frame, fps, 15);
  const copyStyle = useRevealStyle(frame, fps, 24);
  const ctaStyle = useRevealStyle(frame, fps, 32);
  const artCardStyle = useRevealStyle(frame, fps, 14);
  const sageTileStyle = useRevealStyle(frame, fps, 28);
  const creamTileStyle = useRevealStyle(frame, fps, 38);

  // Subtle Ken-Burns zoom on the veranda illustration
  const artScale = interpolate(frame, [0, 240], [1, 1.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Smooth eased browser scroll down to NFHS-6 stats & 11 PM gap
  const scrollY = interpolate(frame, [75, 185], [0, 560], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Thesis reveal + warm amber highlight sweep
  const thesisStyle = useRevealStyle(frame, fps, 265);
  const highlightSweep = interpolate(frame, [305, 360], [0, 100], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cursorX = interpolate(frame, [0, 75, 190, 320], [1140, 1280, 960, 1080], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorY = interpolate(frame, [0, 75, 190, 320], [320, 440, 590, 650], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#EFE8DA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          transform: `scale(${browserScale})`,
          opacity: browserOpacity,
        }}
      >
        <BrowserFrame url="localhost:3000">
          <div
            style={{
              transform: `translateY(${-scrollY}px)`,
              padding: "28px 96px 80px",
              backgroundColor: "#F7F4ED",
              color: "#0F181A",
            }}
          >
            {/* Header */}
            <div
              style={{
                ...headerStyle,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: 32,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #F3C9AC, #D58E6D)",
                  }}
                />
                <span
                  style={{
                    fontFamily: SERIF,
                    fontSize: 26,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Sakhi
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
                <span style={{ fontSize: 15, fontWeight: 500, color: "#2A3332" }}>
                  Between Visits
                </span>
                <span style={{ fontSize: 15, fontWeight: 500, color: "#2A3332" }}>
                  4 Actions
                </span>
                <span style={{ fontSize: 15, fontWeight: 500, color: "#2A3332" }}>
                  Privacy
                </span>
                <div
                  style={{
                    backgroundColor: "#D58E6D",
                    color: "#FFFFFF",
                    borderRadius: 999,
                    padding: "10px 20px",
                    fontSize: 14,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span>Get Sakhi</span>
                  <ArrowRight size={15} />
                </div>
              </div>
            </div>

            {/* Hero Split */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 54,
                alignItems: "center",
                paddingBottom: 72,
              }}
            >
              <div>
                <p
                  style={{
                    ...eyebrowStyle,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    color: "#9C5A3C",
                    textTransform: "uppercase",
                    margin: 0,
                  }}
                >
                  VOICE-FIRST MATERNAL CARE · ANDROID &amp; IOS
                </p>
                <h1
                  style={{
                    ...h1Style,
                    fontFamily: SERIF,
                    fontSize: 64,
                    lineHeight: 1.05,
                    fontWeight: 700,
                    margin: "16px 0 0",
                    letterSpacing: "-0.02em",
                  }}
                >
                  She speaks.
                  <br />
                  Sakhi listens and acts.
                </h1>
                <p
                  style={{
                    ...copyStyle,
                    marginTop: 22,
                    fontSize: 19,
                    lineHeight: 1.55,
                    color: "#3A4745",
                    maxWidth: 500,
                  }}
                >
                  Between check-ups, you should not have to guess at 11 PM. Registered by
                  your hospital, Sakhi listens in her own language and alerts her partner
                  and care team within minutes.
                </p>

                <div style={{ ...ctaStyle, display: "flex", gap: 14, marginTop: 30 }}>
                  <div
                    style={{
                      backgroundColor: "#D58E6D",
                      color: "#FFFFFF",
                      borderRadius: 999,
                      padding: "14px 26px",
                      fontSize: 15,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span>Get Sakhi</span>
                    <ArrowRight size={16} />
                  </div>
                  <div
                    style={{
                      border: "1px solid rgba(15,24,26,0.35)",
                      borderRadius: 999,
                      padding: "14px 26px",
                      fontSize: 15,
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span>See How It Works</span>
                    <ArrowDown size={16} />
                  </div>
                </div>
              </div>

              {/* Right Bento Column */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div
                  style={{
                    ...artCardStyle,
                    borderRadius: 24,
                    overflow: "hidden",
                    border: "1px solid rgba(15,24,26,0.08)",
                    height: 410,
                  }}
                >
                  <Img
                    src={staticFile("hero-bento-editorial.jpg")}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transform: `scale(${artScale})`,
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      ...sageTileStyle,
                      borderRadius: 20,
                      backgroundColor: "#A7CBB5",
                      padding: 20,
                      color: "#132C22",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.45, fontWeight: 500 }}>
                      Guided strictly by her pregnancy week, hospital visit dates, and{" "}
                      <strong>Ministry of Health danger-sign rules.</strong>
                    </p>
                    <div
                      style={{
                        marginTop: 18,
                        paddingTop: 12,
                        borderTop: "1px solid rgba(19,44,34,0.16)",
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <ShieldCheck size={14} /> Reviewed by Doctors
                      </span>
                      <span style={{ opacity: 0.75 }}>Never Diagnoses</span>
                    </div>
                  </div>

                  <div
                    style={{
                      ...creamTileStyle,
                      borderRadius: 20,
                      backgroundColor: "#EDE6D6",
                      padding: 20,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontFamily: SERIF,
                          fontSize: 18,
                          fontWeight: 700,
                        }}
                      >
                        Every home. Every language.
                      </p>
                      <p
                        style={{
                          margin: "10px 0 0",
                          fontSize: 13,
                          color: "#536360",
                          fontWeight: 500,
                        }}
                      >
                        नमस्ते · नमस्कार · வணக்கம் · ನಮಸ್ಕಾರ · নমস্কার
                      </p>
                    </div>
                    <p
                      style={{
                        margin: "18px 0 0",
                        paddingTop: 12,
                        borderTop: "1px solid rgba(15,24,26,0.12)",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#536360",
                      }}
                    >
                      Zero typing. Zero menus. Android &amp; iOS.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: National Scale Numbers (Incremental Count-Up) */}
            <div
              style={{
                borderTop: "1px solid rgba(15,24,26,0.12)",
                paddingTop: 52,
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  color: "#536360",
                  textTransform: "uppercase",
                  margin: "0 0 32px",
                }}
              >
                ACROSS INDIA, MILLIONS OF FAMILIES NAVIGATE THESE EXACT GAPS
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 32,
                }}
              >
                {STATS.map((s, idx) => {
                  const startFrame = 115 + idx * 30;
                  const statStyle = useRevealStyle(frame, fps, startFrame);
                  const countProgress = interpolate(
                    frame,
                    [startFrame, startFrame + 32],
                    [0, 1],
                    {
                      easing: Easing.out(Easing.cubic),
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    },
                  );
                  const currentVal = (s.target * countProgress).toFixed(s.decimals);
                  return (
                    <div
                      key={s.label}
                      style={{
                        ...statStyle,
                        borderLeft: idx > 0 ? "1px solid rgba(15,24,26,0.12)" : "none",
                        paddingLeft: idx > 0 ? 32 : 0,
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontFamily: SERIF,
                          fontSize: 58,
                          fontWeight: 700,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {s.prefix}
                        {currentVal}
                        {s.suffix}
                      </p>
                      <p
                        style={{
                          margin: "12px 0 0",
                          fontSize: 16,
                          fontWeight: 600,
                        }}
                      >
                        {s.label}
                      </p>
                      <p
                        style={{
                          margin: "6px 0 0",
                          fontSize: 14,
                          lineHeight: 1.5,
                          color: "#536360",
                        }}
                      >
                        {s.detail}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  ...thesisStyle,
                  marginTop: 54,
                  paddingTop: 40,
                  borderTop: "1px solid rgba(15,24,26,0.1)",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontFamily: SERIF,
                    fontSize: 28,
                    lineHeight: 1.45,
                    maxWidth: 920,
                    margin: "0 auto",
                  }}
                >
                  When a warning sign begins at 11 PM between visits, Sakhi shrinks{" "}
                  <span
                    style={{
                      color: "#D97745",
                      backgroundImage:
                        "linear-gradient(120deg, rgba(246,196,120,0.34), rgba(217,119,69,0.2))",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: `${highlightSweep}% 38%`,
                      backgroundPosition: "0 88%",
                      padding: "0 4px",
                    }}
                  >
                    the delay between a warning sign and care
                  </span>{" "}
                  from weeks to minutes.
                </p>
              </div>
            </div>
          </div>

          <AnimatedCursor x={cursorX} y={cursorY} />
        </BrowserFrame>
      </div>
    </div>
  );
}

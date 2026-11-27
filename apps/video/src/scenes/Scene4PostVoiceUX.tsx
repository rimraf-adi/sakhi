import React from "react";
import {
  BookOpen,
  CheckCircle2,
  Heart,
  Lock,
  MessageCircle,
  Mic,
  Send,
  ShieldCheck,
  Users,
  Volume2,
} from "lucide-react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PhoneFrame, SANS, SERIF } from "../components/ScreenChrome";

type ViewMode = "circle" | "journal";

const COPY: Record<
  ViewMode,
  {
    headline: string;
    body: string;
    time: string;
    tab: "feed" | "journal";
  }
> = {
  circle: {
    headline: "A closed circle of mothers, never strangers.",
    body: "Only hospital-enrolled pregnant women in the same trimester are in her circle. They share text and voice notes safely, without public-internet myths.",
    time: "8:15 AM",
    tab: "feed",
  },
  journal: {
    headline: "A visual journal built for her, not just forms.",
    body: "A clear Week 32 gestation arc, 14-day iron tablet dot calendar, BP trendline, and audio recap she can listen to before a busy 5-minute clinic.",
    time: "8:20 AM",
    tab: "journal",
  },
};

function VoiceNotePill({
  duration,
  lang,
  dark = false,
  frame,
}: {
  duration: string;
  lang?: string;
  dark?: boolean;
  frame: number;
}) {
  const heights = [6, 12, 18, 10, 16, 20, 13, 8, 17, 14, 9, 15, 19, 11, 7];
  return (
    <div
      style={{
        marginTop: 7,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        backgroundColor: dark ? "#0F4C3A" : "#EFE6D5",
        color: dark ? "#FAF6EE" : "#101828",
      }}
    >
      <Volume2 size={12} />
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        {heights.map((h, i) => {
          const pulse = 0.75 + 0.25 * Math.sin(frame * 0.14 + i * 0.7);
          return (
            <span
              key={i}
              style={{
                width: 2,
                height: Math.round(h * pulse),
                borderRadius: 2,
                backgroundColor: dark ? "#A7F3D0" : "#9C5A3C",
                display: "inline-block",
              }}
            />
          );
        })}
      </div>
      <span style={{ fontSize: 10.5, fontWeight: 600 }}>
        {duration}
        {lang ? ` · ${lang}` : ""}
      </span>
    </div>
  );
}

export function Scene4PostVoiceUX() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mode: ViewMode = frame < 450 ? "circle" : "journal";
  const beatFrame = mode === "circle" ? frame : frame - 450;

  const enter = spring({
    frame: beatFrame,
    fps,
    config: { damping: 22, stiffness: 95 },
  });

  const beatFade = interpolate(beatFrame, [0, 12, 435, 450], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const copy = COPY[mode];

  // 14-day IFA dot calendar: 12 filled, 1 missed (index 5), 1 today (index 13)
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
    "today",
  ] as const;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#FAF6EE",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 120,
        padding: "0 130px 110px",
        boxSizing: "border-box",
        fontFamily: SANS,
      }}
    >
      {/* Left Editorial Column */}
      <div
        style={{
          width: 560,
          color: "#0F181A",
          opacity: beatFade,
          transform: `translateY(${(1 - enter) * 18}px)`,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontSize: 62,
            lineHeight: 1.08,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            color: "#0F181A",
          }}
        >
          {copy.headline}
        </h2>
        <p
          style={{
            marginTop: 24,
            fontSize: 22,
            lineHeight: 1.55,
            color: "#475467",
          }}
        >
          {copy.body}
        </p>

        <div
          style={{
            marginTop: 42,
            display: "flex",
            alignItems: "center",
            gap: 28,
            borderTop: "1px solid rgba(15, 24, 26, 0.12)",
            paddingTop: 20,
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          {[
            { id: "circle" as const, label: "01. Closed Peer Circle" },
            { id: "journal" as const, label: "02. Visual Pregnancy Journal" },
          ].map((item) => {
            const active = item.id === mode;
            return (
              <span
                key={item.id}
                style={{
                  color: active ? "#C8643B" : "#98A2B3",
                  borderBottom: active ? "2px solid #C8643B" : "2px solid transparent",
                  paddingBottom: 6,
                }}
              >
                {item.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Right Phone Screen */}
      <div
        style={{
          opacity: beatFade,
          transform: `translateY(${(1 - enter) * 14}px)`,
        }}
      >
        <PhoneFrame nightMode={false} time={copy.time}>
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#FAF6EE",
              color: "#101828",
            }}
          >
            {copy.tab === "feed" ? (
              <>
                {/* Threads/Twitter-style Header */}
                <div
                  style={{
                    padding: "10px 18px 9px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #EAE3D5",
                  }}
                >
                  <span style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: "#101828" }}>
                    Sakhi
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 10.5,
                      fontWeight: 600,
                      color: "#0F4C3A",
                    }}
                  >
                    <Lock size={10} />
                    Week 30-34 Circle · 24 mothers
                  </span>
                </div>

                {/* Subtle Post-Voice Care Strip */}
                <div
                  style={{
                    padding: "7px 18px",
                    borderBottom: "1px solid #EAE3D5",
                    backgroundColor: "#F5EFE4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 11,
                  }}
                >
                  <span style={{ fontWeight: 600, color: "#344054" }}>
                    Tonight 8:00 PM · Iron tablet reminder
                  </span>
                  <span style={{ fontWeight: 700, color: "#0F4C3A" }}>
                    Mark taken
                  </span>
                </div>

                {/* Composer Row (Text + Voice) */}
                <div
                  style={{
                    padding: "8px 18px",
                    borderBottom: "1px solid #EAE3D5",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      backgroundColor: "#C8643B",
                      color: "#FFFFFF",
                      fontSize: 11,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    P
                  </div>
                  <div
                    style={{
                      flex: 1,
                      fontSize: 11.5,
                      color: "#667085",
                    }}
                  >
                    Share text or voice with your circle...
                  </div>
                  <Mic size={14} color="#C8643B" />
                  <Send size={13} color="#101828" />
                </div>

                {/* Edge-to-Edge Threads Feed */}
                <div style={{ flex: 1, overflow: "hidden" }}>
                  {/* Thread 1: Anjali + Reply from Sunita */}
                  <div
                    style={{
                      padding: "11px 18px",
                      borderBottom: "1px solid #EAE3D5",
                    }}
                  >
                    <div style={{ display: "flex", gap: 10 }}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            backgroundColor: "#E4DAC7",
                            color: "#101828",
                            fontSize: 11,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          A
                        </div>
                        <div
                          style={{
                            width: 1.5,
                            flex: 1,
                            backgroundColor: "#DDD3C0",
                            marginTop: 4,
                            marginBottom: 4,
                          }}
                        />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
                          <span style={{ fontWeight: 700, color: "#101828" }}>
                            Anjali Verma <span style={{ fontWeight: 500, color: "#667085" }}>· Wk 33</span>
                          </span>
                          <span style={{ color: "#98A2B3", fontSize: 10.5 }}>14m</span>
                        </div>
                        <div style={{ fontSize: 12, color: "#101828", marginTop: 2, lineHeight: 1.38 }}>
                          Anyone else waking up with calf cramps at 3 AM? Warm water helped a bit.
                        </div>
                        <VoiceNotePill duration="0:19" frame={frame} />
                        <div
                          style={{
                            marginTop: 7,
                            display: "flex",
                            gap: 16,
                            fontSize: 10.5,
                            color: "#667085",
                          }}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <Heart size={11} /> 12
                          </span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <MessageCircle size={11} /> 3
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Threaded Reply */}
                    <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                      <div
                        style={{
                          width: 28,
                          display: "flex",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            backgroundColor: "#D6E8DF",
                            color: "#0F4C3A",
                            fontSize: 10.5,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          S
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                          <span style={{ fontWeight: 700, color: "#101828" }}>
                            Sunita Patil <span style={{ fontWeight: 500, color: "#667085" }}>· Wk 34</span>
                          </span>
                          <span style={{ color: "#98A2B3", fontSize: 10 }}>6m</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: "#344054", marginTop: 2, lineHeight: 1.35 }}>
                          Yes! Flexing toes upward and a pillow between knees really helped me.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Post 2: Kavita Voice-First */}
                  <div
                    style={{
                      padding: "11px 18px",
                      borderBottom: "1px solid #EAE3D5",
                      display: "flex",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        backgroundColor: "#F3D3A7",
                        color: "#101828",
                        fontSize: 11,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      K
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
                        <span style={{ fontWeight: 700, color: "#101828" }}>
                          Kavita Devi <span style={{ fontWeight: 500, color: "#667085" }}>· Wk 31</span>
                        </span>
                        <span style={{ color: "#98A2B3", fontSize: 10.5 }}>1h</span>
                      </div>
                      <VoiceNotePill duration="0:24" lang="Hindi" dark frame={frame} />
                      <div style={{ fontSize: 11.5, color: "#475467", marginTop: 4, lineHeight: 1.35 }}>
                        &ldquo;Aaj iron ki goli ke saath nimbu paani liya, chakkar bilkul nahi aaya.&rdquo;
                      </div>
                    </div>
                  </div>

                  {/* Post 3: Clinic Host */}
                  <div style={{ padding: "11px 18px", display: "flex", gap: 10 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        backgroundColor: "#0F4C3A",
                        color: "#FFFFFF",
                        fontSize: 10,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      Dr
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
                        <span style={{ fontWeight: 700, color: "#0F4C3A" }}>
                          Dr. Anita Deshmukh <span style={{ fontWeight: 500, color: "#667085" }}>· Clinic</span>
                        </span>
                        <span style={{ color: "#98A2B3", fontSize: 10.5 }}>3h</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: "#101828", marginTop: 2, lineHeight: 1.35 }}>
                        If headache and swollen feet show up together, do not wait till morning. Speak to Sakhi right away.
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Graphical Pregnancy & Health Journal */
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {/* Header */}
                <div
                  style={{
                    padding: "10px 18px 8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #EAE3D5",
                  }}
                >
                  <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700 }}>
                    Pregnancy Journal
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      backgroundColor: "#0F4C3A",
                      color: "#FFFFFF",
                      padding: "4px 9px",
                      borderRadius: 999,
                      fontSize: 10.5,
                      fontWeight: 600,
                    }}
                  >
                    <Volume2 size={11} />
                    Listen
                  </span>
                </div>

                {/* Graphical SVG Gestation Arc */}
                <div
                  style={{
                    padding: "10px 18px 8px",
                    borderBottom: "1px solid #EAE3D5",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <svg width={104} height={62} viewBox="0 0 104 62">
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
                    <text
                      x="52"
                      y="46"
                      textAnchor="middle"
                      fontSize="14"
                      fontWeight="700"
                      fill="#101828"
                    >
                      Wk 32
                    </text>
                    <text x="52" y="59" textAnchor="middle" fontSize="9" fill="#667085">
                      of 40
                    </text>
                  </svg>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "#101828" }}>
                      Trimester 3 · 56 days left
                    </div>
                    <div style={{ fontSize: 11, color: "#475467", marginTop: 2 }}>
                      Next ANC Visit: 24 Nov
                    </div>
                    <div
                      style={{
                        marginTop: 5,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 10.5,
                        fontWeight: 600,
                        color: "#0F4C3A",
                      }}
                    >
                      <ShieldCheck size={12} />
                      Hospital-owned record
                    </div>
                  </div>
                </div>

                {/* Graphical 14-Day Iron Dot Calendar */}
                <div
                  style={{
                    padding: "10px 18px",
                    borderBottom: "1px solid #EAE3D5",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 11.5,
                      fontWeight: 700,
                      marginBottom: 7,
                    }}
                  >
                    <span>Iron Tablets (14-Day Grid)</span>
                    <span style={{ color: "#0F4C3A" }}>118 / 180 days</span>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, 1fr)",
                      gap: 6,
                      justifyItems: "center",
                    }}
                  >
                    {dotStates.map((st, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          backgroundColor:
                            st === "done"
                              ? "#0F4C3A"
                              : st === "today"
                                ? "#EFE6D5"
                                : "transparent",
                          border:
                            st === "missed"
                              ? "2px solid #C8643B"
                              : st === "today"
                                ? "2px dashed #0F4C3A"
                                : "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 9,
                          fontWeight: 700,
                          color: st === "done" ? "#FFFFFF" : "#101828",
                        }}
                      >
                        {st === "done" ? "✓" : st === "today" ? "•" : ""}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Graphical BP Sparkline & Weight */}
                <div
                  style={{
                    padding: "9px 18px",
                    borderBottom: "1px solid #EAE3D5",
                    display: "grid",
                    gridTemplateColumns: "1.2fr 0.8fr",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 10.5, color: "#667085", fontWeight: 600 }}>
                      BP Trend (Last 4 visits)
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#101828" }}>116/74</span>
                      <svg width={74} height={22} viewBox="0 0 74 22">
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
                  <div style={{ borderLeft: "1px solid #EAE3D5", paddingLeft: 12 }}>
                    <div style={{ fontSize: 10.5, color: "#667085", fontWeight: 600 }}>Weight Gain</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#101828", marginTop: 2 }}>
                      +8.2 kg
                    </div>
                  </div>
                </div>

                {/* Vertical Hairline Timeline Spine */}
                <div style={{ padding: "10px 18px", flex: 1 }}>
                  {[
                    {
                      color: "#C8643B",
                      time: "Tonight · 11:14 PM",
                      text: "Headache & swollen feet alerted to care team",
                    },
                    {
                      color: "#0F4C3A",
                      time: "10 Nov · ANC Visit 2",
                      text: "Baby heartbeat steady · Verified by Dr. Deshmukh",
                    },
                  ].map((item, i) => (
                    <div key={item.time} style={{ display: "flex", gap: 10, paddingBottom: i === 0 ? 10 : 0 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <span
                          style={{
                            width: 9,
                            height: 9,
                            borderRadius: "50%",
                            backgroundColor: item.color,
                            marginTop: 3,
                          }}
                        />
                        {i === 0 && (
                          <div style={{ width: 1.5, flex: 1, backgroundColor: "#DDD3C0", marginTop: 3 }} />
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: 10.5, fontWeight: 600, color: "#667085" }}>
                          {item.time}
                        </div>
                        <div style={{ fontSize: 11.5, fontWeight: 500, color: "#101828" }}>
                          {item.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3-Tab Bottom Navigation */}
            <div
              style={{
                padding: "7px 16px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                alignItems: "center",
                borderTop: "1px solid #EAE3D5",
                backgroundColor: "#FAF6EE",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  color: copy.tab === "feed" ? "#101828" : "#667085",
                  fontSize: 10,
                  fontWeight: copy.tab === "feed" ? 700 : 500,
                }}
              >
                <Users size={15} />
                <span style={{ marginTop: 2 }}>Circle</span>
              </div>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    backgroundColor: "#0B1715",
                    color: "#EAB685",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Mic size={15} />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  color: copy.tab === "journal" ? "#101828" : "#667085",
                  fontSize: 10,
                  fontWeight: copy.tab === "journal" ? 700 : 500,
                }}
              >
                <BookOpen size={15} />
                <span style={{ marginTop: 2 }}>Journal</span>
              </div>
            </div>
          </div>
        </PhoneFrame>
      </div>
    </div>
  );
}

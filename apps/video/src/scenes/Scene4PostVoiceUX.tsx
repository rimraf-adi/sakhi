import React from "react";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  HeartHandshake,
  Lock,
  Mic,
  PhoneCall,
  ShieldCheck,
  Users,
  Volume2,
} from "lucide-react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PhoneFrame, SANS, SERIF } from "../components/ScreenChrome";

type TabMode = "today" | "journal" | "family";

const COPY: Record<
  TabMode,
  {
    headline: string;
    body: string;
    time: string;
  }
> = {
  today: {
    headline: "After she speaks, care stays calm.",
    body: "Instead of leaving her with a wall of text, Sakhi opens a quiet care plan in warm daylight: one-tap audio replay, who was notified, and tonight's gentle reminder.",
    time: "8:15 AM",
  },
  journal: {
    headline: "Her own journal, in her own words.",
    body: "Every voice check-in, iron tablet streak, and doctor-verified visit stays organized in plain language she can listen to before stepping into a busy 5-minute clinic.",
    time: "8:20 AM",
  },
  family: {
    headline: "A closed circle for family and elders.",
    body: "No public feed and no forwarded myths. Only her husband, mother, and mother-in-law receive hospital-verified Hindi audio notes and send warm voice blessings back.",
    time: "8:25 AM",
  },
};

export function Scene4PostVoiceUX() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mode: TabMode = frame < 300 ? "today" : frame < 600 ? "journal" : "family";
  const beatFrame = mode === "today" ? frame : mode === "journal" ? frame - 300 : frame - 600;

  const enter = spring({
    frame: beatFrame,
    fps,
    config: { damping: 22, stiffness: 95 },
  });

  const beatFade = interpolate(beatFrame, [0, 12, 285, 300], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const wavePulse = 0.65 + 0.35 * Math.sin(frame * 0.16);
  const copy = COPY[mode];

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
      {/* Left Editorial Column (no rounded pills, no ALL-CAPS SaaS eyebrows, no cursors) */}
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
            fontSize: 64,
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

        {/* Subtle editorial progress rule */}
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
            { id: "today" as const, label: "01. Care Plan" },
            { id: "journal" as const, label: "02. Personal Journal" },
            { id: "family" as const, label: "03. Closed Family Circle" },
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

      {/* Right Warm-Daylight Patient Mobile Screen */}
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
            {/* Context Header */}
            <div
              style={{
                padding: "12px 20px 10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #E7DFD0",
                fontSize: 12,
              }}
            >
              <span style={{ fontWeight: 600, color: "#101828" }}>Priya · Week 32</span>
              <span style={{ fontWeight: 500, color: "#667085" }}>Next: 24 Nov</span>
            </div>

            {/* Tab Content */}
            <div
              style={{
                flex: 1,
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 11,
                overflow: "hidden",
              }}
            >
              {mode === "today" && (
                <>
                  <div
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E7DFD0",
                      borderRadius: 16,
                      padding: 14,
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#9C5A3C" }}>
                      Aaj · Care Plan
                    </div>
                    <div
                      style={{
                        fontFamily: SERIF,
                        fontSize: 18,
                        fontWeight: 600,
                        color: "#101828",
                        marginTop: 4,
                      }}
                    >
                      Listen to Sakhi&apos;s advice
                    </div>
                    <div style={{ fontSize: 11.5, color: "#475467", marginTop: 4, lineHeight: 1.45 }}>
                      Meena didi aur Rohit ko khabar bhej di hai. Aaj aaram karein aur paani piyein.
                    </div>
                    <div
                      style={{
                        marginTop: 10,
                        backgroundColor: "#C8643B",
                        color: "#FFFFFF",
                        borderRadius: 11,
                        padding: "9px 12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      <Volume2 size={14} style={{ opacity: wavePulse }} />
                      Play voice recap in Hindi
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#FFF4F1",
                      border: "1px solid #F3C5B8",
                      borderRadius: 16,
                      padding: 14,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#9C331A",
                      }}
                    >
                      <span>Care team notified</span>
                      <span>2 min ago</span>
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                        fontSize: 11.5,
                        color: "#344054",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Meena Devi (Health Pro)</span>
                        <span style={{ color: "#0F4C3A", fontWeight: 600 }}>On the way</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Rohit Sharma (Partner)</span>
                        <span style={{ color: "#0F4C3A", fontWeight: 600 }}>Notified</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>District Women&apos;s Hospital</span>
                        <span style={{ color: "#0F4C3A", fontWeight: 600 }}>Desk ready</span>
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: 10,
                        backgroundColor: "#101828",
                        color: "#FFFFFF",
                        borderRadius: 10,
                        padding: "8px 10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        fontSize: 11.5,
                        fontWeight: 600,
                      }}
                    >
                      <PhoneCall size={13} />
                      Call Meena
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#F3ECE0",
                      border: "1px solid #E4DAC7",
                      borderRadius: 16,
                      padding: 13,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: "#101828",
                      }}
                    >
                      <ShieldCheck size={14} color="#0F4C3A" />
                      Tonight · 8:00 PM Iron Tablet
                    </div>
                    <div style={{ fontSize: 11.5, color: "#475467", marginTop: 4 }}>
                      Gentle voice reminder scheduled after dinner.
                    </div>
                  </div>
                </>
              )}

              {mode === "journal" && (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: "#101828" }}>
                      My Health Journal
                    </div>
                    <div
                      style={{
                        backgroundColor: "#0F4C3A",
                        color: "#FFFFFF",
                        borderRadius: 10,
                        padding: "6px 10px",
                        fontSize: 11,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Volume2 size={12} />
                      Listen before visit
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E7DFD0",
                      borderRadius: 16,
                      padding: 13,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      <span>Iron Tablet Streak</span>
                      <span style={{ color: "#0F4C3A" }}>118 / 180 days</span>
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        height: 8,
                        borderRadius: 999,
                        backgroundColor: "#EFE6D5",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: "66%",
                          height: "100%",
                          borderRadius: 999,
                          backgroundColor: "#0F4C3A",
                        }}
                      />
                    </div>
                  </div>

                  {[
                    {
                      date: "Tonight · 11:14 PM",
                      status: "Care alerted",
                      statusColor: "#C8643B",
                      text: "Headache for two days, swollen feet, blurred vision",
                    },
                    {
                      date: "Yesterday · 8:10 PM",
                      status: "Saved",
                      statusColor: "#0F4C3A",
                      text: "Missed iron tablet noted; 8 PM reminder set",
                    },
                    {
                      date: "10 Nov · ANC Visit 2",
                      status: "Doctor verified",
                      statusColor: "#0F4C3A",
                      text: "BP normal (116/74), baby heartbeat steady",
                    },
                  ].map((entry) => (
                    <div
                      key={entry.date}
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E7DFD0",
                        borderRadius: 14,
                        padding: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 10.5,
                          color: "#667085",
                        }}
                      >
                        <span>{entry.date}</span>
                        <span
                          style={{
                            color: entry.statusColor,
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <CheckCircle2 size={11} />
                          {entry.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "#101828", marginTop: 4 }}>
                        {entry.text}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {mode === "family" && (
                <>
                  <div
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E7DFD0",
                      borderRadius: 16,
                      padding: 13,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#101828",
                      }}
                    >
                      <Lock size={13} color="#0F4C3A" />
                      Closed Family Circle · 3 members
                    </div>
                    <div style={{ fontSize: 11, color: "#475467", marginTop: 4 }}>
                      Maa (Savitri) · Saas (Kamla) · Rohit
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#F3ECE0",
                      border: "1px solid #E4DAC7",
                      borderRadius: 16,
                      padding: 13,
                    }}
                  >
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: "#0F4C3A" }}>
                      Hospital-Verified Note for Family
                    </div>
                    <div style={{ fontSize: 12, color: "#101828", marginTop: 4, lineHeight: 1.45 }}>
                      Week 32 care: warm iron-rich meals, afternoon rest, and check-up on 24 Nov.
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        backgroundColor: "#101828",
                        color: "#FFFFFF",
                        borderRadius: 10,
                        padding: "6px 10px",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      <Volume2 size={12} />
                      Play in Hindi · 0:18
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E7DFD0",
                      borderRadius: 16,
                      padding: 13,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#9C5A3C",
                      }}
                    >
                      <HeartHandshake size={13} />
                      Voice note from Maa (Savitri Devi)
                    </div>
                    <div
                      style={{
                        fontFamily: SERIF,
                        fontSize: 13.5,
                        color: "#101828",
                        marginTop: 5,
                        lineHeight: 1.38,
                      }}
                    >
                      &ldquo;Beta, dal-palak bana rakha hai, shaam ko iron ki goli yaad se kha lena.&rdquo;
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        backgroundColor: "#EFE6D5",
                        color: "#101828",
                        borderRadius: 10,
                        padding: "6px 10px",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      <Volume2 size={12} />
                      Listen to Maa · 0:14
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E7DFD0",
                      borderRadius: 14,
                      padding: 12,
                    }}
                  >
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: "#0F4C3A" }}>
                      Myth-Free Doctor Note
                    </div>
                    <div style={{ fontSize: 11.5, color: "#344054", marginTop: 3, lineHeight: 1.4 }}>
                      Swollen feet with headache in Month 8 is never &apos;just heat&apos;. Always check BP at the hospital.
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 4-Item Bottom Tab Bar */}
            <div
              style={{
                padding: "8px 12px",
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 4,
                borderTop: "1px solid #E7DFD0",
                backgroundColor: "#FAF6EE",
              }}
            >
              {[
                { id: "voice", label: "Voice", icon: Mic },
                { id: "today", label: "Today", icon: Calendar },
                { id: "journal", label: "Journal", icon: BookOpen },
                { id: "family", label: "Family", icon: Users },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = tab.id === mode;
                return (
                  <div
                    key={tab.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "5px 0",
                      borderRadius: 10,
                      backgroundColor: active ? "#EFE6D5" : "transparent",
                      color: active ? "#101828" : "#667085",
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  >
                    <Icon size={14} />
                    <span style={{ marginTop: 2 }}>{tab.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </PhoneFrame>
      </div>
    </div>
  );
}

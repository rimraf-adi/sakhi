import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SANS, SERIF } from "../components/ScreenChrome";

const FRAGMENTS = [
  {
    text: '"Just drink warm water and sleep it off."',
    top: 190,
    left: 140,
    start: 170,
    strikeStart: 205,
  },
  {
    text: '"47 scary forum replies at midnight."',
    top: 390,
    left: 310,
    start: 192,
    strikeStart: 228,
  },
  {
    text: '"Forwarded many times."',
    top: 590,
    left: 190,
    start: 214,
    strikeStart: 250,
  },
];

export function Scene1Landing() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Beat 1 (0 - 165): Full-bleed twilight editorial opening
  const beat1Opacity = interpolate(frame, [0, 14, 150, 165], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const beat1Scale = interpolate(frame, [0, 165], [1.04, 1.11], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line1Spring = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { damping: 24, stiffness: 90 },
  });
  const line2Spring = spring({
    frame: Math.max(0, frame - 48),
    fps,
    config: { damping: 24, stiffness: 90 },
  });

  // Beat 2 (165 - 405): Warm paper canvas, struck-through fragments -> statement
  const beat2Opacity = interpolate(frame, [158, 172, 392, 405], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fragmentsFadeOut = interpolate(frame, [282, 302], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const statementOpacity = interpolate(frame, [295, 315, 392, 405], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const statementRise = spring({
    frame: Math.max(0, frame - 295),
    fps,
    config: { damping: 22, stiffness: 95 },
  });

  // Beat 3 (405 - 675): 50/50 magazine spread
  const beat3Opacity = interpolate(frame, [398, 415, 660, 675], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const beat3ImgScale = interpolate(frame, [405, 675], [1.02, 1.07], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const brandSpring = spring({
    frame: Math.max(0, frame - 418),
    fps,
    config: { damping: 22, stiffness: 90 },
  });
  const subtitleSpring = spring({
    frame: Math.max(0, frame - 442),
    fps,
    config: { damping: 22, stiffness: 90 },
  });

  // Gentle silk wave phase
  const waveShift = (frame - 405) * 0.08;
  const waveDraw = interpolate(frame, [430, 505], [900, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#FAF6EE" }}>
      {/* Beat 1: Full-bleed twilight editorial photograph + monumental serif */}
      {frame < 170 && (
        <AbsoluteFill style={{ opacity: beat1Opacity }}>
          <Img
            src={staticFile("hero-bento-editorial.jpg")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${beat1Scale})`,
            }}
          />
          <AbsoluteFill
            style={{
              backgroundColor: "rgba(15, 24, 26, 0.62)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 140,
              right: 140,
              top: 320,
              bottom: 180,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 82,
                lineHeight: 1.08,
                fontWeight: 500,
                color: "#FAF6EE",
                letterSpacing: "-0.02em",
                opacity: line1Spring,
                transform: `translateY(${(1 - line1Spring) * 26}px)`,
              }}
            >
              Between monthly visits,
            </div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 82,
                lineHeight: 1.08,
                fontWeight: 500,
                color: "#F3D3A7",
                letterSpacing: "-0.02em",
                marginTop: 14,
                opacity: line2Spring,
                transform: `translateY(${(1 - line2Spring) * 26}px)`,
              }}
            >
              11 PM is the longest hour.
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* Beat 2: Struck-through fragments on warm paper -> calm editorial statement */}
      {frame >= 155 && frame < 410 && (
        <AbsoluteFill
          style={{
            backgroundColor: "#FAF6EE",
            opacity: beat2Opacity,
          }}
        >
          {frame < 308 && (
            <AbsoluteFill style={{ opacity: fragmentsFadeOut }}>
              {FRAGMENTS.map((frag) => {
                const enter = spring({
                  frame: Math.max(0, frame - frag.start),
                  fps,
                  config: { damping: 24, stiffness: 110 },
                });
                const strikePct = interpolate(
                  frame,
                  [frag.strikeStart, frag.strikeStart + 24],
                  [0, 100],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                );
                const textFade = interpolate(
                  frame,
                  [frag.strikeStart, frag.strikeStart + 24],
                  [1, 0.42],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                );

                return (
                  <div
                    key={frag.text}
                    style={{
                      position: "absolute",
                      top: frag.top,
                      left: frag.left,
                      opacity: enter,
                      transform: `translateY(${(1 - enter) * 20}px)`,
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        display: "inline-block",
                        fontFamily: SERIF,
                        fontSize: 54,
                        lineHeight: 1.18,
                        fontStyle: "italic",
                        color: "#0F181A",
                        opacity: textFade,
                      }}
                    >
                      {frag.text}
                      <div
                        style={{
                          position: "absolute",
                          left: -10,
                          top: "54%",
                          height: 4,
                          width: `calc(${strikePct}% + ${strikePct > 0 ? 20 : 0}px)`,
                          backgroundColor: "#C93B2B",
                          transform: "translateY(-50%)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </AbsoluteFill>
          )}

          {frame >= 292 && (
            <AbsoluteFill
              style={{
                justifyContent: "center",
                alignItems: "center",
                paddingBottom: 140,
                opacity: statementOpacity,
              }}
            >
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 86,
                  lineHeight: 1.1,
                  fontWeight: 500,
                  color: "#0F181A",
                  letterSpacing: "-0.02em",
                  textAlign: "center",
                  transform: `translateY(${(1 - statementRise) * 24}px)`,
                }}
              >
                Scary answers aren’t care.
              </div>
            </AbsoluteFill>
          )}
        </AbsoluteFill>
      )}

      {/* Beat 3: Full-height 50/50 magazine spread */}
      {frame >= 395 && (
        <AbsoluteFill
          style={{
            backgroundColor: "#FAF6EE",
            opacity: beat3Opacity,
            display: "flex",
            flexDirection: "row",
          }}
        >
          {/* Left half */}
          <div
            style={{
              width: "50%",
              height: "100%",
              paddingLeft: 120,
              paddingRight: 80,
              paddingBottom: 150,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 10,
                opacity: brandSpring,
                transform: `translateY(${(1 - brandSpring) * 24}px)`,
              }}
            >
              <span
                style={{
                  fontFamily: SERIF,
                  fontSize: 96,
                  lineHeight: 1,
                  fontWeight: 500,
                  color: "#0F181A",
                  letterSpacing: "-0.025em",
                }}
              >
                Sakhi
              </span>
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  backgroundColor: "#C8643B",
                  display: "inline-block",
                  marginBottom: 8,
                }}
              />
            </div>

            <div
              style={{
                fontFamily: SANS,
                fontSize: 30,
                lineHeight: 1.4,
                color: "#475467",
                marginTop: 22,
                opacity: subtitleSpring,
                transform: `translateY(${(1 - subtitleSpring) * 18}px)`,
              }}
            >
              A calm, voice-first companion.
            </div>

            <svg
              width={460}
              height={72}
              viewBox="0 0 460 72"
              style={{ marginTop: 46, overflow: "visible" }}
            >
              <path
                d={`M 0 36 Q 58 ${16 + Math.sin(waveShift) * 8} 115 36 T 230 36 T 345 36 T 460 36`}
                fill="none"
                stroke="#C8643B"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeDasharray={900}
                strokeDashoffset={waveDraw}
              />
              <path
                d={`M 0 36 Q 58 ${50 + Math.cos(waveShift * 0.9) * 6} 115 36 T 230 36 T 345 36 T 460 36`}
                fill="none"
                stroke="#D99B52"
                strokeWidth={1.4}
                strokeOpacity={0.65}
                strokeLinecap="round"
                strokeDasharray={900}
                strokeDashoffset={waveDraw}
              />
            </svg>
          </div>

          {/* Right half */}
          <div
            style={{
              width: "50%",
              height: "100%",
              overflow: "hidden",
              borderLeft: "1px solid rgba(15, 24, 26, 0.1)",
              boxSizing: "border-box",
            }}
          >
            <Img
              src={staticFile("hero-bento-editorial.jpg")}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: `scale(${beat3ImgScale})`,
              }}
            />
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
}

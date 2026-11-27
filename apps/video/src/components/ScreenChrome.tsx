import type { ReactNode } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const SERIF = "'Georgia', 'Times New Roman', serif";
export const SANS =
  "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif";

export function BrowserFrame({
  url,
  children,
  width = 1660,
  height = 920,
}: {
  url: string;
  children: ReactNode;
  width?: number;
  height?: number;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 24,
        overflow: "hidden",
        backgroundColor: "#FAF6EE",
        border: "1px solid rgba(15, 24, 26, 0.14)",
        boxShadow: "0 40px 100px -24px rgba(15, 24, 26, 0.28)",
        display: "flex",
        flexDirection: "column",
        fontFamily: SANS,
      }}
    >
      {/* macOS Browser Chrome */}
      <div
        style={{
          height: 50,
          backgroundColor: "#F2ECE0",
          borderBottom: "1px solid rgba(15, 24, 26, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#ED6A5E",
            }}
          />
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#F4BF4F",
            }}
          />
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#61C554",
            }}
          />
        </div>

        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.78)",
            border: "1px solid rgba(15, 24, 26, 0.08)",
            borderRadius: 999,
            padding: "5px 28px",
            fontSize: 13,
            fontWeight: 500,
            color: "#3A4745",
            letterSpacing: "0.01em",
          }}
        >
          {url}
        </div>

        <div style={{ width: 52 }} />
      </div>

      {/* Viewport Content */}
      <div
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function PhoneFrame({
  nightMode = true,
  time = "11:14 PM",
  offline = false,
  children,
}: {
  nightMode?: boolean;
  time?: string;
  offline?: boolean;
  children: ReactNode;
}) {
  const bg = nightMode ? "#102320" : "#FAF6EE";
  const fg = nightMode ? "#F7F4ED" : "#132623";

  return (
    <div
      style={{
        width: 400,
        height: 856,
        borderRadius: 54,
        padding: 12,
        backgroundColor: "#141D1B",
        border: "2px solid rgba(255, 255, 255, 0.14)",
        boxShadow: "0 44px 110px -28px rgba(15, 24, 26, 0.46)",
        display: "flex",
        flexDirection: "column",
        fontFamily: SANS,
        position: "relative",
      }}
    >
      {/* Screen */}
      <div
        style={{
          flex: 1,
          borderRadius: 42,
          backgroundColor: bg,
          color: fg,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Dynamic Island & Status Bar */}
        <div
          style={{
            height: 46,
            padding: "10px 24px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 13,
            fontWeight: 600,
            color: fg,
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          <span>{time}</span>
          <div
            style={{
              width: 106,
              height: 26,
              borderRadius: 999,
              backgroundColor: "#080D0C",
            }}
          />
          <span style={{ fontSize: 12, opacity: 0.85 }}>
            {offline ? "Offline" : "4G"}
          </span>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function AnimatedCursor({
  x,
  y,
  clickFrame,
}: {
  x: number;
  y: number;
  clickFrame?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isClicking =
    clickFrame !== undefined && frame >= clickFrame && frame <= clickFrame + 14;
  const clickProgress =
    clickFrame !== undefined
      ? spring({
          frame: frame - clickFrame,
          fps,
          config: { damping: 14, stiffness: 200 },
        })
      : 0;

  const scale = isClicking
    ? interpolate(frame - clickFrame!, [0, 5, 14], [1, 0.84, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  const rippleOpacity =
    clickFrame !== undefined && frame >= clickFrame && frame <= clickFrame + 22
      ? interpolate(frame - clickFrame, [0, 22], [0.7, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  const rippleSize = interpolate(clickProgress, [0, 1], [10, 52]);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        zIndex: 100,
        pointerEvents: "none",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {rippleOpacity > 0 ? (
        <div
          style={{
            position: "absolute",
            left: -rippleSize / 2 + 4,
            top: -rippleSize / 2 + 4,
            width: rippleSize,
            height: rippleSize,
            borderRadius: "50%",
            border: "2.5px solid #D58E6D",
            opacity: rippleOpacity,
          }}
        />
      ) : null}

      <svg width="30" height="34" viewBox="0 0 28 32" fill="none">
        <path
          d="M3 2L24 16.5L13.8 18.2L9.5 28L3 2Z"
          fill="#0F181A"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

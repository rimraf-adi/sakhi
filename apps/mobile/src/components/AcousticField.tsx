"use client";

import { useEffect, useRef } from "react";
import type { FlowPhase } from "@/lib/types";

interface AcousticFieldProps {
  phase: FlowPhase;
  /** 0..1.2 live microphone level, read every frame. */
  micLevel: React.RefObject<number>;
  className?: string;
}

const PALETTES = {
  alert: {
    bar: "rgba(224,98,70,0.42)",
    ribbon1: "rgba(224,98,70,0.88)",
    ribbon2: "rgba(246,173,148,0.45)",
    ribbon3: "rgba(224,98,70,0.22)",
  },
  listen: {
    bar: "rgba(127,209,174,0.36)",
    ribbon1: "rgba(127,209,174,0.88)",
    ribbon2: "rgba(234,182,133,0.45)",
    ribbon3: "rgba(127,209,174,0.20)",
  },
  saved: {
    bar: "rgba(88,185,142,0.28)",
    ribbon1: "rgba(88,185,142,0.75)",
    ribbon2: "rgba(158,176,170,0.32)",
    ribbon3: "rgba(88,185,142,0.16)",
  },
  calm: {
    bar: "rgba(234,182,133,0.36)",
    ribbon1: "rgba(234,182,133,0.92)",
    ribbon2: "rgba(255,224,188,0.48)",
    ribbon3: "rgba(234,182,133,0.20)",
  },
} as const;

/** 48-band hairline field with three silk ribbons, driven by the live phase. */
export function AcousticField({ phase, micLevel, className }: AcousticFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const BAND_COUNT = 48;
    const bandValues = new Float32Array(BAND_COUNT).fill(0.1);
    let frame = 0;
    let time = 0;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const bounds = canvas.getBoundingClientRect();
      canvas.width = bounds.width * ratio;
      canvas.height = bounds.height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      context.clearRect(0, 0, width, height);

      const recording = phase === "recording_initial" || phase === "recording_followup";
      const calm = phase === "idle" || phase === "saved" || phase === "declined";
      time += calm ? 0.025 : 0.072;

      const micBoost = recording ? Math.max(0.55, micLevel.current) : 0;
      const energy = recording
        ? 0.65 + micBoost * 0.55
        : phase === "alert"
          ? 1.05
          : calm
            ? 0.28
            : 0.85;
      const middleY = height * 0.54;

      const palette =
        phase === "alert"
          ? PALETTES.alert
          : phase === "followup" || phase === "consent"
            ? PALETTES.listen
            : phase === "saved"
              ? PALETTES.saved
              : PALETTES.calm;

      // Hairline bars, tallest in the middle.
      const step = width / BAND_COUNT;
      const center = (BAND_COUNT - 1) / 2;
      for (let index = 0; index < BAND_COUNT; index++) {
        const distance = Math.abs(index - center) / center;
        const window = Math.pow(Math.max(0.05, 1 - distance * 0.9), 1.5);
        const wave =
          0.48 + 0.32 * Math.sin(time * 1.9 + index * 0.35) + 0.2 * Math.cos(time * 3.1 - index * 0.6);
        const target = Math.min(0.95, window * wave * energy);
        const previous = bandValues[index] ?? 0.1;
        const next = previous + (target - previous) * 0.18;
        bandValues[index] = next;

        const barHeight = Math.max(3, next * (height * 0.72));
        const x = index * step + step * 0.5;
        context.strokeStyle = palette.bar;
        context.lineWidth = 1.3;
        context.beginPath();
        context.moveTo(x, middleY - barHeight / 2);
        context.lineTo(x, middleY + barHeight / 2);
        context.stroke();
      }

      // Three overlapping ribbons.
      const ribbons = [
        { amplitude: 22 * energy, frequency: 0.022, speed: 1.0, color: palette.ribbon1, width: 2.0 },
        { amplitude: 15 * energy, frequency: 0.031, speed: -1.35, color: palette.ribbon2, width: 1.3 },
        { amplitude: 10 * energy, frequency: 0.017, speed: 0.7, color: palette.ribbon3, width: 1.1 },
      ];
      ribbons.forEach((ribbon) => {
        context.strokeStyle = ribbon.color;
        context.lineWidth = ribbon.width;
        context.beginPath();
        for (let x = 0; x <= width; x += 3) {
          const taper = Math.sin((x / width) * Math.PI);
          const y =
            middleY +
            Math.sin(x * ribbon.frequency + time * ribbon.speed) *
              Math.cos(x * 0.011 - time * 0.5) *
              ribbon.amplitude *
              taper;
          if (x === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.stroke();
      });

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [phase, micLevel]);

  return <canvas ref={canvasRef} className={className} />;
}

import { NextResponse } from "next/server";
import { loadGroqKeys } from "@/lib/groq";
import { loadSarvamKeys } from "@/lib/sarvam";

export const dynamic = "force-dynamic";

/**
 * Which live features are wired on this deployment. Booleans only - key values
 * never leave the server. The app runs without keys; this tells the screen
 * where the live version switches on and where the device fallback takes over.
 */
export async function GET() {
  const voiceInput = loadGroqKeys().length > 0;
  const voiceOutput = loadSarvamKeys().length > 0;
  const missing = [
    ...(voiceInput ? [] : ["GROQ_API_KEYS"]),
    ...(voiceOutput ? [] : ["SARVAM_API_KEY"]),
  ];

  return NextResponse.json({
    voiceInput,
    voiceOutput,
    mode: missing.length === 0 ? "live" : "demo",
    missing,
  });
}

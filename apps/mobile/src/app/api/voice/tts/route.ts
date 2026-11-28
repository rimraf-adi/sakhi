import { NextResponse } from "next/server";
import { loadSarvamKeys, synthesizeSpeech, type SpeechLang } from "@/lib/sarvam";

export const dynamic = "force-dynamic";

const MAX_CACHE = 24;
const cache = new Map<string, { audio: Buffer; mime: string }>();

function audioResponse(audio: Buffer, mime: string) {
  return new NextResponse(new Uint8Array(audio), {
    headers: {
      "Content-Type": mime,
      "Content-Length": String(audio.byteLength),
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(req: Request) {
  let body: { text?: unknown; lang?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const lang: SpeechLang =
    body.lang === "mr-IN" ? "mr-IN" : body.lang === "en-IN" ? "en-IN" : "hi-IN";

  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  if (loadSarvamKeys().length === 0) {
    return NextResponse.json(
      { error: "SARVAM_API_KEY not set", fallback: true },
      { status: 503 },
    );
  }

  const cacheKey = `${lang}|${text}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return audioResponse(cached.audio, cached.mime);
  }

  try {
    const { audio, mime } = await synthesizeSpeech(text.slice(0, 600), lang);
    if (cache.size >= MAX_CACHE) {
      const oldest = cache.keys().next().value;
      if (oldest) cache.delete(oldest);
    }
    cache.set(cacheKey, { audio, mime });
    return audioResponse(audio, mime);
  } catch (err) {
    const message = err instanceof Error ? err.message : "TTS failed";
    return NextResponse.json(
      {
        error: message,
        fallback: true,
        noCredits: /insufficient_quota|HTTP 402/.test(message),
      },
      { status: 502 },
    );
  }
}

import fs from "fs";
import path from "path";

const SARVAM_BASE = "https://api.sarvam.ai";

let keyCursor = 0;

export function loadSarvamKeys(): string[] {
  let raw = process.env.SARVAM_API_KEYS ?? process.env.SARVAM_API_KEY ?? "";
  if (!raw) {
    for (const rel of [".env.local", ".env", "../../.env"]) {
      try {
        const envPath = path.resolve(process.cwd(), rel);
        if (!fs.existsSync(envPath)) continue;
        const content = fs.readFileSync(envPath, "utf-8");
        const match = content.match(/^SARVAM_API_KEY[S]?=(.+)$/m);
        if (match && match[1]) {
          raw = match[1].trim().replace(/^['"]|['"]$/g, "");
          break;
        }
      } catch {
        // Ignore file read issues and fall back cleanly
      }
    }
  }
  return raw
    .split(/[,\n]/)
    .map((k) => k.trim())
    .filter((k) => Boolean(k) && !k.includes("your_sarvam"));
}

export type SpeechLang = "hi-IN" | "mr-IN" | "en-IN";

async function sarvamPost<T>(pathname: string, body: unknown): Promise<T> {
  const keys = loadSarvamKeys();
  if (keys.length === 0) {
    throw new Error("SARVAM_API_KEY not set");
  }

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < keys.length; attempt++) {
    const key = keys[(keyCursor + attempt) % keys.length]!;
    const res = await fetch(`${SARVAM_BASE}${pathname}`, {
      method: "POST",
      headers: {
        "api-subscription-key": key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (res.ok) {
      keyCursor = (keyCursor + attempt + 1) % keys.length;
      return (await res.json()) as T;
    }
    const detail = (await res.text()).slice(0, 200);
    lastError = new Error(`Sarvam ${pathname} HTTP ${res.status}: ${detail}`);
    if (res.status === 429 || res.status >= 500) continue;
    throw lastError;
  }
  throw lastError ?? new Error("All Sarvam API keys failed");
}

const DEVANAGARI = /[\u0900-\u097F]/;

/**
 * Bulbul sounds best on native script, but Sakhi's copy is romanized
 * ("Maine note kar liya hai"). Transliterate first, and keep the original
 * text if that call fails so speech never breaks.
 */
export async function toNativeScript(text: string, lang: SpeechLang): Promise<string> {
  if (lang === "en-IN" || DEVANAGARI.test(text)) return text;
  try {
    const res = await sarvamPost<{ transliterated_text?: string }>("/transliterate", {
      input: text,
      source_language_code: "auto",
      target_language_code: lang,
      numerals_format: "native",
      spoken_form: true,
    });
    const out = res.transliterated_text?.trim();
    return out && DEVANAGARI.test(out) ? out : text;
  } catch {
    return text;
  }
}

export async function synthesizeSpeech(
  text: string,
  lang: SpeechLang,
): Promise<{ audio: Buffer; mime: string }> {
  const nativeText = await toNativeScript(text, lang);
  const res = await sarvamPost<{ audios?: string[] }>("/text-to-speech", {
    text: nativeText.slice(0, 2400),
    target_language_code: lang,
    speaker: "priya",
    model: "bulbul:v3",
  });
  const base64 = res.audios?.[0];
  if (!base64) {
    throw new Error("Sarvam returned no audio");
  }
  return { audio: Buffer.from(base64, "base64"), mime: "audio/wav" };
}

import fs from "fs";
import path from "path";

let keyCursor = 0;

export function loadGroqKeys(): string[] {
  let raw = process.env.GROQ_API_KEYS ?? process.env.GROQ_API_KEY ?? "";
  if (!raw) {
    try {
      const envPath = path.resolve(process.cwd(), "../../.env");
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        const match = content.match(/^GROQ_API_KEY[S]?=(.+)$/m);
        if (match && match[1]) {
          raw = match[1].trim().replace(/^['"]|['"]$/g, "");
        }
      }
    } catch {
      // Ignore file read issues and fall back cleanly
    }
  }
  return raw
    .split(/[,\n]/)
    .map((key) => key.trim())
    .filter((key) => Boolean(key) && !key.includes("your_groq_api_key"));
}

async function fetchWithGroqKeyRotation(
  url: string,
  buildInit: (apiKey: string) => RequestInit,
): Promise<Response> {
  const keys = loadGroqKeys();
  if (keys.length === 0) throw new Error("GROQ_API_KEYS not set");

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < keys.length; attempt++) {
    const key = keys[(keyCursor + attempt) % keys.length]!;
    const res = await fetch(url, buildInit(key));
    if (res.ok) {
      keyCursor = (keyCursor + attempt + 1) % keys.length;
      return res;
    }
    if (res.status === 429 || res.status >= 500) {
      lastError = new Error(`Groq HTTP ${res.status}`);
      continue;
    }
    const text = await res.text();
    throw new Error(`Groq error ${res.status}: ${text.slice(0, 200)}`);
  }
  throw lastError ?? new Error("All Groq API keys failed");
}

/**
 * Whisper invents words on silence ("झाल झाल", "Thank you."), which then gets
 * escalated as if the mother had spoken. Keep only segments the model believes
 * are speech, then sanity-check the joined text.
 */
const KNOWN_HALLUCINATIONS =
  /^(thank you\.?|thanks for watching.*|subtitles (by|provided).*|please subscribe.*|you\.?|bye\.?|जय श्री|झाल झाल)$/i;

function pickSpokenText(data: {
  text?: string;
  segments?: { text?: string; no_speech_prob?: number; avg_logprob?: number }[];
}): string {
  const speechSegments = (data.segments ?? []).filter(
    (segment) => (segment.no_speech_prob ?? 0) < 0.6 && (segment.avg_logprob ?? 0) > -1.2,
  );
  const text = (
    speechSegments.length > 0
      ? speechSegments.map((segment) => segment.text ?? "").join(" ")
      : (data.text ?? "")
  )
    .replace(/\s+/g, " ")
    .trim();

  const words = text
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0 || words.join("").length < 3) return "";
  if (KNOWN_HALLUCINATIONS.test(words.join(" "))) return "";
  if (words.length >= 2 && new Set(words.map((word) => word.toLowerCase())).size === 1) return "";
  return text;
}

export async function transcribeAudioWithGroq(
  audioBlob: Blob,
  filename: string,
  speechLang: "hi-IN" | "mr-IN",
): Promise<string> {
  const langCode = speechLang === "mr-IN" ? "mr" : "hi";
  const res = await fetchWithGroqKeyRotation(
    "https://api.groq.com/openai/v1/audio/transcriptions",
    (apiKey) => {
      const form = new FormData();
      form.append("file", audioBlob, filename);
      form.append("model", "whisper-large-v3-turbo");
      form.append("language", langCode);
      form.append("response_format", "verbose_json");
      return {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
      };
    },
  );
  const data = (await res.json()) as {
    text?: string;
    segments?: { text?: string; no_speech_prob?: number; avg_logprob?: number }[];
  };
  return pickSpokenText(data);
}

/**
 * Strict JSON completion. Returns null when no key is configured or the model
 * strays from JSON, so callers can fall back to the deterministic rules.
 */
export async function structuredCompletion(
  system: string,
  user: string,
): Promise<unknown | null> {
  if (loadGroqKeys().length === 0) return null;
  try {
    const res = await fetchWithGroqKeyRotation(
      "https://api.groq.com/openai/v1/chat/completions",
      (apiKey) => ({
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          temperature: 0,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      }),
    );
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    return content ? JSON.parse(content) : null;
  } catch {
    return null;
  }
}

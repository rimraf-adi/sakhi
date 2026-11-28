import { NextResponse } from "next/server";
import { loadGroqKeys, transcribeAudioWithGroq } from "@/lib/groq";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const keys = loadGroqKeys();
    if (keys.length === 0) {
      // Keyless demo: the caller falls back to the scripted voice scenarios.
      return NextResponse.json({
        transcript: "",
        keyNotSet: true,
        message: "Live microphone needs a Groq API key. Voice scenarios still run the full flow.",
      });
    }

    const formData = await req.formData();
    const audio = formData.get("audio");
    const speechLang = (formData.get("speechLang") as "hi-IN" | "mr-IN") || "hi-IN";

    if (!(audio instanceof Blob)) {
      return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
    }

    const transcript = await transcribeAudioWithGroq(audio, "voice-note.webm", speechLang);
    // silent: true means "nothing was said" - the client must not invent a turn.
    return NextResponse.json({ transcript, silent: transcript.length === 0, keyNotSet: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transcription failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { loadGroqKeys, transcribeAudioWithGroq } from "@/lib/groq";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const keys = loadGroqKeys();
    if (keys.length === 0) {
      return NextResponse.json({
        transcript: "",
        keyNotSet: true,
        message: "key not set",
      });
    }

    const formData = await req.formData();
    const audio = formData.get("audio");
    const speechLang = (formData.get("speechLang") as "hi-IN" | "mr-IN") || "hi-IN";

    if (!(audio instanceof Blob)) {
      return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
    }

    const transcript = await transcribeAudioWithGroq(
      audio,
      "voice-note.webm",
      speechLang,
    );
    return NextResponse.json({ transcript, keyNotSet: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transcription failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

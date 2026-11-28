import { NextResponse } from "next/server";
import { appendCirclePost, findPatient, readStore, writeStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = readStore();
  return NextResponse.json({ posts: store.circlePosts });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    patientId?: string;
    text?: string;
    withVoice?: boolean;
  };

  const text = (body.text ?? "").trim();
  const withVoice = Boolean(body.withVoice);
  if (!text && !withVoice) {
    return NextResponse.json({ error: "Post text is required" }, { status: 400 });
  }

  const store = readStore();
  const patient = findPatient(store, body.patientId);
  if (!patient) {
    return NextResponse.json({ error: "No patient found" }, { status: 404 });
  }

  const post = appendCirclePost(store, { patient, text, withVoice });
  writeStore(store);
  return NextResponse.json({ post });
}

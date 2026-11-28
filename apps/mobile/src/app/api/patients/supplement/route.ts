import { NextResponse } from "next/server";
import { readStore, toggleSupplementToday, writeStore } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Toggles today's tracked care item for one mother and returns the fresh record. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { patientId?: string };
  const store = readStore();
  const patient = toggleSupplementToday(store, body.patientId ?? "");
  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }
  writeStore(store);
  return NextResponse.json({ patient });
}

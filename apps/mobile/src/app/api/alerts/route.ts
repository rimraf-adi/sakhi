import { NextResponse } from "next/server";
import { readStore } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * The mother's own view of her latest escalation: whether the care team has
 * picked it up yet. Written by the clinic desk, read here, so the loop closes
 * on both screens.
 */
export async function GET(req: Request) {
  const patientId = new URL(req.url).searchParams.get("patientId");
  const store = readStore();
  const alert = store.alerts.find((item) => !patientId || item.patientId === patientId) ?? null;
  return NextResponse.json({ alert });
}

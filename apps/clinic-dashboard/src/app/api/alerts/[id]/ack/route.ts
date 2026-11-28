import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const store = readStore();
  const alert = store.alerts.find((a) => a.id === id);
  if (!alert) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  }

  alert.acknowledged = true;
  alert.acknowledgedBy = "Sr. Anita Deshmukh";
  alert.acknowledgedAtIso = new Date().toISOString();
  alert.responseNote = "Sr. Anita has seen this · calling now, ambulance on standby";
  writeStore(store);

  return NextResponse.json({ ok: true, alert });
}

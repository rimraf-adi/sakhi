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
  alert.responseNote = "Care team acknowledged · Reached hospital";
  writeStore(store);

  return NextResponse.json({ ok: true, alert });
}

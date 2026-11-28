import { NextResponse } from "next/server";
import { readStore, writeStore, type PatientLanguage } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name: string;
      gestationWeek: number;
      language: PatientLanguage;
      nextVisitLabel?: string;
      ashaName?: string;
      familyName?: string;
      supplementName?: string;
      supplementDaysTotal?: number;
    };

    const name = (body.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "Patient name is required" }, { status: 400 });
    }

    const store = readStore();
    const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;
    const language: PatientLanguage = body.language === "Marathi" ? "Marathi" : "Hindi";
    const week = Math.min(42, Math.max(1, Math.round(Number(body.gestationWeek)) || 28));
    const daysTotal = Math.min(
      365,
      Math.max(1, Math.round(Number(body.supplementDaysTotal)) || 28),
    );

    const newPatient = {
      id,
      name,
      gestationWeek: week,
      gestationDay: 1,
      language,
      speechLang: (language === "Marathi" ? "mr-IN" : "hi-IN") as "hi-IN" | "mr-IN",
      nextVisitLabel: body.nextVisitLabel?.trim() || "Next ANC visit",
      ashaName: body.ashaName?.trim() || "ASHA worker",
      familyName: body.familyName?.trim() || "Family contact",
      supplementName: body.supplementName?.trim() || "Daily supplement",
      supplementDaysCompleted: 0,
      supplementDaysTotal: daysTotal,
      supplementTakenToday: false,
      entries: [],
    };

    store.patients.unshift(newPatient);
    writeStore(store);

    return NextResponse.json({ ok: true, patient: newPatient }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to register patient";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

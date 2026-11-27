import { NextResponse } from "next/server";
import { readStore, writeStore, type PatientLanguage } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name: string;
      gestationWeek: number;
      language: PatientLanguage;
      nextVisitLabel: string;
      ashaName: string;
      familyName: string;
    };

    const name = (body.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "Patient name is required" }, { status: 400 });
    }

    const store = readStore();
    const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;
    const language: PatientLanguage = body.language === "Marathi" ? "Marathi" : "Hindi";

    const newPatient = {
      id,
      name,
      gestationWeek: Number(body.gestationWeek) || 28,
      gestationDay: 1,
      language,
      speechLang: (language === "Marathi" ? "mr-IN" : "hi-IN") as "hi-IN" | "mr-IN",
      nextVisitLabel: body.nextVisitLabel?.trim() || "ANC Visit · Next Week",
      ashaName: body.ashaName?.trim() || "Meena Devi",
      familyName: body.familyName?.trim() || "Family Member",
      ironDaysCompleted: 20,
      ironDaysTotal: 28,
      entries: [],
    };

    store.patients.unshift(newPatient);
    writeStore(store);

    return NextResponse.json({ ok: true, patient: newPatient });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to register patient";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

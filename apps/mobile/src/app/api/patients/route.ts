import { NextResponse } from "next/server";
import { enrollPatient, readStore, toLanguage, writeStore } from "@/lib/store";
import type { NewPatientInput } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = readStore();
  return NextResponse.json({ patients: store.patients });
}

/** Registers a mother from onboarding. No record exists until this succeeds. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Partial<NewPatientInput>;
  const name = (body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const week = Number(body.gestationWeek);
  if (!Number.isFinite(week) || week < 1 || week > 42) {
    return NextResponse.json({ error: "Gestation week must be between 1 and 42" }, { status: 400 });
  }

  const store = readStore();
  const patient = enrollPatient(store, {
    name,
    gestationWeek: week,
    gestationDay: Number(body.gestationDay) || 0,
    language: toLanguage(body.language),
    ashaName: body.ashaName,
    familyName: body.familyName,
    nextVisitLabel: body.nextVisitLabel,
    supplementName: body.supplementName,
    supplementDaysTotal: Number(body.supplementDaysTotal) || 28,
  });
  writeStore(store);

  return NextResponse.json({ patient }, { status: 201 });
}

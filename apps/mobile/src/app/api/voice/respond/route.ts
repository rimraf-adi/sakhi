import { NextResponse } from "next/server";
import { evaluateVoiceTurnWithGroq } from "@/lib/groq";
import { readStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      patientId?: string;
      transcript?: string;
      phase?: "initial" | "followup";
      priorUtterance?: string;
    };

    const transcript = (body.transcript ?? "").trim();
    if (!transcript) {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 });
    }

    const store = readStore();
    const patient =
      store.patients.find((p) => p.id === body.patientId) ?? store.patients[0];
    if (!patient) {
      return NextResponse.json({ error: "No patient found" }, { status: 404 });
    }

    const evaluation = await evaluateVoiceTurnWithGroq({
      patient,
      transcript,
      phase: body.phase === "followup" ? "followup" : "initial",
      priorUtterance: body.priorUtterance,
    });

    return NextResponse.json({
      patientId: patient.id,
      evaluation,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Evaluation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

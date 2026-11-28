import { NextResponse } from "next/server";
import { runAgentTurn } from "@/lib/agent";
import { recordTurn } from "@/lib/conversations";
import { readStore } from "@/lib/store";
import type { AgentFindingView } from "@/lib/types";

export const dynamic = "force-dynamic";

/** One agent turn: extract, decide, phrase, persist. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      patientId?: string;
      transcript?: string;
      phase?: "initial" | "followup";
      priorFindings?: AgentFindingView[];
      askedQuestions?: string[];
    };

    const transcript = (body.transcript ?? "").trim();
    if (!transcript) {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 });
    }

    const store = readStore();
    const patient = store.patients.find((p) => p.id === body.patientId) ?? store.patients[0];
    if (!patient) {
      return NextResponse.json({ error: "No patient found" }, { status: 404 });
    }

    const turn = await runAgentTurn({
      patient,
      transcript,
      phase: body.phase === "followup" ? "followup" : "initial",
      priorFindings: body.priorFindings,
      askedQuestions: body.askedQuestions,
    });

    const conversationId = await recordTurn({
      patientId: patient.id,
      patientName: patient.name,
      language: patient.language,
      role: "mother",
      body: transcript,
      phase: body.phase,
    });

    if (conversationId) {
      await recordTurn({
        patientId: patient.id,
        patientName: patient.name,
        language: patient.language,
        role: "sakhi",
        body: turn.message,
        phase: body.phase,
        action: turn.action === "alert" ? "alert" : "save_remind",
        severity: turn.severity,
        ruleMatched: turn.ruleMatched,
      });
    }

    return NextResponse.json({ patientId: patient.id, conversationId, turn });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Agent turn failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

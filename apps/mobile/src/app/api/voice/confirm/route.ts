import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      patientId: string;
      spokenQuote: string;
      englishTranslation: string;
      action: "alert" | "save_remind";
      severity: "urgent" | "doubt" | "routine";
      ruleMatched: string;
      reminderNote: string;
    };

    const store = readStore();
    const patient = store.patients.find((p) => p.id === body.patientId);
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const now = new Date();
    const dateLabel = now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });

    const entryKind = body.action === "alert" ? "alert" : "saved";
    patient.entries.unshift({
      id: `entry-${Date.now()}`,
      dateLabel,
      kind: entryKind,
      spokenQuote: `“${body.spokenQuote.replace(/^“|”$/g, "")}”`,
      englishTranslation: body.englishTranslation,
      outcomeNote:
        body.action === "alert"
          ? `Alerted ${patient.ashaName} & ${patient.familyName}`
          : body.reminderNote,
      ruleMatched: body.ruleMatched,
    });

    if (body.action === "alert") {
      store.alerts.unshift({
        id: `alert-${Date.now()}`,
        patientId: patient.id,
        patientName: patient.name,
        gestationWeek: patient.gestationWeek,
        language: patient.language,
        severity: body.severity === "doubt" ? "doubt" : "urgent",
        summary: body.ruleMatched,
        spokenQuote: `“${body.spokenQuote.replace(/^“|”$/g, "")}”`,
        ashaName: patient.ashaName,
        familyName: patient.familyName,
        acknowledged: false,
        responseNote: "Health professional & partner notified · Awaiting clinic ack",
        createdAtIso: now.toISOString(),
      });
    }

    store.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      patientName: patient.name,
      timestampLabel: "Just now",
      action: body.action,
      ruleMatched: body.ruleMatched,
      transcript: body.spokenQuote,
      verifiedByDoctor: false,
    });

    writeStore(store);
    return NextResponse.json({ ok: true, store });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save turn";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

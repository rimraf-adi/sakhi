import { NextResponse } from "next/server";
import { recordCase, recordTimelineEntry } from "@/lib/conversations";
import { isDatabaseConfigured } from "@/lib/db";
import { readStore, writeStore } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * Confirms a turn: writes the timeline entry (journal) and, for an alert,
 * the case the clinic desk works from. Both the file store and Postgres are
 * updated so the agent and the dashboard read the same episode.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      patientId: string;
      conversationId?: string | null;
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
    const quote = body.spokenQuote.replace(/^[“"]|[”"]$/g, "");
    const dateLabel = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    const kind = body.action === "alert" ? "alert" : "saved";
    const outcomeNote =
      body.action === "alert"
        ? `Alerted ${patient.ashaName} & ${patient.familyName}`
        : body.reminderNote;

    patient.entries.unshift({
      id: `entry-${now.getTime()}`,
      dateLabel,
      kind,
      spokenQuote: `“${quote}”`,
      englishTranslation: body.englishTranslation,
      outcomeNote,
      ruleMatched: body.ruleMatched,
    });

    if (body.action === "alert") {
      store.alerts.unshift({
        id: `alert-${now.getTime()}`,
        patientId: patient.id,
        patientName: patient.name,
        gestationWeek: patient.gestationWeek,
        language: patient.language,
        severity: body.severity === "doubt" ? "doubt" : "urgent",
        summary: body.ruleMatched,
        spokenQuote: `“${quote}”`,
        ashaName: patient.ashaName,
        familyName: patient.familyName,
        acknowledged: false,
        responseNote: "Health professional & partner notified · Awaiting clinic ack",
        createdAtIso: now.toISOString(),
      });
    }

    store.auditLogs.unshift({
      id: `audit-${now.getTime()}`,
      patientName: patient.name,
      timestampLabel: "Just now",
      action: body.action,
      ruleMatched: body.ruleMatched,
      transcript: quote,
      verifiedByDoctor: false,
    });

    writeStore(store);

    if (isDatabaseConfigured()) {
      await recordTimelineEntry({
        patientId: patient.id,
        patientName: patient.name,
        kind,
        spokenQuote: quote,
        englishTranslation: body.englishTranslation,
        outcomeNote,
        ruleMatched: body.ruleMatched,
      });

      if (body.action === "alert") {
        await recordCase({
          conversationId: body.conversationId ?? null,
          patientId: patient.id,
          patientName: patient.name,
          severity: body.severity === "doubt" ? "amber" : "red",
          summary: body.ruleMatched,
          transcript: quote,
          ruleMatched: body.ruleMatched,
        });
      }
    }

    return NextResponse.json({ ok: true, databaseConfigured: isDatabaseConfigured() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save turn";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

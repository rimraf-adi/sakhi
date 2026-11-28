import { NextResponse } from "next/server";
import { readStore } from "@/lib/store";

export const dynamic = "force-dynamic";

const AGENT_URL = process.env.AGENT_APP_URL ?? "http://localhost:3001";

interface AgentConversation {
  id: string;
  patient_id: string;
  patient_name: string;
  language: string;
  action: string | null;
  severity: string | null;
  rule_matched: string | null;
  status: string;
  started_at: string;
  updated_at: string;
  messages: { id: number; role: string; body: string; createdAt: string }[];
}

/** Conversations live in the agent's Postgres store; read them through its API. */
async function loadConversations(): Promise<AgentConversation[]> {
  try {
    const res = await fetch(`${AGENT_URL}/api/conversations?limit=12`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = (await res.json()) as { conversations?: AgentConversation[] };
    return json.conversations ?? [];
  } catch {
    return [];
  }
}

/** Audit labels are written for humans ("14m ago", "14 Nov"); the desk formats dates. */
function labelToIso(label: string): string {
  const now = Date.now();
  const relative = label.match(/^(\d+)\s*(m|min|minute|h|hr|hour|d|day)s?\s*ago$/i);
  if (relative) {
    const amount = Number(relative[1]);
    const unit = relative[2]!.toLowerCase();
    const unitMs = unit.startsWith("m") ? 60_000 : unit.startsWith("h") ? 3_600_000 : 86_400_000;
    return new Date(now - amount * unitMs).toISOString();
  }
  if (/^just now$/i.test(label)) return new Date(now).toISOString();

  const parsed = new Date(`${label} ${new Date().getFullYear()}`);
  return Number.isNaN(parsed.getTime()) ? new Date(now).toISOString() : parsed.toISOString();
}

export async function GET() {
  const store = readStore();
  const conversations = await loadConversations();

  return NextResponse.json({
    patients: store.patients,
    alerts: store.alerts.map((alert) => ({
      ...alert,
      // The desk view speaks in triage colours, the store in plain severity.
      severity: alert.severity === "urgent" ? "red" : "amber",
      symptomSummary: alert.summary,
      transcriptSnippet: alert.spokenQuote,
      notifiedRecipients: [alert.ashaName, alert.familyName].filter(Boolean),
      createdAt: alert.createdAtIso,
    })),
    auditLogs: store.auditLogs.map((log) => ({
      id: log.id,
      timestamp: labelToIso(log.timestampLabel),
      actor: log.patientName,
      event: log.action,
      detail: log.ruleMatched,
    })),
    conversations,
  });
}

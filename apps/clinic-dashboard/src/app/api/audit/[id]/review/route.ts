import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * A clinician marking a recorded exchange as reviewed. This is the safety
 * claim made clickable: every conversation can be signed off, and the desk
 * can see what is still waiting.
 */
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = (await req.json().catch(() => ({}))) as { verified?: boolean };
  const verified = body.verified ?? true;

  const store = readStore();
  const entry = store.auditLogs.find((log) => log.id === id);
  if (!entry) {
    return NextResponse.json({ error: "Audit entry not found" }, { status: 404 });
  }

  entry.verifiedByDoctor = verified;
  entry.reviewedBy = verified ? "Dr. N. Deshpande" : undefined;
  entry.reviewedAtIso = verified ? new Date().toISOString() : undefined;
  writeStore(store);

  return NextResponse.json({ ok: true, entry });
}

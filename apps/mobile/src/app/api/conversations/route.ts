import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db";
import { listConversations } from "@/lib/conversations";

export const dynamic = "force-dynamic";

/** Recent care conversations with their turns (empty list without Postgres). */
export async function GET(req: Request) {
  const limit = Number(new URL(req.url).searchParams.get("limit") ?? 20);
  const conversations = await listConversations(Number.isFinite(limit) ? limit : 20);

  return NextResponse.json({
    databaseConfigured: isDatabaseConfigured(),
    conversations,
  });
}

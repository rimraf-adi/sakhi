import { isDatabaseConfigured, queryOne, queryRows } from "./db";

/** A care episode: everything said between the mother and Sakhi in one sitting. */
export interface ConversationRow {
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
}

export interface MessageRow {
  id: number;
  conversation_id: string;
  role: "mother" | "sakhi" | "system";
  body: string;
  language: string | null;
  phase: string | null;
  created_at: string;
}

export interface ConversationWithMessages extends ConversationRow {
  messages: { id: number; role: string; body: string; createdAt: string }[];
}

/** A sitting stays open for two hours, then a new one starts. */
const OPEN_WINDOW = "2 hours";

async function ensureConversation(input: {
  patientId: string;
  patientName: string;
  language: string;
}): Promise<ConversationRow | null> {
  const existing = await queryOne<ConversationRow>(
    `select * from conversations
      where patient_id = $1 and status = 'open'
        and updated_at > now() - interval '${OPEN_WINDOW}'
      order by updated_at desc
      limit 1`,
    [input.patientId],
  );
  if (existing) return existing;

  return queryOne<ConversationRow>(
    `insert into conversations (patient_id, patient_name, language)
     values ($1, $2, $3)
     returning *`,
    [input.patientId, input.patientName, input.language],
  );
}

/** Appends one turn and refreshes the conversation's triage metadata. */
export async function recordTurn(input: {
  patientId: string;
  patientName: string;
  language: string;
  role: "mother" | "sakhi" | "system";
  body: string;
  phase?: string;
  action?: string;
  severity?: string;
  ruleMatched?: string;
}): Promise<string | null> {
  if (!isDatabaseConfigured()) return null;
  const conversation = await ensureConversation(input);
  if (!conversation) return null;

  await queryRows(
    `insert into messages (conversation_id, role, body, language, phase)
     values ($1, $2, $3, $4, $5)`,
    [conversation.id, input.role, input.body, input.language, input.phase ?? null],
  );

  await queryRows(
    `update conversations
        set updated_at = now(),
            action = coalesce($2, action),
            severity = coalesce($3, severity),
            rule_matched = coalesce($4, rule_matched)
      where id = $1`,
    [conversation.id, input.action ?? null, input.severity ?? null, input.ruleMatched ?? null],
  );

  return conversation.id;
}

/** Opens a case the clinic desk has to answer. */
export async function recordCase(input: {
  conversationId?: string | null;
  patientId: string;
  patientName: string;
  severity: string;
  summary: string;
  transcript: string;
  ruleMatched: string;
}): Promise<void> {
  if (!isDatabaseConfigured()) return;
  await queryRows(
    `insert into cases
       (conversation_id, patient_id, patient_name, severity, summary, transcript, rule_matched)
     values ($1, $2, $3, $4, $5, $6, $7)`,
    [
      input.conversationId ?? null,
      input.patientId,
      input.patientName,
      input.severity,
      input.summary,
      input.transcript,
      input.ruleMatched,
    ],
  );
}

export async function recordTimelineEntry(input: {
  patientId: string;
  patientName: string;
  kind: "alert" | "saved";
  spokenQuote: string;
  englishTranslation: string;
  outcomeNote: string;
  ruleMatched: string;
}): Promise<void> {
  if (!isDatabaseConfigured()) return;
  await queryRows(
    `insert into timeline_entries
       (patient_id, patient_name, kind, spoken_quote, english_translation, outcome_note, rule_matched)
     values ($1, $2, $3, $4, $5, $6, $7)`,
    [
      input.patientId,
      input.patientName,
      input.kind,
      input.spokenQuote,
      input.englishTranslation,
      input.outcomeNote,
      input.ruleMatched,
    ],
  );
}

export async function acknowledgeCase(caseId: string): Promise<void> {
  if (!isDatabaseConfigured()) return;
  await queryRows(
    `update cases set status = 'acknowledged', acknowledged_at = now() where id = $1`,
    [caseId],
  );
}

/** Newest conversations with their turns, ready for either app's UI. */
export async function listConversations(limit = 20): Promise<ConversationWithMessages[]> {
  const rows = await queryRows<ConversationWithMessages>(
    `select c.*,
            coalesce(
              json_agg(
                json_build_object(
                  'id', m.id,
                  'role', m.role,
                  'body', m.body,
                  'createdAt', m.created_at
                ) order by m.created_at
              ) filter (where m.id is not null),
              '[]'
            ) as messages
       from conversations c
       left join messages m on m.conversation_id = c.id
      group by c.id
      order by c.updated_at desc
      limit $1`,
    [Math.min(limit, 50)],
  );
  return rows;
}

-- Sakhi conversation store.
-- One conversation per care episode; every mother/Sakhi turn is a message.
-- The clinic dashboard reads the same rows, so nothing is duplicated.

create extension if not exists pgcrypto;

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  patient_id text not null,
  patient_name text not null,
  language text not null default 'Hindi',
  channel text not null default 'voice',
  action text,
  severity text,
  rule_matched text,
  status text not null default 'open',
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists messages (
  id bigserial primary key,
  conversation_id uuid not null references conversations (id) on delete cascade,
  role text not null check (role in ('mother', 'sakhi', 'system')),
  body text not null,
  language text,
  phase text,
  created_at timestamptz not null default now()
);

create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations (id) on delete set null,
  patient_id text not null,
  patient_name text not null,
  severity text not null,
  summary text not null,
  transcript text not null,
  rule_matched text not null,
  status text not null default 'open',
  acknowledged_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists timeline_entries (
  id uuid primary key default gen_random_uuid(),
  patient_id text not null,
  patient_name text not null,
  kind text not null check (kind in ('alert', 'saved')),
  spoken_quote text not null,
  english_translation text,
  outcome_note text,
  rule_matched text,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_idx
  on messages (conversation_id, created_at);
create index if not exists conversations_patient_idx
  on conversations (patient_id, updated_at desc);
create index if not exists cases_status_idx
  on cases (status, created_at desc);

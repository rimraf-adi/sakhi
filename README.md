# Sakhi

A voice-first maternal care companion for pregnant women in low-resource settings, with a
companion clinic dashboard. A mother speaks for a few seconds in English; Sakhi checks her words
against MoHFW danger-sign protocols, asks at most one clarifying question, and either saves the
note to her timeline or escalates to her ASHA worker and family with her consent.

The demo ships with one seeded record so the phone opens straight on the conversation — see
[The patient record (demo mode)](#the-patient-record-demo-mode). Nothing about her medicine, week
or care team is hardcoded in a screen: every surface reads it from that record.

What the demo shows end to end, with or without API keys:

- a spoken check-in, one clarifying question, and a consent prompt before anything is sent;
- the escalation arriving at the OPD desk, the nurse acknowledging it, and **her phone showing who
  picked it up and when** — the loop closing on both screens;
- a WhatsApp-style record of exactly what left her phone, with her own words and the rule matched;
- a **one-page pre-visit summary for the doctor**, derived from her timeline, not authored;
- a clinician **mark-reviewed** action on the safety audit trail;
- her iron/folic-acid grid with a streak and a weekly recap read aloud.

---

## Contents

- [What this repository contains](#what-this-repository-contains)
- [How the system fits together](#how-the-system-fits-together)
- [The agent, in three layers](#the-agent-in-three-layers)
- [The patient record (demo mode)](#the-patient-record-demo-mode)
- [Running without API keys](#running-without-api-keys)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [HTTP API](#http-api)
- [Data model and storage](#data-model-and-storage)
- [Repository layout](#repository-layout)
- [Design constraints](#design-constraints)
- [Known limitations](#known-limitations)
- [Future scope](#future-scope)

---

## What this repository contains

| App | Port | Purpose |
| --- | --- | --- |
| `apps/mobile` | 3001 | The mother's app: voice conversation, Circle, Pregnancy Journal |
| `apps/clinic-dashboard` | 3002 | The OPD desk: live escalations, ANC intake, cohort timelines, safety audit |
| `apps/landing-page` | 3000 | Marketing site describing the product and its safeguarding model |
| `apps/video` | 3003 | Remotion composition used to render the pitch video |

The two product apps are Next.js 15 (App Router) and share one JSON record on disk (and,
optionally, one Postgres database), so a conversation started on the phone is immediately
visible to the clinic desk.

## How the system fits together

```
        ┌──────────────────────────┐        ┌──────────────────────────┐
        │  apps/mobile (3001)      │        │ clinic-dashboard (3002)  │
        │                          │        │                          │
        │  Demo record ┐           │        │  ANC intake ─┐           │
        │  Voice ──────┼─► /api/*  │        │  Escalations ┼─► /api/*  │
        │  Circle ─────┤           │        │  Timelines   │           │
        │  Journal ────┘           │        │  Audit       ┘           │
        └────────────┬─────────────┘        └──────────────┬───────────┘
                     │                                     │
                     ▼                                     ▼
          data/sakhi-store.json  ◄──── shared record ────►  (read on every request)
                     │
                     ▼  optional, when DATABASE_URL is set
          Postgres: conversations · messages · cases · timeline_entries
```

- The file store is the default and needs no services. It is git-ignored and created on first write.
- Postgres is optional. Without `DATABASE_URL` the conversation helpers return empty results and
  every screen still works.
- The dashboard polls its own `/api/dashboard` every two seconds; that route reads the shared
  record and pulls recent conversations from the agent app's `/api/conversations`.

## The agent, in three layers

`apps/mobile/src/lib/agent.ts` is deliberately one-way:

1. **Extraction** — a Groq model reads one message (English in the demo; Romanized Hindi and
   Marathi are also handled by the prompt) and lists only the symptoms she actually mentioned, as
   `present`, `negated` or `uncertain`. Its output is validated against a fixed sign list; anything
   else is dropped.
2. **Decision** — `triage.ts` applies deterministic MoHFW rules. Neither the model nor the copy
   layer can escalate: escalation requires a confirmed danger sign, the pre-eclampsia cluster
   (headache with vision change or swelling), or an unresolved uncertainty on a danger sign.
3. **Phrasing** — `agentCopy.ts` turns that decision into one short sentence in her language
   (English by default; Hindi and Marathi lines are already written), using her name, her ASHA
   worker and her family contact from her own record.

If no API key is configured, or `SAKHI_STRICT_RULES=1` is set, extraction falls back to the same
regex rules — the triage outcome is unchanged.

A turn ends in one of three actions:

| Action | Meaning |
| --- | --- |
| `ask` | One clarifying question, chosen to settle the sign that would change the decision |
| `save_remind` | Routine; written to her timeline with a reminder note |
| `alert` | A consent prompt; on confirmation the ASHA worker, family contact and clinic case are notified |

## The patient record (demo mode)

The mobile app no longer runs an onboarding flow: it opens straight on Sakhi's voice screen. The
record it reads is one seeded demo profile in `apps/mobile/src/lib/demo.ts` (`DEMO_PATIENT`):

- name and gestation — Sunita, week 28+2
- language — English (`en-IN`)
- care team — ASHA "Meena didi", family contact "Rakesh (pati)"
- next ANC visit and the **daily care item** she tracks (Iron + folic acid, 12 of 28 days)
- baseline vitals and one past journal entry

`store.ts` writes that profile into `data/sakhi-store.json` the first time the store is read, so the
clinic desk and the phone work from the same file. Nothing about the medicine, the week or the
people she escalates to is hardcoded in a screen: the Journal, Circle header, alert copy and
reminder text all read `supplementName`, `gestationWeek`, `ashaName` and `familyName` from the
record. Swapping the object in `demo.ts` swaps the whole demo.

If the store comes back empty (for example the dashboard's *Reset demo* button), the phone falls
back to the same seeded record instead of showing an empty screen.

The clinic dashboard still has its ANC intake form, which writes the same record shape into the
same store, and a profile added there appears on the phone. `POST /api/patients` still exists for
that and for scripts; nothing in the mobile UI calls it today.

Records written before the care-item rename are migrated on read: legacy `ironDays*` fields are
mapped onto `supplementDays*`, and missing clinical readings stay empty rather than being filled
with made-up values.

### Running without API keys

The demo is designed to run with no keys at all:

- **Voice out** — Sakhi's lines are fetched from `/api/voice/tts` (Sarvam). With no `SARVAM_API_KEY`
  that call returns 503 and `useSpeech` falls back to the browser's `speechSynthesis` voice. The
  voice screen labels this as `device voice` so nobody thinks the live engine is running.
- **Voice in** — with no `GROQ_API_KEYS`, `/api/status` reports `voiceInput: false` and the mic uses
  the browser's own `SpeechRecognition` (`en-IN`). If the browser has no recogniser, three English
  prompt chips run the identical turn through `/api/voice/respond`.
- **Triage** — the rules engine is deterministic regex, so danger-sign detection needs no model.

`GET /api/status` returns `{ voiceInput, voiceOutput }` as booleans only; key values never leave the
server.

## Getting started

Requirements: Node.js 20 or newer, npm 11. No API keys, Docker or database are required to run.

```bash
npm install

# Run every app with Turborepo (landing page, mobile, dashboard, video studio)
npm run dev

# …or run one app
npm run dev --workspace @sakhi/mobile          # http://localhost:3001
npm run dev --workspace @sakhi/clinic-dashboard # http://localhost:3002
```

Open `http://localhost:3001` — it lands straight on Sakhi's voice screen — then tap the mic or one
of the English prompt chips to run a full turn. If an alert is raised and you confirm it, open the
dashboard on `http://localhost:3002`, press **Acknowledge and call**, and watch her phone switch to
"Sr. Anita Deshmukh has seen this" within three seconds.

Optional live LLM extraction and transcription need `GROQ_API_KEYS`; natural
text-to-speech needs `SARVAM_API_KEY`. Without them the app uses this device's own recogniser and
voice, and the deterministic rules engine — the flow is identical.

Optional Postgres:

```bash
docker compose up -d
export DATABASE_URL=postgres://sakhi:sakhi@localhost:5432/sakhi
```

`db/schema.sql` is applied automatically by the compose image on first boot.

## Environment variables

Copy `.env.example` to `.env` and fill in only what you need.

| Variable | Required | Effect when absent |
| --- | --- | --- |
| `GROQ_API_KEYS` | No | Regex triage only; recording still works, transcription reports the missing key |
| `SARVAM_API_KEY` | No | Device/browser speech synthesis |
| `DATABASE_URL` | No | Conversation and case history live only in `data/sakhi-store.json` |
| `SAKHI_STRICT_RULES` | No | Set to `1` to force the deterministic extractor |
| `AGENT_APP_URL` | No | Dashboard reads conversations from `http://localhost:3001` |

Keys are read server-side only. `.env` and `.env*.local` are git-ignored.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | All apps via Turborepo |
| `npm run build` | Production build for every workspace |
| `npm run lint` | ESLint (Next apps) and typecheck (video) |
| `npm run typecheck` | `tsc --noEmit` per workspace |

Each app also exposes `dev`, `build`, `lint` and `typecheck` individually, and the mobile and
dashboard apps expose `start`.

## HTTP API

### Patient app (`apps/mobile`)

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/status` | `GET` | Which live voice features have keys (booleans only) |
| `/api/patients` | `GET` | Every stored profile |
| `/api/patients` | `POST` | Create a profile (desk intake, scripts) |
| `/api/patients/supplement` | `POST` | Toggle today's care item for one profile |
| `/api/alerts` | `GET` | Her latest escalation and whether the desk has picked it up |
| `/api/voice/transcribe` | `POST` | Audio → transcript (multipart) |
| `/api/voice/respond` | `POST` | One agent turn: extract, decide, phrase, persist |
| `/api/voice/confirm` | `POST` | Commit a turn: timeline entry, alert, audit log, case |
| `/api/voice/tts` | `POST` | Text → speech audio |
| `/api/circle` | `GET` / `POST` | Week-circle feed |
| `/api/conversations` | `GET` | Recent conversations with messages (empty without Postgres) |

### Clinic dashboard (`apps/clinic-dashboard`)

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/dashboard` | `GET` | Cohort, alerts, audit log and live conversations |
| `/api/patients` | `POST` | Register an ANC intake |
| `/api/alerts/[id]/ack` | `POST` | Acknowledge an escalation (her phone then shows who and when) |
| `/api/audit/[id]/review` | `POST` | Mark a recorded exchange reviewed by a clinician |
| `/api/reset` | `POST` | Clear the local record back to an empty cohort |

## Data model and storage

`PatientRecord` (`apps/mobile/src/lib/types.ts`) is the shared unit:

- identity and gestation — `id`, `name`, `gestationWeek`, `gestationDay`
- language — `language`, `speechLang`
- care team — `ashaName`, `familyName`, `nextVisitLabel`
- adherence — `supplementName`, `supplementDaysCompleted`, `supplementDaysTotal`, `supplementTakenToday`
- clinical — `vitals` (empty until recorded), `entries` (the journal timeline)

Around it sit `EscalationAlert`, `AuditLogEntry`, `CirclePost` and `AgentTurn`.

The JSON store is a single file, `data/sakhi-store.json`, resolved relative to each app's working
directory. Both apps read and write the same file, and both normalise legacy shapes on read.

Postgres mirrors the conversation side (`conversations`, `messages`, `cases`, `timeline_entries`)
with indexes on conversation time, patient history and open cases. All writes use bound
parameters.

## Repository layout

```
apps/
  mobile/            patient app: voice agent, Circle, Journal
    src/app/api/     route handlers
    src/components/  screens and voice UI
    src/hooks/       data, speech and voice-session state
    src/lib/         agent, triage, copy, store, journal, conversations
  clinic-dashboard/  OPD desk
  landing-page/      marketing site
  video/             Remotion pitch composition
db/schema.sql        Postgres schema for conversations, cases and timelines
docs/                product decisions, palette, pitch deck sources
packages/            shared TypeScript configuration
```

## Design constraints

- **The model never decides urgency.** Extraction is model-assisted; triage is not. A missed
  tablet with "no dizziness" stays routine instead of paging anyone.
- **Consent before notification.** An escalation is only sent after she confirms, in her language.
- **One question at a time.** Routine turns get one clarifying question; only an unresolved danger
  sign earns a second.
- **No invented clinical data in the flow.** Profiles created through either intake form start
  with empty vitals, and the Journal shows "Not recorded" instead of a plausible-looking number.
  The single exception is the deliberate demo record, which carries a sample BP so the Journal is
  not blank on stage.
- **Nothing personal is hardcoded in a screen.** Names, weeks, languages, care items and escalation
  contacts come from the record; the seeded profile in `lib/demo.ts` is data the store reads, not a
  constant baked into the UI.

## Known limitations

- The file store is single-machine and has no locking; it is meant for local demos and pilots.
  Use `DATABASE_URL` for anything concurrent.
- **The demo speaks English only.** Hindi and Marathi copy is still wired end to end (see
  [Future scope](#future-scope)), but the seeded record, the prompt chips and the default
  transcription locale are all English, because that is what the judges can follow.
- `apps/video` and the marketing site contain fixed scripted content for the pitch; they are not
  connected to the live record.
- The dashboard's "under 2 hours" and similar headline metrics are pilot targets, not measured
  outcomes.

## Future scope

- **Hindi and Marathi voice.** `PatientLanguage` and `SpeechLang` already include both,
  `lib/agentCopy.ts` carries every Sakhi line in `en`/`hi`/`mr`, `lib/scenarios.ts` has Romanized
  Hindi and Marathi prompt sets, and `store.ts` maps each language to its speech locale
  (`hi-IN`, `mr-IN`). Switching a record's `language` and `speechLang` is enough to run the same
  flow in either language - what is missing is a deliberate language picker and a review of the
  Hindi/Marathi phrasings by a native speaker. The label, consent and fallback strings for the
  three languages are already in `UI` in `components/VoiceScreen.tsx`.
- **First-run onboarding.** A one-question-at-a-time voice setup (name, week, language, care team,
  daily care item) that writes the same record, replacing the seeded demo profile on a real device.
- **Maternal language QA.** The triage rules are English-regex based; the Romanized Hindi/Marathi
  utterances in `scenarios.ts` exercise them, but a wider phrase set per language is needed before
  a pilot.
- **Per-language TTS voices.** Sarvam Bulbul supports `hi-IN` and `mr-IN`; the keyless fallback
  depends on whichever device voices the browser ships.

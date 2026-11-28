# Sakhi

A voice-first maternal care companion for pregnant women in low-resource settings, with a
companion clinic dashboard. A mother speaks for a few seconds in Hindi or Marathi; Sakhi checks
her words against MoHFW danger-sign protocols, asks at most one clarifying question, and either
saves the note to her timeline or escalates to her ASHA worker and family with her consent.

Every woman's profile is created at runtime — from her own onboarding or from the OPD desk.
There are no seeded demo personas and no hardcoded medicine names in the product flow.

---

## Contents

- [What this repository contains](#what-this-repository-contains)
- [How the system fits together](#how-the-system-fits-together)
- [The agent, in three layers](#the-agent-in-three-layers)
- [Onboarding and the patient record](#onboarding-and-the-patient-record)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [HTTP API](#http-api)
- [Data model and storage](#data-model-and-storage)
- [Repository layout](#repository-layout)
- [Design constraints](#design-constraints)
- [Known limitations](#known-limitations)

---

## What this repository contains

| App | Port | Purpose |
| --- | --- | --- |
| `apps/mobile` | 3001 | The mother's app: onboarding, voice conversation, Circle, Pregnancy Journal |
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
        │  Onboarding ─┐           │        │  ANC intake ─┐           │
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

1. **Extraction** — a Groq model reads one message written in Romanized Hindi or Marathi and lists
   only the symptoms she actually mentioned, as `present`, `negated` or `uncertain`. Its output is
   validated against a fixed sign list; anything else is dropped.
2. **Decision** — `triage.ts` applies deterministic MoHFW rules. Neither the model nor the copy
   layer can escalate: escalation requires a confirmed danger sign, the pre-eclampsia cluster
   (headache with vision change or swelling), or an unresolved uncertainty on a danger sign.
3. **Phrasing** — `agentCopy.ts` turns that decision into one short sentence in her language,
   using her name, her ASHA worker and her family contact from her own record.

If no API key is configured, or `SAKHI_STRICT_RULES=1` is set, extraction falls back to the same
regex rules — the triage outcome is unchanged.

A turn ends in one of three actions:

| Action | Meaning |
| --- | --- |
| `ask` | One clarifying question, chosen to settle the sign that would change the decision |
| `save_remind` | Routine; written to her timeline with a reminder note |
| `alert` | A consent prompt; on confirmation the ASHA worker, family contact and clinic case are notified |

## Onboarding and the patient record

The app has no built-in patients. On first launch `apps/mobile` shows `OnboardingScreen`, which
collects:

- name, gestation week and day
- spoken language (Hindi or Marathi)
- health worker and family escalation contact
- next ANC visit
- the **daily care item** she is tracking — free text plus a course length in days

That input is sent to `POST /api/patients`, which builds the record (id, speech locale, zeroed
adherence counters) and persists it. Nothing about the medicine, the week or the people she
escalates to is assumed anywhere else: the Journal, Circle header and reminder copy all read
`supplementName`, `gestationWeek`, `ashaName` and `familyName` from that record.

The same rule holds in the clinic dashboard's ANC intake, which writes the same record shape into
the same store. Profiles added in either app appear in the other.

A profile created before onboarding existed is migrated on read: legacy `ironDays*` fields are
mapped onto `supplementDays*`, and missing clinical readings stay empty rather than being filled
with made-up values.

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

Open `http://localhost:3001`, complete onboarding, then speak or tap one of the sample utterances
to run a full turn. The alert it produces appears on the dashboard within two seconds.

Optional live speech and LLM features need `GROQ_API_KEYS`; natural Hindi/Marathi
text-to-speech needs `SARVAM_API_KEY`. Without them the app uses the browser voice and the
deterministic rules engine.

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
| `/api/patients` | `GET` | Every stored profile |
| `/api/patients` | `POST` | Create a profile from onboarding |
| `/api/patients/supplement` | `POST` | Toggle today's care item for one profile |
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
| `/api/alerts/[id]/ack` | `POST` | Acknowledge an escalation |
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
  mobile/            patient app: onboarding, voice agent, Circle, Journal
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
- **No invented clinical data.** New profiles start with empty vitals, and the Journal shows
  "Not recorded" instead of a plausible-looking number.
- **Nothing personal is hardcoded.** Names, weeks, languages, care items and escalation contacts
  come from the record, not from constants.

## Known limitations

- The file store is single-machine and has no locking; it is meant for local demos and pilots.
  Use `DATABASE_URL` for anything concurrent.
- Hindi and Marathi are the supported voice languages; the clinic intake form lists more, but the
  agent coerces unsupported choices to Hindi.
- `apps/video` and the marketing site contain fixed scripted content for the pitch; they are not
  connected to the live record.
- The dashboard's "under 2 hours" and similar headline metrics are pilot targets, not measured
  outcomes.

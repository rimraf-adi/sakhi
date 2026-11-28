"use client";

import { useState } from "react";
import { ArrowRight, Loader2, ShieldCheck, UserPlus } from "lucide-react";
import type { NewPatientInput, Patient, PatientLanguage } from "@/lib/types";

interface OnboardingScreenProps {
  /** Profiles already stored on this device, so a shared phone can switch. */
  existing: Patient[];
  onCreate: (input: NewPatientInput) => Promise<boolean>;
  onSelect: (patientId: string) => void;
  onClose?: () => void;
}

type FormState = {
  name: string;
  gestationWeek: string;
  gestationDay: string;
  language: PatientLanguage;
  ashaName: string;
  familyName: string;
  nextVisitLabel: string;
  supplementName: string;
  supplementDaysTotal: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  gestationWeek: "",
  gestationDay: "0",
  language: "Hindi",
  ashaName: "",
  familyName: "",
  nextVisitLabel: "",
  supplementName: "",
  supplementDaysTotal: "28",
};

const fieldClass =
  "h-11 w-full rounded-xl border border-[#DDD3C0] bg-white px-3 text-[13px] font-medium text-[#101828] outline-none transition focus:border-[#0F4C3A]";

const labelClass = "mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#667085]";

export function OnboardingScreen({
  existing,
  onCreate,
  onSelect,
  onClose,
}: OnboardingScreenProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const week = Number(form.gestationWeek);
    if (!form.name.trim()) {
      setError("Please enter her name.");
      return;
    }
    if (!Number.isFinite(week) || week < 1 || week > 42) {
      setError("Gestation week should be between 1 and 42.");
      return;
    }

    setSaving(true);
    setError(null);
    const created = await onCreate({
      name: form.name,
      gestationWeek: week,
      gestationDay: Number(form.gestationDay) || 0,
      language: form.language,
      ashaName: form.ashaName,
      familyName: form.familyName,
      nextVisitLabel: form.nextVisitLabel,
      supplementName: form.supplementName,
      supplementDaysTotal: Number(form.supplementDaysTotal) || 28,
    });
    setSaving(false);

    if (!created) {
      setError("Could not save the profile. Check the connection and try again.");
    }
  };

  return (
    <div className="flex min-h-[100dvh] w-full justify-center bg-[#FAF6EE] text-[#101828]">
      <div className="flex w-full max-w-[600px] flex-col px-5 pb-8 pt-8">
        <div className="mb-6">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#DDD3C0] bg-white px-2.5 py-1 text-[10.5px] font-semibold text-[#0F4C3A]">
            <ShieldCheck size={11} />
            Hospital-owned record
          </div>
          <h1 className="font-serif text-[27px] font-bold leading-tight">
            {existing.length > 0 ? "Profiles on this phone" : "Let's set up her Sakhi"}
          </h1>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#475467]">
            {existing.length > 0
              ? "Continue as an existing mother, or register a new one. Everything on the next screens comes from the profile you pick."
              : "A few details and Sakhi starts in her own language. Nothing is pre-filled: the profile is built from what you enter here."}
          </p>
        </div>

        {existing.length > 0 && (
          <div className="mb-6 space-y-2">
            {existing.map((patient) => (
              <button
                key={patient.id}
                type="button"
                onClick={() => onSelect(patient.id)}
                className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#DDD3C0] bg-white px-3.5 py-3 text-left transition hover:border-[#0F4C3A]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[13.5px] font-bold">{patient.name}</span>
                  <span className="mt-0.5 block text-[11px] text-[#667085]">
                    Week {patient.gestationWeek} · {patient.language} ·{" "}
                    {patient.supplementName}
                  </span>
                </span>
                <ArrowRight size={15} className="shrink-0 text-[#0F4C3A]" />
              </button>
            ))}
          </div>
        )}

        <form onSubmit={submit} className="space-y-3.5">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#0F4C3A]">
            <UserPlus size={13} />
            {existing.length > 0 ? "Register a new mother" : "New profile"}
          </div>

          <div>
            <label className={labelClass} htmlFor="onboarding-name">
              Full name
            </label>
            <input
              id="onboarding-name"
              className={fieldClass}
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="As on the ANC card"
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="col-span-2">
              <label className={labelClass} htmlFor="onboarding-week">
                Gestation week
              </label>
              <input
                id="onboarding-week"
                className={fieldClass}
                type="number"
                min={1}
                max={42}
                inputMode="numeric"
                value={form.gestationWeek}
                onChange={(event) => update("gestationWeek", event.target.value)}
                placeholder="e.g. 28"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="onboarding-day">
                Day
              </label>
              <input
                id="onboarding-day"
                className={fieldClass}
                type="number"
                min={0}
                max={6}
                inputMode="numeric"
                value={form.gestationDay}
                onChange={(event) => update("gestationDay", event.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="onboarding-language">
              Spoken language
            </label>
            <select
              id="onboarding-language"
              className={fieldClass}
              value={form.language}
              onChange={(event) =>
                update("language", event.target.value === "Marathi" ? "Marathi" : "Hindi")
              }
            >
              <option value="Hindi">Hindi</option>
              <option value="Marathi">Marathi</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className={labelClass} htmlFor="onboarding-asha">
                Health worker
              </label>
              <input
                id="onboarding-asha"
                className={fieldClass}
                value={form.ashaName}
                onChange={(event) => update("ashaName", event.target.value)}
                placeholder="ASHA / ANM name"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="onboarding-family">
                Family contact
              </label>
              <input
                id="onboarding-family"
                className={fieldClass}
                value={form.familyName}
                onChange={(event) => update("familyName", event.target.value)}
                placeholder="Name (relation)"
              />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="onboarding-visit">
              Next ANC visit
            </label>
            <input
              id="onboarding-visit"
              className={fieldClass}
              value={form.nextVisitLabel}
              onChange={(event) => update("nextVisitLabel", event.target.value)}
              placeholder="e.g. ANC Visit 3 · 24 Nov"
            />
          </div>

          <div className="rounded-xl border border-[#EAE3D5] bg-[#F7F1E4] p-3.5">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#0F4C3A]">
              Daily care item to track
            </div>
            <div className="grid grid-cols-[1.6fr_1fr] gap-2.5">
              <input
                className={fieldClass}
                aria-label="Daily care item"
                value={form.supplementName}
                onChange={(event) => update("supplementName", event.target.value)}
                placeholder="e.g. Iron + folic acid"
              />
              <input
                className={fieldClass}
                aria-label="Course length in days"
                type="number"
                min={1}
                max={365}
                inputMode="numeric"
                value={form.supplementDaysTotal}
                onChange={(event) => update("supplementDaysTotal", event.target.value)}
                placeholder="Days"
              />
            </div>
            <p className="mt-2 text-[10.5px] leading-relaxed text-[#667085]">
              Whatever the clinic prescribes for her. Sakhi tracks it by name and never assumes a
              specific medicine.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-[#F6C667]/50 bg-[#FFFAEB] px-3 py-2 text-[11.5px] text-[#B54708]">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2.5 pt-1">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="h-11 cursor-pointer rounded-xl border border-[#DDD3C0] px-4 text-[12.5px] font-semibold text-[#475467] transition hover:bg-white"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0F4C3A] text-[13px] font-semibold text-[#FAF6EE] transition hover:bg-[#12604A] disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving…
                </>
              ) : (
                "Start with Sakhi"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

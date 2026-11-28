"use client";

import { useState } from "react";
import { CircleScreen } from "@/components/CircleScreen";
import { JournalScreen } from "@/components/JournalScreen";
import { OnboardingScreen } from "@/components/OnboardingScreen";
import { TabBar } from "@/components/TabBar";
import { VoiceScreen } from "@/components/VoiceScreen";
import { useSakhiData } from "@/hooks/useSakhiData";
import { useSpeech } from "@/hooks/useSpeech";
import { useVoiceSession } from "@/hooks/useVoiceSession";
import type { MobileTab } from "@/lib/types";

/**
 * Sakhi agent app: one mother, one conversation.
 * Voice writes the turns, the Circle and Journal read the same store.
 */
export default function SakhiAgentPage() {
  const data = useSakhiData();
  const speech = useSpeech();
  const [activeTab, setActiveTab] = useState<MobileTab>("voice");
  const [showProfiles, setShowProfiles] = useState(false);

  const session = useVoiceSession({
    patient: data.patient,
    speech,
    onDataChanged: () => void data.reload(),
  });

  const patient = data.patient;
  const dark = activeTab === "voice";
  const mustOnboard = !data.loading && data.patients.length === 0;

  if (data.loading) {
    return (
      <div className="grid h-[100dvh] place-items-center bg-[#FAF6EE] px-6 text-center text-sm text-[#667085]">
        Sakhi is getting ready…
      </div>
    );
  }

  if (mustOnboard || showProfiles) {
    return (
      <OnboardingScreen
        existing={data.patients}
        onSelect={(patientId) => {
          data.selectPatient(patientId);
          setShowProfiles(false);
        }}
        onClose={mustOnboard ? undefined : () => setShowProfiles(false)}
        onCreate={async (input) => {
          const created = await data.enroll(input);
          if (!created) return false;
          setShowProfiles(false);
          setActiveTab("voice");
          return true;
        }}
      />
    );
  }

  if (!patient) {
    return (
      <div className="grid h-[100dvh] place-items-center bg-[#FAF6EE] px-6 text-center text-sm text-[#667085]">
        {data.loadError ?? "No profile on this phone yet."}
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-[100dvh] w-full justify-center transition-colors duration-300 ${
        dark ? "bg-[#0B1715] text-[#FAF6EE]" : "bg-[#FAF6EE] text-[#101828]"
      }`}
    >
      <div className="relative flex h-[100dvh] w-full max-w-[600px] flex-col overflow-hidden">
        {activeTab === "voice" && (
          <VoiceScreen patient={patient} session={session} onOpenTab={setActiveTab} />
        )}

        {activeTab === "feed" && (
          <CircleScreen
            patient={patient}
            posts={data.posts}
            phase={session.phase}
            careNote={session.lastTurn?.guidanceAfterConsent ?? null}
            playingId={speech.playingId}
            onPlay={(id, text, lang) => void speech.play(id, text, lang)}
            onPublish={async (input) => {
              await data.publishPost({ patientId: patient.id, ...input });
            }}
            onToggleSupplement={() => void data.toggleSupplementToday(patient.id)}
            onSwitchProfile={() => setShowProfiles(true)}
          />
        )}

        {activeTab === "journal" && (
          <JournalScreen
            patient={patient}
            phase={session.phase}
            initialUtterance={session.initialUtterance}
            latestOutcome={session.lastTurn?.reminderNote ?? null}
            playingId={speech.playingId}
            onPlay={(id, text) => void speech.play(id, text, patient.speechLang)}
            onToggleSupplement={() => void data.toggleSupplementToday(patient.id)}
            onSwitchProfile={() => setShowProfiles(true)}
          />
        )}

        {data.loadError && (
          <div className="absolute inset-x-4 bottom-20 z-20 rounded-lg border border-[#F6C667]/40 bg-[#FFFAEB] px-3 py-2 text-[11px] text-[#B54708]">
            {data.loadError}
          </div>
        )}

        <TabBar activeTab={activeTab} onChange={setActiveTab} dark={dark} />
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import type { CirclePost, NewPatientInput, Patient } from "@/lib/types";

export interface SakhiData {
  patients: Patient[];
  patient: Patient | null;
  selectedPatientId: string;
  loading: boolean;
  selectPatient: (patientId: string) => void;
  posts: CirclePost[];
  loadError: string | null;
  reload: () => Promise<void>;
  enroll: (input: NewPatientInput) => Promise<Patient | null>;
  publishPost: (input: {
    patientId: string;
    text: string;
    withVoice: boolean;
  }) => Promise<CirclePost | null>;
  toggleSupplementToday: (patientId: string) => Promise<void>;
}

/** Single source of truth for everything the screens read. */
export function useSakhiData(): SakhiData {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [posts, setPosts] = useState<CirclePost[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const [patientsRes, postsRes] = await Promise.all([
        fetch("/api/patients", { cache: "no-store" }),
        fetch("/api/circle", { cache: "no-store" }),
      ]);
      if (!patientsRes.ok) throw new Error(`patients ${patientsRes.status}`);

      const patientsJson = (await patientsRes.json()) as { patients?: Patient[] };
      setPatients(patientsJson.patients ?? []);
      setSelectedPatientId((current) => current || patientsJson.patients?.[0]?.id || "");
      setLoadError(null);

      if (postsRes.ok) {
        const postsJson = (await postsRes.json()) as { posts?: CirclePost[] };
        setPosts(postsJson.posts ?? []);
      }
    } catch {
      setLoadError("Could not reach the Sakhi store. Retrying works once the server is up.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  /** Enrolls a mother from onboarding and makes her the active profile. */
  const enroll = useCallback(
    async (input: NewPatientInput) => {
      try {
        const res = await fetch("/api/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (!res.ok) return null;

        const json = (await res.json()) as { patient?: Patient };
        if (!json.patient) return null;

        setPatients((current) => [
          json.patient!,
          ...current.filter((item) => item.id !== json.patient!.id),
        ]);
        setSelectedPatientId(json.patient.id);
        setLoadError(null);
        return json.patient;
      } catch {
        return null;
      }
    },
    [],
  );

  const publishPost = useCallback(
    async (input: { patientId: string; text: string; withVoice: boolean }) => {
      try {
        const res = await fetch("/api/circle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (!res.ok) return null;
        const json = (await res.json()) as { post?: CirclePost };
        if (!json.post) return null;
        setPosts((current) => [json.post!, ...current]);
        return json.post;
      } catch {
        return null;
      }
    },
    [],
  );

  const toggleSupplementToday = useCallback(async (patientId: string) => {
    try {
      const res = await fetch("/api/patients/supplement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId }),
      });
      if (!res.ok) return;
      const json = (await res.json()) as { patient?: Patient };
      if (!json.patient) return;
      setPatients((current) =>
        current.map((item) => (item.id === json.patient!.id ? json.patient! : item)),
      );
    } catch {
      // Keep the previous value when the store is unreachable.
    }
  }, []);

  const patient = patients.find((item) => item.id === selectedPatientId) ?? patients[0] ?? null;

  return {
    patients,
    patient,
    selectedPatientId,
    loading,
    selectPatient: setSelectedPatientId,
    posts,
    loadError,
    reload,
    enroll,
    publishPost,
    toggleSupplementToday,
  };
}

"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchExerciseById, getMyPreferences } from "@/lib/api/api";
import { ExerciseRunner } from "@/app/components/exercise/ExerciseRunner";
import { DEFAULTS, type Prefs } from "@/lib/prefs";

export default function ExercisePage({
  params,
}: {
  params: Promise<{ code: string; topic: string; id: string }>;
}) {
  const { id } = use(params);

  const { data: exercise, isLoading, error } = useQuery({
    queryKey: ["exercise", id],
    queryFn: () => fetchExerciseById(id),
  });

  const { data: prefs } = useQuery({
    queryKey: ["preferences"],
    queryFn: async () => {
      const data = await getMyPreferences();
      if (!data) return null;
      const pref = data as Partial<Prefs> & {
        practice?: Partial<Prefs["practice"]>;
      };
      return {
        ...DEFAULTS,
        ...pref,
        practice: { ...DEFAULTS.practice, ...(pref.practice ?? {}) },
      } as Prefs;
    },
    retry: false,
  });

  if (isLoading) return <div className="p-8 text-white/70">Cargando ejercicio…</div>;
  if (error || !exercise) return <div className="p-8 text-white/70">No se pudo cargar el ejercicio.</div>;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <ExerciseRunner exercise={exercise} preferences={prefs ?? null} />
    </main>
  );
}

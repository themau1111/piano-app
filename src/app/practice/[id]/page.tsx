"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchExerciseById, getMyPreferences } from "@/lib/api/api";
import { ExerciseRunner } from "@/app/components/exercise/ExerciseRunner";
import { DEFAULTS, type Prefs } from "@/lib/prefs";
import { useNotationLocale } from "@/app/hooks/useNotationLocale";
import { PracticeConfigurator } from "@/app/components/practice/PracticeConfigurator";

export default function PracticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { locale } = useNotationLocale();
  const { data: exercise, isLoading } = useQuery({ queryKey: ["exercise", id], queryFn: () => fetchExerciseById(id) });
  const { data: prefs } = useQuery({ queryKey: ["preferences"], queryFn: async () => {
    const data = await getMyPreferences();
    return data ? ({ ...DEFAULTS, ...(data as Partial<Prefs>), practice: { ...DEFAULTS.practice, ...((data as Partial<Prefs>).practice ?? {}) } } as Prefs) : null;
  }, retry: false });
  if (isLoading || !exercise) return <main className="p-8 text-white/70">Cargando práctica…</main>;
  return <PracticeConfigurator exercise={exercise} locale={locale} renderRunner={(practice) => <ExerciseRunner exercise={exercise} preferences={prefs ?? null} practice={practice} />} />;
}

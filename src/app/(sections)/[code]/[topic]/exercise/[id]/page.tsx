"use client";
import { use } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { fetchExercisesByTopicId } from "@/lib/api/api";

const ChordExercise = dynamic(() => import("@/app/components/ChordExercise"), {
  ssr: false,
});

export default function ExerciseRunnerPage({ params }: { params: Promise<{ code: string; topic: string; id: string }> }) {
  const { id, code, topic } = use(params);

  const {
    data: exercise,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["exercise", id],
    queryFn: () => fetchExercisesByTopicId(id),
  });

  if (isLoading) return <div className="p-8">Cargando ejercicio…</div>;
  if (error || !exercise) return <div className="p-8">No se pudo cargar el ejercicio.</div>;

  console.log(exercise, "exercise");

  return (
    <main className="max-w-4xl mx-auto py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{exercise[0].title}</h1>
          <p className="opacity-70 text-sm">{exercise[0].description}</p>
        </div>
        <span className="text-xs uppercase opacity-60">{exercise[0].kind}</span>
      </div>

      {/* Runners por tipo */}
      {exercise[0].kind === "ear_intervals" && <ChordExercise level={exercise[0].config?.level ?? "basic"} />}
      {exercise[0].kind === "chord" && <ChordExercise level={exercise[0].config?.level ?? "basic"} />}

      {/* TODO: interval / scale */}
    </main>
  );
}

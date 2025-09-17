"use client";
import { fetchExercisesBySection, fetchSections } from "@/app/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export default function SectionPage({ params }: { params: { code: string } }) {
  const { data: sections } = useQuery({ queryKey: ["sections"], queryFn: fetchSections });
  const section = useMemo(() => sections?.find((s: any) => s.code === params.code), [sections, params.code]);

  const { data: exercises, isLoading } = useQuery({
    enabled: !!section,
    queryKey: ["exercises", section?.id],
    queryFn: () => fetchExercisesBySection(section!.id),
  });

  if (!section) return <div className="p-8">Sección no encontrada…</div>;
  if (isLoading) return <div className="p-8">Cargando ejercicios…</div>;

  return (
    <main className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-semibold">{section.title}</h1>
      <p className="opacity-70">{section.description}</p>

      <ul className="mt-6 grid gap-3">
        {exercises?.map((ex: any) => (
          <li key={ex.id} className="rounded-xl border p-4">
            <div className="text-sm opacity-70">{ex.kind}</div>
            <div className="font-medium">{ex.title}</div>
            <pre className="text-xs opacity-60 mt-2">{JSON.stringify(ex.config, null, 2)}</pre>
            {/* Aquí: link a /exercise/[id], o render del ejercicio inline */}
          </li>
        ))}
      </ul>
    </main>
  );
}

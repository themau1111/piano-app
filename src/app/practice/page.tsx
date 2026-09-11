"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchPracticePresets } from "@/lib/api/api";
import type { ExerciseKind, PracticePreset } from "@/lib/exercises/contracts";
import { exerciseTitles } from "@/lib/exercises/display";

const descriptions: Record<ExerciseKind, string> = {
  keyboard_note: "Ubica las notas que escuchas y lees.", staff_note: "Relaciona el pentagrama con el teclado.", ear_interval: "Reconoce distancias musicales al escuchar.", melodic_direction: "Distingue si una melodía sube o baja.", rhythm_pulse: "Reconoce el pulso escrito.", rhythm_count: "Suma duraciones y silencios.", scale_construction: "Forma escalas en el teclado y pentagrama.", chord_identification: "Construye e identifica acordes.",
};

export default function PracticePage() {
  const { data, isLoading } = useQuery({ queryKey: ["practicePresets"], queryFn: fetchPracticePresets });
  const byKind = new Map<ExerciseKind, PracticePreset>();
  (data ?? []).forEach((preset) => { if (!byKind.has(preset.kind)) byKind.set(preset.kind, preset); });

  return <main className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-6xl px-4 py-10 text-white">
    <section className="rounded-[28px] border border-cyan-200/20 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,.18),transparent_42%),rgba(255,255,255,.04)] p-6 sm:p-8">
      <p className="text-xs uppercase tracking-[.24em] text-cyan-200/75">Ejercicios</p>
      <h1 className="mt-2 text-3xl font-semibold">Elige una habilidad y hazla tuya.</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">Cada sesión es nueva. Elige qué practicar, cuántos ejercicios hacer, intentos y límite de tiempo.</p>
    </section>
    {isLoading ? <p className="mt-6 text-white/70">Cargando prácticas…</p> : <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from(byKind.entries()).map(([kind, preset]) => <Link key={kind} href={`/practice/${preset.exerciseId}`} className="rounded-[24px] border border-white/10 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:bg-white/10">
        <p className="text-xs uppercase tracking-[.18em] text-cyan-200/70">Ejercicio configurable</p>
        <h2 className="mt-2 text-xl font-medium">{exerciseTitles[kind]}</h2>
        <p className="mt-2 text-sm leading-6 text-white/65">{descriptions[kind]}</p>
        <span className="mt-4 inline-flex text-sm font-medium text-cyan-200">Configurar práctica →</span>
      </Link>)}
    </section>}
  </main>;
}

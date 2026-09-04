"use client";

import Link from "next/link";
import { use } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { evaluateLessonProgress, fetchLessonById } from "@/lib/api/api";
import { useAuth } from "@/lib/auth-store";
import type { LessonDetail } from "@/lib/exercises/contracts";

function contentText(content: Record<string, unknown>, key: "title" | "body") {
  const value = content[key];
  return typeof value === "string" ? value : "";
}

export default function LessonPage({
  params,
}: {
  params: Promise<{ code: string; topic: string; id: string }>;
}) {
  const { code, topic, id } = use(params);
  const { mode } = useAuth();
  const { data: lesson, isLoading, error } = useQuery({
    queryKey: ["lesson", id],
    queryFn: () => fetchLessonById(id),
  });

  if (isLoading) return <main className="p-8 text-white/70">Cargando lección…</main>;
  if (error || !lesson) return <main className="p-8 text-white/70">Lección no encontrada.</main>;

  return <LessonContent code={code} topic={topic} lesson={lesson} mode={mode} />;
}

function LessonContent({
  code,
  topic,
  lesson,
  mode,
}: {
  code: string;
  topic: string;
  lesson: LessonDetail;
  mode: "guest" | "auth";
}) {
  const progress = useMutation({ mutationFn: () => evaluateLessonProgress(lesson.id) });
  const missing = progress.data?.state.missing ?? [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-white">
      <Link href={`/sections/${code}/${topic}`} className="text-sm text-cyan-200 hover:text-cyan-100">
        ← Volver al tema
      </Link>
      <header className="mt-5 rounded-[28px] border border-white/10 bg-white/5 p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">{lesson.code}</p>
        <h1 className="mt-2 text-3xl font-semibold">{lesson.title}</h1>
        <p className="mt-3 leading-6 text-white/70">{lesson.summary}</p>
        <p className="mt-4 rounded-xl bg-cyan-300/10 p-3 text-sm text-cyan-50">Objetivo: {lesson.objective}</p>
      </header>

      <section className="mt-6 space-y-4">
        {lesson.blocks.map((block) => (
          <article key={block.id} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">{block.kind}</p>
            {contentText(block.content, "title") && <h2 className="mt-2 text-xl font-medium">{contentText(block.content, "title")}</h2>}
            {contentText(block.content, "body") && <p className="mt-2 whitespace-pre-line leading-7 text-white/75">{contentText(block.content, "body")}</p>}
            {block.exercise && (
              <Link
                href={`/sections/${code}/${topic}/exercise/${block.exercise.id}`}
                className="mt-4 inline-flex rounded-2xl bg-cyan-300 px-4 py-2 text-sm font-medium text-slate-950"
              >
                Practicar: {block.exercise.title}
              </Link>
            )}
          </article>
        ))}
        {!lesson.blocks.length && <p className="text-white/65">Esta lección aún no tiene bloques publicados.</p>}
      </section>

      <section className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-5">
        <h2 className="text-xl font-medium">Revisar avance</h2>
        <p className="mt-2 text-sm leading-6 text-white/70">
          {mode === "auth"
            ? "Comprobamos intentos, precisión y racha de la práctica vinculada."
            : "Inicia sesión para guardar y comprobar el avance de esta lección en tu perfil."}
        </p>
        {mode === "auth" && (
          <button
            type="button"
            onClick={() => progress.mutate()}
            disabled={progress.isPending}
            className="mt-4 rounded-2xl bg-cyan-300 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-60"
          >
            {progress.isPending ? "Comprobando…" : "Comprobar mi avance"}
          </button>
        )}
        {progress.data && (
          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white/80">
            {progress.data.completed ? "Lección completada: tu evidencia cumple el criterio declarado." : "Aún no se completa:"}
            {!!missing.length && <ul className="mt-2 list-disc space-y-1 pl-5">{missing.map((item) => <li key={item}>{item}</li>)}</ul>}
          </div>
        )}
        {progress.error && <p className="mt-3 text-sm text-amber-100">No pudimos comprobar el avance. Inténtalo de nuevo.</p>}
      </section>
    </main>
  );
}

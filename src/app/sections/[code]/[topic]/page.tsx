"use client";

import Link from "next/link";
import { use, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchExercisesByTopicId, fetchLessonsByTopicId, fetchTopicsBySectionCode } from "@/lib/api/api";

export default function TopicPage({ params }: { params: Promise<{ code: string; topic: string }> }) {
  const { code, topic: topicCode } = use(params);

  const { data: topics } = useQuery({
    queryKey: ["topics", code],
    queryFn: () => fetchTopicsBySectionCode(code),
  });

  const topic = useMemo(() => topics?.find((item) => item.code === topicCode), [topics, topicCode]);

  const { data: exercises, isLoading } = useQuery({
    enabled: !!topic,
    queryKey: ["topicExercises", topic?.id],
    queryFn: () => fetchExercisesByTopicId(topic!.id),
  });
  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    enabled: !!topic,
    queryKey: ["topicLessons", topic?.id],
    queryFn: () => fetchLessonsByTopicId(topic!.id),
  });

  if (!topic) return <div className="p-8 text-white/70">Topic no encontrado.</div>;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-white">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/70">{topic.code}</p>
        <h1 className="mt-2 text-3xl font-semibold">{topic.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70">{topic.description}</p>
      </div>

      {!!lessons?.length && (
        <section className="mt-6 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">Lecciones</p>
            <h2 className="mt-1 text-xl font-semibold">Aprende antes de practicar</h2>
          </div>
          {lessons.map((lesson) => (
            <article key={lesson.id} className="rounded-[24px] border border-cyan-300/20 bg-cyan-300/5 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/60">{lesson.code}</p>
              <h3 className="mt-2 text-xl font-medium">{lesson.title}</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">{lesson.summary}</p>
              <p className="mt-3 text-sm text-cyan-50/90">Objetivo: {lesson.objective}</p>
              <Link
                href={`/sections/${code}/${topicCode}/lesson/${lesson.id}`}
                className="mt-4 inline-flex rounded-2xl bg-cyan-300 px-4 py-2 text-sm font-medium text-slate-950"
              >
                Abrir lección
              </Link>
            </article>
          ))}
        </section>
      )}

      <section className="mt-6 grid gap-4">
        {lessonsLoading && <div className="text-white/70">Cargando lecciones…</div>}
        {isLoading && <div className="text-white/70">Cargando ejercicios…</div>}
        {(exercises ?? []).map((exercise) => (
          <article key={exercise.id} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">{exercise.kind}</p>
                <h2 className="mt-2 text-xl font-medium">{exercise.title}</h2>
                <p className="mt-2 text-sm text-white/65">
                  Skill: {exercise.config.skillCode} · nivel {exercise.config.levelIndex}
                </p>
              </div>
              <Link
                href={`/sections/${code}/${topicCode}/exercise/${exercise.id}`}
                className="rounded-2xl bg-cyan-300 px-4 py-2 text-sm font-medium text-slate-950"
              >
                Iniciar
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

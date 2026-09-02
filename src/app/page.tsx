"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchSections, getMyProgress, getPracticeQueue } from "@/lib/api/api";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { Card } from "./components/ui/Card";
import { HomeHeroPiano } from "./components/home/HomeHeroPiano";

export default function HomePage() {
  const { data: user } = useCurrentUser();
  const { data: sections } = useQuery({
    queryKey: ["sections"],
    queryFn: fetchSections,
  });
  const { data: queue } = useQuery({
    queryKey: ["practiceQueue"],
    queryFn: getPracticeQueue,
    enabled: !!user,
  });
  const { data: progress } = useQuery({
    queryKey: ["progress"],
    queryFn: getMyProgress,
    enabled: !!user,
  });

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-[radial-gradient(circle_at_top,#15305d_0%,#0b1325_38%,#070c18_100%)] px-4 py-8 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="grid gap-6 lg:grid-cols-[1fr_0.92fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">MusicAula</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Práctica guiada de piano y teoría, con ejercicios seed-based y progreso real.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
              El foco ahora está en estudiar mejor: cola de práctica, niveles claros, ejercicios reproducibles y feedback utilizable.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {queue?.currentTopic ? (
                <Link
                  href={`/sections/${queue.currentTopic.sectionCode}/${queue.currentTopic.code}`}
                  className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-medium text-slate-950"
                >
                  Continuar: {queue.currentTopic.title}
                </Link>
              ) : (
                <Link href="/sections/basic" className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-medium text-slate-950">
                  Empezar fundamentos
                </Link>
              )}
              <Link href="/preferences" className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-medium text-white/80 hover:bg-white/5">
                Ajustar preferencias
              </Link>
            </div>
          </div>

          <HomeHeroPiano />
        </section>

        {user && (
          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card title="Cola de práctica">
              {!queue?.items?.length ? (
                <p className="text-sm text-white/70">Todavía no hay tareas en cola. Inicia una sección para generar tu primera rutina.</p>
              ) : (
                <div className="space-y-3">
                  {queue.items.map((item) => (
                    <Link
                      key={`${item.exerciseId}-${item.reason}`}
                      href={`/sections/${item.sectionCode}/${item.topicCode}/exercise/${item.exerciseId}`}
                      className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">{item.reason}</p>
                          <h3 className="mt-1 font-medium">{item.title}</h3>
                          <p className="mt-1 text-sm text-white/60">
                            {item.topicTitle} · nivel {item.levelIndex}
                          </p>
                        </div>
                        <div className="text-right text-xs text-white/60">
                          <div>Intentos: {item.stats?.attempts ?? 0}</div>
                          <div>Racha: {item.stats?.streak ?? 0}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            <Card title="Progreso general">
              <div className="grid gap-4 sm:grid-cols-3">
                <Stat label="Plantillas intentadas" value={String(progress?.summary.attempted ?? 0)} />
                <Stat label="Dominadas" value={String(progress?.summary.mastered ?? 0)} />
                <Stat label="Precisión" value={`${Math.round((progress?.summary.accuracy ?? 0) * 100)}%`} />
              </div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                Meta sugerida hoy: {queue?.dailyGoalMinutes ?? 20} minutos.
              </div>
            </Card>
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(sections ?? []).map((section) => (
            <Link key={section.id} href={`/sections/${section.code}`} className="block rounded-[24px] border border-white/10 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:bg-white/10">
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">{section.code}</p>
              <h2 className="mt-2 text-xl font-semibold">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/65">{section.description || "Ruta disponible para estudio guiado."}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-white/45">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

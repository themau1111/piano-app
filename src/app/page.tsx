"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchSections, getMyProgress, getPracticeQueue } from "@/lib/api/api";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { Card } from "./components/ui/Card";
import { HomeHeroPiano } from "./components/home/HomeHeroPiano";
import { IntervalBranchMap } from "./components/home/IntervalBranchMap";
import { useEffect, useRef, useState } from "react";
import { getLocalProgressSummary } from "@/lib/progress-local";
import * as Tone from "tone";

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
  const [guestProgress, setGuestProgress] = useState({ attempted: 0, mastered: 0, accuracy: 0 });
  const [activeHeroNotes, setActiveHeroNotes] = useState<Set<number>>(new Set());
  const [lastPlayedNotes, setLastPlayedNotes] = useState<string[]>([]);
  const previousHeroNoteCount = useRef(0);

  useEffect(() => {
    if (!user) setGuestProgress(getLocalProgressSummary());
  }, [user]);

  useEffect(() => {
    const isAddingNotes = activeHeroNotes.size > previousHeroNoteCount.current;
    previousHeroNoteCount.current = activeHeroNotes.size;
    if (activeHeroNotes.size < 2 || !isAddingNotes) return;
    setLastPlayedNotes(
      Array.from(activeHeroNotes)
        .sort((left, right) => left - right)
        .map((midi) => Tone.Frequency(midi, "midi").toNote()),
    );
  }, [activeHeroNotes]);

  const progressSummary = user ? progress?.summary : guestProgress;

  return (
    <main className="min-h-[calc(100vh-3.5rem)] overflow-hidden bg-[radial-gradient(circle_at_72%_20%,#1b4f7c_0%,#102544_26%,#070c18_68%)] px-4 py-6 text-white sm:py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <section className="grid items-center gap-7 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="relative z-10 py-3 lg:py-8">
            <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/70">MusicAula · piano y teoría</p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-[0.98] tracking-tight text-white sm:text-6xl">
              Entiende la música <span className="text-cyan-200">desde tus manos.</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-white/70 sm:text-base">
              Explora, escucha y practica a tu ritmo. Empieza sin cuenta; crea un perfil sólo cuando quieras guardar tu camino.
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
                  Explorar el piano
                </Link>
              )}
              <Link href="/preferences" className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-medium text-white/80 hover:bg-white/5">
                Ver rutas
              </Link>
            </div>
          </div>
          <HomeHeroPiano
            active={activeHeroNotes}
            setActive={setActiveHeroNotes}
            onClearCombination={() => setLastPlayedNotes([])}
            intervalMap={lastPlayedNotes.length >= 2 ? <IntervalBranchMap notes={lastPlayedNotes} /> : undefined}
          />
        </section>

        {lastPlayedNotes.length >= 2 ? (
          <IntervalBranchMap notes={lastPlayedNotes} />
        ) : (
          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {user && (
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
          )}

            <Card className={user ? undefined : "lg:col-span-2"} title={user ? "Progreso general" : "Tu práctica en este dispositivo"}>
              <div className="grid gap-4 sm:grid-cols-3">
                <Stat label="Ejercicios intentados" value={String(progressSummary?.attempted ?? 0)} />
                <Stat label="Dominadas" value={String(progressSummary?.mastered ?? 0)} />
                <Stat label="Precisión" value={`${Math.round((progressSummary?.accuracy ?? 0) * 100)}%`} />
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                {user ? `Meta sugerida hoy: ${queue?.dailyGoalMinutes ?? 20} minutos.` : "Tu avance se conserva localmente. Inicia sesión cuando quieras asociarlo a un perfil."}
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

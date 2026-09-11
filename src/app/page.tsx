"use client";

import Link from "next/link";
import { HomeHeroPiano } from "./components/home/HomeHeroPiano";
import { IntervalBranchMap } from "./components/home/IntervalBranchMap";
import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";

export default function HomePage() {
  const [activeHeroNotes, setActiveHeroNotes] = useState<Set<number>>(new Set());
  const [lastPlayedNotes, setLastPlayedNotes] = useState<string[]>([]);
  const previousHeroNoteCount = useRef(0);

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
              <Link href="/sections/basic" className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-medium text-slate-950">Continuar ruta</Link>
              <Link href="/practice" className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-medium text-white/80 hover:bg-white/5">
                Ejercicios
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

        {lastPlayedNotes.length >= 2 && <IntervalBranchMap notes={lastPlayedNotes} />}
      </div>
    </main>
  );
}

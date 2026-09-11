"use client";

import { useState, type ReactNode } from "react";
import * as Tone from "tone";
import type { ExerciseDetail } from "@/lib/exercises/contracts";
import type { NotationLocale } from "@/app/hooks/useNotationLocale";

type Practice = { locale: NotationLocale; questionLimit?: number; secondsPerQuestion?: number; config?: Record<string, unknown> };

const intervalLabels: Record<string, string> = { m2: "2.ª menor", M2: "2.ª mayor", m3: "3.ª menor", M3: "3.ª mayor", P4: "4.ª justa", P5: "5.ª justa", P8: "Octava justa" };
const englishIntervals: Record<string, string> = { m2: "Minor 2nd", M2: "Major 2nd", m3: "Minor 3rd", M3: "Major 3rd", P4: "Perfect 4th", P5: "Perfect 5th", P8: "Perfect octave" };

export function PracticeConfigurator({ exercise, locale, renderRunner }: { exercise: ExerciseDetail; locale: NotationLocale; renderRunner: (practice: Practice) => ReactNode }) {
  const [started, setStarted] = useState(false);
  const [count, setCount] = useState(5);
  const [timed, setTimed] = useState(false);
  const [seconds, setSeconds] = useState(20);
  const [attemptsAllowed, setAttemptsAllowed] = useState(3);
  const config = exercise.config;
  const constraints = config.constraints as Record<string, unknown>;
  const [selectedIntervals, setSelectedIntervals] = useState<string[]>(Array.isArray(constraints.intervalSet) ? constraints.intervalSet.map(String) : []);
  const [direction, setDirection] = useState(String(constraints.direction ?? "both"));
  const [showStaff, setShowStaff] = useState(Boolean(config.presentation.showStaff));
  const [roots, setRoots] = useState<string[]>(Array.isArray(constraints.roots) ? constraints.roots.map(String) : []);
  const [qualities, setQualities] = useState<string[]>(Array.isArray(constraints.qualities) ? constraints.qualities.map(String) : []);
  const [scaleMode, setScaleMode] = useState(String(constraints.mode ?? "major"));
  const [chordRoots, setChordRoots] = useState<string[]>(Array.isArray(constraints.roots) ? constraints.roots.map(String) : ["C", "D", "F", "G", "A"]);

  if (started) return <main className="mx-auto max-w-5xl px-4 py-8">{renderRunner({
    locale, questionLimit: count, secondsPerQuestion: timed ? seconds : undefined,
    config: {
      constraints: {
        ...(exercise.kind === "ear_interval" ? { intervalSet: selectedIntervals, direction } : {}),
        ...(exercise.kind === "melodic_direction" ? { direction } : {}),
        ...(exercise.kind === "scale_construction" ? { roots, mode: scaleMode } : {}),
        ...(exercise.kind === "chord_identification" ? { qualities, roots: chordRoots } : {}),
      },
      presentation: { showStaff, attemptsAllowed: attemptsAllowed === 99 ? 2_147_483_647 : attemptsAllowed },
    },
  })}</main>;

  const toggle = (value: string, values: string[], update: (next: string[]) => void) => update(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  return <main className="mx-auto max-w-3xl px-4 py-10 text-white">
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
      <p className="text-xs uppercase tracking-[.2em] text-cyan-200/70">Práctica libre</p>
      <h1 className="mt-2 text-3xl font-semibold">{exercise.kind === "ear_interval" ? "Intervalos simples" : exercise.kind === "scale_construction" ? "Escalas" : exercise.title}</h1>
      <p className="mt-2 text-sm text-white/65">Elige una propuesta y ajusta sólo lo que quieras practicar hoy.</p>
      <div className="mt-6 space-y-5">
        {exercise.kind === "ear_interval" && <fieldset><legend className="text-sm font-medium">Intervalos</legend><div className="mt-2 flex flex-wrap gap-2">{["m2", "M2", "m3", "M3", "P4", "P5", "P8"].map((item) => <button key={item} type="button" onClick={() => toggle(item, selectedIntervals, setSelectedIntervals)} className={`rounded-xl border px-3 py-2 text-sm ${selectedIntervals.includes(item) ? "border-cyan-300 bg-cyan-300/15" : "border-white/15"}`}>{locale === "es" ? intervalLabels[item] : englishIntervals[item]}</button>)}</div></fieldset>}
        {(exercise.kind === "ear_interval" || exercise.kind === "melodic_direction") && <label className="block text-sm">Dirección<select value={direction} onChange={(event) => setDirection(event.target.value)} className="mt-2 block rounded-xl border border-white/15 bg-slate-900 px-3 py-2"><option value="both">Ambas</option><option value="ascending">Ascendente</option><option value="descending">Descendente</option></select></label>}
        {exercise.kind === "scale_construction" && <><fieldset><legend className="text-sm font-medium">Tónicas</legend><div className="mt-2 flex flex-wrap gap-2">{["C", "G", "D", "F", "A", "E"].map((item) => <button key={item} type="button" onClick={() => toggle(item, roots, setRoots)} className={`rounded-xl border px-3 py-2 text-sm ${roots.includes(item) ? "border-cyan-300 bg-cyan-300/15" : "border-white/15"}`}>{item}</button>)}</div></fieldset><label className="block text-sm">Tipo de escala<select value={scaleMode} onChange={(event) => setScaleMode(event.target.value)} className="mt-2 block rounded-xl border border-white/15 bg-slate-900 px-3 py-2"><option value="major">Mayor</option><option value="minor">Menor natural</option></select></label></>}
        {exercise.kind === "chord_identification" && <><fieldset><legend className="text-sm font-medium">Fundamentales</legend><div className="mt-2 flex flex-wrap gap-2">{["C", "D", "E", "F", "G", "A", "B"].map((item) => <button key={item} type="button" onClick={() => toggle(item, chordRoots, setChordRoots)} className={`rounded-xl border px-3 py-2 text-sm ${chordRoots.includes(item) ? "border-cyan-300 bg-cyan-300/15" : "border-white/15"}`}>{item}</button>)}</div></fieldset><fieldset><legend className="text-sm font-medium">Calidades</legend><div className="mt-2 flex flex-wrap gap-2">{["maj", "min", "dim", "aug", "7", "maj7", "m7"].map((item) => <button key={item} type="button" onClick={() => toggle(item, qualities, setQualities)} className={`rounded-xl border px-3 py-2 text-sm ${qualities.includes(item) ? "border-cyan-300 bg-cyan-300/15" : "border-white/15"}`}>{item}</button>)}</div></fieldset></>}
        {["ear_interval", "scale_construction", "chord_identification"].includes(exercise.kind) && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showStaff} onChange={(event) => setShowStaff(event.target.checked)} /> Mostrar pentagrama como ayuda visual</label>}
        <div className="grid gap-4 sm:grid-cols-3"><label className="text-sm">Ejercicios<select value={count} onChange={(event) => setCount(Number(event.target.value))} className="mt-2 block w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2">{[5, 10, 15, 20].map((value) => <option key={value} value={value}>{value} ejercicios</option>)}</select></label><label className="text-sm">Intentos por ejercicio<select value={attemptsAllowed} onChange={(event) => setAttemptsAllowed(Number(event.target.value))} className="mt-2 block w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2"><option value={1}>1</option><option value={3}>3</option><option value={99}>Sin límite</option></select></label><label className="text-sm"><span className="flex items-center gap-2"><input type="checkbox" checked={timed} onChange={(event) => setTimed(event.target.checked)} /> Tiempo por ejercicio</span>{timed && <input type="number" min="5" max="600" value={seconds} onChange={(event) => setSeconds(Number(event.target.value))} className="mt-2 block w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2" />}</label></div>
      </div>
      <button type="button" onClick={() => { void Tone.start().finally(() => setStarted(true)); }} className="mt-7 rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-medium text-slate-950">Empezar práctica</button>
    </section>
  </main>;
}

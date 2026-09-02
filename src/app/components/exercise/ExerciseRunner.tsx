"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Tone from "tone";
import {
  attemptExerciseRun,
  getExerciseRun,
  replayExerciseRun,
  revealExerciseRun,
  startExercise,
} from "@/lib/api/api";
import type {
  ExerciseAttemptAnswer,
  ExerciseDetail,
  ExerciseRunSnapshot,
} from "@/lib/exercises/contracts";
import type { Prefs } from "@/lib/prefs";
import { cn } from "@/lib/cn";
import { Button } from "../ui/Button";
import { SimplePiano } from "../SimplePiano";
import { StaffPrompt } from "./StaffPrompt";
import { writeLocalStats } from "@/lib/progress-local";
import { useAuth } from "@/lib/auth-store";

function midiToLabel(midi: number) {
  return Tone.Frequency(midi, "midi").toNote();
}

function normalizeSelection(selection: Set<number>) {
  return Array.from(selection).sort((left, right) => left - right);
}

export function ExerciseRunner({
  exercise,
  preferences,
}: {
  exercise: ExerciseDetail;
  preferences: Prefs | null;
}) {
  const { mode } = useAuth();
  const sampler = useRef<Tone.Sampler | null>(null);
  const [run, setRun] = useState<ExerciseRunSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [active, setActive] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [intervalChoice, setIntervalChoice] = useState("");
  const [chordName, setChordName] = useState("");
  const [inversion, setInversion] = useState<string>("");

  const storageKey = useMemo(() => `exercise-run:${exercise.id}`, [exercise.id]);
  const keyboardRange = useMemo<[number, number]>(() => {
    if (!run) return [48, 84];
    if (run.presentation.keyboardRange) return run.presentation.keyboardRange;
    if ("keyboardRange" in run.prompt) return run.prompt.keyboardRange;
    return [48, 84];
  }, [run]);

  useEffect(() => {
    if (!sampler.current) {
      sampler.current = new Tone.Sampler({
        urls: {
          C4: "C4.mp3",
          "D#4": "Ds4.mp3",
          "F#4": "Fs4.mp3",
          A4: "A4.mp3",
        },
        release: 20,
        baseUrl: "https://tonejs.github.io/audio/salamander/",
      }).toDestination();
    }

    return () => {
      sampler.current?.dispose();
      sampler.current = null;
    };
  }, []);

  const playEvents = useCallback(async (events?: Array<{ midi: number; atMs: number; durationMs: number }>) => {
    if (!events?.length || !sampler.current) return;
    await Tone.start();
    await Tone.loaded();
    const now = Tone.now();
    events.forEach((event) => {
      sampler.current?.triggerAttackRelease(
        midiToLabel(event.midi),
        event.durationMs / 1000,
        now + event.atMs / 1000
      );
    });
  }, []);

  const hydrateRun = useCallback(async () => {
    setLoading(true);
    try {
      const storedRunId = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
      if (storedRunId) {
        const existing = await getExerciseRun(storedRunId);
        if (existing.exercise.id === exercise.id) {
          setRun(existing);
          setSelected(new Set());
          setIntervalChoice("");
          setChordName("");
          setInversion("");
          if (existing.presentation.autoReplay) {
            await playEvents(existing.presentation.playback);
          }
          return;
        }
      }

      const started = await startExercise(exercise.id);
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, started.runId);
      }
      setRun(started);
      setSelected(new Set());
      setIntervalChoice("");
      setChordName("");
      setInversion("");
      if (started.presentation.autoReplay) {
        await playEvents(started.presentation.playback);
      }
    } finally {
      setLoading(false);
    }
  }, [exercise.id, playEvents, storageKey]);

  useEffect(() => {
    void hydrateRun();
  }, [hydrateRun]);

  useEffect(() => {
    if (!run) return;
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, run.runId);
    }
  }, [run, storageKey]);

  async function refreshRun(nextRunId?: string) {
    const latest = nextRunId ? await getExerciseRun(nextRunId) : run ? await getExerciseRun(run.runId) : null;
    if (latest) setRun(latest);
  }

  async function submitAnswer(answer: ExerciseAttemptAnswer) {
    if (!run) return;
    setWorking(true);
    try {
      const res = await attemptExerciseRun(run.runId, answer);
      setRun(res.run);
      if (mode === "guest") {
        writeLocalStats(exercise.id, res.run.feedback?.correct ?? res.ok);
      }
    } finally {
      setWorking(false);
    }
  }

  async function handleReplay() {
    if (!run) return;
    setWorking(true);
    try {
      const replay = await replayExerciseRun(run.runId);
      await playEvents(replay.playback);
      await refreshRun(run.runId);
    } finally {
      setWorking(false);
    }
  }

  async function handleReveal() {
    if (!run) return;
    setWorking(true);
    try {
      const res = await revealExerciseRun(run.runId);
      setRun(res.run);
    } finally {
      setWorking(false);
    }
  }

  async function handleNext() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey);
    }
    await hydrateRun();
  }

  function onPianoDown(midi: number) {
    setActive((prev) => new Set(prev).add(midi));
  }

  function onPianoUp(midi: number) {
    const input = run?.input;

    setActive((prev) => {
      const next = new Set(prev);
      next.delete(midi);
      return next;
    });

    setSelected((prev) => {
      const next = new Set(prev);
      if (input?.mode === "single-piano") {
        return new Set([midi]);
      }

      if (next.has(midi)) next.delete(midi);
      else next.add(midi);

      const maxSelections = input?.mode === "multi-piano" || input?.mode === "chord-builder" ? input.maxSelections : 8;
      while (next.size > (maxSelections ?? 8)) {
        next.delete(Array.from(next)[0]);
      }
      return next;
    });
  }

  const canSubmitPiano =
    run &&
    (run.input.mode === "single-piano" || run.input.mode === "multi-piano" || run.input.mode === "chord-builder") &&
    normalizeSelection(selected).length >= ("minSelections" in run.input ? run.input.minSelections : 1);

  const selectedLabels = normalizeSelection(selected).map(midiToLabel);
  const revealLabel = run?.feedback?.reveal?.label;

  if (loading || !run) {
    return <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/80">Cargando ejercicio…</div>;
  }

  return (
    <section className="space-y-5 rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,51,0.95),rgba(7,13,26,0.95))] p-5 text-white shadow-2xl">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">{run.exercise.skillCode}</p>
          <h2 className="text-2xl font-semibold">{run.exercise.title}</h2>
          <p className="mt-2 text-sm text-white/70">{run.prompt.text}</p>
          <p className="mt-1 text-xs text-white/50">
            {preferences?.practice?.minutesPerDay ?? 20} min diarios · nivel {run.exercise.levelIndex} · {mode === "guest" ? "progreso guardado en este dispositivo" : "progreso guardado en tu perfil"}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
          <div>Intentos: {run.attemptsLeft}</div>
          <div className="mt-1 text-white/60">Estado: {run.status}</div>
        </div>
      </header>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="mb-3 text-sm text-white/70">{run.presentation.instructions}</p>
        {run.presentation.staffNotes?.length ? (
          <StaffPrompt notes={run.presentation.staffNotes} clef={run.presentation.clef ?? "treble"} />
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-white/55">
            Este ejercicio no necesita pentagrama visible.
          </div>
        )}
      </div>

      {run.input.mode === "interval-options" && (
        <div className="grid gap-2 sm:grid-cols-3">
          {run.input.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setIntervalChoice(option);
                submitAnswer({ interval: option });
              }}
              disabled={working}
              className={cn(
                "rounded-2xl border px-4 py-3 text-sm transition",
                intervalChoice === option ? "border-cyan-300 bg-cyan-300/10 text-cyan-100" : "border-white/10 bg-white/5 hover:bg-white/10"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {(run.input.mode === "single-piano" || run.input.mode === "multi-piano" || run.input.mode === "chord-builder") && (
        <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-white/70">
            <span>Selección: {selectedLabels.join(", ") || "ninguna"}</span>
            <span>Atajos del teclado activos dentro del rango visible.</span>
          </div>
          <div className="h-44 w-full sm:h-52">
            <SimplePiano active={active} selected={selected} onKeyDown={onPianoDown} onKeyUp={onPianoUp} range={keyboardRange} />
          </div>
        </div>
      )}

      {run.input.mode === "chord-builder" && (
        <div className="grid gap-3 sm:grid-cols-3">
          {run.input.requireName && (
            <label className="space-y-1 text-sm">
              <span className="text-white/70">Nombre del acorde</span>
              <input
                value={chordName}
                onChange={(event) => setChordName(event.target.value)}
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-3 outline-none focus:ring-2 focus:ring-cyan-300/40"
                placeholder="Cmaj7, F#m7…"
              />
            </label>
          )}
          {run.input.requireInversion && (
            <label className="space-y-1 text-sm">
              <span className="text-white/70">Inversión</span>
              <select
                value={inversion}
                onChange={(event) => setInversion(event.target.value)}
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-3 outline-none focus:ring-2 focus:ring-cyan-300/40"
              >
                <option value="">Selecciona…</option>
                <option value="0">Root</option>
                <option value="1">1st</option>
                <option value="2">2nd</option>
                <option value="3">3rd</option>
              </select>
            </label>
          )}
        </div>
      )}

      {run.feedback && (
        <div
          className={cn(
            "rounded-2xl border px-4 py-3 text-sm",
            run.feedback.correct ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100" : "border-amber-400/30 bg-amber-500/10 text-amber-50"
          )}
        >
          <div className="font-medium">{run.feedback.message}</div>
          {revealLabel && <div className="mt-1 text-white/80">Solución: {revealLabel}</div>}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {run.presentation.allowReplay && (
          <Button variant="outline" onClick={handleReplay} disabled={working}>
            Reproducir
          </Button>
        )}
        {(run.input.mode === "single-piano" || run.input.mode === "multi-piano" || run.input.mode === "chord-builder") && (
          <Button
            onClick={() =>
              submitAnswer({
                selectedMidis: normalizeSelection(selected),
                chordName: chordName || undefined,
                inversion: inversion ? Number(inversion) : undefined,
              })
            }
            disabled={working || !canSubmitPiano}
          >
            Enviar respuesta
          </Button>
        )}
        <Button variant="ghost" onClick={handleReveal} disabled={working}>
          Ver solución
        </Button>
        <Button variant="solid" onClick={handleNext} disabled={working}>
          Siguiente ejercicio
        </Button>
      </div>
    </section>
  );
}

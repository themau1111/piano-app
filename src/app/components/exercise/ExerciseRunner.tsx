"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Tone from "tone";
import {
  attemptExerciseRun,
  getExerciseRun,
  replayExerciseRun,
  revealExerciseRun,
  startExercise,
  nextPracticeSessionRun,
  startPracticeSession,
  timeoutExerciseRun,
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
import { useKeyboardPreferences } from "@/app/hooks/useKeyboardPreferences";
import { KeyboardControls } from "@/app/components/keyboard/KeyboardControls";

const METRONOME_TEMPO_KEY = "musicaula:metronome-tempo";

function midiToLabel(midi: number) {
  return Tone.Frequency(midi, "midi").toNote();
}

function normalizeSelection(selection: Set<number>) {
  return Array.from(selection).sort((left, right) => left - right);
}

const intervalSemitones: Record<string, number> = { m2: 1, M2: 2, m3: 3, M3: 4, P4: 5, TT: 6, P5: 7, m6: 8, M6: 9, m7: 10, M7: 11, P8: 12 };

export function ExerciseRunner({
  exercise,
  preferences,
  practice,
}: {
  exercise: ExerciseDetail;
  preferences: Prefs | null;
  practice?: { locale: "es" | "en"; questionLimit?: number; secondsPerQuestion?: number; config?: Record<string, unknown> };
}) {
  const { mode } = useAuth();
  const sampler = useRef<Tone.Sampler | null>(null);
  const [run, setRun] = useState<ExerciseRunSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [working, setWorking] = useState(false);
  const [active, setActive] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [intervalChoice, setIntervalChoice] = useState("");
  const [directionChoice, setDirectionChoice] = useState<"ascending" | "descending" | "">("");
  const [pulseChoice, setPulseChoice] = useState<number | null>(null);
  const [beatCountChoice, setBeatCountChoice] = useState<number | null>(null);
  const [metronomeRunning, setMetronomeRunning] = useState(false);
  const [metronomeTempo, setMetronomeTempo] = useState(60);
  const [metronomeBeat, setMetronomeBeat] = useState(1);
  const [showRhythmGuide, setShowRhythmGuide] = useState(false);
  const [chordName, setChordName] = useState("");
  const [inversion, setInversion] = useState<string>("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [showKeyboardControls, setShowKeyboardControls] = useState(false);
  const [completedExercises, setCompletedExercises] = useState(0);
  const [correctExercises, setCorrectExercises] = useState(0);
  const completedRunIds = useRef<Set<string>>(new Set());
  const { preferences: keyboardPreferences, update: updateKeyboardPreferences } = useKeyboardPreferences();

  const storageKey = useMemo(() => `exercise-run:${exercise.id}`, [exercise.id]);
  const keyboardRange = useMemo<[number, number]>(() => {
    if (!run) return [48, 84];
    if (run.prompt.kind === "keyboard_note" || run.prompt.kind === "staff_note") return [60, 71];
    return [keyboardPreferences.startMidi, keyboardPreferences.startMidi + keyboardPreferences.visibleOctaves * 12 - 1];
  }, [keyboardPreferences, run]);

  useEffect(() => {
    if (!run?.feedback || run.status === "active" || !practice || completedRunIds.current.has(run.runId)) return;
    completedRunIds.current.add(run.runId);
    setCompletedExercises((value) => value + 1);
    if (run.feedback.correct) setCorrectExercises((value) => value + 1);
  }, [practice, run]);

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

  useEffect(() => {
    const storedTempo = Number(window.localStorage.getItem(METRONOME_TEMPO_KEY));
    if (storedTempo >= 40 && storedTempo <= 120 && storedTempo % 5 === 0) {
      setMetronomeTempo(storedTempo);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(METRONOME_TEMPO_KEY, String(metronomeTempo));
  }, [metronomeTempo]);

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

  const autoReplay = useCallback((snapshot: ExerciseRunSnapshot) => {
    // A fresh page may need a user gesture to unlock audio. Never make
    // loading the exercise depend on that gesture or on external samples.
    if (snapshot.presentation.autoReplay) {
      void playEvents(snapshot.presentation.playback).catch(() => setAudioError(true));
    }
  }, [playEvents]);

  const hydrateRun = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    setAudioError(false);
    try {
      const storedRunId = !practice && typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
      if (storedRunId) {
        const existing = await getExerciseRun(storedRunId);
        if (existing.exercise.id === exercise.id) {
          setRun(existing);
          setSelected(new Set());
          setIntervalChoice("");
          setDirectionChoice("");
          setPulseChoice(null);
          setBeatCountChoice(null);
          setShowRhythmGuide(false);
          setChordName("");
          setInversion("");
          autoReplay(existing);
          return;
        }
      }

      const startedResponse = practice
        ? await startPracticeSession({ exerciseId: exercise.id, locale: practice.locale, questionLimit: practice.questionLimit, secondsPerQuestion: practice.secondsPerQuestion, config: practice.config })
        : null;
      const started = startedResponse?.run ?? await startExercise(exercise.id);
      if (startedResponse) setSessionId(startedResponse.session.id);
      if (!practice && typeof window !== "undefined") {
        localStorage.setItem(storageKey, started.runId);
      }
      setRun(started);
      setSelected(new Set());
      setIntervalChoice("");
      setDirectionChoice("");
      setPulseChoice(null);
      setBeatCountChoice(null);
      setShowRhythmGuide(false);
      setChordName("");
      setInversion("");
      autoReplay(started);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [exercise.id, autoReplay, storageKey, practice]);

  useEffect(() => {
    void hydrateRun();
  }, [hydrateRun]);

  useEffect(() => {
    if (!run || practice) return;
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, run.runId);
    }
  }, [run, storageKey, practice]);

  useEffect(() => {
    if (!run?.questionExpiresAt) { setSecondsLeft(null); return; }
    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((Date.parse(run.questionExpiresAt!) - Date.now()) / 1000)));
    tick();
    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [run?.questionExpiresAt]);

  useEffect(() => {
    if (secondsLeft !== 0 || !run || run.status !== "active") return;
    void timeoutExerciseRun(run.runId).then((result) => setRun(result.run)).catch(() => setLoadError(true));
  }, [run, secondsLeft]);

  const hasRhythmPrompt = run?.prompt.kind === "rhythm_pulse" || run?.prompt.kind === "rhythm_count";

  useEffect(() => {
    if (!metronomeRunning || !hasRhythmPrompt) return;
    const metronome = new Tone.Synth({ volume: -16 }).toDestination();
    void Tone.start().then(() => metronome.triggerAttackRelease("C6", "32n")).catch(() => setAudioError(true));
    const interval = window.setInterval(() => {
      setMetronomeBeat((beat) => {
        metronome.triggerAttackRelease(beat === 1 ? "C6" : "C5", "32n");
        return (beat % 4) + 1;
      });
    }, 60_000 / metronomeTempo);
    return () => { window.clearInterval(interval); metronome.dispose(); };
  }, [hasRhythmPrompt, metronomeRunning, metronomeTempo]);

  useEffect(() => {
    if (!hasRhythmPrompt) setMetronomeRunning(false);
  }, [hasRhythmPrompt]);

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
    setAudioError(false);
    try {
      // Unlock audio directly from the button gesture, before the HTTP call.
      await Tone.start();
      const replay = await replayExerciseRun(run.runId);
      await playEvents(replay.playback);
      await refreshRun(run.runId);
    } catch {
      setAudioError(true);
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
      if (res.run.input.mode === "chord-builder" && res.run.feedback?.reveal?.noteLabels?.length) {
        const notes = new Set(res.run.feedback.reveal.noteLabels.map((label) => Tone.Frequency(label).toMidi()));
        setSelected(notes);
        setActive(notes);
      }
    } finally {
      setWorking(false);
    }
  }

  async function handleNext() {
    if (practice && sessionId) {
      setWorking(true);
      try {
        await Tone.start();
        const next = await nextPracticeSessionRun(sessionId);
        setRun(next);
        setSelected(new Set());
        setActive(new Set());
        setIntervalChoice("");
        setDirectionChoice("");
        setPulseChoice(null);
        setBeatCountChoice(null);
        autoReplay(next);
      } catch {
        setLoadError(true);
      } finally {
        setWorking(false);
      }
      return;
    }
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
  const isRunActive = run?.status === "active";

  const selectedLabels = normalizeSelection(selected).map(midiToLabel);
  const selectedStaffNotes = normalizeSelection(selected).map((midi) => ({ midi }));
  const isKeyboardNote = run?.prompt.kind === "keyboard_note";
  const showSelectionOnStaff = run?.prompt.kind === "scale_construction" || run?.prompt.kind === "chord_identification" || isKeyboardNote;
  const displayedStaffNotes = isKeyboardNote && selectedStaffNotes.length ? selectedStaffNotes.slice(-1) : selectedStaffNotes;
  const earIntervalStaffNotes = (() => {
    if (!run || run.prompt.kind !== "ear_interval" || !run.presentation.staffNotes?.length) return null;
    const [first, correctSecond] = run.presentation.staffNotes;
    if (!first || !correctSecond || !intervalChoice) return run.feedback ? run.presentation.staffNotes : [first];
    const semitones = intervalSemitones[intervalChoice] ?? 0;
    const direction = correctSecond.midi >= first.midi ? 1 : -1;
    return [first, { midi: first.midi + direction * semitones }];
  })();
  const attemptsLabel = (run?.attemptsLeft ?? 0) >= 2_147_483_647 ? "Sin límite" : String(run?.attemptsLeft ?? 0);
  const revealLabel = run?.feedback?.reveal?.label;
  const nextStep = run?.feedback?.nextStep
    ? `Paso siguiente: ${run.feedback.nextStep}`
    : run?.feedback &&
        !run.feedback.correct &&
        !run.feedback.reveal &&
        run.exercise.kind === "melodic_direction"
      ? "Paso siguiente: reproduce el par y compara sólo la altura del segundo sonido con la del primero."
      : null;

  if (loadError) {
    return (
      <div role="alert" className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6 text-white/80">
        <p>No se pudo cargar la práctica. Intenta de nuevo.</p>
        <Button onClick={() => void hydrateRun()}>Reintentar</Button>
      </div>
    );
  }

  if (loading || !run) {
    return <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/80">Cargando ejercicio…</div>;
  }

  const practiceFinished = Boolean(practice && practice.questionLimit && completedExercises >= practice.questionLimit && run.status !== "active");
  if (practiceFinished) {
    return <section className="mx-auto max-w-2xl rounded-3xl border border-cyan-200/20 bg-[linear-gradient(180deg,rgba(16,27,51,0.95),rgba(7,13,26,0.95))] p-7 text-white"><p className="text-xs uppercase tracking-[.2em] text-cyan-200/70">Sesión terminada</p><h2 className="mt-2 text-3xl font-semibold">Terminaste tus {completedExercises} ejercicios.</h2><p className="mt-3 text-white/70">Respuestas correctas: {correctExercises} de {completedExercises}. Puedes seguir practicando con otra configuración.</p><div className="mt-6 flex flex-wrap gap-3"><Button onClick={() => window.location.assign("/practice")}>Volver a ejercicios</Button><Button variant="outline" onClick={() => window.location.reload()}>Repetir configuración</Button></div></section>;
  }

  return (
    <section className="space-y-5 rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(16,27,51,0.95),rgba(7,13,26,0.95))] p-5 text-white shadow-2xl">
      {audioError && <p role="alert">No se pudo reproducir el audio. Comprueba tu conexión y pulsa Reproducir para intentarlo de nuevo.</p>}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">{practice ? "Práctica libre" : "Reto guiado"}</p>
          <h2 className="text-2xl font-semibold">{run.exercise.title}</h2>
          <p className="mt-2 text-sm text-white/70">{run.prompt.text}</p>
          <p className="mt-1 text-xs text-white/50">
            {practice ? "Configura, prueba y ajusta a tu ritmo." : `${preferences?.practice?.minutesPerDay ?? 20} min diarios · ${mode === "guest" ? "progreso guardado en este dispositivo" : "progreso guardado en tu perfil"}`}
          </p>
        </div>
        {secondsLeft != null && <div className="rounded-2xl border border-amber-200/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-50">{secondsLeft}s por responder</div>}
        {practice?.questionLimit && <div className="space-y-1 rounded-2xl border border-cyan-200/25 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-50"><div>Ejercicio {Math.min(completedExercises + 1, practice.questionLimit)} de {practice.questionLimit}</div><div className="text-xs text-cyan-50/75">Intentos restantes: {attemptsLabel}</div></div>}
      </header>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="mb-3 text-sm text-white/70">{run.presentation.instructions}</p>
        {run.presentation.staffNotes?.length ? (
          <StaffPrompt notes={earIntervalStaffNotes ?? ((run.prompt.kind === "melodic_direction") && !run.feedback ? run.presentation.staffNotes.slice(0, 1) : run.presentation.staffNotes)} clef={run.presentation.clef ?? "treble"} variant={run.feedback ? (run.feedback.correct || run.status === "revealed" ? "selected" : "incorrect") : "default"} onPlay={(notes) => { void playEvents(notes.map((note) => ({ midi: note.midi, atMs: 0, durationMs: 900 }))).catch(() => setAudioError(true)); }} />
        ) : showSelectionOnStaff && displayedStaffNotes.length ? (
          <StaffPrompt notes={displayedStaffNotes} clef="treble" variant={run.feedback && !run.feedback.correct ? "incorrect" : "selected"} onPlay={(notes) => { void playEvents(notes.map((note) => ({ midi: note.midi, atMs: 0, durationMs: 900 }))).catch(() => setAudioError(true)); }} />
        ) : null}
      </div>

      {hasRhythmPrompt && (
        <aside className="space-y-3 rounded-2xl border border-cyan-200/20 bg-cyan-300/5 p-4" aria-label="Metrónomo visual opcional">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-cyan-50">Metrónomo visual</p>
              <p className="text-sm text-white/65">Úsalo para acompañar la lectura. No evalúa tu tempo ni tu interpretación.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setMetronomeBeat(1);
                setMetronomeRunning((running) => !running);
              }}
              aria-pressed={metronomeRunning}
            >
              {metronomeRunning ? "Detener pulso" : "Iniciar pulso"}
            </Button>
          </div>
          <label className="flex items-center gap-3 text-sm text-white/75">
            <span>Tempo: {metronomeTempo} bpm</span>
            <input
              type="range"
              min="40"
              max="120"
              step="5"
              value={metronomeTempo}
              onChange={(event) => setMetronomeTempo(Number(event.target.value))}
              className="accent-cyan-300"
              aria-label="Tempo del metrónomo visual"
            />
          </label>
          <div className="flex gap-2" aria-label={`Pulso visual: tiempo ${metronomeBeat} de 4`}>
            {[1, 2, 3, 4].map((beat) => (
              <span
                key={beat}
                className={cn(
                  "h-4 w-4 rounded-full border transition-colors",
                  metronomeRunning && metronomeBeat === beat
                    ? "border-cyan-100 bg-cyan-200 shadow-[0_0_14px_rgba(103,232,249,0.9)]"
                    : "border-cyan-100/30 bg-white/10",
                )}
              />
            ))}
          </div>
        </aside>
      )}

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
              disabled={working || !isRunActive}
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

      {run.input.mode === "choice-options" && (
        <div className="grid gap-2 sm:grid-cols-2">
          {run.input.options.map((option) => {
            const label = option === "ascending" ? "Asciende" : "Desciende";
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setDirectionChoice(option);
                  submitAnswer({ direction: option });
                }}
                disabled={working || !isRunActive}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-sm transition",
                  directionChoice === option
                    ? "border-cyan-300 bg-cyan-300/10 text-cyan-100"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {run.input.mode === "rhythm-options" && (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {run.input.options.map((position) => (
              <button key={position} type="button" onClick={() => { setPulseChoice(position); submitAnswer({ pulsePosition: position }); }} disabled={working || !isRunActive} className={cn("rounded-xl border px-3 py-2 text-sm", pulseChoice === position ? "border-cyan-300 bg-cyan-300/10 text-cyan-100" : "border-white/10 bg-white/5 hover:bg-white/10")}>Pulso {position}</button>
            ))}
          </div>
          <p className="text-sm text-white/65">Elige la posición del silencio. Esta actividad reconoce el patrón visual; no mide tu tempo.</p>
        </div>
      )}

      {run.input.mode === "rhythm-count-options" && run.prompt.kind === "rhythm_count" && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3" aria-label="Patrón rítmico escrito">
            {run.prompt.symbols.map((symbol, index) => {
              const label = symbol === "half" ? "blanca, dos pulsos" : symbol === "whole" ? "redonda, cuatro pulsos" : symbol === "rest-quarter" ? "silencio de negra, un pulso" : "negra, un pulso";
              const glyph = symbol === "half" ? "𝅗𝅥" : symbol === "whole" ? "𝅝" : symbol === "rest-quarter" ? "𝄽" : "♩";
              return <span key={`${symbol}-${index}`} aria-label={label} className="flex h-14 min-w-12 items-center justify-center rounded-xl border border-cyan-200/40 bg-cyan-300/10 px-3 text-3xl text-cyan-50">{glyph}</span>;
            })}
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowRhythmGuide((shown) => !shown)}
            aria-expanded={showRhythmGuide}
          >
            {showRhythmGuide ? "Ocultar guía de conteo" : "Ver guía de conteo"}
          </Button>
          {showRhythmGuide && (
            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white/75">
              <p>Cuenta una figura a la vez y suma al final:</p>
              <ol className="mt-2 flex flex-wrap gap-2" aria-label="Guía de duración por figura">
                {run.prompt.symbols.map((symbol, index) => {
                  const beats = symbol === "half" ? 2 : symbol === "whole" ? 4 : 1;
                  const name = symbol === "half" ? "Blanca" : symbol === "whole" ? "Redonda" : symbol === "rest-quarter" ? "Silencio de negra" : "Negra";
                  return <li key={`guide-${symbol}-${index}`} className="rounded-lg bg-white/10 px-2 py-1">{name}: {beats} {beats === 1 ? "pulso" : "pulsos"}</li>;
                })}
              </ol>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2">
            {run.input.options.map((count) => <button key={count} type="button" onClick={() => { setBeatCountChoice(count); submitAnswer({ beatCount: count }); }} disabled={working || !isRunActive} className={cn("rounded-xl border px-3 py-2 text-sm", beatCountChoice === count ? "border-cyan-300 bg-cyan-300/10 text-cyan-100" : "border-white/10 bg-white/5 hover:bg-white/10")}>{count} pulsos</button>)}
          </div>
          <p className="text-sm text-white/65">Reconoce la duración escrita. Esta actividad no mide tempo ni cómo la interpretas.</p>
        </div>
      )}

      {(run.input.mode === "single-piano" || run.input.mode === "multi-piano" || run.input.mode === "chord-builder") && (
        <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-white/70">
            {!isKeyboardNote && <span>Selección: {selectedLabels.join(", ") || "ninguna"}</span>}
            <button type="button" onClick={() => setShowKeyboardControls((shown) => !shown)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 text-xl hover:bg-white/10" aria-label="Opciones de teclado">⚙</button>
          </div>
          {showKeyboardControls && <KeyboardControls preferences={keyboardPreferences} onChange={updateKeyboardPreferences} />}
          <div className="h-44 w-full sm:h-52">
            <SimplePiano active={active} selected={selected} onKeyDown={onPianoDown} onKeyUp={onPianoUp} range={keyboardRange} showLabels={keyboardPreferences.showLabels} />
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
          {nextStep && <p className="mt-2 leading-5 text-white/80">{nextStep}</p>}
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
            disabled={working || !isRunActive || !canSubmitPiano}
          >
            Enviar respuesta
          </Button>
        )}
        <Button variant="ghost" onClick={handleReveal} disabled={working || !isRunActive}>
          Ver solución
        </Button>
        <Button variant="solid" onClick={handleNext} disabled={working || Boolean(practice && run.status === "active")}>
          {practice ? `Siguiente ejercicio${practice.questionLimit ? ` · ${Math.min(completedExercises + 1, practice.questionLimit)}/${practice.questionLimit}` : ""}` : "Siguiente ejercicio"}
        </Button>
      </div>
    </section>
  );
}

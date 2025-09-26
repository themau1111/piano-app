/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { Staff } from "./Staff";
import { SimplePiano } from "./SimplePiano";
import { useAttempt, useReplay, useReveal, useStartChord } from "../hooks/useChordExercise";
import { Button } from "./ui/Button";
import { cn } from "@/lib/cn";

type Level = "basic" | "intermediate" | "advanced";

export default function ChordExercise({ level }: { level: Level }) {
  const start = useStartChord();
  const attemptM = useAttempt();
  const replayM = useReplay();
  const revealM = useReveal();

  const [exerciseId, setExerciseId] = useState<string | null>(null);
  type StaffItem = { midi: number; revealed?: boolean };
  const [staff, setStaff] = useState<StaffItem[]>([]);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(5);
  const [nameShown, setNameShown] = useState<string | undefined>();
  const [active, setActive] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // avanzado
  const [typedName, setTypedName] = useState("");
  const [typedInv, setTypedInv] = useState<0 | 1 | 2 | 3 | undefined>(undefined);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const debounced = (fn: () => void, ms = 120) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fn, ms);
  };

  const sampler = useRef<Tone.Sampler | null>(null);

  const asStaff = (v: any): { midi: number; revealed?: boolean }[] => (Array.isArray(v) ? v : []);

  useEffect(() => {
    if (!sampler.current) {
      sampler.current = new Tone.Sampler({
        urls: {
          C4: "C4.mp3",
          "D#4": "Ds4.mp3",
          "F#4": "Fs4.mp3",
          A4: "A4.mp3",
        },
        release: 30,
        baseUrl: "https://tonejs.github.io/audio/salamander/",
      }).toDestination();
    }
    return () => {
      sampler.current?.dispose();
      sampler.current = null;
    };
  }, []);

  useEffect(() => {
    const doStart = async () => {
      const r = await start.mutateAsync({ level, showRootOnStaff: level === "basic" });
      setExerciseId(r.exerciseId);
      setStaff(asStaff(r.staff));
      setAttemptsLeft(5);
      setSelected(new Set());
      setActive(new Set());
      setNameShown(undefined);
      handleReplay("block", r.exerciseId);
    };
    doStart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const handleReplay = async (mode: "block" | "arpeggio" | "arpeggioSlow" | "arpeggioVerySlow", id?: string) => {
    const exId = id ?? exerciseId;
    if (!exId) return;

    const r = await replayM.mutateAsync({ id: exId, mode });

    await Tone.start();
    // Asegura que los buffers del Sampler estén cargados
    await Tone.loaded();

    const now = Tone.now();
    const notesAsNames = r.playback.notes.map((m) => Tone.Frequency(m, "midi").toNote());

    if (!sampler.current) return;

    if (r.playback.stepMs === 0) {
      // Bloque simultáneo (un solo trigger con arreglo de notas)
      sampler.current.triggerAttackRelease(notesAsNames, "8n", now);
    } else {
      // Arpegio: una por una con spacing según stepMs
      notesAsNames.forEach((n, i) => {
        sampler.current!.triggerAttackRelease(n, r.playback.stepMs / 1000, now + (i * r.playback.stepMs) / 1000);
      });
    }
  };

  const onKeyDown = async (m: number) => {
    setActive((p) => new Set(p).add(m));
    await Tone.start(); // por si el usuario toca el piano antes de darle Play
    if (sampler.current) {
      sampler.current.triggerAttack(Tone.Frequency(m, "midi").toNote());
    }
  };

  const onKeyUp = (m: number) => {
    setActive((p) => {
      const n = new Set(p);
      n.delete(m);
      return n;
    });
    if (sampler.current) {
      sampler.current.triggerRelease(Tone.Frequency(m, "midi").toNote());
    }

    setSelected((prev) => {
      const n = new Set(prev);
      n.has(m) ? n.delete(m) : n.add(m);
      if (n.size > 4) n.delete(Array.from(n)[0]);
      // en básico: intentar automáticamente con debounce
      if (level === "basic") {
        debounced(() => {
          if (!exerciseId) return;
          attemptM
            .mutateAsync({ exerciseId, notes: Array.from(n).sort((a, b) => a - b) })
            .then((res) => {
              setStaff(asStaff(res.staff)); // se revelan progresivamente
              setAttemptsLeft(res.attemptsLeft);
              if (res.ok) setNameShown("¡Correcto!");
            })
            .catch(() => {});
        }, 120);
      }
      return n;
    });
  };

  const sendAttempt = async () => {
    if (!exerciseId) return;
    const notes = Array.from(selected).sort((a, b) => a - b);
    if (level === "basic" && notes.length < 3) return;
    if (level !== "basic" && !(notes.length === 3 || notes.length === 4)) return;

    const r = await attemptM.mutateAsync({
      exerciseId,
      notes,
      name: level === "advanced" ? typedName : undefined,
      inversion: level === "advanced" ? typedInv : undefined,
    });
    setStaff(asStaff(r.staff));
    setAttemptsLeft(r.attemptsLeft);
    if (r.ok) setNameShown("¡Correcto!");
  };

  const doReveal = async () => {
    if (!exerciseId) return;
    const r = await revealM.mutateAsync({ exerciseId });
    setStaff(asStaff(r.staff));
    setNameShown(`${r.name}${r.inversion ? ` (${["root", "1st", "2nd", "3rd"][r.inversion]} inv.)` : ""}`);
    setActive(new Set(r.notes)); // pinta solución
  };

  const reset = async () => {
    const r = await start.mutateAsync({ level, showRootOnStaff: level === "basic" });
    setExerciseId(r.exerciseId);
    setStaff(asStaff(r.staff));
    setAttemptsLeft(5);
    setSelected(new Set());
    setActive(new Set());
    setNameShown(undefined);
    handleReplay("block", r.exerciseId);
  };

  const loading = start.isPending || replayM.isPending || attemptM.isPending || revealM.isPending;

  return (
    <section className={cn("w-full space-y-5 rounded-2xl border border-white/10 p-4 sm:p-6", "bg-white/5 backdrop-blur")}>
      {/* Header */}
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button onClick={() => handleReplay("block")} disabled={loading} aria-label="Play">
            🔊 Play
          </Button>
          <div className="hidden sm:block text-xs text-white/70">{Array.from(selected).length} nota(s) seleccionadas</div>
        </div>
        <div className="text-lg sm:text-xl font-semibold min-h-6">{nameShown ?? (level === "advanced" ? "" : " ")}</div>
        <div className={cn("text-xs px-2 py-1 rounded-md", attemptsLeft > 2 ? "bg-emerald-500/20" : "bg-amber-500/20")} title="Intentos restantes">
          Intentos: <span className="font-medium">{attemptsLeft}</span>
        </div>
      </header>

      {/* Staff */}
      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
        <Staff notes={staff ?? []} showName={nameShown} clef="treble" />
      </div>

      {/* Playback toolbar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <Button variant="outline" onClick={() => handleReplay("arpeggio")} disabled={loading}>
          Arpegio
        </Button>
        <Button variant="outline" onClick={() => handleReplay("arpeggioSlow")} disabled={loading}>
          Lento
        </Button>
        <Button variant="outline" onClick={() => handleReplay("arpeggioVerySlow")} disabled={loading}>
          Muy lento
        </Button>
        <Button variant="ghost" onClick={doReveal} disabled={loading}>
          Tell me
        </Button>
        <Button variant="ghost" onClick={reset} disabled={loading}>
          Reset / Next
        </Button>
      </div>

      {/* Advanced inputs */}
      {level === "advanced" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-white/70">Nombre</span>
            <input
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="Gmaj7, F#m7b5…"
              className="h-10 rounded-xl bg-white/5 border border-white/10 px-3 outline-none focus:ring-2 focus:ring-white/20"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-white/70">Inversión</span>
            <select
              value={typedInv ?? ""}
              onChange={(e) => setTypedInv((e.target.value === "" ? undefined : Number(e.target.value)) as any)}
              className="h-10 rounded-xl bg-white/5 border border-white/10 px-3 outline-none focus:ring-2 focus:ring-white/20"
            >
              <option value="">—</option>
              <option value={0}>Root</option>
              <option value={1}>1st</option>
              <option value={2}>2nd</option>
              <option value={3}>3rd</option>
            </select>
          </label>
          <div className="flex items-end justify-end">
            <Button onClick={sendAttempt} className="w-full sm:w-auto" disabled={loading}>
              Enviar
            </Button>
          </div>
        </div>
      )}

      {/* Piano */}
      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="w-full min-h-[120px] h-36 sm:h-44 md:h-52 lg:h-60">
          <SimplePiano
            active={active}
            selected={selected}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
            range={[48, 71]} // C3–B5
          />
        </div>
      </div>

      {/* Submit (basic/intermediate) */}
      {level !== "advanced" && (
        <div className="flex justify-end">
          <Button onClick={sendAttempt} disabled={loading}>
            Enviar
          </Button>
        </div>
      )}
    </section>
  );
}

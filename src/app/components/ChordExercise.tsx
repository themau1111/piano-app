"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import * as Tone from "tone";
import { Staff } from "./Staff";
import { SimplePiano } from "./SimplePiano";
import { useAttempt, useReplay, useReveal, useStartChord } from "../hooks/useChordExercise";

type Level = "basic" | "intermediate" | "advanced";

export default function ChordExercise({ level }: { level: Level }) {
  const start = useStartChord();
  const attemptM = useAttempt();
  const replayM = useReplay();
  const revealM = useReveal();

  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const [staff, setStaff] = useState<{ midi: number; revealed: boolean }[]>([]);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(5);
  const [nameShown, setNameShown] = useState<string | undefined>();
  const [active, setActive] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // avanzado: nombre e inversión
  const [typedName, setTypedName] = useState("");
  const [typedInv, setTypedInv] = useState<0 | 1 | 2 | 3 | undefined>(undefined);

  useEffect(() => {
    // start al montar
    const doStart = async () => {
      const r = await start.mutateAsync({ level, showRootOnStaff: level === "basic" });
      setExerciseId(r.exerciseId);
      setStaff(r.staff);
      setAttemptsLeft(5);
      setSelected(new Set());
      setActive(new Set());
      setNameShown(undefined);
      // reproduce acorde por primera vez
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
    if (r.playback.stepMs === 0) {
      const now = Tone.now();
      r.playback.notes.forEach((m, i) => {
        const s = new Tone.Synth().toDestination();
        s.triggerAttackRelease(Tone.Frequency(m, "midi").toFrequency(), "8n", now + i * 0.01);
      });
    } else {
      const now = Tone.now();
      r.playback.notes.forEach((m, i) => {
        const s = new Tone.Synth().toDestination();
        s.triggerAttackRelease(Tone.Frequency(m, "midi").toFrequency(), r.playback.stepMs / 1000, now + (i * r.playback.stepMs) / 1000);
      });
    }
  };

  const onKeyDown = (m: number) => setActive((prev) => new Set(prev).add(m));
  const onKeyUp = (m: number) => {
    setActive((prev) => {
      const n = new Set(prev);
      n.delete(m);
      return n;
    });
    // toggle en selección
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(m)) n.delete(m);
      else n.add(m);
      // limitar a 4 notas
      if (n.size > 4) n.delete(Array.from(n)[0]);
      return n;
    });
  };

  const sendAttempt = async () => {
    if (!exerciseId) return;
    // reglas por nivel
    const notes = Array.from(selected).sort((a, b) => a - b);
    if (level === "basic" && notes.length < 3) return; // en básico dejamos que junte 3
    if (level !== "basic" && !(notes.length === 3 || notes.length === 4)) return;

    const r = await attemptM.mutateAsync({
      exerciseId,
      notes,
      name: level === "advanced" ? typedName : undefined,
      inversion: level === "advanced" ? typedInv : undefined,
    });
    setStaff(r.staff);
    setAttemptsLeft(r.attemptsLeft);
    if (r.ok) {
      setNameShown("¡Correcto!");
    } else {
      // pequeño flash rojo -> puedes manejar con una clase CSS
    }
  };

  const doReveal = async () => {
    if (!exerciseId) return;
    const r = await revealM.mutateAsync({ exerciseId });
    setStaff(r.staff);
    setNameShown(`${r.name}${r.inversion ? ` (${["root", "1st", "2nd", "3rd"][r.inversion]} inv.)` : ""}`);
    // iluminar teclas solución en azul: aquí usamos active para pintar
    setActive(new Set(r.notes));
  };

  const reset = async () => {
    const r = await start.mutateAsync({ level, showRootOnStaff: level === "basic" });
    setExerciseId(r.exerciseId);
    setStaff(r.staff);
    setAttemptsLeft(5);
    setSelected(new Set());
    setActive(new Set());
    setNameShown(undefined);
    handleReplay("block", r.exerciseId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => handleReplay("block")} className="px-3 py-2 rounded bg-gray-200">
          🔊 Play
        </button>
        <div className="font-bold text-xl">{nameShown ?? (level === "advanced" ? "" : " ")}</div>
        <div className="text-sm">Intentos: {attemptsLeft}</div>
      </div>

      <Staff notes={staff} showName={nameShown} />

      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => handleReplay("arpeggio")} className="px-3 py-2 rounded bg-gray-100">
          1. Arpegio
        </button>
        <button onClick={() => handleReplay("arpeggioSlow")} className="px-3 py-2 rounded bg-gray-100">
          2. Lento
        </button>
        <button onClick={() => handleReplay("arpeggioVerySlow")} className="px-3 py-2 rounded bg-gray-100">
          3. Muy lento
        </button>
        <button onClick={doReveal} className="px-3 py-2 rounded bg-amber-100 col-span-1">
          Tell me
        </button>
        <button onClick={reset} className="px-3 py-2 rounded bg-red-100 col-span-2">
          Reset / Next
        </button>
      </div>

      {level === "advanced" && (
        <div className="flex gap-2 items-end">
          <div className="flex flex-col">
            <label className="text-xs">Nombre</label>
            <input value={typedName} onChange={(e) => setTypedName(e.target.value)} placeholder="Gmaj7, F#m7b5..." className="border px-2 py-1 rounded" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs">Inversión</label>
            <select value={typedInv ?? ""} onChange={(e) => setTypedInv((e.target.value === "" ? undefined : Number(e.target.value)) as any)} className="border px-2 py-1 rounded">
              <option value="">—</option>
              <option value={0}>Root</option>
              <option value={1}>1st</option>
              <option value={2}>2nd</option>
              <option value={3}>3rd</option>
            </select>
          </div>
        </div>
      )}

      <div className="w-full min-h-[120px] h-36 sm:h-44 md:h-52 lg:h-60">
        <SimplePiano
          active={active}
          selected={selected}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          range={[55, 76]} // G3–E5
        />
      </div>

      <div className="flex justify-end">
        <button onClick={sendAttempt} className="px-4 py-2 rounded bg-blue-600 text-white">
          Enviar
        </button>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import * as Tone from "tone";
import { SimplePiano } from "../SimplePiano";
import { analyzeChord } from "@/lib/analyzeChord";
import { formatChordName } from "@/lib/formatChordName";

const DEFAULT_RANGE: [number, number] = [60, 83];

function midiToLabel(midi: number) {
  return Tone.Frequency(midi, "midi").toNote();
}

export function HomeHeroPiano() {
  const [active, setActive] = useState<Set<number>>(new Set());

  const activeLabels = useMemo(
    () =>
      Array.from(active)
        .sort((left, right) => left - right)
        .map(midiToLabel),
    [active]
  );
  const chord = useMemo(() => analyzeChord(activeLabels), [activeLabels]);

  function handleDown(midi: number) {
    setActive((prev) => new Set(prev).add(midi));
  }

  function handleUp(midi: number) {
    setActive((prev) => {
      const next = new Set(prev);
      next.delete(midi);
      return next;
    });
  }

  return (
    <div className="rounded-[28px] border border-cyan-200/10 bg-[linear-gradient(180deg,rgba(10,18,34,0.88),rgba(14,31,58,0.82))] p-4 shadow-2xl">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/70">Demo interactiva</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Toca algo antes de entrar a practicar</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">Puedes usar mouse o teclado de computadora. El home vuelve a sentirse vivo, pero ahora conectado al estudio guiado.</p>
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-[#07101f] p-3">
        <div className="h-44 sm:h-52">
          <SimplePiano active={active} onKeyDown={handleDown} onKeyUp={handleUp} range={DEFAULT_RANGE} />
        </div>
      </div>

      <div className="mt-4 min-h-14" aria-live="polite">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-200/65">Sonando ahora</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/75">
          {activeLabels.length ? (
            activeLabels.map((label) => (
            <span key={label} className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-cyan-100">
              {label}
            </span>
            ))
          ) : (
            <span className="text-white/55">Toca una tecla para escucharla y verla aquí.</span>
          )}
        </div>
        {chord.status === "recognized" && chord.name && (
          <p className="mt-3 text-sm text-cyan-50">
            <span className="font-semibold">{formatChordName(chord.name)}</span>
            {chord.inversion && <span className="text-white/60"> · {chord.inversion === "root" ? "posición fundamental" : `${chord.inversion} inversión`}{chord.figuredBass ? ` (${chord.figuredBass})` : ""}</span>}
            {chord.extensions.length > 0 && <span className="text-white/60"> · incluye {chord.extensions.join(", ")}</span>}
          </p>
        )}
        {chord.status === "partial" && <p className="mt-3 text-sm text-white/55">Dos notas: aún no hay suficiente información para nombrar un acorde.</p>}
        {chord.status === "ambiguous" && <p className="mt-3 text-sm text-white/55">Esta combinación admite más de una lectura; prueba añadir o retirar una nota.</p>}
      </div>
    </div>
  );
}

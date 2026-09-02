"use client";

import { useMemo, useState } from "react";
import * as Tone from "tone";
import { SimplePiano } from "../SimplePiano";

const DEFAULT_RANGE: [number, number] = [60, 83];

function midiToLabel(midi: number) {
  return Tone.Frequency(midi, "midi").toNote();
}

export function HomeHeroPiano() {
  const [active, setActive] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const selectedLabels = useMemo(
    () =>
      Array.from(selected)
        .sort((left, right) => left - right)
        .map(midiToLabel),
    [selected]
  );

  function handleDown(midi: number) {
    setActive((prev) => new Set(prev).add(midi));
    setSelected((prev) => {
      const next = new Set(prev);
      next.add(midi);
      while (next.size > 6) {
        next.delete(Array.from(next)[0]);
      }
      return next;
    });
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
        <button
          type="button"
          onClick={() => setSelected(new Set())}
          className="rounded-xl border border-white/15 px-3 py-2 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white"
        >
          Limpiar
        </button>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-[#07101f] p-3">
        <div className="h-44 sm:h-52">
          <SimplePiano active={active} selected={selected} onKeyDown={handleDown} onKeyUp={handleUp} range={DEFAULT_RANGE} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-white/75">
        <span className="text-white/45">Notas recientes:</span>
        {selectedLabels.length ? (
          selectedLabels.map((label) => (
            <span key={label} className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-cyan-100">
              {label}
            </span>
          ))
        ) : (
          <span className="text-white/55">Todavía no tocas nada.</span>
        )}
      </div>
    </div>
  );
}

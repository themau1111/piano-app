"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import * as Tone from "tone";
import { SimplePiano } from "../SimplePiano";
import { analyzeChord } from "@/lib/analyzeChord";
import { formatChordName } from "@/lib/formatChordName";

const DEFAULT_RANGE: [number, number] = [60, 83];

function midiToLabel(midi: number) {
  return Tone.Frequency(midi, "midi").toNote();
}

function orientationControl() {
  return window.screen.orientation as unknown as {
    lock?: (orientation: "landscape") => Promise<void>;
    unlock?: () => void;
  };
}

export function HomeHeroPiano({
  active,
  setActive,
  onClearCombination,
  intervalMap,
}: {
  active: Set<number>;
  setActive: React.Dispatch<React.SetStateAction<Set<number>>>;
  onClearCombination: () => void;
  intervalMap?: ReactNode;
}) {
  const [captureMode, setCaptureMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const activeLabels = useMemo(
    () =>
      Array.from(active)
        .sort((left, right) => left - right)
        .map(midiToLabel),
    [active],
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

  function clearCapture() {
    setActive(new Set());
    onClearCombination();
  }

  async function toggleExpanded() {
    const nextExpanded = !isExpanded;
    setIsExpanded(nextExpanded);

    try {
      if (nextExpanded) {
        await document.documentElement.requestFullscreen?.();
        await orientationControl().lock?.("landscape");
      } else {
        orientationControl().unlock?.();
        if (document.fullscreenElement) await document.exitFullscreen?.();
      }
    } catch {
      // iOS and some embedded browsers do not allow orientation locking. The
      // full-screen layout below remains a usable horizontal-scroll fallback.
    }
  }

  useEffect(() => {
    function handleFullscreenChange() {
      if (!document.fullscreenElement) {
        orientationControl().unlock?.();
        setIsExpanded(false);
      }
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      orientationControl().unlock?.();
    };
  }, []);

  useEffect(() => {
    if (!isExpanded) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isExpanded]);

  return (
    <div className={`border border-cyan-200/10 bg-[linear-gradient(180deg,rgba(10,18,34,0.88),rgba(14,31,58,0.82))] p-4 shadow-2xl ${isExpanded ? "fixed inset-0 z-[70] overscroll-contain overflow-auto rounded-none !bg-[#06101f]" : "rounded-[28px]"}`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/70">Demo interactiva</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Toca algo antes de entrar a practicar</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">Puedes usar mouse o teclado de computadora.</p>
        </div>
      </div>

      <div className={`mb-3 flex items-center gap-2 ${isExpanded ? "sticky top-0 z-10 -mx-4 bg-[#06101f] px-4 py-2" : ""}`}>
        <button
          type="button"
          onClick={() => void toggleExpanded()}
          aria-label={isExpanded ? "Restaurar tamaño del piano" : "Ampliar piano"}
          title={isExpanded ? "Restaurar" : "Ampliar"}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 text-cyan-100 transition hover:bg-white/10 ${isExpanded ? "" : "sm:hidden"}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d={isExpanded ? "M8 3H3v5m13-5h5v5M8 21H3v-5m18 5h-5v-5" : "M8 3H3v5m0-5 6 6m7-6h5v5m0-5-6 6M8 21H3v-5m0 5 6-6m7 6h5v-5m0 5-6-6"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={captureMode}
          onClick={() => setCaptureMode((value) => !value)}
          className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${captureMode ? "border-cyan-200/50 bg-cyan-300/15 text-cyan-50" : "border-white/15 text-white/70 hover:bg-white/10"}`}
        >
          Modo captura
        </button>
        <button
          type="button"
          onClick={clearCapture}
          disabled={!active.size}
          className="rounded-xl border border-white/15 px-3 py-2 text-xs font-medium text-white/70 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Limpiar
        </button>
      </div>

      <div className="overflow-x-auto rounded-[24px] border border-white/10 bg-[#07101f] p-3">
        <div className={isExpanded ? "h-[min(56dvh,22rem)] min-w-[42rem]" : "h-44 sm:h-52"}>
          <SimplePiano active={active} onKeyDown={handleDown} onKeyUp={handleUp} range={DEFAULT_RANGE} captureMode={captureMode} />
        </div>
      </div>

      <div className="mt-4 h-24 overflow-y-auto pr-1" aria-live="polite">
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
            {chord.inversion && <span className="text-white/60"> · {chord.inversion === "root" ? "posición fundamental" : `${chord.inversion} inversión`}</span>}
            {chord.extensions.length > 0 && <span className="text-white/60"> · incluye {chord.extensions.join(", ")}</span>}
          </p>
        )}
        {chord.status === "partial" && <p className="mt-3 text-sm text-white/55">Dos notas: aún no hay suficiente información para nombrar un acorde.</p>}
        {chord.status === "ambiguous" && <p className="mt-3 text-sm text-white/55">Esta combinación admite más de una lectura; prueba añadir o retirar una nota.</p>}
      </div>

      {isExpanded && intervalMap && <div className="mt-5 pb-6">{intervalMap}</div>}
    </div>
  );
}

"use client";
import * as Tone from "tone";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { keyToNoteMap } from "@/lib/keyToNoteMap";

type Props = {
  active: Set<number>;
  /** Persistent selections are used by exercise builders; the home passes none. */
  selected?: Set<number>;
  onKeyDown: (midi: number) => void;
  onKeyUp: (midi: number) => void;
  range?: [number, number];
};

export function SimplePiano({ active, selected = new Set(), onKeyDown, onKeyUp, range = [60, 72] }: Props) {
  const sampler = useRef<Tone.Sampler | null>(null);
  const pressedKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!sampler.current) {
      sampler.current = new Tone.Sampler({
        urls: {
          C4: "C4.mp3",
          "D#4": "Ds4.mp3",
          "F#4": "Fs4.mp3",
          A4: "A4.mp3",
        },
        release: 0.35,
        baseUrl: "https://tonejs.github.io/audio/salamander/",
      }).toDestination();
    }
  }, []);

  const isBlack = (m: number) => [1, 3, 6, 8, 10].includes(m % 12);
  const midiToNote = (m: number) => Tone.Frequency(m, "midi").toNote(); // p.ej. 60 -> "C4"
  const keyboardMidiMap = useMemo(() => {
    const map = new Map<string, number>();
    Object.entries(keyToNoteMap).forEach(([key, note]) => {
      const midi = Tone.Frequency(note).toMidi();
      if (midi >= range[0] && midi <= range[1]) {
        map.set(key.toLowerCase(), midi);
      }
    });
    return map;
  }, [range]);

  const keys = Array.from({ length: range[1] - range[0] + 1 }, (_, i) => range[0] + i);
  const whiteKeys = keys.filter((k) => !isBlack(k));
  const blackKeys = keys.filter(isBlack);

  const wWhite = 100 / whiteKeys.length;
  const wBlack = wWhite * 0.6;

  const handleDown = useCallback(async (m: number) => {
    await Tone.start(); // asegura el AudioContext al primer click
    onKeyDown(m);
    sampler.current?.triggerAttack(midiToNote(m));
  }, [onKeyDown]);

  const handleUp = useCallback((m: number) => {
    onKeyUp(m);
    sampler.current?.triggerRelease(midiToNote(m));
  }, [onKeyUp]);

  useEffect(() => {
    const isTypingInInput = () => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
    };

    const down = async (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey || isTypingInInput()) return;
      const key = (event.key.length === 1 ? event.key.toLowerCase() : event.key) as string;
      const midi = keyboardMidiMap.get(key);
      if (midi == null || pressedKeys.current.has(key)) return;
      pressedKeys.current.add(key);
      await handleDown(midi);
    };

    const up = (event: KeyboardEvent) => {
      const key = (event.key.length === 1 ? event.key.toLowerCase() : event.key) as string;
      const midi = keyboardMidiMap.get(key);
      if (midi == null) return;
      pressedKeys.current.delete(key);
      handleUp(midi);
    };

    const releaseAll = () => {
      pressedKeys.current.forEach((key) => {
        const midi = keyboardMidiMap.get(key);
        if (midi != null) handleUp(midi);
      });
      pressedKeys.current.clear();
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", releaseAll);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", releaseAll);
    };
  }, [handleDown, handleUp, keyboardMidiMap]);

  return (
    <div className="relative w-full h-full select-none">
      {/* BLANCAS */}
      <div className="flex w-full h-full">
        {whiteKeys.map((m) => (
          <button
            key={m}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              handleDown(m);
            }}
            onPointerUp={() => handleUp(m)}
            onPointerCancel={() => handleUp(m)}
            className={`flex-1 h-full border border-slate-300 bg-gradient-to-b from-white to-slate-100 transition-all duration-75 ease-out ${active.has(m) ? "translate-y-1 border-cyan-300 bg-cyan-100 shadow-[inset_0_5px_12px_rgba(8,145,178,0.32)]" : selected.has(m) ? "ring-2 ring-green-500" : "shadow-[inset_0_-5px_0_rgba(148,163,184,0.25)] hover:from-cyan-50"}`}
            aria-label={`Tocar ${midiToNote(m)}`}
          />
        ))}
      </div>

      {/* NEGRAS */}
      <div className="absolute inset-0 h-[60%] pointer-events-none">
        {blackKeys.map((m) => {
          const nWhitesBefore = whiteKeys.filter((w) => w < m).length;
          const left = nWhitesBefore * wWhite; // centro del hueco
          return (
            <button
              key={m}
              onPointerDown={(e) => {
                e.stopPropagation();
                e.currentTarget.setPointerCapture(e.pointerId);
                handleDown(m);
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                handleUp(m);
              }}
              onPointerCancel={() => handleUp(m)}
              style={{ left: `${left}%`, width: `${wBlack}%` }}
              className={`absolute top-0 translate-x-[-50%] h-full
                          border border-slate-950 bg-gradient-to-b from-slate-700 to-slate-950 shadow-[inset_0_-5px_0_rgba(0,0,0,0.65)] transition-all duration-75 ease-out pointer-events-auto ${active.has(m) ? "translate-y-1 border-cyan-300 from-cyan-500 to-cyan-800 shadow-[inset_0_5px_10px_rgba(8,47,73,0.7)]" : selected.has(m) ? "ring-2 ring-green-500" : "hover:from-slate-600"}`}
              aria-label={`Tocar ${midiToNote(m)}`}
            />
          );
        })}
      </div>
    </div>
  );
}

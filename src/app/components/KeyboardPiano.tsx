"use client";
import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { keyToNoteMap } from "../../lib/keyToNoteMap";
import { VisualPiano } from "./VisualPiano";
import { formatChordName } from "../../lib/formatChordName";
import { analyzeChord } from "../../lib/analyzeChord";

export function KeyboardPiano() {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const activeNotesRef = useRef<Set<string>>(new Set());
  const synthRef = useRef<Tone.Sampler | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const isTypingInInput = () => {
    const el = document.activeElement as HTMLElement | null;
    if (!el) return false;
    const tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
  };

  useEffect(() => {
    activeNotesRef.current = activeNotes;
  }, [activeNotes]);

  useEffect(() => {
    if (!synthRef.current) {
      const sampler = new Tone.Sampler({
        urls: { C4: "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3", A4: "A4.mp3" },
        release: 1,
        baseUrl: "https://tonejs.github.io/audio/salamander/",
        onload: () => setIsLoaded(true),
      }).toDestination();
      synthRef.current = sampler;
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingInInput()) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.repeat) return;

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const note = (keyToNoteMap as any)[key];
      if (!note) return;

      const current = activeNotesRef.current;
      if (!current.has(note)) {
        synthRef.current?.triggerAttack(note);
        const next = new Set(current);
        next.add(note);
        activeNotesRef.current = next;
        setActiveNotes(next);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isTypingInInput()) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const note = (keyToNoteMap as any)[key];
      if (!note) return;

      synthRef.current?.triggerRelease(note);
      const next = new Set(activeNotesRef.current);
      next.delete(note);
      activeNotesRef.current = next;
      setActiveNotes(next);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const currentNotes = Array.from(activeNotes).sort((a, b) => Tone.Frequency(a).toMidi() - Tone.Frequency(b).toMidi());

  const chordInfo = analyzeChord(currentNotes);

  if (!isLoaded) {
    return (
      <div className="text-center mt-8 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-lg font-semibold text-gray-400">🎧 Cargando piano…</p>
      </div>
    );
  }

  return (
    <div className="mt-6 text-center">
      <h2 className="text-lg font-bold">🎹 Toca con el teclado (A–Ñ)</h2>

      <p className="text-sm text-gray-500">Notas activas (ordenadas): {currentNotes.join(", ") || "ninguna"}</p>

      {chordInfo.name && (
        <div className="mt-2">
          <p className="text-green-600 text-xl">Acorde: {formatChordName(chordInfo.name)}</p>

          {chordInfo.inversion && (
            <p className="text-sm text-gray-400">
              Inversión: {chordInfo.inversion} ({chordInfo.figuredBass})
            </p>
          )}

          <p className="text-sm text-gray-400">
            Intervalos desde {currentNotes[0]}: {chordInfo.intervals.join(", ")}
          </p>
        </div>
      )}

      <div className="bg-background text-foreground p-4"></div>
      <VisualPiano />
    </div>
  );
}

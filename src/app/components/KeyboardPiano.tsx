"use client";
import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { keyToNoteMap } from "../lib/keyToNoteMap";
import { VisualPiano } from "./VisualPiano";
import { Chord } from "tonal";
import { formatChordName } from "../lib/formatChordName";
import { analyzeChord } from "../lib/analyzeChord";

export function KeyboardPiano() {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const synthRef = useRef<Tone.Sampler | null>(null);

  useEffect(() => {
    // Crea synth una vez
    if (!synthRef.current) {
      synthRef.current = new Tone.Sampler({
        urls: {
          C4: "C4.mp3",
          "D#4": "Ds4.mp3",
          "F#4": "Fs4.mp3",
          A4: "A4.mp3",
        },
        release: 1,
        baseUrl: "https://tonejs.github.io/audio/salamander/", // Biblioteca de samples gratuitos
      }).toDestination();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const note = keyToNoteMap[e.key];
      if (note && !activeNotes.has(note)) {
        synthRef.current?.triggerAttack(note);
        setActiveNotes((prev) => new Set(prev).add(note));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const note = keyToNoteMap[e.key];
      if (note) {
        synthRef.current?.triggerRelease(note);
        setActiveNotes((prev) => {
          const newSet = new Set(prev);
          newSet.delete(note);
          return newSet;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [activeNotes]);

  const currentNotes = Array.from(activeNotes).sort(
    (a, b) => Tone.Frequency(a).toMidi() - Tone.Frequency(b).toMidi()
  );

  const chordInfo = analyzeChord(currentNotes);

  return (
    <div className="mt-6 text-center">
      <h2 className="text-lg font-bold">🎹 Toca con el teclado (A–Ñ)</h2>

      <p className="text-sm text-gray-500">
        Notas activas (ordenadas): {currentNotes.join(", ") || "ninguna"}
      </p>

      {chordInfo.name && (
        <div className="mt-2">
          <p className="text-green-600 text-xl">
            Acorde: {formatChordName(chordInfo.name)}
          </p>

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

      <VisualPiano activeNotes={currentNotes} />
    </div>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { keyToNoteMap } from "../lib/keyToNoteMap";
import { VisualPiano } from "./VisualPiano";
import { formatChordName } from "../lib/formatChordName";
import { analyzeChord } from "../lib/analyzeChord";

export function KeyboardPiano() {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const synthRef = useRef<Tone.Sampler | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Crea synth una vez
    if (!synthRef.current) {
      const sampler = new Tone.Sampler({
        urls: {
          C4: "C4.mp3",
          "D#4": "Ds4.mp3",
          "F#4": "Fs4.mp3",
          A4: "A4.mp3",
        },
        release: 1,
        baseUrl: "https://tonejs.github.io/audio/salamander/", // Biblioteca de samples gratuitos
        onload: () => {
          setIsLoaded(true);
          console.log("Sampler cargado");
        },
      }).toDestination();
      synthRef.current = sampler;
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

  if (!isLoaded) {
    return (
      <div className="text-center mt-8 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-lg font-semibold text-gray-400">
          🎧 Cargando piano…
        </p>
      </div>
    );
  }

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

      <div className="bg-background text-foreground p-4"></div>
      <VisualPiano activeNotes={currentNotes} />
    </div>
  );
}

"use client";
import * as Tone from "tone";
import { useEffect } from "react";

type Props = {
  notes: string[];
};

export function Piano({ notes }: Props) {
  useEffect(() => {
    const synth = new Tone.PolySynth().toDestination();
    synth.triggerAttackRelease(notes, "1n");
  }, [notes]);

  return (
    <div className="flex justify-center mt-4">
      <p className="text-xl">🎵 Tocando: {notes.join(" ")}</p>
    </div>
  );
}

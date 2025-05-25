"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Piano, KeyboardShortcuts, MidiNumbers } from "react-piano";
import "react-piano/dist/styles.css";
import { useEffect, useRef } from "react";
import * as Tone from "tone";

export function VisualPiano() {
  const noteRange = {
    first: MidiNumbers.fromNote("C4"),
    last: MidiNumbers.fromNote("B5"),
  };

  const keyboardShortcuts = KeyboardShortcuts.create({
    firstNote: noteRange.first,
    lastNote: noteRange.last,
    keyboardConfig: KeyboardShortcuts.HOME_ROW,
  });

  const synthRef = useRef<Tone.Sampler | null>(null);

  useEffect(() => {
    if (!synthRef.current) {
      synthRef.current = new Tone.Sampler({
        urls: {
          C4: "C4.mp3",
          "D#4": "Ds4.mp3",
          "F#4": "Fs4.mp3",
          A4: "A4.mp3",
        },
        release: 1,
        baseUrl: "https://tonejs.github.io/audio/salamander/",
      }).toDestination();
    }
  }, []);

  return (
    <div className="mt-8">
      <Piano
        noteRange={noteRange}
        playNote={(midiNumber: any) => {
          const note = MidiNumbers.getAttributes(midiNumber).note;
          synthRef.current?.triggerAttack(note);
        }}
        stopNote={(midiNumber: any) => {
          const note = MidiNumbers.getAttributes(midiNumber).note;
          synthRef.current?.triggerRelease(note);
        }}
        disabled={false}
        width={700}
        keyboardShortcuts={keyboardShortcuts}
      />
    </div>
  );
}

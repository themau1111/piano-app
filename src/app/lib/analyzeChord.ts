import { CHORD_STRUCTURES } from "./chordStructures";
import { Note, Interval } from "tonal";
import * as Tone from "tone";
import { getIntervalsFrom } from "./getIntervals";

type ChordAnalysis = {
  name: string | null;
  root: string | null;
  inversion: "root" | "1st" | "2nd" | null;
  figuredBass: "5/3" | "6/3" | "6/4" | null;
  intervals: string[];
};

export function analyzeChord(notes: string[]): ChordAnalysis {
  if (notes.length < 3)
    return {
      name: null,
      root: null,
      inversion: null,
      figuredBass: null,
      intervals: [],
    };

  const sorted = [...notes].sort(
    (a, b) => Tone.Frequency(a).toMidi() - Tone.Frequency(b).toMidi()
  );

  for (const candidateRoot of sorted) {
    const intervals = getIntervalsFrom(candidateRoot, sorted);

    for (const chordType of CHORD_STRUCTURES) {
      const match = chordType.intervals.every((i) => intervals.includes(i));

      if (match) {
        const root = Note.pitchClass(candidateRoot);

        // Detectar inversión con respecto a la raíz
        const bass = Note.pitchClass(sorted[0]);
        const positions = chordType.intervals.map((i) => Interval.semitones(i));
        const figuredBass =
          bass === root
            ? "5/3"
            : intervals.includes("6M") && intervals.includes("3M")
            ? "6/3"
            : intervals.includes("6M") && intervals.includes("4P")
            ? "6/4"
            : null;

        const inversion =
          bass === root
            ? "root"
            : figuredBass === "6/3"
            ? "1st"
            : figuredBass === "6/4"
            ? "2nd"
            : null;

        return {
          name: `${root}${
            chordType.name === "major"
              ? ""
              : chordType.name === "minor"
              ? "m"
              : chordType.name
          }`,
          root,
          inversion,
          figuredBass,
          intervals,
        };
      }
    }
  }

  return {
    name: null,
    root: null,
    inversion: null,
    figuredBass: null,
    intervals: [],
  };
}

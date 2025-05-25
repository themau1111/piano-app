/* eslint-disable @typescript-eslint/no-unused-vars */
import { Note } from "tonal";
import { getIntervalsFrom, matchChordBySemitones } from "./getIntervals";
import { CHORD_STRUCTURES } from "./chordStructures";

export function analyzeChord(notes: string[]) {
  if (notes.length < 3)
    return {
      name: null,
      root: null,
      inversion: null,
      figuredBass: null,
      intervals: [],
    };

  const sorted = [...notes].sort((a, b) => Note.midi(a)! - Note.midi(b)!);

  for (const candidateRoot of sorted) {
    for (const chord of CHORD_STRUCTURES) {
      if (matchChordBySemitones(candidateRoot, sorted, chord.intervals)) {
        const bass = Note.pitchClass(sorted[0]);
        const root = Note.pitchClass(candidateRoot);

        const intervalsFromBass = getIntervalsFrom(sorted[0], sorted);

        let inversion: "root" | "1st" | "2nd" | "3rd" | null = null;
        let figuredBass:
          | "5/3"
          | "6/3"
          | "6/4"
          | "7"
          | "6/5"
          | "4/3"
          | "4/2"
          | null = null;

        const bassNote = sorted[0];
        const bassPC = Note.pitchClass(bassNote);
        const rootNote = candidateRoot;

        if (chord.intervals.length === 4) {
          const thirdNote = Note.pitchClass(
            Note.transpose(rootNote, chord.intervals[1])
          );
          const fifthNote = Note.pitchClass(
            Note.transpose(rootNote, chord.intervals[2])
          );
          const seventhNote = Note.pitchClass(
            Note.transpose(rootNote, chord.intervals[3])
          );

          if (bassPC === root) {
            inversion = "root";
            figuredBass = "7";
          } else if (bassPC === thirdNote) {
            inversion = "1st";
            figuredBass = "6/5";
          } else if (bassPC === fifthNote) {
            inversion = "2nd";
            figuredBass = "4/3";
          } else if (bassPC === seventhNote) {
            inversion = "3rd";
            figuredBass = "4/2";
          }
        } else {
          const thirdNote = Note.pitchClass(
            Note.transpose(rootNote, chord.intervals[1])
          );
          const fifthNote = Note.pitchClass(
            Note.transpose(rootNote, chord.intervals[2])
          );

          if (bassPC === root) {
            inversion = "root";
            figuredBass = "5/3";
          } else if (bassPC === thirdNote) {
            inversion = "1st";
            figuredBass = "6/3";
          } else if (bassPC === fifthNote) {
            inversion = "2nd";
            figuredBass = "6/4";
          }
        }

        const formattedName =
          chord.name === "major"
            ? root
            : chord.name === "minor"
            ? root + "m"
            : root + chord.name;

        return {
          name: formattedName,
          root,
          inversion,
          figuredBass,
          intervals: intervalsFromBass,
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

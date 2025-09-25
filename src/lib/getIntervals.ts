import { Interval, Note } from "tonal";

/**
 * Calcula los intervalos entre una nota raíz y las demás
 */
export function getIntervalsFrom(noteRoot: string, notes: string[]): string[] {
  return notes.map((n) => Interval.distance(noteRoot, n));
}

export function matchChordBySemitones(
  rootNote: string,
  notes: string[],
  chordIntervals: string[]
): boolean {
  const rootMidi = Note.midi(rootNote);
  if (rootMidi === null) return false;

  const actualSemitones = notes
    .map((n) => Note.midi(n))
    .filter((m): m is number => m !== null)
    .map((m) => (m - rootMidi + 120) % 12) // normaliza entre 0 y 11
    .sort((a, b) => a - b);

  const expectedSemitones = chordIntervals
    .map((i) => Interval.semitones(i))
    .map((s) => s % 12)
    .sort((a, b) => a - b);

  return actualSemitones.join(",") === expectedSemitones.join(",");
}

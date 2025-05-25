import { Chord } from "tonal";

export function detectChord(notes: string[]): string | null {
  const pitchClasses = notes.map((note) => note.replace(/[0-9]/g, ""));

  const uniqueSorted = [...new Set(pitchClasses)].sort(); // orden alfabético sin repetidos
  const detected = Chord.detect(uniqueSorted);

  if (!detected.length) return null;

  const chordName = detected[0].split("/")[0];

  return chordName;
}

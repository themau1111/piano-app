import { Chord, Interval, Note } from "tonal";

export type ChordAnalysis = {
  name: string | null;
  root: string | null;
  inversion: "root" | "1st" | "2nd" | "3rd" | null;
  figuredBass: "5/3" | "6/3" | "6/4" | "7" | "6/5" | "4/3" | "4/2" | null;
  intervals: string[];
  extensions: string[];
  status: "empty" | "single" | "partial" | "recognized" | "ambiguous";
};

const EMPTY_ANALYSIS: ChordAnalysis = { name: null, root: null, inversion: null, figuredBass: null, intervals: [], extensions: [], status: "empty" };

function ordinalInversion(index: number): ChordAnalysis["inversion"] {
  return index === 0 ? "root" : index === 1 ? "1st" : index === 2 ? "2nd" : index === 3 ? "3rd" : null;
}

function figuredBassFor(inversion: ChordAnalysis["inversion"], noteCount: number): ChordAnalysis["figuredBass"] {
  if (noteCount === 3) return inversion === "root" ? "5/3" : inversion === "1st" ? "6/3" : inversion === "2nd" ? "6/4" : null;
  if (noteCount >= 4) return inversion === "root" ? "7" : inversion === "1st" ? "6/5" : inversion === "2nd" ? "4/3" : inversion === "3rd" ? "4/2" : null;
  return null;
}

/** Recognizes a chord and keeps its lowest note for inversion information. */
export function analyzeChord(notes: string[]): ChordAnalysis {
  const sorted = notes.filter((note) => Note.midi(note) !== null).sort((left, right) => Note.midi(left)! - Note.midi(right)!);
  const pitchClasses = Array.from(new Set(sorted.map((note) => Note.pitchClass(note))));

  if (pitchClasses.length === 0) return EMPTY_ANALYSIS;
  if (pitchClasses.length === 1) return { ...EMPTY_ANALYSIS, status: "single" };
  if (pitchClasses.length === 2) return { ...EMPTY_ANALYSIS, status: "partial" };

  const detected = Chord.detect(pitchClasses);
  // Tonal can offer enharmonically valid but pedagogically misleading aliases:
  // C–E–G is also spelled Em#5/C. Prefer a conventional major/minor reading
  // when both describe the same held notes, while retaining altered chords
  // when they are the only available analysis.
  const candidate = detected
    .map((symbol) => ({ symbol, chord: Chord.get(symbol) }))
    .find(({ chord }) => chord.type !== "minor augmented" && chord.type !== "augmented")
    ?? (detected[0] ? { symbol: detected[0], chord: Chord.get(detected[0]) } : null);
  const symbol = candidate?.symbol;
  const chord = candidate?.chord;
  if (!chord || chord.empty || !chord.tonic) return { ...EMPTY_ANALYSIS, status: "ambiguous" };

  const bass = Note.pitchClass(sorted[0]);
  const chordPitchClasses = chord.notes.map((note) => Note.pitchClass(note));
  const inversion = ordinalInversion(chordPitchClasses.findIndex((note) => note === bass));
  const intervals = chord.intervals;
  const extensions = intervals.filter((interval) => Interval.get(interval).num > 5);

  return { name: symbol ?? null, root: Note.pitchClass(chord.tonic), inversion, figuredBass: figuredBassFor(inversion, chordPitchClasses.length), intervals, extensions, status: "recognized" };
}

export const CHORD_STRUCTURES: {
  name: string;
  intervals: string[];
  type: "triad" | "seventh";
}[] = [
  // Triads
  { name: "major", intervals: ["1P", "3M", "5P"], type: "triad" },
  { name: "minor", intervals: ["1P", "3m", "5P"], type: "triad" },
  { name: "diminished", intervals: ["1P", "3m", "5d"], type: "triad" },
  { name: "augmented", intervals: ["1P", "3M", "5A"], type: "triad" },
  { name: "sus2", intervals: ["1P", "2M", "5P"], type: "triad" },
  { name: "sus4", intervals: ["1P", "4P", "5P"], type: "triad" },

  // Seventh chords (4-note)
  { name: "maj7", intervals: ["1P", "3M", "5P", "7M"], type: "seventh" },
  { name: "7", intervals: ["1P", "3M", "5P", "7m"], type: "seventh" },
  { name: "m7", intervals: ["1P", "3m", "5P", "7m"], type: "seventh" },
  { name: "m7b5", intervals: ["1P", "3m", "5d", "7m"], type: "seventh" },
  { name: "dim7", intervals: ["1P", "3m", "5d", "7d"], type: "seventh" },
  { name: "aug7", intervals: ["1P", "3M", "5A", "7m"], type: "seventh" },
];

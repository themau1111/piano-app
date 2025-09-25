export type Prefs = {
  theme: "dark" | "light";
  locale: "es-MX" | "en";
  primaryInstrument: "piano" | "keys";
  goals: string[];
  level: "beginner" | "intermediate" | "advanced";
  styles: string[];
  instruments: string[];
  practice: { minutesPerDay: number; daysPerWeek: number };
  gear: { hasMidi: boolean; hasAcousticPiano: boolean; hasHeadphones: boolean };
  reading: "none" | "basic" | "fluent";
  theory: "none" | "basic" | "intermediate" | "advanced";
  learningMode: "structured" | "casual";
  notifications: { email: boolean; practiceReminders: boolean };
};

export const DEFAULTS: Prefs = {
  theme: "dark",
  locale: "es-MX",
  primaryInstrument: "piano",
  goals: [],
  level: "beginner",
  styles: [],
  instruments: ["piano"],
  practice: { minutesPerDay: 20, daysPerWeek: 3 },
  gear: { hasMidi: false, hasAcousticPiano: false, hasHeadphones: true },
  reading: "none",
  theory: "none",
  learningMode: "structured",
  notifications: { email: true, practiceReminders: true },
};

export const GOALS = [
  { id: "start", label: "Aprender desde cero" },
  { id: "technique", label: "Mejorar técnica" },
  { id: "songs", label: "Tocar canciones" },
  { id: "compose", label: "Componer" },
  { id: "improv", label: "Improvisar" },
  { id: "exam", label: "Preparar exámenes" },
  { id: "produce", label: "Producir música" },
] as const;

export const STYLES = ["Clásico", "Jazz", "Pop", "Rock", "Lo-fi", "Gospel", "Latino", "Soundtracks", "Electrónica"] as const;

export const INSTRUMENTS = [
  { id: "piano", label: "Piano" },
  { id: "keys", label: "Teclado / Synth" },
  { id: "voice", label: "Voz" },
  { id: "guitar", label: "Guitarra" },
  { id: "bass", label: "Bajo" },
  { id: "drums", label: "Batería" },
  { id: "violin", label: "Violín" },
  { id: "ukulele", label: "Ukelele" },
  { id: "other", label: "Otro" },
] as const;

import type { ExerciseKind } from "./contracts";

export const exerciseTitles: Record<ExerciseKind, string> = {
  keyboard_note: "Notas en el teclado",
  staff_note: "Lectura de notas",
  ear_interval: "Intervalos simples",
  melodic_direction: "Dirección melódica",
  rhythm_pulse: "Pulso y silencio",
  rhythm_count: "Conteo rítmico",
  scale_construction: "Escalas",
  chord_identification: "Acordes",
};

export function displayExerciseTitle(kind: ExerciseKind, fallback?: string) {
  return exerciseTitles[kind] ?? fallback ?? "Ejercicio";
}

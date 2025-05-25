import { Interval, Note } from "tonal";

/**
 * Calcula los intervalos entre una nota raíz y las demás
 */
export function getIntervalsFrom(noteRoot: string, notes: string[]): string[] {
  return notes.map((n) => Interval.distance(noteRoot, n));
}

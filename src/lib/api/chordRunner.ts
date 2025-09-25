export type ExerciseLevel = "basic" | "intermediate" | "advanced";

export type StartResponse = {
  exerciseId: string;
  seed: number;
  level: ExerciseLevel;
  clef: "treble" | "bass";
  staff: { midi: number; revealed: boolean }[];
  options: {
    arpeggioMs: { normal: number; slow: number; verySlow: number };
    requireBatchSubmit: boolean;
    requireNameAndInversion: boolean;
  };
};

export type ReplayResponse = { ok: boolean; playback: { notes: number[]; stepMs: number } };
export type AttemptResponse = {
  ok: boolean;
  attemptsLeft: number;
  staff: { midi: number; revealed: boolean }[];
  feedback: { correctNotes: number[]; needName: boolean; nameOk?: boolean; invOk?: boolean };
};
export type RevealResponse = {
  ok: boolean;
  staff: { midi: number; revealed: boolean }[];
  name: string;
  inversion: 0 | 1 | 2 | 3;
  notes: number[];
};

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function startChord(body: { level: ExerciseLevel; attempts?: number; clef?: "treble" | "bass"; showRootOnStaff?: boolean }) {
  const r = await fetch(`${BASE}/exercises/chord/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("startChord failed");
  return (await r.json()) as StartResponse;
}

export async function replay(exerciseId: string, mode: "block" | "arpeggio" | "arpeggioSlow" | "arpeggioVerySlow") {
  const r = await fetch(`${BASE}/exercises/chord/replay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ exerciseId, mode }),
  });
  if (!r.ok) throw new Error("replay failed");
  return (await r.json()) as ReplayResponse;
}

export async function attempt(body: { exerciseId: string; notes: number[]; name?: string; inversion?: 0 | 1 | 2 | 3 }) {
  const r = await fetch(`${BASE}/exercises/chord/attempt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("attempt failed");
  return (await r.json()) as AttemptResponse;
}

export async function reveal(exerciseId: string) {
  const r = await fetch(`${BASE}/exercises/chord/reveal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ exerciseId }),
  });
  if (!r.ok) throw new Error("reveal failed");
  return (await r.json()) as RevealResponse;
}

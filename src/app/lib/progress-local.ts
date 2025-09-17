type Stats = { total: number; correct: number; streak: number; lastPlayedAt: string };

export function readLocalStats(exerciseId: number): Stats | null {
  const raw = localStorage.getItem(`ex_${exerciseId}_stats`);
  return raw ? (JSON.parse(raw) as Stats) : null;
}

export function writeLocalStats(exerciseId: number, correct: boolean) {
  const cur = readLocalStats(exerciseId) ?? { total: 0, correct: 0, streak: 0, lastPlayedAt: new Date().toISOString() };
  const next: Stats = {
    total: cur.total + 1,
    correct: cur.correct + (correct ? 1 : 0),
    streak: correct ? cur.streak + 1 : 0,
    lastPlayedAt: new Date().toISOString(),
  };
  localStorage.setItem(`ex_${exerciseId}_stats`, JSON.stringify(next));
  return next;
}

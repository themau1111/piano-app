type Stats = { total: number; correct: number; streak: number; lastPlayedAt: string };

const statsKeyPrefix = "ex_";
const statsKeySuffix = "_stats";

export function readLocalStats(exerciseId: number): Stats | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(`ex_${exerciseId}_stats`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Stats;
  } catch {
    return null;
  }
}

export function writeLocalStats(exerciseId: number, correct: boolean) {
  if (typeof window === "undefined") return null;
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

export function getLocalProgressSummary() {
  if (typeof window === "undefined") return { attempted: 0, mastered: 0, accuracy: 0 };

  const stats = Object.keys(localStorage)
    .filter((key) => key.startsWith(statsKeyPrefix) && key.endsWith(statsKeySuffix))
    .map((key) => {
      try {
        return JSON.parse(localStorage.getItem(key) ?? "") as Stats;
      } catch {
        return null;
      }
    })
    .filter((item): item is Stats => Boolean(item));

  const total = stats.reduce((sum, item) => sum + item.total, 0);
  const correct = stats.reduce((sum, item) => sum + item.correct, 0);
  return {
    attempted: stats.length,
    mastered: stats.filter((item) => item.streak >= 3).length,
    accuracy: total ? correct / total : 0,
  };
}

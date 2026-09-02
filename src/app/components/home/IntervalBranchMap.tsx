"use client";

import { Interval } from "tonal";

type Pair = {
  id: string;
  from: string;
  to: string;
  name: string;
  semitones: number;
};

const ordinalNames: Record<number, string> = {
  1: "unísono",
  2: "segunda",
  3: "tercera",
  4: "cuarta",
  5: "quinta",
  6: "sexta",
  7: "séptima",
  8: "octava",
  9: "novena",
  10: "décima",
  11: "undécima",
  12: "duodécima",
  13: "decimotercera",
};

const qualityNames: Record<string, string> = {
  P: "justa",
  M: "mayor",
  m: "menor",
  A: "aumentada",
  d: "disminuida",
};

function formatInterval(interval: string) {
  const { num, q } = Interval.get(interval);
  return `${ordinalNames[num] ?? `${num}ª`} ${qualityNames[q] ?? ""}`.trim();
}

function getPairs(notes: string[]): Pair[] {
  const pairs: Pair[] = [];
  for (let fromIndex = 0; fromIndex < notes.length - 1; fromIndex += 1) {
    for (let toIndex = fromIndex + 1; toIndex < notes.length; toIndex += 1) {
      const from = notes[fromIndex];
      const to = notes[toIndex];
      const interval = Interval.distance(from, to);
      pairs.push({
        id: `${from}-${to}`,
        from,
        to,
        name: formatInterval(interval),
        semitones: Interval.semitones(interval) ?? 0,
      });
    }
  }
  return pairs;
}

export function IntervalBranchMap({ notes }: { notes: string[] }) {
  const pairs = getPairs(notes);

  return (
    <section className="rounded-[28px] border border-cyan-200/15 bg-[linear-gradient(120deg,rgba(9,25,47,0.96),rgba(15,44,78,0.88))] p-5 text-white shadow-xl sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Mapa de intervalos</p>
          <h2 className="mt-1 text-xl font-semibold">La última combinación que tocaste</h2>
        </div>
        <p className="text-sm text-white/60">Se actualizará al tocar otra combinación de dos o más notas.</p>
      </div>

      <div className="mt-6 overflow-x-auto pb-1">
        <div className="min-w-[34rem]">
          <div className="flex items-center px-5">
            {notes.map((note, index) => (
              <div key={note} className="flex flex-1 items-center last:flex-none">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-cyan-200 bg-cyan-300/15 font-semibold text-cyan-50 shadow-[0_0_20px_rgba(103,232,249,0.18)]">
                  {note}
                </div>
                {index < notes.length - 1 && <div className="h-px flex-1 bg-gradient-to-r from-cyan-200/70 to-cyan-200/20" />}
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2">
            {pairs.map((pair, index) => (
              <div key={pair.id} className="grid grid-cols-[1.75rem_minmax(4rem,1fr)_auto_minmax(4rem,1fr)] items-center gap-3 rounded-xl border border-white/10 bg-slate-950/20 px-3 py-2.5 text-sm">
                <div className="relative h-6">
                  <span className="absolute left-1 top-0 h-3 w-3 rounded-full border-2 border-cyan-200 bg-[#102b4d]" />
                  {index < pairs.length - 1 && <span className="absolute left-[0.34rem] top-3 h-5 border-l border-cyan-200/35" />}
                </div>
                <span className="font-medium text-cyan-50">{pair.from}</span>
                <span className="rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-center text-xs text-cyan-100">
                  {pair.name} · {pair.semitones} semitonos
                </span>
                <span className="text-right font-medium text-cyan-50">{pair.to}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

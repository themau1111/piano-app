"use client";

import { Interval } from "tonal";

type Pair = { id: string; fromIndex: number; toIndex: number; label: string; description: string; semitones: number };

const ordinalNames: Record<number, string> = { 1: "unísono", 2: "segunda", 3: "tercera", 4: "cuarta", 5: "quinta", 6: "sexta", 7: "séptima", 8: "octava", 9: "novena", 10: "décima", 11: "undécima", 12: "duodécima", 13: "decimotercera" };
const qualityNames: Record<string, string> = { P: "justa", M: "mayor", m: "menor", A: "aumentada", d: "disminuida" };

function getPairs(notes: string[]): Pair[] {
  const pairs: Pair[] = [];
  for (let fromIndex = 0; fromIndex < notes.length - 1; fromIndex += 1) {
    for (let toIndex = fromIndex + 1; toIndex < notes.length; toIndex += 1) {
      const interval = Interval.distance(notes[fromIndex], notes[toIndex]);
      const info = Interval.get(interval);
      pairs.push({
        id: `${notes[fromIndex]}-${notes[toIndex]}`,
        fromIndex,
        toIndex,
        label: interval.replace("P", "J"),
        description: `${ordinalNames[info.num] ?? `${info.num}ª`} ${qualityNames[info.q] ?? ""}`.trim(),
        semitones: Interval.semitones(interval) ?? 0,
      });
    }
  }
  return pairs;
}

export function IntervalBranchMap({ notes }: { notes: string[] }) {
  const pairs = getPairs(notes);
  const gap = 220;
  const width = Math.max(620, (notes.length - 1) * gap + 160);
  const nodeX = (index: number) => 80 + index * gap;
  const nodeY = 80;

  return (
    <section className="rounded-[28px] border border-cyan-200/15 bg-[linear-gradient(120deg,rgba(9,25,47,0.96),rgba(15,44,78,0.88))] p-5 text-white shadow-xl sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Mapa de intervalos</p>
          <h2 className="mt-1 text-xl font-semibold">La última combinación que tocaste</h2>
        </div>
        <p className="text-sm text-white/60">Se actualizará al añadir otra combinación de dos o más notas.</p>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-[radial-gradient(circle,rgba(165,243,252,0.22)_1px,transparent_1.5px)] bg-[size:26px_26px] p-3">
        <svg className="min-w-[620px]" viewBox={`0 0 ${width} 245`} role="img" aria-label={`Mapa de intervalos para ${notes.join(", ")}`}>
          {pairs.map((pair) => {
            const startX = nodeX(pair.fromIndex);
            const endX = nodeX(pair.toIndex);
            const isAdjacent = pair.toIndex - pair.fromIndex === 1;
            const branchY = isAdjacent ? 80 : 160 + (pair.toIndex - pair.fromIndex - 2) * 34;
            const labelY = isAdjacent ? 60 : branchY - 12;
            const path = isAdjacent
              ? `M ${startX + 38} ${nodeY} H ${endX - 38}`
              : `M ${startX + 26} ${nodeY + 27} L ${startX + 62} ${branchY} H ${endX - 62} L ${endX - 26} ${nodeY + 27}`;
            return (
              <g key={pair.id}>
                <path d={path} fill="none" stroke="rgba(165,243,252,0.9)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x={(startX + endX) / 2 - 28} y={labelY - 17} width="56" height="30" rx="10" fill="#102b4d" stroke="rgba(165,243,252,0.35)" />
                <text x={(startX + endX) / 2} y={labelY + 4} fill="#e6fbff" fontSize="19" fontWeight="700" textAnchor="middle">{pair.label}</text>
              </g>
            );
          })}
          {notes.map((note, index) => (
            <g key={note}>
              <rect x={nodeX(index) - 38} y={nodeY - 38} width="76" height="76" rx="16" fill="#56c1ed" stroke="rgba(224,251,255,0.8)" strokeWidth="2" />
              <text x={nodeX(index)} y={nodeY + 8} fill="#07101f" fontSize="22" fontWeight="700" textAnchor="middle">{note}</text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/70">
        {pairs.map((pair) => (
          <span key={pair.id} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            <strong className="text-cyan-100">{pair.label}</strong> · {pair.description} · {pair.semitones} semitonos
          </span>
        ))}
      </div>
    </section>
  );
}

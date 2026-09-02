"use client";

import { useState } from "react";
import { Interval } from "tonal";

type Pair = { id: string; from: string; to: string; fromIndex: number; toIndex: number; label: string; description: string; semitones: number };

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
        from: notes[fromIndex],
        to: notes[toIndex],
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
  const [selectedPairId, setSelectedPairId] = useState<string | null>(null);
  const pairs = getPairs(notes);
  const adjacentPairs = pairs.filter((pair) => pair.toIndex - pair.fromIndex === 1);
  const branchPairs = pairs.filter((pair) => pair.toIndex - pair.fromIndex > 1);
  const gap = 148;
  const width = Math.max(360, (notes.length - 1) * gap + 96);
  const nodeX = (index: number) => 48 + index * gap;
  const nodeY = 44;
  const height = 86 + branchPairs.length * 26;
  const selectedPair = pairs.find((pair) => pair.id === selectedPairId) ?? null;

  return (
    <section className="rounded-[28px] border border-cyan-200/15 bg-[linear-gradient(120deg,rgba(9,25,47,0.96),rgba(15,44,78,0.88))] p-4 text-white shadow-xl sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Mapa de intervalos</p>
          <h2 className="mt-1 text-lg font-semibold">La última combinación que tocaste</h2>
        </div>
        <p className="text-xs text-white/60">Se actualizará al añadir otra combinación de dos o más notas.</p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-[radial-gradient(circle,rgba(165,243,252,0.14)_1px,transparent_1.5px)] bg-[size:24px_24px] p-3">
        <svg className="block" style={{ width, height }} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Mapa de intervalos para ${notes.join(", ")}`}>
          {adjacentPairs.map((pair) => {
            const startX = nodeX(pair.fromIndex);
            const endX = nodeX(pair.toIndex);
            const path = `M ${startX + 17} ${nodeY} H ${endX - 17}`;
            return (
              <g key={pair.id} tabIndex={0} role="button" aria-label={`${pair.from} a ${pair.to}: ${pair.description}, ${pair.semitones} semitonos`} onMouseEnter={() => setSelectedPairId(pair.id)} onMouseLeave={() => setSelectedPairId(null)} onFocus={() => setSelectedPairId(pair.id)} onBlur={() => setSelectedPairId(null)}>
                <title>{`${pair.from} → ${pair.to}: ${pair.description}, ${pair.semitones} semitonos`}</title>
                <path d={path} fill="none" stroke="rgba(165,243,252,0.9)" strokeWidth="3" strokeLinecap="round" />
                <rect x={(startX + endX) / 2 - 18} y="19" width="36" height="20" rx="7" fill={selectedPairId === pair.id ? "#1f5475" : "#102b4d"} stroke="rgba(165,243,252,0.35)" />
                <text x={(startX + endX) / 2} y="33" fill="#e6fbff" fontSize="12" fontWeight="700" textAnchor="middle">{pair.label}</text>
              </g>
            );
          })}
          {branchPairs.map((pair, lane) => {
            const startX = nodeX(pair.fromIndex);
            const endX = nodeX(pair.toIndex);
            const branchY = 72 + lane * 26;
            const path = `M ${startX + 11} ${nodeY + 9} L ${startX + 28} ${branchY} H ${endX - 28} L ${endX - 11} ${nodeY + 9}`;
            return (
              <g key={pair.id} tabIndex={0} role="button" aria-label={`${pair.from} a ${pair.to}: ${pair.description}, ${pair.semitones} semitonos`} onMouseEnter={() => setSelectedPairId(pair.id)} onMouseLeave={() => setSelectedPairId(null)} onFocus={() => setSelectedPairId(pair.id)} onBlur={() => setSelectedPairId(null)}>
                <title>{`${pair.from} → ${pair.to}: ${pair.description}, ${pair.semitones} semitonos`}</title>
                <path d={path} fill="none" stroke="rgba(165,243,252,0.66)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <rect x={(startX + endX) / 2 - 18} y={branchY - 11} width="36" height="20" rx="7" fill={selectedPairId === pair.id ? "#1f5475" : "#102b4d"} stroke="rgba(165,243,252,0.25)" />
                <text x={(startX + endX) / 2} y={branchY + 3} fill="#d6f7ff" fontSize="12" fontWeight="700" textAnchor="middle">{pair.label}</text>
              </g>
            );
          })}
          {notes.map((note, index) => (
            <g key={note}>
              <line x1={nodeX(index) + 11} y1={nodeY} x2={nodeX(index) + 11} y2={nodeY - 27} stroke="#f7ead4" strokeWidth="2" strokeLinecap="round" />
              <ellipse cx={nodeX(index)} cy={nodeY} rx="15" ry="10" transform={`rotate(-18 ${nodeX(index)} ${nodeY})`} fill="#f7ead4" stroke="#9fe9fa" strokeWidth="1.5" />
              <text x={nodeX(index)} y={nodeY + 28} fill="#e6fbff" fontSize="13" fontWeight="700" textAnchor="middle">{note}</text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-3 min-h-8 text-xs text-white/70" aria-live="polite">
        {selectedPair ? (
          <span className="inline-flex rounded-full border border-cyan-200/25 bg-cyan-300/10 px-3 py-1.5">
            <strong className="text-cyan-100">{selectedPair.from} → {selectedPair.to}: {selectedPair.label}</strong>&nbsp;· {selectedPair.description} · {selectedPair.semitones} semitonos
          </span>
        ) : (
          <span className="text-white/45">Pasa el cursor o enfoca una etiqueta de intervalo para ver su explicación.</span>
        )}
      </div>
    </section>
  );
}

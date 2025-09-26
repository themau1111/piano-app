/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

/** ===== Tipos ===== */
type Clef = "treble";
type Figure = "whole" | "half" | "quarter" | "eighth" | "sixteenth";
type Accidental = "sharp" | "flat" | "natural";

type StaffGlyphNote = {
  midi: number;
  revealed?: boolean;
  figure?: Figure; // por defecto: quarter
  accidental?: Accidental; // opcional: ♯ ♭ ♮
};

/** ===== Glifos ===== */
const CLEF_G = "𝄞"; // clave de sol
const CLEF_C = "𝄡";
const CLEF_F = "𝄢";

const GLYPHS_NOTEHEAD: Record<Exclude<Figure, "eighth" | "sixteenth">, string> = {
  whole: "\uE0A2", // redonda
  half: "♭", // blanca
  quarter: "♩", // negra
};
const GLYPHS_ACCIDENTAL: Record<Accidental, string> = {
  sharp: "♯", // U+266F
  flat: "♭", // U+266D
  natural: "♮", // U+266E
};

/** ===== Geometría de pentagrama ===== */
const STAFF_TOP = 30;
const STAFF_GAP = 12;
const STAFF_BOTTOM = STAFF_TOP + 4 * STAFF_GAP; // 78

// Cada semitono = 5px; centrado en G4 (67) para clave de sol
function midiToY(midi: number) {
  const baseY = 60; // línea óptica
  return baseY - (midi - 67) * 5;
}

// X distribuidas uniformemente (0,1,N)
function layoutXs(count: number, x0: number, x1: number) {
  if (count <= 0) return [];
  if (count === 1) return [x0 + (x1 - x0) / 2];
  const step = (x1 - x0) / (count - 1);
  return Array.from({ length: count }, (_, i) => x0 + i * step);
}

// Separación horizontal si dos notas están muy cerca en Y (segundas)
function applyCollisionOffsets(xs: number[], ys: number[]) {
  const out = [...xs];
  const dx = 7;
  for (let i = 0; i < ys.length; i++) {
    for (let j = i + 1; j < ys.length; j++) {
      if (Math.abs(ys[i] - ys[j]) < 13) {
        out[i] -= dx;
        out[j] += dx;
      }
    }
  }
  return out;
}

// Líneas adicionales para una Y dada
function ledgerYs(y: number, top = STAFF_TOP, bottom = STAFF_BOTTOM, gap = STAFF_GAP) {
  const ys: number[] = [];
  for (let ly = top - gap; ly >= y; ly -= gap) ys.push(ly);
  for (let ly = bottom + gap; ly <= y; ly += gap) ys.push(ly);
  return ys;
}

// Dirección de plica: arriba si está por debajo de la línea central, abajo si está por encima
function stemUp(y: number) {
  const middleLineY = STAFF_TOP + 2 * STAFF_GAP; // tercera línea (B4)
  return y >= middleLineY;
}

/** ===== Componente ===== */
export function Staff({ notes = [], showName, clef = "treble" }: { notes?: StaffGlyphNote[]; showName?: string; clef?: Clef }) {
  const LEFT_PAD = 60;
  const RIGHT_PAD = 580;
  const CONTENT_X0 = 110; // después de la clave
  const CONTENT_X1 = 560;

  const ys = notes.map((n) => midiToY(n.midi));
  const baseXs = layoutXs(notes.length, CONTENT_X0, CONTENT_X1);
  const xs = applyCollisionOffsets(baseXs, ys);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Asegúrate de cargar una fuente musical (Noto Music/Bravura Text) en tu layout global */}
      <svg viewBox="0 0 600 160" className="w-full max-w-3xl">
        {/* Pentagrama */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={LEFT_PAD} x2={RIGHT_PAD} y1={STAFF_TOP + i * STAFF_GAP} y2={STAFF_TOP + i * STAFF_GAP} stroke="#333" strokeWidth="1" />
        ))}

        {/* Clave de sol */}
        {clef === "treble" && (
          <text x={60} y={84} fontSize={96} fontFamily="'Noto Music','Bravura','Petaluma','Segoe UI Symbol','Arial Unicode MS',serif">
            {CLEF_G}
          </text>
        )}

        {/* Notas */}
        {notes.map((n, i) => {
          const y = ys[i];
          const x = xs[i];
          const opacity = n.revealed ? 1 : 0.2;
          const fig = n.figure ?? "quarter";

          // métrica visual para plica
          const stemIsUp = stemUp(y);
          const stemLen = 32; // longitud estándar
          const headWidth = 10; // aprox para posicionar plica
          const stemX = stemIsUp ? x + headWidth : x - headWidth;
          const stemY1 = y - 6; // punto cercano al centro del glifo
          const stemY2 = stemIsUp ? stemY1 - stemLen : stemY1 + stemLen;

          // número de banderas según figura
          const flags = fig === "eighth" ? 1 : fig === "sixteenth" ? 2 : 0;

          return (
            <g key={i} opacity={opacity}>
              {/* Accidentales */}
              {n.accidental && (
                <text x={x - 22} y={y + 6} fontSize={22} textAnchor="middle" fontFamily="'Noto Music','Bravura','Petaluma','Segoe UI Symbol','Arial Unicode MS',serif">
                  {GLYPHS_ACCIDENTAL[n.accidental]}
                </text>
              )}

              {/* Líneas adicionales */}
              {ledgerYs(y).map((ly, k) => (
                <line key={k} x1={x - 16} x2={x + 16} y1={ly} y2={ly} stroke="#333" strokeWidth="1" />
              ))}

              {/* Cabeza de nota */}
              <text x={x} y={y + 6} textAnchor="middle" fontSize={28} fontFamily="'Noto Music','Bravura','Petaluma','Segoe UI Symbol','Arial Unicode MS',serif">
                {fig === "whole" || fig === "half" || fig === "quarter" ? GLYPHS_NOTEHEAD[fig] : GLYPHS_NOTEHEAD["quarter"] /* usamos negra como cabeza base para corcheas */}
              </text>

              {/* Plica (no para redonda) */}
              {fig !== "whole" && <line x1={stemX} y1={stemY1} x2={stemX} y2={stemY2} stroke="#222" strokeWidth="2" />}

              {/* Banderas (corchea/semicorchea) */}
              {Array.from({ length: flags }).map((_, fIdx) => {
                const dy = 8 * fIdx; // separación entre banderas
                // Dibujamos una pequeña curva que "cuelga" de la punta de la plica
                const tipX = stemX;
                const tipY = stemIsUp ? stemY2 + dy : stemY2 - dy;

                // control points para curva (ajusta si quieres más estilizado)
                const c1x = stemIsUp ? tipX + 10 : tipX - 10;
                const c1y = tipY + (stemIsUp ? 6 : -6);
                const c2x = stemIsUp ? tipX + 18 : tipX - 18;
                const c2y = tipY + (stemIsUp ? 14 : -14);
                const endX = stemIsUp ? tipX + 20 : tipX - 20;
                const endY = tipY + (stemIsUp ? 8 : -8);

                return <path key={fIdx} d={`M ${tipX} ${tipY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}`} fill="none" stroke="#222" strokeWidth="2" />;
              })}
            </g>
          );
        })}
      </svg>

      {showName && <div className="mt-1 text-lg font-semibold">{showName}</div>}
    </div>
  );
}

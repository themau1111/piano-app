"use client";
type StaffNote = { midi: number; revealed: boolean };

function midiToY(midi: number) {
  // Ajuste simple: cada semitono = 5px; centra alrededor de G4 (67)
  const baseY = 60; // línea central
  return baseY - (midi - 67) * 5;
}

export function Staff({ notes, showName }: { notes: StaffNote[]; showName?: string }) {
  return (
    <div className="w-full flex flex-col items-center">
      <svg viewBox="0 0 600 120" className="w-full max-w-3xl">
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={20} x2={580} y1={30 + i * 12} y2={30 + i * 12} stroke="#333" strokeWidth="1" />
        ))}
        {notes.map((n, idx) => (
          <g key={idx} opacity={n.revealed ? 1 : 0.15}>
            <ellipse cx={80 + idx * 40} cy={midiToY(n.midi)} rx="10" ry="7" fill="#222" />
          </g>
        ))}
      </svg>
      {showName && <div className="mt-1 text-lg font-semibold">{showName}</div>}
    </div>
  );
}

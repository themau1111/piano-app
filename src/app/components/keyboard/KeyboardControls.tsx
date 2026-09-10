"use client";

import type { KeyboardPreferences } from "@/app/hooks/useKeyboardPreferences";

export function KeyboardControls({ preferences, onChange }: { preferences: KeyboardPreferences; onChange: (next: Partial<KeyboardPreferences>) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-white/75">
      <button type="button" onClick={() => onChange({ startMidi: preferences.startMidi - 12 })} className="rounded-lg border border-white/15 px-2 py-1.5 hover:bg-white/10" aria-label="Octava anterior">← Octava</button>
      <button type="button" onClick={() => onChange({ startMidi: preferences.startMidi + 12 })} className="rounded-lg border border-white/15 px-2 py-1.5 hover:bg-white/10" aria-label="Octava siguiente">Octava →</button>
      <label className="flex items-center gap-1 rounded-lg border border-white/15 px-2 py-1.5">
        <span>Teclas</span>
        <select value={preferences.visibleOctaves} onChange={(event) => onChange({ visibleOctaves: Number(event.target.value) as 2 | 3 })} className="bg-transparent outline-none">
          <option className="bg-slate-900" value={2}>2 oct.</option>
          <option className="bg-slate-900" value={3}>3 oct.</option>
        </select>
      </label>
      <button type="button" onClick={() => onChange({ showLabels: !preferences.showLabels })} aria-pressed={preferences.showLabels} className="rounded-lg border border-white/15 px-2 py-1.5 hover:bg-white/10">{preferences.showLabels ? "Ocultar notas" : "Ver notas"}</button>
      <label className="flex items-center gap-1 rounded-lg border border-white/15 px-2 py-1.5">
        <span>Compás</span>
        <select value={preferences.meter} onChange={(event) => onChange({ meter: Number(event.target.value) as 2 | 3 | 4 | 6 })} className="bg-transparent outline-none" aria-label="Compás del metrónomo">
          {[2, 3, 4, 6].map((meter) => <option className="bg-slate-900" key={meter} value={meter}>{meter}/4</option>)}
        </select>
      </label>
    </div>
  );
}

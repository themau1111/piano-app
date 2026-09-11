"use client";

import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";

import type { KeyboardPreferences } from "@/app/hooks/useKeyboardPreferences";

export function KeyboardControls({ preferences, onChange }: { preferences: KeyboardPreferences; onChange: (next: Partial<KeyboardPreferences>) => void }) {
  const [running, setRunning] = useState(false);
  const [beat, setBeat] = useState(1);
  const click = useRef<Tone.Synth | null>(null);
  useEffect(() => () => { click.current?.dispose(); }, []);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setBeat((current) => {
        const next = current === preferences.meter ? 1 : current + 1;
        click.current ??= new Tone.Synth({ volume: -16 }).toDestination();
        click.current.triggerAttackRelease(current === 1 ? "C6" : "C5", "32n");
        return next;
      });
    }, 60_000 / preferences.tempo);
    return () => window.clearInterval(timer);
  }, [preferences.meter, preferences.tempo, running]);

  async function toggleMetronome() {
    await Tone.start();
    click.current ??= new Tone.Synth({ volume: -16 }).toDestination();
    if (!running) click.current.triggerAttackRelease("C6", "32n");
    setBeat(1);
    setRunning((value) => !value);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-white/75">
      <button type="button" onClick={() => onChange({ startMidi: preferences.startMidi - 12 })} className="rounded-lg border border-white/15 px-2 py-1.5 hover:bg-white/10" aria-label="Octava anterior">← Octava</button>
      <span className="rounded-lg bg-white/10 px-2 py-1.5" aria-live="polite">Do{Math.floor(preferences.startMidi / 12) - 1}</span>
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
      <label className="flex items-center gap-1 rounded-lg border border-white/15 px-2 py-1.5">
        <span>{preferences.tempo} bpm</span>
        <input type="range" min="40" max="180" step="1" value={preferences.tempo} onChange={(event) => onChange({ tempo: Number(event.target.value) })} aria-label="Tempo del metrónomo" className="w-20 accent-cyan-300" />
      </label>
      <button type="button" onClick={() => void toggleMetronome()} aria-pressed={running} className="rounded-lg border border-cyan-200/30 bg-cyan-300/10 px-2 py-1.5 text-cyan-50 hover:bg-cyan-300/20">{running ? `Detener ${beat}/${preferences.meter}` : "Iniciar metrónomo"}</button>
    </div>
  );
}

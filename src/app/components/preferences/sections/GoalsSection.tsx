"use client";
import { Card } from "../../ui/Card";
import { Prefs, GOALS } from "../../../../lib/prefs";
import { PillGroup } from "../../ui/Pillgroup";

export function GoalsSection({ pref, onChange }: { pref: Prefs; onChange: (p: Partial<Prefs>) => void }) {
  const toggle = (id: string) => {
    const exists = pref.goals.includes(id);
    const next = exists ? pref.goals.filter((g) => g !== id) : [...pref.goals, id];
    onChange({ goals: next });
  };
  return (
    <Card title="¿Para qué usarás MusicAula?">
      <PillGroup selected={pref.goals} options={GOALS} onToggle={toggle} />
      <p className="mt-3 text-xs text-white/60">Elige 1–3 objetivos para personalizar tu ruta.</p>
    </Card>
  );
}

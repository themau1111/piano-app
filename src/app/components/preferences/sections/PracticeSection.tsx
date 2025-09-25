// components/preferences/sections/PracticeSection.tsx
"use client";
import { Card } from "../../ui/Card";
import { Label } from "../../ui/Label";
import { Segmented } from "../../ui/Segmented";
import { Prefs } from "../../../../lib/prefs";

export function PracticeSection({ pref, onChange }: { pref: Prefs; onChange: (p: Partial<Prefs>) => void }) {
  return (
    <Card title="Rutina de práctica">
      <div className="space-y-6">
        <div>
          <Label>Minutos por día</Label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={5}
              max={120}
              step={5}
              value={pref.practice.minutesPerDay}
              onChange={(e) => onChange({ practice: { ...pref.practice, minutesPerDay: Number(e.target.value) } })}
              className="w-full accent-white"
            />
            <span className="w-16 text-right text-white/90">{pref.practice.minutesPerDay}m</span>
          </div>
        </div>
        <div>
          <Label>Días por semana</Label>
          <Segmented
            value={String(pref.practice.daysPerWeek)}
            onChange={(v) => onChange({ practice: { ...pref.practice, daysPerWeek: Number(v) } })}
            options={[1, 2, 3, 4, 5, 6, 7].map((n) => ({ value: String(n), label: String(n) }))}
          />
        </div>
      </div>
    </Card>
  );
}

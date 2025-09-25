"use client";
import { Prefs } from "../../../lib/prefs";
import { BasicSection } from "./sections/BasicSection";
import { GoalsSection } from "./sections/GoalsSection";
import { PracticeSection } from "./sections/PracticeSection";

export function PreferencesForm({ pref, setPref }: { pref: Prefs; setPref: (updater: (p: Prefs) => Prefs) => void }) {
  const patch = (partial: Partial<Prefs>) => setPref((p) => ({ ...p, ...partial }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <BasicSection pref={pref} onChange={patch} />
      <GoalsSection pref={pref} onChange={patch} />
      <PracticeSection pref={pref} onChange={patch} />
    </div>
  );
}

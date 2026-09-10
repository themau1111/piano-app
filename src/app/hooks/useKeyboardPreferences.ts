"use client";

import { useEffect, useState } from "react";

export type KeyboardPreferences = {
  showLabels: boolean;
  visibleOctaves: 2 | 3;
  startMidi: number;
  meter: 2 | 3 | 4 | 6;
};

const STORAGE_KEY = "musicaula:keyboard-preferences";
const defaults: KeyboardPreferences = {
  showLabels: false,
  visibleOctaves: 2,
  startMidi: 48,
  meter: 4,
};

function normalize(value: Partial<KeyboardPreferences>): KeyboardPreferences {
  const visibleOctaves = value.visibleOctaves === 3 ? 3 : 2;
  const meter = value.meter === 2 || value.meter === 3 || value.meter === 6 ? value.meter : 4;
  const startMidi = Math.min(84 - visibleOctaves * 12, Math.max(24, Math.round(value.startMidi ?? defaults.startMidi)));
  return { showLabels: Boolean(value.showLabels), visibleOctaves, startMidi, meter };
}

export function useKeyboardPreferences() {
  const [preferences, setPreferences] = useState<KeyboardPreferences>(defaults);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setPreferences(normalize(JSON.parse(stored) as Partial<KeyboardPreferences>));
    } catch {
      // Local keyboard controls are optional; use useful defaults on bad data.
    }
  }, []);

  const update = (next: Partial<KeyboardPreferences>) => {
    setPreferences((current) => {
      const normalized = normalize({ ...current, ...next });
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      return normalized;
    });
  };

  return { preferences, update };
}

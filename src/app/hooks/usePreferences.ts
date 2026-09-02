"use client";
import { useEffect, useState } from "react";
import { getMyPreferences, upsertMyPreferences } from "../../lib/api/api";
import { DEFAULTS, Prefs } from "../../lib/prefs";
import { useAuth } from "../../lib/auth-store";

const localPreferencesKey = "musicaula:guest-preferences";

function mergePreferences(value: Record<string, unknown> | null): Prefs {
  if (!value) return DEFAULTS;
  const pref = value as Partial<Prefs> & {
    practice?: Partial<Prefs["practice"]>;
    gear?: Partial<Prefs["gear"]>;
    notifications?: Partial<Prefs["notifications"]>;
  };
  return {
    ...DEFAULTS,
    ...pref,
    practice: { ...DEFAULTS.practice, ...(pref.practice ?? {}) },
    gear: { ...DEFAULTS.gear, ...(pref.gear ?? {}) },
    notifications: { ...DEFAULTS.notifications, ...(pref.notifications ?? {}) },
  };
}

export function usePreferences() {
  const { mode } = useAuth();
  const [data, setData] = useState<Prefs>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = mode === "auth"
          ? await getMyPreferences()
          : JSON.parse(localStorage.getItem(localPreferencesKey) ?? "null") as Record<string, unknown> | null;
        setData(mergePreferences(raw));
      } catch {
        setData(DEFAULTS);
      } finally {
        setLoading(false);
      }
    })();
  }, [mode]);

  async function save(next: Prefs) {
    setSaving(true);
    try {
      if (mode === "auth") await upsertMyPreferences(next);
      else localStorage.setItem(localPreferencesKey, JSON.stringify(next));
    } finally {
      setSaving(false);
    }
  }

  return { data, setData, loading, saving, save };
}

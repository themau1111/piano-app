"use client";
import { useEffect, useState } from "react";
import { getMyPreferences, upsertMyPreferences } from "../../lib/api/api";
import { DEFAULTS, Prefs } from "../../lib/prefs";

export function usePreferences() {
  const [data, setData] = useState<Prefs>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const p = await getMyPreferences();
        if (p) {
          const pref = p as Partial<Prefs> & {
            practice?: Partial<Prefs["practice"]>;
            gear?: Partial<Prefs["gear"]>;
            notifications?: Partial<Prefs["notifications"]>;
          };
          setData({
            ...DEFAULTS,
            ...pref,
            practice: { ...DEFAULTS.practice, ...(pref.practice ?? {}) },
            gear: { ...DEFAULTS.gear, ...(pref.gear ?? {}) },
            notifications: { ...DEFAULTS.notifications, ...(pref.notifications ?? {}) },
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save(next: Prefs) {
    setSaving(true);
    try {
      await upsertMyPreferences(next);
    } finally {
      setSaving(false);
    }
  }

  return { data, setData, loading, saving, save };
}

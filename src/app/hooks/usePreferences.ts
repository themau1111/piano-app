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
          setData({
            ...DEFAULTS,
            ...p,
            practice: { ...DEFAULTS.practice, ...(p.practice ?? {}) },
            gear: { ...DEFAULTS.gear, ...(p.gear ?? {}) },
            notifications: { ...DEFAULTS.notifications, ...(p.notifications ?? {}) },
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

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyPreferences, upsertMyPreferences } from "../lib/api";

const DEFAULTS = { theme: "dark", locale: "es-MX", instrument: "piano" };

export default function PreferencesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pref, setPref] = useState<Record<string, any>>(DEFAULTS);

  useEffect(() => {
    (async () => {
      try {
        const p = await getMyPreferences();
        if (p) {
          setPref({ ...DEFAULTS, ...p });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save() {
    await upsertMyPreferences(pref);
    router.replace("/"); // listo, a home
  }

  if (loading) return <div className="p-8">Cargando…</div>;

  return (
    <main className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-semibold mb-6">Preferencias</h1>

      <div className="space-y-4">
        <div>
          <label className="block mb-1">Tema</label>
          <select value={pref.theme} onChange={(e) => setPref((p) => ({ ...p, theme: e.target.value }))} className="text-black rounded px-3 py-2">
            <option value="dark">Oscuro</option>
            <option value="light">Claro</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Idioma</label>
          <select value={pref.locale} onChange={(e) => setPref((p) => ({ ...p, locale: e.target.value }))} className="text-black rounded px-3 py-2">
            <option value="es-MX">Español (MX)</option>
            <option value="en">English</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Instrumento</label>
          <select value={pref.instrument} onChange={(e) => setPref((p) => ({ ...p, instrument: e.target.value }))} className="text-black rounded px-3 py-2">
            <option value="piano">Piano</option>
            <option value="keys">Synth/Keys</option>
          </select>
        </div>

        <button onClick={save} className="mt-4 rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20">
          Guardar y continuar
        </button>
      </div>
    </main>
  );
}

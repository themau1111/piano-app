"use client";
import { useRouter } from "next/navigation";
import { PreferencesForm } from "../components/preferences/PreferencesForm";
import { usePreferences } from "../hooks/usePreferences";

export default function PreferencesPage() {
  const router = useRouter();
  const { data, setData, loading, saving, save } = usePreferences();

  if (loading) return <div className="p-8 text-white">Cargando…</div>;

  async function handleSave() {
    await save(data);
    router.replace("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1325] via-[#0d1530] to-[#161b33]">
      <header className="sticky top-0 z-40 backdrop-blur border-b border-white/10 bg-[#0b1325]/70">
        <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
          <h1 className="text-white font-semibold">Preferencias</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => router.replace("/")} className="px-3 py-2 rounded-lg border border-white/15 text-white/80 hover:bg-white/10">
              Omitir por ahora
            </button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-white/90 text-black font-medium hover:bg-white disabled:opacity-60">
              {saving ? "Guardando…" : "Guardar y continuar"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <PreferencesForm pref={data} setPref={setData} />
      </main>
    </div>
  );
}

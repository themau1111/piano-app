/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import { usePreferences } from "../../hooks/usePreferences";

export function PreferencesSummary() {
  const { data, loading } = usePreferences();

  return (
    <section className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur p-5 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Tus preferencias</h2>
        <Link href="/preferences" className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10">
          Editar
        </Link>
      </div>

      {loading ? (
        <p className="text-white/70 text-sm">Cargando…</p>
      ) : !data ? (
        <p className="text-white/70 text-sm">
          Aún no has configurado preferencias.{" "}
          <Link href="/preferences" className="underline">
            Hazlo ahora
          </Link>
          .
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white">
          <Row k="Tema" v={data.theme ?? "—"} />
          <Row k="Idioma" v={data.locale ?? "—"} />
          <Row k="Instrumento principal" v={data.primaryInstrument ?? (data as any).instrument ?? "—"} />
          <Row k="Nivel" v={data.level ?? "—"} />
          <Row k="Objetivos" vArr={data.goals ?? []} />
          <Row k="Estilos" vArr={data.styles ?? []} />
          <Row k="Práctica" v={data.practice ? `${data.practice.minutesPerDay ?? "?"}m · ${data.practice.daysPerWeek ?? "?"}d/sem` : "—"} />
          <Row
            k="Equipo"
            v={
              [data?.gear?.hasMidi ? "MIDI" : null, data?.gear?.hasAcousticPiano ? "Piano acústico" : null, data?.gear?.hasHeadphones ? "Audífonos" : null]
                .filter(Boolean)
                .join(" · ") || "—"
            }
          />
          <Row k="Lectura" v={data.reading ?? "—"} />
          <Row k="Teoría" v={data.theory ?? "—"} />
          <Row k="Modo" v={data.learningMode ?? "—"} />
        </div>
      )}
    </section>
  );
}

function Row({ k, v, vArr }: { k: string; v?: string; vArr?: string[] }) {
  return (
    <div>
      <div className="text-white/60">{k}</div>
      {vArr ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {vArr.length ? (
            vArr.map((x) => (
              <span key={x} className="rounded-full border border-white/20 px-3 py-1 text-white/90">
                {x}
              </span>
            ))
          ) : (
            <span className="text-white/80">—</span>
          )}
        </div>
      ) : (
        <div className="mt-2 text-white/90">{v ?? "—"}</div>
      )}
    </div>
  );
}

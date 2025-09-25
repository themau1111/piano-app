"use client";
import Link from "next/link";
import { useProfile } from "../hooks/useProfile";
import { ProfileForm } from "../components/profile/ProfileForm";
import { PreferencesSummary } from "../components/profile/PreferencesSummary";

export default function ProfilePage() {
  const { data, isLoading, update, updating } = useProfile();

  if (isLoading) return <div className="p-8 text-white/80">Cargando…</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1325] via-[#0d1530] to-[#161b33] text-white">
      <header className="sticky top-0 z-40 backdrop-blur border-b border-white/10 bg-[#0b1325]/70">
        <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
          <h1 className="font-semibold">Tu perfil</h1>
          <Link href="/" className="px-3 py-2 rounded-lg border border-white/15 text-white/80 hover:bg-white/10">
            Volver
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Cuenta */}
        <section className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur p-5 mb-6">
          <h2 className="text-lg font-semibold mb-4">Cuenta</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <Info label="Email">{data?.email || "—"}</Info>
            <Info label="Proveedor" className="capitalize">
              {data?.provider || "—"}
            </Info>
          </div>
        </section>

        {/* Formulario */}
        <section className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur p-5">
          <h2 className="text-lg font-semibold mb-4">Perfil público</h2>
          <ProfileForm defaultValues={data!.profile} onSubmit={(v) => update(v)} saving={updating} />
        </section>

        {/* Preferencias debajo */}
        <PreferencesSummary />
      </main>
    </div>
  );
}

function Info({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="text-white/60">{label}</div>
      <div className="mt-2 px-3 py-2 rounded-lg bg-white/10 text-white/90">{children}</div>
    </div>
  );
}

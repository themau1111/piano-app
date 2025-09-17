"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getMyPreferences } from "../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  async function signInGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: location.origin + "/login" },
    });
  }

  async function signInEmail(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + "/login" } });
    if (error) alert(error.message);
    else alert("Te enviamos un enlace de acceso a tu correo.");
  }

  // Cuando el usuario vuelve del redirect de Google/Email:
  async function continueAuth() {
    const prefs = await getMyPreferences(); // null si no hay
    router.replace(prefs ? "/" : "/preferences");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>

      <button onClick={signInGoogle} className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20">
        Continuar con Google
      </button>

      <form onSubmit={signInEmail} className="flex gap-2">
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="tu@correo.com" className="rounded-lg px-3 py-2 text-black" />
        <button className="rounded-lg border px-3 py-2 hover:bg-white/10">Enviar magic link</button>
      </form>

      <button onClick={continueAuth} className="underline opacity-80">
        Ya inicié sesión (continuar)
      </button>

      <p className="opacity-60 text-sm max-w-md text-center">
        Si prefieres, puedes seguir como invitado sin crear cuenta. Guardaremos tu progreso localmente y podrás migrarlo más adelante.
      </p>
    </main>
  );
}

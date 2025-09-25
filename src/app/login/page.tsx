"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { getMyPreferences } from "../../lib/api/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<"google" | "email" | "redirect" | null>(null);
  const didNavigateRef = useRef(false);

  async function signInGoogle() {
    setLoading("google");
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: location.origin + "/login" },
    });
    setLoading(null);
  }

  async function signInEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading("email");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: location.origin + "/login" },
    });
    setLoading(null);
    if (error) alert(error.message);
    else alert("Te enviamos un enlace de acceso a tu correo.");
  }

  async function continueAfterAuth() {
    if (didNavigateRef.current) return;
    didNavigateRef.current = true;
    setLoading("redirect");
    try {
      const prefs = await getMyPreferences();
      router.replace(prefs ? "/" : "/preferences");
    } finally {
      setLoading(null);
    }
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session) continueAfterAuth();
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === "SIGNED_IN") continueAfterAuth();
    });

    return () => {
      mounted = false;
      sub?.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1325] via-[#0d1530] to-[#161b33] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-8 pb-4 text-center">
            <h1 className="text-2xl font-semibold text-white">Iniciar sesión</h1>
            <p className="mt-2 text-sm text-white/70">Entra con Google o con tu correo.</p>
          </div>

          <div className="px-6 pb-6">
            {/* Google */}
            <button
              onClick={signInGoogle}
              disabled={!!loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 text-white py-3 font-medium transition disabled:opacity-60"
            >
              <GoogleIcon className="h-5 w-5" />
              {loading === "google" || loading === "redirect" ? "Abriendo Google…" : "Continuar con Google"}
            </button>

            {/* Separator */}
            <div className="relative my-6">
              <div className="border-t border-white/10" />
              <span className="absolute inset-0 -top-3 mx-auto px-3 bg-transparent text-md text-white/50 w-fit">o</span>
            </div>

            {/* Email + magic link */}
            <form onSubmit={signInEmail} className="space-y-3">
              <label htmlFor="email" className="block text-sm text-white/80">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full rounded-lg bg-white text-black/90 placeholder:text-black/50 px-3 py-2 outline-none ring-0 focus:ring-2 focus:ring-slate-300"
              />
              <button
                type="submit"
                disabled={!!loading}
                className="w-full rounded-lg border border-white/20 hover:bg-white/10 text-white py-2.5 font-medium transition disabled:opacity-60"
              >
                {loading === "email" ? "Enviando…" : "Enviar enlace de acceso"}
              </button>
            </form>

            {/* Guest */}
            <div className="mt-6 text-center">
              <button onClick={() => router.replace("/")} className="text-sm text-white/80 hover:text-white underline-offset-4 hover:underline">
                Seguir como invitado
              </button>
              {/* Footnote */}
              <p className="mt-4 text-center text-xs text-white/60">Si sigues como invitado guardaremos tu progreso localmente y podrás migrarlo más adelante.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Simple Google Icon --- */
function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.2-1.7 3.6-5.5 3.6-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.7 3 14.6 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.4 12 20.4c7 0 9.6-4.9 9.6-7.4 0-.5-.1-.9-.1-1.3H12z"
      />
      <path fill="none" d="M0 0h24v24H0z" />
    </svg>
  );
}

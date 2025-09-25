"use client";
import Link from "next/link";
import { KeyboardPiano } from "./components/KeyboardPiano";
import { useAuth } from "../lib/auth-store";
import { supabase } from "../lib/supabaseClient";
import NavSections from "./components/NavBar";

export default function HomePage() {
  const { mode, userId, signOut } = useAuth();

  async function signInGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: location.origin + "/login" },
    });
  }

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">🎹 Sintetizador de piano</h1>
      <div className="w-full max-w-4xl flex flex-col items-center">
        <KeyboardPiano />
      </div>
    </main>
  );
}

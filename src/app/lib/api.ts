import { supabase } from "./supabaseClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchSections() {
  if (API_URL) {
    const res = await fetch(`${API_URL}/sections`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("No se pudieron cargar secciones");
    return res.json();
  }
  // Fallback directo a Supabase (catálogo es público con RLS de sólo lectura)
  const { data, error } = await supabase.from("sections").select("id, code, title, description").order("id");
  if (error) throw error;
  return data;
}

export async function fetchExercisesBySection(sectionId: number) {
  if (API_URL) {
    const res = await fetch(`${API_URL}/sections/exercises?section_id=${sectionId}`);
    if (!res.ok) throw new Error("No se pudieron cargar ejercicios");
    return res.json();
  }
  const { data, error } = await supabase.from("exercises").select("id, section_id, kind, title, config").eq("section_id", sectionId).eq("is_active", true).order("id");
  if (error) throw error;
  return data;
}

// Preferencias del usuario autenticado (RLS hace el filtro por auth.uid())
export async function getMyPreferences() {
  const { data: sessionRes } = await supabase.auth.getSession();
  const user = sessionRes.session?.user;
  if (!user) return null;
  const { data, error } = await supabase.from("preferences").select("data").eq("user_id", user.id).maybeSingle();
  if (error) throw error;
  return data?.data ?? null;
}

export async function upsertMyPreferences(pref: Record<string, any>) {
  const { data: sessionRes } = await supabase.auth.getSession();
  const user = sessionRes.session?.user;
  if (!user) throw new Error("No session");
  const { error } = await supabase.from("preferences").upsert({ user_id: user.id, data: pref });
  if (error) throw error;
}

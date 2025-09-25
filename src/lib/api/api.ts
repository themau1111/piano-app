import axios from "axios";
import { supabase } from "../supabaseClient";

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

export async function fetchTopicsBySectionCode(sectionCode: string) {
  if (API_URL) {
    const r = await fetch(`${API_URL}/topics?section_code=${sectionCode}`, { next: { revalidate: 60 } });
    if (!r.ok) throw new Error("No se pudieron cargar temas");
    return r.json();
  }
  const { data: section } = await supabase.from("sections").select("id").eq("code", sectionCode).maybeSingle();
  if (!section) return [];

  const { data, error } = await supabase.from("topics").select("id, section_id, code, title, description").eq("section_id", section.id).order("id");
  if (error) throw error;
  return data;
}

export async function fetchExercisesByTopicId(topicId: string | number) {
  const id = Number(topicId);
  if (Number.isNaN(id)) throw new Error("topicId inválido");

  if (API_URL) {
    const r = await fetch(`${API_URL}/topics/${id}/exercises`, { cache: "no-store" });
    if (!r.ok) throw new Error("No se pudieron cargar ejercicios");
    return r.json();
  }

  const { data, error } = await supabase
    .from("exercises")
    .select("id, section_id, topic_id, kind, title, description, config")
    .eq("topic_id", id)
    .eq("is_active", true)
    .order("id");

  if (error) throw error;
  return data;
}
export async function fetchTopicsAllBySectionCode(): Promise<Record<string, any[]>> {
  if (API_URL) {
    const r = await fetch(`${API_URL}/topics/grouped`);
    if (!r.ok) throw new Error("No se pudieron cargar los temas");
    return r.json();
  }

  const { data, error } = await supabase.from("topics").select("id, code, title, description, section_id, section:sections(code)").order("id");

  if (error) throw error;

  const map: Record<string, any[]> = {};
  for (const t of data as any[]) {
    const sectionCode = t.section?.code as string | undefined;
    if (!sectionCode) continue;

    if (!map[sectionCode]) map[sectionCode] = [];
    map[sectionCode].push({
      id: t.id,
      code: t.code,
      title: t.title,
      description: t.description,
    });
  }

  return map;
}

export async function runExercise(type: string, payload?: any) {
  const res = await axios.post("/api/exercises/run", { type, payload });
  return res.data;
}

export async function fetchExerciseById(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exercises/${id}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load exercise");
  return res.json() as Promise<{
    id: string;
    kind: "chord" | "interval" | "scale";
    title: string;
    description?: string;
    config: Record<string, any>;
    topicId: string;
  }>;
}

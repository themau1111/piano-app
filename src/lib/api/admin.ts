import { AdminCatalogData, ExerciseTemplateConfig } from "@/lib/exercises/contracts";
import { supabase } from "../supabaseClient";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  if (!token) throw new Error("No session");

  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init?.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export type SectionUpsertDto = { code: string; title: string; description?: string };
export type TopicUpsertDto = { section_id: number; code: string; title: string; description?: string };
export type ExerciseUpsertDto = {
  section_id: number;
  topic_id?: number | null;
  kind: string;
  title: string;
  config: ExerciseTemplateConfig;
  is_active?: boolean;
};

export const listSectionsFull = () => authFetch<AdminCatalogData>("/admin/sections");
export const upsertSection = (dto: SectionUpsertDto) =>
  authFetch("/admin/sections", { method: "POST", body: JSON.stringify(dto) });
export const deleteSection = (id: number) =>
  authFetch(`/admin/sections/${id}`, { method: "DELETE" });
export const upsertTopic = (dto: TopicUpsertDto) =>
  authFetch("/admin/topics", { method: "POST", body: JSON.stringify(dto) });
export const deleteTopic = (id: number) =>
  authFetch(`/admin/topics/${id}`, { method: "DELETE" });
export const upsertExercise = (dto: ExerciseUpsertDto) =>
  authFetch("/admin/exercises", {
    method: "POST",
    body: JSON.stringify({ ...dto, config: JSON.stringify(dto.config) }),
  });
export const previewExercise = (kind: string, title: string, config: ExerciseTemplateConfig) =>
  authFetch<
    Array<{
      seed: number;
      prompt: Record<string, unknown>;
      input: Record<string, unknown>;
      presentation: Record<string, unknown>;
      solution: Record<string, unknown>;
    }>
  >("/admin/exercises/preview", {
    method: "POST",
    body: JSON.stringify({ kind, title, config: JSON.stringify(config) }),
  });
export const toggleExercise = (id: number, is_active: boolean) =>
  authFetch(`/admin/exercises/${id}/active`, {
    method: "PATCH",
    body: JSON.stringify({ is_active }),
  });
export const deleteExercise = (id: number) =>
  authFetch(`/admin/exercises/${id}`, { method: "DELETE" });
export const seedBasic = () =>
  authFetch("/admin/seed/basic", { method: "POST" });

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { supabase } from "../supabaseClient";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function authFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("No session");
  const res = await fetch(`${BASE}${url}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      ...(init?.headers || {}),
    },
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// --- DTOs (ligeros) ---
export type SectionUpsertDto = { code: string; title: string; description?: string };
export type TopicUpsertDto = { section_id: number; code: string; title: string; description?: string };
export type ExerciseUpsertDto = {
  section_id: number;
  topic_id?: number | null;
  kind: string;
  title: string;
  config?: any; // puedes pasar objeto y lo stringifyeo abajo
  is_active?: boolean;
};

export type AdminCatalogData = {
  sections: { id: number; code: string; title: string; description?: string }[];
  topics: { id: number; section_id: number; code: string; title: string; description?: string }[];
  exercises: { id: number; section_id: number; topic_id: number | null; kind: string; title: string; config: any; is_active: boolean }[];
};

// --- Queries ---
export const listSectionsFull = () => authFetch<AdminCatalogData>("/admin/sections", { method: "GET" });

// --- Mutations: Sections ---
export const upsertSection = (dto: SectionUpsertDto) => authFetch("/admin/sections", { method: "POST", body: JSON.stringify(dto) });

export const deleteSection = (id: number) => authFetch(`/admin/sections/${id}`, { method: "DELETE" });

// --- Mutations: Topics ---
export const upsertTopic = (dto: TopicUpsertDto) => authFetch("/admin/topics", { method: "POST", body: JSON.stringify(dto) });

export const deleteTopic = (id: number) => authFetch(`/admin/topics/${id}`, { method: "DELETE" });

// --- Mutations: Exercises ---
export const upsertExercise = (dto: ExerciseUpsertDto) =>
  authFetch("/admin/exercises", {
    method: "POST",
    body: JSON.stringify({ ...dto, config: dto.config ? JSON.stringify(dto.config) : undefined }),
  });

export const toggleExercise = (id: number, is_active: boolean) =>
  authFetch(`/admin/exercises/${id}/active`, {
    method: "PATCH",
    body: JSON.stringify({ is_active }),
  });

export const deleteExercise = (id: number) => authFetch(`/admin/exercises/${id}`, { method: "DELETE" });

// --- Seeds ---
export const seedBasic = () => authFetch("/admin/seed/basic", { method: "POST" });

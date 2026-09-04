import {
  AdminCatalogData,
  ExerciseAttemptAnswer,
  ExerciseCatalogItem,
  ExerciseDetail,
  ExerciseRunSnapshot,
  LessonDetail,
  LessonSummary,
  PracticeQueueResponse,
  ProgressResponse,
  Section,
  Topic,
} from "@/lib/exercises/contracts";
import { supabase } from "../supabaseClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  opts?: { auth?: boolean }
): Promise<T> {
  const headers = new Headers(init?.headers);
  const wantsAuth = opts?.auth ?? false;

  if (init?.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (wantsAuth) {
    const token = await getAccessToken();
    if (!token) throw new Error("No session");
    headers.set("Authorization", `Bearer ${token}`);
  } else {
    const token = await getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
    cache: init?.cache ?? "no-store",
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json() as Promise<T>;
}

export async function fetchSections() {
  return apiFetch<Section[]>("/sections");
}

export async function fetchTopicsBySectionCode(sectionCode: string) {
  return apiFetch<Topic[]>(`/sections/${sectionCode}/topics`);
}

export async function fetchTopicsAllBySectionCode() {
  return apiFetch<Record<string, Topic[]>>("/topics/grouped");
}

export async function fetchExercisesByTopicId(topicId: string | number) {
  return apiFetch<ExerciseCatalogItem[]>(`/topics/${Number(topicId)}/exercises`);
}

export async function fetchLessonsByTopicId(topicId: string | number) {
  return apiFetch<LessonSummary[]>(`/topics/${Number(topicId)}/lessons`);
}

export async function fetchLessonById(id: string | number) {
  return apiFetch<LessonDetail>(`/lessons/${Number(id)}`);
}

export async function evaluateLessonProgress(id: string | number) {
  return apiFetch<{ completed: boolean; state: { missing?: string[] } }>(
    `/lessons/${Number(id)}/evaluate-progress`,
    { method: "POST", body: JSON.stringify({}) },
    { auth: true },
  );
}

export async function fetchExerciseById(id: string | number) {
  return apiFetch<ExerciseDetail>(`/exercises/${Number(id)}`);
}

export async function startExercise(id: number, payload?: { seed?: number }) {
  return apiFetch<ExerciseRunSnapshot>(`/exercises/${id}/start`, {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });
}

export async function getExerciseRun(runId: string) {
  return apiFetch<ExerciseRunSnapshot>(`/exercise-runs/${runId}`);
}

export async function attemptExerciseRun(runId: string, answer: ExerciseAttemptAnswer) {
  return apiFetch<{ ok: boolean; run: ExerciseRunSnapshot }>(`/exercise-runs/${runId}/attempt`, {
    method: "POST",
    body: JSON.stringify(answer),
  });
}

export async function replayExerciseRun(runId: string) {
  return apiFetch<{ ok: boolean; playback: Array<{ midi: number; atMs: number; durationMs: number }> }>(`/exercise-runs/${runId}/replay`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function revealExerciseRun(runId: string) {
  return apiFetch<{ ok: boolean; run: ExerciseRunSnapshot }>(`/exercise-runs/${runId}/reveal`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function getMyProgress() {
  return apiFetch<ProgressResponse>("/me/progress", undefined, { auth: true });
}

export async function getPracticeQueue() {
  return apiFetch<PracticeQueueResponse>("/me/practice-queue", undefined, { auth: true });
}

export async function getMyPreferences() {
  return apiFetch<Record<string, unknown> | null>("/me/preferences", undefined, { auth: true });
}

export async function upsertMyPreferences(pref: Record<string, unknown>) {
  return apiFetch<{ ok: boolean; data: Record<string, unknown> }>("/me/preferences", {
    method: "PUT",
    body: JSON.stringify(pref),
  }, { auth: true });
}

export async function listAdminCatalog() {
  return apiFetch<AdminCatalogData>("/admin/sections", undefined, { auth: true });
}

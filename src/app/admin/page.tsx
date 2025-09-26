/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listSectionsFull, upsertSection, deleteSection, upsertTopic, deleteTopic, upsertExercise, toggleExercise, deleteExercise, seedBasic } from "@/lib/api/admin";
import { useCurrentUser } from "../hooks/useCurrentUser";

// --- UI helpers ---
function Card(props: { title: string; subtitle?: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur rounded-2xl shadow-sm ring-1 ring-black/5 dark:ring-white/10">
      <div className="flex items-center justify-between px-5 pt-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{props.title}</h2>
          {props.subtitle && <p className="text-xs text-neutral-500 mt-0.5">{props.subtitle}</p>}
        </div>
        {props.right}
      </div>
      <div className="p-5">{props.children}</div>
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-medium text-neutral-600 dark:text-neutral-300">{children}</label>;
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-9 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40 ${
        props.className ?? ""
      }`}
    />
  );
}
function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-9 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40 ${
        props.className ?? ""
      }`}
    />
  );
}
function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  const base = "inline-flex items-center justify-center h-9 px-3 rounded-lg text-sm font-medium transition focus-visible:outline-none disabled:opacity-50";
  const map = {
    primary: "bg-blue-600 text-white hover:bg-blue-600/90",
    ghost: "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200/70 dark:hover:bg-neutral-700",
    danger: "bg-red-600 text-white hover:bg-red-600/90",
  };
  return <button {...props} className={`${base} ${map[props.variant ?? "primary"]} ${props.className ?? ""}`} />;
}
function Badge({ children, color = "gray" }: { children: React.ReactNode; color?: "green" | "gray" }) {
  const cls =
    color === "green" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{children}</span>;
}
function SkeletonRow({ cols = 6 }: { cols?: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-3">
          <div className="h-4 w-24 rounded bg-neutral-200/80 dark:bg-neutral-700" />
        </td>
      ))}
    </tr>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== "admin") router.replace("/");
  }, [user, router, isLoading]);

  if (!user || user.role !== "admin") return null;
  return <AdminCatalogView />;
}

function AdminCatalogView() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-sections-full"],
    queryFn: listSectionsFull,
  });

  // -------- Mutations --------
  const mUpsertSection = useMutation({
    mutationFn: upsertSection,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-sections-full"] }),
  });
  const mDeleteSection = useMutation({
    mutationFn: deleteSection,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-sections-full"] }),
  });

  const mUpsertTopic = useMutation({
    mutationFn: upsertTopic,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-sections-full"] }),
  });
  const mDeleteTopic = useMutation({
    mutationFn: deleteTopic,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-sections-full"] }),
  });

  const mUpsertEx = useMutation({
    mutationFn: upsertExercise,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-sections-full"] }),
  });
  const mToggleEx = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) => toggleExercise(id, is_active),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-sections-full"] }),
  });
  const mDeleteEx = useMutation({
    mutationFn: deleteExercise,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-sections-full"] }),
  });

  const mSeed = useMutation({
    mutationFn: seedBasic,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-sections-full"] }),
  });

  // -------- Local form state --------
  const [secForm, setSecForm] = useState({ code: "", title: "", description: "" });
  const [topicForm, setTopicForm] = useState({ section_id: 0, code: "", title: "", description: "" });
  const [exForm, setExForm] = useState({ section_id: 0, topic_id: 0, kind: "", title: "", is_active: true, configText: "{}" });

  const sections = data?.sections ?? [];
  const topics = data?.topics ?? [];
  const exercises = data?.exercises ?? [];

  const topicsBySection = useMemo(() => {
    const map: Record<number, { id: number; title: string }[]> = {};
    topics.forEach((t) => {
      if (!map[t.section_id]) map[t.section_id] = [];
      map[t.section_id].push({ id: t.id, title: t.title });
    });
    return map;
  }, [topics]);

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 border-b border-neutral-200/70 dark:border-neutral-800/70 bg-white/75 dark:bg-neutral-950/75 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Admin Catalog</h1>
            <p className="text-xs text-neutral-500">Gestiona sections, topics y ejercicios</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => mSeed.mutate()} disabled={mSeed.isPending}>
              {mSeed.isPending ? "Seeding…" : "Seed básico"}
            </Button>
            <Button variant="ghost" onClick={() => qc.invalidateQueries({ queryKey: ["admin-sections-full"] })}>
              Refrescar
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Sections */}
        <Card title="Sections" subtitle="Crea y administra las secciones principales" right={<Badge>{sections.length} total</Badge>}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label>Code</Label>
              <Input placeholder="basic" value={secForm.code} onChange={(e) => setSecForm({ ...secForm, code: e.target.value })} />
            </div>
            <div className="space-y-1 md:col-span-1">
              <Label>Title</Label>
              <Input placeholder="Básico" value={secForm.title} onChange={(e) => setSecForm({ ...secForm, title: e.target.value })} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Description</Label>
              <Input placeholder="Fundamentos…" value={secForm.description} onChange={(e) => setSecForm({ ...secForm, description: e.target.value })} />
            </div>
          </div>
          <div className="mt-3">
            <Button onClick={() => mUpsertSection.mutate(secForm)} disabled={mUpsertSection.isPending}>
              {mUpsertSection.isPending ? "Guardando…" : "Guardar section"}
            </Button>
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50/70 dark:bg-neutral-900/50">
                <tr>
                  <th className="p-3 text-left font-medium">ID</th>
                  <th className="p-3 text-left font-medium">Code</th>
                  <th className="p-3 text-left font-medium">Title</th>
                  <th className="p-3 text-left font-medium">Description</th>
                  <th className="p-3 text-center font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {isLoading && Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={5} />)}
                {!isLoading &&
                  sections.map((s, idx) => (
                    <tr key={s.id} className={idx % 2 ? "bg-white dark:bg-neutral-950" : "bg-neutral-50/30 dark:bg-neutral-900/30"}>
                      <td className="p-3">{s.id}</td>
                      <td className="p-3">{s.code}</td>
                      <td className="p-3">{s.title}</td>
                      <td className="p-3">{s.description}</td>
                      <td className="p-3 text-center">
                        <Button variant="danger" onClick={() => window.confirm("¿Eliminar section?") && mDeleteSection.mutate(s.id)}>
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Topics */}
        <Card title="Topics" subtitle="Agrupa contenidos dentro de una sección" right={<Badge>{topics.length} total</Badge>}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="space-y-1 md:col-span-1">
              <Label>Section</Label>
              <Select value={topicForm.section_id} onChange={(e) => setTopicForm({ ...topicForm, section_id: Number(e.target.value) })}>
                <option value={0}>Selecciona…</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} (#{s.id})
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Code</Label>
              <Input placeholder="ear-training" value={topicForm.code} onChange={(e) => setTopicForm({ ...topicForm, code: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Title</Label>
              <Input placeholder="Entrenamiento de oído" value={topicForm.title} onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Description</Label>
              <Input placeholder="…" value={topicForm.description} onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })} />
            </div>
          </div>
          <div className="mt-3">
            <Button onClick={() => mUpsertTopic.mutate(topicForm)} disabled={mUpsertTopic.isPending}>
              {mUpsertTopic.isPending ? "Guardando…" : "Guardar topic"}
            </Button>
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50/70 dark:bg-neutral-900/50">
                <tr>
                  <th className="p-3 text-left font-medium">ID</th>
                  <th className="p-3 text-left font-medium">Section</th>
                  <th className="p-3 text-left font-medium">Code</th>
                  <th className="p-3 text-left font-medium">Title</th>
                  <th className="p-3 text-center font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {isLoading && Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={5} />)}
                {!isLoading &&
                  topics.map((t, idx) => (
                    <tr key={t.id} className={idx % 2 ? "bg-white dark:bg-neutral-950" : "bg-neutral-50/30 dark:bg-neutral-900/30"}>
                      <td className="p-3">{t.id}</td>
                      <td className="p-3">#{t.section_id}</td>
                      <td className="p-3">{t.code}</td>
                      <td className="p-3">{t.title}</td>
                      <td className="p-3 text-center">
                        <Button variant="danger" onClick={() => window.confirm("¿Eliminar topic?") && mDeleteTopic.mutate(t.id)}>
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Exercises */}
        <Card title="Exercises" subtitle="Crea ejercicios y activa/desactiva" right={<Badge>{exercises.length} total</Badge>}>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="space-y-1">
              <Label>Section</Label>
              <Select
                value={exForm.section_id}
                onChange={(e) => {
                  const section_id = Number(e.target.value);
                  setExForm((f) => ({ ...f, section_id, topic_id: 0 }));
                }}
              >
                <option value={0}>Selecciona…</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} (#{s.id})
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Topic (opcional)</Label>
              <Select value={exForm.topic_id} onChange={(e) => setExForm({ ...exForm, topic_id: Number(e.target.value) })}>
                <option value={0}>—</option>
                {(topicsBySection[exForm.section_id] ?? []).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} (#{t.id})
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Kind</Label>
              <Input placeholder="ear_intervals" value={exForm.kind} onChange={(e) => setExForm({ ...exForm, kind: e.target.value })} />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label>Title</Label>
              <Input placeholder="Intervalos simples" value={exForm.title} onChange={(e) => setExForm({ ...exForm, title: e.target.value })} />
            </div>

            <div className="flex items-end gap-2">
              <input
                id="isActive"
                type="checkbox"
                className="h-4 w-4 accent-blue-600"
                checked={exForm.is_active}
                onChange={(e) => setExForm({ ...exForm, is_active: e.target.checked })}
              />
              <Label>Activo</Label>
            </div>

            <div className="space-y-1 md:col-span-6">
              <Label>Config (JSON)</Label>
              <Input
                placeholder='{"range":"C4-B4","set":["m2","M2"]}'
                value={exForm.configText}
                onChange={(e) => setExForm({ ...exForm, configText: e.target.value })}
                className="font-mono"
              />
            </div>
          </div>

          <div className="mt-3">
            <Button
              onClick={() => {
                let cfg: any = undefined;
                try {
                  cfg = JSON.parse(exForm.configText);
                } catch {
                  alert("Config no es JSON válido");
                  return;
                }
                mUpsertEx.mutate({
                  section_id: exForm.section_id,
                  topic_id: exForm.topic_id || null,
                  kind: exForm.kind,
                  title: exForm.title,
                  is_active: exForm.is_active,
                  config: cfg,
                });
              }}
              disabled={mUpsertEx.isPending}
            >
              {mUpsertEx.isPending ? "Guardando…" : "Guardar ejercicio"}
            </Button>
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50/70 dark:bg-neutral-900/50">
                <tr>
                  <th className="p-3 text-left font-medium">ID</th>
                  <th className="p-3 text-left font-medium">Section</th>
                  <th className="p-3 text-left font-medium">Topic</th>
                  <th className="p-3 text-left font-medium">Kind</th>
                  <th className="p-3 text-left font-medium">Title</th>
                  <th className="p-3 text-center font-medium">Estado</th>
                  <th className="p-3 text-center font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {isLoading && Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={7} />)}
                {!isLoading &&
                  exercises.map((e, idx) => (
                    <tr key={e.id} className={idx % 2 ? "bg-white dark:bg-neutral-950" : "bg-neutral-50/30 dark:bg-neutral-900/30"}>
                      <td className="p-3">#{e.id}</td>
                      <td className="p-3">#{e.section_id}</td>
                      <td className="p-3">{e.topic_id ?? "—"}</td>
                      <td className="p-3">{e.kind}</td>
                      <td className="p-3">{e.title}</td>
                      <td className="p-3 text-center">{e.is_active ? <Badge color="green">Activo</Badge> : <Badge>Inactivo</Badge>}</td>
                      <td className="p-3 text-center space-x-2">
                        <Button variant="ghost" onClick={() => mToggleEx.mutate({ id: e.id, is_active: !e.is_active })}>
                          {e.is_active ? "Desactivar" : "Activar"}
                        </Button>
                        <Button variant="danger" onClick={() => window.confirm("¿Eliminar ejercicio?") && mDeleteEx.mutate(e.id)}>
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>

        {error && (
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-700 dark:text-red-300">
            Error: {(error as any).message}
          </div>
        )}
      </main>
    </div>
  );
}

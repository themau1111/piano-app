"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteExercise,
  deleteSection,
  deleteTopic,
  listSectionsFull,
  previewExercise,
  seedBasic,
  seedSolfegeFoundations,
  toggleExercise,
  replaceLessonBlocks,
  upsertExercise,
  upsertLesson,
  upsertSection,
  upsertTopic,
} from "@/lib/api/admin";
import { useCurrentUser } from "../hooks/useCurrentUser";
import type { ExerciseKind, ExerciseTemplateConfig } from "@/lib/exercises/contracts";
import type { LessonBlockUpsertDto, LessonUpsertDto } from "@/lib/api/admin";

type PreviewSample = {
  seed: number;
  prompt: Record<string, unknown>;
  input: Record<string, unknown>;
  presentation: Record<string, unknown>;
  solution: Record<string, unknown>;
};

type FormKind = ExerciseKind;

const KIND_OPTIONS: Array<{ value: FormKind; label: string }> = [
  { value: "keyboard_note", label: "Keyboard Note" },
  { value: "staff_note", label: "Staff Note" },
  { value: "ear_interval", label: "Ear Interval" },
  { value: "melodic_direction", label: "Melodic Direction" },
  { value: "rhythm_pulse", label: "Rhythm Pulse" },
  { value: "rhythm_count", label: "Rhythm Count" },
  { value: "scale_construction", label: "Scale Construction" },
  { value: "chord_identification", label: "Chord Identification" },
];

function defaultConfig(kind: FormKind): ExerciseTemplateConfig {
  switch (kind) {
    case "keyboard_note":
      return {
        skillCode: "keyboard-geo-1",
        levelIndex: 1,
        generator: kind,
        constraints: {
          notes: ["C", "D", "E", "F", "G", "A", "B"],
          octaves: [3, 4, 5],
          accidentals: ["natural"],
          inputMode: "single-note",
        },
        presentation: {
          instructions: "Toca la nota indicada en el teclado.",
          keyboardRange: [48, 84],
          attemptsAllowed: 4,
        },
        mastery: { minAttempts: 10, minAccuracy: 0.85, minStreak: 3 },
      };
    case "staff_note":
      return {
        skillCode: "staff-reading-1",
        levelIndex: 1,
        generator: kind,
        constraints: {
          clef: "treble",
          range: { minMidi: 64, maxMidi: 79 },
          accidentals: ["natural"],
          ledgerLines: false,
        },
        presentation: {
          instructions: "Observa el pentagrama y toca la nota correcta.",
          keyboardRange: [55, 84],
          showStaff: true,
          clef: "treble",
          attemptsAllowed: 4,
        },
        mastery: { minAttempts: 10, minAccuracy: 0.85, minStreak: 3 },
      };
    case "ear_interval":
      return {
        skillCode: "ear-interval-1",
        levelIndex: 1,
        generator: kind,
        constraints: {
          intervalSet: ["m2", "M2", "m3", "M3", "P4", "P5"],
          direction: "ascending",
          playMode: "melodic",
          range: { minMidi: 60, maxMidi: 72 },
        },
        presentation: {
          instructions: "Escucha el intervalo y selecciona la respuesta correcta.",
          autoReplay: true,
          allowReplay: true,
          attemptsAllowed: 4,
        },
        mastery: { minAttempts: 10, minAccuracy: 0.85, minStreak: 3 },
      };
    case "melodic_direction":
      return {
        skillCode: "melodic-direction-1",
        levelIndex: 1,
        generator: kind,
        constraints: {
          direction: "both",
          semitones: [2, 3, 4],
          range: { minMidi: 60, maxMidi: 72 },
        },
        presentation: {
          instructions: "Escucha los dos sonidos y decide si el segundo sube o baja.",
          autoReplay: true,
          allowReplay: true,
          attemptsAllowed: 4,
        },
        mastery: { minAttempts: 6, minAccuracy: 0.8, minStreak: 2 },
      };
    case "rhythm_pulse":
      return {
        skillCode: "rhythm-pulse-1", levelIndex: 1, generator: kind,
        constraints: { beats: 4, silencePositions: [1, 2, 3, 4] },
        presentation: { instructions: "Observa cuatro pulsos y elige dónde está el silencio.", attemptsAllowed: 4 },
        mastery: { minAttempts: 6, minAccuracy: 0.8, minStreak: 2 },
      };
    case "rhythm_count":
      return {
        skillCode: "rhythm-count-1", levelIndex: 1, generator: kind,
        constraints: { patterns: [["quarter", "quarter", "quarter", "quarter"], ["half", "half"], ["whole"], ["half", "quarter", "rest-quarter"], ["quarter", "rest-quarter", "quarter", "quarter"]] },
        presentation: { instructions: "Cuenta cuánto dura cada figura y silencio antes de elegir.", attemptsAllowed: 4 },
        mastery: { minAttempts: 6, minAccuracy: 0.8, minStreak: 2 },
      };
    case "scale_construction":
      return {
        skillCode: "scale-construction-1",
        levelIndex: 1,
        generator: kind,
        constraints: {
          roots: ["C", "G", "D", "F"],
          mode: "major",
          octave: 4,
          answerStyle: "keyboard",
        },
        presentation: {
          instructions: "Construye la escala completa.",
          keyboardRange: [48, 84],
          attemptsAllowed: 4,
        },
        mastery: { minAttempts: 10, minAccuracy: 0.85, minStreak: 3 },
      };
    case "chord_identification":
      return {
        skillCode: "chord-identification-1",
        levelIndex: 1,
        generator: kind,
        constraints: {
          qualities: ["maj", "min"],
          inversions: [0],
          voicing: "close",
          range: { minMidi: 48, maxMidi: 60 },
          requireName: false,
          requireInversion: false,
        },
        presentation: {
          instructions: "Identifica el acorde completo.",
          keyboardRange: [48, 84],
          showStaff: true,
          clef: "treble",
          autoReplay: true,
          allowReplay: true,
          attemptsAllowed: 4,
        },
        mastery: { minAttempts: 10, minAccuracy: 0.85, minStreak: 3 },
      };
  }
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
  const { data, isLoading } = useQuery({
    queryKey: ["adminCatalog"],
    queryFn: listSectionsFull,
  });

  const [sectionForm, setSectionForm] = useState({ code: "", title: "", description: "" });
  const [topicForm, setTopicForm] = useState({ section_id: 0, code: "", title: "", description: "" });
  const [kind, setKind] = useState<FormKind>("keyboard_note");
  const [exerciseTitle, setExerciseTitle] = useState("Nuevo ejercicio");
  const [exerciseSectionId, setExerciseSectionId] = useState(0);
  const [exerciseTopicId, setExerciseTopicId] = useState(0);
  const [exerciseConfig, setExerciseConfig] = useState<ExerciseTemplateConfig>(() => defaultConfig("keyboard_note"));
  const [preview, setPreview] = useState<PreviewSample[]>([]);

  const sections = useMemo(() => data?.sections ?? [], [data?.sections]);
  const topics = useMemo(() => data?.topics ?? [], [data?.topics]);
  const exercises = useMemo(() => data?.exercises ?? [], [data?.exercises]);
  const topicsBySection = useMemo(() => {
    const map: Record<number, typeof topics> = {};
    topics.forEach((topic) => {
      map[topic.section_id] ??= [];
      map[topic.section_id].push(topic);
    });
    return map;
  }, [topics]);

  const invalidateCatalog = () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["adminCatalog"] }),
      qc.invalidateQueries({ queryKey: ["sections"] }),
      qc.invalidateQueries({ queryKey: ["topics"] }),
      qc.invalidateQueries({ queryKey: ["topicsBySection"] }),
      qc.invalidateQueries({ queryKey: ["topicExercises"] }),
      qc.invalidateQueries({ queryKey: ["topicLessons"] }),
    ]);

  const saveSection = useMutation({
    mutationFn: upsertSection,
    onSuccess: invalidateCatalog,
  });
  const saveTopic = useMutation({
    mutationFn: upsertTopic,
    onSuccess: invalidateCatalog,
  });
  const saveExercise = useMutation({
    mutationFn: upsertExercise,
    onSuccess: () => {
      setPreview([]);
      invalidateCatalog();
    },
  });
  const previewMutation = useMutation({
    mutationFn: () => previewExercise(kind, exerciseTitle, exerciseConfig),
    onSuccess: (result) => setPreview(result),
  });
  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) => toggleExercise(id, is_active),
    onSuccess: invalidateCatalog,
  });
  const deleteExerciseMutation = useMutation({
    mutationFn: deleteExercise,
    onSuccess: invalidateCatalog,
  });
  const deleteSectionMutation = useMutation({
    mutationFn: deleteSection,
    onSuccess: invalidateCatalog,
  });
  const deleteTopicMutation = useMutation({
    mutationFn: deleteTopic,
    onSuccess: invalidateCatalog,
  });
  const seedMutation = useMutation({
    mutationFn: seedBasic,
    onSuccess: invalidateCatalog,
  });
  const seedSolfegeMutation = useMutation({
    mutationFn: seedSolfegeFoundations,
    onSuccess: invalidateCatalog,
  });

  function setCommon<K extends keyof ExerciseTemplateConfig>(key: K, value: ExerciseTemplateConfig[K]) {
    setExerciseConfig((prev) => ({ ...prev, [key]: value }));
  }

  function patchConstraints(partial: Record<string, unknown>) {
    setExerciseConfig((prev) => ({
      ...prev,
      constraints: { ...prev.constraints, ...partial } as ExerciseTemplateConfig["constraints"],
    }) as ExerciseTemplateConfig);
  }

  function updateKind(nextKind: FormKind) {
    const nextConfig = defaultConfig(nextKind);
    setKind(nextKind);
    setExerciseConfig(nextConfig);
    setExerciseTitle(KIND_OPTIONS.find((item) => item.value === nextKind)?.label ?? "Nuevo ejercicio");
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-[radial-gradient(circle_at_top,#162f5d_0%,#0c1428_38%,#070c18_100%)] px-4 py-8 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-white/10 bg-white/5 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/70">Admin Catalog</p>
            <h1 className="mt-2 text-3xl font-semibold">Plantillas pedagógicas</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={() => seedMutation.mutate()} className="rounded-2xl border border-white/15 px-4 py-2 text-sm hover:bg-white/5">
              {seedMutation.isPending ? "Seeding…" : "Seed básico"}
            </button>
            <button onClick={() => seedSolfegeMutation.mutate()} className="rounded-2xl border border-cyan-300/30 px-4 py-2 text-sm text-cyan-100 hover:bg-cyan-300/10">
              {seedSolfegeMutation.isPending ? "Sembrando…" : "Seed fundamentos de solfeo"}
            </button>
            <button onClick={() => invalidateCatalog()} className="rounded-2xl bg-cyan-300 px-4 py-2 text-sm font-medium text-slate-950">
              Refrescar
            </button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <Panel title="Sections">
            <div className="grid gap-3 sm:grid-cols-3">
              <Input label="Code" value={sectionForm.code} onChange={(value) => setSectionForm((prev) => ({ ...prev, code: value }))} />
              <Input label="Title" value={sectionForm.title} onChange={(value) => setSectionForm((prev) => ({ ...prev, title: value }))} />
              <Input label="Description" value={sectionForm.description} onChange={(value) => setSectionForm((prev) => ({ ...prev, description: value }))} />
            </div>
            <div className="mt-4">
              <button
                onClick={() => saveSection.mutate(sectionForm)}
                className="rounded-2xl bg-cyan-300 px-4 py-2 text-sm font-medium text-slate-950"
              >
                Guardar section
              </button>
            </div>
            <Table
              headers={["ID", "Code", "Title", "Actions"]}
              rows={sections.map((section) => [
                section.id,
                section.code,
                section.title,
                <button
                  key={`delete-section-${section.id}`}
                  onClick={() => deleteSectionMutation.mutate(section.id)}
                  className="rounded-xl border border-red-300/20 px-3 py-1 text-xs text-red-200"
                >
                  Eliminar
                </button>,
              ])}
            />
          </Panel>

          <Panel title="Topics">
            <div className="grid gap-3 sm:grid-cols-4">
              <SelectField
                label="Section"
                value={String(topicForm.section_id)}
                onChange={(value) => setTopicForm((prev) => ({ ...prev, section_id: Number(value) }))}
                options={[{ value: "0", label: "Selecciona…" }, ...sections.map((section) => ({ value: String(section.id), label: section.title }))]}
              />
              <Input label="Code" value={topicForm.code} onChange={(value) => setTopicForm((prev) => ({ ...prev, code: value }))} />
              <Input label="Title" value={topicForm.title} onChange={(value) => setTopicForm((prev) => ({ ...prev, title: value }))} />
              <Input label="Description" value={topicForm.description} onChange={(value) => setTopicForm((prev) => ({ ...prev, description: value }))} />
            </div>
            <div className="mt-4">
              <button
                onClick={() => saveTopic.mutate(topicForm)}
                className="rounded-2xl bg-cyan-300 px-4 py-2 text-sm font-medium text-slate-950"
              >
                Guardar topic
              </button>
            </div>
            <Table
              headers={["ID", "Code", "Title", "Actions"]}
              rows={topics.map((topic) => [
                topic.id,
                topic.code,
                topic.title,
                <button
                  key={`delete-topic-${topic.id}`}
                  onClick={() => deleteTopicMutation.mutate(topic.id)}
                  className="rounded-xl border border-red-300/20 px-3 py-1 text-xs text-red-200"
                >
                  Eliminar
                </button>,
              ])}
            />
          </Panel>
        </section>

        <Panel title="Exercise Templates">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4 rounded-[24px] border border-white/10 bg-black/20 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <SelectField
                  label="Kind"
                  value={kind}
                  onChange={(value) => updateKind(value as FormKind)}
                  options={KIND_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
                />
                <Input label="Title" value={exerciseTitle} onChange={setExerciseTitle} />
                <SelectField
                  label="Section"
                  value={String(exerciseSectionId)}
                  onChange={(value) => {
                    setExerciseSectionId(Number(value));
                    setExerciseTopicId(0);
                  }}
                  options={[{ value: "0", label: "Selecciona…" }, ...sections.map((section) => ({ value: String(section.id), label: section.title }))]}
                />
                <SelectField
                  label="Topic"
                  value={String(exerciseTopicId)}
                  onChange={(value) => setExerciseTopicId(Number(value))}
                  options={[{ value: "0", label: "Selecciona…" }, ...(topicsBySection[exerciseSectionId] ?? []).map((topic) => ({ value: String(topic.id), label: topic.title }))]}
                />
                <Input label="Skill code" value={exerciseConfig.skillCode} onChange={(value) => setCommon("skillCode", value)} />
                <Input
                  label="Level index"
                  value={String(exerciseConfig.levelIndex)}
                  onChange={(value) => setCommon("levelIndex", Number(value))}
                  type="number"
                />
              </div>

              <KindFields kind={kind} config={exerciseConfig} patchConstraints={patchConstraints} />

              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Intentos"
                  value={String(exerciseConfig.presentation.attemptsAllowed ?? 4)}
                  onChange={(value) =>
                    setExerciseConfig((prev) => ({
                      ...prev,
                      presentation: { ...prev.presentation, attemptsAllowed: Number(value) },
                    }))
                  }
                  type="number"
                />
                <Input
                  label="Instructions"
                  value={exerciseConfig.presentation.instructions ?? ""}
                  onChange={(value) =>
                    setExerciseConfig((prev) => ({
                      ...prev,
                      presentation: { ...prev.presentation, instructions: value },
                    }))
                  }
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    saveExercise.mutate({
                      section_id: exerciseSectionId,
                      topic_id: exerciseTopicId || null,
                      kind,
                      title: exerciseTitle,
                      config: exerciseConfig,
                      is_active: true,
                    })
                  }
                  className="rounded-2xl bg-cyan-300 px-4 py-2 text-sm font-medium text-slate-950"
                >
                  Guardar plantilla
                </button>
                <button
                  onClick={() => previewMutation.mutate()}
                  className="rounded-2xl border border-white/15 px-4 py-2 text-sm hover:bg-white/5"
                >
                  Preview 3 seeds
                </button>
              </div>
            </div>

            <div className="space-y-3 rounded-[24px] border border-white/10 bg-black/20 p-5">
              <p className="text-sm font-medium text-white/80">Preview</p>
              {!preview.length && <p className="text-sm text-white/55">Genera preview para validar prompts y soluciones antes de guardar.</p>}
              {preview.map((sample) => (
                <div key={sample.seed} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                  <div className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">Seed {sample.seed}</div>
                  <div className="mt-2 font-medium">{String(sample.prompt.text ?? "")}</div>
                  <pre className="mt-3 overflow-auto rounded-xl bg-black/25 p-3 text-xs text-white/70">
                    {JSON.stringify(sample.solution, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>

          <Table
            headers={["ID", "Kind", "Title", "Skill", "Level", "Actions"]}
            rows={exercises.map((exercise) => [
              exercise.id,
              exercise.kind,
              exercise.title,
              exercise.config.skillCode,
              exercise.config.levelIndex,
              <div key={`actions-${exercise.id}`} className="flex gap-2">
                <button
                  onClick={() => toggleMutation.mutate({ id: exercise.id, is_active: !exercise.is_active })}
                  className="rounded-xl border border-white/15 px-3 py-1 text-xs"
                >
                  {exercise.is_active ? "Desactivar" : "Activar"}
                </button>
                <button
                  onClick={() => deleteExerciseMutation.mutate(exercise.id)}
                  className="rounded-xl border border-red-300/20 px-3 py-1 text-xs text-red-200"
                >
                  Eliminar
                </button>
              </div>,
            ])}
          />
        </Panel>

        <LessonAuthoring
          topics={topics}
          exercises={exercises}
          lessons={data?.lessons ?? []}
          lessonBlocks={data?.lessonBlocks ?? []}
          onSaved={invalidateCatalog}
        />

        {isLoading && <div className="text-sm text-white/60">Cargando catálogo…</div>}
      </div>
    </main>
  );
}

function LessonAuthoring({
  topics,
  exercises,
  lessons,
  lessonBlocks,
  onSaved,
}: {
  topics: Array<{ id: number; title: string }>;
  exercises: Array<{ id: number; title: string; topic_id: number | null }>;
  lessons: Array<{ id: number; topic_id: number; code: string; title: string; summary: string | null; objective: string; prerequisites: string[]; completion: Record<string, unknown>; next_lesson_code: string | null; is_active: boolean }>;
  lessonBlocks: Array<{ lesson_id: number; position: number; kind: LessonBlockUpsertDto["kind"]; content: Record<string, unknown>; exercise_id: number | null }>;
  onSaved: () => void;
}) {
  const [selectedId, setSelectedId] = useState(0);
  const [form, setForm] = useState<LessonUpsertDto>({ topic_id: 0, code: "", title: "", summary: "", objective: "", prerequisites: [], completion: {} });
  const [completionText, setCompletionText] = useState("{}");
  const [blocksText, setBlocksText] = useState("[]");
  const [error, setError] = useState("");
  const save = useMutation({
    mutationFn: async () => {
      const completion = JSON.parse(completionText) as Record<string, unknown>;
      if (!completion || Array.isArray(completion)) throw new Error("El criterio de cierre debe ser un objeto JSON.");
      const blocks = JSON.parse(blocksText) as LessonBlockUpsertDto[];
      if (!Array.isArray(blocks)) throw new Error("Los bloques deben ser un arreglo JSON.");
      const lesson = await upsertLesson({ ...form, completion });
      await replaceLessonBlocks(lesson.id, blocks);
    },
    onSuccess: () => {
      setError("");
      onSaved();
    },
    onError: (cause) => setError(cause instanceof Error ? cause.message : "No se pudo guardar la lección."),
  });

  function loadLesson(id: number) {
    setSelectedId(id);
    const lesson = lessons.find((item) => item.id === id);
    if (!lesson) {
      setForm({ topic_id: 0, code: "", title: "", summary: "", objective: "", prerequisites: [], completion: {} });
      setCompletionText("{}");
      setBlocksText("[]");
      return;
    }
    setForm({ topic_id: lesson.topic_id, code: lesson.code, title: lesson.title, summary: lesson.summary ?? "", objective: lesson.objective, prerequisites: lesson.prerequisites, completion: lesson.completion, next_lesson_code: lesson.next_lesson_code, is_active: lesson.is_active });
    setCompletionText(JSON.stringify(lesson.completion));
    setBlocksText(JSON.stringify(lessonBlocks.filter((block) => block.lesson_id === id).map(({ position, kind, content, exercise_id }) => ({ position, kind, content, exercise_id })), null, 2));
  }

  return <Panel title="Lecciones y bloques">
    <p className="mb-4 text-sm leading-6 text-white/65">Define el objetivo y la evidencia de cierre. Los bloques se guardan como una lista ordenada; usa un bloque <code>exercise</code> sólo con un ejercicio del mismo tema.</p>
    <div className="grid gap-3 sm:grid-cols-2">
      <SelectField label="Editar lección" value={String(selectedId)} onChange={(value) => loadLesson(Number(value))} options={[{ value: "0", label: "Nueva lección" }, ...lessons.map((lesson) => ({ value: String(lesson.id), label: lesson.title }))]} />
      <SelectField label="Tema" value={String(form.topic_id)} onChange={(value) => setForm((current) => ({ ...current, topic_id: Number(value) }))} options={[{ value: "0", label: "Selecciona…" }, ...topics.map((topic) => ({ value: String(topic.id), label: topic.title }))]} />
      <Input label="Código" value={form.code} onChange={(value) => setForm((current) => ({ ...current, code: value }))} />
      <Input label="Título" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} />
      <Input label="Resumen" value={form.summary ?? ""} onChange={(value) => setForm((current) => ({ ...current, summary: value }))} />
      <Input label="Siguiente código" value={form.next_lesson_code ?? ""} onChange={(value) => setForm((current) => ({ ...current, next_lesson_code: value || null }))} />
      <Input label="Prerrequisitos (separados por coma)" value={form.prerequisites.join(", ")} onChange={(value) => setForm((current) => ({ ...current, prerequisites: splitCSV(value) }))} />
      <Input label="Criterio de cierre (JSON)" value={completionText} onChange={setCompletionText} />
    </div>
    <label className="mt-3 block space-y-1 text-sm"><span className="text-white/70">Objetivo observable</span><textarea value={form.objective} onChange={(event) => setForm((current) => ({ ...current, objective: event.target.value }))} className="min-h-20 w-full rounded-2xl border border-white/10 bg-white/5 p-3 outline-none focus:ring-2 focus:ring-cyan-300/40" /></label>
    <label className="mt-3 block space-y-1 text-sm"><span className="text-white/70">Bloques (JSON)</span><textarea value={blocksText} onChange={(event) => setBlocksText(event.target.value)} className="min-h-56 w-full rounded-2xl border border-white/10 bg-white/5 p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-cyan-300/40" /></label>
    {!!form.topic_id && <p className="mt-2 text-xs text-white/50">Ejercicios disponibles: {exercises.filter((exercise) => exercise.topic_id === form.topic_id).map((exercise) => `${exercise.id}: ${exercise.title}`).join(" · ") || "ninguno"}</p>}
    {error && <p className="mt-3 text-sm text-amber-100">{error}</p>}
    <button type="button" onClick={() => save.mutate()} disabled={save.isPending || !form.topic_id || !form.code || !form.title || !form.objective} className="mt-4 rounded-2xl bg-cyan-300 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-60">{save.isPending ? "Guardando…" : "Guardar lección y bloques"}</button>
  </Panel>;
}

function KindFields({
  kind,
  config,
  patchConstraints,
}: {
  kind: FormKind;
  config: ExerciseTemplateConfig;
  patchConstraints: (partial: Record<string, unknown>) => void;
}) {
  switch (kind) {
    case "keyboard_note": {
      const current = config as Extract<ExerciseTemplateConfig, { generator: "keyboard_note" }>;
      return (
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Notes" value={current.constraints.notes.join(", ")} onChange={(value) => patchConstraints({ notes: splitCSV(value) })} />
          <Input label="Octaves" value={current.constraints.octaves.join(", ")} onChange={(value) => patchConstraints({ octaves: splitCSV(value).map(Number) })} />
          <Input
            label="Accidentals"
            value={current.constraints.accidentals.join(", ")}
            onChange={(value) => patchConstraints({ accidentals: splitCSV(value) })}
          />
        </div>
      );
    }
    case "staff_note": {
      const current = config as Extract<ExerciseTemplateConfig, { generator: "staff_note" }>;
      return (
        <div className="grid gap-3 sm:grid-cols-4">
          <Input label="Min midi" value={String(current.constraints.range.minMidi)} onChange={(value) => patchConstraints({ range: { ...current.constraints.range, minMidi: Number(value) } })} type="number" />
          <Input label="Max midi" value={String(current.constraints.range.maxMidi)} onChange={(value) => patchConstraints({ range: { ...current.constraints.range, maxMidi: Number(value) } })} type="number" />
          <Input label="Accidentals" value={current.constraints.accidentals.join(", ")} onChange={(value) => patchConstraints({ accidentals: splitCSV(value) })} />
          <ToggleField label="Ledger lines" checked={current.constraints.ledgerLines} onChange={(value) => patchConstraints({ ledgerLines: value })} />
        </div>
      );
    }
    case "ear_interval": {
      const current = config as Extract<ExerciseTemplateConfig, { generator: "ear_interval" }>;
      return (
        <div className="grid gap-3 sm:grid-cols-5">
          <Input label="Interval set" value={current.constraints.intervalSet.join(", ")} onChange={(value) => patchConstraints({ intervalSet: splitCSV(value) })} />
          <SelectField label="Direction" value={current.constraints.direction} onChange={(value) => patchConstraints({ direction: value })} options={[{ value: "ascending", label: "Ascending" }, { value: "descending", label: "Descending" }, { value: "both", label: "Both" }]} />
          <SelectField label="Play mode" value={current.constraints.playMode} onChange={(value) => patchConstraints({ playMode: value })} options={[{ value: "melodic", label: "Melodic" }, { value: "harmonic", label: "Harmonic" }]} />
          <Input label="Min midi" value={String(current.constraints.range.minMidi)} onChange={(value) => patchConstraints({ range: { ...current.constraints.range, minMidi: Number(value) } })} type="number" />
          <Input label="Max midi" value={String(current.constraints.range.maxMidi)} onChange={(value) => patchConstraints({ range: { ...current.constraints.range, maxMidi: Number(value) } })} type="number" />
        </div>
      );
    }
    case "melodic_direction": {
      const current = config as Extract<ExerciseTemplateConfig, { generator: "melodic_direction" }>;
      return (
        <div className="grid gap-3 sm:grid-cols-4">
          <SelectField label="Dirección" value={current.constraints.direction} onChange={(value) => patchConstraints({ direction: value })} options={[{ value: "ascending", label: "Asciende" }, { value: "descending", label: "Desciende" }, { value: "both", label: "Ambas" }]} />
          <Input label="Semitonos" value={current.constraints.semitones.join(", ")} onChange={(value) => patchConstraints({ semitones: splitCSV(value).map(Number) })} />
          <Input label="MIDI mínimo" value={String(current.constraints.range.minMidi)} onChange={(value) => patchConstraints({ range: { ...current.constraints.range, minMidi: Number(value) } })} type="number" />
          <Input label="MIDI máximo" value={String(current.constraints.range.maxMidi)} onChange={(value) => patchConstraints({ range: { ...current.constraints.range, maxMidi: Number(value) } })} type="number" />
        </div>
      );
    }
    case "scale_construction": {
      const current = config as Extract<ExerciseTemplateConfig, { generator: "scale_construction" }>;
      return (
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Roots" value={current.constraints.roots.join(", ")} onChange={(value) => patchConstraints({ roots: splitCSV(value) })} />
          <SelectField label="Mode" value={current.constraints.mode} onChange={(value) => patchConstraints({ mode: value })} options={[{ value: "major", label: "Major" }, { value: "ionian", label: "Ionian" }]} />
          <Input label="Octave" value={String(current.constraints.octave)} onChange={(value) => patchConstraints({ octave: Number(value) })} type="number" />
        </div>
      );
    }
    case "chord_identification": {
      const current = config as Extract<ExerciseTemplateConfig, { generator: "chord_identification" }>;
      return (
        <div className="grid gap-3 sm:grid-cols-6">
          <Input label="Qualities" value={current.constraints.qualities.join(", ")} onChange={(value) => patchConstraints({ qualities: splitCSV(value) })} />
          <Input label="Inversions" value={current.constraints.inversions.join(", ")} onChange={(value) => patchConstraints({ inversions: splitCSV(value).map(Number) })} />
          <SelectField label="Voicing" value={current.constraints.voicing} onChange={(value) => patchConstraints({ voicing: value })} options={[{ value: "close", label: "Close" }, { value: "open", label: "Open" }, { value: "mixed", label: "Mixed" }]} />
          <Input label="Min midi" value={String(current.constraints.range.minMidi)} onChange={(value) => patchConstraints({ range: { ...current.constraints.range, minMidi: Number(value) } })} type="number" />
          <Input label="Max midi" value={String(current.constraints.range.maxMidi)} onChange={(value) => patchConstraints({ range: { ...current.constraints.range, maxMidi: Number(value) } })} type="number" />
          <div className="grid gap-2">
            <ToggleField label="Require name" checked={current.constraints.requireName} onChange={(value) => patchConstraints({ requireName: value })} />
            <ToggleField label="Require inversion" checked={current.constraints.requireInversion} onChange={(value) => patchConstraints({ requireInversion: value })} />
          </div>
        </div>
      );
    }
  }
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="text-white/70">{label}</span>
      <input value={value} type={type} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-3 outline-none focus:ring-2 focus:ring-cyan-300/40" />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="text-white/70">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-3 outline-none focus:ring-2 focus:ring-cyan-300/40">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-white/70">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-cyan-300" />
      <span>{label}</span>
    </label>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: Array<Array<React.ReactNode>> }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-white/5">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-medium text-white/70">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-white/10">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function splitCSV(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

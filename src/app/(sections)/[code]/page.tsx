// "use client";
// import { fetchSections, fetchTopicsBySectionCode } from "@/lib/api/api";
// import { useQuery } from "@tanstack/react-query";
// import Link from "next/link";
// import { use, useMemo } from "react";

// export default function SectionPage({ params }: { params: Promise<{ code: string }> }) {
//   const { code } = use(params);
//   const { data: sections } = useQuery({ queryKey: ["sections"], queryFn: fetchSections });
//   const section = useMemo(() => (sections as any)?.find((s: any) => s.code === code), [sections, code]);

//   const { data: topics, isLoading } = useQuery({
//     enabled: !!section,
//     queryKey: ["topics", code],
//     queryFn: () => fetchTopicsBySectionCode(code),
//   });

//   console.log(sections, code);

//   if (!section) return <div className="p-8">Sección no encontrada…</div>;
//   if (isLoading) return <div className="p-8">Cargando temas…</div>;

//   return (
//     <main className="max-w-3xl mx-auto py-10">
//       <h1 className="text-2xl font-semibold">{section.title}</h1>
//       <p className="opacity-70">{section.description}</p>

//       <ul className="mt-6 grid gap-3">
//         {topics?.map((t: any) => (
//           <li key={t.id} className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition">
//             <div className="text-sm text-white/70">{t.title}</div>
//             <p className="text-white/60 text-sm">{t.description}</p>
//             <Link className="inline-block mt-2 rounded-lg border border-white/15 px-3 py-1 text-sm hover:bg-white/5" href={`/sections/${code}/${t.code}`}>
//               Ver ejercicios
//             </Link>
//           </li>
//         ))}
//       </ul>
//     </main>
//   );
// }

"use client";
import { use } from "react";
import { fetchExercisesByTopicId, fetchTopicsBySectionCode } from "@/lib/api/api";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";

export default function TopicPage({ params }: { params: Promise<{ code: string; topic: string }> }) {
  const { code, topic: topicCode } = use(params);

  const { data: topics } = useQuery({
    queryKey: ["topics", code],
    queryFn: () => fetchTopicsBySectionCode(code),
  });

  const topic = useMemo(() => topics?.find((t: any) => t.section_id === 1), [topics, topicCode]);

  const { data: exercises, isLoading } = useQuery({
    enabled: !!topic,
    queryKey: ["exercises", topic?.id],
    queryFn: () => fetchExercisesByTopicId(topic!.id),
  });

  console.log(topics);

  if (!topic) return <div className="p-8">Tema no encontrado…</div>;
  if (isLoading) return <div className="p-8">Cargando ejercicios…</div>;

  return (
    <main className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-semibold">{topic.title}</h1>
      <p className="opacity-70">{topic.description}</p>

      <ul className="mt-6 grid gap-3">
        {exercises?.map((ex: any) => (
          <li key={ex.id} className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition">
            <div className="text-xs uppercase tracking-wide text-white/60">{ex.kind}</div>
            <div className="font-medium">{ex.title}</div>
            <pre className="text-xs opacity-60 mt-2">{JSON.stringify(ex.config, null, 2)}</pre>
            <Link href={`/sections/${code}/${topicCode}/exercise/${ex.id}`} className="inline-block mt-3 text-sm bg-blue-600 text-white px-3 py-1 rounded">
              Iniciar
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

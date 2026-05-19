"use client";

import Link from "next/link";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSections, fetchTopicsBySectionCode } from "@/lib/api/api";

export default function SectionPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const { data: sections } = useQuery({
    queryKey: ["sections"],
    queryFn: fetchSections,
  });
  const { data: topics, isLoading } = useQuery({
    queryKey: ["topics", code],
    queryFn: () => fetchTopicsBySectionCode(code),
  });

  const section = sections?.find((item) => item.code === code);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-white">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/70">{section?.code ?? code}</p>
        <h1 className="mt-2 text-3xl font-semibold">{section?.title ?? "Sección"}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70">
          {section?.description ?? "Explora los topics y empieza a generar práctica guiada."}
        </p>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {isLoading && <div className="text-white/70">Cargando topics…</div>}
        {(topics ?? []).map((topic) => (
          <Link
            key={topic.id}
            href={`/sections/${code}/${topic.code}`}
            className="rounded-[24px] border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">{topic.code}</p>
            <h2 className="mt-2 text-xl font-medium">{topic.title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/65">{topic.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}

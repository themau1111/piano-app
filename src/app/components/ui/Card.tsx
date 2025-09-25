import { cn } from "../../../lib/cn";
export function Card({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl bg-white/5 border border-white/10 backdrop-blur p-5 text-white", className)}>
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </section>
  );
}

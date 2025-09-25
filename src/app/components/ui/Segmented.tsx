import { cn } from "../../../lib/cn";
export function Segmented({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="inline-flex rounded-lg border border-white/15 overflow-hidden">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn("px-3 py-2 text-sm transition", value === o.value ? "bg-white/20 text-white" : "bg-transparent text-white/80 hover:bg-white/10")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

import { cn } from "../../../lib/cn";

type Option = { id: string; label: string };

export function PillGroup({ selected, options, onToggle }: { selected: string[]; options: ReadonlyArray<Option>; onToggle: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = selected.includes(o.id);
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onToggle(o.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm border transition",
              active ? "bg-white/20 border-white/30 text-white" : "border-white/20 text-white/80 hover:bg-white/10"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

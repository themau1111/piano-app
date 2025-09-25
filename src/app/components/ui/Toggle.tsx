export function ToggleList({ items }: { items: { label: string; checked: boolean; onChange: (v: boolean) => void }[] }) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <label key={i} className="flex items-center gap-3">
          <input type="checkbox" className="h-4 w-4 accent-white" checked={it.checked} onChange={(e) => it.onChange(e.target.checked)} />
          <span className="text-sm text-white/90">{it.label}</span>
        </label>
      ))}
    </div>
  );
}

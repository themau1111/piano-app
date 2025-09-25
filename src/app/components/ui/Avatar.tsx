"use client";
import { cn } from "../../../lib/cn";

export function Avatar({ src, alt, size = "md", initials, className }: { src?: string; alt: string; size?: "sm" | "md" | "lg"; initials?: string; className?: string }) {
  const sizeCls = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-16 w-16" : "h-10 w-10";

  if (src) {
    return <img src={src} alt={alt} className={cn("inline-block rounded-full object-cover ring-1 ring-white/20", sizeCls, className)} referrerPolicy="no-referrer" />;
  }

  const fallback = (initials || alt || "U").trim().slice(0, 2).toUpperCase();

  return (
    <div className={cn("inline-flex items-center justify-center rounded-full bg-white/20 text-white font-medium ring-1 ring-white/20", sizeCls, className)} aria-hidden="true">
      {fallback}
    </div>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "./ui/Button";
import { fetchSections, fetchTopicsAllBySectionCode } from "../../lib/api/api";
import { useAuth } from "../../lib/auth-store";
import { cn } from "../../lib/cn";
import { useState, useMemo, useEffect, useRef } from "react";
import { ProfilePanel } from "./profile/ProfilePanel";
import { Avatar } from "./ui/Avatar";
import { useCurrentUser } from "../hooks/useCurrentUser";

export default function Navbar() {
  const pathname = usePathname();
  const segments = useMemo(() => pathname.split("/").filter(Boolean), [pathname]);
  const currentSection = segments[0] === "sections" ? segments[1] ?? null : null;
  const currentTopic = segments[0] === "sections" ? segments[2] ?? null : null;

  const { data: sections } = useQuery({ queryKey: ["sections"], queryFn: fetchSections });
  const { data: topicsMap } = useQuery({ queryKey: ["topicsBySection"], queryFn: fetchTopicsAllBySectionCode });

  const { mode, signOut } = useAuth();
  const { data: user } = useCurrentUser();

  // estado: panel perfil
  const [openPanel, setOpenPanel] = useState(false);

  // estado: menú móvil
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileOpenSection, setMobileOpenSection] = useState<string | null>(null);

  // estado: dropdown por click (desktop)
  const [openDesktopSection, setOpenDesktopSection] = useState<string | null>(null);

  // cerrar dropdown desktop al navegar
  useEffect(() => {
    setOpenDesktopSection(null);
  }, [pathname]);

  // click-away para cerrar dropdown abierto
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!headerRef.current) return;
      if (!headerRef.current.contains(e.target as Node)) setOpenDesktopSection(null);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const userLabel = (user?.username ? `@${user.username}` : user?.displayName) ?? (user?.email ? user.email.split("@")[0] : "Perfil");

  return (
    <>
      <header ref={headerRef} className="sticky top-0 z-50 border-b border-white/10 bg-[#0b1325]/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          {/* Brand + burger */}
          <div className="flex items-center gap-3">
            <button className="md:hidden inline-flex items-center justify-center rounded-lg p-2 hover:bg-white/10" aria-label="Abrir menú" onClick={() => setMobileOpen((v) => !v)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" />
              </svg>
            </button>
            <Link href="/" className="font-semibold tracking-tight">
              🎹 MusicAula
            </Link>
          </div>

          {/* Sections (desktop) → click para desplegar */}
          <nav className="hidden md:flex items-center gap-1">
            {(sections ?? []).map((s: any) => {
              const topics = topicsMap?.[s.code] ?? [];
              const isSectionActive = currentSection === s.code;
              const isOpen = openDesktopSection === s.code;

              return (
                <div key={s.id} className="relative">
                  {/* Botón que abre/cierra el dropdown */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDesktopSection((prev) => (prev === s.code ? null : s.code));
                    }}
                    aria-expanded={isOpen}
                    aria-controls={`section-dd-${s.code}`}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white",
                      isSectionActive && "bg-white/10 text-white"
                    )}
                  >
                    {s.title}
                    <svg className={cn("transition-transform", isOpen ? "rotate-180" : "rotate-0")} width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {/* Dropdown por click */}
                  {isOpen && (
                    <div id={`section-dd-${s.code}`} className="absolute left-0 mt-2 min-w-[240px] rounded-xl border border-white/10 bg-[#0b1325] shadow-lg p-2">
                      <Link href={`/sections/${s.code}`} className="mb-1 block rounded-lg px-3 py-2 text-xs uppercase tracking-wide text-white/60 hover:bg-white/5">
                        Ver sección
                      </Link>
                      <div className="h-px bg-white/10 my-1" />
                      {topics.length === 0 && <span className="block rounded-lg px-3 py-2 text-sm text-white/50">Sin temas aún</span>}
                      {topics.map((t: any) => {
                        const isTopicActive = isSectionActive && currentTopic === t.code;
                        return (
                          <Link
                            key={t.id}
                            href={`/sections/${s.code}/${t.code}`}
                            aria-current={isTopicActive ? "page" : undefined}
                            className={cn(
                              "block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg白/5 hover:text-white".replace("白", "white"), // evita conf de fuentes
                              isTopicActive && "bg-white/10 text-white"
                            )}
                          >
                            {t.title}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right zone */}
          <div className="flex items-center gap-2">
            {user?.role === "admin" && (
              <a href="/admin" className={cn("px-3 py-2 rounded hover:bg-white/10")}>
                Admin
              </a>
            )}
            {mode === "guest" ? (
              <Link href="/login">
                <Button variant="solid" size="sm">
                  Iniciar sesión
                </Button>
              </Link>
            ) : (
              <button
                onClick={() => setOpenPanel(true)}
                className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-white/40"
                aria-label="Abrir panel de perfil"
                title={userLabel}
              >
                <Avatar src={user?.avatarUrl} alt={user?.displayName ?? "Usuario"} size="sm" />
                <span className="hidden sm:block text-sm text-white/90 max-w-[14ch] truncate">{userLabel}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu (acordeón) */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0b1325]">
            <div className="mx-auto max-w-6xl px-4 py-3">
              {(sections ?? []).map((s: any) => {
                const topics = topicsMap?.[s.code] ?? [];
                const open = mobileOpenSection === s.code;
                const isSectionActive = currentSection === s.code;

                return (
                  <div key={s.id} className="mb-2">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/sections/${s.code}`}
                        onClick={() => setMobileOpen(false)}
                        aria-current={isSectionActive ? "page" : undefined}
                        className={cn("rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white", isSectionActive && "bg-white/10 text-white")}
                      >
                        {s.title}
                      </Link>
                      <button
                        className="rounded-lg px-2 py-2 text-white/70 hover:bg-white/10"
                        onClick={() => setMobileOpenSection((v) => (v === s.code ? null : s.code))}
                        aria-label={open ? "Cerrar temas" : "Abrir temas"}
                        aria-expanded={open}
                        aria-controls={`m-acc-${s.code}`}
                      >
                        <svg className={cn("transition-transform", open ? "rotate-180" : "rotate-0")} width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>

                    {/* Acordeón topics */}
                    {open && (
                      <div id={`m-acc-${s.code}`} className="pl-2">
                        <Link
                          href={`/sections/${s.code}`}
                          onClick={() => setMobileOpen(false)}
                          className="block rounded-lg px-3 py-2 text-xs uppercase tracking-wide text-white/60 hover:bg-white/5"
                        >
                          Ver sección
                        </Link>
                        {topics.map((t: any) => {
                          const isTopicActive = isSectionActive && currentTopic === t.code;
                          return (
                            <Link
                              key={t.id}
                              href={`/sections/${s.code}/${t.code}`}
                              onClick={() => setMobileOpen(false)}
                              aria-current={isTopicActive ? "page" : undefined}
                              className={cn("block rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white", isTopicActive && "bg-white/10 text-white")}
                            >
                              {t.title}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Drawer de perfil */}
      {mode !== "guest" && (
        <ProfilePanel
          open={openPanel}
          onClose={() => setOpenPanel(false)}
          onSignOut={() => {
            setOpenPanel(false);
            signOut();
          }}
        />
      )}
    </>
  );
}

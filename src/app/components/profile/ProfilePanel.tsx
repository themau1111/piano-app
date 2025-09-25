"use client";
import Link from "next/link";
import { Fragment } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Avatar } from "../ui/Avatar";
import { useQuery } from "@tanstack/react-query";
import { getMyPreferences } from "../../../lib/api/api";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";

export function ProfilePanel({ open, onClose, onSignOut }: { open: boolean; onClose: () => void; onSignOut: () => void }) {
  const { data: user } = useCurrentUser();
  const { data: prefs } = useQuery({
    queryKey: ["prefs", open],
    queryFn: getMyPreferences,
    enabled: open,
  });

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={onClose}>
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </TransitionChild>

        {/* Drawer */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 flex justify-end">
            <TransitionChild
              as={Fragment}
              enter="transform transition ease-out duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in duration-200"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <DialogPanel className="w-screen max-w-sm bg-[#0b1325] text-white border-l border-white/10 shadow-2xl">
                {/* Header */}
                <div className="p-5 border-b border-white/10 flex items-center gap-3">
                  <Avatar src={user?.avatarUrl} alt={user?.displayName ?? "Usuario"} size="lg" />
                  <div className="min-w-0">
                    <DialogTitle className="font-semibold truncate">{user?.displayName ?? "Tu perfil"}</DialogTitle>
                    <p className="text-sm text-white/70 truncate">{user?.username ? `@${user.username}` : user?.email ?? ""}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-6">
                  <nav className="space-y-2">
                    <Link href="/profile" className="block rounded-lg px-3 py-2 hover:bg-white/10" onClick={onClose}>
                      Ver/editar perfil
                    </Link>
                    <Link href="/preferences" className="block rounded-lg px-3 py-2 hover:bg-white/10" onClick={onClose}>
                      Editar preferencias
                    </Link>
                  </nav>

                  <div className="border-t border-white/10 pt-4">
                    <h3 className="text-sm font-medium mb-3 text-white/80">Resumen de preferencias</h3>
                    {prefs ? (
                      <ul className="space-y-2 text-sm">
                        <Li label="Tema" value={prefs.theme ?? "—"} />
                        <Li label="Idioma" value={prefs.locale ?? "—"} />
                        <Li label="Instrumento" value={prefs.primaryInstrument ?? (prefs as any).instrument ?? "—"} />
                        <Li label="Nivel" value={prefs.level ?? "—"} />
                        <Li label="Objetivos" value={(prefs.goals ?? []).join(" · ") || "—"} />
                      </ul>
                    ) : (
                      <p className="text-sm text-white/60">Aún no has configurado preferencias.</p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-white/10 flex items-center justify-between">
                  <button onClick={onSignOut} className="rounded-lg border border-white/15 px-4 py-2 hover:bg-white/10">
                    Cerrar sesión
                  </button>
                  <button onClick={onClose} className="rounded-lg bg-white/90 text-black px-4 py-2 hover:bg-white">
                    Listo
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

function Li({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-white/60">{label}</span>
      <span className="text-white/90 truncate">{value}</span>
    </li>
  );
}

"use client";
import { useState } from "react";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { ChatPanel } from "./ChatPanel";

export function ChatFab() {
  const [open, setOpen] = useState(false);
  const { data: user } = useCurrentUser();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full border border-cyan-100/40 bg-[linear-gradient(135deg,#67e8f9,#38bdf8)] px-4 py-3 text-slate-950 shadow-[0_12px_28px_rgba(14,165,233,0.3)] transition hover:-translate-y-0.5 hover:from-cyan-200 hover:to-sky-300 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-[#07101f]"
        aria-label="Abrir chat"
      >
        ✨ Chat
      </button>
      <ChatPanel open={open} onClose={() => setOpen(false)} userId={user?.id} username={user?.username} />
    </>
  );
}

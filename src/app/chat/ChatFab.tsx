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
        className="fixed bottom-6 right-6 z-40 rounded-full bg-white text-black px-4 py-3 shadow-xl hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
        aria-label="Abrir chat"
      >
        ✨ Chat
      </button>
      <ChatPanel open={open} onClose={() => setOpen(false)} userId={user?.id} username={user?.username} />
    </>
  );
}

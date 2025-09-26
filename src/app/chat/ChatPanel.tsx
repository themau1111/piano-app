/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { useQuery } from "@tanstack/react-query";
import { getMyPreferences } from "../../lib/api/api";
import type { ChatMessage } from "../../lib/chat/types";
import { cn } from "../../lib/cn";
import { useTyping } from "@/context/TypingContext";

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed", isUser ? "bg-white text-black" : "bg-white/10 text-white border border-white/10")}>
        {children}
      </div>
    </div>
  );
}

export function ChatPanel({ open, onClose, userId, username }: { open: boolean; onClose: () => void; userId?: string; username?: string }) {
  const { data: prefs } = useQuery({ queryKey: ["prefs-for-chat"], queryFn: getMyPreferences, enabled: open });
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      role: "system",
      content: "Eres un tutor de música amable y concreto. Da pasos accionables, ejercicios y ejemplos breves. No inventes hechos.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const { setTyping } = useTyping();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const suggestions = useMemo(
    () => ["Crea una rutina de 20 min para hoy", "Explícame los acordes mayores con ejemplos", "Ejercicio de oído para intervalos", "Recomiéndame una canción nivel intermedio"],
    []
  );

  async function sendMessage(text: string) {
    const content = text.trim();
    if (!content) return;

    setSending(true);

    // 1) push del mensaje del usuario
    const base: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(base);
    setInput("");

    // 2) placeholder para el asistente
    const assistantIndex = base.length;
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: base,
          userContext: { userId, username },
          preferences: prefs ?? undefined,
        }),
      });

      if (!res.ok) throw new Error("HTTP error");

      // --- lectura de stream ---
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream body");

      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;

        setMessages((prev) => {
          const copy = [...prev];
          const current = copy[assistantIndex];
          copy[assistantIndex] = {
            ...current,
            content: (current?.content ?? "") + chunk,
          };
          return copy;
        });
      }
    } catch (e) {
      setMessages((m) => {
        const copy = [...m];
        const current = copy[assistantIndex];
        copy[assistantIndex] = {
          ...current,
          content: (current?.content ?? "") + "\n\n[Ocurrió un error. Intenta de nuevo.]",
        };
        return copy;
      });
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    e.stopPropagation();
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={onClose}>
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
              <DialogPanel className="w-screen max-w-md bg-[#0b1325] text-white border-l border-white/10 shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-white/10">
                  <DialogTitle className="font-semibold">Asistente de MusicAula</DialogTitle>
                  <p className="text-xs text-white/60 mt-1">
                    Personalizado para {prefs?.primaryInstrument ?? "piano"} · nivel {prefs?.level ?? "beginner"}
                  </p>
                </div>

                {/* Messages */}
                <div className="flex-1 p-5 space-y-3 overflow-y-auto">
                  {messages
                    .filter((m) => m.role !== "system")
                    .map((m, i) => (
                      <Bubble key={i} role={m.role as "user" | "assistant"}>
                        {m.content}
                      </Bubble>
                    ))}
                  <div ref={endRef} />
                </div>

                {/* Composer */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {suggestions.map((s) => (
                      <button key={s} onClick={() => sendMessage(s)} className="text-xs rounded-full border border-white/15 px-3 py-1 hover:bg-white/10">
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="rounded-xl bg-white/10 border border-white/10 p-2">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => setTyping(true)}
                      onBlur={() => setTyping(false)}
                      onKeyUp={(e) => e.stopPropagation()}
                      rows={2}
                      placeholder="Escribe tu mensaje… (Enter para enviar · Shift+Enter para salto de línea)"
                      className="w-full resize-none bg-transparent outline-none placeholder:text-white/50"
                      disabled={sending}
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => sendMessage(input)}
                        disabled={sending || !input.trim()}
                        className="rounded-lg bg-white/90 text-black px-4 py-2 hover:bg-white disabled:opacity-60"
                      >
                        {sending ? "Enviando…" : "Enviar"}
                      </button>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

"use client";
import { createContext, useContext, useState, type ReactNode } from "react";

type TypingCtx = { typing: boolean; setTyping: (v: boolean) => void };
const Ctx = createContext<TypingCtx>({ typing: false, setTyping: () => {} });

export function TypingProvider({ children }: { children: ReactNode }) {
  const [typing, setTyping] = useState(false);
  return <Ctx.Provider value={{ typing, setTyping }}>{children}</Ctx.Provider>;
}

export function useTyping() {
  return useContext(Ctx);
}

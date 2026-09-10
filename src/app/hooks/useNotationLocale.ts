"use client";

import { useEffect, useState } from "react";

const KEY = "musicaula:notation-locale";
export type NotationLocale = "es" | "en";

export function useNotationLocale() {
  const [locale, setLocaleState] = useState<NotationLocale>("es");
  useEffect(() => {
    const value = window.localStorage.getItem(KEY);
    if (value === "en" || value === "es") setLocaleState(value);
  }, []);
  const setLocale = (value: NotationLocale) => {
    window.localStorage.setItem(KEY, value);
    setLocaleState(value);
  };
  return { locale, setLocale };
}

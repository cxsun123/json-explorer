"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import en, { type Locale } from "./en";
import zh from "./zh";

type Lang = "en" | "zh";

const locales: Record<Lang, Locale> = { en, zh };

interface LocaleContextValue {
  lang: Lang;
  t: Locale;
  toggleLang: () => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === "en" ? "zh" : "en"));
  }, []);

  return (
    <LocaleContext.Provider value={{ lang, t: locales[lang], toggleLang }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

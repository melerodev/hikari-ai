"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { translations, type Language, type TranslationKey } from "./translations"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
  getWelcomeMessages: () => string[]
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es")

  useEffect(() => {
    // Load saved language from localStorage
    const savedLang = localStorage.getItem("hikari-language") as Language
    if (savedLang && (savedLang === "es" || savedLang === "en")) {
      setLanguageState(savedLang)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("hikari-language", lang)
  }

  const t = (key: TranslationKey): string => {
    return (translations[language][key] as string) || key
  }

  const getWelcomeMessages = (): string[] => {
    return translations[language].welcomeMessages as unknown as string[]
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getWelcomeMessages }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

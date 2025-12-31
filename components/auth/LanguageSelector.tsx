"use client"

import { useState, useRef, useEffect } from "react"
import { Globe, Check, ChevronDown } from "lucide-react"
import { useLanguage } from "@/lib/i18n/LanguageContext"

const languages = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇺🇸" },
]

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const { language, setLanguage } = useLanguage()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLanguage = languages.find((l) => l.code === language)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLanguageSelect = (langCode: string) => {
    setLanguage(langCode as "es" | "en")
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-300 hover:text-white bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700 rounded-lg transition-all"
      >
        <Globe className="h-4 w-4" />
        <span>{currentLanguage?.flag}</span>
        <span className="hidden sm:inline">{currentLanguage?.name}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl overflow-hidden z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm text-left transition-colors ${
                language === lang.code
                  ? "bg-neutral-700 text-white"
                  : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
              }`}
            >
              <span>{lang.flag}</span>
              <span className="flex-1">{lang.name}</span>
              {language === lang.code && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

"use client"
import { MoreHorizontal, ChevronDown, ChevronRight } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import GhostIconButton from "./GhostIconButton"
import { useLanguage } from "@/lib/i18n/LanguageContext"

const MODEL_LOGOS = {
  openai: {
    light: "/images/chatgpt-logo-black.png",
    dark: "/images/chatgpt-logo-white.png",
  },
  gemini: {
    light: "/images/gemini-logo.png",
    dark: "/images/gemini-logo.png",
  },
  grok: {
    light: "/images/grok-logo-black.png",
    dark: "/images/grok-logo-white.png",
  },
  deepseek: {
    light: "/images/deepseek-logo.png",
    dark: "/images/deepseek-logo.png",
  },
}

export default function Header({
  createNewChat,
  sidebarCollapsed,
  setSidebarOpen,
  selectedModel,
  onModelChange,
  theme,
  hasMessages = false,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isGPTSubmenuOpen, setIsGPTSubmenuOpen] = useState(false)
  const [isGeminiSubmenuOpen, setIsGeminiSubmenuOpen] = useState(false)
  const [isGrokSubmenuOpen, setIsGrokSubmenuOpen] = useState(false)
  const [geminiModels, setGeminiModels] = useState([])
  const [geminiLoading, setGeminiLoading] = useState(false)
  const dropdownRef = useRef(null)
  const submenuTimeoutRef = useRef(null)
  const geminiTimeoutRef = useRef(null)
  const grokTimeoutRef = useRef(null)
  const { t } = useLanguage()

  const getThemedLogo = (brand) => {
    const currentTheme = theme === "dark" ? "dark" : "light"
    return MODEL_LOGOS[brand]?.[currentTheme] || MODEL_LOGOS[brand]?.light
  }

  useEffect(() => {
    const fetchGeminiModels = async () => {
      setGeminiLoading(true)
      try {
        const response = await fetch("/api/models/gemini")

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`)
        }

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        setGeminiModels(data.models || [])
      } catch (error) {
        console.error("Error fetching Gemini models:", error)
        setGeminiModels([{ name: "Gemini", brand: "gemini", id: "gemini" }])
      } finally {
        setGeminiLoading(false)
      }
    }

    fetchGeminiModels()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
        setIsGPTSubmenuOpen(false)
        setIsGeminiSubmenuOpen(false)
        setIsGrokSubmenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    return () => {
      if (submenuTimeoutRef.current) {
        clearTimeout(submenuTimeoutRef.current)
      }
      if (geminiTimeoutRef.current) {
        clearTimeout(geminiTimeoutRef.current)
      }
      if (grokTimeoutRef.current) {
        clearTimeout(grokTimeoutRef.current)
      }
    }
  }, [])

  const gptModels = [
    { name: "GPT-5", brand: "openai", id: "gpt-5" },
    { name: "GPT-5-mini", brand: "openai", id: "gpt-5-mini" },
    { name: "GPT-5-nano", brand: "openai", id: "gpt-5-nano" },
    { name: "ChatGPT-5", brand: "openai", id: "chatgpt-5" },
    { name: "GPT-4.1", brand: "openai", id: "gpt-4.1" },
    { name: "GPT-4.1-mini", brand: "openai", id: "gpt-4.1-mini" },
    { name: "GPT-4.1-nano", brand: "openai", id: "gpt-4.1-nano" },
    { name: "GPT-4o", brand: "openai", id: "gpt-4o" },
    { name: "GPT-4o-mini", brand: "openai", id: "gpt-4o-mini" },
    { name: "o1", brand: "openai", id: "o1" },
    { name: "o1-mini", brand: "openai", id: "o1-mini" },
    { name: "o1-preview", brand: "openai", id: "o1-preview" },
    { name: "o3", brand: "openai", id: "o3" },
    { name: "o3-mini", brand: "openai", id: "o3-mini" },
    { name: "o4-mini", brand: "openai", id: "o4-mini" },
  ]

  const grokModels = [
    { name: "Grok 3", brand: "grok", id: "grok-3" },
    { name: "Grok 3 Mini", brand: "grok", id: "grok-3-mini" },
  ]

  const otherChatbots = [{ name: "DeepSeek", brand: "deepseek", id: "deepseek" }]

  const allModels = [...gptModels, ...geminiModels, ...grokModels, ...otherChatbots]
  const currentBot = allModels.find((bot) => bot.id === selectedModel) || gptModels[0]
  const isGPTModel = gptModels.some((bot) => bot.id === selectedModel)
  const isGeminiModel = geminiModels.some((bot) => bot.id === selectedModel)
  const isGrokModel = grokModels.some((bot) => bot.id === selectedModel)

  const handleGPTMouseEnter = () => {
    if (submenuTimeoutRef.current) clearTimeout(submenuTimeoutRef.current)
    if (geminiTimeoutRef.current) clearTimeout(geminiTimeoutRef.current)
    if (grokTimeoutRef.current) clearTimeout(grokTimeoutRef.current)
    setIsGeminiSubmenuOpen(false)
    setIsGrokSubmenuOpen(false)
    setIsGPTSubmenuOpen(true)
  }

  const handleGPTMouseLeave = () => {
    submenuTimeoutRef.current = setTimeout(() => setIsGPTSubmenuOpen(false), 150)
  }

  const handleGeminiMouseEnter = () => {
    if (geminiTimeoutRef.current) clearTimeout(geminiTimeoutRef.current)
    if (submenuTimeoutRef.current) clearTimeout(submenuTimeoutRef.current)
    if (grokTimeoutRef.current) clearTimeout(grokTimeoutRef.current)
    setIsGPTSubmenuOpen(false)
    setIsGrokSubmenuOpen(false)
    setIsGeminiSubmenuOpen(true)
  }

  const handleGeminiMouseLeave = () => {
    geminiTimeoutRef.current = setTimeout(() => setIsGeminiSubmenuOpen(false), 150)
  }

  const handleGrokMouseEnter = () => {
    if (grokTimeoutRef.current) clearTimeout(grokTimeoutRef.current)
    if (submenuTimeoutRef.current) clearTimeout(submenuTimeoutRef.current)
    if (geminiTimeoutRef.current) clearTimeout(geminiTimeoutRef.current)
    setIsGPTSubmenuOpen(false)
    setIsGeminiSubmenuOpen(false)
    setIsGrokSubmenuOpen(true)
  }

  const handleGrokMouseLeave = () => {
    grokTimeoutRef.current = setTimeout(() => setIsGrokSubmenuOpen(false), 150)
  }

  const handleOtherModelHover = () => {
    if (submenuTimeoutRef.current) clearTimeout(submenuTimeoutRef.current)
    if (geminiTimeoutRef.current) clearTimeout(geminiTimeoutRef.current)
    if (grokTimeoutRef.current) clearTimeout(grokTimeoutRef.current)
    setIsGPTSubmenuOpen(false)
    setIsGeminiSubmenuOpen(false)
    setIsGrokSubmenuOpen(false)
  }

  const renderIcon = (brand, size = "w-4 h-4") => {
    const logoUrl = getThemedLogo(brand)
    if (logoUrl) {
      return <img src={logoUrl || "/placeholder.svg"} alt="" className={`${size} object-contain`} />
    }
    return null
  }

  return (
    <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-zinc-200/60 bg-white/80 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
      <div className="flex relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold tracking-tight hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800"
          aria-label={t("selectModel")}
        >
          {renderIcon(currentBot.brand)}
          {currentBot.name}
          <ChevronDown className="h-4 w-4" />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-48 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950 z-50">
            <div className="relative" onMouseEnter={handleGPTMouseEnter} onMouseLeave={handleGPTMouseLeave}>
              <button
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-t-lg ${
                  isGPTModel ? "bg-zinc-100 dark:bg-zinc-800" : ""
                }`}
                aria-label="GPT models"
              >
                <div className="flex items-center gap-2">
                  {renderIcon("openai")}
                  GPT
                </div>
                <ChevronRight className="h-4 w-4" />
              </button>

              {isGPTSubmenuOpen && (
                <div
                  className="absolute left-full top-0 ml-1 w-48 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950 max-h-80 overflow-y-auto"
                  onMouseEnter={handleGPTMouseEnter}
                  onMouseLeave={handleGPTMouseLeave}
                >
                  {gptModels.map((bot) => (
                    <button
                      key={bot.id}
                      onClick={() => {
                        onModelChange?.(bot.id)
                        setIsDropdownOpen(false)
                        setIsGPTSubmenuOpen(false)
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 first:rounded-t-lg last:rounded-b-lg ${
                        selectedModel === bot.id ? "bg-zinc-100 dark:bg-zinc-800" : ""
                      }`}
                    >
                      {bot.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative" onMouseEnter={handleGeminiMouseEnter} onMouseLeave={handleGeminiMouseLeave}>
              <button
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                  isGeminiModel ? "bg-zinc-100 dark:bg-zinc-800" : ""
                }`}
                aria-label="Gemini models"
              >
                <div className="flex items-center gap-2">
                  {renderIcon("gemini")}
                  Gemini
                </div>
                <ChevronRight className="h-4 w-4" />
              </button>

              {isGeminiSubmenuOpen && (
                <div
                  className="absolute left-full top-0 ml-1 w-56 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950 max-h-80 overflow-y-auto"
                  onMouseEnter={handleGeminiMouseEnter}
                  onMouseLeave={handleGeminiMouseLeave}
                >
                  {geminiLoading ? (
                    <div className="px-3 py-2 text-sm text-zinc-500">{t("loadingModels")}</div>
                  ) : geminiModels.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-zinc-500">{t("noModelsAvailable")}</div>
                  ) : (
                    geminiModels.map((bot) => (
                      <button
                        key={bot.id}
                        onClick={() => {
                          onModelChange?.(bot.id)
                          setIsDropdownOpen(false)
                          setIsGeminiSubmenuOpen(false)
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 first:rounded-t-lg last:rounded-b-lg ${
                          selectedModel === bot.id ? "bg-zinc-100 dark:bg-zinc-800" : ""
                        }`}
                      >
                        {bot.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="relative" onMouseEnter={handleGrokMouseEnter} onMouseLeave={handleGrokMouseLeave}>
              <button
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                  isGrokModel ? "bg-zinc-100 dark:bg-zinc-800" : ""
                }`}
                aria-label="Grok models"
              >
                <div className="flex items-center gap-2">
                  {renderIcon("grok")}
                  Grok
                </div>
                <ChevronRight className="h-4 w-4" />
              </button>

              {isGrokSubmenuOpen && (
                <div
                  className="absolute left-full top-0 ml-1 w-48 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950 max-h-80 overflow-y-auto"
                  onMouseEnter={handleGrokMouseEnter}
                  onMouseLeave={handleGrokMouseLeave}
                >
                  {grokModels.map((bot) => (
                    <button
                      key={bot.id}
                      onClick={() => {
                        onModelChange?.(bot.id)
                        setIsDropdownOpen(false)
                        setIsGrokSubmenuOpen(false)
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 first:rounded-t-lg last:rounded-b-lg ${
                        selectedModel === bot.id ? "bg-zinc-100 dark:bg-zinc-800" : ""
                      }`}
                    >
                      {bot.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {otherChatbots.map((bot, index) => (
              <button
                key={bot.id}
                onClick={() => {
                  onModelChange?.(bot.id)
                  setIsDropdownOpen(false)
                }}
                onMouseEnter={handleOtherModelHover}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                  index === otherChatbots.length - 1 ? "rounded-b-lg" : ""
                } ${selectedModel === bot.id ? "bg-zinc-100 dark:bg-zinc-800" : ""}`}
              >
                {renderIcon(bot.brand)}
                {bot.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {hasMessages && (
          <GhostIconButton label={t("moreOptions")}>
            <MoreHorizontal className="h-4 w-4" />
          </GhostIconButton>
        )}
      </div>
    </div>
  )
}

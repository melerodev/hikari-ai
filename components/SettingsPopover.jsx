"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Globe, LogOut, ChevronRight, ChevronLeft, Check, User, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { useLanguage } from "@/lib/i18n/LanguageContext"
import { useUser } from "@/lib/hooks/useUser"
import { createClient } from "@/lib/supabase/client"
import AccountModal from "./AccountModal"

export default function SettingsPopover({ children }) {
  const [open, setOpen] = useState(false)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const { language, setLanguage, t } = useLanguage()
  const { profile, loading } = useUser()
  const router = useRouter()

  const languages = [
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "en", name: "English", flag: "🇺🇸" },
  ]

  const handleLanguageSelect = (langCode) => {
    setLanguage(langCode)
    setShowLanguageMenu(false)
  }

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen)
    if (!newOpen) {
      setShowLanguageMenu(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error logging out:", error)
      setIsLoggingOut(false)
    }
  }

  const handleOpenAccount = () => {
    setOpen(false)
    setShowAccountModal(true)
  }

  return (
    <>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent className="w-80 p-0 border-zinc-200 dark:border-zinc-800" align="start" side="top">
          {!showLanguageMenu ? (
            // Main settings view
            <div className="p-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 mb-3">
                <div className="relative h-11 w-11 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700 flex-shrink-0">
                  <img
                    src={profile?.avatarUrl || `https://www.gravatar.com/avatar/?d=mp&s=88`}
                    alt={profile?.name || "User"}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {loading ? t("loading") : profile?.name || "Sin nombre"}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {loading ? "..." : profile?.email || ""}
                  </div>
                </div>
              </div>

              <div className="space-y-0.5">
                <button
                  onClick={() => setShowLanguageMenu(true)}
                  className="flex items-center gap-3 w-full p-2.5 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  aria-label={t("language")}
                >
                  <Globe className="h-4 w-4 text-zinc-500" />
                  <span className="flex-1">{t("language")}</span>
                  <span className="text-xs text-zinc-400">{languages.find((l) => l.code === language)?.name}</span>
                  <ChevronRight className="h-4 w-4 text-zinc-400" />
                </button>

                <button
                  onClick={handleOpenAccount}
                  className="flex items-center gap-3 w-full p-2.5 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  aria-label={t("account")}
                >
                  <User className="h-4 w-4 text-zinc-500" />
                  <span>{t("account")}</span>
                </button>

                <div className="my-2 border-t border-zinc-200 dark:border-zinc-700" />

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-3 w-full p-2.5 text-sm text-left hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg transition-colors disabled:opacity-50"
                  aria-label={t("logOut")}
                >
                  {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                  <span>{isLoggingOut ? t("loading") : t("logOut")}</span>
                </button>
              </div>
            </div>
          ) : (
            // Language selection view
            <div className="p-3">
              <button
                onClick={() => setShowLanguageMenu(false)}
                className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mb-3 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                aria-label={`Back to ${t("settings")}`}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>{t("language")}</span>
              </button>

              <div className="space-y-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`flex items-center gap-3 w-full p-3 text-sm text-left rounded-lg transition-colors ${
                      language === lang.code
                        ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                    aria-label={`${t("language")}: ${lang.name}`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                    {language === lang.code && <Check className="h-4 w-4 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>

      <AccountModal isOpen={showAccountModal} onClose={() => setShowAccountModal(false)} />
    </>
  )
}

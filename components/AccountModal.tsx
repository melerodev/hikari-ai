"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, User, Mail, Calendar, Trash2, Loader2, AlertTriangle, Info } from "lucide-react"
import { createPortal } from "react-dom"
import { useLanguage } from "@/lib/i18n/LanguageContext"
import { useUser } from "@/lib/hooks/useUser"
import { createClient } from "@/lib/supabase/client"

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
}

type Tab = "profile" | "email" | "delete"

export default function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const { t, language } = useLanguage()
  const { profile, loading: userLoading, refreshProfile } = useUser()
  const [activeTab, setActiveTab] = useState<Tab>("profile")
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Profile state
  const [fullName, setFullName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")

  // Email state
  const [newEmail, setNewEmail] = useState("")

  // Delete state
  const [deleteConfirmation, setDeleteConfirmation] = useState("")

  useEffect(() => {
    if (profile) {
      setFullName(profile.name || "")
      setDateOfBirth(profile.dateOfBirth || "")
    }
  }, [profile])

  useEffect(() => {
    if (!isOpen) {
      setActiveTab("profile")
      setMessage(null)
      setNewEmail("")
      setDeleteConfirmation("")
    }
  }, [isOpen])

  const handleUpdateProfile = async () => {
    setIsUpdating(true)
    setMessage(null)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          date_of_birth: dateOfBirth || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      await refreshProfile?.()
      setMessage({ type: "success", text: t("profileUpdated") })
    } catch (error: any) {
      setMessage({ type: "error", text: error.message })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleChangeEmail = async () => {
    if (!newEmail) return

    setIsUpdating(true)
    setMessage(null)
    try {
      const supabase = createClient()

      const { data, error } = await supabase.auth.updateUser(
        {
          email: newEmail,
        },
        {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
        },
      )

      if (error) throw error

      setMessage({ type: "success", text: t("emailVerificationSent") })
      setNewEmail("")
    } catch (error: any) {
      setMessage({ type: "error", text: error.message })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmWord = language === "es" ? "ELIMINAR" : "DELETE"
    if (deleteConfirmation !== confirmWord) return

    setIsUpdating(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      await supabase.from("conversations").delete().eq("user_id", user.id)
      await supabase.from("folders").delete().eq("user_id", user.id)
      await supabase.from("templates").delete().eq("user_id", user.id)
      await supabase.from("profiles").delete().eq("id", user.id)

      await supabase.auth.signOut()
      window.location.href = "/auth/login"
    } catch (error: any) {
      setMessage({ type: "error", text: error.message })
      setIsUpdating(false)
    }
  }

  const menuItems = [
    { id: "profile" as Tab, label: t("fullName"), icon: User },
    { id: "email" as Tab, label: t("changeEmail"), icon: Mail },
    { id: "delete" as Tab, label: t("deleteAccount"), icon: Trash2, danger: true },
  ]

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 pointer-events-auto max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-lg font-semibold">{t("accountSettings")}</h2>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  aria-label={t("closeModal")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Sidebar / Menú vertical */}
                <div className="w-48 border-r border-zinc-200 dark:border-zinc-800 p-3 flex flex-col gap-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id)
                        setMessage(null)
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                        activeTab === item.id
                          ? item.danger
                            ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                            : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                          : item.danger
                            ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                            : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                      }`}
                      aria-label={item.label}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>

                {/* Contenido */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {message && (
                    <div
                      className={`mb-4 p-3 rounded-lg text-sm ${
                        message.type === "success"
                          ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                          : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  {/* Profile Tab */}
                  {activeTab === "profile" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">{t("fullName")}</label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={t("fullNamePlaceholder")}
                          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t("dateOfBirth")}</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                          <input
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 pl-10 pr-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleUpdateProfile}
                        disabled={isUpdating}
                        className="w-full rounded-lg bg-zinc-900 dark:bg-white px-4 py-2.5 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-50 flex items-center justify-center gap-2"
                        aria-label={t("updateProfile")}
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t("updating")}
                          </>
                        ) : (
                          t("updateProfile")
                        )}
                      </button>
                    </div>
                  )}

                  {/* Email Tab */}
                  {activeTab === "email" && (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                        <div className="text-sm text-blue-600 dark:text-blue-400">{t("emailChangeInfo")}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm">
                        <span className="text-zinc-500">{t("currentEmail")}:</span>{" "}
                        <span className="font-medium">{profile?.email}</span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t("newEmail")}</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                          <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder={t("newEmailPlaceholder")}
                            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 pl-10 pr-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleChangeEmail}
                        disabled={isUpdating || !newEmail}
                        className="w-full rounded-lg bg-zinc-900 dark:bg-white px-4 py-2.5 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-50 flex items-center justify-center gap-2"
                        aria-label={t("sendVerification")}
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t("updating")}
                          </>
                        ) : (
                          t("sendVerification")
                        )}
                      </button>
                    </div>
                  )}

                  {/* Delete Tab */}
                  {activeTab === "delete" && (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 dark:bg-red-950/20">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                        <div className="text-sm text-red-600 dark:text-red-400">
                          <div className="font-medium mb-1">{t("deleteAccountTitle")}</div>
                          <div>{t("deleteAccountDesc")}</div>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm">
                        {t("deleteAccountWarning")}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t("typeToConfirm")}</label>
                        <input
                          type="text"
                          value={deleteConfirmation}
                          onChange={(e) => setDeleteConfirmation(e.target.value)}
                          placeholder={language === "es" ? "ELIMINAR" : "DELETE"}
                          className="w-full rounded-lg border border-red-300 dark:border-red-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isUpdating || deleteConfirmation !== (language === "es" ? "ELIMINAR" : "DELETE")}
                        className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        aria-label={t("deleteAccount")}
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t("loading")}
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                            {t("deleteAccount")}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )

  if (typeof window === "undefined") return null
  return createPortal(modalContent, document.body)
}

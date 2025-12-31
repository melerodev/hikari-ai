"use client"
import { motion, AnimatePresence } from "framer-motion"
import { X, AlertTriangle } from "lucide-react"
import { createPortal } from "react-dom"
import { useLanguage } from "@/lib/i18n/LanguageContext"

export default function DeleteChatModal({ isOpen, onClose, onConfirm, chatTitle }) {
  const { t } = useLanguage()

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

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
              className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 pointer-events-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{t("deleteConversationTitle")}</h2>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  aria-label={t("closeModal")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {t("deleteConversationDesc")} "{chatTitle}"? {t("thisCannotBeUndone")}
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 dark:bg-red-950/20 mb-6">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                <div className="text-sm text-red-600 dark:text-red-400">
                  <div className="font-medium mb-1">{t("warning")}</div>
                  <div>{t("deleteWarning")}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  aria-label={t("cancel")}
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                  aria-label={t("deleteConversation")}
                >
                  {t("delete")}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null
}

"use client"
import { motion, AnimatePresence } from "framer-motion"
import { X, Lightbulb } from "lucide-react"
import { useState } from "react"
import { createPortal } from "react-dom"
import { useLanguage } from "@/lib/i18n/LanguageContext"

export default function CreateFolderModal({ isOpen, onClose, onCreateFolder }) {
  const [folderName, setFolderName] = useState("")
  const { t } = useLanguage()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (folderName.trim()) {
      onCreateFolder(folderName.trim())
      setFolderName("")
      onClose()
    }
  }

  const handleCancel = () => {
    setFolderName("")
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
            onClick={handleCancel}
          />
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 pointer-events-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{t("folderName")}</h2>
                <button
                  onClick={handleCancel}
                  className="rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  aria-label={t("closeModal")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder={t("folderNamePlaceholder")}
                  className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800"
                  autoFocus
                />

                <div className="mt-4 flex items-start gap-3 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                  <Lightbulb className="h-5 w-5 text-zinc-500 mt-0.5 shrink-0" />
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    <div className="font-medium mb-1">{t("whatsAFolder")}</div>
                    <div>{t("folderDescription")}</div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    aria-label={t("cancel")}
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={!folderName.trim()}
                    className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                    aria-label={t("createFolder")}
                  >
                    {t("createFolder")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null
}

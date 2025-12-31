"use client"
import { motion, AnimatePresence } from "framer-motion"
import type React from "react"

import { X } from "lucide-react"
import { createPortal } from "react-dom"
import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/i18n/LanguageContext"

interface RenameModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (newName: string) => void
  currentName: string
  title: string
  description: string
  placeholder: string
}

export default function RenameModal({
  isOpen,
  onClose,
  onConfirm,
  currentName,
  title,
  description,
  placeholder,
}: RenameModalProps) {
  const [newName, setNewName] = useState(currentName)
  const { t } = useLanguage()

  useEffect(() => {
    if (isOpen) {
      setNewName(currentName)
    }
  }, [isOpen, currentName])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newName.trim() && newName.trim() !== currentName) {
      onConfirm(newName.trim())
      onClose()
    }
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
                <h2 className="text-lg font-semibold">{title}</h2>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  aria-label={t("closeModal")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800"
                    autoFocus
                  />
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
                    type="submit"
                    disabled={!newName.trim() || newName.trim() === currentName}
                    className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                    aria-label={t("rename")}
                  >
                    {t("rename")}
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

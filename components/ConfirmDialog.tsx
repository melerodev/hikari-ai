"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, AlertTriangle } from "lucide-react"
import { createPortal } from "react-dom"

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  actionLabel?: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  isDestructive?: boolean
  isLoading?: boolean
  warningTitle?: string
  warningMessage?: string
}

export default function ConfirmDialog({
  open,
  title,
  description,
  actionLabel = "Continue",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = false,
  isLoading = false,
  warningTitle,
  warningMessage,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onCancel()
  }

  const modalContent = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60"
            onClick={onCancel}
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
                  onClick={onCancel}
                  className="rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
              </div>

              {isDestructive && warningTitle && warningMessage && (
                <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 dark:bg-red-950/20 mb-6">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <div className="text-sm text-red-600 dark:text-red-400">
                    <div className="font-medium mb-1">{warningTitle}</div>
                    <div>{warningMessage}</div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  aria-label={cancelLabel}
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white ${
                    isDestructive
                      ? "bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                      : "bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  } disabled:opacity-50`}
                  aria-label={actionLabel}
                >
                  {isLoading ? "..." : actionLabel}
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

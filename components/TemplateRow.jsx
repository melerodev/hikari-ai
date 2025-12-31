"use client"

import { useState, useRef, useEffect } from "react"
import { FileText, MoreHorizontal, Copy, Edit3, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/lib/i18n/LanguageContext"
import ConfirmDialog from "@/components/ConfirmDialog"
import RenameModal from "@/components/RenameModal"

export default function TemplateRow({ template, onUseTemplate, onEditTemplate, onRenameTemplate, onDeleteTemplate }) {
  const [showMenu, setShowMenu] = useState(false)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const menuRef = useRef(null)
  const { t } = useLanguage()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showMenu])

  const handleUse = () => {
    onUseTemplate?.(template)
    setShowMenu(false)
  }

  const handleEdit = () => {
    onEditTemplate?.(template)
    setShowMenu(false)
  }

  const handleRename = () => {
    setShowRenameDialog(true)
    setShowMenu(false)
  }

  const handleConfirmRename = (newName) => {
    onRenameTemplate?.(template.id, newName)
    setShowRenameDialog(false)
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
    setShowMenu(false)
  }

  const handleConfirmDelete = () => {
    onDeleteTemplate?.(template.id)
    setShowDeleteDialog(false)
  }

  return (
    <>
      <div className="group">
        <div className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <button
            onClick={handleUse}
            className="flex items-center gap-2 flex-1 text-left min-w-0"
            title={`${t("useTemplate")}: ${template.snippet}`}
            aria-label={`${t("useTemplate")}: ${template.name}`}
          >
            <FileText className="h-4 w-4 text-zinc-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{template.name}</div>
              <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">{template.snippet}</div>
            </div>
          </button>

          <div className="flex items-center gap-1">
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(!showMenu)
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-opacity"
                aria-label={t("moreOptions")}
              >
                <MoreHorizontal className="h-3 w-3" />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 z-[100]"
                  >
                    <button
                      onClick={handleUse}
                      className="w-full px-3 py-1.5 text-left text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                      aria-label={t("useTemplate")}
                    >
                      <Copy className="h-3 w-3" />
                      {t("useTemplate")}
                    </button>
                    <button
                      onClick={handleEdit}
                      className="w-full px-3 py-1.5 text-left text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                      aria-label={t("edit")}
                    >
                      <Edit3 className="h-3 w-3" />
                      {t("edit")}
                    </button>
                    <button
                      onClick={handleRename}
                      className="w-full px-3 py-1.5 text-left text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      aria-label={t("rename")}
                    >
                      {t("rename")}
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                      aria-label={t("delete")}
                    >
                      <Trash2 className="h-3 w-3" />
                      {t("delete")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <RenameModal
        isOpen={showRenameDialog}
        onClose={() => setShowRenameDialog(false)}
        onConfirm={handleConfirmRename}
        currentName={template.name}
        title={t("renameTemplateTitle")}
        description={`${t("renameTemplateDesc")} "${template.name}"`}
        placeholder={t("templateName")}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        title={t("deleteTemplateTitle")}
        description={`${t("deleteTemplateDesc")} "${template.name}"?`}
        actionLabel={t("delete")}
        cancelLabel={t("cancel")}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
        isDestructive={true}
        warningTitle={t("warning")}
        warningMessage={t("deleteTemplateWarning")}
      />
    </>
  )
}

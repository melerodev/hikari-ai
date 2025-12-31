"use client"
import { Star, Trash2, FolderInput, MoreHorizontal, Edit3 } from "lucide-react"
import { cls, timeAgo } from "./utils"
import DeleteChatModal from "./DeleteChatModal"
import MoveToFolderModal from "./MoveToFolderModal"
import RenameModal from "./RenameModal"
import { useState, useRef, useEffect } from "react"
import { useLanguage } from "@/lib/i18n/LanguageContext"
import { motion, AnimatePresence } from "framer-motion"

export default function ConversationRow({
  data,
  active,
  onSelect,
  onTogglePin,
  showMeta,
  onDelete,
  onMoveToFolder,
  onFolderCreated,
  onRename,
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showMoveToFolder, setShowMoveToFolder] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
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

  const handleDelete = (e) => {
    e?.stopPropagation()
    setShowDeleteConfirm(true)
    setShowMenu(false)
  }

  const handleConfirmDelete = async () => {
    onDelete?.(data.id)
  }

  const handleMoveToFolder = (e) => {
    e?.stopPropagation()
    setShowMoveToFolder(true)
    setShowMenu(false)
  }

  const handleConfirmMove = async (conversationId, folderId) => {
    onMoveToFolder?.(conversationId, folderId)
  }

  const handleTogglePin = (e) => {
    e?.stopPropagation()
    onTogglePin()
    setShowMenu(false)
  }

  const handleRename = (e) => {
    e?.stopPropagation()
    setShowRenameDialog(true)
    setShowMenu(false)
  }

  const handleConfirmRename = (newName) => {
    if (newName.trim() && newName !== data.title) {
      onRename?.(data.id, newName.trim())
    }
    setShowRenameDialog(false)
  }

  return (
    <>
      <div className="group relative">
        <button
          onClick={onSelect}
          className={cls(
            "-mx-1 flex w-[calc(100%+8px)] items-center gap-2 rounded-lg px-2 py-2 text-left",
            active
              ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800/60 dark:text-zinc-100"
              : "hover:bg-zinc-100 dark:hover:bg-zinc-800",
          )}
          title={data.title}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {data.pinned && (
                <Star className="h-3 w-3 shrink-0 fill-zinc-800 text-zinc-800 dark:fill-zinc-200 dark:text-zinc-200" />
              )}
              <span className="truncate text-sm font-medium tracking-tight">{data.title}</span>
              <span className="shrink-0 text-[11px] text-zinc-500 dark:text-zinc-400">{timeAgo(data.updated_at)}</span>
            </div>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="rounded-md p-1 text-zinc-500 opacity-0 transition group-hover:opacity-100 hover:bg-zinc-200/50 dark:text-zinc-300 dark:hover:bg-zinc-700/60"
              aria-label={t("options")}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 z-[300]"
                >
                  <button
                    onClick={handleTogglePin}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                  >
                    <Star className={`h-3 w-3 ${data.pinned ? "fill-current" : ""}`} />
                    {data.pinned ? t("unpin") : t("pin")}
                  </button>
                  <button
                    onClick={handleRename}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                  >
                    <Edit3 className="h-3 w-3" />
                    {t("rename")}
                  </button>
                  <button
                    onClick={handleMoveToFolder}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                  >
                    <FolderInput className="h-3 w-3" />
                    {t("moveToFolder")}
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                  >
                    <Trash2 className="h-3 w-3" />
                    {t("delete")}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </button>

        <div className="pointer-events-none absolute left-[calc(100%+6px)] top-1 hidden w-64 rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-700 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 md:group-hover:block">
          <div className="line-clamp-6 whitespace-pre-wrap">{data.preview}</div>
        </div>
      </div>

      <DeleteChatModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        chatTitle={data.title}
      />

      <MoveToFolderModal
        isOpen={showMoveToFolder}
        onClose={() => setShowMoveToFolder(false)}
        onConfirm={handleConfirmMove}
        chatTitle={data.title}
        conversationId={data.id}
        onFolderCreated={onFolderCreated}
      />

      <RenameModal
        isOpen={showRenameDialog}
        onClose={() => setShowRenameDialog(false)}
        onConfirm={handleConfirmRename}
        currentName={data.title}
        title={t("renameConversationTitle")}
        description={t("renameConversationDesc")}
        placeholder={t("conversationName")}
      />
    </>
  )
}

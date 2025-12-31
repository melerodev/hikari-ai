"use client"
import { motion, AnimatePresence } from "framer-motion"
import { X, Folder, FolderPlus, FolderMinus, Check, Loader2, Search } from "lucide-react"
import { createPortal } from "react-dom"
import { useState, useEffect, useMemo } from "react"
import { useLanguage } from "@/lib/i18n/LanguageContext"

export default function MoveToFolderModal({ isOpen, onClose, onConfirm, chatTitle, conversationId, onFolderCreated }) {
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [isMoving, setIsMoving] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { t } = useLanguage()

  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return folders
    return folders.filter((folder) => folder.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [folders, searchQuery])

  useEffect(() => {
    if (isOpen) {
      fetchFolders()
      setSearchQuery("")
    }
  }, [isOpen])

  const fetchFolders = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/folders")
      const data = await response.json()
      setFolders(data || [])
    } catch (error) {
      console.error("Error fetching folders:", error)
      setFolders([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName.trim() }),
      })

      if (response.ok) {
        const newFolder = await response.json()
        setFolders([newFolder, ...folders])
        setSelectedFolder({ id: newFolder.id, name: newFolder.name })
        setNewFolderName("")
        setShowNewFolder(false)

        if (onFolderCreated) {
          onFolderCreated(newFolder)
        }

        setTimeout(() => {
          handleConfirm()
        }, 100)
      }
    } catch (error) {
      console.error("Error creating folder:", error)
    }
  }

  const handleConfirm = async () => {
    if (!selectedFolder) return

    setIsMoving(true)
    try {
      const folderId = selectedFolder === "none" ? null : selectedFolder.id
      await onConfirm(conversationId, folderId)
      onClose()
    } catch (error) {
      console.error("Error moving conversation:", error)
    } finally {
      setIsMoving(false)
    }
  }

  const handleClose = () => {
    setSelectedFolder(null)
    setNewFolderName("")
    setShowNewFolder(false)
    setSearchQuery("")
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
            onClick={handleClose}
          />
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 pointer-events-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{t("moveToFolderTitle")}</h2>
                <button
                  onClick={handleClose}
                  className="rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  aria-label={t("closeModal")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {t("selectFolderFor")} "{chatTitle}"
                </p>
              </div>

              {!loading && folders.length > 0 && (
                <div className="mb-3 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("searchFolders")}
                    className="w-full rounded-lg border border-zinc-300 bg-transparent py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:placeholder:text-zinc-500"
                    aria-label={t("searchFolders")}
                  />
                </div>
              )}

              <div className="mb-4 max-h-64 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                  </div>
                ) : (
                  <div className="space-y-1">
                    {!searchQuery.trim() && (
                      <button
                        onClick={() => setSelectedFolder("none")}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                          selectedFolder === "none"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                            : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                        aria-label={t("noFolder")}
                      >
                        <FolderMinus className="h-5 w-5 text-zinc-400" />
                        <span className="flex-1 text-sm font-medium">{t("noFolder")}</span>
                        {selectedFolder === "none" && <Check className="h-4 w-4" />}
                      </button>
                    )}

                    {filteredFolders.map((folder) => (
                      <button
                        key={folder.id}
                        onClick={() => setSelectedFolder({ id: folder.id, name: folder.name })}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                          selectedFolder?.id === folder.id
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                            : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                        aria-label={`${t("select")} ${folder.name}`}
                      >
                        <Folder className="h-5 w-5 text-blue-500" />
                        <span className="flex-1 text-sm font-medium truncate">{folder.name}</span>
                        {selectedFolder?.id === folder.id && <Check className="h-4 w-4" />}
                      </button>
                    ))}

                    {searchQuery.trim() && filteredFolders.length === 0 && (
                      <p className="py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                        {t("noFoldersMatch")} "{searchQuery}"
                      </p>
                    )}

                    {folders.length === 0 && !showNewFolder && (
                      <p className="py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                        {t("noFoldersYetCreate")}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                {showNewFolder ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder={t("folderName")}
                      className="flex-1 rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateFolder()
                        if (e.key === "Escape") setShowNewFolder(false)
                      }}
                      aria-label={t("folderName")}
                    />
                    <button
                      onClick={handleCreateFolder}
                      disabled={!newFolderName.trim()}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                      aria-label={t("create")}
                    >
                      {t("create")}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNewFolder(true)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    aria-label={t("createNewFolder")}
                  >
                    <FolderPlus className="h-4 w-4" />
                    <span>{t("createNewFolder")}</span>
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  aria-label={t("cancel")}
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!selectedFolder || isMoving}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
                  aria-label={t("moveToFolder")}
                >
                  {isMoving ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("moving")}
                    </span>
                  ) : (
                    t("move")
                  )}
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

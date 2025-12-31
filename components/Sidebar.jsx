"use client"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageSquare,
  Star,
  FolderOpen,
  Search,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  FileText,
  Sun,
  Moon,
} from "lucide-react"
import { useState } from "react"
import { useLanguage } from "@/lib/i18n/LanguageContext"
import SidebarSection from "./SidebarSection"
import ConversationRow from "./ConversationRow"
import FolderRow from "./FolderRow"
import TemplateRow from "./TemplateRow"
import SettingsPopover from "./SettingsPopover"
import CreateFolderModal from "./CreateFolderModal"
import CreateTemplateModal from "./CreateTemplateModal"
import SearchModal from "./SearchModal"
import { useUser } from "@/lib/hooks/useUser"
import { cls } from "./utils"
import { API_BASE_URL } from "../config"

export default function Sidebar({
  open,
  onClose,
  theme,
  setTheme,
  collapsed,
  setCollapsed,
  conversations,
  pinned,
  recent,
  folders,
  folderCounts,
  setFolders,
  selectedId,
  onSelect,
  togglePin,
  onDeleteConversation,
  query,
  setQuery,
  searchRef,
  createFolder,
  createNewChat,
  templates = [],
  setTemplates = () => {},
  onUseTemplate = () => {},
  sidebarCollapsed = false,
  setSidebarCollapsed = () => {},
  onUpdateConversationFolder = () => {}, // Added prop for updating conversation folder
  onUpdateConversationTitle = () => {}, // Added prop for updating conversation title
}) {
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const { profile, loading: userLoading } = useUser()
  const { t } = useLanguage()

  const getConversationsByFolder = (folderId) => {
    return conversations.filter((conv) => conv.folder_id === folderId)
  }

  const handleCreateFolder = async (folderName) => {
    createFolder(folderName)
  }

  const handleDeleteFolder = async (folderName) => {
    const folder = folders.find((f) => f.name === folderName)
    if (folder?.id) {
      try {
        const response = await fetch(`${API_BASE_URL}/folders?id=${folder.id}`, {
          method: "DELETE",
        })
        if (response.ok) {
          setFolders((prev) => prev.filter((f) => f.name !== folderName))
        }
      } catch (error) {
        console.error("Error deleting folder from database:", error)
      }
    }
  }

  const handleRenameFolder = async (oldName, newName) => {
    const folder = folders.find((f) => f.name === oldName)
    if (folder?.id) {
      try {
        const response = await fetch(`${API_BASE_URL}/folders`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: folder.id,
            name: newName,
          }),
        })
        if (!response.ok) {
          console.error("Failed to rename folder")
          return
        }
      } catch (error) {
        console.error("Error renaming folder in database:", error)
        return
      }
    }

    // Only update the folder name in folders array, conversations use folder_id not folder name
    setFolders((prev) => prev.map((f) => (f.name === oldName ? { ...f, name: newName } : f)))
  }

  const handleCreateTemplate = async (templateData) => {
    if (editingTemplate) {
      try {
        const response = await fetch(`${API_BASE_URL}/templates`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingTemplate.id,
            name: templateData.name,
            content: templateData.content,
            snippet: templateData.snippet,
          }),
        })
        if (response.ok) {
        }
      } catch (error) {
        console.error("Error updating template in database:", error)
      }

      const updatedTemplates = templates.map((t) =>
        t.id === editingTemplate.id ? { ...templateData, id: editingTemplate.id } : t,
      )
      setTemplates(updatedTemplates)
      setEditingTemplate(null)
    } else {
      try {
        const response = await fetch(`${API_BASE_URL}/templates`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: templateData.name,
            content: templateData.content,
            snippet: templateData.snippet,
          }),
        })
        if (response.ok) {
          const savedTemplate = await response.json()
          const newTemplate = {
            ...templateData,
            id: savedTemplate.id,
          }
          setTemplates([...templates, newTemplate])
        }
      } catch (error) {
        console.error("Error creating template in database:", error)
        const newTemplate = {
          ...templateData,
          id: Date.now().toString(),
        }
        setTemplates([...templates, newTemplate])
      }
    }
    setShowCreateTemplateModal(false)
  }

  const handleEditTemplate = (template) => {
    setEditingTemplate(template)
    setShowCreateTemplateModal(true)
  }

  const handleRenameTemplate = async (templateId, newName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/templates`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: templateId,
          name: newName,
        }),
      })
      if (!response.ok) {
        console.error("Failed to rename template")
        return
      }
    } catch (error) {
      console.error("Error renaming template in database:", error)
      return
    }

    const updatedTemplates = templates.map((t) =>
      t.id === templateId ? { ...t, name: newName, updatedAt: new Date().toISOString() } : t,
    )
    setTemplates(updatedTemplates)
  }

  const handleDeleteTemplate = async (templateId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/templates?id=${templateId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        const updatedTemplates = templates.filter((t) => t.id !== templateId)
        setTemplates(updatedTemplates)
      }
    } catch (error) {
      console.error("Error deleting template from database:", error)
    }
  }

  const handleUseTemplate = (template) => {
    onUseTemplate(template)
  }

  const handleMoveConversation = async (conversationId, folderId) => {
    try {
      const response = await fetch("/api/conversations/move-to-folder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, folderId }),
      })

      const data = await response.json()

      if (response.ok) {
        if (onUpdateConversationFolder) {
          onUpdateConversationFolder(conversationId, folderId)
        }
      } else {
        console.error("Failed to move conversation to folder:", data.error)
      }
    } catch (error) {
      console.error("Error moving conversation to folder:", error)
    }
  }

  const handleRenameConversation = async (conversationId, newTitle) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: conversationId, title: newTitle }),
      })
      if (response.ok) {
        onUpdateConversationTitle?.(conversationId, newTitle)
      }
    } catch (error) {
      console.error("Error renaming conversation:", error)
    }
  }

  const handleFolderCreatedFromModal = (newFolder) => {
    if (setFolders && newFolder) {
      setFolders((prev) => [...prev, newFolder])
    }
  }

  const handleToggleSection = (section) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  if (sidebarCollapsed) {
    return (
      <>
        <motion.aside
          initial={{ width: 320 }}
          animate={{ width: 64 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="z-50 flex h-full shrink-0 flex-col border-r border-zinc-200/60 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-center justify-center border-b border-zinc-200/60 px-3 py-3 dark:border-zinc-800">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="rounded-xl p-2 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-zinc-800"
              aria-label={t("openSidebar")}
              title={t("openSidebar")}
            >
              <PanelLeftOpen className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center justify-center border-b border-zinc-200/60 px-3 py-3 dark:border-zinc-800">
            <div className="grid h-10 w-10 place-items-center rounded-full border border-zinc-900 pb-[5.5px] text-zinc-900 dark:border-white dark:text-white select-none pointer-events-none">
              <span className="text-2xl font-bold leading-none">光</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 pt-4">
            <button
              onClick={createNewChat}
              className="rounded-xl p-2 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-zinc-800"
              title={t("newChat")}
              aria-label={t("newConversation")}
            >
              <Plus className="h-5 w-5" />
            </button>

            <button
              onClick={() => setShowSearchModal(true)}
              className="rounded-xl p-2 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-zinc-800"
              title={t("search")}
              aria-label={t("searchConversations")}
            >
              <Search className="h-5 w-5" />
            </button>

            <div className="mt-auto mb-4">
              <SettingsPopover>
                <button
                  className="rounded-xl p-2 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-zinc-800"
                  aria-label={t("settings")}
                  title={t("settings")}
                >
                  <Settings className="h-5 w-5" />
                </button>
              </SettingsPopover>
            </div>
          </div>
        </motion.aside>

        {/* Modals rendered outside sidebar */}
        <CreateFolderModal
          isOpen={showCreateFolderModal}
          onClose={() => setShowCreateFolderModal(false)}
          onCreateFolder={handleCreateFolder}
        />

        <CreateTemplateModal
          isOpen={showCreateTemplateModal}
          onClose={() => {
            setShowCreateTemplateModal(false)
            setEditingTemplate(null)
          }}
          onCreateTemplate={handleCreateTemplate}
          editingTemplate={editingTemplate}
        />

        <SearchModal
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          conversations={conversations}
          selectedId={selectedId}
          onSelect={onSelect}
          togglePin={togglePin}
          createNewChat={createNewChat}
        />
      </>
    )
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(open || typeof window !== "undefined") && (
          <motion.aside
            key="sidebar"
            initial={{ x: -340 }}
            animate={{ x: open ? 0 : 0 }}
            exit={{ x: -340 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className={cls(
              "z-50 flex h-full w-80 shrink-0 flex-col border-r border-zinc-200/60 bg-white dark:border-zinc-800 dark:bg-zinc-900",
              "fixed inset-y-0 left-0 md:static md:translate-x-0",
            )}
          >
            <div className="flex items-center gap-2 border-b border-zinc-200/60 px-3 py-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="grid h-10 w-10 place-items-center rounded-full border border-zinc-900 pb-[5.4px] text-zinc-900 dark:border-white dark:text-white select-none pointer-events-none">
                  <span className="text-2xl font-bold leading-none">光</span>
                </div>
                <div className="text-sm font-semibold tracking-tight">Hikari</div>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="rounded-xl p-2 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-zinc-800"
                  aria-label={t("closeSidebar")}
                >
                  <PanelLeftClose className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="px-3 pt-3">
              <label htmlFor="search" className="sr-only">
                {t("search")}
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  id="search"
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("search") + "…"}
                  onClick={() => setShowSearchModal(true)}
                  onFocus={() => setShowSearchModal(true)}
                  className="w-full rounded-full border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950/50"
                />
              </div>
            </div>

            <div className="px-3 pt-3">
              <button
                onClick={createNewChat}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-white dark:text-zinc-900"
                title={t("newChat") + " (⌘N)"}
                aria-label={t("newConversation")}
              >
                <Plus className="h-4 w-4" /> {t("startNewChat")}
              </button>
            </div>

            <nav className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 pb-4">
              <SidebarSection
                icon={<Star className="h-4 w-4" />}
                title={t("pinnedChats")}
                collapsed={collapsed.pinned}
                onToggle={() => handleToggleSection("pinned")}
              >
                {pinned.length === 0 ? (
                  <div className="select-none rounded-lg border border-dashed border-zinc-200 px-3 py-3 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    {t("pinEmptyMessage")}
                  </div>
                ) : (
                  pinned.map((c) => (
                    <ConversationRow
                      key={c.id}
                      data={c}
                      active={c.id === selectedId}
                      onSelect={() => onSelect(c.id)}
                      onTogglePin={() => togglePin(c.id)}
                      onDelete={onDeleteConversation}
                      onFolderCreated={handleFolderCreatedFromModal}
                      onMoveToFolder={handleMoveConversation} // Added prop for moving conversation to folder
                      onRename={handleRenameConversation} // Added prop for renaming conversation
                    />
                  ))
                )}
              </SidebarSection>

              <SidebarSection
                icon={<MessageSquare className="h-4 w-4" />}
                title={t("recent")}
                collapsed={collapsed.recent}
                onToggle={() => handleToggleSection("recent")}
              >
                {recent.length === 0 ? (
                  <div className="select-none rounded-lg border border-dashed border-zinc-200 px-3 py-3 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    {t("recentEmptyMessage")}
                  </div>
                ) : (
                  recent.map((c) => (
                    <ConversationRow
                      key={c.id}
                      data={c}
                      active={c.id === selectedId}
                      onSelect={() => onSelect(c.id)}
                      onTogglePin={() => togglePin(c.id)}
                      showMeta
                      onDelete={onDeleteConversation}
                      onFolderCreated={handleFolderCreatedFromModal}
                      onMoveToFolder={handleMoveConversation} // Added prop for moving conversation to folder
                      onRename={handleRenameConversation} // Added prop for renaming conversation
                    />
                  ))
                )}
              </SidebarSection>

              <SidebarSection
                icon={<FolderOpen className="h-4 w-4" />}
                title={t("folders")}
                collapsed={collapsed.folders}
                onToggle={() => handleToggleSection("folders")}
              >
                <div className="-mx-1">
                  <button
                    onClick={() => setShowCreateFolderModal(true)}
                    className="mb-2 inline-flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    aria-label={t("createNewFolder")}
                  >
                    <Plus className="h-4 w-4" /> {t("createFolder")}
                  </button>

                  {folders.length === 0 ? (
                    <div className="select-none rounded-lg border border-dashed border-zinc-200 px-3 py-3 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                      {t("foldersEmptyMessage")}
                    </div>
                  ) : (
                    folders.map((f) => (
                      <FolderRow
                        key={f.id}
                        name={f.name}
                        count={folderCounts[f.id] || 0}
                        conversations={getConversationsByFolder(f.id)}
                        selectedId={selectedId}
                        onSelect={onSelect}
                        togglePin={togglePin}
                        onDeleteConversation={onDeleteConversation}
                        onDeleteFolder={() => {
                          const folderName = f.name
                          handleDeleteFolder(folderName)
                        }}
                        onRenameFolder={handleRenameFolder}
                        onMoveToFolder={handleMoveConversation} // Added prop for moving conversation to folder
                        onFolderCreated={handleFolderCreatedFromModal}
                        onRenameConversation={handleRenameConversation} // Added prop for renaming conversation
                      />
                    ))
                  )}
                </div>
              </SidebarSection>

              <SidebarSection
                icon={<FileText className="h-4 w-4" />} // Replaced StarOff with FileText for better template metaphor
                title={t("templates")}
                collapsed={collapsed.templates}
                onToggle={() => handleToggleSection("templates")}
              >
                <div className="-mx-1">
                  <button
                    onClick={() => {
                      setEditingTemplate(null)
                      setShowCreateTemplateModal(true)
                    }}
                    className="mb-2 inline-flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    aria-label={t("createNewTemplate")}
                  >
                    <Plus className="h-4 w-4" /> {t("createTemplate")}
                  </button>

                  {templates.length === 0 ? (
                    <div className="select-none rounded-lg border border-dashed border-zinc-200 px-3 py-3 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                      {t("templatesEmptyMessage")}
                    </div>
                  ) : (
                    templates.map((template) => (
                      <TemplateRow
                        key={template.id}
                        template={template}
                        onUseTemplate={handleUseTemplate}
                        onEditTemplate={handleEditTemplate}
                        onRenameTemplate={handleRenameTemplate}
                        onDeleteTemplate={() => {
                          const templateId = template.id
                          handleDeleteTemplate(templateId)
                        }}
                      />
                    ))
                  )}
                </div>
              </SidebarSection>
            </nav>

            <div className="border-t border-zinc-200/60 px-3 py-3 dark:border-zinc-800">
              <div className="flex items-center gap-2 mb-2">
                <button
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg p-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                  onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                  aria-label={t("toggleTheme")}
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  <span>{theme === "dark" ? t("light") : t("dark")}</span>
                </button>
              </div>
              <SettingsPopover theme={theme} setTheme={setTheme} sidebarCollapsed={true}>
                <button
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  aria-label={t("settings")}
                >
                  <div className="relative h-8 w-8 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700">
                    <img
                      src={profile?.avatarUrl || `https://www.gravatar.com/avatar/?d=mp&s=64`}
                      alt={profile?.name || "User"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium truncate">
                      {userLoading ? t("loading") : profile?.name || "Usuario"}
                    </div>
                    <div className="text-xs text-zinc-500 truncate">{userLoading ? "..." : profile?.email || ""}</div>
                  </div>
                  <Settings className="h-4 w-4 text-zinc-400" />
                </button>
              </SettingsPopover>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Modals rendered outside AnimatePresence so they render in both collapsed and expanded states */}
      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onCreateFolder={handleCreateFolder}
      />

      <CreateTemplateModal
        isOpen={showCreateTemplateModal}
        onClose={() => {
          setShowCreateTemplateModal(false)
          setEditingTemplate(null)
        }}
        onCreateTemplate={handleCreateTemplate}
        editingTemplate={editingTemplate}
      />

      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        conversations={conversations}
        selectedId={selectedId}
        onSelect={onSelect}
        togglePin={togglePin}
        createNewChat={createNewChat}
      />
    </>
  )
}

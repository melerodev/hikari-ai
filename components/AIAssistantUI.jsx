"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"
import ChatPane from "./ChatPane"
import { sendChatMessage } from "@/lib/ai/chat"
import { useUser } from "@/lib/hooks/useUser"
import { supabase } from "@/lib/supabase"

const API_BASE_URL = "/api"

export default function AIAssistantUI() {
  const { profile } = useUser()

  const [theme, setTheme] = useState(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("theme")
    if (saved) return saved
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)
      return "dark"
    return "light"
  })

  useEffect(() => {
    try {
      if (theme === "dark") document.documentElement.classList.add("dark")
      else document.documentElement.classList.remove("dark")
      document.documentElement.setAttribute("data-theme", theme)
      document.documentElement.style.colorScheme = theme
      localStorage.setItem("theme", theme)
    } catch {}
  }, [theme])

  useEffect(() => {
    try {
      const media = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)")
      if (!media) return
      const listener = (e) => {
        const saved = localStorage.getItem("theme")
        if (!saved) setTheme(e.matches ? "dark" : "light")
      }
      media.addEventListener("change", listener)
      return () => media.removeEventListener("change", listener)
    } catch {}
  }, [])

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const raw = localStorage.getItem("sidebar-collapsed")
      return raw ? JSON.parse(raw) : { pinned: true, recent: false, folders: true, templates: true }
    } catch {
      return { pinned: true, recent: false, folders: true, templates: true }
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed))
    } catch {}
  }, [collapsed])

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem("sidebar-collapsed-state")
      return saved ? JSON.parse(saved) : false
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem("sidebar-collapsed-state", JSON.stringify(sidebarCollapsed))
    } catch {}
  }, [sidebarCollapsed])

  const [conversations, setConversations] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [templates, setTemplates] = useState([])
  const [folders, setFolders] = useState([])
  const [query, setQuery] = useState("")
  const searchRef = useRef(null)

  const [isThinking, setIsThinking] = useState(false)
  const [thinkingConvId, setThinkingConvId] = useState(null)

  const [selectedModel, setSelectedModel] = useState(() => {
    try {
      const saved = localStorage.getItem("hikari_selected_model")
      return saved || "gpt-5"
    } catch {
      return "gpt-5"
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem("hikari_selected_model", selectedModel)
    } catch {}
  }, [selectedModel])

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const { data, error } = await supabase
          .from("conversations")
          .select("*")
          .order("updated_at", { ascending: false })
        if (error) throw error

        const parsedConversations = data.map((conv) => {
          let messages = []
          try {
            messages = JSON.parse(conv.content || "[]")
          } catch (e) {
            console.error("Error parsing messages for conversation:", conv.conversation_id, e)
          }

          return {
            id: conv.conversation_id,
            title: conv.title || "New Chat",
            preview: conv.preview || "",
            messages: messages,
            messageCount: conv.message_count || messages.length,
            pinned: conv.pinned || false,
            folder_id: conv.folder_id || null,
            updatedAt: conv.updated_at,
            model: conv.model || "gpt-5",
          }
        })

        setConversations(parsedConversations)
      } catch (error) {
        console.error("Error loading conversations:", error)
        setConversations([])
      }
    }
    loadConversations()
  }, [])

  useEffect(() => {
    const loadFoldersAndTemplates = async () => {
      try {
        const [foldersRes, templatesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/folders`),
          fetch(`${API_BASE_URL}/templates`),
        ])

        if (foldersRes.ok) {
          const folders = await foldersRes.json()
          setFolders(folders)
        }

        if (templatesRes.ok) {
          const templates = await templatesRes.json()
          setTemplates(templates)
        }
      } catch (error) {}
    }
    loadFoldersAndTemplates()
  }, [])

  useEffect(() => {
    const syncFolders = async () => {
      try {
        for (const folder of folders) {
          if (!folder.id) {
            const { data, error } = await supabase.from("folders").insert([folder]).select().single()
            if (!error && data) {
              setFolders((prev) => prev.map((f) => (f.name === folder.name ? data : f)))
            }
          }
        }
      } catch (error) {}
    }

    if (folders.length > 0) {
      const timer = setTimeout(syncFolders, 1000)
      return () => clearTimeout(timer)
    }
  }, [folders])

  useEffect(() => {
    const syncTemplates = async () => {
      try {
        for (const template of templates) {
          if (!template.id) {
            const { data, error } = await supabase.from("templates").insert([template]).select().single()
            if (!error && data) {
              setTemplates((prev) => prev.map((t) => (t.name === template.name ? data : t)))
            }
          }
        }
      } catch (error) {}
    }

    if (templates.length > 0) {
      const timer = setTimeout(syncTemplates, 1000)
      return () => clearTimeout(timer)
    }
  }, [templates])

  const filtered = useMemo(() => {
    if (!query.trim()) return conversations
    const q = query.toLowerCase()
    return conversations.filter((c) => c.title.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q))
  }, [conversations, query])

  const pinned = filtered.filter((c) => c.pinned).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))

  const recent = filtered
    .filter((c) => !c.pinned && !c.folder_id)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 10)

  const folderCounts = React.useMemo(() => {
    const map = Object.fromEntries(folders.map((f) => [f.id, 0]))
    for (const c of conversations) if (c.folder_id && map[c.folder_id] != null) map[c.folder_id] += 1
    return map
  }, [conversations, folders])

  async function togglePin(id) {
    const conv = conversations.find((c) => c.id === id)
    if (!conv) return

    const newPinned = !conv.pinned

    try {
      // First try to create/update the full conversation
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: id,
          title: conv.title || "New Chat",
          preview: conv.preview || "",
          content: JSON.stringify(conv.messages || []),
          pinned: newPinned,
          folder_id: conv.folder_id || null,
          message_count: conv.messageCount || 0,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update pin status in database")
      }

      setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, pinned: newPinned } : c)))
    } catch (error) {
      console.error("Error updating conversation pin status:", error)
    }
  }

  async function handleDeleteConversation(id) {
    const deletedConversation = conversations.find((c) => c.id === id)

    setConversations((prev) => prev.filter((c) => c.id !== id))

    if (selectedId === id) {
      setSelectedId(null)
    }

    try {
      const { error } = await supabase.from("conversations").delete().eq("conversation_id", id)
      if (error) throw error
    } catch (error) {
      console.error("Error deleting conversation from database:", error)
      if (deletedConversation) {
        setConversations((prev) => [deletedConversation, ...prev])
        if (selectedId === null) {
          setSelectedId(id)
        }
      }
    }
  }

  function createNewChat() {
    setSelectedId(null)
    setSidebarOpen(false)
  }

  async function createFolder(folderName) {
    if (!folderName || !folderName.trim()) return
    if (folders.some((f) => f.name.toLowerCase() === folderName.toLowerCase())) {
      alert("Folder already exists.")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/folders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: folderName.trim() }),
      })

      if (response.ok) {
        const newFolder = await response.json()
        setFolders((prev) => [...prev, newFolder])
      } else {
        console.error("Failed to create folder:", response.statusText)
        alert("Failed to create folder. Please try again.")
      }
    } catch (error) {
      console.error("Error creating folder:", error)
      alert("Failed to create folder. Please try again.")
    }
  }

  async function sendMessage(convId, content) {
    if (!content.trim()) return

    if (!convId) {
      const id = Math.random().toString(36).slice(2)
      const now = new Date().toISOString()
      const userMsg = { id: Math.random().toString(36).slice(2), role: "user", content, createdAt: now }

      const item = {
        id,
        title: content.slice(0, 50) || "New Chat",
        updatedAt: now,
        messageCount: 1,
        preview: content.slice(0, 80),
        pinned: false,
        folder_id: null,
        messages: [userMsg],
        model: selectedModel,
      }

      setConversations((prev) => [item, ...prev])
      setSelectedId(id)
      setSidebarOpen(false)

      try {
        await fetch(`${API_BASE_URL}/conversations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversation_id: id,
            title: item.title,
            preview: item.preview,
            content: JSON.stringify([userMsg]),
            pinned: false,
            folder_id: null,
            message_count: 1,
          }),
        })
      } catch (error) {
        console.error("Error saving new conversation to database:", error)
      }

      setIsThinking(true)
      setThinkingConvId(id)

      try {
        const response = await sendChatMessage(selectedModel, [{ role: "user", content }])

        setIsThinking(false)
        setThinkingConvId(null)

        const asstMsg = {
          id: Math.random().toString(36).slice(2),
          role: "assistant",
          content: response.content,
          createdAt: new Date().toISOString(),
        }

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== id) return c
            const msgs = [...c.messages, asstMsg]
            return {
              ...c,
              messages: msgs,
              updatedAt: now,
              messageCount: msgs.length,
            }
          }),
        )

        try {
          await fetch(`${API_BASE_URL}/conversations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              conversation_id: id,
              title: item.title,
              preview: asstMsg.content.slice(0, 80),
              content: JSON.stringify([userMsg, asstMsg]),
              pinned: false,
              folder_id: null,
              message_count: 2,
            }),
          })
        } catch (error) {
          console.error("Error updating conversation in database:", error)
        }
      } catch (error) {
        console.error("Error getting AI response:", error)
        setIsThinking(false)
        setThinkingConvId(null)

        let errorMessage = "Lo siento, hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo."

        if (error.message?.includes("RATE_LIMIT_EXCEEDED")) {
          errorMessage =
            "⏱️ Se ha alcanzado el límite de solicitudes por minuto. Por favor, espera un momento antes de continuar la conversación."
        } else if (error.message?.includes("API error: 429")) {
          errorMessage =
            "⏱️ Se ha alcanzado el límite de solicitudes por minuto. Por favor, espera un momento antes de continuar la conversación."
        } else if (error.message?.includes("no está disponible")) {
          errorMessage = error.message
        }

        const errorMsg = {
          id: Math.random().toString(36).slice(2),
          role: "assistant",
          content: errorMessage,
          createdAt: new Date().toISOString(),
        }

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== id) return c
            const msgs = [...c.messages, errorMsg]
            return {
              ...c,
              messages: msgs,
              updatedAt: new Date().toISOString(),
              messageCount: msgs.length,
            }
          }),
        )
      }

      return
    }

    const now = new Date().toISOString()
    const userMsg = { id: Math.random().toString(36).slice(2), role: "user", content, createdAt: now }

    const currentConv = conversations.find((c) => c.id === convId)
    const existingMessages = currentConv?.messages || []

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c
        const msgs = [...(c.messages || []), userMsg]
        return {
          ...c,
          messages: msgs,
          updatedAt: now,
          messageCount: msgs.length,
          preview: content.slice(0, 80),
        }
      }),
    )

    setIsThinking(true)
    setThinkingConvId(convId)

    try {
      const messagesForAI = [
        ...existingMessages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content },
      ]

      const response = await sendChatMessage(selectedModel, messagesForAI)

      setIsThinking(false)
      setThinkingConvId(null)

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c
          const asstMsg = {
            id: Math.random().toString(36).slice(2),
            role: "assistant",
            content: response.content,
            createdAt: new Date().toISOString(),
          }
          const msgs = [...(c.messages || []), asstMsg]

          return {
            ...c,
            messages: msgs,
            updatedAt: new Date().toISOString(),
            messageCount: msgs.length,
            preview: asstMsg.content.slice(0, 80),
          }
        }),
      )

      const updatedConv = conversations.find((c) => c.id === convId)
      if (updatedConv) {
        try {
          const allMessages = [
            ...existingMessages,
            userMsg,
            {
              id: Math.random().toString(36).slice(2),
              role: "assistant",
              content: response.content,
              createdAt: new Date().toISOString(),
            },
          ]
          await fetch(`${API_BASE_URL}/conversations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              conversation_id: convId,
              title: updatedConv.title,
              preview: response.content.slice(0, 80),
              content: JSON.stringify(allMessages),
              pinned: updatedConv.pinned,
              folder_id: updatedConv.folder_id,
              message_count: allMessages.length,
            }),
          })
        } catch (error) {
          console.error("Error saving conversation to database:", error)
        }
      }
    } catch (error) {
      console.error("Error getting AI response:", error)
      setIsThinking(false)
      setThinkingConvId(null)

      let errorMessage = "Lo siento, hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo."

      if (error.message?.includes("RATE_LIMIT_EXCEEDED")) {
        errorMessage =
          "⏱️ Se ha alcanzado el límite de solicitudes por minuto. Por favor, espera un momento antes de continuar la conversación."
      } else if (error.message?.includes("API error: 429")) {
        errorMessage =
          "⏱️ Se ha alcanzado el límite de solicitudes por minuto. Por favor, espera un momento antes de continuar la conversación."
      } else if (error.message?.includes("no está disponible")) {
        errorMessage = error.message
      }

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c
          const errorMsg = {
            id: Math.random().toString(36).slice(2),
            role: "assistant",
            content: errorMessage,
            createdAt: new Date().toISOString(),
          }
          const msgs = [...(c.messages || []), errorMsg]

          return {
            ...c,
            messages: msgs,
            updatedAt: new Date().toISOString(),
            messageCount: msgs.length,
            preview: errorMsg.content.slice(0, 80),
          }
        }),
      )
    }
  }

  function editMessage(convId, messageId, newContent) {
    const now = new Date().toISOString()
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c
        const msgs = (c.messages || []).map((m) =>
          m.id === messageId ? { ...m, content: newContent, editedAt: now } : m,
        )

        return {
          ...c,
          messages: msgs,
          preview: msgs[msgs.length - 1]?.content?.slice(0, 80) || c.preview,
        }
      }),
    )
  }

  function resendMessage(convId, messageId) {
    const conv = conversations.find((c) => c.id === convId)
    const msg = conv?.messages?.find((m) => m.id === messageId)
    if (!msg) return
    sendMessage(convId, msg.content)
  }

  function cancelThinking() {
    setIsThinking(false)
    setThinkingConvId(null)
  }

  function regenerateLastMessage() {
    if (!selectedId) return
    const conv = conversations.find((c) => c.id === selectedId)
    if (!conv || !conv.messages || conv.messages.length < 2) return

    const messages = [...conv.messages]
    let lastUserMessageIndex = -1
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        lastUserMessageIndex = i
        break
      }
    }

    if (lastUserMessageIndex === -1) return

    const lastUserMessage = messages[lastUserMessageIndex]

    const newMessages = messages.slice(0, lastUserMessageIndex + 1)

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== selectedId) return c
        return {
          ...c,
          messages: newMessages,
          messageCount: newMessages.length,
        }
      }),
    )

    resendMessage(selectedId, lastUserMessage.id)
  }

  function handleUseTemplate(template) {
    if (searchRef.current) {
      searchRef.current.insertTemplate(template.content)
    }
  }

  function handleUpdateConversationFolder(conversationId, folderId) {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, folder_id: folderId || null, updatedAt: new Date().toISOString() } : c,
      ),
    )
  }

  function handleUpdateConversationTitle(conversationId, newTitle) {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, title: newTitle, updatedAt: new Date().toISOString() } : c)),
    )
  }

  const selected = conversations.find((c) => c.id === selectedId) || null

  return (
    <div className="h-screen w-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="flex h-[calc(100vh-0px)] lg:px-0 md:px-0">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          theme={theme}
          setTheme={setTheme}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          conversations={conversations}
          pinned={pinned}
          recent={recent}
          folders={folders}
          folderCounts={folderCounts}
          setFolders={setFolders}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId(id)}
          togglePin={togglePin}
          onDeleteConversation={handleDeleteConversation}
          query={query}
          setQuery={setQuery}
          searchRef={searchRef}
          createFolder={createFolder}
          createNewChat={createNewChat}
          templates={templates}
          setTemplates={setTemplates}
          onUseTemplate={handleUseTemplate}
          onUpdateConversationFolder={handleUpdateConversationFolder}
          onUpdateConversationTitle={handleUpdateConversationTitle}
        />

        <main className="relative flex min-w-0 flex-1 flex-col">
          <Header
            createNewChat={createNewChat}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarOpen={setSidebarOpen}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            theme={theme}
            hasMessages={selected?.messages?.length > 0}
            userAvatar={profile?.avatar}
          />
          <ChatPane
            ref={searchRef}
            conversation={selected}
            onSend={sendMessage}
            onEditMessage={(messageId, newContent) => selected && editMessage(selected.id, messageId, newContent)}
            onResendMessage={(messageId) => selected && resendMessage(selected.id, messageId)}
            isThinking={isThinking && thinkingConvId === selected?.id}
            onCancelThinking={cancelThinking}
            onRegenerateMessage={regenerateLastMessage}
            userAvatar={profile?.avatarUrl}
            userInitials={profile?.initials || "U"}
            selectedModel={selectedModel}
            theme={theme}
          />
        </main>
      </div>
    </div>
  )
}

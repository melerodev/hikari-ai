"use client"

import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from "react"
import { Pencil, RefreshCw, X, Square } from "lucide-react"
import Message from "./Message"
import Composer from "./Composer"
import { cls, timeAgo } from "./utils"
import { useLanguage } from "@/lib/i18n/LanguageContext"

function ThinkingMessage({ onCancel, modelId, theme }) {
  const { t } = useLanguage()
  return (
    <Message role="assistant" modelId={modelId} theme={theme}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400"></div>
        </div>
        <span className="text-sm text-zinc-500">{t("aiIsThinking")}</span>
        <button
          onClick={onCancel}
          className="ml-auto inline-flex items-center gap-1 rounded-full border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <Square className="h-3 w-3" />
          {t("cancel")}
        </button>
      </div>
    </Message>
  )
}

const ChatPane = forwardRef(function ChatPane(
  {
    conversation,
    onSend,
    onEditMessage,
    onResendMessage,
    isThinking,
    onCancelThinking,
    onRegenerateMessage,
    userAvatar,
    userInitials,
    selectedModel,
    theme,
  },
  ref,
) {
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState("")
  const [busy, setBusy] = useState(false)
  const composerRef = useRef(null)
  const { t, getWelcomeMessages } = useLanguage()

  const [displayedText, setDisplayedText] = useState("")
  const [currentMessageIndex, setCurrentMessageIndex] = useState(() => Math.floor(Math.random() * 25))
  const [isDeleting, setIsDeleting] = useState(false)

  useImperativeHandle(
    ref,
    () => ({
      insertTemplate: (templateContent) => {
        composerRef.current?.insertTemplate(templateContent)
      },
    }),
    [],
  )

  useEffect(() => {
    const welcomeMessages = getWelcomeMessages()

    if (!welcomeMessages || welcomeMessages.length === 0) return

    const currentMessage = welcomeMessages[currentMessageIndex] || welcomeMessages[0]
    if (!currentMessage) return

    if (!isDeleting && displayedText === currentMessage) {
      const timeout = setTimeout(() => setIsDeleting(true), 2000)
      return () => clearTimeout(timeout)
    }

    if (isDeleting && displayedText === "") {
      setIsDeleting(false)
      let nextIndex
      do {
        nextIndex = Math.floor(Math.random() * welcomeMessages.length)
      } while (nextIndex === currentMessageIndex && welcomeMessages.length > 1)
      setCurrentMessageIndex(nextIndex)
      return
    }

    const timeout = setTimeout(
      () => {
        if (isDeleting) {
          setDisplayedText(currentMessage.substring(0, displayedText.length - 1))
        } else {
          setDisplayedText(currentMessage.substring(0, displayedText.length + 1))
        }
      },
      isDeleting ? 50 : 100,
    )

    return () => clearTimeout(timeout)
  }, [displayedText, isDeleting, currentMessageIndex, getWelcomeMessages])

  if (!conversation) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-6">
          <div className="text-center max-w-2xl">
            <div className="mb-6">
              <span className="inline-flex h-16 w-16 items-center justify-center text-5xl font-bold text-zinc-900 dark:text-white select-none pointer-events-none">
                光
              </span>
            </div>
            <h1 className="text-4xl font-serif tracking-tight mb-4 text-zinc-900 dark:text-zinc-100 min-h-[3rem]">
              {displayedText}
              <span className="animate-pulse">|</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg">{t("writeYourMessage")}</p>
          </div>
        </div>

        <Composer
          ref={composerRef}
          onSend={async (text) => {
            if (!text.trim()) return
            setBusy(true)
            await onSend?.(null, text)
            setBusy(false)
          }}
          busy={busy}
          isThinking={isThinking}
        />
      </div>
    )
  }

  const messages = Array.isArray(conversation.messages) ? conversation.messages : []
  const count = messages.length || conversation.messageCount || 0

  const lastAssistantIndex = messages.reduce((lastIdx, m, idx) => (m.role === "assistant" ? idx : lastIdx), -1)

  function startEdit(m) {
    setEditingId(m.id)
    setDraft(m.content)
  }
  function cancelEdit() {
    setEditingId(null)
    setDraft("")
  }
  function saveEdit() {
    if (!editingId) return
    onEditMessage?.(editingId, draft)
    cancelEdit()
  }
  function saveAndResend() {
    if (!editingId) return
    onEditMessage?.(editingId, draft)
    onResendMessage?.(editingId)
    cancelEdit()
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-8">
        <div className="mb-2 text-3xl font-serif tracking-tight sm:text-4xl md:text-5xl">
          <span className="block leading-[1.05] font-sans text-2xl">{conversation.title}</span>
        </div>
        <div className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          {t("updated")} {timeAgo(conversation.updatedAt)} · {count} {t("messages")}
        </div>
        <hr className="mb-6 border-zinc-200 dark:border-zinc-700" />

        {messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            {t("noMessagesYet")}
          </div>
        ) : (
          <>
            {messages.map((m, index) => (
              <div key={m.id} className="space-y-2">
                {editingId === m.id ? (
                  <div className={cls("rounded-2xl border p-2", "border-zinc-200 dark:border-zinc-800")}>
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      className="w-full resize-y rounded-xl bg-transparent p-2 text-sm outline-none"
                      rows={3}
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={saveAndResend}
                        className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-3 py-1.5 text-xs text-white dark:bg-white dark:text-zinc-900"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> {t("saveAndResend")}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs"
                      >
                        <X className="h-3.5 w-3.5" /> {t("cancel")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Message
                      role={m.role}
                      content={m.content}
                      userAvatar={userAvatar}
                      userInitials={userInitials}
                      modelId={selectedModel}
                      theme={theme}
                      isLastAssistant={m.role === "assistant" && index === lastAssistantIndex && !isThinking}
                      onRegenerate={onRegenerateMessage}
                      regenerateLabel={t("regenerate")}
                    />
                    {m.role === "user" && (
                      <div className="flex justify-end">
                        <div className="mr-10 flex gap-2 text-[11px] text-zinc-500">
                          <button
                            className="inline-flex items-center gap-1 hover:underline"
                            onClick={() => startEdit(m)}
                          >
                            <Pencil className="h-3.5 w-3.5" /> {t("edit")}
                          </button>
                          <button
                            className="inline-flex items-center gap-1 hover:underline"
                            onClick={() => onResendMessage?.(m.id)}
                          >
                            <RefreshCw className="h-3.5 w-3.5" /> {t("resend")}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
            {isThinking && <ThinkingMessage onCancel={onCancelThinking} modelId={selectedModel} theme={theme} />}
          </>
        )}
      </div>

      <Composer
        ref={composerRef}
        onSend={async (text) => {
          if (!text.trim()) return
          setBusy(true)
          await onSend?.(conversation.id, text)
          setBusy(false)
        }}
        busy={busy}
        isThinking={isThinking}
      />
    </div>
  )
})

export default ChatPane

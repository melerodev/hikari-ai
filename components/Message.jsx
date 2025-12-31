"use client"

import { cls } from "./utils"
import MarkdownContent from "./MarkdownContent"
import { RefreshCcw } from "lucide-react"
import { useState } from "react"

const MODEL_LOGOS = {
  openai: {
    light: "/images/chatgpt-logo-black.png",
    dark: "/images/chatgpt-logo-white.png",
  },
  gemini: {
    light: "/images/gemini-logo.png",
    dark: "/images/gemini-logo.png",
  },
  grok: {
    light: "/images/grok-logo-black.png",
    dark: "/images/grok-logo-white.png",
  },
  deepseek: {
    light: "/images/deepseek-logo.png",
    dark: "/images/deepseek-logo.png",
  },
}

function getBrandFromModel(modelId) {
  if (!modelId) return "openai"
  if (
    modelId.startsWith("gpt") ||
    modelId.startsWith("chatgpt") ||
    modelId.startsWith("o1") ||
    modelId.startsWith("o3") ||
    modelId.startsWith("o4")
  )
    return "openai"
  if (modelId.startsWith("gemini")) return "gemini"
  if (modelId.startsWith("grok")) return "grok"
  if (modelId.startsWith("deepseek")) return "deepseek"
  return "openai"
}

export default function Message({
  role,
  children,
  content,
  userAvatar,
  userInitials = "JD",
  modelId,
  theme = "light",
  isLastAssistant = false,
  onRegenerate,
  regenerateLabel = "Regenerate",
}) {
  const isUser = role === "user"
  const [isHovered, setIsHovered] = useState(false)

  const messageContent = content !== undefined ? content : children
  const shouldUseMarkdown = typeof messageContent === "string"

  const getAIAvatar = () => {
    const brand = getBrandFromModel(modelId)
    const currentTheme = theme === "dark" ? "dark" : "light"
    return MODEL_LOGOS[brand]?.[currentTheme] || MODEL_LOGOS.openai[currentTheme]
  }

  return (
    <div
      className={cls("flex gap-3 group", isUser ? "justify-end" : "justify-start")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isUser && (
        <div className="mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
          <img src={getAIAvatar() || "/placeholder.svg"} alt="AI" className="h-4 w-4 object-contain" />
        </div>
      )}
      <div className="flex flex-col max-w-[80%]">
        <div
          className={cls(
            "rounded-2xl px-3 py-2 text-sm shadow-sm break-words",
            isUser
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
              : "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800",
          )}
        >
          {isUser ? messageContent : shouldUseMarkdown ? <MarkdownContent content={messageContent} /> : messageContent}
        </div>
        {!isUser && isLastAssistant && onRegenerate && (
          <div
            className={cls(
              "mt-1 flex gap-2 text-[11px] text-zinc-500 transition-opacity duration-200",
              isHovered ? "opacity-100" : "opacity-0",
            )}
          >
            <button
              className="inline-flex items-center gap-1 hover:underline hover:text-zinc-700 dark:hover:text-zinc-300"
              onClick={onRegenerate}
            >
              <RefreshCcw className="h-3.5 w-3.5" /> {regenerateLabel}
            </button>
          </div>
        )}
      </div>
      {isUser && (
        <div className="mt-0.5 h-7 w-7 rounded-full overflow-hidden flex-shrink-0">
          {userAvatar ? (
            <img src={userAvatar || "/placeholder.svg"} alt="User" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full grid place-items-center bg-zinc-900 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-900">
              {userInitials}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

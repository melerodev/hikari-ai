"use client"

import { useRef, useState, forwardRef, useImperativeHandle, useEffect } from "react"
import { Send, Loader2 } from "lucide-react"
import { cls } from "./utils"
import { useLanguage } from "@/lib/i18n/LanguageContext"

const Composer = forwardRef(function Composer({ onSend, busy, isThinking }, ref) {
  const [value, setValue] = useState("")
  const [sending, setSending] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [lineCount, setLineCount] = useState(1)
  const inputRef = useRef(null)
  const { t } = useLanguage()

  useEffect(() => {
    if (inputRef.current) {
      const textarea = inputRef.current
      const lineHeight = 20
      const minHeight = 40

      textarea.style.height = "auto"
      const scrollHeight = textarea.scrollHeight
      const calculatedLines = Math.max(1, Math.floor((scrollHeight - 16) / lineHeight))

      setLineCount(calculatedLines)

      if (calculatedLines <= 12) {
        textarea.style.height = `${Math.max(minHeight, scrollHeight)}px`
        textarea.style.overflowY = "hidden"
      } else {
        textarea.style.height = `${minHeight + 11 * lineHeight}px`
        textarea.style.overflowY = "auto"
      }
    }
  }, [value])

  useImperativeHandle(
    ref,
    () => ({
      insertTemplate: (templateContent) => {
        setValue(templateContent)
        setTimeout(() => {
          inputRef.current?.focus()
          const length = templateContent.length
          inputRef.current?.setSelectionRange(length, length)
        }, 0)
      },
      focus: () => {
        inputRef.current?.focus()
      },
    }),
    [],
  )

  async function handleSend() {
    if (!value.trim() || sending || isThinking) return
    setSending(true)
    try {
      await onSend?.(value)
      setValue("")
      inputRef.current?.focus()
    } finally {
      setSending(false)
    }
  }

  const hasContent = value.length > 0
  const isDisabled = sending || busy || isThinking

  return (
    <div className="border-t border-zinc-200/60 p-4 dark:border-zinc-800">
      <div
        className={cls(
          "mx-auto flex flex-col rounded-2xl border bg-white shadow-sm dark:bg-zinc-950 transition-all duration-200",
          "max-w-3xl border-zinc-300 dark:border-zinc-700 p-3",
          isDisabled && "opacity-60",
        )}
      >
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isThinking ? t("aiIsWriting") : t("howCanIHelp")}
            rows={1}
            disabled={isDisabled}
            className={cls(
              "w-full resize-none bg-transparent text-sm outline-none placeholder:text-zinc-400 transition-all duration-200",
              "px-0 py-2 min-h-[40px] text-left",
              isDisabled && "cursor-not-allowed",
            )}
            style={{
              height: "auto",
              overflowY: lineCount > 12 ? "auto" : "hidden",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !isDisabled) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
        </div>

        <div className="flex items-center justify-end mt-2">
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleSend}
              disabled={isDisabled || !value.trim()}
              className={cls(
                "inline-flex shrink-0 items-center gap-2 rounded-full bg-zinc-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-white dark:text-zinc-900",
                (isDisabled || !value.trim()) && "opacity-50 cursor-not-allowed",
              )}
            >
              {sending || busy || isThinking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-2 max-w-3xl px-1 text-[11px] text-zinc-500 dark:text-zinc-400">
        {t("pressEnterToSend")}{" "}
        <kbd className="rounded border border-zinc-300 bg-zinc-50 px-1 dark:border-zinc-600 dark:bg-zinc-800">
          Enter
        </kbd>{" "}
        {t("toSend")} ·{" "}
        <kbd className="rounded border border-zinc-300 bg-zinc-50 px-1 dark:border-zinc-600 dark:bg-zinc-800">
          Shift
        </kbd>
        +
        <kbd className="rounded border border-zinc-300 bg-zinc-50 px-1 dark:border-zinc-600 dark:bg-zinc-800">
          Enter
        </kbd>{" "}
        {t("forNewline")}
      </div>

      <div className="mx-auto mt-3 max-w-3xl text-center text-[10px] text-zinc-400 dark:text-zinc-500">
        © {new Date().getFullYear()} Hikari AI. {t("copyright")}.
      </div>
    </div>
  )
})

export default Composer

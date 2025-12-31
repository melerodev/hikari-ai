"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"

export default function MarkdownContent({ content }) {
  const textContent = typeof content === "string" ? content : String(content || "")

  const parsedContent = parseMarkdown(textContent)

  return <div className="prose prose-sm dark:prose-invert max-w-none space-y-3">{parsedContent}</div>
}

function parseMarkdown(text) {
  const elements = []
  const lines = text.split("\n")
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Bloques de código con \`\`\`
    if (line.trim().startsWith("```")) {
      const language = line.trim().substring(3).trim() || "text"
      const codeLines = []
      i++

      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i])
        i++
      }

      elements.push(<CodeBlock key={elements.length} language={language} code={codeLines.join("\n")} />)
      i++
      continue
    }

    // Líneas horizontales
    if (line.trim() === "---" || line.trim() === "***" || line.trim() === "___") {
      elements.push(<hr key={elements.length} className="my-4 border-t border-zinc-200 dark:border-zinc-800" />)
      i++
      continue
    }

    // Headings
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={elements.length} className="text-base font-semibold mt-4 mb-2">
          {formatText(line.substring(4))}
        </h3>,
      )
      i++
      continue
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={elements.length} className="text-lg font-semibold mt-4 mb-2">
          {formatText(line.substring(3))}
        </h2>,
      )
      i++
      continue
    }
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={elements.length} className="text-xl font-bold mt-4 mb-2">
          {formatText(line.substring(2))}
        </h1>,
      )
      i++
      continue
    }

    // Listas
    if (line.trim().match(/^[*\-+]\s/)) {
      const listItems = []
      while (i < lines.length && lines[i].trim().match(/^[*\-+]\s/)) {
        listItems.push(
          <li key={listItems.length} className="ml-4">
            {formatText(lines[i].trim().substring(2))}
          </li>,
        )
        i++
      }
      elements.push(
        <ul key={elements.length} className="list-disc ml-4 space-y-1">
          {listItems}
        </ul>,
      )
      continue
    }

    // Listas numeradas
    if (line.trim().match(/^\d+\.\s/)) {
      const listItems = []
      while (i < lines.length && lines[i].trim().match(/^\d+\.\s/)) {
        const text = lines[i].trim().replace(/^\d+\.\s/, "")
        listItems.push(
          <li key={listItems.length} className="ml-4">
            {formatText(text)}
          </li>,
        )
        i++
      }
      elements.push(
        <ol key={elements.length} className="list-decimal ml-4 space-y-1">
          {listItems}
        </ol>,
      )
      continue
    }

    // Párrafos normales
    if (line.trim()) {
      elements.push(
        <p key={elements.length} className="mb-2 leading-relaxed">
          {formatText(line)}
        </p>,
      )
    }

    i++
  }

  return elements
}

function formatText(text) {
  const parts = []
  const currentText = text
  let key = 0

  // Código inline con `
  const inlineCodeRegex = /`([^`]+)`/g
  const codeMatches = [...currentText.matchAll(inlineCodeRegex)]

  if (codeMatches.length > 0) {
    let lastIndex = 0
    codeMatches.forEach((match) => {
      if (match.index > lastIndex) {
        parts.push(...parseTextFormatting(currentText.substring(lastIndex, match.index), key++))
      }
      parts.push(
        <code
          key={`code-${key++}`}
          className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-mono"
        >
          {match[1]}
        </code>,
      )
      lastIndex = match.index + match[0].length
    })
    if (lastIndex < currentText.length) {
      parts.push(...parseTextFormatting(currentText.substring(lastIndex), key++))
    }
    return parts
  }

  return parseTextFormatting(currentText, key)
}

function parseTextFormatting(text, startKey = 0) {
  const parts = []
  let key = startKey

  // Links con [texto](url)
  const linkRegex = /\[([^\]]+)\]$$([^)]+)$$/g
  let lastIndex = 0
  const linkMatches = [...text.matchAll(linkRegex)]

  if (linkMatches.length > 0) {
    linkMatches.forEach((match) => {
      if (match.index > lastIndex) {
        parts.push(...parseBold(text.substring(lastIndex, match.index), key++))
      }
      parts.push(
        <a
          key={`link-${key++}`}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          {match[1]}
        </a>,
      )
      lastIndex = match.index + match[0].length
    })
    if (lastIndex < text.length) {
      parts.push(...parseBold(text.substring(lastIndex), key++))
    }
    return parts
  }

  return parseBold(text, key)
}

function parseBold(text, startKey = 0) {
  const parts = []
  let key = startKey

  // Negrita con **
  const boldRegex = /\*\*([^*]+)\*\*/g
  let lastIndex = 0
  const matches = [...text.matchAll(boldRegex)]

  if (matches.length > 0) {
    matches.forEach((match) => {
      if (match.index > lastIndex) {
        const plainText = text.substring(lastIndex, match.index)
        parts.push(...parseItalic(plainText, key++))
      }
      parts.push(
        <strong key={`bold-${key++}`} className="font-semibold">
          {match[1]}
        </strong>,
      )
      lastIndex = match.index + match[0].length
    })
    if (lastIndex < text.length) {
      parts.push(...parseItalic(text.substring(lastIndex), key++))
    }
    return parts
  }

  return parseItalic(text, key)
}

function parseItalic(text, startKey = 0) {
  const parts = []
  let key = startKey

  // Cursiva con *
  const italicRegex = /\*([^*]+)\*/g
  let lastIndex = 0
  const matches = [...text.matchAll(italicRegex)]

  if (matches.length > 0) {
    matches.forEach((match) => {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index))
      }
      parts.push(
        <em key={`italic-${key++}`} className="italic">
          {match[1]}
        </em>,
      )
      lastIndex = match.index + match[0].length
    })
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }
    return parts
  }

  return [text]
}

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const highlightedCode = highlightSyntax(code, language)

  return (
    <div className="my-4 rounded-lg overflow-hidden bg-[#1a1b26] border border-zinc-700/50">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-700/50 bg-[#16161e]">
        <span className="text-xs font-medium text-zinc-400 uppercase">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              Copiar
            </>
          )}
        </Button>
      </div>

      <ScrollArea className="max-h-96">
        <pre className="p-4 m-0 text-sm leading-relaxed font-mono overflow-x-auto">
          <code>{highlightedCode}</code>
        </pre>
      </ScrollArea>
    </div>
  )
}

function highlightSyntax(code, language) {
  const tokens = tokenize(code, language)

  return tokens.map((token, i) => {
    const color = getTokenColor(token.type)
    return (
      <span key={i} style={{ color }}>
        {token.value}
      </span>
    )
  })
}

function tokenize(code, language) {
  const tokens = []
  const keywords = getKeywords(language)

  const patterns = [
    { type: "comment", regex: /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm },
    { type: "string", regex: /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g },
    { type: "number", regex: /\b(\d+\.?\d*|\.\d+)\b/g },
    { type: "keyword", regex: new RegExp(`\\b(${keywords.join("|")})\\b`, "g") },
    { type: "function", regex: /\b([a-zA-Z_]\w*)\s*(?=\()/g },
    { type: "operator", regex: /([+\-*/%=<>!&|^~?:]+)/g },
  ]

  let remaining = code
  let position = 0

  while (remaining.length > 0) {
    let matched = false

    for (const pattern of patterns) {
      pattern.regex.lastIndex = 0
      const match = pattern.regex.exec(remaining)

      if (match && match.index === 0) {
        tokens.push({ type: pattern.type, value: match[0] })
        remaining = remaining.substring(match[0].length)
        position += match[0].length
        matched = true
        break
      }
    }

    if (!matched) {
      tokens.push({ type: "text", value: remaining[0] })
      remaining = remaining.substring(1)
      position++
    }
  }

  return tokens
}

function getKeywords(language) {
  const keywordMap = {
    javascript: [
      "const",
      "let",
      "var",
      "function",
      "return",
      "if",
      "else",
      "for",
      "while",
      "class",
      "extends",
      "import",
      "export",
      "from",
      "async",
      "await",
      "try",
      "catch",
      "new",
      "this",
      "typeof",
      "instanceof",
    ],
    typescript: [
      "const",
      "let",
      "var",
      "function",
      "return",
      "if",
      "else",
      "for",
      "while",
      "class",
      "extends",
      "import",
      "export",
      "from",
      "async",
      "await",
      "try",
      "catch",
      "new",
      "this",
      "interface",
      "type",
      "enum",
      "public",
      "private",
      "protected",
    ],
    python: [
      "def",
      "class",
      "return",
      "if",
      "elif",
      "else",
      "for",
      "while",
      "import",
      "from",
      "as",
      "try",
      "except",
      "with",
      "lambda",
      "yield",
      "async",
      "await",
      "True",
      "False",
      "None",
    ],
    java: [
      "public",
      "private",
      "protected",
      "class",
      "interface",
      "extends",
      "implements",
      "return",
      "if",
      "else",
      "for",
      "while",
      "try",
      "catch",
      "new",
      "this",
      "static",
      "final",
      "void",
      "int",
      "String",
      "boolean",
    ],
    jsx: [
      "const",
      "let",
      "var",
      "function",
      "return",
      "if",
      "else",
      "for",
      "while",
      "class",
      "extends",
      "import",
      "export",
      "from",
      "async",
      "await",
      "try",
      "catch",
      "new",
      "this",
    ],
    tsx: [
      "const",
      "let",
      "var",
      "function",
      "return",
      "if",
      "else",
      "for",
      "while",
      "class",
      "extends",
      "import",
      "export",
      "from",
      "async",
      "await",
      "try",
      "catch",
      "new",
      "this",
      "interface",
      "type",
    ],
  }

  return keywordMap[language] || keywordMap.javascript
}

function getTokenColor(type) {
  const colors = {
    keyword: "#c678dd",
    string: "#98c379",
    comment: "#5c6370",
    number: "#d19a66",
    function: "#61afef",
    operator: "#56b6c2",
    text: "#abb2bf",
  }

  return colors[type] || colors.text
}

export type AIModel =
  | "gpt-5"
  | "gpt-5-mini"
  | "gpt-5-nano"
  | "chatgpt-5"
  | "gpt-4.1"
  | "gpt-4.1-mini"
  | "gpt-4.1-nano"
  | "gpt-4o"
  | "gpt-4o-mini"
  | "o1"
  | "o1-mini"
  | "o1-preview"
  | "o3"
  | "o3-mini"
  | "o4-mini"
  | "deepseek"
  | "claude-sonnet-4"
  | "gemini"
  | "grok"
  | "grok-3"
  | "grok-3-mini"
  | string

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface ChatResponse {
  content: string
  model: string
  error?: string
}

const MODEL_ENDPOINTS: Record<string, string> = {
  "gpt-5": "/api/chat/gpt5",
  "gpt-5-mini": "/api/chat/gpt5",
  "gpt-5-nano": "/api/chat/gpt5",
  "chatgpt-5": "/api/chat/gpt5",
  "gpt-4.1": "/api/chat/gpt5",
  "gpt-4.1-mini": "/api/chat/gpt5",
  "gpt-4.1-nano": "/api/chat/gpt5",
  "gpt-4o": "/api/chat/gpt5",
  "gpt-4o-mini": "/api/chat/gpt5",
  o1: "/api/chat/gpt5",
  "o1-mini": "/api/chat/gpt5",
  "o1-preview": "/api/chat/gpt5",
  o3: "/api/chat/gpt5",
  "o3-mini": "/api/chat/gpt5",
  "o4-mini": "/api/chat/gpt5",
  deepseek: "/api/chat/deepseek",
  grok: "/api/chat/grok",
  "grok-3": "/api/chat/grok",
  "grok-3-mini": "/api/chat/grok",
}

function isGeminiModel(model: string): boolean {
  return model.startsWith("gemini-") || model.includes("gemini")
}

export async function sendChatMessage(model: AIModel, messages: ChatMessage[]): Promise<ChatResponse> {
  let endpoint = MODEL_ENDPOINTS[model]

  if (!endpoint && isGeminiModel(model)) {
    endpoint = "/api/chat/gemini"
  }

  if (!endpoint) {
    // For models without API implementation, return a mock response
    return {
      content: `Lo siento, el modelo ${model} aún no está disponible. Por favor, selecciona GPT-5, DeepSeek o Gemini.`,
      model: model,
    }
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages, model }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))

    // Si es un error de límite de tasa, lanzar error específico
    if (errorData.error === "RATE_LIMIT_EXCEEDED" || response.status === 429) {
      throw new Error("RATE_LIMIT_EXCEEDED")
    }

    throw new Error(errorData.error || `API error: ${response.status}`)
  }

  const data = await response.json()
  return {
    content: data.content,
    model: data.model,
  }
}

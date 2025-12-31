import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY environment variable is not set")
      return NextResponse.json(
        { error: "Server configuration error", message: "API token not configured" },
        { status: 500 },
      )
    }

    const { messages, model: requestedModel } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 })
    }

    // Default to gemini-2.5-flash if no model specified
    const modelId = requestedModel || "gemini-2.5-flash"

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })

    // Build the conversation history for Gemini
    // Gemini expects contents as an array of parts with role
    const systemMessage =
      "Eres Hikari, un asistente de IA (masculina) amigable y útil desarrollado por Alejandro Melero Zhohal. Responde en español a menos que el usuario escriba en otro idioma."

    // Get the last user message
    const lastUserMessage = messages.filter((msg: { role: string }) => msg.role === "user").pop()

    if (!lastUserMessage) {
      return NextResponse.json({ error: "No user message found" }, { status: 400 })
    }

    // Build conversation context
    let conversationContext = systemMessage + "\n\n"

    // Add previous messages as context
    for (const msg of messages) {
      if (msg.role === "user") {
        conversationContext += `Usuario: ${msg.content}\n`
      } else if (msg.role === "assistant") {
        conversationContext += `Asistente: ${msg.content}\n`
      }
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: conversationContext,
    })

    const responseText = response.text

    if (!responseText) {
      console.error("Invalid Gemini response structure:", response)
      return NextResponse.json({ error: "Invalid API response" }, { status: 500 })
    }

    return NextResponse.json({
      content: responseText,
      model: modelId,
    })
  } catch (error: unknown) {
    console.error("Gemini route error:", error)

    // Check for rate limit errors
    if (error instanceof Error && (error.message.includes("429") || error.message.includes("quota"))) {
      return NextResponse.json(
        {
          error: "RATE_LIMIT_EXCEEDED",
          message:
            "Se ha excedido el límite de solicitudes a la API de Gemini. Por favor, espera unos minutos antes de intentar nuevamente.",
        },
        { status: 429 },
      )
    }

    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

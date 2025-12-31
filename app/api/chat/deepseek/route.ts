import { type NextRequest, NextResponse } from "next/server"

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const ENDPOINT = "https://models.github.ai/inference"
const MODEL = "deepseek/DeepSeek-V3-0324"

export async function POST(request: NextRequest) {
  try {
    if (!GITHUB_TOKEN) {
      console.error("GITHUB_TOKEN environment variable is not set")
      return NextResponse.json(
        { error: "Server configuration error", message: "API token not configured" },
        { status: 500 },
      )
    }

    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 })
    }

    // Format messages for the API
    const formattedMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Add system message if not present
    if (formattedMessages.length === 0 || formattedMessages[0].role !== "system") {
      formattedMessages.unshift({
        role: "system",
        content:
          "Eres Hikari, un asistente de IA (masculina) amigable y útil desarrollado por Alejandro Melero Zhohal. Responde en español a menos que el usuario escriba en otro idioma.",
      })
    }

    const response = await fetch(`${ENDPOINT}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
      body: JSON.stringify({
        messages: formattedMessages,
        temperature: 0.8,
        top_p: 0.1,
        max_tokens: 2048,
        model: MODEL,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("DeepSeek API error:", response.status, errorText)

      if (response.status === 429) {
        return NextResponse.json(
          {
            error: "RATE_LIMIT_EXCEEDED",
            message:
              "Se ha excedido el límite de solicitudes a la API de DeepSeek. Por favor, espera unos minutos antes de intentar nuevamente.",
          },
          { status: 429 },
        )
      }

      return NextResponse.json(
        { error: `API error: ${response.status}`, details: errorText },
        { status: response.status },
      )
    }

    const data = await response.json()

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Invalid response structure:", data)
      return NextResponse.json({ error: "Invalid API response" }, { status: 500 })
    }

    return NextResponse.json({
      content: data.choices[0].message.content,
      model: MODEL,
    })
  } catch (error) {
    console.error("DeepSeek route error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 })
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const data = await response.json()

    const datePattern = /\d{2}-\d{2}|\d{4,}|\d{3}$/

    const filteredModels = data.models
      .filter((model: { name: string; displayName: string }) => {
        const name = model.name.replace("models/", "")
        const displayName = model.displayName || ""

        // Exclude any model with date-like patterns in name OR displayName
        if (datePattern.test(name)) return false
        if (datePattern.test(displayName)) return false

        if (
          name.includes("embedding") ||
          name.includes("tts") ||
          name.includes("imagen") ||
          name.includes("aqa") ||
          name.includes("image") ||
          name.includes("robotics") ||
          name.includes("learnlm")
        )
          return false
        return name.startsWith("gemini")
      })
      .map((model: { name: string; displayName: string }) => ({
        name: model.displayName,
        brand: "gemini",
        id: model.name.replace("models/", ""),
      }))
      .sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name))

    return NextResponse.json({ models: filteredModels })
  } catch (error) {
    console.error("Error fetching Gemini models:", error)
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 })
  }
}

export interface TemplateData {
  id: string
  name: string
  content: string
  snippet: string
  created_at: string
  updated_at: string
}

// Save a template
export async function saveTemplate(template: Omit<TemplateData, "id" | "created_at" | "updated_at">) {
  try {
    const response = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(template),
    })
    if (!response.ok) {
      console.error("Error saving template:", response.statusText)
      return null
    }
    return await response.json()
  } catch (error) {
    console.error("Exception in saveTemplate:", error instanceof Error ? error.message : error)
    return null
  }
}

// Update a template
export async function updateTemplate(id: string, template: Partial<TemplateData>) {
  try {
    const response = await fetch("/api/templates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...template }),
    })
    if (!response.ok) {
      console.error("Error updating template:", response.statusText)
      return null
    }
    return await response.json()
  } catch (error) {
    console.error("Exception in updateTemplate:", error instanceof Error ? error.message : error)
    return null
  }
}

// Delete a template
export async function deleteTemplate(id: string) {
  try {
    const response = await fetch(`/api/templates?id=${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
    if (!response.ok) {
      console.error("Error deleting template:", response.statusText)
      return false
    }
    return true
  } catch (error) {
    console.error("Exception in deleteTemplate:", error instanceof Error ? error.message : error)
    return false
  }
}

// Get all templates
export async function getTemplates() {
  try {
    const response = await fetch("/api/templates", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
    if (!response.ok) {
      console.error("Error fetching templates:", response.statusText)
      return []
    }
    return await response.json()
  } catch (error) {
    console.error("Exception in getTemplates:", error instanceof Error ? error.message : error)
    return []
  }
}

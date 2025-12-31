export interface FolderData {
  id: string
  name: string
  created_at: string
  updated_at: string
}

// Save a folder to the database
export async function saveFolder(name: string) {
  try {
    const response = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    if (!response.ok) {
      console.error("Error saving folder:", response.statusText)
      return null
    }
    return await response.json()
  } catch (error) {
    console.error("Exception in saveFolder:", error instanceof Error ? error.message : error)
    return null
  }
}

// Rename a folder
export async function renameFolder(oldName: string, newName: string) {
  try {
    const response = await fetch("/api/folders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldName, newName }),
    })
    if (!response.ok) {
      console.error("Error renaming folder:", response.statusText)
      return false
    }
    return true
  } catch (error) {
    console.error("Exception in renameFolder:", error instanceof Error ? error.message : error)
    return false
  }
}

// Delete a folder
export async function deleteFolder(name: string) {
  try {
    const response = await fetch(`/api/folders?name=${encodeURIComponent(name)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
    if (!response.ok) {
      console.error("Error deleting folder:", response.statusText)
      return false
    }
    return true
  } catch (error) {
    console.error("Exception in deleteFolder:", error instanceof Error ? error.message : error)
    return false
  }
}

// Move conversations to a different folder
export async function moveConversationsToFolder(conversationIds: string[], folderName: string) {
  try {
    const response = await fetch("/api/conversations/move-to-folder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationIds, folderName }),
    })
    if (!response.ok) {
      console.error("Error moving conversations:", response.statusText)
      return false
    }
    return true
  } catch (error) {
    console.error("Exception in moveConversationsToFolder:", error instanceof Error ? error.message : error)
    return false
  }
}

import { createClient } from "@/lib/supabase/client"

export interface Conversation {
  id: string
  user_id: string
  conversation_id: string
  title: string
  preview: string
  content: string
  pinned: boolean
  folder_id: string | null
  message_count: number
  created_at: string
  updated_at: string
}

function getSupabaseClient() {
  try {
    return createClient()
  } catch (error) {
    console.error("Failed to create Supabase client:", error instanceof Error ? error.message : error)
    return null
  }
}

// Save or update a conversation in the database
export async function saveConversation(
  conversationId: string,
  title: string,
  preview: string,
  content: string,
  pinned: boolean,
  folderId: string | null,
  messageCount: number,
) {
  try {
    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        title,
        preview,
        content: typeof content === "string" ? content : JSON.stringify(content),
        pinned,
        folder_id: folderId,
        message_count: messageCount,
      }),
    })

    if (!response.ok) {
      console.error("Error saving conversation:", response.statusText)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Exception in saveConversation:", error instanceof Error ? error.message : error)
    return null
  }
}

// Get all conversations for the current user
export async function getConversations() {
  try {
    const response = await fetch("/api/conversations", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("API error:", response.statusText)
      return []
    }

    const data = await response.json()
    return data || []
  } catch (error) {
    console.error("Error fetching conversations:", error instanceof Error ? error.message : error)
    return []
  }
}

// Delete a conversation
export async function deleteConversation(conversationId: string) {
  try {
    const response = await fetch(`/api/conversations?id=${conversationId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("Error deleting conversation:", response.statusText)
      return false
    }

    return true
  } catch (error) {
    console.error("Exception in deleteConversation:", error instanceof Error ? error.message : error)
    return false
  }
}

// Update conversation title
export async function updateConversationTitle(conversationId: string, title: string) {
  try {
    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        title,
      }),
    })

    if (!response.ok) {
      console.error("Error updating conversation title:", response.statusText)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Exception in updateConversationTitle:", error instanceof Error ? error.message : error)
    return null
  }
}

// Update conversation pin status
export async function updateConversationPin(conversationId: string, pinned: boolean) {
  try {
    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        pinned,
      }),
    })

    if (!response.ok) {
      console.error("Error updating conversation pin status:", response.statusText)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Exception in updateConversationPin:", error instanceof Error ? error.message : error)
    return null
  }
}

// Update conversation folder
export async function updateConversationFolder(conversationId: string, folderId: string | null) {
  try {
    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        folder_id: folderId,
      }),
    })

    if (!response.ok) {
      console.error("Error updating conversation folder:", response.statusText)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Exception in updateConversationFolder:", error instanceof Error ? error.message : error)
    return null
  }
}

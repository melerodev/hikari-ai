import { createClient } from "@/lib/supabase/server"

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { conversationId, folderId } = body

    if (!conversationId) {
      return new Response(JSON.stringify({ error: "Conversation ID is required" }), { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const folderIdValue: string | null = folderId || null

    const { data: updateData, error } = await supabase
      .from("conversations")
      .update({ folder_id: folderIdValue, updated_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id)
      .select()

    if (error) {
      console.error("Error updating conversation folder:", error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    return new Response(JSON.stringify({ success: true, folderId: folderIdValue, updated: updateData }), {
      status: 200,
    })
  } catch (error) {
    console.error("Error in PUT /api/conversations/move-to-folder:", error)
    return new Response(JSON.stringify({ error: "Failed to move conversation" }), { status: 500 })
  }
}

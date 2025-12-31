import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: foldersData } = await supabase.from("folders").select("id, name").eq("user_id", user.id)

    const folderMap = new Map(foldersData?.map((f) => [f.id, f.name]) || [])

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching conversations:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const transformedData =
      data?.map((conv) => ({
        id: conv.conversation_id,
        title: conv.title,
        preview: conv.preview,
        messages: typeof conv.content === "string" ? JSON.parse(conv.content) : conv.content,
        pinned: conv.pinned,
        folder: conv.folder_id ? folderMap.get(conv.folder_id) || null : null,
        messageCount: conv.message_count,
        updatedAt: conv.updated_at,
        createdAt: conv.created_at,
      })) || []

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("Exception in GET conversations:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversation_id, title, preview, content, pinned, folder, folder_id, message_count } = body

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: existingArray } = await supabase
      .from("conversations")
      .select("id")
      .eq("conversation_id", conversation_id)
      .eq("user_id", user.id)

    const existing = existingArray && existingArray.length > 0 ? existingArray[0] : null

    let resolvedFolderId: string | null = null

    if (folder_id) {
      // Already a UUID
      resolvedFolderId = folder_id
    } else if (folder) {
      // folder is a name string, need to look up the UUID
      const { data: folderData } = await supabase
        .from("folders")
        .select("id")
        .eq("name", folder)
        .eq("user_id", user.id)
        .maybeSingle()

      resolvedFolderId = folderData?.id || null
    }

    let data, error

    if (existing) {
      const updateData: any = { updated_at: new Date().toISOString() }
      if (title !== undefined) updateData.title = title
      if (preview !== undefined) updateData.preview = preview
      if (content !== undefined) updateData.content = content
      if (pinned !== undefined) updateData.pinned = pinned
      if (folder !== undefined || folder_id !== undefined) updateData.folder_id = resolvedFolderId
      if (message_count !== undefined) updateData.message_count = message_count

      const result = await supabase
        .from("conversations")
        .update(updateData)
        .eq("conversation_id", conversation_id)
        .eq("user_id", user.id)
        .select()

      data = result.data
      error = result.error
    } else {
      const result = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          conversation_id,
          title,
          preview,
          content,
          pinned,
          folder_id: resolvedFolderId,
          message_count,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      data = result.data
      error = result.error
    }

    if (error) {
      console.error("Error saving conversation:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Exception in POST conversations:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Failed to save conversation" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("id")

    if (!conversationId) {
      return NextResponse.json({ error: "Missing conversation ID" }, { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id)

    if (error) {
      console.error("Error deleting conversation:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Exception in DELETE conversations:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title } = body

    if (!id || !title) {
      return NextResponse.json({ error: "Missing id or title" }, { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("conversations")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("conversation_id", id)
      .eq("user_id", user.id)
      .select()

    if (error) {
      console.error("Error renaming conversation:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Exception in PUT conversations:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Failed to rename conversation" }, { status: 500 })
  }
}

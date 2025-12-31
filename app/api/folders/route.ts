import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      return new Response(JSON.stringify([]), { status: 200 })
    }

    return new Response(JSON.stringify(data || []), { status: 200 })
  } catch (error) {
    console.error("Error in GET /api/folders:", error)
    return new Response(JSON.stringify([]), { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name) {
      return new Response(JSON.stringify({ error: "Folder name is required" }), { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const { data, error } = await supabase.from("folders").insert({ name, user_id: user.id }).select()

    if (error) {
      console.error("Supabase error:", error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    return new Response(JSON.stringify(data[0]), { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/folders:", error)
    return new Response(JSON.stringify({ error: "Failed to create folder" }), { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name } = body

    if (!id || !name) {
      return new Response(JSON.stringify({ error: "ID and name are required" }), { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const { error } = await supabase
      .from("folders")
      .update({ name, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Supabase error:", error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    console.error("Error in PUT /api/folders:", error)
    return new Response(JSON.stringify({ error: "Failed to rename folder" }), { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return new Response(JSON.stringify({ error: "Folder ID is required" }), { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const { error: deleteConversationsError } = await supabase
      .from("conversations")
      .delete()
      .eq("folder_id", id)
      .eq("user_id", user.id)

    if (deleteConversationsError) {
      console.error("Error deleting folder conversations:", deleteConversationsError)
      return new Response(JSON.stringify({ error: "Failed to delete folder conversations" }), { status: 500 })
    }

    const { error } = await supabase.from("folders").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("Supabase error:", error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    console.error("Error in DELETE /api/folders:", error)
    return new Response(JSON.stringify({ error: "Failed to delete folder" }), { status: 500 })
  }
}

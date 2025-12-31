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
      .from("templates")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      return new Response(JSON.stringify([]), { status: 200 })
    }

    return new Response(JSON.stringify(data || []), { status: 200 })
  } catch (error) {
    console.error("Error in GET /api/templates:", error)
    return new Response(JSON.stringify([]), { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, name, content, snippet } = body

    if (!name || !content) {
      return new Response(JSON.stringify({ error: "Name and content are required" }), { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    // If ID exists, update; otherwise create
    if (id) {
      const { error } = await supabase
        .from("templates")
        .update({ name, content, snippet: snippet || content.slice(0, 100), updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) {
        console.error("Supabase error:", error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      }

      return new Response(JSON.stringify({ success: true, id }), { status: 200 })
    }

    const { data, error } = await supabase
      .from("templates")
      .insert({
        name,
        content,
        snippet: snippet || content.slice(0, 100),
        user_id: user.id,
      })
      .select()

    if (error) {
      console.error("Supabase error:", error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    return new Response(JSON.stringify(data[0]), { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/templates:", error)
    return new Response(JSON.stringify({ error: "Failed to create template" }), { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, content, snippet } = body

    if (!id) {
      return new Response(JSON.stringify({ error: "Template ID is required" }), { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const updateData: any = { updated_at: new Date().toISOString() }
    if (name) updateData.name = name
    if (content) updateData.content = content
    if (snippet) updateData.snippet = snippet

    const { error } = await supabase.from("templates").update(updateData).eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("Supabase error:", error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    console.error("Error in PUT /api/templates:", error)
    return new Response(JSON.stringify({ error: "Failed to update template" }), { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return new Response(JSON.stringify({ error: "Template ID is required" }), { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const { error } = await supabase.from("templates").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("Supabase error:", error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    console.error("Error in DELETE /api/templates:", error)
    return new Response(JSON.stringify({ error: "Failed to delete template" }), { status: 500 })
  }
}

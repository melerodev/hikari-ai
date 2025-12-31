"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import md5 from "blueimp-md5"

interface UserProfile {
  id: string
  email: string
  name: string | null
  avatarUrl: string
  initials: string
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .maybeSingle()

          // Generate Gravatar URL from email
          const email = user.email?.toLowerCase().trim() || ""
          const hash = md5(email)
          const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?d=mp&s=80`

          const name =
            profileData?.full_name ||
            user.user_metadata?.name ||
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "Usuario"

          // Generate initials
          const nameParts = name.split(" ")
          const initials =
            nameParts.length >= 2
              ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
              : name.slice(0, 2).toUpperCase()

          setProfile({
            id: user.id,
            email: user.email || "",
            name,
            avatarUrl: gravatarUrl,
            initials,
          })
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, profile, loading }
}

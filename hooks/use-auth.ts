"use client"

import { useState, useEffect } from "react"
import { supabase, isDemoMode, DatabaseService, type Profile } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mode démo - connexion automatique
    if (isDemoMode) {
      const demoUser = {
        id: "demo-user-id",
        email: "demo@terangabuild.com",
      } as User

      const demoProfile: Profile = {
        id: "demo-user-id",
        email: "demo@terangabuild.com",
        full_name: "Utilisateur Démo",
        user_type: "client",
        company_name: "TerangaBuild Demo",
        phone: "+221 77 123 4567",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      }

      setUser(demoUser)
      setProfile(demoProfile)
      setLoading(false)
      return
    }

    // Mode normal avec Supabase
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setUser(session?.user ?? null)

        if (session?.user) {
          const userProfile = await DatabaseService.getProfile(session.user.id)
          setProfile(userProfile)
        }
      } catch (error) {
        console.error("Error getting session:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        const userProfile = await DatabaseService.getProfile(session.user.id)
        setProfile(userProfile)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    if (isDemoMode) {
      // En mode démo, on simule la déconnexion
      setUser(null)
      setProfile(null)
      return
    }

    await supabase.auth.signOut()
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return null

    const updatedProfile = await DatabaseService.updateProfile(user.id, updates)
    if (updatedProfile) {
      setProfile(updatedProfile)
    }
    return updatedProfile
  }

  return {
    user,
    profile,
    loading,
    signOut,
    updateProfile,
    isClient: profile?.user_type === "client",
    isProfessional: profile?.user_type === "professional",
    isAuthenticated: !!user,
    isDemoMode,
  }
}

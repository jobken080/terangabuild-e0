"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import { Building2 } from "lucide-react"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error during auth callback:", error)
          router.push("/auth?error=callback_error")
          return
        }

        if (data.session) {
          // Utilisateur connecté avec succès
          router.push("/")
        } else {
          // Pas de session, rediriger vers la page d'auth
          router.push("/auth")
        }
      } catch (error) {
        console.error("Unexpected error:", error)
        router.push("/auth?error=unexpected_error")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#094468] to-[#0c6b8c] flex items-center justify-center">
      <div className="text-center text-white">
        <Building2 className="h-16 w-16 mx-auto mb-4 animate-pulse" />
        <h1 className="text-2xl font-bold mb-2">TerangaBuild</h1>
        <p className="text-lg opacity-90">Finalisation de votre connexion...</p>
        <div className="mt-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    </div>
  )
}

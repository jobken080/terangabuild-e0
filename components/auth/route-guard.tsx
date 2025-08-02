"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Building2 } from "lucide-react"

interface RouteGuardProps {
  children: React.ReactNode
  requiredUserType?: "client" | "professional"
  redirectTo?: string
}

export function RouteGuard({ children, requiredUserType, redirectTo = "/auth" }: RouteGuardProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo)
        return
      }

      if (requiredUserType && profile?.user_type !== requiredUserType) {
        // Rediriger vers le bon dashboard selon le type d'utilisateur
        if (profile?.user_type === "client") {
          router.push("/client-dashboard")
        } else if (profile?.user_type === "professional") {
          router.push("/pro-dashboard")
        } else {
          router.push("/")
        }
        return
      }
    }
  }, [user, profile, loading, requiredUserType, redirectTo, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 mx-auto mb-4 animate-pulse text-[#094468]" />
          <h1 className="text-2xl font-bold mb-2 text-black">TerangaBuild</h1>
          <p className="text-lg text-gray-600">Chargement...</p>
          <div className="mt-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#094468]"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Redirection en cours
  }

  if (requiredUserType && profile?.user_type !== requiredUserType) {
    return null // Redirection en cours
  }

  return <>{children}</>
}

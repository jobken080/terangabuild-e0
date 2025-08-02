"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthForm } from "@/components/auth/auth-form"
import { supabase } from "@/lib/supabase-client"

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const router = useRouter()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push("/")
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#094468] to-[#0c6b8c] flex items-center justify-center p-4">
      <AuthForm mode={mode} onToggle={() => setMode(mode === "signin" ? "signup" : "signin")} />
    </div>
  )
}

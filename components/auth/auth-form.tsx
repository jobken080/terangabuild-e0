"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase-client"
import { Building2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AuthFormProps {
  mode: "signin" | "signup"
  onToggle: () => void
}

export function AuthForm({ mode, onToggle }: AuthFormProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    userType: "client" as "client" | "professional",
    companyName: "",
    phone: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              user_type: formData.userType,
              company_name: formData.companyName,
              phone: formData.phone,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) throw error

        setMessage({
          type: "success",
          text: "Compte créé avec succès! Vérifiez votre email pour confirmer votre inscription.",
        })
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (error) throw error

        setMessage({
          type: "success",
          text: "Connexion réussie! Redirection en cours...",
        })
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Une erreur est survenue",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Building2 className="h-8 w-8 text-[#094468] mr-2" />
          <h1 className="text-2xl font-bold">TerangaBuild</h1>
        </div>
        <CardTitle>{mode === "signin" ? "Connexion" : "Créer un compte"}</CardTitle>
        <CardDescription>
          {mode === "signin" ? "Connectez-vous à votre compte" : "Rejoignez la révolution du BTP"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {message && (
          <Alert
            className={`mb-4 ${message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className={message.type === "error" ? "text-red-800" : "text-green-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div>
                <Label htmlFor="fullName">Nom complet</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="userType">Type de compte</Label>
                <Select
                  value={formData.userType}
                  onValueChange={(value: "client" | "professional") => setFormData({ ...formData, userType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="professional">Professionnel BTP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.userType === "professional" && (
                <div>
                  <Label htmlFor="companyName">Nom de l'entreprise</Label>
                  <Input
                    id="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+221 77 123 4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full bg-[#094468] hover:bg-[#0a5a7a]" disabled={loading}>
            {loading ? "Chargement..." : mode === "signin" ? "Se connecter" : "Créer le compte"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button type="button" onClick={onToggle} className="text-sm text-[#094468] hover:underline">
            {mode === "signin" ? "Pas de compte ? Créer un compte" : "Déjà un compte ? Se connecter"}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

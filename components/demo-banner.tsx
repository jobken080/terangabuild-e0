"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Settings } from "lucide-react"
import { isDemoMode } from "@/lib/supabase-client"

export function DemoBanner() {
  if (!isDemoMode) return null

  return (
    <Alert className="mb-6 border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <div className="flex items-center justify-between">
          <div>
            <strong>Mode Démonstration</strong> - Supabase n'est pas configuré. Les données sont simulées.
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-100 bg-transparent"
            onClick={() => {
              alert(
                "Pour configurer Supabase :\n\n1. Créez un projet sur supabase.com\n2. Copiez l'URL et la clé anonyme\n3. Ajoutez-les dans le fichier .env.local\n4. Exécutez les scripts SQL fournis",
              )
            }}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}

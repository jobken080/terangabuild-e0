"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Users,
  DrillIcon as Drone,
  Cpu,
  Zap,
  ArrowRight,
  Shield,
  TrendingUp,
  Globe,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  const handleGetStarted = () => {
    if (user && profile) {
      if (profile.user_type === "client") {
        router.push("/client-dashboard")
      } else if (profile.user_type === "professional") {
        router.push("/pro-dashboard")
      }
    } else {
      router.push("/auth")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 mx-auto mb-4 animate-pulse text-[#094468]" />
          <p className="text-lg text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-[#094468]" />
              <h1 className="text-2xl font-bold text-black">TerangaBuild</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={`text-sm font-medium transition-colors ${activeTab === "overview" ? "text-[#094468]" : "text-gray-600 hover:text-[#094468]"}`}
              >
                Aperçu
              </button>
              <button
                onClick={() => setActiveTab("features")}
                className={`text-sm font-medium transition-colors ${activeTab === "features" ? "text-[#094468]" : "text-gray-600 hover:text-[#094468]"}`}
              >
                Fonctionnalités
              </button>
              <button
                onClick={() => setActiveTab("technology")}
                className={`text-sm font-medium transition-colors ${activeTab === "technology" ? "text-[#094468]" : "text-gray-600 hover:text-[#094468]"}`}
              >
                Technologies
              </button>
            </nav>
            <div className="flex items-center space-x-2">
              {user && profile ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{profile.full_name || profile.email}</span>
                  <Button variant="outline" size="sm" onClick={handleGetStarted}>
                    Dashboard
                  </Button>
                </div>
              ) : (
                <Link href="/auth">
                  <Button className="bg-[#094468] hover:bg-[#0a5a7a] text-white" size="sm">
                    Connexion
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background moderne */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"></div>

          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full">
              <svg
                className="absolute top-10 left-10 w-32 h-32 text-[#094468]/10"
                fill="currentColor"
                viewBox="0 0 100 100"
              >
                <polygon points="50,0 100,50 50,100 0,50" />
              </svg>
              <svg
                className="absolute top-32 right-20 w-24 h-24 text-blue-400/20"
                fill="currentColor"
                viewBox="0 0 100 100"
              >
                <circle cx="50" cy="50" r="50" />
              </svg>
              <svg
                className="absolute bottom-20 left-1/4 w-20 h-20 text-[#094468]/15"
                fill="currentColor"
                viewBox="0 0 100 100"
              >
                <rect x="0" y="0" width="100" height="100" rx="20" />
              </svg>
              <svg
                className="absolute bottom-40 right-1/3 w-28 h-28 text-indigo-300/25"
                fill="currentColor"
                viewBox="0 0 100 100"
              >
                <polygon points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25" />
              </svg>
            </div>
          </div>

          {/* Éléments flottants */}
          <div className="absolute top-32 left-1/3 animate-float">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
              <Cpu className="h-8 w-8 text-[#094468]" />
            </div>
          </div>
          <div className="absolute top-60 right-1/4 animate-float-delayed">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
              <Drone className="h-10 w-10 text-[#094468]" />
            </div>
          </div>
          <div className="absolute bottom-32 left-1/5 animate-float-slow">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
              <Building2 className="h-12 w-12 text-[#094468]" />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-fade-in-up">
            <Badge className="mb-6 bg-[#094468]/10 text-[#094468] border-[#094468]/20 backdrop-blur-sm px-4 py-2 text-sm font-medium">
              🚀 Révolutionnez vos chantiers avec l'IA
            </Badge>

            <h2 className="text-4xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight animate-fade-in-up delay-200">
              La fluidité des chantiers grâce aux{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-[#094468] via-blue-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">
                  technologies avancées
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#094468] via-blue-600 to-indigo-600 rounded-full animate-scale-x"></div>
              </span>
            </h2>

            <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in-up delay-400">
              Optimisez vos projets BTP avec notre plateforme intégrant{" "}
              <span className="font-semibold text-[#094468]">IoT</span>,{" "}
              <span className="font-semibold text-[#094468]">BIM</span>,{" "}
              <span className="font-semibold text-[#094468]">drones</span> et{" "}
              <span className="font-semibold text-[#094468]">IA</span>. Réduisez les retards, maîtrisez les coûts et
              améliorez la communication.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-fade-in-up delay-600">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-[#094468] hover:bg-[#0a5a7a] text-white px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 group"
              >
                <Users className="mr-3 h-6 w-6 group-hover:animate-bounce" />
                {user && profile ? "Accéder au Dashboard" : "Commencer Maintenant"}
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Link href="/auth">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-[#094468] text-[#094468] hover:bg-[#094468] hover:text-white px-8 py-4 text-lg font-semibold bg-white/80 backdrop-blur-sm shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 group"
                >
                  <Building2 className="mr-3 h-6 w-6 group-hover:animate-bounce" />
                  {user && profile ? "Changer de compte" : "Créer un compte"}
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto animate-fade-in-up delay-800">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-white/50 shadow-xl hover:bg-white/90 transition-all duration-300 transform hover:scale-105 group">
                <div className="text-5xl font-bold text-red-500 mb-3 group-hover:animate-pulse">-40%</div>
                <div className="text-gray-800 text-lg font-medium">Réduction des retards</div>
                <div className="text-gray-600 text-sm mt-2">Grâce à l'IoT et aux drones</div>
              </div>
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-white/50 shadow-xl hover:bg-white/90 transition-all duration-300 transform hover:scale-105 group">
                <div className="text-5xl font-bold text-green-500 mb-3 group-hover:animate-pulse">+60%</div>
                <div className="text-gray-800 text-lg font-medium">Amélioration productivité</div>
                <div className="text-gray-600 text-sm mt-2">Avec l'automatisation IA</div>
              </div>
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-white/50 shadow-xl hover:bg-white/90 transition-all duration-300 transform hover:scale-105 group">
                <div className="text-5xl font-bold text-[#094468] mb-3 group-hover:animate-pulse">-25%</div>
                <div className="text-gray-800 text-lg font-medium">Optimisation des coûts</div>
                <div className="text-gray-600 text-sm mt-2">Analyse prédictive BIM</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sections de contenu - identiques à avant mais sans ConfigNotice */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {activeTab === "overview" && (
            <div className="space-y-16">
              <div className="text-center">
                <h3 className="text-4xl font-bold text-black mb-6">
                  Une plateforme complète pour révolutionner le BTP
                </h3>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  TerangaBuild transforme la gestion des chantiers grâce à l'intégration de technologies de pointe et
                  d'une approche centrée sur l'utilisateur.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#094468] p-3 rounded-lg">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-black mb-2">Marketplace sécurisée</h4>
                      <p className="text-gray-600">
                        Plateforme e-commerce intégrée pour l'achat de matériaux, outils et services avec paiement
                        Mobile Money et système de notation des fournisseurs.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-[#094468] p-3 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-black mb-2">Suivi en temps réel</h4>
                      <p className="text-gray-600">
                        Tableaux de bord interactifs avec données IoT, captures drone et modélisation BIM 3D pour un
                        contrôle total de vos projets.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-[#094468] p-3 rounded-lg">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-black mb-2">IA et automatisation</h4>
                      <p className="text-gray-600">
                        Analyse prédictive pour anticiper les risques, recommandations personnalisées et automatisation
                        des processus répétitifs.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 text-center">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <Building2 className="h-8 w-8 text-[#094468] mx-auto mb-2" />
                      <div className="text-2xl font-bold text-[#094468]">500+</div>
                      <div className="text-sm text-gray-600">Projets gérés</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <Users className="h-8 w-8 text-[#094468] mx-auto mb-2" />
                      <div className="text-2xl font-bold text-[#094468]">1200+</div>
                      <div className="text-sm text-gray-600">Utilisateurs actifs</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <Globe className="h-8 w-8 text-[#094468] mx-auto mb-2" />
                      <div className="text-2xl font-bold text-[#094468]">15</div>
                      <div className="text-sm text-gray-600">Pays couverts</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <CheckCircle className="h-8 w-8 text-[#094468] mx-auto mb-2" />
                      <div className="text-2xl font-bold text-[#094468]">98%</div>
                      <div className="text-sm text-gray-600">Satisfaction client</div>
                    </div>
                  </div>
                  <Button className="bg-[#094468] hover:bg-[#0a5a7a] text-white">Découvrir la démo</Button>
                </div>
              </div>
            </div>
          )}

          {/* Autres onglets identiques à la version précédente */}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#094468] text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Prêt à révolutionner vos chantiers ?</h3>
          <p className="text-xl mb-8 opacity-90">Rejoignez TerangaBuild et découvrez l'avenir du BTP</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-[#094468] hover:bg-gray-100"
              onClick={handleGetStarted}
            >
              {user && profile ? "Accéder au Dashboard" : "Commencer maintenant"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[#094468] bg-transparent"
            >
              Demander une démo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-100">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 TerangaBuild. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}

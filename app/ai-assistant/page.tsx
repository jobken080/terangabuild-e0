"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  Send,
  Mic,
  MicOff,
  ImageIcon,
  FileText,
  Calculator,
  Calendar,
  Building2,
  ArrowLeft,
  Loader2,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Target,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { RouteGuard } from "@/components/auth/route-guard"
import { useAuth } from "@/hooks/use-auth"
import { DemoBanner } from "@/components/demo-banner"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  analysis?: {
    type: "project" | "cost" | "planning" | "resource" | "image"
    data?: any
    confidence?: number
  }
}

interface AIAnalytics {
  totalQuestions: number
  categoriesUsed: { [key: string]: number }
  averageResponseTime: number
  lastUsed: Date
  accuracy: number
  savedCosts: number
}

interface AICapability {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  category: "analysis" | "planning" | "monitoring" | "optimization"
  usage: number
}

function AIAssistantContent() {
  const { profile, isDemoMode } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content: `Bonjour ${profile?.full_name || profile?.email || ""} ! 👋

Je suis votre assistant IA TerangaBuild, alimenté par Google Gemini. Je peux vous aider avec :

🏗️ **Analyse de projets** - Évaluation des risques, optimisations
💰 **Estimation des coûts** - Prédictions précises basées sur l'IA
📅 **Planification intelligente** - Optimisation des délais et ressources
📊 **Analyse d'images** - Reconnaissance de chantiers et structures
🎯 **Recommandations** - Conseils personnalisés pour vos projets

Posez-moi une question ou uploadez une image de votre chantier !`,
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [analytics, setAnalytics] = useState<AIAnalytics>({
    totalQuestions: 247,
    categoriesUsed: {
      "Analyse de projets": 89,
      "Estimation coûts": 67,
      Planification: 45,
      "Analyse images": 32,
      Optimisation: 14,
    },
    averageResponseTime: 1.2,
    lastUsed: new Date(),
    accuracy: 94.2,
    savedCosts: 2350000,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const aiCapabilities: AICapability[] = [
    {
      id: "project-analysis",
      title: "Analyse de Projets",
      description: "Analysez vos projets BTP avec l'IA pour identifier les risques et optimisations",
      icon: <Brain className="h-6 w-6" />,
      category: "analysis",
      usage: 89,
    },
    {
      id: "cost-estimation",
      title: "Estimation des Coûts",
      description: "Estimations précises basées sur l'historique et les données du marché",
      icon: <Calculator className="h-6 w-6" />,
      category: "planning",
      usage: 67,
    },
    {
      id: "progress-monitoring",
      title: "Suivi d'Avancement",
      description: "Surveillance intelligente du progrès avec alertes prédictives",
      icon: <TrendingUp className="h-6 w-6" />,
      category: "monitoring",
      usage: 45,
    },
    {
      id: "image-analysis",
      title: "Analyse d'Images",
      description: "Reconnaissance automatique de structures et évaluation de qualité",
      icon: <ImageIcon className="h-6 w-6" />,
      category: "analysis",
      usage: 32,
    },
    {
      id: "resource-optimization",
      title: "Optimisation Ressources",
      description: "Optimisez l'allocation des ressources et la planification",
      icon: <Sparkles className="h-6 w-6" />,
      category: "optimization",
      usage: 14,
    },
    {
      id: "risk-prediction",
      title: "Prédiction des Risques",
      description: "Identification proactive des risques potentiels",
      icon: <AlertTriangle className="h-6 w-6" />,
      category: "monitoring",
      usage: 28,
    },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedImage) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: selectedImage ? `[Image: ${selectedImage.name}] ${inputMessage}` : inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    // Simuler l'appel à l'API Gemini (remplacer par l'API réelle)
    setTimeout(() => {
      const response = generateGeminiResponse(inputMessage, selectedImage)
      setMessages((prev) => [...prev, response])
      setIsLoading(false)
      setSelectedImage(null)

      // Mettre à jour les analytics
      setAnalytics((prev) => ({
        ...prev,
        totalQuestions: prev.totalQuestions + 1,
        lastUsed: new Date(),
      }))
    }, 2000)
  }

  const generateGeminiResponse = (message: string, image?: File | null): Message => {
    const lowerMessage = message.toLowerCase()

    let content = ""
    let analysis = undefined

    if (image) {
      content = `🖼️ **Analyse d'Image par Gemini AI**

J'ai analysé votre image de chantier avec une précision de 96.8% :

📋 **Éléments détectés :**
- Structure en béton armé (confiance: 98%)
- Ferraillage apparent (confiance: 94%)
- État d'avancement estimé : 42%
- Qualité du béton : Excellente
- Conformité aux normes : ✅ Conforme

🔍 **Analyse technique :**
- Résistance estimée : 25-30 MPa
- Pas de fissures détectées
- Alignement structural : Correct
- Étanchéité : À vérifier aux joints

⚠️ **Recommandations IA :**
1. Test de résistance recommandé dans 48h
2. Vérifier l'étanchéité des joints Est
3. Prévoir protection contre intempéries
4. Inspection drone pour vue d'ensemble

📊 **Score qualité global : 8.7/10**`

      analysis = {
        type: "image",
        data: { confidence: 96.8, elements: 4, recommendations: 4 },
        confidence: 96.8,
      }
    } else if (lowerMessage.includes("projet") || lowerMessage.includes("chantier")) {
      content = `🏗️ **Analyse Intelligente de Projets par Gemini**

Basé sur l'analyse de vos 2 projets actifs avec une précision de 94.2% :

📊 **État des projets :**
- **Villa Moderne Dakar** : 65% terminé
  - Statut : ✅ Dans les temps
  - Risque de retard : 12% (faible)
  - Budget : Respecté (-2% d'économie)

- **Immeuble Commercial Thiès** : 15% terminé
  - Statut : ⚠️ Attention requise
  - Risque de retard : 34% (modéré)
  - Budget : Risque de dépassement (+8%)

🎯 **Recommandations IA prioritaires :**
1. **Urgent** : Accélérer permis immeuble commercial
2. **Important** : Commander matériaux villa (semaine 3)
3. **Préventif** : Négocier tarifs groupés (-15% possible)

🔮 **Prédictions Gemini :**
- Villa : Livraison probable 5 août 2024 (3 jours d'avance)
- Immeuble : Risque retard 2 semaines si pas d'action

💡 **Optimisations détectées :**
- Économie potentielle : 1.2M FCFA
- Gain de temps : 8 jours
- Efficacité équipe : +23%`

      analysis = {
        type: "project",
        data: { projectsAnalyzed: 2, recommendations: 3, savings: 1200000 },
        confidence: 94.2,
      }
    } else if (lowerMessage.includes("coût") || lowerMessage.includes("budget") || lowerMessage.includes("prix")) {
      content = `💰 **Analyse Financière Avancée par Gemini**

**Analyse budgétaire intelligente (Précision: 96.1%) :**

📈 **Vue d'ensemble :**
- Budget total : 130 000 000 FCFA
- Dépensé : 42 000 000 FCFA (32.3%)
- Reste : 88 000 000 FCFA
- Prédiction finale : 127 650 000 FCFA ✅

🎯 **Répartition optimisée IA :**
- Matériaux : 60% (25.2M) - Optimisation possible -8%
- Main d'œuvre : 30% (12.6M) - Efficacité +15%
- Équipements : 10% (4.2M) - Mutualisation -12%

🚀 **Optimisations Gemini :**
1. **Négociation groupée ciment** : -8% (340K FCFA)
2. **Livraisons mutualisées** : -15% transport (180K FCFA)
3. **Planning optimisé** : -5% main d'œuvre (630K FCFA)
4. **Achats saisonniers** : -12% sur finitions (480K FCFA)

💡 **Économies totales prédites : 1.63M FCFA**

📊 **Analyse prédictive :**
- Probabilité respect budget : 87%
- Marge de sécurité recommandée : 5%
- ROI optimisé : +12%`

      analysis = {
        type: "cost",
        data: { totalBudget: 130000000, predictedSavings: 1630000, accuracy: 96.1 },
        confidence: 96.1,
      }
    } else if (lowerMessage.includes("planning") || lowerMessage.includes("délai") || lowerMessage.includes("retard")) {
      content = `📅 **Planification Intelligente par Gemini**

**Analyse temporelle avancée (Confiance: 93.7%) :**

⏰ **État actuel des délais :**
- **Villa Moderne** : En avance de 3 jours ✅
  - Fin prévue : 15 août → 12 août 2024
  - Probabilité respect : 91%

- **Immeuble Commercial** : Risque retard ⚠️
  - Fin prévue : 31 décembre 2024
  - Retard potentiel : 2 semaines
  - Probabilité respect : 67%

🎯 **Optimisations temporelles IA :**
1. **Parallélisation villa** : Électricité + Plomberie
   - Gain : 5 jours
   - Risque : Faible (15%)

2. **Accélération permis immeuble** :
   - Action : Dossier prioritaire
   - Gain potentiel : 10 jours

3. **Équipes renforcées** :
   - +2 ouvriers spécialisés
   - Coût : +180K FCFA
   - Gain : 8 jours

🔮 **Prédictions Gemini :**
- Météo favorable : 85% (7 prochains jours)
- Disponibilité matériaux : 92%
- Efficacité équipes : Tendance +8%

📊 **Planning optimisé généré :**
- Économie temps totale : 13 jours
- Réduction risques : 45%
- Satisfaction client : +25%`

      analysis = {
        type: "planning",
        data: { timeSaved: 13, riskReduction: 45, projects: 2 },
        confidence: 93.7,
      }
    } else if (
      lowerMessage.includes("matériau") ||
      lowerMessage.includes("stock") ||
      lowerMessage.includes("inventaire")
    ) {
      content = `📦 **Gestion Intelligente des Ressources par Gemini**

**Analyse des stocks et approvisionnements (Précision: 95.4%) :**

📊 **État des stocks analysé :**
- **Ciment Portland** : 150 sacs ✅
  - Consommation prédite : 12 sacs/jour
  - Autonomie : 12.5 jours
  - Statut : Stock optimal

- **Fer à béton 12mm** : 80 barres ⚠️
  - Consommation prédite : 8 barres/jour
  - Autonomie : 10 jours
  - Statut : Réappro. urgent

- **Sable de rivière** : 50 m³ ✅
  - Consommation : 3.2 m³/jour
  - Autonomie : 15.6 jours

🚚 **Commandes optimisées IA :**
1. **Fer à béton** : +120 barres (urgent - 48h)
   - Fournisseur : Matériaux du Sahel
   - Prix négocié : -5% (42K FCFA économisés)

2. **Gravier concassé** : +30 m³ (préventif)
   - Livraison groupée avec fer
   - Transport : -25% (18K FCFA économisés)

3. **Carrelage finitions** : 250 m² (anticipé)
   - Promotion saisonnière : -15%
   - Économie : 95K FCFA

💡 **Optimisations Gemini :**
- **Contrat annuel ciment** : -8% sur prix
- **Mutualisation livraisons** : -30% transport
- **Stock prédictif** : -20% ruptures
- **Négociation groupée** : -12% coûts globaux

📈 **Impact économique prédit :**
- Économies totales : 285K FCFA
- Réduction ruptures : 85%
- Optimisation cash-flow : +15%`

      analysis = {
        type: "resource",
        data: { materialsAnalyzed: 8, savings: 285000, efficiency: 85 },
        confidence: 95.4,
      }
    } else {
      content = `🤖 **Assistant IA TerangaBuild - Powered by Gemini**

Je suis votre assistant intelligent spécialisé en BTP avec des capacités avancées :

🎯 **Mes spécialités :**

🏗️ **Analyse de projets**
- Évaluation des risques en temps réel
- Prédictions d'avancement avec 94% de précision
- Optimisations automatiques

💰 **Intelligence financière**
- Estimations coûts basées sur 10K+ projets
- Détection d'économies potentielles
- Prédictions budgétaires avancées

📅 **Planification prédictive**
- Optimisation des délais par IA
- Détection précoce des retards
- Coordination intelligente des équipes

📊 **Analyse d'images**
- Reconnaissance de structures (96% précision)
- Évaluation qualité automatique
- Détection d'anomalies

🎪 **Questions que vous pouvez me poser :**
- "Analyse l'état de mes projets"
- "Optimise mon budget matériaux"
- "Prédis les risques de retard"
- "Analyse cette photo de chantier"
- "Recommande des économies"

💡 **Statistiques de performance :**
- ${analytics.totalQuestions} questions traitées
- ${analytics.accuracy}% de précision moyenne
- ${(analytics.savedCosts / 1000000).toFixed(1)}M FCFA d'économies générées

Comment puis-je vous aider aujourd'hui ? 🚀`
    }

    return {
      id: Date.now().toString(),
      type: "assistant",
      content,
      timestamp: new Date(),
      analysis,
    }
  }

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("La reconnaissance vocale n'est pas supportée par votre navigateur")
      return
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = "fr-FR"
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInputMessage(transcript)
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
      alert("Erreur de reconnaissance vocale")
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file)
    } else {
      alert("Veuillez sélectionner un fichier image valide")
    }
  }

  const quickQuestions = [
    "Analyse l'état de mes projets en cours",
    "Optimise mon budget et trouve des économies",
    "Prédis les risques de retard sur mes chantiers",
    "Recommande des optimisations de planning",
    "Analyse l'état de mes stocks de matériaux",
    "Génère un rapport de performance",
  ]

  const getStatusColor = (category: string): string => {
    switch (category) {
      case "analysis":
        return "bg-blue-100 text-blue-800"
      case "planning":
        return "bg-green-100 text-green-800"
      case "monitoring":
        return "bg-yellow-100 text-yellow-800"
      case "optimization":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={profile?.user_type === "client" ? "/client-dashboard" : "/pro-dashboard"}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour au Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-black dark:text-white">
                    Assistant IA TerangaBuild
                    {isDemoMode && <span className="text-sm text-orange-600 ml-2">(Démo)</span>}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Powered by Google Gemini • Précision {analytics.accuracy}%
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                En ligne
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {profile?.company_name || profile?.full_name || profile?.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <DemoBanner />

        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat">💬 Chat IA</TabsTrigger>
            <TabsTrigger value="capabilities">🎯 Capacités</TabsTrigger>
            <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Chat Interface */}
              <div className="lg:col-span-3">
                <Card className="h-[700px] flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Brain className="h-5 w-5 mr-2 text-[#094468]" />
                        Conversation avec Gemini AI
                      </div>
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">Gemini Pro</Badge>
                    </CardTitle>
                    <CardDescription>
                      Assistant IA avancé pour l'analyse, la planification et l'optimisation de vos projets BTP
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] p-4 rounded-lg ${
                              message.type === "user"
                                ? "bg-gradient-to-r from-[#094468] to-[#0a5a7a] text-white"
                                : "bg-white border border-gray-200 text-gray-900 shadow-sm"
                            }`}
                          >
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                            {message.analysis && (
                              <div className="mt-3 p-3 bg-black/5 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    {message.analysis.type === "project" && <Building2 className="h-4 w-4" />}
                                    {message.analysis.type === "cost" && <Calculator className="h-4 w-4" />}
                                    {message.analysis.type === "planning" && <Calendar className="h-4 w-4" />}
                                    {message.analysis.type === "resource" && <FileText className="h-4 w-4" />}
                                    {message.analysis.type === "image" && <ImageIcon className="h-4 w-4" />}
                                    <span className="text-xs font-medium">Analyse {message.analysis.type}</span>
                                  </div>
                                  {message.analysis.confidence && (
                                    <Badge variant="outline" className="text-xs">
                                      {message.analysis.confidence}% précision
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                            <div className="text-xs opacity-70 mt-2">
                              {message.timestamp.toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white border border-gray-200 text-gray-900 p-4 rounded-lg flex items-center space-x-3 shadow-sm">
                            <Loader2 className="h-5 w-5 animate-spin text-[#094468]" />
                            <div>
                              <div className="text-sm font-medium">Gemini AI réfléchit...</div>
                              <div className="text-xs text-gray-500">Analyse en cours avec précision maximale</div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="space-y-3 border-t pt-4">
                      {selectedImage && (
                        <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <ImageIcon className="h-5 w-5 text-blue-600" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-blue-900">{selectedImage.name}</div>
                            <div className="text-xs text-blue-600">
                              {(selectedImage.size / 1024 / 1024).toFixed(1)} MB • Prêt pour analyse IA
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedImage(null)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            ×
                          </Button>
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <div className="flex-1">
                          <Textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder={
                              selectedImage
                                ? "Décrivez ce que vous voulez analyser dans cette image..."
                                : "Posez votre question à Gemini AI sur vos projets BTP..."
                            }
                            className="min-h-[80px] resize-none border-gray-300 focus:border-[#094468] focus:ring-[#094468]"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                handleSendMessage()
                              }
                            }}
                          />
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 hover:bg-blue-50 hover:border-blue-300"
                            title="Analyser une image"
                          >
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleVoiceInput}
                            disabled={isListening}
                            className={`p-3 ${
                              isListening
                                ? "bg-red-50 border-red-300 text-red-600"
                                : "hover:bg-green-50 hover:border-green-300"
                            }`}
                            title="Reconnaissance vocale"
                          >
                            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSendMessage}
                            disabled={isLoading || (!inputMessage.trim() && !selectedImage)}
                            className="bg-gradient-to-r from-[#094468] to-[#0a5a7a] hover:from-[#0a5a7a] hover:to-[#094468] text-white p-3"
                            title="Envoyer"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Questions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-[#094468]" />
                      Questions rapides
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {quickQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full text-left justify-start h-auto p-3 whitespace-normal hover:bg-blue-50 hover:border-blue-300 bg-transparent"
                        onClick={() => setInputMessage(question)}
                      >
                        <div className="text-xs text-left">{question}</div>
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                {/* Performance Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                      Performance IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Précision moyenne</span>
                      <Badge className="bg-green-100 text-green-800">{analytics.accuracy}%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Questions traitées</span>
                      <Badge variant="outline">{analytics.totalQuestions}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Temps de réponse</span>
                      <Badge variant="outline">{analytics.averageResponseTime}s</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Économies générées</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {(analytics.savedCosts / 1000000).toFixed(1)}M FCFA
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-purple-600" />
                      Statut Gemini
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm">Modèle Gemini Pro actif</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Analyse d'images disponible</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Reconnaissance vocale active</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Prédictions temps réel</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="capabilities" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiCapabilities.map((capability) => (
                <Card key={capability.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
                          {capability.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{capability.title}</CardTitle>
                          <Badge className={getStatusColor(capability.category)}>{capability.category}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{capability.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500">Utilisations</span>
                      <Badge variant="outline">{capability.usage}</Badge>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-[#094468] to-[#0a5a7a] hover:from-[#0a5a7a] hover:to-[#094468] text-white"
                      onClick={() => {
                        const questions = {
                          "project-analysis": "Analyse l'état de mes projets en cours",
                          "cost-estimation": "Optimise mon budget et trouve des économies",
                          "progress-monitoring": "Surveille l'avancement de mes chantiers",
                          "image-analysis": "Analyse cette image de chantier",
                          "resource-optimization": "Optimise mes ressources et matériaux",
                          "risk-prediction": "Prédis les risques sur mes projets",
                        }
                        setInputMessage(questions[capability.id as keyof typeof questions] || "")
                      }}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Utiliser cette capacité
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                  Intégration Google Gemini
                </CardTitle>
                <CardDescription>
                  TerangaBuild utilise la technologie Gemini de Google pour des analyses avancées et des prédictions
                  ultra-précises
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#094468] mb-2">{analytics.accuracy}%</div>
                    <div className="text-sm text-gray-600">Précision des analyses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#094468] mb-2">{analytics.averageResponseTime}s</div>
                    <div className="text-sm text-gray-600">Temps de réponse</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#094468] mb-2">24/7</div>
                    <div className="text-sm text-gray-600">Disponibilité</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#094468] mb-2">
                      {(analytics.savedCosts / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-sm text-gray-600">FCFA économisés</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Questions posées</p>
                      <p className="text-3xl font-bold text-[#094468]">{analytics.totalQuestions}</p>
                    </div>
                    <Brain className="h-8 w-8 text-[#094468]" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Précision moyenne</p>
                      <p className="text-3xl font-bold text-green-600">{analytics.accuracy}%</p>
                    </div>
                    <Target className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Économies générées</p>
                      <p className="text-3xl font-bold text-blue-600">{(analytics.savedCosts / 1000000).toFixed(1)}M</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Temps de réponse</p>
                      <p className="text-3xl font-bold text-purple-600">{analytics.averageResponseTime}s</p>
                    </div>
                    <Zap className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Utilisation par catégorie</CardTitle>
                <CardDescription>Répartition des questions posées à l'IA par domaine d'expertise</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.categoriesUsed).map(([category, count]) => {
                    const percentage = Math.round((count / analytics.totalQuestions) * 100)
                    return (
                      <div key={category}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">{category}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{count} questions</span>
                            <Badge variant="outline">{percentage}%</Badge>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#094468] to-[#0a5a7a] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impact économique de l'IA</CardTitle>
                <CardDescription>Économies et optimisations réalisées grâce à l'assistant IA</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">
                      {(analytics.savedCosts / 1000000).toFixed(1)}M FCFA
                    </div>
                    <div className="text-sm text-green-700">Économies totales</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">23%</div>
                    <div className="text-sm text-blue-700">Amélioration efficacité</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">15 jours</div>
                    <div className="text-sm text-purple-700">Temps économisé</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function AIAssistant() {
  return (
    <RouteGuard>
      <AIAssistantContent />
    </RouteGuard>
  )
}

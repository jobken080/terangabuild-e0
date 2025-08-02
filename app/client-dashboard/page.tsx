"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Building2,
  ShoppingCart,
  Search,
  MapPin,
  MessageCircle,
  CreditCard,
  Users,
  TrendingUp,
  Clock,
  Home,
  Package,
  LogOut,
  Calendar,
  DollarSign,
} from "lucide-react"
import Link from "next/link"
import { RouteGuard } from "@/components/auth/route-guard"
import { useAuth } from "@/hooks/use-auth"
import { useLanguage } from "@/hooks/use-language"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { UserProfile } from "@/components/user-profile"
import { DemoBanner } from "@/components/demo-banner"
import {
  DatabaseService,
  formatCurrency,
  getStatusColor,
  getStatusText,
  type Project,
  type Material,
  type Profile,
  type Order,
} from "@/lib/supabase-client"

function ClientDashboardContent() {
  const { profile, signOut } = useAuth()
  const { t } = useLanguage()
  const [activeProject, setActiveProject] = useState<string>("")
  const [projects, setProjects] = useState<Project[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [professionals, setProfessionals] = useState<Profile[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!profile) return

      setLoading(true)
      try {
        // Charger toutes les données en parallèle
        const [userProjects, availableMaterials, availableProfessionals] = await Promise.all([
          DatabaseService.getProjectsForUser(profile.id, "client"),
          DatabaseService.getMaterials(),
          DatabaseService.getProfessionals(),
        ])

        setProjects(userProjects)
        setMaterials(availableMaterials)
        setProfessionals(availableProfessionals)

        if (userProjects.length > 0 && !activeProject) {
          setActiveProject(userProjects[0].id)
          // Charger les commandes pour le premier projet
          const projectOrders = await DatabaseService.getOrdersForProject(userProjects[0].id)
          setOrders(projectOrders)
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [profile, activeProject])

  // Charger les commandes quand le projet actif change
  useEffect(() => {
    const loadOrders = async () => {
      if (activeProject) {
        const projectOrders = await DatabaseService.getOrdersForProject(activeProject)
        setOrders(projectOrders)
      }
    }
    loadOrders()
  }, [activeProject])

  const currentProject = projects.find((p) => p.id === activeProject)

  // Statistiques calculées
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0)
  const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0)
  const completedProjects = projects.filter((p) => p.status === "completed").length
  const activeProjectsCount = projects.filter((p) => p.status === "in_progress").length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 mx-auto mb-4 animate-pulse text-[#094468]" />
          <p className="text-lg text-gray-600 dark:text-gray-300">{t("loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-[#094468]" />
              <h1 className="text-2xl font-bold text-black dark:text-white">TerangaBuild</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {t("hello")}, {profile?.full_name || profile?.email}
              </span>
              <Button variant="ghost" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Assistant IA
              </Button>
              <ThemeToggle />
              <LanguageToggle />
              <UserProfile />
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                {t("logout")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <DemoBanner />

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-black dark:text-white mb-2">{t("dashboard")} Client</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Gérez vos projets, achats et suivez l'avancement de vos chantiers
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Projets actifs</p>
                  <p className="text-2xl font-bold text-black dark:text-white">{activeProjectsCount}</p>
                </div>
                <Building2 className="h-8 w-8 text-[#094468]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Projets terminés</p>
                  <p className="text-2xl font-bold text-black dark:text-white">{completedProjects}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Budget total</p>
                  <p className="text-2xl font-bold text-black dark:text-white">{formatCurrency(totalBudget)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Dépenses</p>
                  <p className="text-2xl font-bold text-black dark:text-white">{formatCurrency(totalSpent)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="projects">{t("projects")}</TabsTrigger>
            <TabsTrigger value="marketplace">{t("marketplace")}</TabsTrigger>
            <TabsTrigger value="professionals">{t("professionals")}</TabsTrigger>
            <TabsTrigger value="properties">{t("properties")}</TabsTrigger>
            <TabsTrigger value="financing">{t("financing")}</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            {projects.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-black dark:text-white mb-2">Aucun projet pour le moment</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">Créez votre premier projet pour commencer</p>
                  <Button className="bg-[#094468] hover:bg-[#0a5a7a] text-white">{t("create")} un projet</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Tableau des projets */}
                <Card>
                  <CardHeader>
                    <CardTitle>Mes Projets ({projects.length})</CardTitle>
                    <CardDescription>Vue d'ensemble de tous vos projets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom du projet</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Avancement</TableHead>
                          <TableHead>Budget</TableHead>
                          <TableHead>Dépensé</TableHead>
                          <TableHead>Localisation</TableHead>
                          <TableHead>Professionnel</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {projects.map((project) => (
                          <TableRow
                            key={project.id}
                            className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                              activeProject === project.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                            }`}
                            onClick={() => setActiveProject(project.id)}
                          >
                            <TableCell className="font-medium">{project.name}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(project.status)}>{getStatusText(project.status)}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Progress value={project.progress} className="w-16" />
                                <span className="text-sm">{project.progress}%</span>
                              </div>
                            </TableCell>
                            <TableCell>{project.budget ? formatCurrency(project.budget) : "Non défini"}</TableCell>
                            <TableCell>{project.spent ? formatCurrency(project.spent) : "0 FCFA"}</TableCell>
                            <TableCell>{project.location || "Non définie"}</TableCell>
                            <TableCell>{project.professional?.full_name || "Non assigné"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Détails du projet sélectionné */}
                {currentProject && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {currentProject.name}
                          <Badge className={getStatusColor(currentProject.status)}>
                            {getStatusText(currentProject.status)}
                          </Badge>
                        </CardTitle>
                        <CardDescription>Avancement: {currentProject.progress}%</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <Progress value={currentProject.progress} />

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-gray-600 dark:text-gray-300">Budget total</div>
                              <div className="text-lg font-semibold text-black dark:text-white">
                                {currentProject.budget ? formatCurrency(currentProject.budget) : "Non défini"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 dark:text-gray-300">Dépensé</div>
                              <div className="text-lg font-semibold text-[#094468]">
                                {currentProject.spent ? formatCurrency(currentProject.spent) : "0 FCFA"}
                              </div>
                            </div>
                          </div>

                          {currentProject.description && (
                            <div>
                              <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Description</div>
                              <p className="text-gray-800 dark:text-gray-200">{currentProject.description}</p>
                            </div>
                          )}

                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <Clock className="h-4 w-4 mr-2" />
                            {currentProject.professional
                              ? `Professionnel: ${currentProject.professional.full_name || currentProject.professional.email}`
                              : "Aucun professionnel assigné"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Commandes du projet */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Commandes ({orders.length})</CardTitle>
                        <CardDescription>Matériaux commandés pour ce projet</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {orders.length === 0 ? (
                          <div className="text-center py-8">
                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-300">Aucune commande pour ce projet</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {orders.map((order) => (
                              <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                  <div className="font-medium text-black dark:text-white">
                                    {order.material?.name || "Matériau inconnu"}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-300">
                                    Quantité: {order.quantity} • {formatCurrency(order.unit_price)} / unité
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-black dark:text-white">
                                    {formatCurrency(order.total_price)}
                                  </div>
                                  <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1">
                <Input placeholder="Rechercher des matériaux, outils, services..." className="w-full" />
              </div>
              <Button className="bg-[#094468] hover:bg-[#0a5a7a] text-white">
                <Search className="h-4 w-4 mr-2" />
                {t("search")}
              </Button>
            </div>

            {materials.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-black dark:text-white mb-2">Aucun matériau disponible</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Les fournisseurs n'ont pas encore ajouté de produits
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {materials.map((material) => (
                  <Card key={material.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Package className="h-8 w-8 text-[#094468]" />
                        <Badge variant={material.stock_quantity > 0 ? "default" : "secondary"}>
                          {material.stock_quantity > 0 ? "En stock" : "Rupture"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-semibold text-black dark:text-white mb-2">{material.name}</h4>
                      <div className="text-lg font-bold text-[#094468] mb-2">
                        {formatCurrency(material.price)}/{material.unit}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        Fournisseur: {material.supplier?.company_name || material.supplier?.full_name || "Non défini"}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm">{material.rating}</span>
                        </div>
                        <Button
                          size="sm"
                          className="bg-[#094468] hover:bg-[#0a5a7a] text-white"
                          disabled={material.stock_quantity === 0}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Ajouter
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="professionals" className="space-y-6">
            {professionals.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                    Aucun professionnel disponible
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Aucun professionnel n'est encore inscrit sur la plateforme
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {professionals.map((pro) => (
                  <Card key={pro.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-[#094468] rounded-full flex items-center justify-center text-white font-semibold">
                            {(pro.full_name || pro.email)
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-black dark:text-white">{pro.full_name || pro.email}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {pro.company_name || "Professionnel BTP"}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Certifié</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {pro.phone || "Téléphone non renseigné"}
                        </div>
                      </div>
                      <Button className="w-full bg-[#094468] hover:bg-[#0a5a7a] text-white">Contacter</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            <div className="text-center py-12">
              <Home className="h-16 w-16 text-[#094468] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">Catalogue Immobilier</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Découvrez notre sélection de terrains et propriétés
              </p>
              <Button className="bg-[#094468] hover:bg-[#0a5a7a] text-white">
                <MapPin className="h-4 w-4 mr-2" />
                Explorer les biens
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="financing" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-[#094468]" />
                    Options de paiement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium text-black dark:text-white">Mobile Money</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Orange Money, Wave, Free Money</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium text-black dark:text-white">Paiement échelonné</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Jusqu'à 12 mensualités sans frais</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium text-black dark:text-white">Microcrédit</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Financement adapté aux PME</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Simulateur de financement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">Montant du projet</label>
                      <Input placeholder="Ex: 10,000,000 FCFA" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">Durée (mois)</label>
                      <Input placeholder="Ex: 12" />
                    </div>
                    <Button className="w-full bg-[#094468] hover:bg-[#0a5a7a] text-white">
                      Calculer les mensualités
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function ClientDashboard() {
  return (
    <RouteGuard requiredUserType="client">
      <ClientDashboardContent />
    </RouteGuard>
  )
}

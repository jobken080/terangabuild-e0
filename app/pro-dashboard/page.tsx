"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Building2,
  Package,
  Users,
  BarChart3,
  DrillIcon as Drone,
  Cpu,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Eye,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Settings,
  Brain,
} from "lucide-react"
import Link from "next/link"
import { RouteGuard } from "@/components/auth/route-guard"
import { DemoBanner } from "@/components/demo-banner"
import { useAuth } from "@/hooks/use-auth"
import {
  DatabaseService,
  formatCurrency,
  getStatusColor,
  getStatusText,
  type Project,
  type Material,
  type Order,
  type IoTSensor,
  type Drone as DroneType,
  type ProjectActivity,
  type ProjectExpense,
  type ProjectUser,
  type Profile,
  calculateProjectDelay,
} from "@/lib/supabase-client"
import { ProjectChecklist } from "@/components/project-checklist"
import { ProjectInvitation } from "@/components/project-invitation"

function ProDashboardContent() {
  const { profile, signOut, isDemoMode } = useAuth()
  const [activeProject, setActiveProject] = useState<string>("")
  const [projects, setProjects] = useState<Project[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [iotSensors, setIoTSensors] = useState<IoTSensor[]>([])
  const [drones, setDrones] = useState<DroneType[]>([])
  const [activities, setActivities] = useState<ProjectActivity[]>([])
  const [expenses, setExpenses] = useState<ProjectExpense[]>([])
  const [projectUsers, setProjectUsers] = useState<ProjectUser[]>([])
  const [loading, setLoading] = useState(true)

  // États pour les formulaires
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showMaterialForm, setShowMaterialForm] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showUserForm, setShowUserForm] = useState(false)
  const [showThresholdForm, setShowThresholdForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [selectedSensor, setSelectedSensor] = useState<IoTSensor | null>(null)
  const [userSearchQuery, setUserSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Profile[]>([])

  // Données des formulaires
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    budget: "",
    location: "",
    start_date: "",
    end_date: "",
  })

  const [newMaterial, setNewMaterial] = useState({
    name: "",
    description: "",
    price: "",
    unit: "",
    category: "",
    stock_quantity: "",
  })

  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "materials" as "materials" | "labor" | "equipment" | "other",
    date: new Date().toISOString().split("T")[0],
  })

  const [newUser, setNewUser] = useState({
    user_id: "",
    role: "worker" as "manager" | "supervisor" | "worker" | "observer",
    permissions: [] as string[],
  })

  const [newThreshold, setNewThreshold] = useState({
    min_value: "",
    max_value: "",
    warning_threshold: "",
    critical_threshold: "",
  })

  // Chargement optimisé des données
  useEffect(() => {
    const loadData = async () => {
      if (!profile) return

      setLoading(true)
      try {
        // Chargement en parallèle pour améliorer les performances
        const [userProjects, supplierMaterials, userOrders, availableDrones] = await Promise.all([
          DatabaseService.getProjectsForUser(profile.id, "professional"),
          DatabaseService.getMaterialsBySupplier(profile.id),
          DatabaseService.getOrdersForUser(profile.id, "professional"),
          DatabaseService.getDrones(),
        ])

        setProjects(userProjects)
        setMaterials(supplierMaterials)
        setOrders(userOrders)
        setDrones(availableDrones)

        if (userProjects.length > 0 && !activeProject) {
          setActiveProject(userProjects[0].id)
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [profile])

  // Chargement des données du projet actif (optimisé)
  useEffect(() => {
    const loadProjectData = async () => {
      if (!activeProject) return

      try {
        const [sensors, projectActivities, projectExpenses, users] = await Promise.all([
          DatabaseService.getIoTSensorsForProject(activeProject),
          DatabaseService.getProjectActivities(activeProject),
          DatabaseService.getProjectExpenses(activeProject),
          DatabaseService.getProjectUsers(activeProject),
        ])

        setIoTSensors(sensors)
        setActivities(projectActivities)
        setExpenses(projectExpenses)
        setProjectUsers(users)
      } catch (error) {
        console.error("Error loading project data:", error)
      }
    }

    loadProjectData()
  }, [activeProject])

  // Recherche d'utilisateurs avec debounce
  useEffect(() => {
    if (!userSearchQuery || userSearchQuery.length < 3) {
      setSearchResults([])
      return
    }

    const searchUsers = async () => {
      try {
        const results = await DatabaseService.searchUsers(userSearchQuery)
        setSearchResults(results)
      } catch (error) {
        console.error("Error searching users:", error)
      }
    }

    const debounce = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounce)
  }, [userSearchQuery])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    try {
      const project = await DatabaseService.createProject({
        name: newProject.name,
        description: newProject.description,
        client_id: profile.id, // Temporaire - devrait être sélectionné
        professional_id: profile.id,
        status: "planning",
        progress: 0,
        budget: newProject.budget ? Number.parseFloat(newProject.budget) : undefined,
        location: newProject.location,
        start_date: newProject.start_date || undefined,
        end_date: newProject.end_date || undefined,
      })

      if (project) {
        setProjects([project, ...projects])
        setNewProject({
          name: "",
          description: "",
          budget: "",
          location: "",
          start_date: "",
          end_date: "",
        })
        setShowProjectForm(false)
      }
    } catch (error) {
      console.error("Error creating project:", error)
    }
  }

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProject) return

    try {
      const success = await DatabaseService.updateProject(editingProject.id, {
        name: newProject.name,
        description: newProject.description,
        budget: newProject.budget ? Number.parseFloat(newProject.budget) : undefined,
        location: newProject.location,
        start_date: newProject.start_date || undefined,
        end_date: newProject.end_date || undefined,
      })

      if (success) {
        setProjects(
          projects.map((p) =>
            p.id === editingProject.id
              ? { ...p, ...newProject, budget: newProject.budget ? Number.parseFloat(newProject.budget) : p.budget }
              : p,
          ),
        )
        setEditingProject(null)
        setShowProjectForm(false)
      }
    } catch (error) {
      console.error("Error updating project:", error)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      const success = await DatabaseService.deleteProject(projectId)
      if (success) {
        setProjects(projects.filter((p) => p.id !== projectId))
        if (activeProject === projectId) {
          setActiveProject(projects.length > 1 ? projects.find((p) => p.id !== projectId)?.id || "" : "")
        }
      }
    } catch (error) {
      console.error("Error deleting project:", error)
    }
  }

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    try {
      const material = await DatabaseService.createMaterial({
        name: newMaterial.name,
        description: newMaterial.description,
        price: Number.parseFloat(newMaterial.price),
        unit: newMaterial.unit,
        supplier_id: profile.id,
        category: newMaterial.category,
        stock_quantity: Number.parseInt(newMaterial.stock_quantity),
        rating: 0,
      })

      if (material) {
        setMaterials([material, ...materials])
        setNewMaterial({
          name: "",
          description: "",
          price: "",
          unit: "",
          category: "",
          stock_quantity: "",
        })
        setShowMaterialForm(false)
      }
    } catch (error) {
      console.error("Error creating material:", error)
    }
  }

  const handleUpdateMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMaterial) return

    try {
      const success = await DatabaseService.updateMaterial(editingMaterial.id, {
        name: newMaterial.name,
        description: newMaterial.description,
        price: Number.parseFloat(newMaterial.price),
        unit: newMaterial.unit,
        category: newMaterial.category,
        stock_quantity: Number.parseInt(newMaterial.stock_quantity),
      })

      if (success) {
        setMaterials(
          materials.map((m) =>
            m.id === editingMaterial.id
              ? {
                  ...m,
                  ...newMaterial,
                  price: Number.parseFloat(newMaterial.price),
                  stock_quantity: Number.parseInt(newMaterial.stock_quantity),
                }
              : m,
          ),
        )
        setEditingMaterial(null)
        setShowMaterialForm(false)
      }
    } catch (error) {
      console.error("Error updating material:", error)
    }
  }

  const handleDeleteMaterial = async (materialId: string) => {
    try {
      const success = await DatabaseService.deleteMaterial(materialId)
      if (success) {
        setMaterials(materials.filter((m) => m.id !== materialId))
      }
    } catch (error) {
      console.error("Error deleting material:", error)
    }
  }

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeProject || !profile) return

    try {
      const expense = await DatabaseService.createProjectExpense({
        project_id: activeProject,
        description: newExpense.description,
        amount: Number.parseFloat(newExpense.amount),
        category: newExpense.category,
        date: newExpense.date,
        created_by: profile.id,
      })

      if (expense) {
        setExpenses([expense, ...expenses])
        // Mettre à jour le projet avec le nouveau montant dépensé
        const currentProject = projects.find((p) => p.id === activeProject)
        if (currentProject) {
          const newSpent = (currentProject.spent || 0) + Number.parseFloat(newExpense.amount)
          setProjects(projects.map((p) => (p.id === activeProject ? { ...p, spent: newSpent } : p)))
        }
        setNewExpense({
          description: "",
          amount: "",
          category: "materials",
          date: new Date().toISOString().split("T")[0],
        })
        setShowExpenseForm(false)
      }
    } catch (error) {
      console.error("Error creating expense:", error)
    }
  }

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const success = await DatabaseService.deleteProjectExpense(expenseId, activeProject)
      if (success) {
        const deletedExpense = expenses.find((e) => e.id === expenseId)
        setExpenses(expenses.filter((e) => e.id !== expenseId))

        // Mettre à jour le projet
        if (deletedExpense) {
          const currentProject = projects.find((p) => p.id === activeProject)
          if (currentProject) {
            const newSpent = Math.max(0, (currentProject.spent || 0) - deletedExpense.amount)
            setProjects(projects.map((p) => (p.id === activeProject ? { ...p, spent: newSpent } : p)))
          }
        }
      }
    } catch (error) {
      console.error("Error deleting expense:", error)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeProject || !newUser.user_id) return

    try {
      const projectUser = await DatabaseService.addProjectUser({
        project_id: activeProject,
        user_id: newUser.user_id,
        role: newUser.role,
        permissions: newUser.permissions,
      })

      if (projectUser) {
        setProjectUsers([projectUser, ...projectUsers])
        setNewUser({
          user_id: "",
          role: "worker",
          permissions: [],
        })
        setUserSearchQuery("")
        setSearchResults([])
        setShowUserForm(false)
      }
    } catch (error) {
      console.error("Error adding user:", error)
    }
  }

  const handleRemoveUser = async (projectUserId: string) => {
    try {
      const success = await DatabaseService.removeProjectUser(projectUserId)
      if (success) {
        setProjectUsers(projectUsers.filter((u) => u.id !== projectUserId))
      }
    } catch (error) {
      console.error("Error removing user:", error)
    }
  }

  const handleCreateThreshold = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSensor) return

    try {
      const threshold = await DatabaseService.createIoTThreshold({
        sensor_id: selectedSensor.id,
        min_value: newThreshold.min_value ? Number.parseFloat(newThreshold.min_value) : undefined,
        max_value: newThreshold.max_value ? Number.parseFloat(newThreshold.max_value) : undefined,
        warning_threshold: newThreshold.warning_threshold
          ? Number.parseFloat(newThreshold.warning_threshold)
          : undefined,
        critical_threshold: newThreshold.critical_threshold
          ? Number.parseFloat(newThreshold.critical_threshold)
          : undefined,
      })

      if (threshold) {
        setNewThreshold({
          min_value: "",
          max_value: "",
          warning_threshold: "",
          critical_threshold: "",
        })
        setSelectedSensor(null)
        setShowThresholdForm(false)
      }
    } catch (error) {
      console.error("Error creating threshold:", error)
    }
  }

  const openEditProject = (project: Project) => {
    setEditingProject(project)
    setNewProject({
      name: project.name,
      description: project.description || "",
      budget: project.budget?.toString() || "",
      location: project.location || "",
      start_date: project.start_date || "",
      end_date: project.end_date || "",
    })
    setShowProjectForm(true)
  }

  const openEditMaterial = (material: Material) => {
    setEditingMaterial(material)
    setNewMaterial({
      name: material.name,
      description: material.description || "",
      price: material.price.toString(),
      unit: material.unit,
      category: material.category || "",
      stock_quantity: material.stock_quantity.toString(),
    })
    setShowMaterialForm(true)
  }

  const currentProject = projects.find((p) => p.id === activeProject)

  const handleDroneStatusUpdate = async (droneId: string, status: string, projectId?: string) => {
    try {
      const success = await DatabaseService.updateDroneStatus(droneId, status, projectId)
      if (success) {
        setDrones(drones.map((d) => (d.id === droneId ? { ...d, status: status, project_id: projectId || null } : d)))
      }
    } catch (error) {
      console.error("Error updating drone status:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 mx-auto mb-4 animate-pulse text-[#094468]" />
          <p className="text-lg text-gray-600">Chargement de vos données...</p>
          {isDemoMode && <p className="text-sm text-orange-600 mt-2">Mode démonstration activé</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-[#094468]" />
              <h1 className="text-2xl font-bold text-black">
                TerangaBuild Pro {isDemoMode && <span className="text-sm text-orange-600">(Démo)</span>}
              </h1>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {profile?.company_name || profile?.full_name || profile?.email}
              </span>
              <Link href="/ai-assistant">
                <Button variant="ghost" size="sm">
                  <Brain className="h-4 w-4 mr-2" />
                  Assistant IA
                </Button>
              </Link>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Réalité Augmentée
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <DemoBanner />

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-black mb-2">Tableau de bord Professionnel</h2>
          <p className="text-gray-600">Gérez vos chantiers avec les technologies IoT, drones et BIM</p>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="projects">Projets & BIM</TabsTrigger>
            <TabsTrigger value="iot">IoT & Drones</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="inventory">Inventaire</TabsTrigger>
            <TabsTrigger value="team">Équipes</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-black">Gestion des Projets</h3>
              <Dialog open={showProjectForm} onOpenChange={setShowProjectForm}>
                <DialogTrigger asChild>
                  <Button className="bg-[#094468] hover:bg-[#0a5a7a] text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau Projet
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingProject ? "Modifier le projet" : "Créer un nouveau projet"}</DialogTitle>
                    <DialogDescription>
                      {editingProject
                        ? "Modifiez les informations du projet"
                        : "Remplissez les informations pour créer un nouveau projet"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={editingProject ? handleUpdateProject : handleCreateProject} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nom du projet</Label>
                        <Input
                          id="name"
                          value={newProject.name}
                          onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Localisation</Label>
                        <Input
                          id="location"
                          value={newProject.location}
                          onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="budget">Budget (FCFA)</Label>
                        <Input
                          id="budget"
                          type="number"
                          value={newProject.budget}
                          onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="start_date">Date de début</Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={newProject.start_date}
                          onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_date">Date de fin prévue</Label>
                        <Input
                          id="end_date"
                          type="date"
                          value={newProject.end_date}
                          onChange={(e) => setNewProject({ ...newProject, end_date: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="bg-[#094468] hover:bg-[#0a5a7a] text-white">
                        {editingProject ? "Mettre à jour" : "Créer le projet"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowProjectForm(false)
                          setEditingProject(null)
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {projects.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-black mb-2">Aucun projet pour le moment</h3>
                  <p className="text-gray-600">Créez votre premier projet pour commencer</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Project List */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Projets actifs ({projects.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {projects.map((project) => (
                        <div
                          key={project.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            activeProject === project.id
                              ? "border-[#094468] bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setActiveProject(project.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-black text-sm">{project.name}</h4>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openEditProject(project)
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Supprimer le projet</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteProject(project.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Supprimer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          <Badge className={getStatusColor(project.status)}>{getStatusText(project.status)}</Badge>
                          <div className="text-xs text-gray-600 mb-2 mt-2">
                            Client: {project.client?.full_name || project.client?.email || "Non défini"}
                          </div>
                          <Progress value={project.progress} className="mb-2" />
                          <div className="text-xs text-gray-600">
                            {project.progress}% • {project.location || "Localisation non définie"}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Project Details avec Checklist */}
                <div className="lg:col-span-2 space-y-6">
                  {currentProject && (
                    <>
                      {/* Project Overview avec indicateurs de retard */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            {currentProject.name}
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(currentProject.status)}>
                                {getStatusText(currentProject.status)}
                              </Badge>
                              {(() => {
                                const { isDelayed, delayDays } = calculateProjectDelay(currentProject)
                                return isDelayed ? (
                                  <Badge className="bg-red-100 text-red-800">Retard: {delayDays}j</Badge>
                                ) : null
                              })()}
                            </div>
                          </CardTitle>
                          <CardDescription>Avancement: {currentProject.progress}%</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-gray-600">Budget total</div>
                              <div className="text-lg font-semibold text-black">
                                {currentProject.budget ? formatCurrency(currentProject.budget) : "Non défini"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Dépensé</div>
                              <div className="text-lg font-semibold text-red-600">
                                {currentProject.spent ? formatCurrency(currentProject.spent) : "0 FCFA"}
                              </div>
                            </div>
                          </div>

                          {/* Barres de progression */}
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Avancement du projet</span>
                                <span>{currentProject.progress}%</span>
                              </div>
                              <Progress value={currentProject.progress} className="mb-2" />
                            </div>

                            {currentProject.start_date &&
                              currentProject.end_date &&
                              (() => {
                                const { timeProgress } = calculateProjectDelay(currentProject)
                                return (
                                  <div>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span>Progrès temporel</span>
                                      <span>{Math.round(timeProgress)}%</span>
                                    </div>
                                    <Progress value={timeProgress} className="mb-2" />
                                  </div>
                                )
                              })()}
                          </div>

                          <div className="flex items-center text-sm text-gray-600 mt-4">
                            <Calendar className="h-4 w-4 mr-2" />
                            {currentProject.start_date && currentProject.end_date
                              ? `${new Date(currentProject.start_date).toLocaleDateString("fr-FR")} - ${new Date(currentProject.end_date).toLocaleDateString("fr-FR")}`
                              : "Dates non définies"}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Checklist du projet */}
                      <ProjectChecklist
                        project={currentProject}
                        onProgressUpdate={(progress) => {
                          setProjects(projects.map((p) => (p.id === currentProject.id ? { ...p, progress } : p)))
                        }}
                      />

                      {/* Invitation de collaborateurs */}
                      <ProjectInvitation
                        project={currentProject}
                        onInvitationSent={() => {
                          console.log("Invitation envoyée avec succès")
                        }}
                      />
                    </>
                  )}
                </div>

                {/* Project Stats */}
                <div className="lg:col-span-1 space-y-4">
                  {currentProject && (
                    <>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{currentProject.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <div className="text-sm text-gray-600">Avancement</div>
                            <div className="text-2xl font-bold text-[#094468]">{currentProject.progress}%</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Budget</div>
                            <div className="text-lg font-semibold text-black">
                              {currentProject.budget ? formatCurrency(currentProject.budget) : "Non défini"}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Dépensé</div>
                            <div className="text-lg font-semibold text-red-600">
                              {currentProject.spent ? formatCurrency(currentProject.spent) : "0 FCFA"}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Technologies actives</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Cpu className="h-4 w-4 text-[#094468] mr-2" />
                              <span className="text-sm">Capteurs IoT</span>
                            </div>
                            <Badge>{iotSensors.length}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Drone className="h-4 w-4 text-[#094468] mr-2" />
                              <span className="text-sm">Drones actifs</span>
                            </div>
                            <Badge>{drones.filter((d) => d.status === "in_flight").length}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="iot" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Capteurs actifs</p>
                      <p className="text-2xl font-bold text-[#094468]">{iotSensors.length}</p>
                    </div>
                    <Cpu className="h-8 w-8 text-[#094468]" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Drones disponibles</p>
                      <p className="text-2xl font-bold text-[#094468]">
                        {drones.filter((d) => d.status === "available").length}
                      </p>
                    </div>
                    <Drone className="h-8 w-8 text-[#094468]" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Alertes</p>
                      <p className="text-2xl font-bold text-orange-500">
                        {iotSensors.filter((s) => s.status === "warning" || s.status === "critical").length}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Projets surveillés</p>
                      <p className="text-2xl font-bold text-green-500">{projects.length}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* IoT Sensors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Cpu className="h-5 w-5 mr-2 text-[#094468]" />
                    Capteurs IoT en temps réel
                    {currentProject && (
                      <span className="ml-2 text-sm font-normal text-gray-600">- {currentProject.name}</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {iotSensors.length === 0 ? (
                      <div className="text-center py-8">
                        <Cpu className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">
                          {currentProject
                            ? "Aucun capteur IoT configuré pour ce projet"
                            : "Sélectionnez un projet pour voir les capteurs"}
                        </p>
                      </div>
                    ) : (
                      iotSensors.map((sensor) => (
                        <div key={sensor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                sensor.status === "normal"
                                  ? "bg-green-500"
                                  : sensor.status === "warning"
                                    ? "bg-orange-500"
                                    : "bg-red-500"
                              }`}
                            />
                            <div>
                              <div className="font-medium text-black">{sensor.sensor_type}</div>
                              <div className="text-sm text-gray-600">{sensor.location}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="font-semibold text-[#094468]">
                                {sensor.value}
                                {sensor.unit}
                              </div>
                              <div
                                className={`text-xs ${
                                  sensor.status === "normal"
                                    ? "text-green-600"
                                    : sensor.status === "warning"
                                      ? "text-orange-600"
                                      : "text-red-600"
                                }`}
                              >
                                {getStatusText(sensor.status)}
                              </div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => setSelectedSensor(sensor)}>
                              <Settings className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Drone Control */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Drone className="h-5 w-5 mr-2 text-[#094468]" />
                    Contrôle Drones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {drones.length === 0 ? (
                      <div className="text-center py-8">
                        <Drone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Aucun drone disponible</p>
                      </div>
                    ) : (
                      drones.map((drone) => (
                        <div key={drone.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-black">{drone.name}</h4>
                            <Badge className={getStatusColor(drone.status)}>{getStatusText(drone.status)}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-gray-600">Modèle:</span>
                              <span className="ml-2 font-medium">{drone.model || "Non défini"}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Batterie:</span>
                              <span className="ml-2 font-medium">{drone.battery_level}%</span>
                            </div>
                            {drone.altitude && (
                              <div>
                                <span className="text-gray-600">Altitude:</span>
                                <span className="ml-2 font-medium">{drone.altitude}m</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {drone.status === "available" && (
                              <Button
                                size="sm"
                                onClick={() => handleDroneStatusUpdate(drone.id, "in_flight", activeProject)}
                                className="bg-[#094468] hover:bg-[#0a5a7a] text-white"
                              >
                                Déployer
                              </Button>
                            )}
                            {drone.status === "in_flight" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDroneStatusUpdate(drone.id, "available")}
                              >
                                Rappeler
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Commandes récentes ({orders.length})</CardTitle>
                <CardDescription>Gérez les commandes de vos clients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Aucune commande reçue</p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Package className="h-8 w-8 text-[#094468]" />
                          <div>
                            <div className="font-medium text-black">{order.order_number}</div>
                            <div className="text-sm text-gray-600">
                              Client: {order.client?.full_name || order.client?.email || "Non défini"}
                            </div>
                            <div className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleDateString("fr-FR")}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-black">{formatCurrency(order.total_amount)}</div>
                          <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-black">Gestion d'inventaire</h3>
                <p className="text-gray-600">Gérez vos stocks de matériaux et équipements</p>
              </div>
              <Dialog open={showMaterialForm} onOpenChange={setShowMaterialForm}>
                <DialogTrigger asChild>
                  <Button className="bg-[#094468] hover:bg-[#0a5a7a] text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un matériau
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingMaterial ? "Modifier le matériau" : "Ajouter un nouveau matériau"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingMaterial
                        ? "Modifiez les informations du matériau"
                        : "Remplissez les informations pour ajouter un nouveau matériau"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={editingMaterial ? handleUpdateMaterial : handleCreateMaterial} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nom du matériau</Label>
                        <Input
                          id="name"
                          value={newMaterial.name}
                          onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Catégorie</Label>
                        <Select
                          value={newMaterial.category}
                          onValueChange={(value) => setNewMaterial({ ...newMaterial, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ciment">Ciment</SelectItem>
                            <SelectItem value="Ferraillage">Ferraillage</SelectItem>
                            <SelectItem value="Granulats">Granulats</SelectItem>
                            <SelectItem value="Maçonnerie">Maçonnerie</SelectItem>
                            <SelectItem value="Finitions">Finitions</SelectItem>
                            <SelectItem value="Outils">Outils</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="price">Prix</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newMaterial.price}
                          onChange={(e) => setNewMaterial({ ...newMaterial, price: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="unit">Unité</Label>
                        <Select
                          value={newMaterial.unit}
                          onValueChange={(value) => setNewMaterial({ ...newMaterial, unit: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une unité" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sac">Sac</SelectItem>
                            <SelectItem value="kg">Kilogramme</SelectItem>
                            <SelectItem value="m³">Mètre cube</SelectItem>
                            <SelectItem value="m²">Mètre carré</SelectItem>
                            <SelectItem value="unité">Unité</SelectItem>
                            <SelectItem value="litre">Litre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="stock_quantity">Quantité en stock</Label>
                        <Input
                          id="stock_quantity"
                          type="number"
                          value={newMaterial.stock_quantity}
                          onChange={(e) => setNewMaterial({ ...newMaterial, stock_quantity: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newMaterial.description}
                        onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                        placeholder="Description du matériau..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="bg-[#094468] hover:bg-[#0a5a7a] text-white">
                        {editingMaterial ? "Mettre à jour" : "Créer le matériau"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowMaterialForm(false)
                          setEditingMaterial(null)
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {materials.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-black mb-2">Aucun matériau en stock</h3>
                  <p className="text-gray-600 mb-6">Commencez par ajouter vos premiers matériaux</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <h4 className="font-semibold text-black mb-2">{material.name}</h4>
                      <div className="text-lg font-bold text-[#094468] mb-2">
                        {formatCurrency(material.price)}/{material.unit}
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        Stock: {material.stock_quantity} {material.unit}
                      </div>
                      <div className="text-sm text-gray-600 mb-3">Catégorie: {material.category || "Non définie"}</div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm">{material.rating}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => openEditMaterial(material)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 bg-transparent"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer le matériau</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer ce matériau ? Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteMaterial(material.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-[#094468] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Gestion d'équipe</h3>
              <p className="text-gray-600 mb-6">
                Planifiez et coordonnez vos équipes sur les {projects.length} chantiers actifs
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-[#094468] mb-2">{projects.length}</div>
                    <div className="text-sm text-gray-600">Projets actifs</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-[#094468] mb-2">
                      {projects.reduce((acc, p) => acc + (p.budget || 0), 0) > 0
                        ? formatCurrency(projects.reduce((acc, p) => acc + (p.budget || 0), 0))
                        : "0 FCFA"}
                    </div>
                    <div className="text-sm text-gray-600">Budget total</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-[#094468] mb-2">
                      {Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / Math.max(projects.length, 1))}%
                    </div>
                    <div className="text-sm text-gray-600">Avancement moyen</div>
                  </CardContent>
                </Card>
              </div>
              <Button className="bg-[#094468] hover:bg-[#0a5a7a] text-white">
                <Calendar className="h-4 w-4 mr-2" />
                Planning équipes
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Projets terminés</p>
                      <p className="text-2xl font-bold text-green-500">
                        {projects.filter((p) => p.status === "completed").length}
                      </p>
                    </div>
                    <Building2 className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Chiffre d'affaires</p>
                      <p className="text-2xl font-bold text-[#094468]">
                        {formatCurrency(orders.reduce((acc, o) => acc + o.total_amount, 0))}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-[#094468]" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Matériaux en stock</p>
                      <p className="text-2xl font-bold text-blue-500">{materials.length}</p>
                    </div>
                    <Package className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Commandes traitées</p>
                      <p className="text-2xl font-bold text-purple-500">{orders.length}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-[#094468] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Analytics & Rapports détaillés</h3>
              <p className="text-gray-600 mb-6">
                Analysez les performances de vos {projects.length} projets et générez des rapports détaillés
              </p>
              <Button className="bg-[#094468] hover:bg-[#0a5a7a] text-white">
                <BarChart3 className="h-4 w-4 mr-2" />
                Voir les analytics avancées
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function ProDashboard() {
  return (
    <RouteGuard requiredUserType="professional">
      <ProDashboardContent />
    </RouteGuard>
  )
}

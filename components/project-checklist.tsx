"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  CheckCircle2,
  Circle,
  Plus,
  Edit,
  Trash2,
  Clock,
  AlertTriangle,
  Calendar,
  Flag,
  Target,
  TrendingUp,
  TrendingDown,
  Timer,
} from "lucide-react"
import {
  DatabaseService,
  calculateProjectDelay,
  getStatusColor,
  getStatusText,
  type Project,
  type ChecklistItem,
} from "@/lib/supabase-client"

interface ProjectChecklistProps {
  project: Project
  onProgressUpdate: (progress: number) => void
}

export function ProjectChecklist({ project, onProgressUpdate }: ProjectChecklistProps) {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null)

  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    estimated_duration: "",
    priority: "medium" as "low" | "medium" | "high" | "critical",
    due_date: "",
  })

  // Calcul des métriques de retard
  const { isDelayed, delayDays, timeProgress } = calculateProjectDelay(project)

  useEffect(() => {
    loadChecklistItems()
  }, [project.id])

  const loadChecklistItems = async () => {
    setLoading(true)
    try {
      const items = await DatabaseService.getProjectChecklist(project.id)
      setChecklistItems(items)
    } catch (error) {
      console.error("Error loading checklist items:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleComplete = async (item: ChecklistItem) => {
    const updates: Partial<ChecklistItem> = {
      is_completed: !item.is_completed,
      completed_at: !item.is_completed ? new Date().toISOString() : undefined,
      completed_by: !item.is_completed ? "current-user-id" : undefined,
    }

    try {
      const success = await DatabaseService.updateChecklistItem(item.id, updates)
      if (success) {
        const updatedItems = checklistItems.map((i) => (i.id === item.id ? { ...i, ...updates } : i))
        setChecklistItems(updatedItems)

        // Calculer le nouveau progrès automatiquement
        const completedCount = updatedItems.filter((i) => i.is_completed).length
        const progress = Math.round((completedCount / updatedItems.length) * 100)
        onProgressUpdate(progress)
      }
    } catch (error) {
      console.error("Error updating checklist item:", error)
    }
  }

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault()

    const itemData: Omit<ChecklistItem, "id" | "created_at" | "updated_at"> = {
      project_id: project.id,
      title: newItem.title,
      description: newItem.description,
      order_index: checklistItems.length + 1,
      estimated_duration: newItem.estimated_duration ? Number.parseInt(newItem.estimated_duration) : undefined,
      priority: newItem.priority,
      due_date: newItem.due_date || undefined,
      is_completed: false,
      dependencies: [],
    }

    try {
      const createdItem = await DatabaseService.createChecklistItem(itemData)
      if (createdItem) {
        setChecklistItems([...checklistItems, createdItem])
        setNewItem({
          title: "",
          description: "",
          estimated_duration: "",
          priority: "medium",
          due_date: "",
        })
        setShowAddForm(false)
      }
    } catch (error) {
      console.error("Error creating checklist item:", error)
    }
  }

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    const updates: Partial<ChecklistItem> = {
      title: newItem.title,
      description: newItem.description,
      estimated_duration: newItem.estimated_duration ? Number.parseInt(newItem.estimated_duration) : undefined,
      priority: newItem.priority,
      due_date: newItem.due_date || undefined,
    }

    try {
      const success = await DatabaseService.updateChecklistItem(editingItem.id, updates)
      if (success) {
        setChecklistItems(checklistItems.map((item) => (item.id === editingItem.id ? { ...item, ...updates } : item)))
        setEditingItem(null)
        setShowAddForm(false)
      }
    } catch (error) {
      console.error("Error updating checklist item:", error)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      // Simuler la suppression (implémenter DatabaseService.deleteChecklistItem si nécessaire)
      setChecklistItems(checklistItems.filter((item) => item.id !== itemId))

      // Recalculer le progrès
      const updatedItems = checklistItems.filter((item) => item.id !== itemId)
      const completedCount = updatedItems.filter((i) => i.is_completed).length
      const progress = updatedItems.length > 0 ? Math.round((completedCount / updatedItems.length) * 100) : 0
      onProgressUpdate(progress)
    } catch (error) {
      console.error("Error deleting checklist item:", error)
    }
  }

  const openEditItem = (item: ChecklistItem) => {
    setEditingItem(item)
    setNewItem({
      title: item.title,
      description: item.description || "",
      estimated_duration: item.estimated_duration?.toString() || "",
      priority: item.priority,
      due_date: item.due_date || "",
    })
    setShowAddForm(true)
  }

  const resetForm = () => {
    setNewItem({
      title: "",
      description: "",
      estimated_duration: "",
      priority: "medium",
      due_date: "",
    })
    setEditingItem(null)
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "high":
        return <Flag className="h-4 w-4 text-orange-500" />
      case "medium":
        return <Flag className="h-4 w-4 text-yellow-500" />
      case "low":
        return <Flag className="h-4 w-4 text-green-500" />
      default:
        return <Flag className="h-4 w-4 text-gray-500" />
    }
  }

  const isOverdue = (item: ChecklistItem) => {
    if (!item.due_date || item.is_completed) return false
    return new Date(item.due_date) < new Date()
  }

  const completedItems = checklistItems.filter((item) => item.is_completed)
  const progress = checklistItems.length > 0 ? Math.round((completedItems.length / checklistItems.length) * 100) : 0
  const criticalItems = checklistItems.filter((item) => item.priority === "critical" && !item.is_completed)
  const overdueItems = checklistItems.filter((item) => isOverdue(item))

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#094468]"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble avec métriques avancées */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-[#094468]" />
                Checklist du Projet
              </CardTitle>
              <CardDescription>
                {completedItems.length} sur {checklistItems.length} étapes terminées ({progress}%)
              </CardDescription>
            </div>
            <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
              <DialogTrigger asChild>
                <Button className="bg-[#094468] hover:bg-[#0a5a7a] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter étape
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingItem ? "Modifier l'étape" : "Ajouter une nouvelle étape"}</DialogTitle>
                  <DialogDescription>
                    {editingItem
                      ? "Modifiez les informations de l'étape"
                      : "Définissez une nouvelle étape pour votre projet"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={editingItem ? handleUpdateItem : handleCreateItem} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="title">Titre de l'étape</Label>
                      <Input
                        id="title"
                        value={newItem.title}
                        onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                        placeholder="Ex: Coulage des fondations"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">Priorité</Label>
                      <Select
                        value={newItem.priority}
                        onValueChange={(value: "low" | "medium" | "high" | "critical") =>
                          setNewItem({ ...newItem, priority: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Basse</SelectItem>
                          <SelectItem value="medium">Moyenne</SelectItem>
                          <SelectItem value="high">Haute</SelectItem>
                          <SelectItem value="critical">Critique</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="estimated_duration">Durée estimée (jours)</Label>
                      <Input
                        id="estimated_duration"
                        type="number"
                        value={newItem.estimated_duration}
                        onChange={(e) => setNewItem({ ...newItem, estimated_duration: e.target.value })}
                        placeholder="Ex: 7"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="due_date">Date d'échéance</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={newItem.due_date}
                        onChange={(e) => setNewItem({ ...newItem, due_date: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        placeholder="Description détaillée de l'étape..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="bg-[#094468] hover:bg-[#0a5a7a] text-white">
                      {editingItem ? "Mettre à jour" : "Créer l'étape"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false)
                        resetForm()
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Barres de progression */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Avancement du projet</span>
                  <span className="text-sm text-gray-600">{progress}%</span>
                </div>
                <Progress value={progress} className="mb-2" />
              </div>

              {/* Barre de progression temporelle */}
              {project.start_date && project.end_date && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progrès temporel</span>
                    <span className="text-sm text-gray-600">{Math.round(timeProgress)}%</span>
                  </div>
                  <Progress value={timeProgress} className="mb-2" />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Début: {new Date(project.start_date).toLocaleDateString("fr-FR")}</span>
                    <span>Fin: {new Date(project.end_date).toLocaleDateString("fr-FR")}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Indicateurs de retard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                {isDelayed ? (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">
                      Retard: {delayDays} jour{delayDays > 1 ? "s" : ""}
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Dans les temps</span>
                  </>
                )}
              </div>
              {criticalItems.length > 0 && (
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">{criticalItems.length} étape(s) critique(s)</span>
                </div>
              )}
              {overdueItems.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Timer className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-orange-600">{overdueItems.length} étape(s) en retard</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des étapes */}
      <Card>
        <CardHeader>
          <CardTitle>Étapes du projet</CardTitle>
          <CardDescription>Suivez et marquez les étapes comme terminées</CardDescription>
        </CardHeader>
        <CardContent>
          {checklistItems.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Aucune étape définie pour ce projet</p>
              <p className="text-sm text-gray-500 mb-4">Commencez par ajouter les étapes de votre projet</p>
              <Button className="bg-[#094468] hover:bg-[#0a5a7a] text-white" onClick={() => setShowAddForm(true)}>
                Créer la première étape
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {checklistItems
                .sort((a, b) => a.order_index - b.order_index)
                .map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-start space-x-3 p-4 rounded-lg border transition-colors ${
                      item.is_completed
                        ? "bg-green-50 border-green-200"
                        : isOverdue(item)
                          ? "bg-red-50 border-red-200"
                          : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <button onClick={() => handleToggleComplete(item)} className="mt-1 flex-shrink-0">
                      {item.is_completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4
                          className={`font-medium ${
                            item.is_completed ? "text-green-800 line-through" : "text-gray-900"
                          }`}
                        >
                          {item.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {getPriorityIcon(item.priority)}
                          <Badge className={getStatusColor(item.priority)} variant="outline">
                            {getStatusText(item.priority)}
                          </Badge>
                          {isOverdue(item) && <Badge className="bg-red-100 text-red-800">En retard</Badge>}
                        </div>
                      </div>

                      {item.description && (
                        <p className={`text-sm mb-2 ${item.is_completed ? "text-green-700" : "text-gray-600"}`}>
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {item.estimated_duration && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {item.estimated_duration} jour{item.estimated_duration > 1 ? "s" : ""}
                              </span>
                            </div>
                          )}
                          {item.due_date && (
                            <div className={`flex items-center space-x-1 ${isOverdue(item) ? "text-red-600" : ""}`}>
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(item.due_date).toLocaleDateString("fr-FR")}
                                {isOverdue(item) && " (En retard)"}
                              </span>
                            </div>
                          )}
                          {item.completed_at && (
                            <div className="text-green-600">
                              Terminé le {new Date(item.completed_at).toLocaleDateString("fr-FR")}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => openEditItem(item)} className="h-6 w-6 p-0">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-600 hover:text-red-700">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer l'étape</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer cette étape ? Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  UserPlus,
  Mail,
  Shield,
  Eye,
  Edit,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Settings,
  Key,
  Send,
} from "lucide-react"
import { DatabaseService, type Project } from "@/lib/supabase-client"

interface ProjectInvitationProps {
  project: Project
  onInvitationSent: () => void
}

export function ProjectInvitation({ project, onInvitationSent }: ProjectInvitationProps) {
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const [invitationData, setInvitationData] = useState({
    email: "",
    role: "worker" as "client" | "manager" | "supervisor" | "worker" | "observer",
    message: "",
    permissions: [] as string[],
  })

  const rolePermissions = {
    client: {
      label: "Client",
      description: "Peut voir le projet et communiquer avec l'équipe",
      permissions: ["view_project", "view_progress", "view_expenses", "comment"],
      color: "text-blue-600",
      icon: <Users className="h-4 w-4" />,
    },
    manager: {
      label: "Chef de projet",
      description: "Gestion complète du projet et de l'équipe",
      permissions: [
        "view_project",
        "edit_project",
        "manage_team",
        "manage_expenses",
        "manage_checklist",
        "invite_users",
      ],
      color: "text-purple-600",
      icon: <Shield className="h-4 w-4" />,
    },
    supervisor: {
      label: "Superviseur",
      description: "Supervision et validation des étapes",
      permissions: ["view_project", "edit_checklist", "view_team", "view_expenses", "validate_tasks"],
      color: "text-orange-600",
      icon: <Eye className="h-4 w-4" />,
    },
    worker: {
      label: "Ouvrier",
      description: "Exécution des tâches assignées",
      permissions: ["view_project", "edit_checklist", "comment"],
      color: "text-green-600",
      icon: <Edit className="h-4 w-4" />,
    },
    observer: {
      label: "Observateur",
      description: "Consultation uniquement",
      permissions: ["view_project", "view_progress"],
      color: "text-gray-600",
      icon: <Eye className="h-4 w-4" />,
    },
  }

  const permissionLabels = {
    view_project: "Voir le projet",
    edit_project: "Modifier le projet",
    manage_team: "Gérer l'équipe",
    manage_expenses: "Gérer les dépenses",
    manage_checklist: "Gérer la checklist",
    edit_checklist: "Modifier la checklist",
    view_team: "Voir l'équipe",
    view_expenses: "Voir les dépenses",
    view_progress: "Voir le progrès",
    validate_tasks: "Valider les tâches",
    invite_users: "Inviter des utilisateurs",
    comment: "Commenter",
  }

  const handleRoleChange = (role: "client" | "manager" | "supervisor" | "worker" | "observer") => {
    setInvitationData({
      ...invitationData,
      role,
      permissions: rolePermissions[role].permissions,
    })
  }

  const handlePermissionChange = (permission: string, checked: boolean) => {
    const newPermissions = checked
      ? [...invitationData.permissions, permission]
      : invitationData.permissions.filter((p) => p !== permission)

    setInvitationData({
      ...invitationData,
      permissions: newPermissions,
    })
  }

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const invitation = await DatabaseService.createProjectInvitation({
        project_id: project.id,
        invited_by: "current-user-id", // Remplacer par l'ID utilisateur réel
        invited_email: invitationData.email,
        role: invitationData.role,
        permissions: invitationData.permissions,
        message: invitationData.message,
        status: "pending",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 jours
      })

      if (invitation) {
        // Simuler l'envoi d'email
        console.log("Invitation envoyée à:", invitationData.email)

        setInvitationData({
          email: "",
          role: "worker",
          message: "",
          permissions: [],
        })
        setShowInviteForm(false)
        onInvitationSent()

        // Afficher une notification de succès
        alert(`Invitation envoyée avec succès à ${invitationData.email}`)
      }
    } catch (error) {
      console.error("Error sending invitation:", error)
      alert("Erreur lors de l'envoi de l'invitation")
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role: string) => {
    return rolePermissions[role as keyof typeof rolePermissions]?.icon || <Users className="h-4 w-4" />
  }

  const getRoleLabel = (role: string) => {
    return rolePermissions[role as keyof typeof rolePermissions]?.label || role
  }

  const getRoleColor = (role: string) => {
    return rolePermissions[role as keyof typeof rolePermissions]?.color || "text-gray-600"
  }

  // Données de démonstration pour les invitations
  const demoInvitations = [
    {
      id: "1",
      email: "jean.dupont@email.com",
      role: "supervisor",
      status: "pending",
      sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "2",
      email: "marie.martin@email.com",
      role: "worker",
      status: "accepted",
      sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: "3",
      email: "paul.bernard@email.com",
      role: "client",
      status: "declined",
      sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2 text-[#094468]" />
              Inviter des collaborateurs
            </CardTitle>
            <CardDescription>
              Invitez des clients, professionnels ou ouvriers à rejoindre ce projet avec des rôles spécifiques
            </CardDescription>
          </div>
          <Dialog open={showInviteForm} onOpenChange={setShowInviteForm}>
            <DialogTrigger asChild>
              <Button className="bg-[#094468] hover:bg-[#0a5a7a] text-white">
                <Mail className="h-4 w-4 mr-2" />
                Envoyer invitation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Send className="h-5 w-5 mr-2 text-[#094468]" />
                  Inviter un collaborateur
                </DialogTitle>
                <DialogDescription>
                  Invitez une personne à rejoindre le projet "{project.name}" avec des rôles et permissions spécifiques
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSendInvitation} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="email">Adresse email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={invitationData.email}
                      onChange={(e) => setInvitationData({ ...invitationData, email: e.target.value })}
                      placeholder="exemple@email.com"
                      required
                    />
                  </div>
                </div>

                {/* Sélection du rôle */}
                <div>
                  <Label>Rôle</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {Object.entries(rolePermissions).map(([key, role]) => (
                      <div
                        key={key}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          invitationData.role === key
                            ? "border-[#094468] bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleRoleChange(key as any)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${role.color} bg-current bg-opacity-10`}>{role.icon}</div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{role.label}</div>
                            <div className="text-sm text-gray-600">{role.description}</div>
                          </div>
                          {invitationData.role === key && <CheckCircle2 className="h-5 w-5 text-[#094468]" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Permissions personnalisées */}
                <div>
                  <Label className="flex items-center">
                    <Key className="h-4 w-4 mr-2" />
                    Permissions spécifiques
                  </Label>
                  <p className="text-sm text-gray-600 mb-3">Personnalisez les permissions pour ce rôle (optionnel)</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(permissionLabels).map(([permission, label]) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission}
                          checked={invitationData.permissions.includes(permission)}
                          onCheckedChange={(checked) => handlePermissionChange(permission, checked as boolean)}
                        />
                        <Label htmlFor={permission} className="text-sm">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Message personnalisé (optionnel)</Label>
                  <Textarea
                    id="message"
                    value={invitationData.message}
                    onChange={(e) => setInvitationData({ ...invitationData, message: e.target.value })}
                    placeholder="Ajoutez un message personnel à votre invitation..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="bg-[#094468] hover:bg-[#0a5a7a] text-white">
                    {loading ? "Envoi en cours..." : "Envoyer l'invitation"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowInviteForm(false)}>
                    Annuler
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Invitations envoyées */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              Invitations envoyées
            </h4>
            <div className="space-y-3">
              {demoInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    invitation.status === "accepted"
                      ? "bg-green-50 border-green-200"
                      : invitation.status === "declined"
                        ? "bg-red-50 border-red-200"
                        : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {invitation.status === "accepted" && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    {invitation.status === "pending" && <Clock className="h-5 w-5 text-yellow-600" />}
                    {invitation.status === "declined" && <XCircle className="h-5 w-5 text-red-600" />}
                    <div>
                      <div className="font-medium text-gray-900">{invitation.email}</div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className={getRoleColor(invitation.role)}>{getRoleIcon(invitation.role)}</span>
                        <span>{getRoleLabel(invitation.role)}</span>
                        <Badge
                          className={
                            invitation.status === "accepted"
                              ? "bg-green-100 text-green-800"
                              : invitation.status === "declined"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {invitation.status === "accepted"
                            ? "Accepté"
                            : invitation.status === "declined"
                              ? "Décliné"
                              : "En attente"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {invitation.status === "accepted"
                      ? `Accepté ${Math.floor((Date.now() - invitation.sentAt.getTime()) / (1000 * 60 * 60 * 24))} jour(s) après`
                      : invitation.status === "declined"
                        ? `Décliné il y a ${Math.floor((Date.now() - invitation.sentAt.getTime()) / (1000 * 60 * 60 * 24))} jour(s)`
                        : `Envoyé il y a ${Math.floor((Date.now() - invitation.sentAt.getTime()) / (1000 * 60 * 60 * 24))} jour(s)`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guide d'utilisation */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-3 flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Comment ça marche ?
            </h4>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start">
                <span className="font-medium mr-2">1.</span>
                Saisissez l'email de la personne à inviter
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">2.</span>
                Choisissez le rôle approprié selon ses responsabilités
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">3.</span>
                Personnalisez les permissions si nécessaire
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">4.</span>
                Ajoutez un message personnel (optionnel)
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">5.</span>
                L'invitation sera envoyée par email avec un lien d'acceptation
              </li>
            </ul>
          </div>

          {/* Résumé des rôles */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Rôles et permissions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(rolePermissions).map(([key, role]) => (
                <div key={key} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-lg ${role.color} bg-current bg-opacity-10`}>{role.icon}</div>
                  <div>
                    <div className="font-medium text-gray-900">{role.label}</div>
                    <div className="text-xs text-gray-600">{role.permissions.length} permissions</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

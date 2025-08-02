"use client"

import { useState, useEffect } from "react"

type Language = "fr" | "en"

interface Translations {
  [key: string]: {
    fr: string
    en: string
  }
}

const translations: Translations = {
  // Navigation
  dashboard: { fr: "Tableau de bord", en: "Dashboard" },
  projects: { fr: "Mes Projets", en: "My Projects" },
  marketplace: { fr: "Marketplace", en: "Marketplace" },
  professionals: { fr: "Professionnels", en: "Professionals" },
  properties: { fr: "Immobilier", en: "Real Estate" },
  financing: { fr: "Financement", en: "Financing" },

  // Actions
  logout: { fr: "Déconnexion", en: "Logout" },
  profile: { fr: "Profil", en: "Profile" },
  settings: { fr: "Paramètres", en: "Settings" },
  search: { fr: "Rechercher", en: "Search" },
  create: { fr: "Créer", en: "Create" },
  edit: { fr: "Modifier", en: "Edit" },
  delete: { fr: "Supprimer", en: "Delete" },
  save: { fr: "Enregistrer", en: "Save" },
  cancel: { fr: "Annuler", en: "Cancel" },

  // Status
  completed: { fr: "Terminé", en: "Completed" },
  in_progress: { fr: "En cours", en: "In Progress" },
  planning: { fr: "Planification", en: "Planning" },
  on_hold: { fr: "En attente", en: "On Hold" },
  delivered: { fr: "Livré", en: "Delivered" },
  confirmed: { fr: "Confirmé", en: "Confirmed" },
  pending: { fr: "En attente", en: "Pending" },
  cancelled: { fr: "Annulé", en: "Cancelled" },

  // Common
  loading: { fr: "Chargement...", en: "Loading..." },
  error: { fr: "Erreur", en: "Error" },
  success: { fr: "Succès", en: "Success" },
  welcome: { fr: "Bienvenue", en: "Welcome" },
  hello: { fr: "Bonjour", en: "Hello" },

  // Project specific
  project_name: { fr: "Nom du projet", en: "Project Name" },
  project_description: { fr: "Description du projet", en: "Project Description" },
  budget: { fr: "Budget", en: "Budget" },
  spent: { fr: "Dépensé", en: "Spent" },
  progress: { fr: "Avancement", en: "Progress" },
  location: { fr: "Localisation", en: "Location" },

  // Materials
  materials: { fr: "Matériaux", en: "Materials" },
  price: { fr: "Prix", en: "Price" },
  stock: { fr: "Stock", en: "Stock" },
  supplier: { fr: "Fournisseur", en: "Supplier" },

  // Orders
  orders: { fr: "Commandes", en: "Orders" },
  quantity: { fr: "Quantité", en: "Quantity" },
  total: { fr: "Total", en: "Total" },

  // Profile
  full_name: { fr: "Nom complet", en: "Full Name" },
  email: { fr: "Email", en: "Email" },
  phone: { fr: "Téléphone", en: "Phone" },
  company: { fr: "Entreprise", en: "Company" },

  // Theme
  light_theme: { fr: "Thème clair", en: "Light Theme" },
  dark_theme: { fr: "Thème sombre", en: "Dark Theme" },

  // Language
  french: { fr: "Français", en: "French" },
  english: { fr: "Anglais", en: "English" },
}

export function useLanguage() {
  const [language, setLanguage] = useState<Language>("fr")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem("language", newLanguage)
  }

  const t = (key: string): string => {
    return translations[key]?.[language] || key
  }

  return {
    language,
    changeLanguage,
    t,
    isFrench: language === "fr",
    isEnglish: language === "en",
  }
}

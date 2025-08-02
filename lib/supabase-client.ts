import { createClient } from "@supabase/supabase-js"

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Mode démo si les variables d'environnement ne sont pas définies
export const isDemoMode = !supabaseUrl || !supabaseAnonKey

// Client Supabase (ou client factice en mode démo)
export const supabase = isDemoMode
  ? ({
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: () => Promise.resolve({ error: null }),
        signUp: () => Promise.resolve({ data: null, error: null }),
        signInWithPassword: () => Promise.resolve({ error: null }),
      },
    } as any)
  : createClient(supabaseUrl!, supabaseAnonKey!)

// Types
export interface Profile {
  id: string
  email: string
  full_name?: string
  user_type: "client" | "professional"
  company_name?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description?: string
  status: "planning" | "in_progress" | "completed" | "on_hold"
  progress: number
  budget?: number
  spent?: number
  location?: string
  client_id: string
  professional_id?: string
  start_date?: string
  end_date?: string
  created_at: string
  updated_at: string
  client?: Profile
  professional?: Profile
}

export interface Material {
  id: string
  name: string
  description?: string
  price: number
  unit: string
  stock_quantity: number
  supplier_id: string
  category?: string
  rating: number
  image_url?: string
  created_at: string
  updated_at: string
  supplier?: Profile
}

export interface Order {
  id: string
  order_number: string
  client_id: string
  supplier_id: string
  project_id?: string
  material_id?: string
  quantity: number
  unit_price: number
  total_price: number
  status: "pending" | "confirmed" | "preparing" | "shipped" | "delivered" | "cancelled"
  created_at: string
  updated_at: string
  client?: Profile
  supplier?: Profile
  project?: Project
  material?: Material
}

export interface ChecklistItem {
  id: string
  project_id: string
  template_id?: string
  title: string
  description?: string
  order_index: number
  estimated_duration?: number
  dependencies?: string[]
  is_completed: boolean
  completed_at?: string
  completed_by?: string
  due_date?: string
  priority: "low" | "medium" | "high" | "critical"
  created_at: string
  updated_at: string
}

export interface ProjectInvitation {
  id: string
  project_id: string
  invited_by: string
  invited_email: string
  invited_user_id?: string
  role: "client" | "manager" | "supervisor" | "worker" | "observer"
  permissions: string[]
  status: "pending" | "accepted" | "declined" | "expired"
  message?: string
  expires_at: string
  responded_at?: string
  created_at: string
  updated_at: string
  project?: Project
  inviter?: Profile
}

export interface TeamMember {
  id: string
  project_id: string
  user_id: string
  role: "manager" | "worker" | "supervisor"
  permissions: string[]
  created_at: string
  updated_at: string
  user?: Profile
  project?: Project
}

export interface DroneType {
  id: string
  name: string
  status: "available" | "in_use" | "maintenance"
  project_id: string | null
  created_at: string
  updated_at: string
}

export interface IoTSensor {
  id: string
  project_id: string
  sensor_type: string
  location: string
  value: number
  unit: string
  status: "normal" | "warning" | "critical"
  created_at: string
  updated_at: string
}

export interface Drone {
  id: string
  name: string
  model?: string
  status: "available" | "in_flight" | "maintenance" | "offline"
  battery_level: number
  altitude?: number
  project_id?: string | null
  created_at: string
  updated_at: string
}

export interface ProjectActivity {
  id: string
  project_id: string
  activity_type: string
  description: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface ProjectExpense {
  id: string
  project_id: string
  description: string
  amount: number
  category: "materials" | "labor" | "equipment" | "other"
  date: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface ProjectUser {
  id: string
  project_id: string
  user_id: string
  role: "manager" | "supervisor" | "worker" | "observer"
  permissions: string[]
  created_at: string
  updated_at: string
  user?: Profile
}

// Cache simple pour les performances
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 30000 // 30 secondes

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

function setCachedData<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() })
}

// Données de démonstration étendues avec plus de matériaux
const demoMaterials: Material[] = [
  {
    id: "demo-material-1",
    name: "Ciment Portland CEM II 42.5",
    description: "Sac de ciment de 50kg, qualité premium pour béton armé",
    price: 4500,
    unit: "sac",
    stock_quantity: 150,
    supplier_id: "demo-supplier-1",
    category: "Ciment",
    rating: 4.8,
    image_url: "/placeholder.svg?height=200&width=200",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    supplier: {
      id: "demo-supplier-1",
      email: "supplier@demo.com",
      full_name: "Moussa Kane",
      user_type: "professional",
      company_name: "Matériaux du Sahel",
      phone: "+221 76 555 1234",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  },
  {
    id: "demo-material-2",
    name: "Fer à béton HA 12mm",
    description: "Barre de fer à béton haute adhérence de 12mm, longueur 12m",
    price: 8500,
    unit: "barre",
    stock_quantity: 80,
    supplier_id: "demo-supplier-1",
    category: "Ferraillage",
    rating: 4.6,
    image_url: "/placeholder.svg?height=200&width=200",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    supplier: {
      id: "demo-supplier-1",
      email: "supplier@demo.com",
      full_name: "Moussa Kane",
      user_type: "professional",
      company_name: "Matériaux du Sahel",
      phone: "+221 76 555 1234",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  },
  {
    id: "demo-material-3",
    name: "Sable de rivière lavé",
    description: "Sable fin de rivière lavé, granulométrie 0-5mm",
    price: 25000,
    unit: "m³",
    stock_quantity: 50,
    supplier_id: "demo-supplier-2",
    category: "Granulats",
    rating: 4.7,
    image_url: "/placeholder.svg?height=200&width=200",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    supplier: {
      id: "demo-supplier-2",
      email: "supplier2@demo.com",
      full_name: "Ibrahima Ndiaye",
      user_type: "professional",
      company_name: "Carrière Diass",
      phone: "+221 77 345 6789",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  },
  {
    id: "demo-material-4",
    name: "Gravier concassé 15/25",
    description: "Gravier concassé calibré 15/25mm pour béton",
    price: 30000,
    unit: "m³",
    stock_quantity: 75,
    supplier_id: "demo-supplier-2",
    category: "Granulats",
    rating: 4.7,
    image_url: "/placeholder.svg?height=200&width=200",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    supplier: {
      id: "demo-supplier-2",
      email: "supplier2@demo.com",
      full_name: "Ibrahima Ndiaye",
      user_type: "professional",
      company_name: "Carrière Diass",
      phone: "+221 77 345 6789",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  },
  {
    id: "demo-material-5",
    name: "Briques creuses 15x20x40",
    description: "Briques creuses en terre cuite pour murs porteurs",
    price: 150,
    unit: "unité",
    stock_quantity: 2000,
    supplier_id: "demo-supplier-3",
    category: "Maçonnerie",
    rating: 4.5,
    image_url: "/placeholder.svg?height=200&width=200",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    supplier: {
      id: "demo-supplier-3",
      email: "supplier3@demo.com",
      full_name: "Aminata Sy",
      user_type: "professional",
      company_name: "Briqueterie Moderne",
      phone: "+221 78 456 7890",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  },
  {
    id: "demo-material-6",
    name: "Carrelage 60x60 Grès Cérame",
    description: "Carrelage moderne en grès cérame pour sols intérieurs",
    price: 8500,
    unit: "m²",
    stock_quantity: 300,
    supplier_id: "demo-supplier-3",
    category: "Finitions",
    rating: 4.9,
    image_url: "/placeholder.svg?height=200&width=200",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    supplier: {
      id: "demo-supplier-3",
      email: "supplier3@demo.com",
      full_name: "Aminata Sy",
      user_type: "professional",
      company_name: "Briqueterie Moderne",
      phone: "+221 78 456 7890",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  },
  {
    id: "demo-material-7",
    name: "Peinture Acrylique Blanche",
    description: "Peinture acrylique mate pour murs intérieurs, pot 15L",
    price: 12500,
    unit: "pot",
    stock_quantity: 45,
    supplier_id: "demo-supplier-4",
    category: "Finitions",
    rating: 4.4,
    image_url: "/placeholder.svg?height=200&width=200",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    supplier: {
      id: "demo-supplier-4",
      email: "supplier4@demo.com",
      full_name: "Ousmane Diop",
      user_type: "professional",
      company_name: "Peintures & Déco",
      phone: "+221 77 567 8901",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  },
  {
    id: "demo-material-8",
    name: "Tuyau PVC Ø110mm",
    description: "Tuyau PVC évacuation diamètre 110mm, longueur 3m",
    price: 3500,
    unit: "tube",
    stock_quantity: 120,
    supplier_id: "demo-supplier-4",
    category: "Plomberie",
    rating: 4.3,
    image_url: "/placeholder.svg?height=200&width=200",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    supplier: {
      id: "demo-supplier-4",
      email: "supplier4@demo.com",
      full_name: "Ousmane Diop",
      user_type: "professional",
      company_name: "Peintures & Déco",
      phone: "+221 77 567 8901",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  },
  // Nouveaux matériaux ajoutés
  {
    id: "demo-material-9",
    name: "Parpaing 20x20x50",
    description: "Parpaing en béton pour construction de murs",
    price: 350,
    unit: "unité",
    stock_quantity: 1500,
    supplier_id: "demo-supplier-3",
    category: "Maçonnerie",
    rating: 4.6,
    image_url: "/placeholder.svg?height=200&width=200",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    supplier: {
      id: "demo-supplier-3",
      email: "supplier3@demo.com",
      full_name: "Aminata Sy",
      user_type: "professional",
      company_name: "Briqueterie Moderne",
      phone: "+221 78 456 7890",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  },
  {
    id: "demo-material-10",
    name: "Tôle ondulée galvanisée",
    description: "Tôle ondulée galvanisée 0.4mm, longueur 3m",
    price: 15000,
    unit: "feuille",
    stock_quantity: 200,
    supplier_id: "demo-supplier-5",
    category: "Couverture",
    rating: 4.7,
    image_url: "/placeholder.svg?height=200&width=200",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    supplier: {
      id: "demo-supplier-5",
      email: "supplier5@demo.com",
      full_name: "Cheikh Fall",
      user_type: "professional",
      company_name: "Métallurgie Sénégal",
      phone: "+221 76 789 0123",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  },
  {
    id: "demo-material-11",
    name: "Mortier colle carrelage",
    description: "Mortier colle haute performance pour carrelage",
    price: 6500,
    unit: "sac 25kg",
    stock_quantity: 80,
    supplier_id: "demo-supplier-1",
    category: "Finitions",
    rating: 4.8,
    image_url: "/placeholder.svg?height=200&width=200",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    supplier: {
      id: "demo-supplier-1",
      email: "supplier@demo.com",
      full_name: "Moussa Kane",
      user_type: "professional",
      company_name: "Matériaux du Sahel",
      phone: "+221 76 555 1234",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  },
  {
    id: "demo-material-12",
    name: "Isolant thermique laine de verre",
    description: "Isolant thermique en laine de verre, épaisseur 10cm",
    price: 4200,
    unit: "m²",
    stock_quantity: 150,
    supplier_id: "demo-supplier-5",
    category: "Isolation",
    rating: 4.5,
    image_url: "/placeholder.svg?height=200&width=200",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    supplier: {
      id: "demo-supplier-5",
      email: "supplier5@demo.com",
      full_name: "Cheikh Fall",
      user_type: "professional",
      company_name: "Métallurgie Sénégal",
      phone: "+221 76 789 0123",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  },
]

// Données de projets avec dates pour calcul de retards
const demoProjects: Project[] = [
  {
    id: "demo-project-1",
    name: "Villa Moderne Dakar",
    description: "Construction d'une villa moderne de 4 chambres avec piscine",
    status: "in_progress",
    progress: 65,
    budget: 45000000,
    spent: 29250000,
    location: "Almadies, Dakar",
    client_id: "demo-client-1",
    professional_id: "demo-pro-1",
    start_date: "2024-01-15",
    end_date: "2024-08-15",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-20T00:00:00Z",
    client: {
      id: "demo-client-1",
      email: "client@demo.com",
      full_name: "Amadou Diallo",
      user_type: "client",
      phone: "+221 77 123 4567",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    professional: {
      id: "demo-pro-1",
      email: "pro@demo.com",
      full_name: "Fatou Sall",
      user_type: "professional",
      company_name: "BTP Excellence",
      phone: "+221 78 987 6543",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  },
  {
    id: "demo-project-2",
    name: "Immeuble Commercial Thiès",
    description: "Construction d'un immeuble de bureaux de 3 étages",
    status: "planning",
    progress: 15,
    budget: 85000000,
    spent: 12750000,
    location: "Centre-ville, Thiès",
    client_id: "demo-client-1",
    start_date: "2024-03-01",
    end_date: "2024-12-31",
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-18T00:00:00Z",
    client: {
      id: "demo-client-1",
      email: "client@demo.com",
      full_name: "Amadou Diallo",
      user_type: "client",
      phone: "+221 77 123 4567",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  },
]

// Checklist items de démonstration
const demoChecklistItems: ChecklistItem[] = [
  {
    id: "demo-checklist-1",
    project_id: "demo-project-1",
    title: "Étude de faisabilité",
    description: "Analyse du terrain et étude géotechnique",
    order_index: 1,
    estimated_duration: 7,
    is_completed: true,
    completed_at: "2024-01-20T00:00:00Z",
    completed_by: "demo-pro-1",
    priority: "high",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-20T00:00:00Z",
  },
  {
    id: "demo-checklist-2",
    project_id: "demo-project-1",
    title: "Permis de construire",
    description: "Dépôt et obtention du permis de construire",
    order_index: 2,
    estimated_duration: 30,
    is_completed: true,
    completed_at: "2024-02-15T00:00:00Z",
    completed_by: "demo-pro-1",
    priority: "critical",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-02-15T00:00:00Z",
  },
  {
    id: "demo-checklist-3",
    project_id: "demo-project-1",
    title: "Préparation du terrain",
    description: "Nettoyage et nivellement du terrain",
    order_index: 3,
    estimated_duration: 5,
    is_completed: true,
    completed_at: "2024-02-20T00:00:00Z",
    completed_by: "demo-pro-1",
    priority: "high",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-02-20T00:00:00Z",
  },
  {
    id: "demo-checklist-4",
    project_id: "demo-project-1",
    title: "Fondations",
    description: "Excavation et coulage des fondations",
    order_index: 4,
    estimated_duration: 14,
    is_completed: true,
    completed_at: "2024-03-10T00:00:00Z",
    completed_by: "demo-pro-1",
    priority: "critical",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-03-10T00:00:00Z",
  },
  {
    id: "demo-checklist-5",
    project_id: "demo-project-1",
    title: "Structure béton",
    description: "Montage de la structure en béton armé",
    order_index: 5,
    estimated_duration: 21,
    is_completed: true,
    completed_at: "2024-04-05T00:00:00Z",
    completed_by: "demo-pro-1",
    priority: "critical",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-04-05T00:00:00Z",
  },
  {
    id: "demo-checklist-6",
    project_id: "demo-project-1",
    title: "Toiture",
    description: "Installation de la charpente et couverture",
    order_index: 6,
    estimated_duration: 10,
    is_completed: true,
    completed_at: "2024-04-20T00:00:00Z",
    completed_by: "demo-pro-1",
    priority: "high",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-04-20T00:00:00Z",
  },
  {
    id: "demo-checklist-7",
    project_id: "demo-project-1",
    title: "Murs et cloisons",
    description: "Construction des murs porteurs et cloisons",
    order_index: 7,
    estimated_duration: 14,
    is_completed: true,
    completed_at: "2024-05-10T00:00:00Z",
    completed_by: "demo-pro-1",
    priority: "high",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-05-10T00:00:00Z",
  },
  {
    id: "demo-checklist-8",
    project_id: "demo-project-1",
    title: "Électricité",
    description: "Installation électrique complète",
    order_index: 8,
    estimated_duration: 12,
    is_completed: false,
    due_date: "2024-06-01",
    priority: "high",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "demo-checklist-9",
    project_id: "demo-project-1",
    title: "Plomberie",
    description: "Installation sanitaire et plomberie",
    order_index: 9,
    estimated_duration: 10,
    is_completed: false,
    due_date: "2024-06-15",
    priority: "high",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "demo-checklist-10",
    project_id: "demo-project-1",
    title: "Revêtements sols",
    description: "Pose des carrelages et revêtements",
    order_index: 10,
    estimated_duration: 8,
    is_completed: false,
    due_date: "2024-07-01",
    priority: "medium",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "demo-checklist-11",
    project_id: "demo-project-1",
    title: "Peinture",
    description: "Peinture intérieure et extérieure",
    order_index: 11,
    estimated_duration: 7,
    is_completed: false,
    due_date: "2024-07-15",
    priority: "medium",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "demo-checklist-12",
    project_id: "demo-project-1",
    title: "Finitions",
    description: "Pose des équipements et finitions",
    order_index: 12,
    estimated_duration: 5,
    is_completed: false,
    due_date: "2024-08-01",
    priority: "medium",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
]

const demoOrders: Order[] = [
  {
    id: "demo-order-1",
    order_number: "CMD-2024-001",
    client_id: "demo-client-1",
    supplier_id: "demo-supplier-1",
    project_id: "demo-project-1",
    material_id: "demo-material-1",
    quantity: 50,
    unit_price: 4500,
    total_price: 225000,
    status: "delivered",
    created_at: "2024-01-16T00:00:00Z",
    updated_at: "2024-01-18T00:00:00Z",
    material: demoMaterials[0],
  },
  {
    id: "demo-order-2",
    order_number: "CMD-2024-002",
    client_id: "demo-client-1",
    supplier_id: "demo-supplier-1",
    project_id: "demo-project-1",
    material_id: "demo-material-2",
    quantity: 25,
    unit_price: 8500,
    total_price: 212500,
    status: "confirmed",
    created_at: "2024-01-17T00:00:00Z",
    updated_at: "2024-01-17T00:00:00Z",
    material: demoMaterials[1],
  },
]

const demoProfessionals: Profile[] = [
  {
    id: "demo-pro-1",
    email: "pro1@demo.com",
    full_name: "Fatou Sall",
    user_type: "professional",
    company_name: "BTP Excellence",
    phone: "+221 78 987 6543",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "demo-pro-2",
    email: "pro2@demo.com",
    full_name: "Ibrahima Ndiaye",
    user_type: "professional",
    company_name: "Construction Moderne",
    phone: "+221 77 456 7890",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
]

const demoIoTSensors: IoTSensor[] = [
  {
    id: "demo-sensor-1",
    project_id: "demo-project-1",
    sensor_type: "Température",
    location: "Fondations",
    value: 24.5,
    unit: "°C",
    status: "normal",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-20T00:00:00Z",
  },
  {
    id: "demo-sensor-2",
    project_id: "demo-project-1",
    sensor_type: "Humidité",
    location: "Béton",
    value: 65,
    unit: "%",
    status: "warning",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-20T00:00:00Z",
  },
  {
    id: "demo-sensor-3",
    project_id: "demo-project-1",
    sensor_type: "Vibration",
    location: "Structure",
    value: 2.1,
    unit: "Hz",
    status: "normal",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-20T00:00:00Z",
  },
]

const demoDrones: Drone[] = [
  {
    id: "demo-drone-1",
    name: "Drone Inspection #1",
    model: "DJI Phantom 4 Pro",
    status: "available",
    battery_level: 85,
    altitude: 0,
    project_id: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-20T00:00:00Z",
  },
  {
    id: "demo-drone-2",
    name: "Drone Surveillance #2",
    model: "DJI Mavic Air 2",
    status: "in_flight",
    battery_level: 72,
    altitude: 45,
    project_id: "demo-project-1",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-20T00:00:00Z",
  },
  {
    id: "demo-drone-3",
    name: "Drone Cartographie #3",
    model: "DJI Mini 3 Pro",
    status: "maintenance",
    battery_level: 0,
    altitude: 0,
    project_id: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-18T00:00:00Z",
  },
]

const demoProjectActivities: ProjectActivity[] = [
  {
    id: "demo-activity-1",
    project_id: "demo-project-1",
    activity_type: "construction",
    description: "Coulage des fondations terminé",
    user_id: "demo-pro-1",
    created_at: "2024-01-18T00:00:00Z",
    updated_at: "2024-01-18T00:00:00Z",
  },
  {
    id: "demo-activity-2",
    project_id: "demo-project-1",
    activity_type: "inspection",
    description: "Inspection drone effectuée",
    user_id: "demo-pro-1",
    created_at: "2024-01-17T00:00:00Z",
    updated_at: "2024-01-17T00:00:00Z",
  },
]

const demoProjectExpenses: ProjectExpense[] = [
  {
    id: "demo-expense-1",
    project_id: "demo-project-1",
    description: "Achat ciment Portland",
    amount: 225000,
    category: "materials",
    date: "2024-01-16",
    created_by: "demo-pro-1",
    created_at: "2024-01-16T00:00:00Z",
    updated_at: "2024-01-16T00:00:00Z",
  },
  {
    id: "demo-expense-2",
    project_id: "demo-project-1",
    description: "Main d'œuvre fondations",
    amount: 850000,
    category: "labor",
    date: "2024-01-15",
    created_by: "demo-pro-1",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
]

const demoProjectUsers: ProjectUser[] = [
  {
    id: "demo-project-user-1",
    project_id: "demo-project-1",
    user_id: "demo-pro-1",
    role: "manager",
    permissions: ["read", "write", "delete"],
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
    user: {
      id: "demo-pro-1",
      email: "pro1@demo.com",
      full_name: "Fatou Sall",
      user_type: "professional",
      company_name: "BTP Excellence",
      phone: "+221 78 987 6543",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  },
]

// Utilitaires pour calculer les retards
export function calculateProjectDelay(project: Project): {
  isDelayed: boolean
  delayDays: number
  timeProgress: number
} {
  if (!project.start_date || !project.end_date) {
    return { isDelayed: false, delayDays: 0, timeProgress: 0 }
  }

  const startDate = new Date(project.start_date)
  const endDate = new Date(project.end_date)
  const currentDate = new Date()

  const totalDuration = endDate.getTime() - startDate.getTime()
  const elapsedTime = currentDate.getTime() - startDate.getTime()
  const timeProgress = Math.min(100, Math.max(0, (elapsedTime / totalDuration) * 100))

  // Un projet est en retard si le progrès réel est inférieur au progrès temporel attendu
  const expectedProgress = timeProgress
  const actualProgress = project.progress
  const isDelayed = actualProgress < expectedProgress - 5 // Marge de 5%

  const delayDays = isDelayed
    ? Math.round(((expectedProgress - actualProgress) / 100) * (totalDuration / (1000 * 60 * 60 * 24)))
    : 0

  return { isDelayed, delayDays, timeProgress }
}

// Service de base de données étendu
export const DatabaseService = {
  // Profils
  async getProfile(userId: string): Promise<Profile | null> {
    if (isDemoMode) {
      return {
        id: userId,
        email: "demo@terangabuild.com",
        full_name: "Utilisateur Démo",
        user_type: "client",
        company_name: "TerangaBuild Demo",
        phone: "+221 77 123 4567",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      }
    }

    const cacheKey = `profile-${userId}`
    const cached = getCachedData<Profile>(cacheKey)
    if (cached) return cached

    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) throw error

      setCachedData(cacheKey, data)
      return data
    } catch (error) {
      console.error("Error fetching profile:", error)
      return null
    }
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    if (isDemoMode) {
      return {
        id: userId,
        email: "demo@terangabuild.com",
        full_name: updates.full_name || "Utilisateur Démo",
        user_type: updates.user_type || "client",
        company_name: updates.company_name || "TerangaBuild Demo",
        phone: updates.phone || "+221 77 123 4567",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: new Date().toISOString(),
      }
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", userId)
        .select()
        .single()

      if (error) throw error

      // Invalider le cache
      cache.delete(`profile-${userId}`)
      return data
    } catch (error) {
      console.error("Error updating profile:", error)
      return null
    }
  },

  // Projets
  async getProjectsForUser(userId: string, userType: "client" | "professional"): Promise<Project[]> {
    if (isDemoMode) {
      return userType === "client" ? demoProjects : demoProjects.filter((p) => p.professional_id === userId)
    }

    const cacheKey = `projects-${userId}-${userType}`
    const cached = getCachedData<Project[]>(cacheKey)
    if (cached) return cached

    try {
      const column = userType === "client" ? "client_id" : "professional_id"
      const { data, error } = await supabase
        .from("projects")
        .select(
          `
          *,
          client:profiles!client_id(*),
          professional:profiles!professional_id(*)
        `,
        )
        .eq(column, userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setCachedData(cacheKey, data || [])
      return data || []
    } catch (error) {
      console.error("Error fetching projects:", error)
      return []
    }
  },

  async createProject(projectData: Omit<Project, "id" | "created_at" | "updated_at">): Promise<Project | null> {
    if (isDemoMode) {
      const newProject: Project = {
        ...projectData,
        id: `demo-project-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      demoProjects.unshift(newProject)
      return newProject
    }

    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          ...projectData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      // Invalider les caches pertinents
      cache.forEach((_, key) => {
        if (key.startsWith("projects-")) {
          cache.delete(key)
        }
      })

      return data
    } catch (error) {
      console.error("Error creating project:", error)
      return null
    }
  },

  // Checklist
  async getProjectChecklist(projectId: string): Promise<ChecklistItem[]> {
    if (isDemoMode) {
      return demoChecklistItems.filter((item) => item.project_id === projectId)
    }

    const cacheKey = `checklist-${projectId}`
    const cached = getCachedData<ChecklistItem[]>(cacheKey)
    if (cached) return cached

    try {
      const { data, error } = await supabase
        .from("project_checklist_items")
        .select("*")
        .eq("project_id", projectId)
        .order("order_index", { ascending: true })

      if (error) throw error

      setCachedData(cacheKey, data || [])
      return data || []
    } catch (error) {
      console.error("Error fetching project checklist:", error)
      return []
    }
  },

  async createChecklistItem(
    itemData: Omit<ChecklistItem, "id" | "created_at" | "updated_at">,
  ): Promise<ChecklistItem | null> {
    if (isDemoMode) {
      const newItem: ChecklistItem = {
        ...itemData,
        id: `demo-checklist-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      demoChecklistItems.push(newItem)
      return newItem
    }

    try {
      const { data, error } = await supabase
        .from("project_checklist_items")
        .insert({
          ...itemData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      cache.delete(`checklist-${itemData.project_id}`)
      return data
    } catch (error) {
      console.error("Error creating checklist item:", error)
      return null
    }
  },

  async updateChecklistItem(itemId: string, updates: Partial<ChecklistItem>): Promise<boolean> {
    if (isDemoMode) {
      const itemIndex = demoChecklistItems.findIndex((item) => item.id === itemId)
      if (itemIndex !== -1) {
        demoChecklistItems[itemIndex] = {
          ...demoChecklistItems[itemIndex],
          ...updates,
          updated_at: new Date().toISOString(),
        }

        // Recalculer le progrès du projet
        const projectId = demoChecklistItems[itemIndex].project_id
        const projectItems = demoChecklistItems.filter((item) => item.project_id === projectId)
        const completedItems = projectItems.filter((item) => item.is_completed)
        const progress = Math.round((completedItems.length / projectItems.length) * 100)

        const projectIndex = demoProjects.findIndex((p) => p.id === projectId)
        if (projectIndex !== -1) {
          demoProjects[projectIndex].progress = progress
        }

        return true
      }
      return false
    }

    try {
      const { error } = await supabase
        .from("project_checklist_items")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", itemId)

      if (error) throw error

      // Invalider les caches pertinents
      cache.forEach((_, key) => {
        if (key.startsWith("checklist-")) {
          cache.delete(key)
        }
      })

      return true
    } catch (error) {
      console.error("Error updating checklist item:", error)
      return false
    }
  },

  // Invitations
  async createProjectInvitation(
    invitationData: Omit<ProjectInvitation, "id" | "created_at" | "updated_at">,
  ): Promise<ProjectInvitation | null> {
    if (isDemoMode) {
      const newInvitation: ProjectInvitation = {
        ...invitationData,
        id: `demo-invitation-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      return newInvitation
    }

    try {
      const { data, error } = await supabase
        .from("project_invitations")
        .insert({
          ...invitationData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error("Error creating project invitation:", error)
      return null
    }
  },

  // Matériaux
  async getMaterials(): Promise<Material[]> {
    if (isDemoMode) {
      return demoMaterials
    }

    const cacheKey = "materials"
    const cached = getCachedData<Material[]>(cacheKey)
    if (cached) return cached

    try {
      const { data, error } = await supabase
        .from("materials")
        .select(
          `
          *,
          supplier:profiles!supplier_id(*)
        `,
        )
        .order("created_at", { ascending: false })

      if (error) throw error

      setCachedData(cacheKey, data || [])
      return data || []
    } catch (error) {
      console.error("Error fetching materials:", error)
      return []
    }
  },

  async getMaterialsBySupplier(supplierId: string): Promise<Material[]> {
    if (isDemoMode) {
      return demoMaterials.filter((m) => m.supplier_id === supplierId)
    }

    const cacheKey = `materials-supplier-${supplierId}`
    const cached = getCachedData<Material[]>(cacheKey)
    if (cached) return cached

    try {
      const { data, error } = await supabase
        .from("materials")
        .select(
          `
        *,
        supplier:profiles!supplier_id(*)
      `,
        )
        .eq("supplier_id", supplierId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setCachedData(cacheKey, data || [])
      return data || []
    } catch (error) {
      console.error("Error fetching materials by supplier:", error)
      return []
    }
  },

  // Commandes
  async getOrdersForProject(projectId: string): Promise<Order[]> {
    if (isDemoMode) {
      return demoOrders.filter((order) => order.project_id === projectId)
    }

    const cacheKey = `orders-${projectId}`
    const cached = getCachedData<Order[]>(cacheKey)
    if (cached) return cached

    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          project:projects(*),
          material:materials(*)
        `,
        )
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setCachedData(cacheKey, data || [])
      return data || []
    } catch (error) {
      console.error("Error fetching orders:", error)
      return []
    }
  },

  async createOrder(orderData: Omit<Order, "id" | "created_at" | "updated_at">): Promise<Order | null> {
    if (isDemoMode) {
      const newOrder: Order = {
        ...orderData,
        id: `demo-order-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      demoOrders.unshift(newOrder)
      return newOrder
    }

    try {
      const { data, error } = await supabase
        .from("orders")
        .insert({
          ...orderData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      // Invalider les caches pertinents
      cache.forEach((_, key) => {
        if (key.startsWith("orders-")) {
          cache.delete(key)
        }
      })

      return data
    } catch (error) {
      console.error("Error creating order:", error)
      return null
    }
  },

  // Professionnels
  async getProfessionals(): Promise<Profile[]> {
    if (isDemoMode) {
      return demoProfessionals
    }

    const cacheKey = "professionals"
    const cached = getCachedData<Profile[]>(cacheKey)
    if (cached) return cached

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_type", "professional")
        .order("created_at", { ascending: false })

      if (error) throw error

      setCachedData(cacheKey, data || [])
      return data || []
    } catch (error) {
      console.error("Error fetching professionals:", error)
      return []
    }
  },

  async getOrdersForUser(userId: string, userType: "client" | "professional"): Promise<Order[]> {
    if (isDemoMode) {
      return demoOrders
    }

    const cacheKey = `orders-user-${userId}-${userType}`
    const cached = getCachedData<Order[]>(cacheKey)
    if (cached) return cached

    try {
      // For professionals, get orders for their projects
      // For clients, get orders for their projects
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
        *,
        project:projects(*),
        material:materials(*),
        client:profiles!client_id(*)
      `,
        )
        .order("created_at", { ascending: false })

      if (error) throw error

      setCachedData(cacheKey, data || [])
      return data || []
    } catch (error) {
      console.error("Error fetching orders for user:", error)
      return []
    }
  },

  async getDrones(): Promise<DroneType[]> {
    if (isDemoMode) {
      return demoDrones
    }

    const cacheKey = "drones"
    const cached = getCachedData<DroneType[]>(cacheKey)
    if (cached) return cached

    try {
      const { data, error } = await supabase.from("drones").select("*").order("created_at", { ascending: false })

      if (error) throw error

      setCachedData(cacheKey, data || [])
      return data || []
    } catch (error) {
      console.error("Error fetching drones:", error)
      return []
    }
  },

  async getIoTSensorsForProject(projectId: string): Promise<IoTSensor[]> {
    if (isDemoMode) {
      return demoIoTSensors.filter((s) => s.project_id === projectId)
    }

    const cacheKey = `iot-sensors-${projectId}`
    const cached = getCachedData<IoTSensor[]>(cacheKey)
    if (cached) return cached

    try {
      const { data, error } = await supabase
        .from("iot_sensors")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setCachedData(cacheKey, data || [])
      return data || []
    } catch (error) {
      console.error("Error fetching IoT sensors:", error)
      return []
    }
  },

  async getProjectActivities(projectId: string): Promise<ProjectActivity[]> {
    if (isDemoMode) {
      return demoProjectActivities.filter((a) => a.project_id === projectId)
    }

    const cacheKey = `project-activities-${projectId}`
    const cached = getCachedData<ProjectActivity[]>(cacheKey)
    if (cached) return cached

    try {
      const { data, error } = await supabase
        .from("project_activities")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setCachedData(cacheKey, data || [])
      return data || []
    } catch (error) {
      console.error("Error fetching project activities:", error)
      return []
    }
  },

  async getProjectExpenses(projectId: string): Promise<ProjectExpense[]> {
    if (isDemoMode) {
      return demoProjectExpenses.filter((e) => e.project_id === projectId)
    }

    const cacheKey = `project-expenses-${projectId}`
    const cached = getCachedData<ProjectExpense[]>(cacheKey)
    if (cached) return cached

    try {
      const { data, error } = await supabase
        .from("project_expenses")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setCachedData(cacheKey, data || [])
      return data || []
    } catch (error) {
      console.error("Error fetching project expenses:", error)
      return []
    }
  },

  async getProjectUsers(projectId: string): Promise<ProjectUser[]> {
    if (isDemoMode) {
      return demoProjectUsers.filter((u) => u.project_id === projectId)
    }

    const cacheKey = `project-users-${projectId}`
    const cached = getCachedData<ProjectUser[]>(cacheKey)
    if (cached) return cached

    try {
      const { data, error } = await supabase
        .from("project_users")
        .select(
          `
        *,
        user:profiles!user_id(*)
      `,
        )
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setCachedData(cacheKey, data || [])
      return data || []
    } catch (error) {
      console.error("Error fetching project users:", error)
      return []
    }
  },

  async searchUsers(query: string): Promise<Profile[]> {
    if (isDemoMode) {
      return demoProfessionals.filter(
        (p) =>
          p.full_name?.toLowerCase().includes(query.toLowerCase()) ||
          p.email.toLowerCase().includes(query.toLowerCase()) ||
          p.company_name?.toLowerCase().includes(query.toLowerCase()),
      )
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,company_name.ilike.%${query}%`)
        .limit(10)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error("Error searching users:", error)
      return []
    }
  },

  async updateProject(projectId: string, updates: Partial<Project>): Promise<boolean> {
    if (isDemoMode) {
      const projectIndex = demoProjects.findIndex((p) => p.id === projectId)
      if (projectIndex !== -1) {
        demoProjects[projectIndex] = { ...demoProjects[projectIndex], ...updates, updated_at: new Date().toISOString() }
        return true
      }
      return false
    }

    try {
      const { error } = await supabase
        .from("projects")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", projectId)

      if (error) throw error

      // Invalider les caches pertinents
      cache.forEach((_, key) => {
        if (key.startsWith("projects-")) {
          cache.delete(key)
        }
      })

      return true
    } catch (error) {
      console.error("Error updating project:", error)
      return false
    }
  },

  async deleteProject(projectId: string): Promise<boolean> {
    if (isDemoMode) {
      const projectIndex = demoProjects.findIndex((p) => p.id === projectId)
      if (projectIndex !== -1) {
        demoProjects.splice(projectIndex, 1)
        return true
      }
      return false
    }

    try {
      const { error } = await supabase.from("projects").delete().eq("id", projectId)

      if (error) throw error

      // Invalider les caches pertinents
      cache.forEach((_, key) => {
        if (key.startsWith("projects-")) {
          cache.delete(key)
        }
      })

      return true
    } catch (error) {
      console.error("Error deleting project:", error)
      return false
    }
  },

  async createMaterial(materialData: Omit<Material, "id" | "created_at" | "updated_at">): Promise<Material | null> {
    if (isDemoMode) {
      const newMaterial: Material = {
        ...materialData,
        id: `demo-material-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      demoMaterials.unshift(newMaterial)
      return newMaterial
    }

    try {
      const { data, error } = await supabase
        .from("materials")
        .insert({
          ...materialData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      // Invalider les caches pertinents
      cache.forEach((_, key) => {
        if (key.startsWith("materials")) {
          cache.delete(key)
        }
      })

      return data
    } catch (error) {
      console.error("Error creating material:", error)
      return null
    }
  },

  async updateMaterial(materialId: string, updates: Partial<Material>): Promise<boolean> {
    if (isDemoMode) {
      const materialIndex = demoMaterials.findIndex((m) => m.id === materialId)
      if (materialIndex !== -1) {
        demoMaterials[materialIndex] = {
          ...demoMaterials[materialIndex],
          ...updates,
          updated_at: new Date().toISOString(),
        }
        return true
      }
      return false
    }

    try {
      const { error } = await supabase
        .from("materials")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", materialId)

      if (error) throw error

      // Invalider les caches pertinents
      cache.forEach((_, key) => {
        if (key.startsWith("materials")) {
          cache.delete(key)
        }
      })

      return true
    } catch (error) {
      console.error("Error updating material:", error)
      return false
    }
  },

  async deleteMaterial(materialId: string): Promise<boolean> {
    if (isDemoMode) {
      const materialIndex = demoMaterials.findIndex((m) => m.id === materialId)
      if (materialIndex !== -1) {
        demoMaterials.splice(materialIndex, 1)
        return true
      }
      return false
    }

    try {
      const { error } = await supabase.from("materials").delete().eq("id", materialId)

      if (error) throw error

      // Invalider les caches pertinents
      cache.forEach((_, key) => {
        if (key.startsWith("materials")) {
          cache.delete(key)
        }
      })

      return true
    } catch (error) {
      console.error("Error deleting material:", error)
      return false
    }
  },

  async createProjectExpense(
    expenseData: Omit<ProjectExpense, "id" | "created_at" | "updated_at">,
  ): Promise<ProjectExpense | null> {
    if (isDemoMode) {
      const newExpense: ProjectExpense = {
        ...expenseData,
        id: `demo-expense-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      demoProjectExpenses.unshift(newExpense)
      return newExpense
    }

    try {
      const { data, error } = await supabase
        .from("project_expenses")
        .insert({
          ...expenseData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      // Invalider les caches pertinents
      cache.forEach((_, key) => {
        if (key.startsWith("project-expenses")) {
          cache.delete(key)
        }
      })

      return data
    } catch (error) {
      console.error("Error creating project expense:", error)
      return null
    }
  },

  async deleteProjectExpense(expenseId: string, projectId: string): Promise<boolean> {
    if (isDemoMode) {
      const expenseIndex = demoProjectExpenses.findIndex((e) => e.id === expenseId)
      if (expenseIndex !== -1) {
        demoProjectExpenses.splice(expenseIndex, 1)
        return true
      }
      return false
    }

    try {
      const { error } = await supabase.from("project_expenses").delete().eq("id", expenseId)

      if (error) throw error

      // Invalider les caches pertinents
      cache.delete(`project-expenses-${projectId}`)

      return true
    } catch (error) {
      console.error("Error deleting project expense:", error)
      return false
    }
  },

  async addProjectUser(userData: Omit<ProjectUser, "id" | "created_at" | "updated_at">): Promise<ProjectUser | null> {
    if (isDemoMode) {
      const newUser: ProjectUser = {
        ...userData,
        id: `demo-user-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      demoProjectUsers.unshift(newUser)
      return newUser
    }

    try {
      const { data, error } = await supabase
        .from("project_users")
        .insert({
          ...userData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      // Invalider les caches pertinents
      cache.forEach((_, key) => {
        if (key.startsWith("project-users")) {
          cache.delete(key)
        }
      })

      return data
    } catch (error) {
      console.error("Error adding project user:", error)
      return null
    }
  },

  async removeProjectUser(projectUserId: string): Promise<boolean> {
    if (isDemoMode) {
      const userIndex = demoProjectUsers.findIndex((u) => u.id === projectUserId)
      if (userIndex !== -1) {
        demoProjectUsers.splice(userIndex, 1)
        return true
      }
      return false
    }

    try {
      const { error } = await supabase.from("project_users").delete().eq("id", projectUserId)

      if (error) throw error

      // Invalider les caches pertinents
      cache.forEach((_, key) => {
        if (key.startsWith("project-users")) {
          cache.delete(key)
        }
      })

      return true
    } catch (error) {
      console.error("Error removing project user:", error)
      return false
    }
  },

  async createIoTThreshold(thresholdData: any): Promise<any | null> {
    if (isDemoMode) {
      // Simulate threshold creation in demo mode
      return { id: `demo-threshold-${Date.now()}`, ...thresholdData }
    }

    try {
      const { data, error } = await supabase
        .from("iot_thresholds")
        .insert({
          ...thresholdData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error("Error creating IoT threshold:", error)
      return null
    }
  },

  async updateDroneStatus(droneId: string, status: string, projectId?: string): Promise<boolean> {
    if (isDemoMode) {
      const droneIndex = demoDrones.findIndex((d) => d.id === droneId)
      if (droneIndex !== -1) {
        demoDrones[droneIndex] = {
          ...demoDrones[droneIndex],
          status: status as any,
          project_id: projectId || null,
          updated_at: new Date().toISOString(),
        }
        return true
      }
      return false
    }

    try {
      const { error } = await supabase
        .from("drones")
        .update({
          status,
          project_id: projectId || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", droneId)

      if (error) throw error

      // Invalider le cache des drones
      cache.delete("drones")

      return true
    } catch (error) {
      console.error("Error updating drone status:", error)
      return false
    }
  },
}

// Utilitaires
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800"
    case "in_progress":
      return "bg-blue-100 text-blue-800"
    case "planning":
      return "bg-yellow-100 text-yellow-800"
    case "on_hold":
      return "bg-red-100 text-red-800"
    case "delivered":
      return "bg-green-100 text-green-800"
    case "confirmed":
      return "bg-blue-100 text-blue-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    case "normal":
      return "bg-green-100 text-green-800"
    case "warning":
      return "bg-yellow-100 text-yellow-800"
    case "critical":
      return "bg-red-100 text-red-800"
    case "high":
      return "bg-red-100 text-red-800"
    case "medium":
      return "bg-yellow-100 text-yellow-800"
    case "low":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function getStatusText(status: string): string {
  switch (status) {
    case "completed":
      return "Terminé"
    case "in_progress":
      return "En cours"
    case "planning":
      return "Planification"
    case "on_hold":
      return "En attente"
    case "delivered":
      return "Livré"
    case "confirmed":
      return "Confirmé"
    case "pending":
      return "En attente"
    case "cancelled":
      return "Annulé"
    case "normal":
      return "Normal"
    case "warning":
      return "Attention"
    case "critical":
      return "Critique"
    case "high":
      return "Haute"
    case "medium":
      return "Moyenne"
    case "low":
      return "Basse"
    default:
      return status
  }
}

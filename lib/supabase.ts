import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL")
}
if (!supabaseAnonKey) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Types
export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  user_type: "client" | "professional"
  company_name?: string
  phone?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description?: string
  client_id: string
  professional_id?: string
  status: "planning" | "in_progress" | "completed" | "cancelled"
  progress: number
  budget?: number
  spent?: number
  start_date?: string
  end_date?: string
  location?: string
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
  supplier_id: string
  category?: string
  stock_quantity: number
  image_url?: string
  rating: number
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
  status: "pending" | "confirmed" | "preparing" | "shipped" | "delivered" | "cancelled"
  total_amount: number
  created_at: string
  updated_at: string
  client?: Profile
  supplier?: Profile
  project?: Project
}

export interface IoTSensor {
  id: string
  project_id: string
  sensor_type: string
  location: string
  value: string
  unit?: string
  status: "normal" | "warning" | "critical"
  last_reading: string
  created_at: string
}

export interface Drone {
  id: string
  name: string
  model?: string
  status: "available" | "in_flight" | "maintenance" | "offline"
  battery_level: number
  altitude?: number
  project_id?: string
  last_mission?: string
  created_at: string
}

export interface ProjectActivity {
  id: string
  project_id: string
  activity_type: string
  title: string
  description?: string
  user_id?: string
  created_at: string
  user?: Profile
}

// Helper functions
export const formatCurrency = (amount: number) => {
  return (
    new Intl.NumberFormat("fr-FR", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + " FCFA"
  )
}

export const getStatusColor = (status: string) => {
  const colors = {
    planning: "bg-blue-100 text-blue-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    pending: "bg-gray-100 text-gray-800",
    confirmed: "bg-blue-100 text-blue-800",
    preparing: "bg-yellow-100 text-yellow-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    normal: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    critical: "bg-red-100 text-red-800",
  }
  return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
}

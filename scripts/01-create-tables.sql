-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  user_type TEXT CHECK (user_type IN ('client', 'professional')) NOT NULL,
  company_name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  client_id UUID REFERENCES public.profiles(id) NOT NULL,
  professional_id UUID REFERENCES public.profiles(id),
  status TEXT CHECK (status IN ('planning', 'in_progress', 'completed', 'cancelled')) DEFAULT 'planning',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  budget DECIMAL(15,2),
  spent DECIMAL(15,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create materials table
CREATE TABLE public.materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  supplier_id UUID REFERENCES public.profiles(id) NOT NULL,
  category TEXT,
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES public.profiles(id) NOT NULL,
  supplier_id UUID REFERENCES public.profiles(id) NOT NULL,
  project_id UUID REFERENCES public.projects(id),
  status TEXT CHECK (status IN ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
  total_amount DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) NOT NULL,
  material_id UUID REFERENCES public.materials(id) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(15,2) NOT NULL
);

-- Create iot_sensors table
CREATE TABLE public.iot_sensors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) NOT NULL,
  sensor_type TEXT NOT NULL,
  location TEXT NOT NULL,
  value TEXT NOT NULL,
  unit TEXT,
  status TEXT CHECK (status IN ('normal', 'warning', 'critical')) DEFAULT 'normal',
  last_reading TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create drones table
CREATE TABLE public.drones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT,
  status TEXT CHECK (status IN ('available', 'in_flight', 'maintenance', 'offline')) DEFAULT 'available',
  battery_level INTEGER DEFAULT 100,
  altitude DECIMAL(8,2),
  project_id UUID REFERENCES public.projects(id),
  last_mission TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_activities table
CREATE TABLE public.project_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) NOT NULL,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view related projects" ON public.projects FOR SELECT USING (
  auth.uid() = client_id OR auth.uid() = professional_id
);

CREATE POLICY "Clients can create projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can view materials" ON public.materials FOR SELECT TO authenticated;
CREATE POLICY "Suppliers can manage their materials" ON public.materials FOR ALL USING (auth.uid() = supplier_id);

CREATE POLICY "Users can view related orders" ON public.orders FOR SELECT USING (
  auth.uid() = client_id OR auth.uid() = supplier_id
);

CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = client_id);

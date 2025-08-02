-- First, let's create some sample profiles manually for demonstration
-- These will be replaced by real user registrations

-- Note: In a real scenario, these profiles would be created through the auth system
-- For now, we'll create placeholder profiles to demonstrate the system

-- Create some demo profiles (these IDs should match real auth.users IDs in production)
-- We'll use placeholder UUIDs that can be replaced when real users register

-- Insert sample drones (these don't depend on user profiles)
INSERT INTO public.drones (name, model, status, battery_level) VALUES
('Drone Alpha-1', 'DJI Phantom 4 Pro', 'available', 100),
('Drone Beta-2', 'DJI Mavic Pro', 'available', 85),
('Drone Gamma-3', 'DJI Air 2S', 'maintenance', 0)
ON CONFLICT DO NOTHING;

-- Note: Materials, projects, and other data will be created when users register
-- and start using the application. The application is designed to work with
-- empty tables initially and populate them through user interactions.

-- Create some basic material categories for reference
-- (These will be populated by suppliers when they register)

-- The application will handle:
-- 1. User registration through Supabase Auth
-- 2. Profile creation via the trigger function
-- 3. Dynamic creation of projects, materials, orders, etc. through the UI
-- 4. IoT sensor data and project activities as users interact with the system

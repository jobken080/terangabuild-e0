-- Insert sample profiles
INSERT INTO public.profiles (id, email, full_name, user_type, company_name, phone) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'client@example.com', 'Mamadou Diallo', 'client', NULL, '+221 77 123 4567'),
('550e8400-e29b-41d4-a716-446655440002', 'pro@example.com', 'Fatou Sall', 'professional', 'SOCOCIM Industries', '+221 77 234 5678'),
('550e8400-e29b-41d4-a716-446655440003', 'supplier@example.com', 'Ibrahima Ndiaye', 'professional', 'Carrière Diass', '+221 77 345 6789');

-- Insert sample projects
INSERT INTO public.projects (id, name, description, client_id, professional_id, status, progress, budget, spent, location) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Villa Moderne Dakar', 'Construction d''une villa moderne à Dakar Nord', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'in_progress', 65, 45000000, 29250000, 'Dakar Nord'),
('660e8400-e29b-41d4-a716-446655440002', 'Extension Maison', 'Extension d''une maison familiale', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'planning', 30, 12000000, 3600000, 'Almadies');

-- Insert sample materials
INSERT INTO public.materials (name, description, price, unit, supplier_id, category, stock_quantity, rating) VALUES
('Ciment Portland', 'Ciment de haute qualité pour construction', 4500, 'sac', '550e8400-e29b-41d4-a716-446655440002', 'Ciment', 500, 4.8),
('Fer à béton 12mm', 'Barres de fer pour armature béton', 850, 'kg', '550e8400-e29b-41d4-a716-446655440002', 'Ferraillage', 1000, 4.6),
('Sable de rivière', 'Sable fin pour construction', 25000, 'm³', '550e8400-e29b-41d4-a716-446655440003', 'Granulats', 50, 4.7),
('Gravier concassé', 'Gravier pour béton et fondations', 30000, 'm³', '550e8400-e29b-41d4-a716-446655440003', 'Granulats', 75, 4.7);

-- Insert sample IoT sensors
INSERT INTO public.iot_sensors (project_id, sensor_type, location, value, unit, status) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Température béton', 'Zone A', '23', '°C', 'normal'),
('660e8400-e29b-41d4-a716-446655440001', 'Vibrations', 'Fondations', '0.2', 'Hz', 'normal'),
('660e8400-e29b-41d4-a716-446655440001', 'Humidité', 'Zone B', '65', '%', 'warning'),
('660e8400-e29b-41d4-a716-446655440001', 'Niveau eau', 'Réservoir', '85', '%', 'normal');

-- Insert sample drones
INSERT INTO public.drones (name, model, status, battery_level, project_id) VALUES
('Drone Alpha-1', 'DJI Phantom 4', 'in_flight', 78, '660e8400-e29b-41d4-a716-446655440001'),
('Drone Beta-2', 'DJI Mavic Pro', 'available', 100, NULL);

-- Insert sample activities
INSERT INTO public.project_activities (project_id, activity_type, title, description, user_id) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'delivery', 'Livraison ciment terminée', 'Réception de 50 sacs de ciment Portland', '550e8400-e29b-41d4-a716-446655440002'),
('660e8400-e29b-41d4-a716-446655440001', 'drone', 'Photos drone mises à jour', 'Capture aérienne du chantier effectuée', '550e8400-e29b-41d4-a716-446655440002'),
('660e8400-e29b-41d4-a716-446655440001', 'alert', 'Retard potentiel détecté', 'Analyse IA indique un risque de retard', '550e8400-e29b-41d4-a716-446655440002');

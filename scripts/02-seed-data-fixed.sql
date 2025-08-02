-- Note: Ces données seront insérées après la création des profils via l'authentification
-- Pour l'instant, nous créons juste quelques matériaux de démonstration

-- Insert sample materials (ces données peuvent être insérées directement)
-- Nous utiliserons des UUIDs génériques pour les fournisseurs qui seront remplacés par de vrais utilisateurs

-- Créer quelques matériaux de base pour la démonstration
INSERT INTO public.materials (name, description, price, unit, supplier_id, category, stock_quantity, rating) VALUES
('Ciment Portland', 'Ciment de haute qualité pour construction', 4500, 'sac', '00000000-0000-0000-0000-000000000001', 'Ciment', 500, 4.8),
('Fer à béton 12mm', 'Barres de fer pour armature béton', 850, 'kg', '00000000-0000-0000-0000-000000000001', 'Ferraillage', 1000, 4.6),
('Sable de rivière', 'Sable fin pour construction', 25000, 'm³', '00000000-0000-0000-0000-000000000002', 'Granulats', 50, 4.7),
('Gravier concassé', 'Gravier pour béton et fondations', 30000, 'm³', '00000000-0000-0000-0000-000000000002', 'Granulats', 75, 4.7),
('Briques creuses', 'Briques pour murs porteurs', 150, 'unité', '00000000-0000-0000-0000-000000000003', 'Maçonnerie', 2000, 4.5),
('Carrelage 60x60', 'Carrelage moderne pour sols', 8500, 'm²', '00000000-0000-0000-0000-000000000003', 'Finitions', 300, 4.9);

-- Insert sample drones (disponibles pour tous les projets)
INSERT INTO public.drones (name, model, status, battery_level) VALUES
('Drone Alpha-1', 'DJI Phantom 4 Pro', 'available', 100),
('Drone Beta-2', 'DJI Mavic Pro', 'available', 85),
('Drone Gamma-3', 'DJI Air 2S', 'maintenance', 0);

-- Note: Les autres données (projets, capteurs IoT, etc.) seront créées dynamiquement
-- quand les utilisateurs s'inscriront et créeront leurs projets

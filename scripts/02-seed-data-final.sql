-- Créer quelques matériaux de base pour la démonstration
-- Nous n'insérons que les drones pour l'instant, les matériaux seront ajoutés
-- quand de vrais fournisseurs s'inscriront sur la plateforme

-- Insert sample drones (disponibles pour tous les projets)
INSERT INTO public.drones (name, model, status, battery_level) VALUES
('Drone Alpha-1', 'DJI Phantom 4 Pro', 'available', 100),
('Drone Beta-2', 'DJI Mavic Pro', 'available', 85),
('Drone Gamma-3', 'DJI Air 2S', 'maintenance', 0);

-- Note: Les matériaux seront créés automatiquement quand les fournisseurs
-- s'inscriront et ajouteront leurs produits via l'interface
-- Les projets, capteurs IoT, et autres données seront créées dynamiquement
-- par les utilisateurs via l'application

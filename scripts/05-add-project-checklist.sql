-- Create project_checklist_templates table
CREATE TABLE public.project_checklist_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('construction', 'renovation', 'infrastructure', 'residential', 'commercial')) NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_checklist_items table
CREATE TABLE public.project_checklist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.project_checklist_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  estimated_duration INTEGER, -- in days
  dependencies TEXT[], -- array of item IDs that must be completed first
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date DATE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_invitations table
CREATE TABLE public.project_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  invited_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  invited_email TEXT NOT NULL,
  invited_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('client', 'manager', 'supervisor', 'worker', 'observer')) NOT NULL,
  permissions TEXT[] DEFAULT '{}',
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'expired')) DEFAULT 'pending',
  message TEXT,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.project_checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for project_checklist_templates
CREATE POLICY "Anyone can view public templates" ON public.project_checklist_templates 
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create templates" ON public.project_checklist_templates 
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own templates" ON public.project_checklist_templates 
  FOR UPDATE USING (created_by = auth.uid());

-- Create policies for project_checklist_items
CREATE POLICY "Project members can view checklist items" ON public.project_checklist_items 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_checklist_items.project_id 
      AND (projects.client_id = auth.uid() OR projects.professional_id = auth.uid())
    )
  );

CREATE POLICY "Project managers can manage checklist items" ON public.project_checklist_items 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_checklist_items.project_id 
      AND projects.professional_id = auth.uid()
    )
  );

-- Create policies for project_invitations
CREATE POLICY "Users can view related invitations" ON public.project_invitations 
  FOR SELECT USING (
    invited_by = auth.uid() OR 
    invited_user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email = project_invitations.invited_email
    )
  );

CREATE POLICY "Project managers can create invitations" ON public.project_invitations 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_invitations.project_id 
      AND projects.professional_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_project_checklist_items_project_id ON public.project_checklist_items(project_id);
CREATE INDEX idx_project_checklist_items_completed ON public.project_checklist_items(is_completed);
CREATE INDEX idx_project_invitations_project_id ON public.project_invitations(project_id);
CREATE INDEX idx_project_invitations_email ON public.project_invitations(invited_email);

-- Function to calculate project progress based on checklist
CREATE OR REPLACE FUNCTION public.calculate_project_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update project progress when checklist item is completed/uncompleted
  UPDATE public.projects 
  SET progress = (
    SELECT CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE ROUND((COUNT(*) FILTER (WHERE is_completed = true) * 100.0) / COUNT(*))
    END
    FROM public.project_checklist_items 
    WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic progress calculation
CREATE TRIGGER on_checklist_item_change
  AFTER INSERT OR UPDATE OR DELETE ON public.project_checklist_items
  FOR EACH ROW EXECUTE FUNCTION public.calculate_project_progress();

-- Insert default checklist templates
INSERT INTO public.project_checklist_templates (name, description, category, is_public) VALUES
('Construction Villa Standard', 'Checklist complète pour la construction d''une villa résidentielle', 'residential', true),
('Rénovation Appartement', 'Étapes de rénovation d''un appartement', 'renovation', true),
('Construction Immeuble Commercial', 'Checklist pour immeuble de bureaux', 'commercial', true);

-- Insert sample checklist items for villa construction
INSERT INTO public.project_checklist_items (project_id, title, description, order_index, estimated_duration, priority) 
SELECT 
  'demo-project-1',
  item.title,
  item.description,
  item.order_index,
  item.estimated_duration,
  item.priority
FROM (VALUES
  ('Étude de faisabilité', 'Analyse du terrain et étude géotechnique', 1, 7, 'high'),
  ('Permis de construire', 'Dépôt et obtention du permis de construire', 2, 30, 'critical'),
  ('Préparation du terrain', 'Nettoyage et nivellement du terrain', 3, 5, 'high'),
  ('Fondations', 'Excavation et coulage des fondations', 4, 14, 'critical'),
  ('Structure béton', 'Montage de la structure en béton armé', 5, 21, 'critical'),
  ('Toiture', 'Installation de la charpente et couverture', 6, 10, 'high'),
  ('Murs et cloisons', 'Construction des murs porteurs et cloisons', 7, 14, 'high'),
  ('Électricité', 'Installation électrique complète', 8, 12, 'high'),
  ('Plomberie', 'Installation sanitaire et plomberie', 9, 10, 'high'),
  ('Revêtements sols', 'Pose des carrelages et revêtements', 10, 8, 'medium'),
  ('Peinture', 'Peinture intérieure et extérieure', 11, 7, 'medium'),
  ('Finitions', 'Pose des équipements et finitions', 12, 5, 'medium')
) AS item(title, description, order_index, estimated_duration, priority);

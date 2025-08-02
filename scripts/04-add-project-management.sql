-- Create project_expenses table
CREATE TABLE public.project_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  category TEXT CHECK (category IN ('materials', 'labor', 'equipment', 'other')) NOT NULL,
  date DATE NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_users table for team management
CREATE TABLE public.project_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('manager', 'supervisor', 'worker', 'observer')) NOT NULL,
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Create iot_thresholds table
CREATE TABLE public.iot_thresholds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sensor_id UUID REFERENCES public.iot_sensors(id) ON DELETE CASCADE NOT NULL,
  min_value DECIMAL(10,2),
  max_value DECIMAL(10,2),
  warning_threshold DECIMAL(10,2),
  critical_threshold DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.project_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_thresholds ENABLE ROW LEVEL SECURITY;

-- Create policies for project_expenses
CREATE POLICY "Project members can view expenses" ON public.project_expenses 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_expenses.project_id 
      AND (projects.client_id = auth.uid() OR projects.professional_id = auth.uid())
    )
  );

CREATE POLICY "Professionals can manage expenses" ON public.project_expenses 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_expenses.project_id 
      AND projects.professional_id = auth.uid()
    )
  );

-- Create policies for project_users
CREATE POLICY "Project members can view team" ON public.project_users 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_users.project_id 
      AND (projects.client_id = auth.uid() OR projects.professional_id = auth.uid())
    )
  );

CREATE POLICY "Project managers can manage team" ON public.project_users 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_users.project_id 
      AND projects.professional_id = auth.uid()
    )
  );

-- Create policies for iot_thresholds
CREATE POLICY "Project members can view thresholds" ON public.iot_thresholds 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.iot_sensors 
      JOIN public.projects ON projects.id = iot_sensors.project_id
      WHERE iot_sensors.id = iot_thresholds.sensor_id 
      AND (projects.client_id = auth.uid() OR projects.professional_id = auth.uid())
    )
  );

CREATE POLICY "Professionals can manage thresholds" ON public.iot_thresholds 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.iot_sensors 
      JOIN public.projects ON projects.id = iot_sensors.project_id
      WHERE iot_sensors.id = iot_thresholds.sensor_id 
      AND projects.professional_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_project_expenses_project_id ON public.project_expenses(project_id);
CREATE INDEX idx_project_users_project_id ON public.project_users(project_id);
CREATE INDEX idx_iot_thresholds_sensor_id ON public.iot_thresholds(sensor_id);

-- Function to automatically add orders to project expenses
CREATE OR REPLACE FUNCTION public.add_order_to_expenses()
RETURNS TRIGGER AS $$
BEGIN
  -- Only add to expenses if order is delivered and linked to a project
  IF NEW.status = 'delivered' AND NEW.project_id IS NOT NULL THEN
    INSERT INTO public.project_expenses (
      project_id,
      description,
      amount,
      category,
      date,
      created_by
    ) VALUES (
      NEW.project_id,
      'Commande ' || NEW.order_number,
      NEW.total_amount,
      'materials',
      CURRENT_DATE,
      NEW.client_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic expense creation from orders
CREATE TRIGGER on_order_delivered
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  WHEN (OLD.status != 'delivered' AND NEW.status = 'delivered')
  EXECUTE FUNCTION public.add_order_to_expenses();

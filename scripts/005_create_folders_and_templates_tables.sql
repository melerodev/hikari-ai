-- Create folders table
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create templates table
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  snippet TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on folders
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Enable RLS on templates
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Create policies for folders (allow all operations for anonymous users)
CREATE POLICY "Allow all to select folders" ON public.folders FOR SELECT USING (true);
CREATE POLICY "Allow all to insert folders" ON public.folders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all to update folders" ON public.folders FOR UPDATE USING (true);
CREATE POLICY "Allow all to delete folders" ON public.folders FOR DELETE USING (true);

-- Create policies for templates (allow all operations for anonymous users)
CREATE POLICY "Allow all to select templates" ON public.templates FOR SELECT USING (true);
CREATE POLICY "Allow all to insert templates" ON public.templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all to update templates" ON public.templates FOR UPDATE USING (true);
CREATE POLICY "Allow all to delete templates" ON public.templates FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_folders_name ON public.folders(name);
CREATE INDEX IF NOT EXISTS idx_templates_name ON public.templates(name);

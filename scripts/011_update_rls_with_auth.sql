-- Update RLS policies to use actual user authentication
-- Drop old anonymous policies and create proper auth-based policies

-- Conversations table
DROP POLICY IF EXISTS "Allow select conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow insert conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow update conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow delete conversations" ON public.conversations;

CREATE POLICY "Users can view their own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON public.conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Folders table
DROP POLICY IF EXISTS "Allow select folders" ON public.folders;
DROP POLICY IF EXISTS "Allow insert folders" ON public.folders;
DROP POLICY IF EXISTS "Allow update folders" ON public.folders;
DROP POLICY IF EXISTS "Allow delete folders" ON public.folders;

CREATE POLICY "Users can view their own folders"
  ON public.folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own folders"
  ON public.folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders"
  ON public.folders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders"
  ON public.folders FOR DELETE
  USING (auth.uid() = user_id);

-- Templates table
DROP POLICY IF EXISTS "Allow select templates" ON public.templates;
DROP POLICY IF EXISTS "Allow insert templates" ON public.templates;
DROP POLICY IF EXISTS "Allow update templates" ON public.templates;
DROP POLICY IF EXISTS "Allow delete templates" ON public.templates;

CREATE POLICY "Users can view their own templates"
  ON public.templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates"
  ON public.templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
  ON public.templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
  ON public.templates FOR DELETE
  USING (auth.uid() = user_id);

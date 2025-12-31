-- Make user_id nullable and update RLS policies for anonymous access

-- Alter table to make user_id nullable with a default value
ALTER TABLE public.conversations
ALTER COLUMN user_id DROP NOT NULL,
ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Allow users to view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow users to insert their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow users to update their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow users to delete their own conversations" ON public.conversations;

-- Create new permissive policies for anonymous access
CREATE POLICY "Allow all to select conversations"
  ON public.conversations FOR SELECT
  USING (true);

CREATE POLICY "Allow all to insert conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all to update conversations"
  ON public.conversations FOR UPDATE
  USING (true);

CREATE POLICY "Allow all to delete conversations"
  ON public.conversations FOR DELETE
  USING (true);

-- Drop the foreign key constraint since user_id is now nullable
ALTER TABLE public.conversations
DROP CONSTRAINT IF EXISTS conversations_user_id_fkey;

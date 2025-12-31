-- Update RLS policies to allow anonymous access without user_id requirement
-- This allows the app to work without authentication

-- Drop existing policies that require auth.uid()
DROP POLICY IF EXISTS "Allow users to view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow users to insert their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow users to update their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow users to delete their own conversations" ON public.conversations;

-- Create new policies that allow anonymous access
-- These policies treat all requests as a single "anonymous user"
CREATE POLICY "Allow select conversations"
  ON public.conversations FOR SELECT
  USING (true);

CREATE POLICY "Allow insert conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update conversations"
  ON public.conversations FOR UPDATE
  USING (true);

CREATE POLICY "Allow delete conversations"
  ON public.conversations FOR DELETE
  USING (true);

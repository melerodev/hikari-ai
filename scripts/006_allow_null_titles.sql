-- Allow null titles in conversations table
-- This allows conversations to be saved before a title is generated
ALTER TABLE public.conversations 
ALTER COLUMN title DROP NOT NULL;

-- Update any existing conversations with null titles to have a default title
UPDATE public.conversations 
SET title = 'New Chat' 
WHERE title IS NULL;

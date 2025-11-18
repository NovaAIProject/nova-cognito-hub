-- Add pinned column to chats table
ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS pinned boolean DEFAULT false;
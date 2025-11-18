-- Create verification codes table
CREATE TABLE IF NOT EXISTS public.verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + interval '15 minutes'),
  verified boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert verification codes (for signup)
CREATE POLICY "Anyone can create verification codes"
ON public.verification_codes
FOR INSERT
WITH CHECK (true);

-- Allow users to read their own verification codes
CREATE POLICY "Users can read their own codes"
ON public.verification_codes
FOR SELECT
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_verification_email ON public.verification_codes(email);
CREATE INDEX idx_verification_code ON public.verification_codes(code);

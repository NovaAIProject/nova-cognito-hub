-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table with proper security
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create support_messages table for contact form
CREATE TABLE public.support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Users can create their own support messages
CREATE POLICY "Users can create support messages"
ON public.support_messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own support messages
CREATE POLICY "Users can view their own support messages"
ON public.support_messages
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all support messages
CREATE POLICY "Admins can view all support messages"
ON public.support_messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update support message status
CREATE POLICY "Admins can update support messages"
ON public.support_messages
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create admin view for users with their emails
CREATE OR REPLACE VIEW public.admin_users_view AS
SELECT 
    au.id,
    au.email,
    au.created_at,
    au.last_sign_in_at,
    p.username,
    COALESCE(
        (SELECT json_agg(role) FROM public.user_roles WHERE user_id = au.id),
        '[]'::json
    ) as roles
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id;

-- Grant select on view to authenticated users with admin role
GRANT SELECT ON public.admin_users_view TO authenticated;
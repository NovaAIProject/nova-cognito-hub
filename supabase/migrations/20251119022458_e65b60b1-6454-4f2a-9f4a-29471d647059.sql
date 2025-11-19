-- Grant admin role to magicclash900@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'magicclash900@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
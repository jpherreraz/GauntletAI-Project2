-- Update roles in profiles table
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@example.com';

UPDATE public.profiles
SET role = 'worker'
WHERE email = 'worker@example.com';

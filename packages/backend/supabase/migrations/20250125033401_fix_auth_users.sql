-- Clean up existing users
DELETE FROM public.profiles WHERE id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');
DELETE FROM auth.users WHERE email IN ('admin@example.com', 'worker@example.com');

-- Create admin user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  aud,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  '{"firstName": "Admin", "lastName": "User"}'::jsonb,
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
);

-- Create worker user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  aud,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'worker@example.com',
  crypt('worker123', gen_salt('bf')),
  NOW(),
  '{"firstName": "Support", "lastName": "Agent"}'::jsonb,
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
);

-- Update roles in profiles table
UPDATE public.profiles
SET role = 'admin'
WHERE id = '00000000-0000-0000-0000-000000000001';

UPDATE public.profiles
SET role = 'worker'
WHERE id = '00000000-0000-0000-0000-000000000002'; 
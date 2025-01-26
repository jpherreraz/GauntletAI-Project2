-- Clean up existing users
DELETE FROM public.profiles WHERE id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');
DELETE FROM auth.users WHERE email IN ('admin@example.com', 'worker@example.com');

-- Create admin user
INSERT INTO auth.users (
  id,
  email,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_confirmed_at,
  is_super_admin,
  encrypted_password
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@example.com',
  '{"firstName": "Admin", "lastName": "User"}'::jsonb,
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  encode(gen_random_bytes(32), 'hex'),
  NOW(),
  false,
  crypt('admin123', gen_salt('bf', 10))
);

-- Create worker user
INSERT INTO auth.users (
  id,
  email,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_confirmed_at,
  is_super_admin,
  encrypted_password
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'worker@example.com',
  '{"firstName": "Support", "lastName": "Agent"}'::jsonb,
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  encode(gen_random_bytes(32), 'hex'),
  NOW(),
  false,
  crypt('worker123', gen_salt('bf', 10))
);

-- Update roles in profiles table
UPDATE public.profiles
SET role = 'admin'
WHERE id = '00000000-0000-0000-0000-000000000001';

UPDATE public.profiles
SET role = 'worker'
WHERE id = '00000000-0000-0000-0000-000000000002';

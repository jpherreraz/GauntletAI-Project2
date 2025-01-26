-- Create admin user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  '{"firstName": "Admin", "lastName": "User"}',
  NOW(),
  NOW(),
  'authenticated'
);

-- Create worker user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'worker@example.com',
  crypt('worker123', gen_salt('bf')),
  NOW(),
  '{"firstName": "Support", "lastName": "Agent"}',
  NOW(),
  NOW(),
  'authenticated'
);

-- Update roles in profiles table
UPDATE public.profiles
SET role = 'admin'
WHERE id = '00000000-0000-0000-0000-000000000001';

UPDATE public.profiles
SET role = 'worker'
WHERE id = '00000000-0000-0000-0000-000000000002';

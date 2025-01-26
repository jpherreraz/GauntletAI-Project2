-- Grant necessary permissions for auth
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres;
GRANT ALL ON ALL ROUTINES IN SCHEMA auth TO postgres;

-- Ensure auth schema is accessible
GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;

-- Allow authenticated users to use the auth schema
GRANT ALL ON ALL TABLES IN SCHEMA auth TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA auth TO authenticated;

-- Reset the users we created to ensure proper setup (delete from profiles first)
DELETE FROM public.profiles WHERE id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');
DELETE FROM auth.users WHERE email IN ('admin@example.com', 'worker@example.com');

-- Create admin user with proper auth setup
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  jsonb_build_object(
    'firstName', 'Admin',
    'lastName', 'User'
  ),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  encode(gen_random_bytes(32), 'hex')
);

-- Create worker user with proper auth setup
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'worker@example.com',
  crypt('worker123', gen_salt('bf')),
  NOW(),
  jsonb_build_object(
    'firstName', 'Support',
    'lastName', 'Agent'
  ),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  encode(gen_random_bytes(32), 'hex')
);

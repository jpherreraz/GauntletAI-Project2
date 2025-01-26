-- Enable the pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Grant permissions to auth schema
GRANT USAGE ON SCHEMA auth TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA auth TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA auth TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon, authenticated;

-- Grant permissions to public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Ensure RLS is enabled on all tables
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.tickets FORCE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments FORCE ROW LEVEL SECURITY;

-- Update the auth.users table to allow proper authentication
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading own user data
CREATE POLICY "Users can read own data" ON auth.users
FOR SELECT
USING (auth.uid() = id);

-- Create policy to allow public access to profiles
CREATE POLICY "Profiles are publicly accessible" ON public.profiles
FOR SELECT
USING (true);

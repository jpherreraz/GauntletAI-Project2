-- Drop all RLS policies from all tables
DROP POLICY IF EXISTS "Users can view their own comments" ON public.ticket_comments;
DROP POLICY IF EXISTS "Users can create their own comments" ON public.ticket_comments;
DROP POLICY IF EXISTS "Users can view ticket comments" ON public.ticket_comments;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view other profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Workers can view all tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.tickets;

-- Disable RLS on all tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments DISABLE ROW LEVEL SECURITY;

-- Revoke all permissions from anon and authenticated roles
REVOKE ALL ON public.profiles FROM anon, authenticated;
REVOKE ALL ON public.tickets FROM anon, authenticated;
REVOKE ALL ON public.ticket_comments FROM anon, authenticated;

-- Only the service role will have access, and it bypasses RLS by default
-- All access control will be handled by edge functions 
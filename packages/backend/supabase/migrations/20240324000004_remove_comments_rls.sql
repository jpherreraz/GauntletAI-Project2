-- Drop all RLS policies
DROP POLICY IF EXISTS "Users can view their own comments" ON public.ticket_comments;
DROP POLICY IF EXISTS "Users can create their own comments" ON public.ticket_comments;
DROP POLICY IF EXISTS "Users can view ticket comments" ON public.ticket_comments;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view other profiles" ON public.profiles;

-- Disable RLS on ticket_comments table
ALTER TABLE public.ticket_comments DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT ON public.ticket_comments TO authenticated;

-- Update profiles table permissions
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.profiles TO authenticated; 
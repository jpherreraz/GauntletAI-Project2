-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;

-- Grant permissions to anon users
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant execute permission on the handle_new_user function
GRANT EXECUTE ON FUNCTION public.handle_new_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user TO anon;

-- Grant execute permission on the handle_updated_at function
GRANT EXECUTE ON FUNCTION public.handle_updated_at TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_updated_at TO anon;

-- Allow usage of the user_role and ticket_status types
GRANT USAGE ON TYPE public.user_role TO authenticated;
GRANT USAGE ON TYPE public.user_role TO anon;
GRANT USAGE ON TYPE public.ticket_status TO authenticated;
GRANT USAGE ON TYPE public.ticket_status TO anon; 
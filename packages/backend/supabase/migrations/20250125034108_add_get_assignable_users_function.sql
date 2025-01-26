-- Create function to get assignable users (workers and admins)
CREATE OR REPLACE FUNCTION get_assignable_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) SECURITY DEFINER
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, 
    p.email, 
    p.first_name, 
    p.last_name, 
    p.role::TEXT,
    p.created_at, 
    p.updated_at
  FROM public.profiles p
  WHERE p.role IN ('worker', 'admin');
END;
$$; 
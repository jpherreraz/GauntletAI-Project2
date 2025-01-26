-- Create function to get user profile
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
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
    p.role::TEXT,  -- Cast role to TEXT
    p.created_at, 
    p.updated_at
  FROM public.profiles p
  WHERE p.id = user_id;
END;
$$; 
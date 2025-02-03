-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_user_profile(UUID);

-- Create a function to get user profile using service role
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS TABLE (role TEXT)
SECURITY DEFINER -- This makes the function run with the privileges of the creator
SET search_path = public -- This prevents search_path attacks
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT p.role
  FROM profiles p
  WHERE p.id = user_id;
END;
$$; 
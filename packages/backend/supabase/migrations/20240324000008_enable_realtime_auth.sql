-- Enable realtime for authenticated users
ALTER PUBLICATION supabase_realtime ADD TABLE ticket_comments;
ALTER TABLE ticket_comments REPLICA IDENTITY FULL;

-- Grant realtime permissions to authenticated users
GRANT SELECT ON ticket_comments TO authenticated;

-- Enable realtime access for authenticated users
BEGIN;
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Enable realtime for authenticated users" ON ticket_comments;
  
  -- Create new policy
  CREATE POLICY "Enable realtime for authenticated users"
    ON ticket_comments
    FOR SELECT
    TO authenticated
    USING (true);
COMMIT; 
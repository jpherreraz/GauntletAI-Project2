-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;
DROP POLICY IF EXISTS "Customers can create tickets" ON tickets;
DROP POLICY IF EXISTS "Staff can update tickets" ON tickets;
DROP POLICY IF EXISTS "Staff can delete tickets" ON tickets;
DROP POLICY IF EXISTS "Anyone can create tickets" ON tickets;

-- Create new policies
CREATE POLICY "Users can view their own tickets"
  ON tickets FOR SELECT
  USING (auth.uid() = customer_id OR auth.uid() = assignee_id OR auth.jwt()->>'role' IN ('admin', 'worker'));

CREATE POLICY "Anyone can create tickets"
  ON tickets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can update tickets"
  ON tickets FOR UPDATE
  USING (auth.jwt()->>'role' IN ('admin', 'worker'));

CREATE POLICY "Staff can delete tickets"
  ON tickets FOR DELETE
  USING (auth.jwt()->>'role' IN ('admin', 'worker')); 
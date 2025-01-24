-- Create enum types
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'pending', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Create tickets table
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'open',
  priority ticket_priority NOT NULL DEFAULT 'low',
  customer_id UUID NOT NULL REFERENCES auth.users(id),
  assignee_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create ticket comments table
CREATE TABLE ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create ticket attachments table
CREATE TABLE ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create view for ticket counts
CREATE VIEW ticket_counts_view AS
SELECT
  COUNT(*) FILTER (WHERE assignee_id IS NULL AND deleted = FALSE) AS unassigned,
  COUNT(*) FILTER (WHERE status = 'open' AND deleted = FALSE) AS unsolved,
  COUNT(*) FILTER (WHERE updated_at > NOW() - INTERVAL '24 hours' AND deleted = FALSE) AS recent,
  COUNT(*) FILTER (WHERE status = 'pending' AND deleted = FALSE) AS pending,
  COUNT(*) FILTER (WHERE status = 'resolved' AND deleted = FALSE) AS solved,
  COUNT(*) FILTER (WHERE status = 'closed' AND deleted = FALSE) AS suspended,
  COUNT(*) FILTER (WHERE deleted = TRUE) AS deleted
FROM tickets;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_comments_updated_at
  BEFORE UPDATE ON ticket_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;

-- Tickets policies
CREATE POLICY "Users can view their own tickets"
  ON tickets FOR SELECT
  USING (auth.uid() = customer_id OR auth.uid() = assignee_id OR auth.jwt()->>'role' IN ('admin', 'worker'));

CREATE POLICY "Customers can create tickets"
  ON tickets FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Staff can update tickets"
  ON tickets FOR UPDATE
  USING (auth.jwt()->>'role' IN ('admin', 'worker'));

-- Comments policies
CREATE POLICY "Users can view comments on their tickets"
  ON ticket_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tickets
    WHERE tickets.id = ticket_comments.ticket_id
    AND (tickets.customer_id = auth.uid() OR tickets.assignee_id = auth.uid() OR auth.jwt()->>'role' IN ('admin', 'worker'))
  ));

CREATE POLICY "Users can create comments on their tickets"
  ON ticket_comments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM tickets
    WHERE tickets.id = ticket_comments.ticket_id
    AND (tickets.customer_id = auth.uid() OR tickets.assignee_id = auth.uid() OR auth.jwt()->>'role' IN ('admin', 'worker'))
  ));

-- Attachments policies
CREATE POLICY "Users can view attachments on their tickets"
  ON ticket_attachments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tickets
    WHERE tickets.id = ticket_attachments.ticket_id
    AND (tickets.customer_id = auth.uid() OR tickets.assignee_id = auth.uid() OR auth.jwt()->>'role' IN ('admin', 'worker'))
  ));

CREATE POLICY "Users can upload attachments to their tickets"
  ON ticket_attachments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM tickets
    WHERE tickets.id = ticket_attachments.ticket_id
    AND (tickets.customer_id = auth.uid() OR tickets.assignee_id = auth.uid() OR auth.jwt()->>'role' IN ('admin', 'worker'))
  )); 
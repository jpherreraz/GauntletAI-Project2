-- Add category and priority columns to tickets table
ALTER TABLE tickets ADD COLUMN category TEXT NOT NULL DEFAULT 'general';
ALTER TABLE tickets ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
ALTER TABLE tickets ADD COLUMN status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'pending', 'resolved', 'closed'));

-- Disable RLS since we're handling access control in edge functions
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;

-- Create stored procedure for creating tickets
CREATE OR REPLACE FUNCTION create_ticket(
  p_title TEXT,
  p_description TEXT,
  p_priority TEXT,
  p_category TEXT,
  p_customer_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_ticket JSONB;
BEGIN
  INSERT INTO tickets (
    title,
    description,
    priority,
    category,
    customer_id,
    status
  ) VALUES (
    p_title,
    p_description,
    p_priority,
    p_category,
    p_customer_id,
    'open'
  )
  RETURNING jsonb_build_object(
    'id', id,
    'title', title,
    'description', description,
    'priority', priority,
    'category', category,
    'customer_id', customer_id,
    'status', status,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO v_ticket;

  RETURN v_ticket;
END;
$$ LANGUAGE plpgsql; 
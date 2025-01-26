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
    'pending'
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
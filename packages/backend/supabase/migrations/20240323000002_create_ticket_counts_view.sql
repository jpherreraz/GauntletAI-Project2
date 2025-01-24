-- Drop view if exists
DROP VIEW IF EXISTS ticket_counts_view;

-- Create view for ticket counts
CREATE VIEW ticket_counts_view AS
SELECT
  COUNT(*) FILTER (WHERE assignee_id IS NULL) AS unassigned,
  COUNT(*) FILTER (WHERE status = 'open') AS unsolved,
  COUNT(*) FILTER (WHERE updated_at > NOW() - INTERVAL '24 hours') AS recent,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending,
  COUNT(*) FILTER (WHERE status = 'resolved') AS solved,
  COUNT(*) FILTER (WHERE status = 'closed') AS suspended,
  0 AS deleted
FROM tickets;

-- Grant access to the view
GRANT SELECT ON ticket_counts_view TO authenticated; 
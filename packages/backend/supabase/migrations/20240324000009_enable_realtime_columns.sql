-- Enable realtime for specific columns in ticket_comments table
BEGIN;
  -- First make sure the table is in the publication
  ALTER PUBLICATION supabase_realtime ADD TABLE ticket_comments;
  
  -- Enable replication on all columns we need for the realtime feed
  ALTER TABLE ticket_comments REPLICA IDENTITY FULL;
  
  -- Enable specific columns for realtime
  COMMENT ON COLUMN ticket_comments.id IS E'@realtime';
  COMMENT ON COLUMN ticket_comments.ticket_id IS E'@realtime';
  COMMENT ON COLUMN ticket_comments.user_id IS E'@realtime';
  COMMENT ON COLUMN ticket_comments.content IS E'@realtime';
  COMMENT ON COLUMN ticket_comments.created_at IS E'@realtime';
  COMMENT ON COLUMN ticket_comments.updated_at IS E'@realtime';
COMMIT; 
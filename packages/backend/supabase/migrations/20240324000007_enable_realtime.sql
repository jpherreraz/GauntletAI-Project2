-- Enable realtime for ticket_comments table
ALTER PUBLICATION supabase_realtime ADD TABLE ticket_comments;

-- Set replica identity to full to get old record on updates
ALTER TABLE ticket_comments REPLICA IDENTITY FULL; 
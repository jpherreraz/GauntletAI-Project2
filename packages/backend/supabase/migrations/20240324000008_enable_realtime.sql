-- Enable real-time for ticket_comments table
ALTER PUBLICATION supabase_realtime ADD TABLE ticket_comments;

-- Enable replication on the ticket_comments table
ALTER TABLE ticket_comments REPLICA IDENTITY FULL; 
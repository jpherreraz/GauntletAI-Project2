-- Add priority column to tickets table
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Update existing tickets to have a default priority if needed
UPDATE tickets SET priority = 'medium' WHERE priority IS NULL; 
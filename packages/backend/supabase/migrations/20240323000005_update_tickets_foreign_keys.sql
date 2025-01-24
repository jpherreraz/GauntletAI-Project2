-- Drop existing foreign key constraints
ALTER TABLE tickets
DROP CONSTRAINT IF EXISTS tickets_customer_id_fkey,
DROP CONSTRAINT IF EXISTS tickets_assignee_id_fkey;

-- Add new foreign key constraints
ALTER TABLE tickets
ADD CONSTRAINT tickets_customer_id_fkey
  FOREIGN KEY (customer_id)
  REFERENCES profiles(id)
  ON DELETE CASCADE,
ADD CONSTRAINT tickets_assignee_id_fkey
  FOREIGN KEY (assignee_id)
  REFERENCES profiles(id)
  ON DELETE SET NULL; 
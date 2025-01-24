-- Rename columns to use camelCase
ALTER TABLE tickets
  RENAME COLUMN customer_id TO "customerId",
  RENAME COLUMN assignee_id TO "assigneeId",
  RENAME COLUMN due_date TO "dueDate",
  RENAME COLUMN created_at TO "createdAt",
  RENAME COLUMN updated_at TO "updatedAt";

-- Update foreign key constraints
ALTER TABLE tickets
  DROP CONSTRAINT IF EXISTS tickets_customer_id_fkey,
  DROP CONSTRAINT IF EXISTS tickets_assignee_id_fkey;

ALTER TABLE tickets
  ADD CONSTRAINT tickets_customerId_fkey
    FOREIGN KEY ("customerId")
    REFERENCES profiles(id)
    ON DELETE CASCADE,
  ADD CONSTRAINT tickets_assigneeId_fkey
    FOREIGN KEY ("assigneeId")
    REFERENCES profiles(id)
    ON DELETE SET NULL; 
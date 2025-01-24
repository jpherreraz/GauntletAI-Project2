-- Update tickets table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'customer_id') THEN
        ALTER TABLE tickets RENAME COLUMN customer_id TO customerId;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'assignee_id') THEN
        ALTER TABLE tickets RENAME COLUMN assignee_id TO assigneeId;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'due_date') THEN
        ALTER TABLE tickets RENAME COLUMN due_date TO dueDate;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'created_at') THEN
        ALTER TABLE tickets RENAME COLUMN created_at TO createdAt;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'updated_at') THEN
        ALTER TABLE tickets RENAME COLUMN updated_at TO updatedAt;
    END IF;
END $$;

-- Update ticket_comments table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_comments' AND column_name = 'ticket_id') THEN
        ALTER TABLE ticket_comments RENAME COLUMN ticket_id TO ticketId;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_comments' AND column_name = 'user_id') THEN
        ALTER TABLE ticket_comments RENAME COLUMN user_id TO userId;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_comments' AND column_name = 'created_at') THEN
        ALTER TABLE ticket_comments RENAME COLUMN created_at TO createdAt;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_comments' AND column_name = 'updated_at') THEN
        ALTER TABLE ticket_comments RENAME COLUMN updated_at TO updatedAt;
    END IF;
END $$;

-- Update ticket_attachments table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_attachments' AND column_name = 'ticket_id') THEN
        ALTER TABLE ticket_attachments RENAME COLUMN ticket_id TO ticketId;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_attachments' AND column_name = 'file_name') THEN
        ALTER TABLE ticket_attachments RENAME COLUMN file_name TO fileName;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_attachments' AND column_name = 'file_type') THEN
        ALTER TABLE ticket_attachments RENAME COLUMN file_type TO fileType;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_attachments' AND column_name = 'file_size') THEN
        ALTER TABLE ticket_attachments RENAME COLUMN file_size TO fileSize;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_attachments' AND column_name = 'file_url') THEN
        ALTER TABLE ticket_attachments RENAME COLUMN file_url TO fileUrl;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_attachments' AND column_name = 'uploaded_by') THEN
        ALTER TABLE ticket_attachments RENAME COLUMN uploaded_by TO uploadedBy;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_attachments' AND column_name = 'created_at') THEN
        ALTER TABLE ticket_attachments RENAME COLUMN created_at TO createdAt;
    END IF;
END $$;

-- Update profiles table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'first_name') THEN
        ALTER TABLE profiles RENAME COLUMN first_name TO firstName;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_name') THEN
        ALTER TABLE profiles RENAME COLUMN last_name TO lastName;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles RENAME COLUMN avatar_url TO avatarUrl;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
        ALTER TABLE profiles RENAME COLUMN created_at TO createdAt;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE profiles RENAME COLUMN updated_at TO updatedAt;
    END IF;
END $$;

-- Update foreign key constraints
DO $$ 
BEGIN
    -- Drop old constraints if they exist
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'tickets_customer_id_fkey') THEN
        ALTER TABLE tickets DROP CONSTRAINT tickets_customer_id_fkey;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'tickets_assignee_id_fkey') THEN
        ALTER TABLE tickets DROP CONSTRAINT tickets_assignee_id_fkey;
    END IF;

    -- Add new constraints if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'tickets_customerid_fkey') THEN
        ALTER TABLE tickets ADD CONSTRAINT tickets_customerid_fkey FOREIGN KEY (customerId) REFERENCES auth.users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'tickets_assigneeid_fkey') THEN
        ALTER TABLE tickets ADD CONSTRAINT tickets_assigneeid_fkey FOREIGN KEY (assigneeId) REFERENCES auth.users(id);
    END IF;
END $$;

DO $$ 
BEGIN
    -- Drop old constraints if they exist
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ticket_comments_ticket_id_fkey') THEN
        ALTER TABLE ticket_comments DROP CONSTRAINT ticket_comments_ticket_id_fkey;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ticket_comments_user_id_fkey') THEN
        ALTER TABLE ticket_comments DROP CONSTRAINT ticket_comments_user_id_fkey;
    END IF;

    -- Add new constraints if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ticket_comments_ticketid_fkey') THEN
        ALTER TABLE ticket_comments ADD CONSTRAINT ticket_comments_ticketid_fkey FOREIGN KEY (ticketId) REFERENCES tickets(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ticket_comments_userid_fkey') THEN
        ALTER TABLE ticket_comments ADD CONSTRAINT ticket_comments_userid_fkey FOREIGN KEY (userId) REFERENCES auth.users(id);
    END IF;
END $$;

DO $$ 
BEGIN
    -- Drop old constraints if they exist
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ticket_attachments_ticket_id_fkey') THEN
        ALTER TABLE ticket_attachments DROP CONSTRAINT ticket_attachments_ticket_id_fkey;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ticket_attachments_uploaded_by_fkey') THEN
        ALTER TABLE ticket_attachments DROP CONSTRAINT ticket_attachments_uploaded_by_fkey;
    END IF;

    -- Add new constraints if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ticket_attachments_ticketid_fkey') THEN
        ALTER TABLE ticket_attachments ADD CONSTRAINT ticket_attachments_ticketid_fkey FOREIGN KEY (ticketId) REFERENCES tickets(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ticket_attachments_uploadedby_fkey') THEN
        ALTER TABLE ticket_attachments ADD CONSTRAINT ticket_attachments_uploadedby_fkey FOREIGN KEY (uploadedBy) REFERENCES auth.users(id);
    END IF;
END $$;

-- Update ticket counts view
DROP VIEW IF EXISTS ticket_counts_view;
CREATE VIEW ticket_counts_view AS
SELECT
  COUNT(*) FILTER (WHERE "assigneeId" IS NULL) AS unassigned,
  COUNT(*) FILTER (WHERE status = 'open') AS unsolved,
  COUNT(*) FILTER (WHERE "updatedAt" > NOW() - INTERVAL '24 hours') AS recent,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending,
  COUNT(*) FILTER (WHERE status = 'resolved') AS solved,
  COUNT(*) FILTER (WHERE status = 'closed') AS suspended,
  0 AS deleted
FROM tickets; 
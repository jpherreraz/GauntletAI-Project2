-- Remove RLS from FAQs table
alter table public.faqs disable row level security;

-- Drop all existing policies
drop policy if exists "Allow all users to read FAQs" on public.faqs;
drop policy if exists "Allow admins to manage FAQs" on public.faqs;

-- Ensure service role has full access
grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant all privileges on all routines in schema public to service_role; 
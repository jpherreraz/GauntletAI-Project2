-- Grant access to service role
grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant all privileges on all routines in schema public to service_role;

-- Grant access to authenticated users
grant usage on schema public to authenticated;
grant select on public.faqs to authenticated; 
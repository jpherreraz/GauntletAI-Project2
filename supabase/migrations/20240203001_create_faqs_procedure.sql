-- Create a function to set up the FAQs table
create or replace function create_faqs_table()
returns void
language plpgsql
security definer
as $$
begin
  -- Create FAQs table if it doesn't exist
  create table if not exists public.faqs (
    id uuid primary key default gen_random_uuid(),
    question text not null,
    answer text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  -- Enable Row Level Security (RLS)
  alter table public.faqs enable row level security;

  -- Drop existing policies if they exist
  drop policy if exists "Allow all users to read FAQs" on public.faqs;
  drop policy if exists "Allow admins to manage FAQs" on public.faqs;

  -- Create policy to allow all users to read FAQs
  create policy "Allow all users to read FAQs"
    on public.faqs
    for select
    to authenticated
    using (true);

  -- Create policy to allow only admins to manage FAQs
  create policy "Allow admins to manage FAQs"
    on public.faqs
    for all
    to authenticated
    using (auth.jwt()->>'role' = 'admin')
    with check (auth.jwt()->>'role' = 'admin');
end;
$$; 
-- Create FAQ table
create table public.faqs (
  id uuid primary key default uuid_generate_v4(),
  question text not null,
  answer text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS
alter table public.faqs enable row level security;

-- Policies
-- Everyone can read FAQs
create policy "Everyone can read FAQs"
  on public.faqs for select
  to authenticated
  using (true);

-- Only admins can create/update/delete FAQs
create policy "Admins can manage FAQs"
  on public.faqs for all
  to authenticated
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

-- Add updated_at trigger
create trigger handle_updated_at before update on public.faqs
  for each row execute procedure moddatetime (updated_at); 
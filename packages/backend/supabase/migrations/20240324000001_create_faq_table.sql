-- Create FAQ table
create table public.faqs (
  id uuid primary key default uuid_generate_v4(),
  question text not null,
  answer text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Disable RLS since we're using edge functions with service role
alter table public.faqs disable row level security;

-- Add updated_at trigger
create trigger handle_updated_at before update on public.faqs
  for each row execute procedure moddatetime (updated_at); 
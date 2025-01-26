-- Create ticket comments table
create table public.ticket_comments (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS
alter table public.ticket_comments enable row level security;

-- Policies
-- Users can read comments on tickets they have access to
create policy "Users can read comments on accessible tickets"
  on public.ticket_comments for select
  to authenticated
  using (
    exists (
      select 1 from public.tickets t
      where t.id = ticket_id
      and (
        auth.uid() = t.customer_id
        or auth.uid() = t.assignee_id
        or auth.jwt() ->> 'role' = 'admin'
      )
    )
  );

-- Users can create comments on tickets they have access to
create policy "Users can create comments on accessible tickets"
  on public.ticket_comments for insert
  to authenticated
  with check (
    exists (
      select 1 from public.tickets t
      where t.id = ticket_id
      and (
        auth.uid() = t.customer_id
        or auth.uid() = t.assignee_id
        or auth.jwt() ->> 'role' = 'admin'
      )
    )
    and auth.uid() = user_id
  );

-- Add updated_at trigger
create trigger handle_updated_at before update on public.ticket_comments
  for each row execute procedure moddatetime (updated_at); 
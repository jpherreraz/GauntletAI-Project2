-- Enable RLS (Row Level Security)
alter table auth.users enable row level security;

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  first_name text not null,
  last_name text not null,
  role text not null check (role in ('admin', 'worker', 'customer')),
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Create tickets table
create table public.tickets (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  status text not null check (status in ('open', 'in_progress', 'pending', 'resolved', 'closed')),
  priority text not null check (priority in ('low', 'medium', 'high', 'urgent')),
  customer_id uuid references public.profiles(id) not null,
  assignee_id uuid references public.profiles(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  due_date timestamptz,
  category text not null,
  tags text[] default '{}'::text[]
);

-- Create ticket_comments table
create table public.ticket_comments (
  id uuid default uuid_generate_v4() primary key,
  ticket_id uuid references public.tickets(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  content text not null,
  attachments text[] default '{}'::text[],
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Create ticket_attachments table
create table public.ticket_attachments (
  id uuid default uuid_generate_v4() primary key,
  ticket_id uuid references public.tickets(id) on delete cascade not null,
  file_name text not null,
  file_type text not null,
  file_size integer not null,
  file_url text not null,
  uploaded_by uuid references public.profiles(id) not null,
  created_at timestamptz default now() not null
);

-- Create notifications table
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  type text not null,
  title text not null,
  content text not null,
  read boolean default false,
  created_at timestamptz default now() not null
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_comments enable row level security;
alter table public.ticket_attachments enable row level security;
alter table public.notifications enable row level security;

-- Create RLS policies

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Tickets policies
create policy "Tickets are viewable by involved users and staff"
  on public.tickets for select
  using (
    auth.uid() = customer_id
    or auth.uid() = assignee_id
    or exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'worker')
    )
  );

create policy "Customers can create tickets"
  on public.tickets for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'customer'
    )
  );

create policy "Staff can update tickets"
  on public.tickets for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'worker')
    )
  );

-- Comments policies
create policy "Comments are viewable by involved users and staff"
  on public.ticket_comments for select
  using (
    exists (
      select 1 from public.tickets
      where id = ticket_id
      and (
        customer_id = auth.uid()
        or assignee_id = auth.uid()
        or exists (
          select 1 from public.profiles
          where id = auth.uid()
          and role in ('admin', 'worker')
        )
      )
    )
  );

create policy "Users can create comments on accessible tickets"
  on public.ticket_comments for insert
  with check (
    exists (
      select 1 from public.tickets
      where id = ticket_id
      and (
        customer_id = auth.uid()
        or assignee_id = auth.uid()
        or exists (
          select 1 from public.profiles
          where id = auth.uid()
          and role in ('admin', 'worker')
        )
      )
    )
  );

-- Attachments policies
create policy "Attachments are viewable by involved users and staff"
  on public.ticket_attachments for select
  using (
    exists (
      select 1 from public.tickets
      where id = ticket_id
      and (
        customer_id = auth.uid()
        or assignee_id = auth.uid()
        or exists (
          select 1 from public.profiles
          where id = auth.uid()
          and role in ('admin', 'worker')
        )
      )
    )
  );

create policy "Users can upload attachments to accessible tickets"
  on public.ticket_attachments for insert
  with check (
    exists (
      select 1 from public.tickets
      where id = ticket_id
      and (
        customer_id = auth.uid()
        or assignee_id = auth.uid()
        or exists (
          select 1 from public.profiles
          where id = auth.uid()
          and role in ('admin', 'worker')
        )
      )
    )
  );

-- Notifications policies
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Create functions and triggers

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Update triggers for tables with updated_at
create trigger handle_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.tickets
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.ticket_comments
  for each row
  execute function public.handle_updated_at(); 
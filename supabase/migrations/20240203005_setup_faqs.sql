-- Create FAQs table
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
  using (auth.jwt()->>'role' = 'admin')
  with check (auth.jwt()->>'role' = 'admin');

-- Add initial FAQs
insert into public.faqs (question, answer) values
  ('How do I submit a support ticket?', 'Click the "Contact Support" button or navigate to the Tickets page. Then click "New Ticket", fill in the details of your issue, and submit the form.'),
  ('How long will it take to get a response?', 'Our support team typically responds within 24-48 hours. For urgent issues, please indicate this in your ticket description.'),
  ('Can I update my ticket after submitting it?', 'Yes, you can add additional information to your ticket at any time by adding comments to the conversation.'),
  ('What should I do if my issue is urgent?', 'When creating your ticket, clearly indicate the urgency in the description. Our team prioritizes tickets based on their impact and urgency.'),
  ('How can I check the status of my ticket?', 'You can view all your tickets and their current status in the Tickets section. Each ticket will show its current status: Pending, In Progress, or Resolved.'); 
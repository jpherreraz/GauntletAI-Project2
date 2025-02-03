-- Drop existing policies
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
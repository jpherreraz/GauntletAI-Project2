-- Delete existing users (delete from profiles first due to foreign key constraint)
DELETE FROM public.profiles WHERE id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');
DELETE FROM auth.users WHERE email IN ('admin@example.com', 'worker@example.com');

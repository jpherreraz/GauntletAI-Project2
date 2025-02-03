-- Insert FAQs if they don't exist
insert into public.faqs (question, answer)
select
  'How do I submit a support ticket?',
  'Click the "Contact Support" button or navigate to the Tickets page. Then click "New Ticket", fill in the details of your issue, and submit the form.'
where not exists (select 1 from public.faqs);

insert into public.faqs (question, answer)
select
  'How long will it take to get a response?',
  'Our support team typically responds within 24-48 hours. For urgent issues, please indicate this in your ticket description.'
where not exists (select 1 from public.faqs);

insert into public.faqs (question, answer)
select
  'Can I update my ticket after submitting it?',
  'Yes, you can add additional information to your ticket at any time by adding comments to the conversation.'
where not exists (select 1 from public.faqs);

insert into public.faqs (question, answer)
select
  'What should I do if my issue is urgent?',
  'When creating your ticket, clearly indicate the urgency in the description. Our team prioritizes tickets based on their impact and urgency.'
where not exists (select 1 from public.faqs);

insert into public.faqs (question, answer)
select
  'How can I check the status of my ticket?',
  'You can view all your tickets and their current status in the Tickets section. Each ticket will show its current status: Pending, In Progress, or Resolved.'
where not exists (select 1 from public.faqs); 
-- Create a temporary table with unique FAQs
create temporary table unique_faqs as
select distinct on (question) id, question, answer, created_at, updated_at
from public.faqs
order by question, created_at;

-- Delete all FAQs
truncate public.faqs;

-- Reinsert unique FAQs
insert into public.faqs (id, question, answer, created_at, updated_at)
select id, question, answer, created_at, updated_at
from unique_faqs; 
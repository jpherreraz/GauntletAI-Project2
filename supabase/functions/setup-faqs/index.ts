// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Create FAQs table
    const { error: createError } = await supabaseClient.rpc('create_faqs_table');
    if (createError) {
      throw createError;
    }

    // Add initial FAQs
    const initialFaqs = [
      {
        question: 'How do I submit a support ticket?',
        answer: 'Click the "Contact Support" button or navigate to the Tickets page. Then click "New Ticket", fill in the details of your issue, and submit the form.',
      },
      {
        question: 'How long will it take to get a response?',
        answer: 'Our support team typically responds within 24-48 hours. For urgent issues, please indicate this in your ticket description.',
      },
      {
        question: 'Can I update my ticket after submitting it?',
        answer: 'Yes, you can add additional information to your ticket at any time by adding comments to the conversation.',
      },
      {
        question: 'What should I do if my issue is urgent?',
        answer: 'When creating your ticket, clearly indicate the urgency in the description. Our team prioritizes tickets based on their impact and urgency.',
      },
      {
        question: 'How can I check the status of my ticket?',
        answer: 'You can view all your tickets and their current status in the Tickets section. Each ticket will show its current status: Pending, In Progress, or Resolved.',
      },
    ];

    const { error: insertError } = await supabaseClient
      .from('faqs')
      .insert(initialFaqs);

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({ message: 'FAQs table created and populated successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/setup-faqs' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

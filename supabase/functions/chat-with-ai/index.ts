// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import OpenAI from 'https://deno.land/x/openai@v4.24.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("Hello from Functions!")

async function createTicket(supabaseClient: any, userId: string, title: string, description: string) {
  console.log('Creating ticket with:', { userId, title, description });
  
  try {
    const { data: ticket, error } = await supabaseClient
      .from('tickets')
      .insert({
        title,
        description,
        status: 'pending',
        customer_id: userId,
        priority: 'medium'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating ticket:', error);
      throw new Error(`Failed to create ticket: ${error.message}`);
    }

    if (!ticket) {
      console.error('No ticket data returned after creation');
      throw new Error('Failed to create ticket: No data returned');
    }
    
    console.log('Ticket created successfully:', ticket);
    return ticket;
  } catch (error) {
    console.error('Error in createTicket function:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

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

    // Get the token from the request header
    const authHeader = req.headers.get('Authorization')?.split(' ')[1];
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify the user's token
    const { data: { user }, error: verificationError } = await supabaseClient.auth.getUser(authHeader);
    if (verificationError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get the message and conversation history from request body
    const { message, history = [], createTicketConfirmed = false } = await req.json();
    if (!message) {
      return new Response(
        JSON.stringify({ error: 'No message provided' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get FAQs from the database to provide context
    const { data: faqs } = await supabaseClient
      .from('faqs')
      .select('question, answer');

    // Create the system message with FAQ context
    const faqContext = faqs
      ? faqs.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')
      : '';

    // If user confirmed ticket creation, create it
    if (createTicketConfirmed) {
      try {
        console.log('Starting ticket creation process');
        
        // Use the conversation history to create a meaningful ticket
        const ticketPrompt = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Based on the conversation history, create a concise ticket title and description. Return it in JSON format with "title" and "description" fields.'
            },
            ...history.map((msg: any) => ({
              role: msg.role,
              content: msg.content
            }))
          ],
          temperature: 0.7,
          max_tokens: 500,
          response_format: { type: "json_object" }
        });

        const aiResponse = ticketPrompt.choices[0].message.content;
        console.log('OpenAI response:', aiResponse);
        
        let ticketDetails;
        try {
          ticketDetails = JSON.parse(aiResponse);
          
          if (!ticketDetails.title || !ticketDetails.description) {
            throw new Error('OpenAI response missing required fields');
          }
          
          console.log('Parsed ticket details:', ticketDetails);
        } catch (parseError) {
          console.error('Error parsing OpenAI response:', parseError);
          throw new Error(`Failed to parse ticket details: ${parseError.message}`);
        }

        const ticket = await createTicket(
          supabaseClient,
          user.id,
          ticketDetails.title,
          ticketDetails.description
        );

        if (!ticket) {
          throw new Error('No ticket data returned after creation');
        }

        return new Response(
          JSON.stringify({
            response: `I've created a support ticket for you with the following details:\nTitle: ${ticket.title}\nDescription: ${ticket.description}\n\nOur support team will review your ticket and get back to you soon.`,
            ticket
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } catch (error) {
        console.error('Error in ticket creation process:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        return new Response(
          JSON.stringify({
            response: `I apologize, but I encountered an error while creating the ticket: ${errorMessage}. Please try again or contact our support team directly.`,
            error: errorMessage
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a customer support AI assistant focused solely on answering questions based on the provided FAQ information. Here are the FAQs you can use to provide responses:

${faqContext}

Instructions:
1. ONLY answer questions that can be directly answered using the FAQ information above. Do not use general knowledge or attempt to answer questions outside of the FAQ context.

2. If a question cannot be answered using the FAQ information:
   - Politely acknowledge that the question is outside the scope of the available FAQ information
   - Explain that you can help create a support ticket to get assistance from the support team
   - Ask if they would like you to automatically create a support ticket for them
   - Wait for their confirmation before creating the ticket

Remember:
- Stay strictly within the FAQ information provided
- Do not attempt to answer questions using general knowledge
- If the question isn't covered in the FAQs, always offer to create a support ticket
- Be polite and professional in all responses`
        },
        ...history.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    // Return the AI response
    return new Response(
      JSON.stringify({ response: completion.choices[0].message.content }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/chat-with-ai' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

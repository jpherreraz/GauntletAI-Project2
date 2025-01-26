import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function handleRequest(req: Request): Promise<Response> {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get auth user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return new Response(
        JSON.stringify({ error: 'Failed to get user role' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const path = url.pathname.split('/').filter(Boolean);
    const method = req.method;

    // Handle different operations based on the path and method
    switch (true) {
      // POST /tickets/:id/attachments - Upload attachment
      case method === 'POST' && path.length === 3 && path[2] === 'attachments': {
        const ticketId = path[1];

        // First get the ticket to check access
        const { data: ticket, error: ticketError } = await supabase
          .from('tickets')
          .select('*')
          .eq('id', ticketId)
          .single();

        if (ticketError) {
          return new Response(
            JSON.stringify({ error: 'Ticket not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check if user has access to the ticket
        if (
          profile.role === 'customer' && ticket.customer_id !== user.id ||
          profile.role === 'worker' && ticket.assignee_id !== user.id
        ) {
          return new Response(
            JSON.stringify({ error: 'Access denied' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get the file from form data
        const formData = await req.formData();
        const file = formData.get('file') as File;
        if (!file) {
          return new Response(
            JSON.stringify({ error: 'No file provided' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Upload to storage
        const fileName = `${ticketId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('ticket-attachments')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('ticket-attachments')
          .getPublicUrl(fileName);

        // Create attachment record
        const { data: attachment, error } = await supabase
          .from('ticket_attachments')
          .insert({
            ticket_id: ticketId,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            file_url: publicUrl,
            uploaded_by: user.id,
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ attachment }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // DELETE /tickets/attachments/:id - Delete attachment
      case method === 'DELETE' && path.length === 3 && path[1] === 'attachments': {
        const attachmentId = path[2];

        // First get the attachment to check access
        const { data: attachment, error: attachmentError } = await supabase
          .from('ticket_attachments')
          .select('*, ticket:tickets!inner(*)')
          .eq('id', attachmentId)
          .single();

        if (attachmentError) {
          return new Response(
            JSON.stringify({ error: 'Attachment not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check if user has access to the ticket
        if (
          profile.role === 'customer' && attachment.ticket.customer_id !== user.id ||
          profile.role === 'worker' && attachment.ticket.assignee_id !== user.id
        ) {
          return new Response(
            JSON.stringify({ error: 'Access denied' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Extract file path from URL
        const filePath = attachment.file_url.split('/').slice(-2).join('/');

        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('ticket-attachments')
          .remove([filePath]);

        if (storageError) throw storageError;

        // Delete record
        const { error } = await supabase
          .from('ticket_attachments')
          .delete()
          .eq('id', attachmentId);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (err) {
    console.error('Error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

serve(handleRequest); 
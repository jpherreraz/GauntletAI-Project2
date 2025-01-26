import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Get the base Supabase URL and service role key
const supabaseUrl = Deno.env.get('EDGE_FUNCTION_URL')?.replace('/functions/v1', '') ?? '';
const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY') ?? '';

// Create Supabase client with the base URL
const supabase = createClient(supabaseUrl, serviceRoleKey);

interface TicketCreate {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
}

interface TicketUpdate {
  title?: string;
  description?: string;
  status?: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee_id?: string | null;
  category?: string;
}

async function handleRequest(req: Request): Promise<Response> {
  // Always add CORS headers
  const headers = { ...corsHeaders };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers
    });
  }

  try {
    // Add JSON content type for all responses except OPTIONS
    headers['Content-Type'] = 'application/json';

    // Get auth user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers }
      );
    }

    // Get user's role
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      // Create a profile if it doesn't exist
      const { data: newProfile, error: createProfileError } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          email: user.email,
          role: 'customer',
          first_name: '',
          last_name: ''
        }])
        .select('role')
        .single();

      if (createProfileError) {
        return new Response(
          JSON.stringify({ error: 'Failed to create user profile' }),
          { status: 500, headers }
        );
      }

      profile = newProfile;
    }

    const url = new URL(req.url);
    const path = url.pathname.split('/').filter(Boolean);
    const method = req.method;

    // Handle different operations based on the path and method
    switch (true) {
      // GET /tickets - List tickets
      case method === 'GET' && path.length === 1: {
        // Access control: customers can only see their tickets, workers/admins can see all
        let query = supabase.from('tickets').select(`
          *,
          customer:profiles!customer_id(
            id, email, first_name, last_name, role, created_at, updated_at
          ),
          assignee:profiles!assignee_id(
            id, email, first_name, last_name, role, created_at, updated_at
          )
        `);

        if (profile.role === 'customer') {
          query = query.eq('customer_id', user.id);
        } else if (profile.role === 'worker') {
          query = query.eq('assignee_id', user.id);
        }

        const { data: tickets, error } = await query;
        if (error) throw error;

        return new Response(
          JSON.stringify({ tickets }),
          { headers }
        );
      }

      // POST /tickets - Create ticket
      case method === 'POST' && path.length === 1: {
        // Access control: only customers can create tickets
        if (profile.role !== 'customer') {
          return new Response(
            JSON.stringify({ error: 'Only customers can create tickets' }),
            { status: 403, headers }
          );
        }

        try {
          const body: TicketCreate = await req.json();
          console.log('Received ticket data:', body);
          
          // Use create_ticket stored procedure
          const { data: insertedTicket, error: insertError } = await supabase
            .rpc('create_ticket', {
              p_title: body.title,
              p_description: body.description,
              p_priority: body.priority,
              p_category: body.category,
              p_customer_id: user.id
            });

          if (insertError) {
            console.error('Error creating ticket:', {
              error: insertError,
              details: insertError.details,
              hint: insertError.hint,
              code: insertError.code
            });
            return new Response(
              JSON.stringify({ 
                error: 'Failed to create ticket', 
                details: insertError.message,
                code: insertError.code 
              }),
              { status: 500, headers }
            );
          }

          // Then fetch the complete ticket with relations
          const { data: ticket, error: fetchError } = await supabase
            .from('tickets')
            .select(`
              id, title, description, priority, category, customer_id, status, assignee_id, created_at, updated_at,
              customer:profiles!customer_id(
                id, email, first_name, last_name, role, created_at, updated_at
              )
            `)
            .eq('id', insertedTicket.id)
            .single();

          if (fetchError) {
            console.error('Error fetching created ticket:', {
              error: fetchError,
              details: fetchError.details,
              hint: fetchError.hint,
              code: fetchError.code
            });
            return new Response(
              JSON.stringify({ 
                error: 'Failed to fetch created ticket',
                details: fetchError.message,
                code: fetchError.code
              }),
              { status: 500, headers }
            );
          }

          return new Response(
            JSON.stringify({ ticket }),
            { headers }
          );
        } catch (error) {
          console.error('Unexpected error in ticket creation:', {
            error,
            message: error.message,
            stack: error.stack
          });
          return new Response(
            JSON.stringify({ 
              error: 'Unexpected error during ticket creation',
              details: error.message
            }),
            { status: 500, headers }
          );
        }
      }

      // GET /tickets/:id - Get ticket
      case method === 'GET' && path.length === 2: {
        const ticketId = path[1];
        
        // First get the ticket to check access
        const { data: ticket, error: ticketError } = await supabase
          .from('tickets')
          .select(`
            id,
            title,
            description,
            status,
            priority,
            customer_id,
            assignee_id,
            created_at,
            updated_at
          `)
          .eq('id', ticketId)
          .single();

        if (ticketError) throw ticketError;

        // Access control: users can only view tickets they have access to
        if (
          profile.role === 'customer' && ticket.customer_id !== user.id ||
          profile.role === 'worker' && ticket.assignee_id !== user.id
        ) {
          return new Response(
            JSON.stringify({ error: 'Access denied' }),
            { status: 403, headers }
          );
        }

        // Get customer data
        const { data: customerData, error: customerError } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name, role, created_at, updated_at')
          .eq('id', ticket.customer_id)
          .single();

        if (customerError) {
          console.error('Error fetching customer:', customerError);
          throw customerError;
        }

        // Get assignee data if exists
        let assigneeData = null;
        if (ticket.assignee_id) {
          const { data, error: assigneeError } = await supabase
            .from('profiles')
            .select('id, email, first_name, last_name, role, created_at, updated_at')
            .eq('id', ticket.assignee_id)
            .single();

          if (assigneeError) {
            console.error('Error fetching assignee:', assigneeError);
          } else {
            assigneeData = data;
          }
        }

        const fullTicket = {
          ...ticket,
          customer: customerData,
          assignee: assigneeData
        };

        return new Response(
          JSON.stringify({ ticket: fullTicket }),
          { headers }
        );
      }

      // PATCH /tickets/:id - Update ticket
      case method === 'PATCH' && path.length === 2: {
        const ticketId = path[1];
        const requestBody = await req.json();
        
        console.log('Received update request:', requestBody);

        // Convert camelCase to snake_case for database
        const body: any = {};
        
        if ('assigneeId' in requestBody) {
          body.assignee_id = requestBody.assigneeId;
        }
        if ('status' in requestBody) {
          body.status = requestBody.status;
        }
        if ('title' in requestBody) {
          body.title = requestBody.title;
        }
        if ('description' in requestBody) {
          body.description = requestBody.description;
        }
        if ('priority' in requestBody) {
          body.priority = requestBody.priority;
        }

        console.log('Transformed update body:', body);

        // First get the ticket to check access
        const { data: ticket, error: ticketError } = await supabase
          .from('tickets')
          .select(`
            id,
            title,
            description,
            status,
            priority,
            customer_id,
            assignee_id,
            created_at,
            updated_at
          `)
          .eq('id', ticketId)
          .single();

        if (ticketError) {
          console.error('Error fetching ticket:', ticketError);
          throw ticketError;
        }

        if (!ticket) {
          return new Response(
            JSON.stringify({ error: 'Ticket not found' }),
            { status: 404, headers }
          );
        }

        // Access control: only workers and admins can update tickets
        if (profile.role === 'customer') {
          return new Response(
            JSON.stringify({ error: 'Only workers and admins can update tickets' }),
            { status: 403, headers }
          );
        }

        // Workers can only update their assigned tickets
        if (profile.role === 'worker' && ticket.assignee_id !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Workers can only update their assigned tickets' }),
            { status: 403, headers }
          );
        }

        console.log('Updating ticket with:', body);

        // Update the ticket
        const { data: updatedTicket, error: updateError } = await supabase
          .from('tickets')
          .update(body)
          .eq('id', ticketId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating ticket:', updateError);
          throw updateError;
        }

        // Get customer data
        const { data: customerData, error: customerError } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name, role, created_at, updated_at')
          .eq('id', updatedTicket.customer_id)
          .single();

        if (customerError) {
          console.error('Error fetching customer:', customerError);
          throw customerError;
        }

        // Get assignee data if exists
        let assigneeData = null;
        if (updatedTicket.assignee_id) {
          const { data, error: assigneeError } = await supabase
            .from('profiles')
            .select('id, email, first_name, last_name, role, created_at, updated_at')
            .eq('id', updatedTicket.assignee_id)
            .single();

          if (assigneeError) {
            console.error('Error fetching assignee:', assigneeError);
          } else {
            assigneeData = data;
          }
        }

        // Convert snake_case to camelCase for response
        const finalTicket = {
          id: updatedTicket.id,
          title: updatedTicket.title,
          description: updatedTicket.description,
          status: updatedTicket.status,
          priority: updatedTicket.priority,
          customerId: updatedTicket.customer_id,
          assigneeId: updatedTicket.assignee_id,
          createdAt: updatedTicket.created_at,
          updatedAt: updatedTicket.updated_at,
          customer: customerData ? {
            id: customerData.id,
            email: customerData.email,
            firstName: customerData.first_name,
            lastName: customerData.last_name,
            role: customerData.role,
            createdAt: customerData.created_at,
            updatedAt: customerData.updated_at,
          } : undefined,
          assignee: assigneeData ? {
            id: assigneeData.id,
            email: assigneeData.email,
            firstName: assigneeData.first_name,
            lastName: assigneeData.last_name,
            role: assigneeData.role,
            createdAt: assigneeData.created_at,
            updatedAt: assigneeData.updated_at,
          } : undefined,
        };

        console.log('Updated ticket:', finalTicket);

        return new Response(
          JSON.stringify({ ticket: finalTicket }),
          { headers }
        );
      }

      // DELETE /tickets/:id - Delete ticket
      case method === 'DELETE' && path.length === 2: {
        const ticketId = path[1];
        
        // Access control: only admins can delete tickets
        if (profile.role !== 'admin') {
          return new Response(
            JSON.stringify({ error: 'Only admins can delete tickets' }),
            { status: 403, headers }
          );
        }

        const { error } = await supabase
          .from('tickets')
          .delete()
          .eq('id', ticketId);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Not found' }),
          { status: 404, headers }
        );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
}

serve(handleRequest); 
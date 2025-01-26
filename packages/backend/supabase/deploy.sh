#!/bin/bash

# Deploy edge functions
supabase functions deploy tickets --project-ref awkgrocazvvzgxmbshrt
supabase functions deploy tickets/comments --project-ref awkgrocazvvzgxmbshrt
supabase functions deploy tickets/attachments --project-ref awkgrocazvvzgxmbshrt

# Set environment variables from frontend .env
SUPABASE_URL=$(grep VITE_SUPABASE_URL ../../frontend/.env | cut -d '=' -f2)
supabase secrets set --project-ref awkgrocazvvzgxmbshrt SUPABASE_URL="$SUPABASE_URL"

# Set service role key separately (since it's not in frontend .env)
supabase secrets set --project-ref awkgrocazvvzgxmbshrt SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here" 
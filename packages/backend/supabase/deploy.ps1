# Deploy edge functions
Write-Host "Deploying tickets function..."
supabase functions deploy tickets --project-ref awkgrocazvvzgxmbshrt

Write-Host "Deploying comments function..."
supabase functions deploy tickets_comments --project-ref awkgrocazvvzgxmbshrt

Write-Host "Deploying attachments function..."
supabase functions deploy tickets_attachments --project-ref awkgrocazvvzgxmbshrt

# Set environment variables
Write-Host "Setting environment variables..."
$envContent = Get-Content "../../frontend/.env"
$supabaseUrl = ($envContent | Select-String "VITE_SUPABASE_URL").ToString().Split("=")[1].Trim()

Write-Host "Setting EDGE_FUNCTION_URL..."
supabase secrets set --project-ref awkgrocazvvzgxmbshrt EDGE_FUNCTION_URL="$supabaseUrl/functions/v1"

Write-Host "Please enter your Supabase service role key:"
$serviceRoleKey = Read-Host -Prompt "Service Role Key"

Write-Host "Setting SERVICE_ROLE_KEY..."
supabase secrets set --project-ref awkgrocazvvzgxmbshrt SERVICE_ROLE_KEY="$serviceRoleKey"

Write-Host "Deployment complete!" 
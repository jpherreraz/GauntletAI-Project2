-- Drop the migrations table
DROP TABLE IF EXISTS supabase_migrations.schema_migrations;

-- Recreate the schema and table
CREATE SCHEMA IF NOT EXISTS supabase_migrations;
CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
    version text PRIMARY KEY,
    statements text[],
    name text
); 
-- Initialize databases for the expense tracker application
-- This script runs automatically when the PostgreSQL container starts for the first time

-- Create the expense tracker database (if not exists)
SELECT 'CREATE DATABASE expense_tracker'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'expense_tracker')\gexec

-- Create the keycloak database (if not exists)
SELECT 'CREATE DATABASE keycloak'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'keycloak')\gexec

-- Connect to expense_tracker database
\c expense_tracker;

-- Create encryption extension if available (for future use)
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE expense_tracker TO postgres;
GRANT ALL PRIVILEGES ON DATABASE keycloak TO postgres;

-- Set up basic configuration for the expense tracker database
-- Enable row level security for enhanced security
-- ALTER DATABASE expense_tracker SET row_security = on;

-- Log the initialization
DO $$
BEGIN
    RAISE NOTICE 'Expense Tracker database initialization completed successfully';
    RAISE NOTICE 'Keycloak database initialization completed successfully';
    RAISE NOTICE 'Database setup timestamp: %', NOW();
END
$$;
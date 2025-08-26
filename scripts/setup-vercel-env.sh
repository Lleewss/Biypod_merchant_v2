#!/bin/bash

# Setup remaining Vercel environment variables
echo "Setting up remaining Vercel environment variables..."

# Add SCOPES
echo "read_products,write_products,read_orders,write_orders,read_customers,write_customers,read_themes,write_themes,read_publications,write_publications" | vercel env add SCOPES production preview development

# Add DATABASE_URL
echo "postgresql://postgres:NtdIdHKd4kk78ZU3@db.jxuycozeiepqhndbvjto.supabase.co:5432/postgres" | vercel env add DATABASE_URL production preview development

# Add SUPABASE_URL
echo "https://jxuycozeiepqhndbvjto.supabase.co" | vercel env add SUPABASE_URL production preview development

# Add SUPABASE_ANON_KEY
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dXljb3plaWVwcWhuZGJ2anRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NzkwNDgsImV4cCI6MjA2ODQ1NTA0OH0.ExooQ_xa5Xo5XlM3pHmjsSNl9OAvL3DX29o-uodd3yg" | vercel env add SUPABASE_ANON_KEY production preview development

# Add SUPABASE_SERVICE_ROLE_KEY
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dXljb3plaWVwcWhuZGJ2anRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjg3OTA0OCwiZXhwIjoyMDY4NDU1MDQ4fQ.DWQRRsLb8akZUo8rdmgT2HY2bWEfNiB5f5Zjw2qmbfg" | vercel env add SUPABASE_SERVICE_ROLE_KEY production preview development

echo "✅ All environment variables configured!"

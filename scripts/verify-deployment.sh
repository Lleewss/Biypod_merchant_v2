#!/bin/bash

# Biypod Deployment Verification Script
echo "🔍 Verifying Biypod Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Production URLs
FRONTEND_URL="https://biypod-2taeglvr9-lews-projects-d558fcc5.vercel.app"
OAUTH_URL="https://jxuycozeiepqhndbvjto.supabase.co/functions/v1/oauth-callback"
WEBHOOK_URL="https://jxuycozeiepqhndbvjto.supabase.co/functions/v1/webhooks"

echo -e "${BLUE}Testing Production URLs...${NC}"

# Test Frontend
echo -n "Frontend (Vercel): "
if curl -s -I "$FRONTEND_URL" | grep -q "HTTP/2 401\|HTTP/2 200"; then
    echo -e "${GREEN}✅ RESPONDING${NC}"
else
    echo -e "${RED}❌ NOT RESPONDING${NC}"
fi

# Test OAuth Callback
echo -n "OAuth Callback: "
if curl -s -I "$OAUTH_URL" | grep -q "HTTP/2"; then
    echo -e "${GREEN}✅ RESPONDING${NC}"
else
    echo -e "${RED}❌ NOT RESPONDING${NC}"
fi

# Test Webhooks
echo -n "Webhooks: "
if curl -s -I "$WEBHOOK_URL" | grep -q "HTTP/2"; then
    echo -e "${GREEN}✅ RESPONDING${NC}"
else
    echo -e "${RED}❌ NOT RESPONDING${NC}"
fi

echo ""
echo -e "${BLUE}Checking Vercel Environment Variables...${NC}"

# Check if environment variables are set
vercel env ls | grep -E "(SHOPIFY_API_KEY|SHOPIFY_API_SECRET|SHOPIFY_APP_URL)" && echo -e "${GREEN}✅ Basic env vars configured${NC}" || echo -e "${YELLOW}⚠️  Some env vars missing${NC}"

echo ""
echo -e "${BLUE}Deployment Status Summary:${NC}"
echo "📱 Frontend URL: $FRONTEND_URL"
echo "🔐 OAuth URL: $OAUTH_URL"
echo "📡 Webhook URL: $WEBHOOK_URL"
echo ""
echo -e "${GREEN}✅ Deployment verification complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Complete Vercel environment variables setup"
echo "2. Configure Shopify Partner Dashboard URLs"
echo "3. Test app installation in development store"

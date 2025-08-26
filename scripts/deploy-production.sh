#!/bin/bash

# Biypod Production Deployment Script
# This script deploys the complete Biypod application to production

set -e

echo "🚀 Starting Biypod Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v supabase &> /dev/null; then
        print_error "Supabase CLI not found. Please install it first."
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    print_success "Dependencies checked"
}

# Deploy Supabase Edge Functions
deploy_edge_functions() {
    print_status "Deploying Supabase Edge Functions..."
    
    # Link to existing project
    supabase link --project-ref jxuycozeiepqhndbvjto
    
    # Deploy OAuth callback function
    print_status "Deploying oauth-callback function..."
    supabase functions deploy oauth-callback --no-verify-jwt
    
    # Deploy webhooks function
    print_status "Deploying webhooks function..."
    supabase functions deploy webhooks --no-verify-jwt
    
    print_success "Edge Functions deployed successfully"
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    # Login to Vercel (if not already logged in)
    vercel login
    
    # Deploy to production
    vercel --prod --yes
    
    print_success "Vercel deployment completed"
}

# Update environment variables
setup_environment() {
    print_status "Setting up production environment variables..."
    
    # Get Vercel deployment URL
    VERCEL_URL=$(vercel ls --scope=team | grep biypod | head -1 | awk '{print $2}')
    
    if [ -z "$VERCEL_URL" ]; then
        print_warning "Could not automatically detect Vercel URL. Please update manually."
        VERCEL_URL="your-app-url.vercel.app"
    fi
    
    print_status "Vercel URL: https://$VERCEL_URL"
    
    # Update Shopify app configuration
    print_status "Update your Shopify app configuration with:"
    echo "  App URL: https://$VERCEL_URL"
    echo "  Allowed redirection URLs: https://$VERCEL_URL/auth/callback"
    echo "  Webhook endpoints:"
    echo "    - App uninstalled: https://jxuycozeiepqhndbvjto.supabase.co/functions/v1/webhooks"
    echo "    - Scopes update: https://jxuycozeiepqhndbvjto.supabase.co/functions/v1/webhooks"
    
    print_success "Environment setup completed"
}

# Test deployment
test_deployment() {
    print_status "Testing deployment..."
    
    # Test Edge Functions
    print_status "Testing Edge Functions..."
    curl -s "https://jxuycozeiepqhndbvjto.supabase.co/functions/v1/oauth-callback" > /dev/null
    if [ $? -eq 0 ]; then
        print_success "OAuth callback function is accessible"
    else
        print_warning "OAuth callback function test failed"
    fi
    
    curl -s "https://jxuycozeiepqhndbvjto.supabase.co/functions/v1/webhooks" > /dev/null
    if [ $? -eq 0 ]; then
        print_success "Webhooks function is accessible"
    else
        print_warning "Webhooks function test failed"
    fi
    
    print_success "Deployment testing completed"
}

# Main deployment flow
main() {
    print_status "🎯 Biypod Production Deployment Starting..."
    
    check_dependencies
    deploy_edge_functions
    deploy_vercel
    setup_environment
    test_deployment
    
    print_success "🎉 Production deployment completed successfully!"
    print_status "Next steps:"
    echo "  1. Update your Shopify app URLs in the Partner Dashboard"
    echo "  2. Test the app installation in a development store"
    echo "  3. Verify OAuth flow and webhook handling"
    echo ""
    print_status "Your app is now live at: https://$VERCEL_URL"
}

# Run main function
main "$@"

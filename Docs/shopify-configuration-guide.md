# 🔧 **SHOPIFY APP CONFIGURATION GUIDE**

## **📋 CONFIGURATION CHECKLIST**

### **✅ COMPLETED:**
- ✅ Supabase Edge Functions deployed
- ✅ Vercel frontend deployed  
- ✅ Database connected and configured
- ✅ Basic environment variables set

### **🔧 REMAINING CONFIGURATION:**

---

## **STEP 1: Complete Vercel Environment Variables**

Go to your Vercel dashboard: https://vercel.com/lews-projects-d558fcc5/biypod/settings/environment-variables

Add these remaining variables:

```bash
SCOPES = read_products,write_products,read_orders,write_orders,read_customers,write_customers,read_themes,write_themes,read_publications,write_publications

DATABASE_URL = postgresql://postgres:NtdIdHKd4kk78ZU3@db.jxuycozeiepqhndbvjto.supabase.co:5432/postgres

SUPABASE_URL = https://jxuycozeiepqhndbvjto.supabase.co

SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dXljb3plaWVwcWhuZGJ2anRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NzkwNDgsImV4cCI6MjA2ODQ1NTA0OH0.ExooQ_xa5Xo5XlM3pHmjsSNl9OAvL3DX29o-uodd3yg

SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dXljb3plaWVwcWhuZGJ2anRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjg3OTA0OCwiZXhwIjoyMDY4NDU1MDQ4fQ.DWQRRsLb8akZUo8rdmgT2HY2bWEfNiB5f5Zjw2qmbfg

NODE_ENV = production
```

**Set each variable for: Production, Preview, and Development environments**

---

## **STEP 2: Configure Shopify Partner Dashboard**

### **🔗 App URLs Configuration**

Go to your Shopify Partner Dashboard → Apps → Biypod → App setup

**Update these settings:**

1. **App URL**:
   ```
   https://biypod-2taeglvr9-lews-projects-d558fcc5.vercel.app
   ```

2. **Allowed redirection URLs**:
   ```
   https://biypod-2taeglvr9-lews-projects-d558fcc5.vercel.app/auth/callback
   ```

### **📡 Webhooks Configuration**

In the same App setup section, configure webhooks:

1. **App uninstalled**:
   ```
   https://jxuycozeiepqhndbvjto.supabase.co/functions/v1/webhooks
   ```

2. **Customers/data_request**:
   ```
   https://jxuycozeiepqhndbvjto.supabase.co/functions/v1/webhooks
   ```

3. **Customers/redact**:
   ```
   https://jxuycozeiepqhndbvjto.supabase.co/functions/v1/webhooks
   ```

4. **Shop/redact**:
   ```
   https://jxuycozeiepqhndbvjto.supabase.co/functions/v1/webhooks
   ```

### **🔐 App Scopes**

Ensure these scopes are enabled:
- ✅ `read_products`
- ✅ `write_products`
- ✅ `read_orders`
- ✅ `write_orders`
- ✅ `read_customers`
- ✅ `write_customers`
- ✅ `read_themes`
- ✅ `write_themes`
- ✅ `read_publications`
- ✅ `write_publications`

---

## **STEP 3: Deploy Updated Configuration**

After setting environment variables, redeploy:

```bash
vercel --prod
```

---

## **STEP 4: Test Installation**

### **🧪 Testing Checklist:**

1. **Install in Development Store**:
   - Go to your Shopify Partner Dashboard
   - Select a development store
   - Install the Biypod app

2. **Verify OAuth Flow**:
   - ✅ App redirects to Shopify for authentication
   - ✅ User grants permissions
   - ✅ App redirects back successfully
   - ✅ User sees Biypod dashboard

3. **Test Custom UI**:
   - ✅ Biypod branding displays correctly
   - ✅ No Shopify Polaris components visible
   - ✅ Custom buttons and cards work

4. **Test Functionality**:
   - ✅ App can read products from store
   - ✅ Session persists between page loads
   - ✅ GraphQL queries work correctly

5. **Test Webhooks**:
   - ✅ Uninstall app and verify webhook received
   - ✅ Check Supabase function logs

---

## **🔍 VERIFICATION COMMANDS**

### **Test Production URLs:**

```bash
# Test frontend
curl -I https://biypod-2taeglvr9-lews-projects-d558fcc5.vercel.app

# Test OAuth callback
curl -I https://jxuycozeiepqhndbvjto.supabase.co/functions/v1/oauth-callback

# Test webhooks
curl -I https://jxuycozeiepqhndbvjto.supabase.co/functions/v1/webhooks
```

### **Check Logs:**

```bash
# Vercel logs
vercel logs

# Supabase function logs
supabase functions logs oauth-callback
supabase functions logs webhooks
```

---

## **🚨 TROUBLESHOOTING**

### **Common Issues:**

1. **401 Unauthorized**: Environment variables not set correctly
2. **OAuth Redirect Error**: Wrong redirect URL in Shopify settings
3. **Webhook Failures**: Incorrect webhook URLs or HMAC verification
4. **Database Connection**: Check DATABASE_URL format

### **Quick Fixes:**

```bash
# Redeploy with latest config
vercel --prod

# Check environment variables
vercel env ls

# Test database connection
npx prisma db push
```

---

## **✅ SUCCESS CRITERIA**

Your configuration is complete when:

- ✅ App installs successfully in development store
- ✅ OAuth flow completes without errors
- ✅ Custom Biypod UI displays correctly
- ✅ App can read/write Shopify data
- ✅ Webhooks are received and processed
- ✅ Sessions persist correctly

---

**🎉 Once all steps are complete, your Biypod app will be fully production-ready!**

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-shopify-hmac-sha256, x-shopify-topic, x-shopify-shop-domain',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Verify webhook authenticity
    const hmacHeader = req.headers.get('x-shopify-hmac-sha256')
    const topic = req.headers.get('x-shopify-topic')
    const shop = req.headers.get('x-shopify-shop-domain')
    
    if (!hmacHeader || !topic || !shop) {
      return new Response(
        JSON.stringify({ error: 'Missing required headers' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const body = await req.text()
    
    // Verify HMAC
    const webhookSecret = Deno.env.get('SHOPIFY_WEBHOOK_SECRET') ?? Deno.env.get('SHOPIFY_API_SECRET')
    const expectedHmac = await createHmac('sha256', new TextEncoder().encode(webhookSecret))
      .update(new TextEncoder().encode(body))
      .digest('base64')

    if (hmacHeader !== expectedHmac) {
      console.error('HMAC verification failed')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const payload = JSON.parse(body)

    // Log webhook event
    const { error: logError } = await supabaseClient
      .from('webhook_logs')
      .insert({
        event_type: topic,
        status: 'received',
        source: 'shopify',
        shop_domain: shop,
        webhook_id: payload.id?.toString() || crypto.randomUUID(),
        headers: Object.fromEntries(req.headers.entries()),
        payload: payload,
        created_at: new Date().toISOString(),
      })

    if (logError) {
      console.error('Webhook log error:', logError)
    }

    // Handle different webhook types
    switch (topic) {
      case 'app/uninstalled':
        await handleAppUninstalled(supabaseClient, shop, payload)
        break
      
      case 'app/scopes_update':
        await handleScopesUpdate(supabaseClient, shop, payload)
        break
      
      case 'customers/data_request':
        await handleCustomerDataRequest(supabaseClient, shop, payload)
        break
      
      case 'customers/redact':
        await handleCustomerRedact(supabaseClient, shop, payload)
        break
      
      case 'shop/redact':
        await handleShopRedact(supabaseClient, shop, payload)
        break
      
      default:
        console.log(`Unhandled webhook topic: ${topic}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleAppUninstalled(supabase: any, shop: string, payload: any) {
  // Delete all sessions for this shop
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('shop', shop)

  if (error) {
    console.error('Error deleting sessions:', error)
  }

  // Mark merchant as inactive
  await supabase
    .from('merchants')
    .update({ isActive: false })
    .eq('shopDomain', shop)
}

async function handleScopesUpdate(supabase: any, shop: string, payload: any) {
  const newScopes = payload.current?.join(',') || ''
  
  // Update session scopes
  const { error } = await supabase
    .from('sessions')
    .update({ scope: newScopes })
    .eq('shop', shop)

  if (error) {
    console.error('Error updating scopes:', error)
  }
}

async function handleCustomerDataRequest(supabase: any, shop: string, payload: any) {
  // Handle GDPR data request
  const customerId = payload.customer?.id?.toString()
  const customerEmail = payload.customer?.email
  
  if (!customerId && !customerEmail) return

  // Log the request
  await supabase
    .from('gdpr_requests')
    .insert({
      request_type: 'data_request',
      shop_domain: shop,
      customer_id: customerId,
      customer_email: customerEmail,
      webhook_data: payload,
      status: 'pending',
      created_at: new Date().toISOString(),
    })
}

async function handleCustomerRedact(supabase: any, shop: string, payload: any) {
  // Handle GDPR customer deletion
  const customerId = payload.customer?.id?.toString()
  const customerEmail = payload.customer?.email
  
  if (!customerId && !customerEmail) return

  // Delete customer designs and data
  if (customerEmail) {
    await supabase
      .from('designs')
      .delete()
      .eq('customer_email', customerEmail)
  }

  // Log the deletion
  await supabase
    .from('gdpr_requests')
    .insert({
      request_type: 'customer_redact',
      shop_domain: shop,
      customer_id: customerId,
      customer_email: customerEmail,
      webhook_data: payload,
      status: 'completed',
      processed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    })
}

async function handleShopRedact(supabase: any, shop: string, payload: any) {
  // Handle GDPR shop deletion (48 hours after uninstall)
  
  // Delete all merchant data
  await supabase
    .from('merchants')
    .delete()
    .eq('shopDomain', shop)

  // Log the deletion
  await supabase
    .from('gdpr_requests')
    .insert({
      request_type: 'shop_redact',
      shop_domain: shop,
      webhook_data: payload,
      status: 'completed',
      processed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    })
}

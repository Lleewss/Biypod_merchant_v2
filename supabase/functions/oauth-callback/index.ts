import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const url = new URL(req.url)
    const shop = url.searchParams.get('shop')
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')

    if (!shop || !code || !state) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Exchange code for access token with Shopify
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: Deno.env.get('SHOPIFY_API_KEY'),
        client_secret: Deno.env.get('SHOPIFY_API_SECRET'),
        code,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()
    const { access_token, scope } = tokenData

    // Store session in Supabase
    const sessionId = crypto.randomUUID()
    const { error: sessionError } = await supabaseClient
      .from('sessions')
      .insert({
        id: sessionId,
        shop,
        state,
        isOnline: false,
        scope,
        accessToken: access_token,
        expires: null,
        userId: null,
        firstName: null,
        lastName: null,
        email: null,
        accountOwner: false,
        locale: null,
        collaborator: false,
        emailVerified: false,
      })

    if (sessionError) {
      console.error('Session storage error:', sessionError)
      throw new Error('Failed to store session')
    }

    // Create or update merchant record
    const { error: merchantError } = await supabaseClient
      .from('merchants')
      .upsert({
        shopDomain: shop,
        isActive: true,
        lastLoginAt: new Date().toISOString(),
      }, {
        onConflict: 'shopDomain'
      })

    if (merchantError) {
      console.error('Merchant upsert error:', merchantError)
    }

    // Redirect to app
    const appUrl = `https://${shop}/admin/apps/${Deno.env.get('SHOPIFY_API_KEY')}`
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': appUrl,
      },
    })

  } catch (error) {
    console.error('OAuth callback error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

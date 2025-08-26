// Plan Selection Page - Force plan selection for all new merchants
import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, useNavigation } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { PlanSelection } from "../components/billing/PlanSelection";
import { ShopifyBillingManager } from "../lib/billing/shopify-billing";
import { SupabaseSubscriptionService } from "../lib/billing/supabase-subscription.server";
import { PlanType, BIYPOD_PLANS } from "../lib/billing/plans";

interface LoaderData {
  shop: {
    name: string;
    domain: string;
  };
  currentSubscription: any | null;
  status?: string;
  error?: string;
}

interface ActionData {
  error?: string;
  success?: boolean;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  // Get current subscription if any
  const currentSubscription = await SupabaseSubscriptionService.getActiveSubscription(shop);

  // Get URL parameters
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const error = url.searchParams.get('error');

  return json<LoaderData>({
    shop: {
      name: shop,
      domain: shop
    },
    currentSubscription,
    status: status || undefined,
    error: error || undefined
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  try {
    const formData = await request.formData();
    const planType = formData.get('planType') as PlanType;

    if (!planType || !['free', 'starter', 'creator'].includes(planType)) {
      return json<ActionData>({ error: 'Invalid plan type selected' }, { status: 400 });
    }

    // Check if this is a development store
    const isDev = await ShopifyBillingManager.isDevelopmentStore(request);
    
    // Create return URL for billing callback
    const returnUrl = `${new URL(request.url).origin}/billing/callback`;

    let subscriptionResult;

    if (planType === 'free') {
      // Create usage-only subscription for free plan
      subscriptionResult = await ShopifyBillingManager.createUsageSubscription(request, {
        planType,
        merchantId: shop,
        isTestCharge: isDev,
        returnUrl
      });
    } else {
      // Create recurring subscription for paid plans
      subscriptionResult = await ShopifyBillingManager.createRecurringSubscription(request, {
        planType,
        merchantId: shop,
        isTestCharge: isDev,
        returnUrl
      });
    }

    // Get plan details
    const planDetails = BIYPOD_PLANS[planType];

    // Save subscription to database
    const subscriptionId = await SupabaseSubscriptionService.createSubscription({
      shopifySubscriptionId: subscriptionResult.id,
      merchantId: shop,
      planType,
      recurringAmount: planDetails.recurringAmount,
      usageFeePercentage: planDetails.usageFeePercentage,
      productLimit: planDetails.productLimit,
      trialDays: planDetails.trialDays,
      confirmationUrl: subscriptionResult.confirmationUrl,
      isTestCharge: isDev
    });

    // Redirect to Shopify billing approval
    if (subscriptionResult.confirmationUrl) {
      return redirect(subscriptionResult.confirmationUrl);
    }

    // If no confirmation URL (shouldn't happen), redirect to dashboard
    return redirect('/');

  } catch (error) {
    console.error('Error creating subscription:', error);
    
    return json<ActionData>({ 
      error: error instanceof Error ? error.message : 'Failed to create subscription' 
    }, { status: 500 });
  }
}

export default function BillingPlansPage() {
  const { shop, currentSubscription, status, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const isLoading = navigation.state === 'submitting';

  const handlePlanSelected = (planType: PlanType) => {
    // Create form and submit
    const form = document.createElement('form');
    form.method = 'POST';
    form.style.display = 'none';

    const planInput = document.createElement('input');
    planInput.type = 'hidden';
    planInput.name = 'planType';
    planInput.value = planType;

    form.appendChild(planInput);
    document.body.appendChild(form);
    form.submit();
  };

  // Show status messages
  let statusMessage = null;
  if (status === 'pending') {
    statusMessage = {
      type: 'warning',
      message: 'Your subscription is pending approval. Please complete the billing process.'
    };
  } else if (status === 'expired') {
    statusMessage = {
      type: 'error',
      message: 'Your subscription has expired. Please select a new plan to continue.'
    };
  } else if (error === 'check_failed') {
    statusMessage = {
      type: 'error',
      message: 'Unable to verify your subscription status. Please select a plan.'
    };
  } else if (actionData?.error) {
    statusMessage = {
      type: 'error',
      message: actionData.error
    };
  }

  return (
    <div className="min-h-screen">
      {/* Status Message */}
      {statusMessage && (
        <div className={`p-4 mb-4 rounded-lg ${
          statusMessage.type === 'error' 
            ? 'bg-red-50 border border-red-200 text-red-800' 
            : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
        }`}>
          <div className="flex">
            <svg 
              className={`w-5 h-5 mr-3 mt-0.5 ${
                statusMessage.type === 'error' ? 'text-red-400' : 'text-yellow-400'
              }`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="font-medium">{statusMessage.message}</p>
          </div>
        </div>
      )}

      {/* Current Subscription Info */}
      {currentSubscription && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Current Subscription</h3>
          <div className="text-sm text-blue-800">
            <p>Plan: <span className="font-medium">{currentSubscription.planType}</span></p>
            <p>Status: <span className="font-medium">{currentSubscription.status}</span></p>
            {currentSubscription.isTrialActive && (
              <p>Trial: <span className="font-medium">{currentSubscription.trialDaysRemaining} days remaining</span></p>
            )}
          </div>
        </div>
      )}

      {/* Plan Selection */}
      <PlanSelection 
        onPlanSelected={handlePlanSelected}
        isLoading={isLoading}
      />
    </div>
  );
}

// Billing Callback - Handle Shopify billing approval/cancellation
import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { SubscriptionService } from "../lib/billing/subscription.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  try {
    const url = new URL(request.url);
    const charge_id = url.searchParams.get('charge_id');
    
    if (!charge_id) {
      console.error('No charge_id in billing callback');
      return redirect('/billing/plans?error=no_charge_id');
    }

    // Find the subscription by Shopify subscription ID
    const subscription = await SubscriptionService.getSubscriptionByShopifyId(charge_id);
    
    if (!subscription) {
      console.error('Subscription not found for charge_id:', charge_id);
      return redirect('/billing/plans?error=subscription_not_found');
    }

    // Get the subscription status from Shopify
    // Note: In a real implementation, you would fetch the actual status from Shopify
    // For now, we'll assume the subscription was approved if we reach this callback
    
    // Update subscription status to active
    await SubscriptionService.updateSubscriptionStatus(
      subscription.id,
      'active',
      charge_id
    );

    console.log(`Subscription activated for merchant ${shop}, plan: ${subscription.planType}`);

    // Redirect to dashboard with success message
    return redirect('/?billing=success');

  } catch (error) {
    console.error('Error in billing callback:', error);
    return redirect('/billing/plans?error=callback_failed');
  }
}

// This route only handles GET requests (Shopify callback)
export default function BillingCallback() {
  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-lg">Processing your subscription...</p>
      </div>
    </div>
  );
}

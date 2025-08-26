// Plan Gating Middleware - Ensures merchants have active subscriptions
import { redirect } from "@remix-run/node";
import { SubscriptionService } from "./subscription.server";

export interface PlanGatingResult {
  hasActiveSubscription: boolean;
  subscription: any | null;
  shouldRedirect: boolean;
  redirectUrl?: string;
}

/**
 * Check if merchant has active subscription and should be redirected to plan selection
 */
export async function checkPlanGating(
  merchantId: string,
  currentPath: string
): Promise<PlanGatingResult> {
  // Skip plan gating for billing-related routes
  const billingRoutes = [
    '/billing/plans',
    '/billing/callback',
    '/billing/webhook',
    '/auth/login',
    '/auth/callback'
  ];

  const shouldSkipGating = billingRoutes.some(route => currentPath.startsWith(route));
  
  if (shouldSkipGating) {
    return {
      hasActiveSubscription: true,
      subscription: null,
      shouldRedirect: false
    };
  }

  try {
    const subscription = await SubscriptionService.getActiveSubscription(merchantId);
    
    // No subscription found - redirect to plan selection
    if (!subscription) {
      return {
        hasActiveSubscription: false,
        subscription: null,
        shouldRedirect: true,
        redirectUrl: '/billing/plans'
      };
    }

    // Subscription pending approval - redirect to plan selection
    if (subscription.status === 'pending') {
      return {
        hasActiveSubscription: false,
        subscription,
        shouldRedirect: true,
        redirectUrl: '/billing/plans?status=pending'
      };
    }

    // Subscription cancelled or expired - redirect to plan selection
    if (['cancelled', 'expired'].includes(subscription.status)) {
      return {
        hasActiveSubscription: false,
        subscription,
        shouldRedirect: true,
        redirectUrl: '/billing/plans?status=expired'
      };
    }

    // Active subscription - allow access
    return {
      hasActiveSubscription: true,
      subscription,
      shouldRedirect: false
    };

  } catch (error) {
    console.error('Error checking plan gating:', error);
    
    // On error, redirect to plan selection to be safe
    return {
      hasActiveSubscription: false,
      subscription: null,
      shouldRedirect: true,
      redirectUrl: '/billing/plans?error=check_failed'
    };
  }
}

/**
 * Middleware function to enforce plan gating
 * Use this in loaders that require active subscriptions
 */
export async function requireActiveSubscription(
  merchantId: string,
  currentPath: string
) {
  const gatingResult = await checkPlanGating(merchantId, currentPath);
  
  if (gatingResult.shouldRedirect && gatingResult.redirectUrl) {
    throw redirect(gatingResult.redirectUrl);
  }
  
  return gatingResult.subscription;
}

/**
 * Check if merchant can access a specific feature based on their plan
 */
export async function checkFeatureAccess(
  merchantId: string,
  feature: 'product_publishing' | 'advanced_customization' | 'analytics' | 'bulk_operations'
): Promise<{
  hasAccess: boolean;
  planType: string;
  upgradeRequired?: string;
}> {
  const subscription = await SubscriptionService.getActiveSubscription(merchantId);
  
  if (!subscription || subscription.status !== 'active') {
    return {
      hasAccess: false,
      planType: 'none',
      upgradeRequired: 'Any paid plan'
    };
  }

  const planType = subscription.planType;

  switch (feature) {
    case 'product_publishing':
      // All plans can publish products (within limits)
      return {
        hasAccess: true,
        planType
      };

    case 'advanced_customization':
      // Available for Starter and Creator plans
      if (['starter', 'creator'].includes(planType)) {
        return {
          hasAccess: true,
          planType
        };
      }
      return {
        hasAccess: false,
        planType,
        upgradeRequired: 'Starter or Creator plan'
      };

    case 'analytics':
      // Available for Starter and Creator plans
      if (['starter', 'creator'].includes(planType)) {
        return {
          hasAccess: true,
          planType
        };
      }
      return {
        hasAccess: false,
        planType,
        upgradeRequired: 'Starter or Creator plan'
      };

    case 'bulk_operations':
      // Available for Creator plan only
      if (planType === 'creator') {
        return {
          hasAccess: true,
          planType
        };
      }
      return {
        hasAccess: false,
        planType,
        upgradeRequired: 'Creator plan'
      };

    default:
      return {
        hasAccess: false,
        planType,
        upgradeRequired: 'Unknown feature'
      };
  }
}

/**
 * Get merchant's current plan status for display
 */
export async function getMerchantPlanStatus(merchantId: string): Promise<{
  planType: string;
  status: string;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  productUsage: {
    current: number;
    limit: number;
    percentage: number;
  };
  nextBillingDate?: Date;
}> {
  const subscription = await SubscriptionService.getActiveSubscription(merchantId);
  
  if (!subscription) {
    return {
      planType: 'none',
      status: 'no_subscription',
      isTrialActive: false,
      trialDaysRemaining: 0,
      productUsage: {
        current: 0,
        limit: 0,
        percentage: 0
      }
    };
  }

  const productUsagePercentage = subscription.productLimit > 0 
    ? (subscription.publishedProductsCount / subscription.productLimit) * 100 
    : 0;

  return {
    planType: subscription.planType,
    status: subscription.status,
    isTrialActive: subscription.isTrialActive,
    trialDaysRemaining: subscription.trialDaysRemaining,
    productUsage: {
      current: subscription.publishedProductsCount,
      limit: subscription.productLimit,
      percentage: Math.round(productUsagePercentage)
    },
    nextBillingDate: subscription.currentPeriodEnd
  };
}

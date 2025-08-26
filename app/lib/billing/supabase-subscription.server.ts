import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface SubscriptionWithDetails {
  id: string;
  shopifySubscriptionId: string | null;
  merchantId: string;
  planType: string;
  status: string;
  recurringAmount: number;
  usageFeePercentage: number;
  productLimit: number;
  trialDays: number | null;
  trialStartDate: Date | null;
  trialEndDate: Date | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  confirmationUrl: string | null;
  isTestCharge: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedProductsCount: number;
  isTrialActive: boolean;
  trialDaysRemaining: number;
}

export class SupabaseSubscriptionService {
  /**
   * Get active subscription for a merchant
   */
  static async getActiveSubscription(merchantId: string): Promise<SubscriptionWithDetails | null> {
    try {
      // Get subscription
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('merchant_id', merchantId)
        .in('status', ['active', 'pending'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subError || !subscription) {
        return null;
      }

      // Get published products count
      const { count: publishedProductsCount } = await supabase
        .from('published_products')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_id', subscription.id)
        .eq('is_active', true);

      return this.enrichSubscriptionData({
        ...subscription,
        publishedProductsCount: publishedProductsCount || 0
      });
    } catch (error) {
      console.error('Error getting active subscription:', error);
      return null;
    }
  }

  /**
   * Get subscription by Shopify subscription ID
   */
  static async getSubscriptionByShopifyId(shopifySubscriptionId: string): Promise<SubscriptionWithDetails | null> {
    try {
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('shopify_subscription_id', shopifySubscriptionId)
        .single();

      if (subError || !subscription) {
        return null;
      }

      // Get published products count
      const { count: publishedProductsCount } = await supabase
        .from('published_products')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_id', subscription.id)
        .eq('is_active', true);

      return this.enrichSubscriptionData({
        ...subscription,
        publishedProductsCount: publishedProductsCount || 0
      });
    } catch (error) {
      console.error('Error getting subscription by Shopify ID:', error);
      return null;
    }
  }

  /**
   * Create a new subscription record
   */
  static async createSubscription(data: {
    merchantId: string;
    planType: string;
    shopifySubscriptionId?: string;
    recurringAmount: number;
    usageFeePercentage: number;
    productLimit: number;
    trialDays?: number;
    confirmationUrl?: string;
    isTestCharge?: boolean;
  }): Promise<string> {
    try {
      const now = new Date();
      
      // Calculate trial dates for paid plans
      let trialStartDate: Date | null = null;
      let trialEndDate: Date | null = null;
      
      if (data.trialDays && data.recurringAmount > 0) {
        trialStartDate = now;
        trialEndDate = new Date(now.getTime() + (data.trialDays * 24 * 60 * 60 * 1000));
      }

      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .insert({
          merchant_id: data.merchantId,
          plan_type: data.planType,
          shopify_subscription_id: data.shopifySubscriptionId,
          recurring_amount: data.recurringAmount,
          usage_fee_percentage: data.usageFeePercentage,
          product_limit: data.productLimit,
          trial_days: data.trialDays,
          trial_start_date: trialStartDate?.toISOString(),
          trial_end_date: trialEndDate?.toISOString(),
          confirmation_url: data.confirmationUrl,
          is_test_charge: data.isTestCharge || false,
          status: 'pending'
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      return subscription.id;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Update subscription status
   */
  static async updateSubscriptionStatus(
    subscriptionId: string,
    status: string,
    additionalData?: {
      currentPeriodStart?: Date;
      currentPeriodEnd?: Date;
      shopifySubscriptionId?: string;
    }
  ): Promise<void> {
    try {
      const updateData: any = { status };

      if (additionalData?.currentPeriodStart) {
        updateData.current_period_start = additionalData.currentPeriodStart.toISOString();
      }
      if (additionalData?.currentPeriodEnd) {
        updateData.current_period_end = additionalData.currentPeriodEnd.toISOString();
      }
      if (additionalData?.shopifySubscriptionId) {
        updateData.shopify_subscription_id = additionalData.shopifySubscriptionId;
      }

      const { error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', subscriptionId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating subscription status:', error);
      throw error;
    }
  }

  /**
   * Check if merchant can publish more products
   */
  static async canPublishProduct(merchantId: string): Promise<{
    canPublish: boolean;
    currentCount: number;
    limit: number;
    planType: string;
  }> {
    const subscription = await this.getActiveSubscription(merchantId);
    
    if (!subscription) {
      return {
        canPublish: false,
        currentCount: 0,
        limit: 0,
        planType: 'free'
      };
    }

    return {
      canPublish: subscription.publishedProductsCount < subscription.productLimit,
      currentCount: subscription.publishedProductsCount,
      limit: subscription.productLimit,
      planType: subscription.planType
    };
  }

  /**
   * Enrich subscription data with calculated fields
   */
  private static enrichSubscriptionData(subscription: any): SubscriptionWithDetails {
    const now = new Date();
    const trialStartDate = subscription.trial_start_date ? new Date(subscription.trial_start_date) : null;
    const trialEndDate = subscription.trial_end_date ? new Date(subscription.trial_end_date) : null;
    
    const isTrialActive = trialStartDate && trialEndDate &&
      now >= trialStartDate && now <= trialEndDate;
    
    let trialDaysRemaining = 0;
    if (trialEndDate && isTrialActive) {
      const diffTime = trialEndDate.getTime() - now.getTime();
      trialDaysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return {
      id: subscription.id,
      shopifySubscriptionId: subscription.shopify_subscription_id,
      merchantId: subscription.merchant_id,
      planType: subscription.plan_type,
      status: subscription.status,
      recurringAmount: parseFloat(subscription.recurring_amount),
      usageFeePercentage: parseFloat(subscription.usage_fee_percentage),
      productLimit: subscription.product_limit,
      trialDays: subscription.trial_days,
      trialStartDate,
      trialEndDate,
      currentPeriodStart: subscription.current_period_start ? new Date(subscription.current_period_start) : null,
      currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end) : null,
      confirmationUrl: subscription.confirmation_url,
      isTestCharge: subscription.is_test_charge,
      createdAt: new Date(subscription.created_at),
      updatedAt: new Date(subscription.updated_at),
      publishedProductsCount: subscription.publishedProductsCount || 0,
      isTrialActive: !!isTrialActive,
      trialDaysRemaining: Math.max(0, trialDaysRemaining)
    };
  }
}

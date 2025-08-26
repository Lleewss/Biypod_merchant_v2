// Subscription Database Operations
import { PrismaClient } from "@prisma/client";
import { PlanType, BIYPOD_PLANS, getTrialEndDate } from "./plans";

const prisma = new PrismaClient();

export interface CreateSubscriptionData {
  shopifySubscriptionId?: string;
  merchantId: string;
  planType: PlanType;
  status: string;
  confirmationUrl?: string;
  isTestCharge: boolean;
}

export interface SubscriptionWithDetails {
  id: string;
  shopifySubscriptionId: string | null;
  merchantId: string;
  planType: PlanType;
  status: string;
  recurringAmount: number;
  usageFeePercentage: number;
  productLimit: number;
  trialDays: number | null;
  trialStartDate: Date | null;
  trialEndDate: Date | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  isTestCharge: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedProductsCount: number;
  isTrialActive: boolean;
  trialDaysRemaining: number;
}

export class SubscriptionService {
  /**
   * Create a new subscription record
   */
  static async createSubscription(data: CreateSubscriptionData): Promise<string> {
    const plan = BIYPOD_PLANS[data.planType];
    const now = new Date();
    
    // Calculate trial dates for paid plans
    let trialStartDate: Date | null = null;
    let trialEndDate: Date | null = null;
    
    if (plan.trialDays && plan.recurringAmount > 0) {
      trialStartDate = now;
      trialEndDate = getTrialEndDate(plan.trialDays);
    }

    const subscription = await prisma.subscription.create({
      data: {
        shopifySubscriptionId: data.shopifySubscriptionId,
        merchantId: data.merchantId,
        planType: data.planType,
        status: data.status,
        recurringAmount: plan.recurringAmount,
        usageFeePercentage: plan.usageFeePercentage,
        productLimit: plan.productLimit,
        trialDays: plan.trialDays,
        trialStartDate,
        trialEndDate,
        confirmationUrl: data.confirmationUrl,
        isTestCharge: data.isTestCharge
      }
    });

    return subscription.id;
  }

  /**
   * Get active subscription for a merchant
   */
  static async getActiveSubscription(merchantId: string): Promise<SubscriptionWithDetails | null> {
    const subscription = await prisma.subscription.findFirst({
      where: {
        merchantId,
        status: {
          in: ['active', 'pending']
        }
      },
      include: {
        publishedProducts: {
          where: {
            isActive: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!subscription) return null;

    return this.enrichSubscriptionData(subscription);
  }

  /**
   * Update subscription status
   */
  static async updateSubscriptionStatus(
    subscriptionId: string, 
    status: string,
    shopifySubscriptionId?: string
  ): Promise<void> {
    const updateData: any = { status };
    
    if (shopifySubscriptionId) {
      updateData.shopifySubscriptionId = shopifySubscriptionId;
    }

    // If activating, set current period
    if (status === 'active') {
      const now = new Date();
      updateData.currentPeriodStart = now;
      
      // Set period end to 30 days from now for recurring plans
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId }
      });
      
      if (subscription && subscription.recurringAmount > 0) {
        const periodEnd = new Date(now);
        periodEnd.setDate(periodEnd.getDate() + 30);
        updateData.currentPeriodEnd = periodEnd;
      }
    }

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: updateData
    });
  }

  /**
   * Check if merchant can publish more products
   */
  static async canPublishProduct(merchantId: string): Promise<{
    canPublish: boolean;
    currentCount: number;
    limit: number;
    planType: PlanType;
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
      planType: subscription.planType as PlanType
    };
  }

  /**
   * Handle plan downgrade - unpublish excess products
   */
  static async handlePlanDowngrade(
    merchantId: string, 
    newPlanType: PlanType
  ): Promise<{
    affectedProducts: number;
    gracePeriodEnd: Date;
  }> {
    const newPlan = BIYPOD_PLANS[newPlanType];
    const currentProducts = await prisma.publishedProduct.count({
      where: {
        merchantId,
        isActive: true
      }
    });

    const excessProducts = Math.max(0, currentProducts - newPlan.productLimit);
    
    if (excessProducts > 0) {
      // Create grace period (5 days)
      const gracePeriodEnd = new Date();
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 5);

      // Create plan change request
      await prisma.planChangeRequest.create({
        data: {
          merchantId,
          currentPlan: 'unknown', // Will be updated by caller
          requestedPlan: newPlanType,
          affectedProducts: excessProducts,
          gracePeriodEnd,
          status: 'pending'
        }
      });

      return {
        affectedProducts: excessProducts,
        gracePeriodEnd
      };
    }

    return {
      affectedProducts: 0,
      gracePeriodEnd: new Date()
    };
  }

  /**
   * Unpublish excess products after grace period
   */
  static async unpublishExcessProducts(merchantId: string, newLimit: number): Promise<number> {
    // Get products to unpublish (oldest first)
    const productsToUnpublish = await prisma.publishedProduct.findMany({
      where: {
        merchantId,
        isActive: true
      },
      orderBy: {
        publishedAt: 'asc'
      },
      skip: newLimit
    });

    if (productsToUnpublish.length === 0) return 0;

    // Mark as unpublished
    await prisma.publishedProduct.updateMany({
      where: {
        id: {
          in: productsToUnpublish.map(p => p.id)
        }
      },
      data: {
        isActive: false,
        unpublishedAt: new Date(),
        unpublishReason: 'plan_downgrade'
      }
    });

    return productsToUnpublish.length;
  }

  /**
   * Get subscription by Shopify subscription ID
   */
  static async getSubscriptionByShopifyId(shopifySubscriptionId: string): Promise<SubscriptionWithDetails | null> {
    const subscription = await prisma.subscription.findUnique({
      where: {
        shopifySubscriptionId
      },
      include: {
        publishedProducts: {
          where: {
            isActive: true
          }
        }
      }
    });

    if (!subscription) return null;

    return this.enrichSubscriptionData(subscription);
  }

  /**
   * Enrich subscription data with calculated fields
   */
  private static enrichSubscriptionData(subscription: any): SubscriptionWithDetails {
    const now = new Date();
    const isTrialActive = subscription.trialStartDate && subscription.trialEndDate &&
      now >= subscription.trialStartDate && now <= subscription.trialEndDate;
    
    let trialDaysRemaining = 0;
    if (subscription.trialEndDate && isTrialActive) {
      const diffTime = subscription.trialEndDate.getTime() - now.getTime();
      trialDaysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return {
      ...subscription,
      publishedProductsCount: subscription.publishedProducts?.length || 0,
      isTrialActive: !!isTrialActive,
      trialDaysRemaining: Math.max(0, trialDaysRemaining)
    };
  }
}

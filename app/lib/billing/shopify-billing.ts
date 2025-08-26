// Shopify Billing API Integration using GraphQL
import { GraphqlQueryError } from "@shopify/shopify-api";
import { authenticate } from "../../shopify.server";
import { PlanType, BIYPOD_PLANS } from "./plans";

export interface CreateSubscriptionParams {
  planType: PlanType;
  merchantId: string;
  isTestCharge?: boolean;
  returnUrl: string;
}

export interface CreateUsageRecordParams {
  subscriptionId: string;
  description: string;
  price: number;
  orderId: string;
}

export interface SubscriptionResult {
  id: string;
  status: string;
  confirmationUrl?: string;
  trialDays?: number;
}

// GraphQL Mutations for Shopify Billing API (2025-07 latest)
const CREATE_SUBSCRIPTION_MUTATION = `
  mutation appSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $test: Boolean, $trialDays: Int, $returnUrl: URL!) {
    appSubscriptionCreate(name: $name, lineItems: $lineItems, test: $test, trialDays: $trialDays, returnUrl: $returnUrl) {
      appSubscription {
        id
        status
      }
      confirmationUrl
      userErrors {
        field
        message
      }
    }
  }
`;

const CREATE_USAGE_SUBSCRIPTION_MUTATION = `
  mutation appSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $test: Boolean, $returnUrl: URL!) {
    appSubscriptionCreate(name: $name, lineItems: $lineItems, test: $test, returnUrl: $returnUrl) {
      appSubscription {
        id
        status
      }
      confirmationUrl
      userErrors {
        field
        message
      }
    }
  }
`;

const CREATE_USAGE_RECORD_MUTATION = `
  mutation appUsageRecordCreate($subscriptionLineItemId: ID!, $price: MoneyInput!, $description: String!) {
    appUsageRecordCreate(subscriptionLineItemId: $subscriptionLineItemId, price: $price, description: $description) {
      appUsageRecord {
        id
        price {
          amount
          currencyCode
        }
        description
        createdAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const GET_SUBSCRIPTION_QUERY = `
  query getAppSubscription($id: ID!) {
    node(id: $id) {
      ... on AppSubscription {
        id
        name
        status
        createdAt
        currentPeriodEnd
        trialDays
        test
        lineItems {
          id
          plan {
            pricingDetails {
              ... on AppRecurringPricing {
                price {
                  amount
                  currencyCode
                }
                interval
              }
              ... on AppUsagePricing {
                balanceUsed {
                  amount
                  currencyCode
                }
                cappedAmount {
                  amount
                  currencyCode
                }
                terms
              }
            }
          }
        }
      }
    }
  }
`;

export class ShopifyBillingManager {
  /**
   * Create a subscription for recurring plans (Starter/Creator)
   */
  static async createRecurringSubscription(
    request: Request,
    params: CreateSubscriptionParams
  ): Promise<SubscriptionResult> {
    const { admin } = await authenticate.admin(request);
    const plan = BIYPOD_PLANS[params.planType];

    if (plan.recurringAmount === 0) {
      throw new Error("Cannot create recurring subscription for free plan");
    }

    const variables = {
      name: `Biypod ${params.planType.charAt(0).toUpperCase() + params.planType.slice(1)} Plan`,
      lineItems: [
        {
          plan: {
            appRecurringPricingDetails: {
              price: {
                amount: plan.recurringAmount,
                currencyCode: "USD"
              },
              interval: "EVERY_30_DAYS"
            }
          }
        }
      ],
      test: params.isTestCharge || false,
      trialDays: plan.trialDays || 0,
      returnUrl: params.returnUrl
    };

    try {
      const response = await admin.graphql(CREATE_SUBSCRIPTION_MUTATION, {
        variables
      });

      const result = await response.json();
      
      if (result.data?.appSubscriptionCreate?.userErrors?.length > 0) {
        throw new Error(
          `Subscription creation failed: ${result.data.appSubscriptionCreate.userErrors[0].message}`
        );
      }

      const subscription = result.data?.appSubscriptionCreate?.appSubscription;
      const confirmationUrl = result.data?.appSubscriptionCreate?.confirmationUrl;

      return {
        id: subscription.id,
        status: subscription.status,
        confirmationUrl,
        trialDays: plan.trialDays
      };
    } catch (error) {
      console.error("Error creating recurring subscription:", error);
      throw error;
    }
  }

  /**
   * Create a usage-only subscription (Free plan)
   */
  static async createUsageSubscription(
    request: Request,
    params: CreateSubscriptionParams
  ): Promise<SubscriptionResult> {
    const { admin } = await authenticate.admin(request);
    const plan = BIYPOD_PLANS[params.planType];

    const variables = {
      name: `Biypod ${params.planType.charAt(0).toUpperCase() + params.planType.slice(1)} Plan`,
      lineItems: [
        {
          plan: {
            appUsagePricingDetails: {
              cappedAmount: {
                amount: 10000, // $10,000 cap
                currencyCode: "USD"
              },
              terms: `${plan.usageFeePercentage}% per order containing customized products`
            }
          }
        }
      ],
      test: params.isTestCharge || false,
      returnUrl: params.returnUrl
    };

    try {
      const response = await admin.graphql(CREATE_USAGE_SUBSCRIPTION_MUTATION, {
        variables
      });

      const result = await response.json();
      
      if (result.data?.appSubscriptionCreate?.userErrors?.length > 0) {
        throw new Error(
          `Usage subscription creation failed: ${result.data.appSubscriptionCreate.userErrors[0].message}`
        );
      }

      const subscription = result.data?.appSubscriptionCreate?.appSubscription;
      const confirmationUrl = result.data?.appSubscriptionCreate?.confirmationUrl;

      return {
        id: subscription.id,
        status: subscription.status,
        confirmationUrl
      };
    } catch (error) {
      console.error("Error creating usage subscription:", error);
      throw error;
    }
  }

  /**
   * Create a usage record for an order
   */
  static async createUsageRecord(
    request: Request,
    params: CreateUsageRecordParams
  ): Promise<void> {
    const { admin } = await authenticate.admin(request);

    const variables = {
      subscriptionLineItemId: params.subscriptionId,
      price: {
        amount: params.price,
        currencyCode: "USD"
      },
      description: params.description
    };

    try {
      const response = await admin.graphql(CREATE_USAGE_RECORD_MUTATION, {
        variables
      });

      const result = await response.json();
      
      if (result.data?.appUsageRecordCreate?.userErrors?.length > 0) {
        throw new Error(
          `Usage record creation failed: ${result.data.appUsageRecordCreate.userErrors[0].message}`
        );
      }
    } catch (error) {
      console.error("Error creating usage record:", error);
      throw error;
    }
  }

  /**
   * Get subscription details
   */
  static async getSubscription(
    request: Request,
    subscriptionId: string
  ): Promise<any> {
    const { admin } = await authenticate.admin(request);

    try {
      const response = await admin.graphql(GET_SUBSCRIPTION_QUERY, {
        variables: { id: subscriptionId }
      });

      const result = await response.json();
      return result.data?.node;
    } catch (error) {
      console.error("Error fetching subscription:", error);
      throw error;
    }
  }

  /**
   * Determine if this is a development store
   */
  static async isDevelopmentStore(request: Request): Promise<boolean> {
    const { admin } = await authenticate.admin(request);

    try {
      const response = await admin.graphql(`
        query {
          shop {
            plan {
              displayName
            }
          }
        }
      `);

      const result = await response.json();
      const planName = result.data?.shop?.plan?.displayName?.toLowerCase();
      
      return planName?.includes('development') || 
             planName?.includes('partner') || 
             planName?.includes('staff');
    } catch (error) {
      console.error("Error checking development store:", error);
      return false;
    }
  }
}

# 📋 **SHOPIFY COMPLIANCE ANALYSIS #29: Billing - Subscription Billing**

## 🔗 **Source Document**
**URL**: https://shopify.dev/docs/apps/launch/billing/subscription-billing
**Date**: Current (Updated regularly)
**Category**: Billing & Subscription Management

## 📊 **CRITICAL SUBSCRIPTION BILLING REQUIREMENTS**

### **🎯 MANDATORY SUBSCRIPTION PRINCIPLES**
- **ONE ACTIVE SUBSCRIPTION**: Only one active subscription per merchant
- **MERCHANT APPROVAL**: Merchants must approve all subscription charges
- **AUTOMATIC BILLING**: Recurring charges billed automatically
- **SUBSCRIPTION REPLACEMENT**: New subscription cancels and replaces existing
- **PRORATION HANDLING**: Charges/credits prorated for plan changes
- **AUTOMATIC CANCELLATION**: Subscription cancels when app uninstalled

### **🔒 SUBSCRIPTION TYPES SUPPORTED**
- **TIME-BASED**: Recurring charges at set intervals (30-day/annual)
- **USAGE-BASED**: Charges based on app usage/actions
- **COMBINED**: Time-based + usage-based hybrid model
- **PRORATION**: Automatic charge/credit calculation for upgrades/downgrades
- **DEFERRAL**: Plan changes deferred until current cycle completes

## 🔍 **BIYPOD CUSTOMIZER CRITICAL IMPACT ANALYSIS**

### **🎯 HIGH-RISK AREAS FOR 4-TIER SUBSCRIPTION MODEL**

#### **1. Complex Tier Structure:**
- **CURRENT RISK**: 4 tiers (Free/Starter/Creator/Scale) need proper GraphQL implementation
- **BILLING CONCERN**: Multiple subscription plans with different feature sets
- **REQUIREMENT**: Use GraphQL Admin API billing objects and mutations
- **CHALLENGE**: Managing tier transitions and feature access control

#### **2. 14-Day Creator Trial Implementation:**
- **CURRENT RISK**: Trial period must integrate with subscription billing
- **BILLING CONCERN**: Trial-to-paid conversion with proper proration
- **REQUIREMENT**: Implement trial period with automatic conversion
- **CHALLENGE**: Handling trial cancellation vs. conversion scenarios

#### **3. Proration for 3D Feature Access:**
- **CURRENT RISK**: Mid-cycle upgrades for 3D features need proper billing
- **BILLING CONCERN**: Complex proration calculations for feature-based tiers
- **REQUIREMENT**: Accurate proration when merchants upgrade for 3D access
- **CHALLENGE**: Calculating fair pricing for partial billing cycles

#### **4. Usage-Based 3D Model Limits:**
- **CURRENT RISK**: Free tier has 20 design limit, needs usage tracking
- **BILLING CONCERN**: Hybrid model with design count limits per tier
- **REQUIREMENT**: Track 3D model usage and enforce tier limits
- **CHALLENGE**: Combining time-based subscriptions with usage limits

## 📋 **DETAILED SUBSCRIPTION COMPLIANCE CHECKLIST**

### **🔐 GraphQL Billing Implementation**

#### **Required Billing Mutations:**
- [ ] **appSubscriptionCreate** - Create new subscription for merchant
- [ ] **appSubscriptionCancel** - Cancel existing subscription
- [ ] **appUsageRecordCreate** - Track usage for usage-based billing
- [ ] **appSubscriptionLineItemUpdate** - Update subscription details
- [ ] **appPurchaseOneTimeCreate** - Handle one-time purchases if needed

#### **Subscription Management:**
- [ ] **Single subscription** - Only one active subscription per merchant
- [ ] **Merchant approval** - Proper approval flow through Shopify
- [ ] **Automatic billing** - Recurring charges without manual intervention
- [ ] **Proration handling** - Automatic charge/credit calculations
- [ ] **Cancellation handling** - Proper cleanup when app uninstalled

### **🎯 Biypod-Specific Billing Requirements**

#### **4-Tier Subscription Structure:**
- [ ] **Free Tier ($0)** - 20 designs, basic features, heavy branding
- [ ] **Starter Tier ($29)** - Unlimited designs, premium templates
- [ ] **Creator Tier ($79)** - AI generation, full customizer, 14-day trial
- [ ] **Scale Tier ($199+)** - White-label, priority support, custom features

#### **Trial Implementation:**
- [ ] **14-day Creator trial** - Free access to Creator tier features
- [ ] **Trial conversion** - Automatic billing after trial period
- [ ] **Trial cancellation** - Proper handling of trial cancellations
- [ ] **Proration handling** - Credits for trial overlaps with billing cycles

## 🚀 **BIYPOD SUBSCRIPTION BILLING IMPLEMENTATION**

### **4-Tier Subscription Creation:**

#### **GraphQL Subscription Setup:**
```javascript
// Biypod 4-tier subscription implementation
import { authenticate } from '@shopify/shopify-app-remix/server';

export class BiypodSubscriptionManager {
  static subscriptionPlans = {
    free: {
      name: 'Free',
      price: 0,
      interval: 'EVERY_30_DAYS',
      features: {
        maxDesigns: 20,
        aiGeneration: false,
        customBranding: false,
        prioritySupport: false
      }
    },
    starter: {
      name: 'Starter',
      price: 29,
      interval: 'EVERY_30_DAYS',
      features: {
        maxDesigns: -1, // unlimited
        aiGeneration: false,
        customBranding: true,
        prioritySupport: false
      }
    },
    creator: {
      name: 'Creator',
      price: 79,
      interval: 'EVERY_30_DAYS',
      trialDays: 14,
      features: {
        maxDesigns: -1, // unlimited
        aiGeneration: true,
        customBranding: true,
        prioritySupport: false
      }
    },
    scale: {
      name: 'Scale',
      price: 199,
      interval: 'EVERY_30_DAYS',
      features: {
        maxDesigns: -1, // unlimited
        aiGeneration: true,
        customBranding: true,
        prioritySupport: true,
        whiteLabel: true
      }
    }
  };

  static async createSubscription(admin, planId, merchantId) {
    const plan = this.subscriptionPlans[planId];
    
    if (!plan) {
      throw new Error(`Invalid subscription plan: ${planId}`);
    }

    // Cancel existing subscription first
    await this.cancelExistingSubscription(admin, merchantId);

    const mutation = `
      mutation appSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $trialDays: Int, $test: Boolean) {
        appSubscriptionCreate(
          name: $name
          lineItems: $lineItems
          trialDays: $trialDays
          test: $test
        ) {
          appSubscription {
            id
            name
            status
            currentPeriodEnd
            trialDays
          }
          confirmationUrl
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      name: `Biypod Customizer - ${plan.name}`,
      lineItems: [{
        plan: {
          appRecurringPricingDetails: {
            price: { amount: plan.price, currencyCode: 'USD' },
            interval: plan.interval
          }
        }
      }],
      trialDays: plan.trialDays || null,
      test: process.env.NODE_ENV !== 'production'
    };

    try {
      const response = await admin.graphql(mutation, { variables });
      const result = await response.json();
      
      if (result.data.appSubscriptionCreate.userErrors.length > 0) {
        throw new Error(result.data.appSubscriptionCreate.userErrors[0].message);
      }

      return {
        subscription: result.data.appSubscriptionCreate.appSubscription,
        confirmationUrl: result.data.appSubscriptionCreate.confirmationUrl
      };
    } catch (error) {
      console.error('Subscription creation failed:', error);
      throw error;
    }
  }

  static async cancelExistingSubscription(admin, merchantId) {
    // Query for existing subscription
    const query = `
      query {
        currentAppInstallation {
          activeSubscriptions {
            id
            name
            status
          }
        }
      }
    `;

    try {
      const response = await admin.graphql(query);
      const result = await response.json();
      
      const activeSubscriptions = result.data.currentAppInstallation.activeSubscriptions;
      
      for (const subscription of activeSubscriptions) {
        await this.cancelSubscription(admin, subscription.id, true); // prorate = true
      }
    } catch (error) {
      console.error('Failed to cancel existing subscription:', error);
      // Don't throw - allow new subscription creation to proceed
    }
  }

  static async cancelSubscription(admin, subscriptionId, prorate = false) {
    const mutation = `
      mutation appSubscriptionCancel($id: ID!, $prorate: Boolean) {
        appSubscriptionCancel(id: $id, prorate: $prorate) {
          appSubscription {
            id
            status
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      id: subscriptionId,
      prorate
    };

    try {
      const response = await admin.graphql(mutation, { variables });
      const result = await response.json();
      
      if (result.data.appSubscriptionCancel.userErrors.length > 0) {
        throw new Error(result.data.appSubscriptionCancel.userErrors[0].message);
      }

      return result.data.appSubscriptionCancel.appSubscription;
    } catch (error) {
      console.error('Subscription cancellation failed:', error);
      throw error;
    }
  }
}
```

### **Usage Tracking for Design Limits:**

#### **3D Model Usage Tracking:**
```javascript
// Usage tracking for Free tier design limits
export class BiypodUsageTracker {
  static async trackDesignCreation(admin, merchantId, designData) {
    const subscription = await this.getCurrentSubscription(admin);
    
    if (!subscription) {
      throw new Error('No active subscription found');
    }

    const plan = this.getPlanFromSubscription(subscription);
    
    // Check if usage tracking is needed (Free tier)
    if (plan.features.maxDesigns > 0) {
      const currentUsage = await this.getCurrentUsage(admin);
      
      if (currentUsage >= plan.features.maxDesigns) {
        throw new Error(`Design limit reached. Upgrade to create more designs.`);
      }
    }

    // Track the usage
    await this.recordUsage(admin, 'design_creation', 1);
    
    return {
      success: true,
      currentUsage: currentUsage + 1,
      limit: plan.features.maxDesigns
    };
  }

  static async recordUsage(admin, metricName, quantity) {
    const mutation = `
      mutation appUsageRecordCreate($subscriptionLineItemId: ID!, $price: MoneyInput!, $description: String!) {
        appUsageRecordCreate(
          subscriptionLineItemId: $subscriptionLineItemId
          price: $price
          description: $description
        ) {
          appUsageRecord {
            id
            price {
              amount
              currencyCode
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    // For Free tier, we track usage but don't charge
    const variables = {
      subscriptionLineItemId: await this.getSubscriptionLineItemId(admin),
      price: { amount: 0, currencyCode: 'USD' },
      description: `${metricName}: ${quantity} units`
    };

    try {
      const response = await admin.graphql(mutation, { variables });
      const result = await response.json();
      
      if (result.data.appUsageRecordCreate.userErrors.length > 0) {
        throw new Error(result.data.appUsageRecordCreate.userErrors[0].message);
      }

      return result.data.appUsageRecordCreate.appUsageRecord;
    } catch (error) {
      console.error('Usage recording failed:', error);
      throw error;
    }
  }

  static async getCurrentUsage(admin) {
    // Query current billing cycle usage
    const query = `
      query {
        currentAppInstallation {
          activeSubscriptions {
            lineItems {
              id
              usageRecords(first: 250) {
                edges {
                  node {
                    id
                    description
                    createdAt
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response = await admin.graphql(query);
      const result = await response.json();
      
      const subscriptions = result.data.currentAppInstallation.activeSubscriptions;
      let totalUsage = 0;
      
      for (const subscription of subscriptions) {
        for (const lineItem of subscription.lineItems) {
          const usageRecords = lineItem.usageRecords.edges;
          totalUsage += usageRecords.filter(record => 
            record.node.description.includes('design_creation')
          ).length;
        }
      }
      
      return totalUsage;
    } catch (error) {
      console.error('Failed to get current usage:', error);
      return 0;
    }
  }
}
```

### **Trial Period Management:**

#### **14-Day Creator Trial Implementation:**
```javascript
// Creator trial management
export class BiypodTrialManager {
  static async startCreatorTrial(admin, merchantId) {
    const trialSubscription = await BiypodSubscriptionManager.createSubscription(
      admin, 
      'creator', 
      merchantId
    );

    // Store trial start date and merchant notification preferences
    await this.storeTrialData(merchantId, {
      subscriptionId: trialSubscription.subscription.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      notificationsSent: {
        day7: false,
        day12: false,
        day14: false
      }
    });

    return trialSubscription;
  }

  static async checkTrialStatus(admin, merchantId) {
    const trialData = await this.getTrialData(merchantId);
    
    if (!trialData) {
      return { inTrial: false };
    }

    const now = new Date();
    const endDate = new Date(trialData.endDate);
    const daysRemaining = Math.ceil((endDate - now) / (24 * 60 * 60 * 1000));

    if (daysRemaining <= 0) {
      // Trial expired - convert to paid or cancel
      await this.handleTrialExpiration(admin, merchantId, trialData);
      return { inTrial: false, expired: true };
    }

    // Send reminder notifications
    await this.sendTrialReminders(merchantId, daysRemaining, trialData);

    return {
      inTrial: true,
      daysRemaining,
      endDate: trialData.endDate
    };
  }

  static async handleTrialExpiration(admin, merchantId, trialData) {
    try {
      // Check if merchant wants to continue with paid subscription
      const merchantPreference = await this.getMerchantTrialPreference(merchantId);
      
      if (merchantPreference.convertToPaid) {
        // Convert to paid Creator subscription
        await BiypodSubscriptionManager.createSubscription(admin, 'creator', merchantId);
        
        await this.logTrialConversion(merchantId, 'converted_to_paid');
      } else {
        // Downgrade to Free tier
        await BiypodSubscriptionManager.createSubscription(admin, 'free', merchantId);
        
        await this.logTrialConversion(merchantId, 'downgraded_to_free');
      }
    } catch (error) {
      console.error('Trial expiration handling failed:', error);
      
      // Fallback: downgrade to Free tier
      await BiypodSubscriptionManager.createSubscription(admin, 'free', merchantId);
    }
  }

  static async sendTrialReminders(merchantId, daysRemaining, trialData) {
    const notifications = trialData.notificationsSent;
    
    if (daysRemaining <= 7 && !notifications.day7) {
      await this.sendTrialReminderEmail(merchantId, 7);
      notifications.day7 = true;
    }
    
    if (daysRemaining <= 2 && !notifications.day12) {
      await this.sendTrialReminderEmail(merchantId, 2);
      notifications.day12 = true;
    }
    
    if (daysRemaining <= 1 && !notifications.day14) {
      await this.sendTrialReminderEmail(merchantId, 1);
      notifications.day14 = true;
    }

    await this.updateTrialData(merchantId, { notificationsSent: notifications });
  }
}
```

### **Proration Handling for Plan Changes:**

#### **Upgrade/Downgrade Proration:**
```javascript
// Proration calculator for Biypod tier changes
export class BiypodProrationCalculator {
  static calculateProration(currentPlan, newPlan, daysLeftInCycle, totalCycleDays) {
    const currentPrice = BiypodSubscriptionManager.subscriptionPlans[currentPlan].price;
    const newPrice = BiypodSubscriptionManager.subscriptionPlans[newPlan].price;
    
    if (newPrice > currentPrice) {
      // Upgrade - charge prorated difference
      const priceDifference = newPrice - currentPrice;
      const proratedCharge = priceDifference * (daysLeftInCycle / totalCycleDays);
      
      return {
        type: 'charge',
        amount: Math.round(proratedCharge * 100) / 100, // Round to 2 decimal places
        description: `Prorated upgrade from ${currentPlan} to ${newPlan}`
      };
    } else if (newPrice < currentPrice) {
      // Downgrade - issue prorated credit
      const priceDifference = currentPrice - newPrice;
      const proratedCredit = priceDifference * (daysLeftInCycle / totalCycleDays);
      
      return {
        type: 'credit',
        amount: Math.round(proratedCredit * 100) / 100,
        description: `Prorated credit for downgrade from ${currentPlan} to ${newPlan}`
      };
    }
    
    return {
      type: 'none',
      amount: 0,
      description: 'No proration needed - same price tier'
    };
  }

  static async handlePlanChange(admin, merchantId, currentPlan, newPlan) {
    const currentSubscription = await BiypodSubscriptionManager.getCurrentSubscription(admin);
    
    if (!currentSubscription) {
      throw new Error('No current subscription found');
    }

    // Calculate proration
    const cycleDays = this.getCycleDays(currentSubscription);
    const daysLeft = this.getDaysLeftInCycle(currentSubscription);
    const proration = this.calculateProration(currentPlan, newPlan, daysLeft, cycleDays);

    // Create new subscription with proration
    const newSubscription = await BiypodSubscriptionManager.createSubscription(
      admin, 
      newPlan, 
      merchantId
    );

    // Log the plan change for analytics
    await this.logPlanChange(merchantId, {
      fromPlan: currentPlan,
      toPlan: newPlan,
      proration,
      timestamp: new Date()
    });

    return {
      subscription: newSubscription,
      proration
    };
  }
}
```

## ⚠️ **CRITICAL WARNINGS**

### **Subscription Violations:**
- **MULTIPLE SUBSCRIPTIONS**: Having more than one active subscription per merchant
- **MISSING APPROVAL**: Creating subscriptions without merchant approval
- **POOR PRORATION**: Incorrect charge/credit calculations for plan changes
- **TRIAL MISHANDLING**: Improper trial period implementation or conversion
- **CANCELLATION ISSUES**: Not properly canceling subscriptions on app uninstall

### **Biypod-Specific Risks:**
- **TIER COMPLEXITY**: 4-tier structure may confuse subscription management
- **USAGE TRACKING**: Free tier design limits not properly enforced
- **TRIAL CONVERSION**: 14-day Creator trial not converting properly
- **FEATURE ACCESS**: Subscription tier not properly controlling 3D features

### **Billing Integration Failures:**
- **GRAPHQL ERRORS**: Improper use of billing mutations and queries
- **PRORATION BUGS**: Incorrect calculations leading to over/under charging
- **TRIAL OVERLAP**: Trial periods overlapping with billing cycles incorrectly
- **WEBHOOK MISSING**: Not handling subscription status change webhooks

## 🏆 **SUCCESS CRITERIA**

### **Subscription Management:**
- ✅ **Single subscription** per merchant properly enforced
- ✅ **GraphQL integration** using proper billing mutations
- ✅ **Merchant approval** flow working correctly
- ✅ **Automatic billing** functioning without manual intervention

### **Biypod Tier Implementation:**
- ✅ **4-tier structure** properly implemented with GraphQL
- ✅ **Creator trial** 14-day period with conversion handling
- ✅ **Usage tracking** for Free tier design limits
- ✅ **Feature access** controlled by subscription tier

### **Proration Excellence:**
- ✅ **Upgrade charges** calculated correctly for mid-cycle changes
- ✅ **Downgrade credits** issued properly for plan reductions
- ✅ **Trial handling** proper proration for trial overlaps
- ✅ **Billing accuracy** no over/under charging merchants

## 🔧 **SUBSCRIPTION VALIDATION TOOLS**

### **Billing Integration Validator:**
```javascript
// Subscription billing validator
class BiypodBillingValidator {
  static async validateSubscriptionState(admin, merchantId) {
    const issues = [];
    
    // Check for multiple active subscriptions
    const activeSubscriptions = await this.getActiveSubscriptions(admin);
    if (activeSubscriptions.length > 1) {
      issues.push('Multiple active subscriptions found - only one allowed');
    }
    
    // Validate subscription plan matches features
    const subscription = activeSubscriptions[0];
    const plan = this.getPlanFromSubscription(subscription);
    const actualFeatures = await this.getCurrentFeatureAccess(merchantId);
    
    if (!this.featuresMatch(plan.features, actualFeatures)) {
      issues.push('Feature access does not match subscription plan');
    }
    
    // Check trial status consistency
    const trialStatus = await BiypodTrialManager.checkTrialStatus(admin, merchantId);
    if (trialStatus.inTrial && subscription.name !== 'Creator') {
      issues.push('Trial status inconsistent with subscription plan');
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }
}
```

---

## 🚨 **MANDATORY SUBSCRIPTION BILLING COMPLIANCE**

**Subscription billing compliance is MANDATORY for Shopify App Store approval. Apps must use GraphQL Admin API billing objects, implement proper proration, handle single subscription per merchant, and provide merchant approval flows. Poor billing implementation will result in app rejection and potential revenue issues.**

**Priority**: 🔴 **CRITICAL - MANDATORY BILLING REQUIREMENT**
**Timeline**: ⏰ **Must be implemented before launch**
**Impact**: 💰 **App approval + Revenue generation + Merchant trust**

**Billing is the foundation of app monetization and must be implemented correctly.**

---

## 📊 **PROGRESS UPDATE**

**Completed**: 29/70+ articles analyzed  
**Remaining**: ~41 articles to audit  
**Current Progress**: 41.4% complete

**Onboarding-Focused Analysis**: 3/6 onboarding articles complete
**Next**: Continuing with Free Trials implementation requirements...

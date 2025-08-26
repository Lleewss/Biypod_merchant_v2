// Biypod Billing Plans Configuration
export type PlanType = 'free' | 'starter' | 'creator';

export interface PlanFeatures {
  productLimit: number;
  usageFeePercentage: number;
  recurringAmount: number;
  trialDays?: number;
  features: string[];
  limitations: string[];
}

export const BIYPOD_PLANS: Record<PlanType, PlanFeatures> = {
  free: {
    productLimit: 1,
    usageFeePercentage: 8.0,
    recurringAmount: 0,
    features: [
      'Publish 1 customizable product',
      'Basic 3D customization',
      'Customer design saving',
      'Order tracking'
    ],
    limitations: [
      'Limited to 1 product',
      '8% fee per order',
      'Biypod branding included',
      'Standard support'
    ]
  },
  starter: {
    productLimit: 20,
    usageFeePercentage: 5.0,
    recurringAmount: 29,
    trialDays: 14,
    features: [
      'Publish up to 20 customizable products',
      'Advanced 3D customization',
      'Premium design templates',
      'Customer design management',
      'Order analytics',
      'Email support'
    ],
    limitations: [
      'Limited to 20 products',
      '5% fee per order',
      'Biypod branding included'
    ]
  },
  creator: {
    productLimit: 1000,
    usageFeePercentage: 1.5,
    recurringAmount: 79,
    trialDays: 14,
    features: [
      'Publish up to 1,000 customizable products',
      'Full 3D customization suite',
      'AI-powered design generation',
      'Custom branding options',
      'Advanced analytics & reporting',
      'Priority support',
      'Custom integrations',
      'Bulk product management'
    ],
    limitations: [
      'Limited to 1,000 products',
      '1.5% fee per order'
    ]
  }
};

export const PLAN_COMPLIANCE_ITEMS = [
  {
    id: 'terms_of_service',
    label: 'I agree to the Biypod Terms of Service',
    required: true,
    link: 'https://biypod.com/terms'
  },
  {
    id: 'privacy_policy',
    label: 'I agree to the Biypod Privacy Policy',
    required: true,
    link: 'https://biypod.com/privacy'
  },
  {
    id: 'shopify_billing',
    label: 'I understand that charges will be processed through Shopify billing',
    required: true
  },
  {
    id: 'usage_fees',
    label: 'I understand that usage fees apply to orders containing customized products',
    required: true
  },
  {
    id: 'plan_limits',
    label: 'I understand the product publishing limits for my selected plan',
    required: true
  },
  {
    id: 'email_marketing',
    label: 'I agree to receive product updates and marketing emails (optional)',
    required: false
  },
  {
    id: 'data_processing',
    label: 'I consent to data processing for app functionality and analytics',
    required: true
  }
];

export function getPlanDisplayName(planType: PlanType): string {
  switch (planType) {
    case 'free':
      return 'Free';
    case 'starter':
      return 'Starter';
    case 'creator':
      return 'Creator';
    default:
      return 'Unknown';
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function formatPercentage(percentage: number): string {
  return `${percentage}%`;
}

export function getPlanPricing(planType: PlanType): {
  recurring: string;
  usageFee: string;
  total: string;
} {
  const plan = BIYPOD_PLANS[planType];
  
  return {
    recurring: plan.recurringAmount > 0 
      ? `${formatCurrency(plan.recurringAmount)}/month` 
      : 'Free',
    usageFee: `${formatPercentage(plan.usageFeePercentage)} per order`,
    total: plan.recurringAmount > 0
      ? `${formatCurrency(plan.recurringAmount)}/month + ${formatPercentage(plan.usageFeePercentage)} per order`
      : `${formatPercentage(plan.usageFeePercentage)} per order only`
  };
}

export function canUpgradePlan(currentPlan: PlanType, targetPlan: PlanType): boolean {
  const planOrder: PlanType[] = ['free', 'starter', 'creator'];
  const currentIndex = planOrder.indexOf(currentPlan);
  const targetIndex = planOrder.indexOf(targetPlan);
  
  return targetIndex > currentIndex;
}

export function canDowngradePlan(currentPlan: PlanType, targetPlan: PlanType): boolean {
  const planOrder: PlanType[] = ['free', 'starter', 'creator'];
  const currentIndex = planOrder.indexOf(currentPlan);
  const targetIndex = planOrder.indexOf(targetPlan);
  
  return targetIndex < currentIndex;
}

export function getTrialEndDate(trialDays: number): Date {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + trialDays);
  return endDate;
}

export function isTrialActive(trialStartDate: Date | null, trialEndDate: Date | null): boolean {
  if (!trialStartDate || !trialEndDate) return false;
  
  const now = new Date();
  return now >= trialStartDate && now <= trialEndDate;
}

export function getTrialDaysRemaining(trialEndDate: Date | null): number {
  if (!trialEndDate) return 0;
  
  const now = new Date();
  const diffTime = trialEndDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

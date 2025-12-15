// Subscription Model Types

export interface SubscriptionPlan {
  id: string;
  name: 'Basic' | 'Pro' | 'Premium';
  price: number; // Monthly price in Centi
  quarterlyPrice: number; // Quarterly price in Centi (discounted)
  serviceCap: number; // Maximum services per month
  includedCategories: string[]; // Service categories included
  features: string[];
  maxServiceHours: number; // Maximum service hours per month
}

export interface BusinessSubscription {
  businessId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate: Date;
  billingCycle: 'monthly' | 'quarterly';
  servicesUsed: number; // Services used this period
  hoursUsed: number; // Hours used this period
  autoRenew: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 200, // Centi per month
    quarterlyPrice: 540, // 3 months with 10% discount
    serviceCap: 5,
    includedCategories: ['graphic-design', 'accounting'],
    features: [
      '5 services per month',
      'Up to 20 service hours',
      'Basic support',
      'Access to marketplace'
    ],
    maxServiceHours: 20
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 500, // Centi per month
    quarterlyPrice: 1350, // 3 months with 10% discount
    serviceCap: 15,
    includedCategories: ['graphic-design', 'web-development', 'marketing-strategy', 'accounting'],
    features: [
      '15 services per month',
      'Up to 60 service hours',
      'Priority support',
      'Advanced marketplace features',
      'AI matching'
    ],
    maxServiceHours: 60
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 1000, // Centi per month
    quarterlyPrice: 2700, // 3 months with 10% discount
    serviceCap: 50,
    includedCategories: ['graphic-design', 'web-development', 'marketing-strategy', 'legal-review', 'accounting'],
    features: [
      'Unlimited services',
      'Up to 200 service hours',
      '24/7 premium support',
      'All marketplace features',
      'AI matching + recommendations',
      'Early access to new features',
      'Franchise opportunities'
    ],
    maxServiceHours: 200
  }
];


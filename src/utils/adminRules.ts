import type { AdminRule, ServiceCategory } from '@/types';

// Default service categories with Centi rates and standard hours
// Standard hours define a typical package size to prevent manipulation
export const DEFAULT_SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'graphic-design',
    name: 'Graphic Design',
    centiPerHour: 5,
    demandMultiplier: 1.0,
    standardHours: 4
  },
  {
    id: 'web-development',
    name: 'Web Development',
    centiPerHour: 8,
    demandMultiplier: 1.0,
    standardHours: 8
  },
  {
    id: 'marketing-strategy',
    name: 'Marketing Strategy',
    centiPerHour: 7,
    demandMultiplier: 1.0,
    standardHours: 3
  },
  {
    id: 'legal-review',
    name: 'Legal Review',
    centiPerHour: 10,
    demandMultiplier: 1.0,
    standardHours: 2
  },
  {
    id: 'accounting',
    name: 'Accounting',
    centiPerHour: 6,
    demandMultiplier: 1.0,
    standardHours: 3
  }
];

// Admin rules storage (in production, this would be in a database)
let adminRules: AdminRule[] = [
  {
    id: 'decay-rule',
    type: 'decay',
    value: 0.1, // 0.1% per day
    unit: 'percentage',
    effectiveDate: new Date('2024-01-01')
  },
  {
    id: 'airdrop-rule',
    type: 'airdrop',
    value: 100,
    unit: 'centi',
    effectiveDate: new Date('2024-01-01')
  }
];

let serviceCategories: ServiceCategory[] = [...DEFAULT_SERVICE_CATEGORIES];

export function getServiceCategories(): ServiceCategory[] {
  return serviceCategories;
}

export function getServiceCategory(categoryId: string): ServiceCategory | undefined {
  return serviceCategories.find(c => c.id === categoryId);
}

export function calculateServiceCost(categoryId: string, hours: number): number {
  const category = getServiceCategory(categoryId);
  if (!category) return 0;
  
  return category.centiPerHour * hours * category.demandMultiplier;
}

export function getDecayRules() {
  const decayRule = adminRules.find(r => r.type === 'decay');
  return {
    dailyDecayRate: (decayRule?.value as number) || 0.001, // 0.1% default
    minBalance: 0
  };
}

export function getBorrowingRules() {
  return {
    maxBorrowAmount: 500, // Max Centi that can be borrowed
    interestRate: 12.5, // Default 12.5% interest (will be calculated dynamically)
    repaymentPeriodDays: 30,
    minBorrowAmount: 10,
    // Dynamic interest rate range: 3-15%
    minInterestRate: 3,
    maxInterestRate: 15
  };
}

export function getAirdropRules() {
  const airdropRule = adminRules.find(r => r.type === 'airdrop');
  return {
    amount: (airdropRule?.value as number) || 100,
    expiryDays: 45, // Airdrop Centi expires in 45 days
    nonTransferable: true,
    nonCashable: true
  };
}

export function updateServiceCategory(categoryId: string, updates: Partial<ServiceCategory>) {
  const index = serviceCategories.findIndex(c => c.id === categoryId);
  if (index !== -1) {
    serviceCategories[index] = { ...serviceCategories[index], ...updates };
  }
}

export function updateAdminRule(ruleId: string, updates: Partial<AdminRule>) {
  const index = adminRules.findIndex(r => r.id === ruleId);
  if (index !== -1) {
    adminRules[index] = { ...adminRules[index], ...updates };
  }
}



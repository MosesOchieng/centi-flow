// Enhanced Lending System with Dynamic Interest Rates

import type { Business, Reputation } from '@/types';

export interface LendingTerms {
  principal: number;
  interestRate: number; // 3-15%
  totalRepayment: number; // Principal + Interest
  repaymentMethod: 'cash' | 'service_hours' | 'products' | 'mixed';
  serviceHourRate?: number; // Centi per hour for service repayment
  serviceHoursRequired?: number; // Total hours needed if repaying with services
  term: number; // Days
  dueDate: Date;
}

export interface BorrowerProfile {
  businessId: string;
  reputation: Reputation;
  transactionVolume: number;
  repaymentHistory: {
    onTime: number;
    late: number;
    defaulted: number;
  };
  currentDebt: number;
  borrowingPurpose: 'critical' | 'growth' | 'optional' | 'ecosystem';
}

// Calculate interest rate based on borrower profile and market conditions
export function calculateInterestRate(
  borrower: BorrowerProfile,
  marketLiquidity: number, // Total Centi in circulation
  serviceDemand: number, // Current service demand level
  repaymentMethod: 'cash' | 'service_hours' | 'products' | 'mixed',
  purpose: 'critical' | 'growth' | 'optional' | 'ecosystem',
  hasCollateral: boolean
): number {
  let baseRate = 8; // Base rate 8%

  // Reputation-based adjustment (-5% to +5%)
  const reputationScore = borrower.reputation.score;
  if (reputationScore >= 80) {
    baseRate -= 3; // High reputation: -3%
  } else if (reputationScore >= 60) {
    baseRate -= 1; // Good reputation: -1%
  } else if (reputationScore < 40) {
    baseRate += 3; // Low reputation: +3%
  }

  // Transaction volume adjustment (-2% to +2%)
  if (borrower.transactionVolume > 100) {
    baseRate -= 1;
  } else if (borrower.transactionVolume < 10) {
    baseRate += 1;
  }

  // Repayment history adjustment (-3% to +3%)
  const totalRepayments = borrower.repaymentHistory.onTime + borrower.repaymentHistory.late;
  if (totalRepayments > 0) {
    const onTimeRate = borrower.repaymentHistory.onTime / totalRepayments;
    if (onTimeRate >= 0.9) {
      baseRate -= 2; // 90%+ on-time: -2%
    } else if (onTimeRate < 0.5) {
      baseRate += 2; // <50% on-time: +2%
    }
  } else {
    baseRate += 2; // New borrower: +2%
  }

  // Current debt adjustment (+1% to +3%)
  if (borrower.currentDebt > 500) {
    baseRate += 2; // High existing debt
  } else if (borrower.currentDebt > 200) {
    baseRate += 1;
  }

  // Market liquidity adjustment (-2% to +2%)
  if (marketLiquidity > 10000) {
    baseRate -= 1; // High liquidity: lower rates
  } else if (marketLiquidity < 3000) {
    baseRate += 1; // Low liquidity: higher rates
  }

  // Service demand adjustment (-1% to +2%)
  if (serviceDemand > 80) {
    baseRate += 1; // High demand: higher rates
  } else if (serviceDemand < 30) {
    baseRate -= 1; // Low demand: lower rates
  }

  // Repayment method adjustment
  if (repaymentMethod === 'service_hours') {
    baseRate -= 1; // Service hours preferred: -1%
  } else if (repaymentMethod === 'cash') {
    baseRate += 0.5; // Cash repayment: +0.5%
  }

  // Purpose-based adjustment
  if (purpose === 'ecosystem') {
    baseRate -= 2; // Ecosystem growth: -2%
  } else if (purpose === 'critical') {
    baseRate += 1; // Critical needs: +1%
  } else if (purpose === 'optional') {
    baseRate += 1.5; // Optional: +1.5%
  }

  // Collateral adjustment
  if (hasCollateral) {
    baseRate -= 2; // Has collateral: -2%
  }

  // Clamp to 3-15% range
  return Math.max(3, Math.min(15, baseRate));
}

// Calculate service hours required for repayment with interest
export function calculateServiceHourRepayment(
  principal: number,
  interestRate: number,
  serviceHourRate: number // Centi per hour
): {
  totalRepayment: number;
  serviceHoursRequired: number;
  interestAmount: number;
} {
  const interestAmount = principal * (interestRate / 100);
  const totalRepayment = principal + interestAmount;
  const serviceHoursRequired = Math.ceil(totalRepayment / serviceHourRate);

  return {
    totalRepayment,
    serviceHoursRequired,
    interestAmount
  };
}

// Generate lending terms
export function generateLendingTerms(
  borrower: BorrowerProfile,
  principal: number,
  repaymentMethod: 'cash' | 'service_hours' | 'products' | 'mixed',
  purpose: 'critical' | 'growth' | 'optional' | 'ecosystem',
  term: number, // Days
  serviceHourRate?: number,
  marketLiquidity: number = 5000,
  serviceDemand: number = 50,
  hasCollateral: boolean = false
): LendingTerms {
  const interestRate = calculateInterestRate(
    borrower,
    marketLiquidity,
    serviceDemand,
    repaymentMethod,
    purpose,
    hasCollateral
  );

  const interestAmount = principal * (interestRate / 100);
  const totalRepayment = principal + interestAmount;

  let serviceHoursRequired: number | undefined;
  if (repaymentMethod === 'service_hours' && serviceHourRate) {
    serviceHoursRequired = Math.ceil(totalRepayment / serviceHourRate);
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + term);

  return {
    principal,
    interestRate,
    totalRepayment,
    repaymentMethod,
    serviceHourRate,
    serviceHoursRequired,
    term,
    dueDate
  };
}

// Calculate early repayment discount
export function calculateEarlyRepaymentDiscount(
  originalTerms: LendingTerms,
  daysEarly: number
): number {
  // 1% discount per 10 days early, max 5% discount
  const discountPercent = Math.min(5, Math.floor(daysEarly / 10));
  return originalTerms.totalRepayment * (discountPercent / 100);
}


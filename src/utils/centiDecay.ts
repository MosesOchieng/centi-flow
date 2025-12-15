import { getDecayRules } from './adminRules';

/**
 * Calculate Centi decay based on unused time
 * Decay prevents hoarding and encourages spending
 */
export function calculateDecay(currentBalance: number, daysUnused: number): number {
  if (daysUnused < 1 || currentBalance <= 0) {
    return 0;
  }

  const rules = getDecayRules();
  const dailyDecayRate = rules.dailyDecayRate; // e.g., 0.1% per day
  
  // Compound decay: balance decreases by decayRate each day
  const decayMultiplier = Math.pow(1 - dailyDecayRate, daysUnused);
  const newBalance = currentBalance * decayMultiplier;
  const decayAmount = currentBalance - newBalance;

  return Math.max(0, decayAmount);
}

/**
 * Apply decay to balance
 */
export function applyDecay(currentBalance: number, daysUnused: number): number {
  const decayAmount = calculateDecay(currentBalance, daysUnused);
  return Math.max(0, currentBalance - decayAmount);
}

/**
 * Check if Centi has expired (for airdrop Centi)
 */
export function isExpired(createdAt: Date, expiryDays: number): boolean {
  const expiryDate = new Date(createdAt);
  expiryDate.setDate(expiryDate.getDate() + expiryDays);
  return new Date() > expiryDate;
}



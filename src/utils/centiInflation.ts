/**
 * Ratings-based Centi inflation system
 * Higher ratings = higher Centi value = better service incentives
 */

import type { Reputation } from '@/types';

interface InflationParams {
  averageRating: number;
  totalRatings: number;
  onTimeCompletionRate: number;
  totalJobsCompleted: number;
}

/**
 * Calculate Centi value multiplier based on ratings
 * Higher ratings = higher Centi value (inflation)
 * Lower ratings = lower Centi value (deflation)
 * 
 * Formula:
 * - Base multiplier: 1.0
 * - Rating impact: (averageRating / 5) * 0.3 (up to 30% bonus)
 * - Volume bonus: min(totalJobsCompleted / 100, 0.1) (up to 10% bonus)
 * - On-time bonus: onTimeCompletionRate * 0.1 (up to 10% bonus)
 * - Total range: 0.5x to 1.5x
 */
export function calculateCentiValueMultiplier(params: InflationParams): number {
  const { averageRating, totalRatings, onTimeCompletionRate, totalJobsCompleted } = params;

  // Base multiplier
  let multiplier = 1.0;

  // Rating impact: Higher ratings = higher value
  // 5 stars = +30%, 1 star = -30%
  const ratingImpact = ((averageRating - 2.5) / 2.5) * 0.3;
  multiplier += ratingImpact;

  // Volume bonus: More completed jobs = trust = higher value
  const volumeBonus = Math.min(totalJobsCompleted / 100, 0.1);
  multiplier += volumeBonus;

  // On-time completion bonus: Reliability = higher value
  const onTimeBonus = onTimeCompletionRate * 0.1;
  multiplier += onTimeBonus;

  // Minimum threshold: Need at least 3 ratings to get full benefits
  if (totalRatings < 3) {
    multiplier = 0.5 + (multiplier - 0.5) * (totalRatings / 3);
  }

  // Clamp between 0.5x and 1.5x
  return Math.max(0.5, Math.min(1.5, multiplier));
}

/**
 * Calculate adjusted Centi amount based on provider's reputation
 */
export function adjustCentiByReputation(
  baseAmount: number,
  reputation: Reputation
): number {
  const params: InflationParams = {
    averageRating: reputation.averageRating,
    totalRatings: reputation.totalRatings,
    onTimeCompletionRate: reputation.onTimeCompletionRate,
    totalJobsCompleted: reputation.totalJobsCompleted
  };

  const multiplier = calculateCentiValueMultiplier(params);
  return baseAmount * multiplier;
}

/**
 * Calculate inflation rate for the ecosystem
 * Based on average ratings across all businesses
 */
export function calculateEcosystemInflation(
  averageRatingAcrossEcosystem: number
): number {
  // If average rating is high, Centi becomes more valuable (inflation)
  // If average rating is low, Centi becomes less valuable (deflation)
  
  // Base: 0% inflation
  // 5 stars average = +20% inflation (Centi worth more)
  // 1 star average = -20% deflation (Centi worth less)
  
  const inflationRate = ((averageRatingAcrossEcosystem - 3) / 2) * 0.2;
  return Math.max(-0.2, Math.min(0.2, inflationRate));
}

/**
 * Get inflation message for UI
 */
export function getInflationMessage(multiplier: number): string {
  if (multiplier > 1.1) {
    return `Your high ratings give you ${((multiplier - 1) * 100).toFixed(0)}% bonus Centi value!`;
  } else if (multiplier > 1.0) {
    return `Your good ratings give you ${((multiplier - 1) * 100).toFixed(0)}% bonus Centi value.`;
  } else if (multiplier < 0.9) {
    return `Your low ratings reduce Centi value by ${((1 - multiplier) * 100).toFixed(0)}%. Improve your service!`;
  } else if (multiplier < 1.0) {
    return `Your ratings reduce Centi value by ${((1 - multiplier) * 100).toFixed(0)}%.`;
  }
  return 'Your Centi value is at base rate.';
}


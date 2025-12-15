import { create } from 'zustand';
import type { Reputation } from '@/types';

interface ReputationState {
  reputations: Map<string, Reputation>;
  
  // Actions
  initializeReputation: (businessId: string) => void;
  updateRating: (businessId: string, rating: number, review?: string) => void;
  recordJobCompletion: (businessId: string, onTime: boolean) => void;
  recordJobDelivery: (businessId: string) => void;
  calculateReputationScore: (businessId: string) => number;
  getReputation: (businessId: string) => Reputation;
  awardBadge: (businessId: string, badge: string) => void;
}

export const useReputationStore = create<ReputationState>((set, get) => ({
  reputations: new Map(),

  initializeReputation: (businessId) => {
    const reputation: Reputation = {
      businessId,
      score: 50, // Starting score
      totalRatings: 0,
      averageRating: 0,
      onTimeCompletionRate: 1.0,
      totalJobsCompleted: 0,
      totalJobsDelivered: 0,
      badges: []
    };

    set(state => {
      const newReputations = new Map(state.reputations);
      newReputations.set(businessId, reputation);
      return { reputations: newReputations };
    });
  },

  updateRating: (businessId, rating, _review) => {
    const state = get();
    const current = state.reputations.get(businessId) || state.getReputation(businessId);

    const newTotalRatings = current.totalRatings + 1;
    const newAverageRating = 
      (current.averageRating * current.totalRatings + rating) / newTotalRatings;

    const updated: Reputation = {
      ...current,
      totalRatings: newTotalRatings,
      averageRating: newAverageRating,
      score: state.calculateReputationScore(businessId)
    };

    set(state => {
      const newReputations = new Map(state.reputations);
      newReputations.set(businessId, updated);
      return { reputations: newReputations };
    });
  },

  recordJobCompletion: (businessId, onTime) => {
    const state = get();
    const current = state.reputations.get(businessId) || state.getReputation(businessId);

    const newCompleted = current.totalJobsCompleted + 1;
    const newOnTimeRate = onTime
      ? (current.onTimeCompletionRate * current.totalJobsCompleted + 1) / newCompleted
      : (current.onTimeCompletionRate * current.totalJobsCompleted) / newCompleted;

    const updated: Reputation = {
      ...current,
      totalJobsCompleted: newCompleted,
      onTimeCompletionRate: newOnTimeRate,
      score: state.calculateReputationScore(businessId)
    };

    set(state => {
      const newReputations = new Map(state.reputations);
      newReputations.set(businessId, updated);
      return { reputations: newReputations };
    });
  },

  recordJobDelivery: (businessId) => {
    const state = get();
    const current = state.reputations.get(businessId) || state.getReputation(businessId);

    const updated: Reputation = {
      ...current,
      totalJobsDelivered: current.totalJobsDelivered + 1
    };

    set(state => {
      const newReputations = new Map(state.reputations);
      newReputations.set(businessId, updated);
      return { reputations: newReputations };
    });
  },

  calculateReputationScore: (businessId) => {
    const current = get().reputations.get(businessId);
    if (!current) return 50;

    // Score calculation:
    // - Rating: 0-40 points (based on 1-5 star average)
    // - On-time completion: 0-30 points
    // - Job volume: 0-20 points (capped)
    // - Badges: 0-10 points

    const ratingScore = (current.averageRating / 5) * 40;
    const onTimeScore = current.onTimeCompletionRate * 30;
    const volumeScore = Math.min(current.totalJobsCompleted / 10, 1) * 20;
    const badgeScore = Math.min(current.badges.length, 5) * 2;

    return Math.round(ratingScore + onTimeScore + volumeScore + badgeScore);
  },

  getReputation: (businessId) => {
    const state = get();
    let reputation = state.reputations.get(businessId);

    if (!reputation) {
      state.initializeReputation(businessId);
      reputation = state.reputations.get(businessId)!;
    }

    return reputation;
  },

  awardBadge: (businessId, badge) => {
    const state = get();
    const current = state.reputations.get(businessId) || state.getReputation(businessId);

    if (!current.badges.includes(badge)) {
      const updated: Reputation = {
        ...current,
        badges: [...current.badges, badge],
        score: state.calculateReputationScore(businessId)
      };

      set(state => {
        const newReputations = new Map(state.reputations);
        newReputations.set(businessId, updated);
        return { reputations: newReputations };
      });
    }
  }
}));



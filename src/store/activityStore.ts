import { create } from 'zustand';
import type { ActivityFeedItem } from '@/types';

interface ActivityState {
  activities: ActivityFeedItem[];
  
  // Actions
  addActivity: (activity: Omit<ActivityFeedItem, 'id' | 'timestamp'>) => void;
  getActivities: (businessId?: string, limit?: number) => ActivityFeedItem[];
  clearActivities: () => void;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],

  addActivity: (activityData) => {
    const activity: ActivityFeedItem = {
      ...activityData,
      id: `activity-${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    };

    set(state => ({
      activities: [activity, ...state.activities].slice(0, 100) // Keep last 100
    }));
  },

  getActivities: (businessId, limit = 50) => {
    const state = get();
    let filtered = state.activities;

    if (businessId) {
      filtered = filtered.filter(a => a.businessId === businessId);
    }

    return filtered.slice(0, limit);
  },

  clearActivities: () => {
    set({ activities: [] });
  }
}));



import { create } from 'zustand';
import type { ServiceHour } from '@/types';

interface ServiceHourState {
  hours: ServiceHour[];
  
  // Actions
  recordEarnedHours: (businessId: string, serviceRequestId: string, hours: number) => ServiceHour;
  recordOwedHours: (businessId: string, serviceRequestId: string, hours: number, dueDate: Date) => ServiceHour;
  recordCommittedHours: (businessId: string, serviceRequestId: string, hours: number, deliveryDate: Date) => ServiceHour;
  verifyHours: (hourId: string) => void;
  completeHours: (hourId: string) => void;
  getHoursEarned: (businessId: string) => number;
  getHoursOwed: (businessId: string) => number;
  getHoursCommitted: (businessId: string) => number;
  getTotalHours: (businessId: string) => { earned: number; owed: number; committed: number };
}

export const useServiceHourStore = create<ServiceHourState>((set, get) => ({
  hours: [],

  recordEarnedHours: (businessId, serviceRequestId, hours) => {
    const hour: ServiceHour = {
      id: `hour-${Date.now()}-${Math.random()}`,
      businessId,
      serviceRequestId,
      type: 'earned',
      hours,
      status: 'pending',
      createdAt: new Date()
    };

    set(state => ({
      hours: [...state.hours, hour]
    }));

    return hour;
  },

  recordOwedHours: (businessId, serviceRequestId, hours, dueDate) => {
    const hour: ServiceHour = {
      id: `hour-${Date.now()}-${Math.random()}`,
      businessId,
      serviceRequestId,
      type: 'owed',
      hours,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: dueDate
    };

    set(state => ({
      hours: [...state.hours, hour]
    }));

    return hour;
  },

  recordCommittedHours: (businessId, serviceRequestId, hours, deliveryDate) => {
    const hour: ServiceHour = {
      id: `hour-${Date.now()}-${Math.random()}`,
      businessId,
      serviceRequestId,
      type: 'committed',
      hours,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: deliveryDate
    };

    set(state => ({
      hours: [...state.hours, hour]
    }));

    return hour;
  },

  verifyHours: (hourId) => {
    set(state => ({
      hours: state.hours.map(h =>
        h.id === hourId
          ? { ...h, status: 'verified', verifiedAt: new Date() }
          : h
      )
    }));
  },

  completeHours: (hourId) => {
    set(state => ({
      hours: state.hours.map(h =>
        h.id === hourId ? { ...h, status: 'completed' } : h
      )
    }));
  },

  getHoursEarned: (businessId) => {
    const state = get();
    return state.hours
      .filter(h => h.businessId === businessId && h.type === 'earned' && h.status === 'verified')
      .reduce((sum, h) => sum + h.hours, 0);
  },

  getHoursOwed: (businessId) => {
    const state = get();
    return state.hours
      .filter(h => h.businessId === businessId && h.type === 'owed' && h.status !== 'completed')
      .reduce((sum, h) => sum + h.hours, 0);
  },

  getHoursCommitted: (businessId) => {
    const state = get();
    return state.hours
      .filter(h => h.businessId === businessId && h.type === 'committed' && h.status !== 'completed')
      .reduce((sum, h) => sum + h.hours, 0);
  },

  getTotalHours: (businessId) => {
    const state = get();
    return {
      earned: state.getHoursEarned(businessId),
      owed: state.getHoursOwed(businessId),
      committed: state.getHoursCommitted(businessId)
    };
  }
}));



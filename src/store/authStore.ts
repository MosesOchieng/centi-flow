import { create } from 'zustand';
import type { Business } from '@/types';
import { initDatabase, saveBusiness, getBusinessByEmail, getBusinessById } from '@/utils/database';

interface AuthState {
  currentBusiness: Business | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (businessData: Omit<Business, 'id' | 'createdAt' | 'reputation' | 'rating' | 'totalHoursDelivered' | 'totalHoursReceived'> & { password: string }) => Promise<Business>;
  logout: () => void;
  getCurrentBusiness: () => Business | null;
  loadBusiness: (businessId: string) => Promise<void>;
  completeKyc: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentBusiness: null,
  isAuthenticated: false,

  login: async (email, password) => {
    try {
      await initDatabase();
      const businessData = await getBusinessByEmail(email);
      
      if (!businessData) {
        return false;
      }

      // In production, use proper password hashing (bcrypt, etc.)
      if (businessData.password !== password) {
        return false;
      }

    const business: Business = {
        id: businessData.id,
        name: businessData.name,
        email: businessData.email,
        verified: businessData.verified,
        createdAt: businessData.createdAt,
        reputation: businessData.reputation,
        rating: businessData.rating,
        totalHoursDelivered: businessData.totalHoursDelivered,
        totalHoursReceived: businessData.totalHoursReceived
    };

    set({
      currentBusiness: business,
      isAuthenticated: true
    });

      // Store in localStorage for persistence
      localStorage.setItem('currentBusinessId', business.id);

    return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },

  register: async (businessData) => {
    try {
      await initDatabase();
      
      // Check if email already exists
      const existing = await getBusinessByEmail(businessData.email);
      if (existing) {
        throw new Error('Email already registered');
      }

    const business: Business = {
      id: `business-${Date.now()}`,
        name: businessData.name,
        email: businessData.email,
        verified: businessData.verified || false,
      createdAt: new Date(),
      reputation: 50,
      rating: 0,
      totalHoursDelivered: 0,
      totalHoursReceived: 0
    };

      // Save to database
      await saveBusiness({
        ...business,
        password: businessData.password // In production, hash this
      });

    set({
      currentBusiness: business,
      isAuthenticated: true
    });

      // Store in localStorage for persistence
      localStorage.setItem('currentBusinessId', business.id);

    return business;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  loadBusiness: async (businessId: string) => {
    try {
      await initDatabase();
      const businessData = await getBusinessById(businessId);
      
      if (businessData) {
        const business: Business = {
          id: businessData.id,
          name: businessData.name,
          email: businessData.email,
          verified: businessData.verified,
          createdAt: businessData.createdAt,
          reputation: businessData.reputation,
          rating: businessData.rating,
          totalHoursDelivered: businessData.totalHoursDelivered,
          totalHoursReceived: businessData.totalHoursReceived
        };

        set({
          currentBusiness: business,
          isAuthenticated: true
        });
      }
    } catch (error) {
      console.error('Load business error:', error);
    }
  },

  logout: () => {
    localStorage.removeItem('currentBusinessId');
    set({
      currentBusiness: null,
      isAuthenticated: false
    });
  },

  getCurrentBusiness: () => {
    return get().currentBusiness;
  },

  completeKyc: async () => {
    const state = get();
    if (!state.currentBusiness) return;

    try {
      await initDatabase();
      const existing = await getBusinessById(state.currentBusiness.id);
      if (!existing) return;

      // Set KYC status to pending (admin will approve)
      const updated = {
        ...existing,
        kycStatus: 'pending' as const,
        verified: false // Not verified until admin approves
      };

      await saveBusiness(updated);

      set({
        currentBusiness: {
          ...state.currentBusiness,
          kycStatus: 'pending',
          verified: false
        }
      });
    } catch (error) {
      console.error('KYC completion error:', error);
    }
  }
}));



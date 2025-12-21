import { create } from 'zustand';
import { initDatabase, getAllBusinesses, getBusinessById, saveBusiness } from '@/utils/database';
import type { Business } from '@/types';

interface AdminState {
  isAdmin: boolean;
  adminPassword: string;
  pendingBusinesses: Business[];
  allBusinesses: Business[];
  
  // Actions
  login: (password: string) => boolean;
  logout: () => void;
  loadPendingBusinesses: () => Promise<void>;
  loadAllBusinesses: () => Promise<void>;
  approveBusiness: (businessId: string) => Promise<void>;
  rejectBusiness: (businessId: string) => Promise<void>;
}

// In production, this should be stored securely
const ADMIN_PASSWORD = 'admin123'; // Change this in production!

export const useAdminStore = create<AdminState>((set, get) => ({
  isAdmin: false,
  adminPassword: ADMIN_PASSWORD,
  pendingBusinesses: [],
  allBusinesses: [],

  login: (password) => {
    if (password === ADMIN_PASSWORD) {
      set({ isAdmin: true });
      localStorage.setItem('adminLoggedIn', 'true');
      return true;
    }
    return false;
  },

  logout: () => {
    set({ isAdmin: false });
    localStorage.removeItem('adminLoggedIn');
  },

  loadPendingBusinesses: async () => {
    try {
      await initDatabase();
      const businesses = await getAllBusinesses();
      const pending = businesses
        .filter(b => (b as any).kycStatus === 'pending')
        .map(b => ({
          id: b.id,
          name: b.name,
          email: b.email,
          verified: b.verified,
          kycStatus: (b as any).kycStatus || 'incomplete',
          createdAt: b.createdAt,
          reputation: b.reputation || 50,
          rating: b.rating || 0,
          totalHoursDelivered: b.totalHoursDelivered || 0,
          totalHoursReceived: b.totalHoursReceived || 0
        }));
      
      set({ pendingBusinesses: pending });
    } catch (error) {
      console.error('Error loading pending businesses:', error);
    }
  },

  loadAllBusinesses: async () => {
    try {
      await initDatabase();
      const businesses = await getAllBusinesses();
      const mapped = businesses.map(b => ({
        id: b.id,
        name: b.name,
        email: b.email,
        verified: b.verified,
        kycStatus: (b as any).kycStatus || 'incomplete',
        createdAt: b.createdAt,
        reputation: b.reputation || 50,
        rating: b.rating || 0,
        totalHoursDelivered: b.totalHoursDelivered || 0,
        totalHoursReceived: b.totalHoursReceived || 0
      }));
      
      set({ allBusinesses: mapped });
    } catch (error) {
      console.error('Error loading all businesses:', error);
    }
  },

  approveBusiness: async (businessId: string) => {
    try {
      await initDatabase();
      const business = await getBusinessById(businessId);
      if (!business) return;

      const updated = {
        ...business,
        verified: true,
        kycStatus: 'approved' as const
      };

      await saveBusiness(updated);
      
      // Reload pending businesses
      await get().loadPendingBusinesses();
      await get().loadAllBusinesses();
    } catch (error) {
      console.error('Error approving business:', error);
    }
  },

  rejectBusiness: async (businessId: string) => {
    try {
      await initDatabase();
      const business = await getBusinessById(businessId);
      if (!business) return;

      const updated = {
        ...business,
        verified: false,
        kycStatus: 'rejected' as const
      };

      await saveBusiness(updated);
      
      // Reload pending businesses
      await get().loadPendingBusinesses();
      await get().loadAllBusinesses();
    } catch (error) {
      console.error('Error rejecting business:', error);
    }
  }
}));


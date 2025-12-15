import { create } from 'zustand';
import type { Service, ServiceRequest, ServiceCategory } from '@/types';
import { getServiceCategories, calculateServiceCost } from '@/utils/adminRules';
import { useWalletStore } from './walletStore';
import { useServiceHourStore } from './serviceHourStore';

interface MarketplaceState {
  services: Service[];
  serviceRequests: ServiceRequest[];
  categories: ServiceCategory[];
  selectedCategory: string | null;
  searchQuery: string;

  // Actions
  loadServices: () => void;
  createService: (service: Omit<Service, 'id' | 'createdAt' | 'status' | 'centiCost'>) => Service;
  requestService: (serviceId: string, requesterId: string) => ServiceRequest | null;
  acceptServiceRequest: (requestId: string, providerId: string) => void;
  completeService: (requestId: string, hoursDelivered?: number) => void;
  cancelService: (requestId: string) => void;
  setCategoryFilter: (categoryId: string | null) => void;
  setSearchQuery: (query: string) => void;
  getFilteredServices: () => Service[];
}

export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
  services: [],
  serviceRequests: [],
  categories: getServiceCategories(),
  selectedCategory: null,
  searchQuery: '',

  loadServices: () => {
    // In production, this would fetch from API
    // For now, initialize with empty array
    set({ services: [] });
  },

  createService: (serviceData) => {
    const category = getServiceCategories().find(c => c.id === serviceData.categoryId);
    if (!category) {
      throw new Error('Invalid service category');
    }

    const centiCost = calculateServiceCost(serviceData.categoryId, serviceData.estimatedHours);

    const newService: Service = {
      ...serviceData,
      id: `service-${Date.now()}-${Math.random()}`,
      centiCost,
      status: 'available',
      createdAt: new Date()
    };

    set(state => ({
      services: [...state.services, newService]
    }));

    return newService;
  },

  requestService: (serviceId, requesterId) => {
    const state = get();
    const service = state.services.find(s => s.id === serviceId);

    if (!service || service.status !== 'available') {
      return null;
    }

    // Check if wallet has enough Centi (this would be checked in the component)
    const request: ServiceRequest = {
      id: `request-${Date.now()}-${Math.random()}`,
      requesterId,
      serviceId,
      status: 'pending',
      requestedAt: new Date()
    };

    set(state => ({
      serviceRequests: [...state.serviceRequests, request],
      services: state.services.map(s =>
        s.id === serviceId ? { ...s, status: 'in_progress' } : s
      )
    }));

    return request;
  },

  acceptServiceRequest: (requestId, _providerId) => {
    set(state => ({
      serviceRequests: state.serviceRequests.map(req =>
        req.id === requestId
          ? { ...req, status: 'accepted', acceptedAt: new Date() }
          : req
      )
    }));
  },

  completeService: (requestId, _hoursDelivered) => {
    const state = get();
    const request = state.serviceRequests.find(r => r.id === requestId);
    
    if (!request) return;

    const service = state.services.find(s => s.id === request.serviceId);
    if (!service) return;

    const completedAt = new Date();

    set(state => ({
      serviceRequests: state.serviceRequests.map(req =>
        req.id === requestId
          ? { ...req, status: 'completed', completedAt }
          : req
      ),
      services: state.services.map(s =>
        s.id === service.id ? { ...s, status: 'completed', completedAt } : s
      )
    }));

    // Determine standard hours from category to prevent manipulation
    const category = getServiceCategories().find(c => c.id === service.categoryId);
    const standardHours = category?.standardHours ?? service.estimatedHours;

    // Record earned service hours for the provider
    const serviceHourStore = useServiceHourStore.getState();
    serviceHourStore.recordEarnedHours(service.providerId, request.id, standardHours);

    // Credit Centi to the provider's wallet based on the service package value
    const walletStore = useWalletStore.getState();
    walletStore.addCenti(
      service.centiCost,
      'earn',
      `Service completed: ${service.title}`,
      {
        relatedServiceId: service.id,
        relatedBusinessId: request.requesterId
      }
    );
  },

  cancelService: (requestId) => {
    const state = get();
    const request = state.serviceRequests.find(r => r.id === requestId);
    
    if (!request) return;

    set(state => ({
      serviceRequests: state.serviceRequests.map(req =>
        req.id === requestId ? { ...req, status: 'cancelled' } : req
      ),
      services: state.services.map(s =>
        s.id === request.serviceId ? { ...s, status: 'available' } : s
      )
    }));
  },

  setCategoryFilter: (categoryId) => {
    set({ selectedCategory: categoryId });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  getFilteredServices: () => {
    const state = get();
    let filtered = state.services.filter(s => s.status === 'available');

    if (state.selectedCategory) {
      filtered = filtered.filter(s => s.categoryId === state.selectedCategory);
    }

    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }
}));



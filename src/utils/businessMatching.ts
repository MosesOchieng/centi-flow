// AI Business Matching System
// This system analyzes businesses and matches them based on needs and capabilities

import type { Business, Service, ServiceRequest } from '@/types';

export interface BusinessNeed {
  businessId: string;
  categoryId: string;
  priority: 'high' | 'medium' | 'low';
  estimatedHours: number;
  budget: number; // in Centi
  deadline?: Date;
  requirements?: string[];
}

export interface BusinessCapability {
  businessId: string;
  categoryId: string;
  availableHours: number;
  rate: number; // Centi per hour
  experience: number; // years or projects
  rating: number;
  specialties?: string[];
}

export interface Match {
  requesterId: string;
  providerId: string;
  categoryId: string;
  matchScore: number; // 0-100
  reason: string;
  estimatedCost: number;
  estimatedHours: number;
}

// Analyze business needs from service requests
export function analyzeBusinessNeeds(
  _businesses: Business[],
  serviceRequests: ServiceRequest[],
  services: Service[]
): BusinessNeed[] {
  const needs: BusinessNeed[] = [];

  serviceRequests.forEach(request => {
    if (request.status === 'pending' || request.status === 'in_progress') {
      const service = services.find(s => s.id === request.serviceId);
      if (service) {
        needs.push({
          businessId: request.requesterId,
          categoryId: service.categoryId,
          priority: 'high', // Can be determined by deadline or other factors
          estimatedHours: service.estimatedHours,
          budget: service.centiCost,
          requirements: [service.description],
        });
      }
    }
  });

  return needs;
}

// Analyze business capabilities from services offered
export function analyzeBusinessCapabilities(
  businesses: Business[],
  services: Service[],
  reputations: Map<string, { rating: number; totalJobs: number }>
): BusinessCapability[] {
  const capabilities: BusinessCapability[] = [];

  services.forEach(service => {
    if (service.status === 'available') {
      const business = businesses.find(b => b.id === service.providerId);
      const reputation = reputations.get(service.providerId);

      capabilities.push({
        businessId: service.providerId,
        categoryId: service.categoryId,
        availableHours: service.estimatedHours,
        rate: service.centiCost / service.estimatedHours,
        experience: business?.totalHoursDelivered || 0,
        rating: reputation?.rating || 0,
        specialties: [service.title],
      });
    }
  });

  return capabilities;
}

// Match businesses based on needs and capabilities
export function matchBusinesses(
  needs: BusinessNeed[],
  capabilities: BusinessCapability[]
): Match[] {
  const matches: Match[] = [];

  needs.forEach(need => {
    const compatibleProviders = capabilities.filter(
      cap => cap.categoryId === need.categoryId && cap.businessId !== need.businessId
    );

    compatibleProviders.forEach(provider => {
      const matchScore = calculateMatchScore(need, provider);
      
      if (matchScore >= 50) { // Minimum match threshold
        matches.push({
          requesterId: need.businessId,
          providerId: provider.businessId,
          categoryId: need.categoryId,
          matchScore,
          reason: generateMatchReason(need, provider, matchScore),
          estimatedCost: provider.rate * need.estimatedHours,
          estimatedHours: need.estimatedHours,
        });
      }
    });
  });

  // Sort by match score (highest first)
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

// Calculate match score between need and capability
function calculateMatchScore(need: BusinessNeed, capability: BusinessCapability): number {
  let score = 0;

  // Category match (required)
  if (need.categoryId === capability.categoryId) {
    score += 40;
  } else {
    return 0; // No match if categories don't match
  }

  // Budget compatibility (30 points)
  const estimatedCost = capability.rate * need.estimatedHours;
  if (estimatedCost <= need.budget) {
    score += 30;
  } else if (estimatedCost <= need.budget * 1.2) {
    score += 15; // Within 20% of budget
  }

  // Rating/Experience (20 points)
  if (capability.rating >= 4.5) {
    score += 20;
  } else if (capability.rating >= 4.0) {
    score += 15;
  } else if (capability.rating >= 3.5) {
    score += 10;
  }

  // Availability (10 points)
  if (capability.availableHours >= need.estimatedHours) {
    score += 10;
  } else if (capability.availableHours >= need.estimatedHours * 0.8) {
    score += 5;
  }

  return Math.min(100, score);
}

// Generate human-readable match reason
function generateMatchReason(
  need: BusinessNeed,
  capability: BusinessCapability,
  score: number
): string {
  const reasons: string[] = [];

  if (score >= 90) {
    reasons.push('Perfect match');
  } else if (score >= 75) {
    reasons.push('Excellent match');
  } else if (score >= 60) {
    reasons.push('Good match');
  } else {
    reasons.push('Compatible match');
  }

  if (capability.rating >= 4.5) {
    reasons.push('highly rated provider');
  }

  const estimatedCost = capability.rate * need.estimatedHours;
  if (estimatedCost <= need.budget) {
    reasons.push('within budget');
  }

  if (capability.availableHours >= need.estimatedHours) {
    reasons.push('available capacity');
  }

  return reasons.join(', ');
}

// Continuous matching loop (runs periodically)
export class BusinessMatchingEngine {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private onMatchFound: (matches: Match[]) => void;

  constructor(onMatchFound: (matches: Match[]) => void) {
    this.onMatchFound = onMatchFound;
  }

  start(
    businesses: Business[],
    serviceRequests: ServiceRequest[],
    services: Service[],
    reputations: Map<string, { rating: number; totalJobs: number }>,
    intervalMs: number = 30000 // 30 seconds default
  ): void {
    this.stop(); // Clear any existing interval

    // Run immediately
    this.runMatching(businesses, serviceRequests, services, reputations);

    // Then run periodically
    this.intervalId = setInterval(() => {
      this.runMatching(businesses, serviceRequests, services, reputations);
    }, intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private runMatching(
    businesses: Business[],
    serviceRequests: ServiceRequest[],
    services: Service[],
    reputations: Map<string, { rating: number; totalJobs: number }>
  ): void {
    const needs = analyzeBusinessNeeds(businesses, serviceRequests, services);
    const capabilities = analyzeBusinessCapabilities(businesses, services, reputations);
    const matches = matchBusinesses(needs, capabilities);

    if (matches.length > 0) {
      this.onMatchFound(matches);
    }
  }
}


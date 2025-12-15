// Core Types for Centi Flow Platform

export interface Business {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  createdAt: Date;
  reputation: number;
  rating: number;
  totalHoursDelivered: number;
  totalHoursReceived: number;
}

export interface CentiBalance {
  available: number;
  borrowed: number;
  locked: number; // For committed services
  totalEarned: number;
  totalSpent: number;
  lastDecayDate: Date;
}

export interface CentiTransaction {
  id: string;
  businessId: string;
  type: 'earn' | 'spend' | 'borrow' | 'repay' | 'decay' | 'airdrop' | 'bonus';
  amount: number;
  description: string;
  timestamp: Date;
  relatedServiceId?: string;
  relatedBusinessId?: string;
  metadata?: Record<string, unknown>;
}

export interface ServiceCategory {
  id: string;
  name: string;
  centiPerHour: number; // Platform-defined rate
  demandMultiplier: number; // Adjusts based on demand
  standardHours?: number; // Standard hours for a typical service package
}

export interface Service {
  id: string;
  providerId: string;
  categoryId: string;
  title: string;
  description: string;
  centiCost: number; // Calculated: category.centiPerHour * hours * demandMultiplier
  estimatedHours: number;
  status: 'available' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
}

export interface ServiceRequest {
  id: string;
  requesterId: string;
  serviceId: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  requestedAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  rating?: number;
  review?: string;
}

export interface ServiceHour {
  id: string;
  businessId: string;
  serviceRequestId: string;
  type: 'earned' | 'owed' | 'committed';
  hours: number;
  status: 'pending' | 'verified' | 'completed' | 'cancelled';
  createdAt: Date;
  verifiedAt?: Date;
  expiresAt?: Date; // For committed hours
}

export interface BorrowedCenti {
  id: string;
  businessId: string;
  amount: number;
  borrowedAt: Date;
  dueDate: Date;
  interestRate: number; // As extra service hours percentage
  repaymentMethod: 'service_hours' | 'cash' | 'mixed';
  status: 'active' | 'repaid' | 'overdue';
  repaidAmount: number;
  serviceHoursOwed: number; // Interest in service hours
}

export interface Reputation {
  businessId: string;
  score: number; // 0-100
  totalRatings: number;
  averageRating: number; // 1-5
  onTimeCompletionRate: number; // 0-1
  totalJobsCompleted: number;
  totalJobsDelivered: number;
  badges: string[];
}

export interface AdminRule {
  id: string;
  type: 'pricing' | 'decay' | 'borrowing_limit' | 'airdrop';
  categoryId?: string;
  value: number;
  unit: string;
  effectiveDate: Date;
  expiresAt?: Date;
}

export interface ActivityFeedItem {
  id: string;
  businessId: string;
  type: 'transaction' | 'service_completed' | 'rating_received' | 'centi_earned' | 'centi_spent';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}



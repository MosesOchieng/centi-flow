// Micro-Franchise Types

export interface Franchise {
  id: string;
  businessId: string; // Franchise owner
  serviceCategory: string;
  region: string;
  investment: number; // Centi invested
  monthlyReturns: number; // Expected monthly Centi returns
  activeUsers: number; // Number of users in region
  status: 'active' | 'pending' | 'suspended';
  createdAt: Date;
  roi: number; // Return on investment percentage
}

export interface FranchiseInvestment {
  id: string;
  franchiseId: string;
  investorId: string;
  amount: number; // Centi invested
  share: number; // Percentage share
  investedAt: Date;
  totalReturns: number; // Total Centi earned
}


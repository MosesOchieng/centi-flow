// Service Pools Types

export interface ServicePool {
  id: string;
  name: string;
  description: string;
  category: string;
  totalCenti: number; // Total Centi in pool
  contributors: number; // Number of contributors
  accessType: 'contribution_based' | 'need_based' | 'hybrid';
  minContribution: number; // Minimum Centi to contribute
  maxContribution?: number; // Maximum Centi per contributor
  servicesFunded: number; // Number of services funded
  createdAt: Date;
}

export interface PoolContribution {
  id: string;
  poolId: string;
  businessId: string;
  amount: number;
  contributedAt: Date;
}

export interface PoolAccess {
  id: string;
  poolId: string;
  businessId: string;
  accessType: 'contributor' | 'need_based';
  accessLevel: number; // Based on contribution or need assessment
  grantedAt: Date;
}


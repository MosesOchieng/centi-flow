// Barter Hub Types

export interface BarterListing {
  id: string;
  businessId: string;
  title: string;
  description: string;
  category: 'storage' | 'expertise' | 'equipment' | 'space' | 'other';
  centiValue: number; // Estimated Centi value
  availability: 'available' | 'in_use' | 'sold';
  location?: string;
  images?: string[];
  createdAt: Date;
  expiresAt?: Date;
}

export interface BarterTransaction {
  id: string;
  listingId: string;
  providerId: string; // Business offering the resource
  requesterId: string; // Business requesting the resource
  centiEarned: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
}


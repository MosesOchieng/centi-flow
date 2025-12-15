// Task Marketplace Types

export interface MicroTask {
  id: string;
  businessId: string; // Task poster
  title: string;
  description: string;
  category: 'data-entry' | 'research' | 'design' | 'writing' | 'translation' | 'other';
  centiReward: number;
  estimatedTime: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  maxAssignments?: number; // How many people can work on it
  currentAssignments: number;
  createdAt: Date;
  deadline?: Date;
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  workerId: string; // Business completing the task
  status: 'assigned' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: Date;
  approvedAt?: Date;
  centiEarned: number;
}


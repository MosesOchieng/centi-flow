import { create } from 'zustand';
import type { CentiBalance, CentiTransaction, BorrowedCenti } from '@/types';
import { calculateDecay, applyDecay } from '@/utils/centiDecay';
import { getBorrowingRules } from '@/utils/adminRules';

interface WalletState {
  balance: CentiBalance;
  transactions: CentiTransaction[];
  borrowedCenti: BorrowedCenti[];
  
  // Actions
  initializeWallet: (businessId: string) => void;
  addCenti: (amount: number, type: CentiTransaction['type'], description: string, metadata?: Record<string, unknown>) => void;
  spendCenti: (amount: number, description: string, serviceId?: string) => boolean;
  borrowCenti: (amount: number, repaymentMethod: BorrowedCenti['repaymentMethod']) => BorrowedCenti | null;
  repayBorrowed: (borrowId: string, amount: number, method: 'service_hours' | 'cash') => void;
  applyDecayToBalance: () => void;
  getAvailableBalance: () => number;
  getTotalOwed: () => number;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  balance: {
    available: 0,
    borrowed: 0,
    locked: 0,
    totalEarned: 0,
    totalSpent: 0,
    lastDecayDate: new Date()
  },
  transactions: [],
  borrowedCenti: [],

  initializeWallet: (businessId: string) => {
    // Initialize with onboarding airdrop
    const airdropAmount = 100;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 45); // 45 days expiry

    set({
      balance: {
        available: airdropAmount,
        borrowed: 0,
        locked: 0,
        totalEarned: airdropAmount,
        totalSpent: 0,
        lastDecayDate: new Date()
      },
      transactions: [{
        id: `airdrop-${Date.now()}`,
        businessId,
        type: 'airdrop',
        amount: airdropAmount,
        description: 'Onboarding airdrop - expires in 45 days',
        timestamp: new Date(),
        metadata: { expiresAt: expiryDate }
      }]
    });
  },

  addCenti: (amount, type, description, metadata) => {
    const state = get();
    const transaction: CentiTransaction = {
      id: `tx-${Date.now()}-${Math.random()}`,
      businessId: '', // Will be set by caller
      type,
      amount,
      description,
      timestamp: new Date(),
      ...metadata
    };

    set({
      balance: {
        ...state.balance,
        available: state.balance.available + amount,
        totalEarned: state.balance.totalEarned + amount
      },
      transactions: [transaction, ...state.transactions]
    });
  },

  spendCenti: (amount, description, serviceId) => {
    const state = get();
    const available = state.getAvailableBalance();

    if (available < amount) {
      return false;
    }

    const transaction: CentiTransaction = {
      id: `tx-${Date.now()}-${Math.random()}`,
      businessId: '',
      type: 'spend',
      amount: -amount,
      description,
      timestamp: new Date(),
      relatedServiceId: serviceId
    };

    set({
      balance: {
        ...state.balance,
        available: state.balance.available - amount,
        totalSpent: state.balance.totalSpent + amount
      },
      transactions: [transaction, ...state.transactions]
    });

    return true;
  },

  borrowCenti: (amount, repaymentMethod) => {
    const state = get();
    const rules = getBorrowingRules();
    const totalBorrowed = state.borrowedCenti
      .filter(b => b.status === 'active')
      .reduce((sum, b) => sum + b.amount - b.repaidAmount, 0);

    // Check borrowing limits
    if (totalBorrowed + amount > rules.maxBorrowAmount) {
      return null;
    }

    const interestRate = rules.interestRate;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + rules.repaymentPeriodDays);

    const serviceHoursOwed = amount * (interestRate / 100);

    const borrowed: BorrowedCenti = {
      id: `borrow-${Date.now()}`,
      businessId: '',
      amount,
      borrowedAt: new Date(),
      dueDate,
      interestRate,
      repaymentMethod,
      status: 'active',
      repaidAmount: 0,
      serviceHoursOwed
    };

    set({
      balance: {
        ...state.balance,
        available: state.balance.available + amount,
        borrowed: state.balance.borrowed + amount
      },
      borrowedCenti: [...state.borrowedCenti, borrowed],
      transactions: [{
        id: `tx-${Date.now()}-${Math.random()}`,
        businessId: '',
        type: 'borrow',
        amount,
        description: `Borrowed ${amount} Centi - repay by ${dueDate.toLocaleDateString()}`,
        timestamp: new Date()
      }, ...state.transactions]
    });

    return borrowed;
  },

  repayBorrowed: (borrowId, amount, method) => {
    const state = get();
    const borrowed = state.borrowedCenti.find(b => b.id === borrowId);
    
    if (!borrowed || borrowed.status !== 'active') {
      return;
    }

    const newRepaidAmount = borrowed.repaidAmount + amount;
    const isFullyRepaid = newRepaidAmount >= borrowed.amount;

    const updatedBorrowed: BorrowedCenti = {
      ...borrowed,
      repaidAmount: newRepaidAmount,
      status: isFullyRepaid ? 'repaid' : 'active'
    };

    set({
      balance: {
        ...state.balance,
        borrowed: isFullyRepaid 
          ? state.balance.borrowed - borrowed.amount
          : state.balance.borrowed - amount,
        available: method === 'cash' ? state.balance.available : state.balance.available - amount
      },
      borrowedCenti: state.borrowedCenti.map(b => 
        b.id === borrowId ? updatedBorrowed : b
      ),
      transactions: [{
        id: `tx-${Date.now()}-${Math.random()}`,
        businessId: '',
        type: 'repay',
        amount: -amount,
        description: `Repaid ${amount} Centi via ${method}`,
        timestamp: new Date()
      }, ...state.transactions]
    });
  },

  applyDecayToBalance: () => {
    const state = get();
    const daysSinceLastDecay = Math.floor(
      (Date.now() - state.balance.lastDecayDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastDecay >= 1) {
      const decayAmount = calculateDecay(state.balance.available, daysSinceLastDecay);
      
      if (decayAmount > 0) {
        const newBalance = applyDecay(state.balance.available, daysSinceLastDecay);
        
        set({
          balance: {
            ...state.balance,
            available: newBalance,
            lastDecayDate: new Date()
          },
          transactions: [{
            id: `tx-decay-${Date.now()}`,
            businessId: '',
            type: 'decay',
            amount: -decayAmount,
            description: `Centi decay: ${decayAmount.toFixed(2)} Centi lost after ${daysSinceLastDecay} days`,
            timestamp: new Date()
          }, ...state.transactions]
        });
      }
    }
  },

  getAvailableBalance: () => {
    const state = get();
    return Math.max(0, state.balance.available - state.balance.locked);
  },

  getTotalOwed: () => {
    const state = get();
    return state.borrowedCenti
      .filter(b => b.status === 'active')
      .reduce((sum, b) => sum + (b.amount - b.repaidAmount), 0);
  }
}));



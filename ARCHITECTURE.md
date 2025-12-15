# Centi Flow Architecture

## System Overview

Centi Flow is a B2B service exchange platform built as a Progressive Web App (PWA). The system enables businesses to earn, spend, and manage Centi credits—utility points backed by service hours.

## Core Architecture

### Technology Stack
- **Frontend Framework**: React 18 with TypeScript
- **State Management**: Zustand (lightweight, performant)
- **Routing**: React Router v6
- **Build Tool**: Vite
- **PWA**: Vite PWA Plugin with Workbox for offline support
- **Date Handling**: date-fns

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main app layout with navigation
│   └── Layout.css
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard with overview
│   ├── Wallet.tsx      # Centi wallet management
│   ├── Marketplace.tsx # Service marketplace
│   ├── ServiceHours.tsx # Service hour ledger
│   ├── ActivityFeed.tsx # Activity timeline
│   ├── Login.tsx       # Authentication
│   └── Register.tsx
├── store/              # Zustand state stores
│   ├── authStore.ts    # Authentication & business info
│   ├── walletStore.ts  # Centi wallet operations
│   ├── marketplaceStore.ts # Service marketplace
│   ├── serviceHourStore.ts  # Service hour tracking
│   ├── reputationStore.ts  # Reputation & ratings
│   └── activityStore.ts    # Activity feed
├── types/              # TypeScript definitions
│   └── index.ts
├── utils/              # Utility functions
│   ├── centiDecay.ts   # Decay calculations
│   └── adminRules.ts   # Admin rules & pricing
└── App.tsx             # Main app component
```

## Core Modules

### 1. Business Wallet (`walletStore.ts`)

**Purpose**: Manages Centi balance, transactions, and borrowing.

**Key Features**:
- Balance tracking (available, borrowed, locked)
- Transaction history
- Borrowing with interest
- Decay application
- Onboarding airdrop (100 Centi, expires in 45 days)

**Key Functions**:
- `initializeWallet()` - Sets up wallet with airdrop
- `addCenti()` - Add Centi (earn, bonus, etc.)
- `spendCenti()` - Spend Centi for services
- `borrowCenti()` - Borrow Centi with repayment tracking
- `applyDecayToBalance()` - Apply daily decay to prevent hoarding
- `getAvailableBalance()` - Get spendable balance
- `getTotalOwed()` - Calculate total borrowed amount

### 2. Service Marketplace (`marketplaceStore.ts`)

**Purpose**: Browse, create, and request business services.

**Key Features**:
- Service listing with categories
- Search and filtering
- Service creation
- Service requests
- Status tracking (available, in_progress, completed)

**Service Categories** (default rates):
- Graphic Design: 5 Centi/hour
- Web Development: 8 Centi/hour
- Marketing Strategy: 7 Centi/hour
- Legal Review: 10 Centi/hour
- Accounting: 6 Centi/hour

### 3. Service Hour Ledger (`serviceHourStore.ts`)

**Purpose**: Track service hours as first-class objects.

**Key Features**:
- Hours earned (verified deliveries)
- Hours owed (to be delivered)
- Hours committed (future commitments)
- Verification system

**Key Functions**:
- `recordEarnedHours()` - Record verified service delivery
- `recordOwedHours()` - Record service debt
- `recordCommittedHours()` - Record future commitments
- `verifyHours()` - Verify service delivery
- `getTotalHours()` - Get summary of all hours

### 4. Borrowing Engine (integrated in `walletStore.ts`)

**Purpose**: Enable businesses to borrow Centi early.

**Rules**:
- Max borrow: 500 Centi
- Interest: 12.5% (paid in service hours)
- Repayment period: 30 days
- Repayment methods: service hours or cash

**Flow**:
1. Business requests to borrow Centi
2. System checks borrowing limits
3. Centi added to balance
4. Interest calculated as service hours
5. Repayment tracked until complete

### 5. Reputation System (`reputationStore.ts`)

**Purpose**: Track business reputation and ratings.

**Components**:
- Reputation score (0-100)
- Average rating (1-5 stars)
- On-time completion rate
- Job volume metrics
- Badges for achievements

**Score Calculation**:
- Rating: 0-40 points
- On-time completion: 0-30 points
- Job volume: 0-20 points
- Badges: 0-10 points

### 6. Admin Rules Engine (`adminRules.ts`)

**Purpose**: Centralized configuration for platform rules.

**Configurable Rules**:
- Service category pricing
- Decay rates (default: 0.1% per day)
- Borrowing limits
- Airdrop amounts
- Demand multipliers

### 7. Activity Feed (`activityStore.ts`)

**Purpose**: Track and display platform activity.

**Activity Types**:
- Transactions (earn, spend, borrow, repay)
- Service completions
- Ratings received
- Centi earned/spent

## Data Flow

### Earning Centi Flow

1. Business delivers service
2. Service hours recorded in ledger
3. Hours verified
4. Centi added to wallet based on category rate
5. Activity logged
6. Reputation updated

### Spending Centi Flow

1. Business browses marketplace
2. Selects service
3. System checks available balance
4. If insufficient, can borrow
5. Centi deducted from wallet
6. Service request created
7. Provider accepts and delivers
8. Service hours transferred
9. Activity logged

### Borrowing Flow

1. Business requests to borrow Centi
2. System checks limits and eligibility
3. Centi added to balance
4. Interest calculated (service hours)
5. Repayment tracked
6. On repayment, debt reduced
7. Activity logged

## Key Mechanics

### Centi Decay

**Purpose**: Prevent hoarding, encourage spending

**Implementation**:
- Daily decay rate: 0.1% (configurable)
- Applied to unused balance
- Compound decay over time
- Example: 100 Centi unused for 90 days → ~90 Centi

### Service Hours as First-Class Objects

Every Centi transaction is backed by:
- Logged service hours
- Verified delivery
- Time-based valuation

This enables:
- Borrowing (future service commitment)
- Trust without cash
- Multi-party service flow

### Airdrop System

**Onboarding Airdrop**:
- Amount: 100 Centi
- Expiry: 45 days
- Non-transferable
- Non-cashable
- Purpose: Let businesses try services, prevent hoarding

## UI/UX Design

### Mobile-First PWA
- Responsive design
- Offline support (queues actions)
- App-like experience
- No App Store required

### Dashboard
- Wallet overview
- Service hours summary
- Reputation display
- Recent activity

### Navigation
- Sidebar navigation (desktop)
- Bottom navigation (mobile)
- Clear visual hierarchy

## Future Enhancements

1. **Backend Integration**: Connect to API for persistence
2. **Real-time Updates**: WebSocket for live activity
3. **Advanced Analytics**: Business insights and trends
4. **Multi-currency**: Support for different service markets
5. **Escrow System**: Secure service delivery
6. **Dispute Resolution**: Handle service conflicts
7. **Notifications**: Push notifications for important events
8. **Export/Import**: Data portability

## Security Considerations

1. **Authentication**: Business account verification
2. **Authorization**: Role-based access control
3. **Data Validation**: Input sanitization
4. **Rate Limiting**: Prevent abuse
5. **Audit Trail**: Complete transaction history

## Performance Optimizations

1. **State Management**: Zustand for minimal re-renders
2. **Code Splitting**: Route-based lazy loading
3. **PWA Caching**: Offline-first strategy
4. **Optimistic Updates**: Immediate UI feedback
5. **Debouncing**: Search and filter inputs



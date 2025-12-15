# Quick Start Guide

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## First Steps

### 1. Register a Business Account

1. Navigate to the registration page
2. Enter your business name, email, and password
3. You'll automatically receive 100 Centi as an onboarding airdrop
4. Note: Airdrop Centi expires in 45 days

### 2. Explore the Dashboard

- **Wallet**: View your Centi balance, transactions, and borrowing status
- **Marketplace**: Browse available services or offer your own
- **Service Hours**: Track hours earned, owed, and committed
- **Activity Feed**: See all platform activity

### 3. Offer a Service

1. Go to Marketplace
2. Click "Offer Service"
3. Fill in service details:
   - Title and description
   - Category (determines Centi/hour rate)
   - Estimated hours
4. Your service will appear in the marketplace

### 4. Request a Service

1. Browse the marketplace
2. Find a service you need
3. Click "Request Service"
4. Centi will be deducted from your wallet
5. Service provider will be notified

### 5. Borrow Centi (if needed)

1. Go to Wallet
2. Click "Borrow Centi"
3. Enter amount (max 500 Centi)
4. Repay with service hours or cash within 30 days
5. Interest: 12.5% (paid in service hours)

## Key Features to Try

### Service Hour Tracking
- Every service delivery creates service hour records
- Hours can be earned, owed, or committed
- This backs all Centi transactions

### Reputation System
- Earn reputation by completing jobs on time
- Get rated by service recipients
- Build your business profile

### Centi Decay
- Unused Centi loses 0.1% value per day
- Encourages active participation
- Prevents hoarding

## Development Tips

### State Management
- All state is managed with Zustand stores
- Stores are in `src/store/`
- Each module has its own store

### Adding New Service Categories
Edit `src/utils/adminRules.ts`:
```typescript
export const DEFAULT_SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 'new-category', name: 'New Category', centiPerHour: 5, demandMultiplier: 1.0 },
  // ...
];
```

### Modifying Decay Rates
Edit `src/utils/adminRules.ts`:
```typescript
{
  id: 'decay-rule',
  type: 'decay',
  value: 0.1, // Change this value (percentage per day)
  // ...
}
```

### Customizing Borrowing Rules
Edit `src/utils/adminRules.ts`:
```typescript
export function getBorrowingRules() {
  return {
    maxBorrowAmount: 500, // Change max borrow
    interestRate: 12.5,    // Change interest rate
    repaymentPeriodDays: 30, // Change repayment period
  };
}
```

## Building for Production

```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

The built files will be in the `dist/` directory.

## PWA Features

The app is a Progressive Web App:
- Installable on mobile devices
- Works offline (with queued actions)
- App-like experience
- No App Store required

To install:
1. Open the app in a mobile browser
2. Look for "Add to Home Screen" prompt
3. Or use browser menu → "Install App"

## Troubleshooting

### Port Already in Use
If port 5173 is taken, Vite will automatically use the next available port.

### Type Errors
Run `npm run lint` to check for TypeScript errors.

### Build Errors
Clear `node_modules` and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. **Backend Integration**: Connect to a real API
2. **Database**: Add persistence layer
3. **Authentication**: Implement proper auth flow
4. **Real-time**: Add WebSocket support
5. **Testing**: Add unit and integration tests


# Centi Flow - B2B Service Exchange Platform

A Progressive Web App (PWA) where businesses earn, spend, and manage Centi credits—similar to Bonga Points—but for real business services.

## Overview

Centi Flow is a B2B service exchange platform that enables businesses to:
- Earn Centi by delivering services
- Spend Centi to access professional services
- Borrow Centi to access services early
- Track service hours as first-class objects
- Build reputation through quality service delivery

## Key Features

### Core Modules

1. **Business Wallet** - Centi balance management with decay and expiry tracking
2. **Service Marketplace** - Browse, search, and request business services
3. **Service Hour Ledger** - Track hours earned, owed, and committed
4. **Borrowing Engine** - Borrow Centi with service hour repayment
5. **Reputation System** - Ratings, badges, and reputation scores
6. **Activity Feed** - Real-time activity tracking
7. **Admin Rules Engine** - Configurable pricing, decay rates, and limits

### Centi Mechanics

- **Earning**: Onboarding airdrop (100 Centi, expires in 45 days), service delivery, ecosystem contributions
- **Spending**: Access services priced in Centi based on category and hours
- **Borrowing**: Borrow Centi with interest paid in service hours
- **Decay**: Unused Centi loses value over time (anti-hoarding)
- **Service Hours**: Every transaction backed by verified service hours

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **State Management**: Zustand
- **Routing**: React Router v6
- **Build Tool**: Vite
- **PWA**: Vite PWA Plugin with Workbox
- **Styling**: CSS Modules

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Page components
├── store/           # Zustand state management
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── App.tsx          # Main app component
```

## Key Concepts

### Centi = Business Utility Points

1 Centi = 1 unit of verified business effort or value
- Represents: Time, Skill, Capacity, Contribution
- NOT cash, but utility credit for services

### Service Pricing

Services are priced based on:
- Category (e.g., Graphic Design = 5 Centi/hour)
- Estimated hours
- Demand multiplier

### Service Hours Ledger

Every business tracks:
- **Hours Earned**: Verified service hours delivered
- **Hours Owed**: Service hours to be delivered
- **Hours Committed**: Future service commitments

## Development

The app uses:
- **Zustand** for lightweight state management
- **React Router** for navigation
- **Date-fns** for date formatting
- **Vite PWA** for offline support

## License

MIT



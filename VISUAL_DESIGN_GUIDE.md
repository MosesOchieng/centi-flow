# Centi Flow - Visual Design Guide

## Logo Integration

### Logo Specifications
- **File**: `1735912600698.jpeg`
- **Dimensions**: 200x200px
- **Format**: JPEG
- **Usage**: Primary brand identifier

### Logo Placement

#### 1. Navbar (Desktop & Mobile)
```
┌─────────────────────────────────────┐
│ [Logo] Centi Flow    [User] [Logout]│
└─────────────────────────────────────┘
```
- **Size**: 32px height (desktop), 24-28px (mobile)
- **Position**: Left side, before brand name
- **Spacing**: 0.75rem gap between logo and text

#### 2. Authentication Pages
```
        ┌─────────────┐
        │   [Logo]    │
        │             │
        │ Centi Flow  │
        │   Subtitle  │
        └─────────────┘
```
- **Size**: 80px (desktop), 56-64px (mobile)
- **Position**: Center, above title
- **Style**: Rounded corners (16px), subtle shadow

## Color System

### Primary Palette (Based on Logo Colors)
The logo colors inform the entire design system:

#### Brand Colors
- **Primary Blue**: `#3b82f6` - Main brand color
- **Primary Dark**: `#2563eb` - Hover states, gradients
- **Primary Light**: `#60a5fa` - Highlights, accents

#### Background Gradient
```
┌─────────────────────────────────┐
│  #0f172a → #1e293b → #334155    │
│  (Dark slate gradient)          │
└─────────────────────────────────┘
```

#### Glassmorphism Surfaces
- **Base**: `rgba(30, 41, 59, 0.6)` - 60% opacity
- **Border**: `rgba(59, 130, 246, 0.2)` - 20% opacity blue
- **Blur**: `backdrop-filter: blur(10px)`

## Component Design

### Navigation Bar
```
┌──────────────────────────────────────────────┐
│ [Logo] Centi Flow    Business Name  [Logout] │
│ ──────────────────────────────────────────── │
│ Gradient: #3b82f6 → #2563eb → #1e40af      │
│ Shadow: Blue glow effect                     │
└──────────────────────────────────────────────┘
```

### Sidebar Navigation (Desktop)
```
┌──────────┐
│ 📊 Dash  │ ← Active (blue gradient bg)
│ 💳 Wallet│
│ 🛒 Market│
│ ⏱️ Hours │
│ 📋 Activity│
└──────────┘
```

### Bottom Navigation (Mobile)
```
┌─────────────────────────────────┐
│ 📊  💳  🛒  ⏱️  📋              │
│ Dash Wallet Market Hours Activity│
└─────────────────────────────────┘
Fixed bottom, glassmorphic background
```

### Card Design
```
┌─────────────────────────────┐
│  Card Title                 │
│  ─────────────────────────  │
│                             │
│  Content area with          │
│  glassmorphic background    │
│                             │
│  ─────────────────────────  │
│  Footer/actions             │
└─────────────────────────────┘

Background: rgba(30, 41, 59, 0.6)
Border: rgba(59, 130, 246, 0.2)
Shadow: Blue-tinted glow
Border-radius: 16px
```

### Button Styles

#### Primary Button
```
┌──────────────────┐
│   Primary Action │
└──────────────────┘
Gradient: #3b82f6 → #2563eb
Shadow: Blue glow
Hover: Lift + brighter glow
```

#### Secondary Button
```
┌──────────────────┐
│  Secondary Action│
└──────────────────┘
Background: rgba(30, 41, 59, 0.6)
Border: rgba(59, 130, 246, 0.3)
Hover: Brighter border
```

## Typography Hierarchy

### Page Titles
```
Centi Flow
──────────
Size: 2.5rem (40px)
Weight: 700
Color: Gradient (#60a5fa → #3b82f6)
```

### Section Headers
```
Section Title
─────────────
Size: 1.75rem (28px)
Weight: 600
Color: Gradient (#60a5fa → #3b82f6)
```

### Body Text
```
Regular body text content
─────────────────────────
Size: 1rem (16px)
Weight: 400
Color: #e2e8f0 (primary text)
```

## Layout Structure

### Dashboard Layout
```
┌─────────────────────────────────────┐
│  Navbar                             │
├──────────┬──────────────────────────┤
│          │  ┌────────┐ ┌────────┐  │
│ Sidebar  │  │ Card 1  │ │ Card 2 │  │
│          │  └────────┘ └────────┘  │
│          │  ┌────────┐ ┌────────┐  │
│          │  │ Card 3  │ │ Card 4 │  │
│          │  └────────┘ └────────┘  │
└──────────┴──────────────────────────┘
```

### Mobile Layout
```
┌─────────────────────┐
│  Navbar (compact)   │
├─────────────────────┤
│                     │
│  ┌───────────────┐  │
│  │   Card 1      │  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │   Card 2      │  │
│  └───────────────┘  │
│                     │
├─────────────────────┤
│ 📊 💳 🛒 ⏱️ 📋     │ ← Bottom Nav
└─────────────────────┘
```

## Interactive States

### Hover States
- **Cards**: Lift 4px, brighter glow
- **Buttons**: Scale 1.02, brighter gradient
- **Links**: Color shift to #93c5fd

### Active States
- **Navigation**: Blue gradient background
- **Buttons**: Pressed effect (darker)
- **Inputs**: Blue border glow

### Focus States
- **Inputs**: Blue ring (3px, 20% opacity)
- **Buttons**: Enhanced shadow
- **Links**: Underline + color change

## Spacing System

### Grid Units (4px base)
```
xs:  4px  ──┐
sm:  8px  ──┤
md:  16px ──┼─ Common spacing
lg:  24px ──┤
xl:  32px ──┘
```

### Component Spacing
- **Card Padding**: 2rem (32px)
- **Section Gap**: 1.5rem (24px)
- **Element Gap**: 1rem (16px)
- **Tight Gap**: 0.5rem (8px)

## Shadow System

### Elevation Levels
```
Level 1: Subtle
  ┌─────┐
  │     │ ← 0 1px 3px rgba(0,0,0,0.1)
  └─────┘

Level 2: Cards
  ┌─────┐
  │     │ ← 0 4px 6px + blue glow
  └─────┘

Level 3: Hover
  ┌─────┐
  │     │ ← 0 8px 12px + brighter glow
  └─────┘

Level 4: Modals
  ┌─────┐
  │     │ ← 0 20px 25px + strong glow
  └─────┘
```

## Responsive Breakpoints

### Desktop (> 1024px)
- Full sidebar navigation
- Multi-column grids
- Spacious padding

### Tablet (768px - 1024px)
- Narrower sidebar
- 2-column grids
- Adjusted spacing

### Mobile (480px - 768px)
- Bottom navigation
- Single column
- Compact spacing

### Small Mobile (< 480px)
- Minimal navigation
- Stacked layouts
- Tight spacing

## Animation Principles

### Transitions
- **Default**: 0.3s ease
- **Fast**: 0.2s ease (hover)
- **Smooth**: 0.5s ease (complex)

### Effects
- **Lift**: translateY(-4px)
- **Glow**: Increased shadow intensity
- **Fade**: opacity transitions
- **Scale**: transform scale(1.02)

## Brand Consistency

### Logo Usage Rules
1. Always maintain aspect ratio
2. Minimum size: 24px
3. Use rounded corners (6-16px)
4. Add subtle shadow for depth
5. Maintain spacing from text (0.75rem)

### Color Application
1. Primary blue for all interactive elements
2. Gradient text for headings
3. Glassmorphism for depth
4. Blue glow for emphasis
5. Consistent opacity levels

## Accessibility

### Contrast Ratios
- **Text on Dark**: 4.5:1 minimum
- **Interactive Elements**: 3:1 minimum
- **Focus Indicators**: High visibility

### Touch Targets
- **Minimum Size**: 44x44px
- **Spacing**: 8px between targets
- **Mobile Optimized**: Thumb-friendly zones

## Implementation Notes

### CSS Variables (Recommended)
```css
:root {
  --primary-blue: #3b82f6;
  --primary-dark: #2563eb;
  --primary-light: #60a5fa;
  --bg-dark: #0f172a;
  --bg-surface: rgba(30, 41, 59, 0.6);
  --text-primary: #e2e8f0;
  --text-secondary: #cbd5e1;
}
```

### Logo Integration
- Use `<img>` tag with proper alt text
- Responsive sizing with CSS
- Lazy loading for performance
- Fallback for missing images

This design guide ensures consistency across all screens and devices while maintaining the brand identity established by the logo.


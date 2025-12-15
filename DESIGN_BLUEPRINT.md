# Centi Flow - Design Blueprint

## Logo Integration
- **Logo File**: `public/1735912600698.jpeg`
- **Usage**: Primary branding element in navbar and authentication pages

## Color Palette (Based on Logo)

### Primary Colors
- **Primary Blue**: `#3b82f6` - Main brand color, buttons, accents
- **Primary Dark**: `#2563eb` - Hover states, gradients
- **Primary Light**: `#60a5fa` - Highlights, text gradients

### Background Colors
- **Dark Base**: `#0f172a` - Main background
- **Dark Surface**: `#1e293b` - Card backgrounds
- **Dark Elevated**: `#334155` - Elevated surfaces

### Text Colors
- **Primary Text**: `#e2e8f0` - Main text
- **Secondary Text**: `#cbd5e1` - Secondary text
- **Tertiary Text**: `#94a3b8` - Muted text
- **Placeholder**: `#64748b` - Input placeholders

### Accent Colors
- **Success**: `#10b981` - Positive actions, earned hours
- **Warning**: `#f59e0b` - Warnings, borrowed amounts
- **Error**: `#ef4444` - Errors, negative amounts
- **Info**: `#3b82f6` - Information, links

### Glassmorphism
- **Glass Background**: `rgba(30, 41, 59, 0.6)` - Card backgrounds
- **Glass Border**: `rgba(59, 130, 246, 0.2)` - Card borders
- **Glass Blur**: `backdrop-filter: blur(10px)` - Blur effect

## Typography

### Font Family
- **Primary**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`

### Font Sizes
- **H1**: `2.5rem` (40px) - Page titles
- **H2**: `1.75rem` (28px) - Section titles
- **H3**: `1.375rem` (22px) - Card titles
- **Body**: `1rem` (16px) - Default text
- **Small**: `0.875rem` (14px) - Secondary text
- **Tiny**: `0.75rem` (12px) - Labels, timestamps

### Font Weights
- **Bold**: `700` - Headings, important text
- **Semi-bold**: `600` - Subheadings
- **Medium**: `500` - Labels, buttons
- **Regular**: `400` - Body text

## Spacing System

### Base Unit: 0.25rem (4px)

- **xs**: `0.25rem` (4px)
- **sm**: `0.5rem` (8px)
- **md**: `1rem` (16px)
- **lg**: `1.5rem` (24px)
- **xl**: `2rem` (32px)
- **2xl**: `2.5rem` (40px)
- **3xl**: `3rem` (48px)

## Border Radius

- **Small**: `8px` - Small elements
- **Medium**: `10px` - Buttons, inputs
- **Large**: `12px` - Cards
- **XLarge**: `16px` - Main containers
- **Full**: `50%` - Circular elements

## Shadows

### Elevation Levels
- **Level 1**: `0 1px 3px rgba(0, 0, 0, 0.1)` - Subtle elevation
- **Level 2**: `0 4px 6px rgba(0, 0, 0, 0.3), 0 0 20px rgba(59, 130, 246, 0.1)` - Cards
- **Level 3**: `0 8px 12px rgba(0, 0, 0, 0.4), 0 0 30px rgba(59, 130, 246, 0.2)` - Hover states
- **Level 4**: `0 20px 25px rgba(0, 0, 0, 0.5), 0 0 40px rgba(59, 130, 246, 0.2)` - Modals

## Components

### Buttons

#### Primary Button
```css
background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
color: white;
padding: 0.875rem 1.75rem;
border-radius: 10px;
font-weight: 600;
box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
```

#### Secondary Button
```css
background: rgba(30, 41, 59, 0.6);
color: #cbd5e1;
border: 1px solid rgba(59, 130, 246, 0.3);
padding: 0.875rem 1.75rem;
border-radius: 10px;
```

### Cards
```css
background: rgba(30, 41, 59, 0.6);
backdrop-filter: blur(10px);
border-radius: 16px;
border: 1px solid rgba(59, 130, 246, 0.2);
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3), 0 0 20px rgba(59, 130, 246, 0.1);
```

### Inputs
```css
background: rgba(15, 23, 42, 0.6);
border: 1px solid rgba(59, 130, 246, 0.3);
border-radius: 10px;
color: #e2e8f0;
padding: 0.875rem;
```

## Layout

### Grid System
- **Desktop**: Multi-column grid (auto-fit, minmax 300px)
- **Tablet**: 2-column grid
- **Mobile**: Single column

### Container Widths
- **Max Content**: `1400px` - Main content
- **Medium**: `1200px` - Secondary content
- **Small**: `800px` - Forms, timelines

## Animations

### Transitions
- **Default**: `0.3s ease` - General transitions
- **Fast**: `0.2s ease` - Hover states
- **Slow**: `0.5s ease` - Complex animations

### Hover Effects
- **Lift**: `translateY(-4px)` - Cards
- **Scale**: `scale(1.02)` - Buttons
- **Glow**: Increased box-shadow with blue tint

## Mobile Responsive

### Breakpoints
- **Desktop**: `> 1024px`
- **Tablet**: `768px - 1024px`
- **Mobile**: `480px - 768px`
- **Small Mobile**: `< 480px`

### Mobile Features
- Bottom navigation bar
- Touch-friendly targets (min 44x44px)
- Optimized spacing
- Single-column layouts

## Logo Usage

### Placement
1. **Navbar**: Left side, before brand name
2. **Auth Pages**: Center, above form
3. **Favicon**: Browser tab icon

### Sizing
- **Navbar**: `32px` height
- **Auth**: `80px` height
- **Favicon**: `32x32px`

## Design Principles

1. **Dark First**: Dark theme optimized for low-light environments
2. **Glassmorphism**: Modern glass-like effects for depth
3. **Gradient Accents**: Blue gradients for visual interest
4. **Consistent Spacing**: 4px base unit system
5. **Touch-Friendly**: Minimum 44px touch targets
6. **Accessibility**: High contrast, readable fonts
7. **Performance**: Optimized animations and effects

## Brand Identity

- **Professional**: Clean, modern design
- **Trustworthy**: Consistent, polished interface
- **Innovative**: Glassmorphism, gradients
- **Accessible**: Mobile-first, responsive
- **Efficient**: Fast, smooth interactions


# Market Morning — Watercolor Edition Implementation

## Overview
Successfully implemented the "Market Morning — Watercolor Edition" color system across Recipe Lab. The system transforms the previous blue-gray palette into a warm, food-forward watercolor aesthetic.

## Core Changes

### 1. Color Tokens (`globals.css`)

#### Light Mode
- **Neutrals (paper/linen):**
  - `--bg: 38 18% 97%` (warm off-white)
  - `--surface-1: 38 15% 99%` (near-white with warmth)
  - `--surface-2: 36 14% 95%` (soft warm gray)
  - `--text: 28 18% 14%` (warm dark brown)
  - `--muted: 30 10% 50%` (warm medium gray)
  - `--border: 34 10% 88%` (soft warm border)

- **Primary Accent (Heat/CTA):**
  - `--accent: 28 85% 50%` (vibrant orange)
  - `--accent-soft: 28 85% 50% / 0.18` (semi-transparent wash)
  - `--accent-foreground: 0 0% 100%` (white text)

- **Food Personality Accents (NON-CTA):**
  - `--tomato: 6 65% 52%` (warm red)
  - `--tomato-soft: 6 65% 52% / 0.16` (tomato wash)
  - `--leaf: 120 22% 42%` (muted green)
  - `--leaf-soft: 120 22% 42% / 0.14` (leaf wash)

#### Dark Mode
- **Neutrals (ink/evening kitchen):**
  - `--bg: 30 16% 7%` (warm dark brown)
  - `--surface-1: 30 14% 10%` (slightly lighter warm dark)
  - `--surface-2: 28 14% 14%` (elevated warm surface)
  - `--text: 38 28% 94%` (warm off-white)
  - `--muted: 30 10% 70%` (warm light gray)
  - `--border: 28 12% 22%` (warm dark border)

- **Accents (adjusted for dark mode):**
  - `--accent: 28 80% 55%` (slightly brighter orange)
  - `--accent-soft: 28 80% 55% / 0.22`
  - `--tomato: 6 72% 60%`
  - `--tomato-soft: 6 72% 60% / 0.20`
  - `--leaf: 120 26% 54%`
  - `--leaf-soft: 120 26% 54% / 0.18`

### 2. Watercolor Gradients

**AI/Feature Backgrounds:**
- Light: `linear-gradient(160deg, hsl(38 22% 98%) 0%, hsl(30 30% 96%) 42%, hsl(42 18% 95%) 100%)`
- Dark: `linear-gradient(160deg, hsl(30 18% 6%) 0%, hsl(24 22% 10%) 45%, hsl(28 16% 9%) 100%)`

### 3. Component Updates

#### Button (`src/components/ui/Button.tsx`)
- **Primary variant:** Now uses `bg-accent-soft` by default
- **Hover state:** Transitions to full `bg-accent` with white text
- Follows watercolor principle: soft wash → full saturation on interaction

#### Card (`src/components/ui/Card.tsx`)
- Replaced flat white background with subtle gradient: `bg-gradient-to-br from-surface-1 via-surface-1 to-surface-2/50`
- Softer borders: `border-border/60` (reduced opacity)
- Creates watercolor paper texture effect

#### PigmentCloud (`src/components/landing/PigmentCloud.tsx`)
**NEW COMPONENT** - Replaces `GradientOrb`

Three watercolor wash variants:
- **Orange Wash:** `from-[hsl(28_85%_55%/0.20)] via-[hsl(36_80%_60%/0.12)] to-transparent`
- **Tomato Blush:** `from-[hsl(6_70%_55%/0.18)] via-[hsl(12_65%_52%/0.10)] to-transparent`
- **Leaf Wash:** `from-[hsl(120_25%_50%/0.16)] via-[hsl(95_22%_48%/0.08)] to-transparent`

Usage: One pigment cloud per screen maximum, large and blurred, partially off-canvas

### 4. Landing Page Components

All landing sections updated:

#### HeroSection
- Warm gradient overlay: `from-accent/5 via-accent/0 to-transparent`

#### HowItWorksSection
- Orange PigmentCloud (top right)
- Chips use `bg-accent-soft` with watercolor tokens

#### AssembleDemoSection
- Tomato PigmentCloud (top left)
- Component tiles use watercolor color mapping:
  - Orange/Accent → `bg-accent-soft`
  - Brown → `bg-leaf-soft`
  - Red → `bg-tomato-soft`

#### InsightSection
- Leaf PigmentCloud (top left)
- Traditional flow uses `bg-tomato-soft` (problems)
- Recipe Lab flow uses `bg-accent-soft` (solutions)

#### FinalCTASection
- Large orange PigmentCloud (top right)

#### ComponentChipSet
- All chips updated to use watercolor tokens
- Soft fills by default, no solid saturated blocks

## Design Principles Applied

✅ **Color edges are soft and diffused** - All borders use reduced opacity (e.g., `/40`, `/60`)
✅ **Accent colors default to semi-transparent washes** - `accent-soft`, `tomato-soft`, `leaf-soft`
✅ **Full saturation on interaction** - Buttons transition from soft to full on hover
✅ **Gradients behave like watercolor washes** - Subtle, multi-stop gradients with low opacity
✅ **No purple, no blue, no neon** - Removed all blue/purple orbs, replaced with warm tones
✅ **Orange is the ONLY primary CTA color** - All primary buttons use orange accent
✅ **Tomato and Leaf are personality accents only** - Never used for CTAs
✅ **One decorative pigment cloud per screen** - Each section has max one PigmentCloud

## Files Modified

### Core System
- `src/app/globals.css` - Color tokens, gradients, theme mapping

### Components
- `src/components/ui/Button.tsx` - Watercolor button states
- `src/components/ui/Card.tsx` - Gradient paper texture
- `src/components/landing/PigmentCloud.tsx` - NEW: Watercolor decorative clouds
- `src/components/landing/ComponentChipSet.tsx` - Watercolor chip colors
- `src/components/landing/HeroSection.tsx` - Warm gradient overlay
- `src/components/landing/HowItWorksSection.tsx` - Orange cloud, updated chips
- `src/components/landing/AssembleDemoSection.tsx` - Tomato cloud, watercolor tiles
- `src/components/landing/InsightSection.tsx` - Leaf cloud, watercolor flow cards
- `src/components/landing/FinalCTASection.tsx` - Orange cloud

## Usage Guidelines

### For Future Development

**Buttons:**
- Always use `variant="primary"` for CTAs (orange only)
- Default state: soft wash background
- Hover: full accent color

**Tags/Chips:**
- Use `bg-accent-soft` for primary tags
- Use `bg-tomato-soft` for featured/love indicators
- Use `bg-leaf-soft` for ingredient/nutrition indicators
- Never use solid color blocks

**Cards:**
- Cards automatically have watercolor gradient
- Borders are soft (`border-border/60`)
- No flat white backgrounds

**Decorative Elements:**
- Maximum ONE PigmentCloud per screen
- Position partially off-canvas
- Use `blur-3xl` for watercolor diffusion
- Colors: orange (primary), tomato (featured), leaf (fresh)

## Testing Recommendations

1. **Visual verification:** Check landing page for warm, cohesive watercolor aesthetic
2. **Interaction testing:** Verify buttons transition from soft to full saturation on hover
3. **Dark mode:** Confirm all colors work in both light and dark themes
4. **Accessibility:** Ensure text contrast meets WCAG standards with new warm neutrals
5. **Recipe pages:** Verify tags and chips use watercolor tokens throughout

## Notes

- The system maintains semantic meaning: orange = action, tomato = featured, leaf = fresh
- All color values use HSL for easy adjustment
- Soft variants use alpha transparency for layering
- The warm neutral palette creates a food-forward, tactile feel
- Gradients are subtle and support content rather than dominate

# Component Reference

React components for building the portfolio UI.

## Section Components

Major sections that compose the portfolio page.

### Hero

Landing section with avatar, name, title, and CTAs.

**Config source:** `content.json` → `hero`

**Features:**

- Profile avatar with fallback initials
- Value pills with dynamic labels
- Quick stats with animated counters
- Primary/secondary CTA buttons
- Status badge

### LeadershipHighlights (Metrics)

Animated metrics with flip card interactions.

**Config source:** `content.json` → `metrics`

**Features:**

- Animated counters on scroll
- Flip cards revealing detailed back content
- Progress rings for metrics with `max` value
- Links to achievement details

### Experience

Professional experience timeline.

**Config source:** `content.json` → `experience`

**Features:**

- Expandable cards with highlights
- Tech stack badges
- Client lists
- Period display (current indicator)

### Skills

Skill categories with badges and context popovers.

**Config source:** `content.json` → `skillCategories`

**Features:**

- Category grouping with icons
- Skill level indicators
- Years of experience display
- Context popovers with details
- Optional summary bar

### Competencies (Achievements)

Achievement cards in a grid layout.

**Config source:** `content.json` → `achievements`

**Features:**

- Category grouping
- Impact metrics
- Summary with template variable support
- Tags display

### Contact

Contact section with social links.

**Config source:** `site.json` → `social` + `content.json` → `contact`

**Features:**

- Email with copy-to-clipboard
- LinkedIn link
- Location display
- Custom CTA text

### Navigation

Fixed header with scroll behavior.

**Config source:** `site.json` → `navigation`

**Features:**

- Smooth scroll navigation
- Active section detection
- Branding display
- Theme/design toggles

## UI Components (shadcn/ui)

Primitive components from shadcn/ui in `src/components/ui/`.

| Component      | File                | Usage                           |
| -------------- | ------------------- | ------------------------------- |
| `Button`       | `button.tsx`        | Actions with CVA variants       |
| `Card`         | `card.tsx`          | Content containers              |
| `Badge`        | `badge.tsx`         | Labels and tags                 |
| `FlipCard`     | `flip-card.tsx`     | Metrics with front/back content |
| `Avatar`       | `avatar.tsx`        | Profile images with fallback    |
| `Accordion`    | `accordion.tsx`     | Expandable content              |
| `Popover`      | `popover.tsx`       | Skill context popups            |
| `Tooltip`      | `tooltip.tsx`       | Hover information               |
| `Select`       | `select.tsx`        | Dropdowns                       |
| `Slider`       | `slider.tsx`        | Temperature control             |
| `Switch`       | `switch.tsx`        | Toggle controls                 |
| `Sheet`        | `sheet.tsx`         | Slide-out panels                |
| `Separator`    | `separator.tsx`     | Visual dividers                 |
| `ProgressRing` | `progress-ring.tsx` | Circular progress               |

### Button Variants

```tsx
import { Button } from '@/components/ui/button'

<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

### Card Usage

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
;<Card className="shadow-card hover:shadow-card-hover">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

## Theme Components

Components for theme and design system control.

### ThemeToggle

Dark/light/system mode switcher.

```tsx
import { ThemeToggle } from '@/components/ThemeToggle'
;<ThemeToggle />
```

### DesignSystemToggle

Design system selector dropdown.

```tsx
import { DesignSystemToggle } from '@/components/DesignSystemToggle'
;<DesignSystemToggle />
```

### ThemeChooserFAB

Floating action button triggering theme panel.

```tsx
import { ThemeChooserFAB } from '@/components/ThemeChooserFAB'
;<ThemeChooserFAB />
```

Features:

- Animated on first visit
- Opens sliding panel
- Position fixed bottom-right

### ThemeChooserPanel

Sliding panel with design system grid.

```tsx
import { ThemeChooserPanel } from '@/components/ThemeChooserPanel'
;<ThemeChooserPanel isOpen={open} onClose={() => setOpen(false)} />
```

Features:

- Design system preview cards
- Theme toggle
- Share URL button

### ShareButton

Copy current URL with theme/design parameters.

```tsx
import { ShareButton } from '@/components/ShareButton'
;<ShareButton />
```

## Context Providers

Providers wrapping the application.

### ThemeProvider

Manages dark/light mode with localStorage persistence.

```tsx
import { ThemeProvider, useTheme } from '@/hooks/useTheme'

// In component
const { theme, setTheme } = useTheme()
setTheme('dark') // 'light' | 'dark' | 'system'
```

### DesignSystemProvider

Manages active design system with localStorage persistence.

```tsx
import { DesignSystemProvider, useDesignSystem } from '@/hooks/useDesignSystem'

// In component
const { designSystem, setDesignSystem } = useDesignSystem()
setDesignSystem('hand-drawn')
```

### RouteViewProvider

Manages view state (portfolio vs jobs).

```tsx
import { RouteViewProvider, useRouteView } from '@/hooks/useRouteView'

// In component
const { view, setView } = useRouteView()
setView('jobs') // 'portfolio' | 'jobs'
```

## Error Handling

### ErrorBoundary

Catches React errors and displays fallback UI.

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary'
;<ErrorBoundary>
  <App />
</ErrorBoundary>
```

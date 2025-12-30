# Portfolio Configuration System

This directory contains the JSON-based configuration system for the portfolio. All content, site settings, and design tokens can be customized via JSON files without modifying TypeScript code.

## Files Overview

### Configuration Files

- **`site.json`** - Site-level configuration (navigation, social links, analytics, features)
- **`content.json`** - All portfolio content (hero, experience, skills, contact, etc.)
- **`design-systems.json`** - Design tokens for all visual themes (colors, fonts, shadows, radius)

### Code Files

- **`schema.ts`** - Zod schemas for validation and TypeScript type generation
- **`loader.ts`** - Configuration loading, validation, and template processing
- **`generated/design-tokens.css`** - Auto-generated CSS from design-systems.json (DO NOT EDIT)

## Configuration Structure

### site.json

Site-level settings including navigation, social links, and feature flags.

```json
{
  "meta": {
    "title": "Your Name | Title",
    "description": "SEO description (10-160 chars)",
    "language": "en",
    "themeColor": "#102a43"
  },
  "branding": {
    "name": "Your Name",
    "logo": null,
    "showName": true
  },
  "navigation": {
    "links": [
      { "href": "#hero", "label": "Home", "external": false },
      { "href": "#experience", "label": "Experience", "external": false }
    ],
    "cta": {
      "text": "Get in Touch",
      "href": "#contact"
    }
  },
  "social": [
    { "platform": "email", "value": "you@example.com", "label": "Email" },
    {
      "platform": "linkedin",
      "url": "https://linkedin.com/in/you",
      "label": "LinkedIn"
    }
  ],
  "analytics": {
    "vercel": true,
    "googleAnalytics": null,
    "plausible": null
  },
  "features": {
    "darkMode": true,
    "designSystemSwitcher": true,
    "smoothScroll": true,
    "reduceMotion": "respect-system"
  }
}
```

### content.json

All portfolio content with dynamic template variables.

```json
{
  "variables": {
    "careerStartYear": 1996,
    "partnershipStartYear": 2013
  },
  "sections": ["hero", "metrics", "experience", "achievements", "skills", "clients", "contact"],
  "hero": {
    "name": "Your Name",
    "title": "Your Title",
    "tagline": "Your tagline with {{yearsSince:careerStartYear}}+ years...",
    "avatar": "/profile.jpg",
    "cta": {
      "primary": { "text": "View Experience", "target": "#experience" },
      "secondary": { "text": "Contact Me", "target": "#contact" }
    }
  },
  "metrics": [
    {
      "label": "Years Experience",
      "value": "{{yearsSince:careerStartYear}}",
      "suffix": "+",
      "description": "Optional description",
      "max": 35
    },
    {
      "label": "Revenue Growth",
      "value": 55,
      "suffix": "%",
      "backContent": { ... }
    }
  ],
  "experience": [...],
  "achievements": [...],
  "skillCategories": [
    {
      "name": "Languages & Frameworks",
      "skills": [
        { "name": "TypeScript", "context": "Backend modernization reducing errors by 50%" },
        { "name": "React", "context": "Desktop UI rewrite" },
        "Python"
      ]
    }
  ],
  "clients": {
    "title": "Trusted By",
    "display": "list",
    "items": [
      { "name": "Company", "highlight": true },
      { "name": "Another Company", "highlight": false }
    ]
  },
  "contact": {
    "headline": "Get in Touch",
    "text": "Contact description",
    "preferredMethod": "email",
    "showSocial": true
  },
  "custom": []
}
```

### design-systems.json

Design tokens with shared defaults and per-system customization.

```json
{
  "defaultSystem": "corporate",
  "defaults": {
    "spacing": {
      "unit": "0.25rem",
      "scale": [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32]
    },
    "typography": {
      "scale": { "xs": "0.75rem", "sm": "0.875rem", "base": "1rem", ... },
      "lineHeight": { "tight": 1.25, "normal": 1.5, "relaxed": 1.75 }
    },
    "animation": {
      "duration": { "fast": "150ms", "normal": "300ms", "slow": "500ms" },
      "easing": { "default": "cubic-bezier(0.4, 0, 0.2, 1)", ... }
    },
    "layout": {
      "maxWidth": "1200px",
      "contentWidth": "768px",
      "sectionPadding": "4rem"
    }
  },
  "systems": [
    {
      "id": "corporate",
      "name": "Corporate Professional",
      "description": "...",
      "supportsDarkMode": true,
      "fonts": {
        "display": { "family": "Space Grotesk", "fallback": "system-ui, sans-serif", "googleFontsUrl": "..." },
        "body": { ... },
        "mono": { ... }
      },
      "tokens": {
        "light": {
          "colors": { "background": "#f8fafc", "foreground": "#0a1929", ... },
          "shadows": { "card": "...", "button": "...", ... },
          "radius": { "card": "0.75rem", "button": "0.5rem", ... },
          "border": { "width": "1px", "style": "solid" }
        },
        "dark": { ... }
      }
    }
  ]
}
```

## Template Variables

Use `{{yearsSince:variableName}}` syntax in any string field to display dynamic year values. The variable must be defined in the `variables` section of content.json.

**Example:**

```json
{
  "variables": {
    "careerStartYear": 1996,
    "partnershipStartYear": 2013
  },
  "hero": {
    "tagline": "{{yearsSince:careerStartYear}}+ years of experience..."
  },
  "metrics": [
    {
      "label": "Partnership Years",
      "value": "{{yearsSince:partnershipStartYear}}"
    }
  ]
}
```

Templates work in:

- **site.json**: `meta.description` field
- **content.json**:
  - Hero tagline and text fields
  - Metric values (string format)
  - Experience highlights
  - Achievement summaries and metric values
  - Skill context descriptions

## Metrics Configuration

Metrics can have static or computed values:

**Static value:**

```json
{
  "label": "Revenue Growth",
  "value": 55,
  "suffix": "%",
  "description": "Marketplace revenue increase"
}
```

**Computed value (years since):**

```json
{
  "label": "Years Experience",
  "value": "{{yearsSince:careerStartYear}}",
  "suffix": "+",
  "description": "Full-stack development"
}
```

**With flip card back content:**

```json
{
  "label": "Revenue Growth",
  "value": 55,
  "suffix": "%",
  "backContent": {
    "title": "Marketplace Revenue Growth",
    "category": "growth",
    "impact": "Drove sustainable recurring revenue",
    "stats": [{ "label": "Revenue Increase", "value": "55%" }],
    "details": ["Optimized marketplace listing", "Enabled seamless workflow"]
  }
}
```

## Skills Configuration

Skills support mixed formats - simple strings or objects with context:

```json
{
  "skillCategories": [
    {
      "name": "Languages & Frameworks",
      "skills": [
        {
          "name": "TypeScript",
          "context": "Backend modernization reducing runtime errors by 50%"
        },
        { "name": "React", "context": "Desktop UI rewrite" },
        "Python",
        "Java"
      ]
    }
  ]
}
```

Skills with `context` show a popover on hover with additional details.

## Skills Section Configuration

The Skills section supports optional configuration via `skillsSection`:

```json
{
  "skillsSection": {
    "eyebrow": "Technical Expertise",
    "headline": "Skills & Technologies",
    "description": "Your expertise description...",
    "summary": [
      { "title": "Full-Stack", "subtitle": "End-to-end Development" },
      { "title": "Cloud Native", "subtitle": "AWS & Serverless" },
      { "title": "Leadership", "subtitle": "Team Building & Mentorship" }
    ]
  }
}
```

The `summary` array is optional. If provided, it displays a highlight bar at the bottom of the Skills section with up to 3 items. If omitted, the summary bar is hidden.

## Example Portfolios

The `examples/` folder contains different portfolio configurations for various roles:

**Developer roles:**

- **`dev-intern/`** - Junior developer portfolio
- **`dev-senior/`** - Senior developer portfolio with detailed experience

**UX/Design roles:**

- **`ux-designer/`** - UX designer portfolio
- **`ux-lead/`** - UX lead portfolio with team achievements

**Marketing roles:**

- **`marketing-product/`** - Product marketing portfolio
- **`marketing-demand-gen/`** - Demand generation portfolio

**HR roles:**

- **`hr-assistant/`** - HR assistant portfolio
- **`hr-manager/`** - HR manager portfolio

### Testing Different Portfolios

```bash
# List available examples
npm run portfolio:list

# Switch to an example (backs up current config)
npm run portfolio:switch dev-senior
npm run portfolio:switch ux-lead

# Restore original config
npm run portfolio:reset

# Validate all examples against schema
npm run portfolio:validate
```

The switcher automatically:

1. Validates the example config before switching
2. Backs up your original configs to `.backup/`
3. Copies the example files to the main config location

After switching, run `npm run dev` to see the changes.

## Simplified Skills Format

In addition to the full `skillCategories` format, you can use a simpler `skills` format:

```json
{
  "skills": {
    "display": "list",
    "categories": [
      { "name": "Frontend", "skills": ["React", "TypeScript", "CSS"] },
      { "name": "Backend", "skills": ["Node.js", "PostgreSQL"] }
    ]
  }
}
```

This is useful for minimal portfolios where you don't need skill context or levels.

## Scripts

- `npm run generate:css` - Regenerate CSS from design-systems.json
- `npm run portfolio:list` - List available example portfolios
- `npm run portfolio:switch <name>` - Switch to an example portfolio
- `npm run portfolio:reset` - Restore original portfolio config
- `npm run portfolio:validate` - Validate all examples against schemas

## Adding a New Design System

1. Add a new entry to `design-systems.json` with all required tokens
2. Run `npm run generate:css` to regenerate the CSS
3. Optionally add decorative CSS in `src/styles/design-systems/{id}.css`
4. Update `index.html` inline script if needed for flash prevention

## Adding a New Content Section

1. Add the schema in `schema.ts`
2. Add the section to `content.json`
3. Add section ID to the `sections` array
4. Export from `loader.ts`
5. Create the component to consume the data

## Validation

All configuration is validated at build time using Zod schemas. Invalid JSON will cause the build to fail with descriptive error messages.

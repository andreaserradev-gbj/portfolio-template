# CLAUDE.md

## Commands

npm run dev # Vite dev server
npm run build # CSS + HTML generation → tsc → tests → production build
npm run test # Watch mode | test:run for CI
npm run lint # ESLint
npm run generate:css # Regenerate design-tokens.css from design-systems.json
npm run generate:html # Regenerate index.html from template + JSON

## Generated Files (DO NOT EDIT)

- `index.html` - from index.html.template + JSON configs
- `src/config/generated/design-tokens.css` - from design-systems.json

## Tech Stack

React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Zod

## Key Directories

- `src/config/` - JSON configs (site.json, content.json, design-systems.json) + Zod schemas
- `src/components/ui/` - shadcn/ui primitives
- `src/components/jobs/` - HN job board (optional feature)
- `src/styles/design-systems/` - Decorative CSS per theme

## Template Variables

Use `{{yearsSince:variableName}}` in JSON strings for dynamic year calculations.
Variables defined in content.json `variables` field.

## Design System Utilities

.rounded-card → var(--radius-card)
.rounded-button → var(--radius-button)
.shadow-card → var(--shadow-card)
.border-ds → var(--border-width)

## Key Patterns

- Path aliases: `@/components/ui/button`
- Semantic colors: `bg-card`, `text-foreground`, `border-border`
- Zod validates JSON at build time

## URL Parameters

?theme=light|dark|system
?design=corporate|hand-drawn|automotive|bauhaus
?view=jobs (when job board enabled)

## HN Job Board Feature

Controlled by `VITE_HN_JOB_BOARD` env var:

- Local dev: enabled by default (set `false` to disable)
- Vercel Preview: set `true` to enable
- Production: disabled by default

# Job Board Architecture & Deployment Options

This document captures the full brainstorming session for deploying the HN Job Board feature publicly with authentication. Written December 2025 for future reference.

---

## Table of Contents

1. [Current Implementation](#current-implementation)
2. [The Problem](#the-problem)
3. [Deployment Options Considered](#deployment-options-considered)
4. [Authentication Architecture](#authentication-architecture)
5. [Subdomain Deployment](#subdomain-deployment)
6. [Backend Architecture Options](#backend-architecture-options)
7. [Supabase Deep Dive](#supabase-deep-dive)
8. [Security Considerations](#security-considerations)
9. [Cost Analysis](#cost-analysis)
10. [Code Exclusion Strategies](#code-exclusion-strategies)
11. [Monorepo Architecture](#monorepo-architecture)
12. [Decision & Rationale](#decision--rationale)

---

## Current Implementation

### Job Board Feature Overview

The job board is a **skill-matched Hacker News job aggregator** built into the portfolio:

- Fetches job postings from monthly "Who is Hiring?" threads on HN
- Matches jobs against portfolio skills using a weighted scoring system
- Filters by location type (remote global, remote EU, on-site EU)
- Supports search, sort by match quality/recency, minimum score filters
- Temperature control parameter for matching sensitivity (0.0-1.0)
- Persists user filter preferences to localStorage
- Caches job data for 30 minutes

### Key Files

```
src/components/jobs/
├── JobsPage.tsx          # Main page with filtering logic
├── JobsHeader.tsx        # Fixed header with filter sheet
├── JobFilters.tsx        # Reusable filter component
├── JobCard.tsx           # Individual job card
├── MatchScoreBadge.tsx   # Score display badge
└── JobsEmptyState.tsx    # Loading/error/empty states

src/hooks/
├── useHNJobs.ts          # API fetch + cache + parsing
└── useRouteView.tsx      # Client-side routing context

src/lib/
└── skillMatcher.ts       # Core matching engine (1500+ lines)

src/types/
└── hn.ts                 # TypeScript types for HN API
```

### Data Sources

- **HN Algolia API**: `https://hn.algolia.com/api/v1` (public, no auth needed)
- **Browser localStorage**: Job cache and filter preferences
- **No backend**: Fully client-side

---

## The Problem

### Concerns About Public Deployment

1. **Signals job hunting (20%)**: Visitors (employers, clients) might think active job searching
2. **Looks self-serving (80%)**: A personal job board on a portfolio seems unprofessional
3. **Reveals priorities**: Skill weights and job preferences publicly visible

### Requirements for Public Deployment

If deploying publicly:

- Authentication to restrict access
- Invite-only (not open registration)
- Clean separation from main portfolio
- Job persistence (save/bookmark jobs)
- Future extensibility

---

## Deployment Options Considered

### Option 1: Hidden Route (URL-only access)

**How it works:**

- Disable `features.hnJobBoard` in `site.json` (hides nav icon)
- Access via direct URL `?view=jobs`

**Pros:** Zero code changes, immediate
**Cons:** Anyone can discover route in source code

**Verdict:** Not truly private, rejected

---

### Option 2: Dev-only Toggle

**How it works:**

```typescript
if (import.meta.env.DEV || localStorage.getItem('showJobBoard')) {
  // Show job board
}
```

**Pros:** Production site clean, local dev always has access
**Cons:** Can't use on mobile/other devices

**Verdict:** Limited usability, not ideal

---

### Option 3: Hosting-Level Password Protection

**How it works:**

- Vercel Pro ($20/mo) offers Deployment Protection
- Password prompt before any content loads

**Pros:** Simple, no code changes
**Cons:** Requires paid plan, blanket protection (can't protect just job board)

**Verdict:** Good for full-site protection, overkill for single feature

---

### Option 4: Separate Deployment with Custom Auth

**How it works:**

- Job board on subdomain: `jobs.yourportfolio.dev`
- Custom authentication (Supabase)
- Invite-only access control

**Pros:** Full control, clean separation
**Cons:** More complex architecture

**Verdict:** Best long-term solution if deploying publicly

---

## Authentication Architecture

### Supabase Auth (Recommended)

**Why Supabase:**

- Client-side auth SDK (no backend needed)
- Built-in user management dashboard
- Row Level Security for data protection
- Free tier is generous
- Edge Functions for future server-side logic

### Auth Flow: Email + Password (Invite-Only)

```
User visits jobs.yourportfolio.dev
         │
         ▼
┌─────────────────────┐
│  Check Supabase     │
│  session            │
└─────────────────────┘
         │
    ┌────┴────┐
    │         │
 No session  Has session
    │         │
    ▼         ▼
┌─────────┐  ┌─────────┐
│ Login   │  │ Job     │
│ Form    │  │ Board   │
└─────────┘  └─────────┘
```

### Invite-Only Implementation

**Step 1: Disable public signups**
In Supabase Dashboard → Authentication → Settings → Disable "Enable signups"

**Step 2: Create whitelist table**

```sql
CREATE TABLE public.allowed_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON public.allowed_emails
  FOR ALL USING (auth.role() = 'service_role');

-- Add allowed users
INSERT INTO public.allowed_emails (email, notes) VALUES
  ('your-email@example.com', 'Owner');
```

**Step 3: Add users manually**
In Supabase Dashboard → Authentication → Users → "Add user"

### Implementation Files

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

export const isAuthConfigured = !!supabase
```

```typescript
// src/hooks/useAuth.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { supabase, isAuthConfigured } from '@/lib/supabase'
import type { User, Session, AuthError } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  isAuthenticated: boolean
  isAuthEnabled: boolean
}

// ... Context implementation following useTheme.tsx pattern
```

```typescript
// src/components/auth/AuthGuard.tsx
export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading, isAuthEnabled } = useAuth()

  if (!isAuthEnabled) return <>{children}</>  // Dev fallback
  if (loading) return <LoadingSpinner />
  if (!isAuthenticated) return <LoginForm />

  return <>{children}</>
}
```

```typescript
// src/App.tsx modification
function AppContent() {
  const { view } = useRouteView()

  if (view === 'jobs') {
    return (
      <AuthGuard>
        <JobsPage />
      </AuthGuard>
    )
  }

  return <PortfolioView />
}
```

---

## Subdomain Deployment

### Option A: Client-Side Domain Detection (Rejected)

```typescript
const isJobsApp = window.location.hostname.startsWith('jobs.')
```

**Why rejected:** User felt this was insecure. Code is inspectable, feels like security through obscurity.

### Option B: Separate Vercel Deployments (Recommended)

**Architecture:**

```
GitHub Repo
     │
     ├─────────────────┬─────────────────┐
     │                 │                 │
     ▼                 ▼                 ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Vercel #1   │  │ Vercel #2   │  │ Supabase    │
│ Portfolio   │  │ Jobs        │  │ Auth + DB   │
│             │  │             │  │             │
│ Domain:     │  │ Domain:     │  │             │
│ yourport-   │  │ jobs.       │  │             │
│ folio.dev   │  │ yourport-   │  │             │
│             │  │ folio.dev   │  │             │
│ Env:        │  │ Env:        │  │             │
│ APP_MODE=   │  │ APP_MODE=   │  │             │
│ portfolio   │  │ jobs        │  │             │
└─────────────┘  └─────────────┘  └─────────────┘
```

**Configuration:**

| Setting                  | Portfolio Project   | Jobs Project               |
| ------------------------ | ------------------- | -------------------------- |
| Domain                   | `yourportfolio.dev` | `jobs.yourportfolio.dev`   |
| Branch                   | `main`              | `main`                     |
| `VITE_APP_MODE`          | `portfolio`         | `jobs`                     |
| `VITE_SUPABASE_URL`      | (not set)           | `https://<id>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | (not set)           | `<anon-key>`               |

**DNS Setup:**
In your domain registrar, add CNAME:

```
jobs  →  cname.vercel-dns.com
```

---

## Backend Architecture Options

### Why Consider a Backend?

Current architecture is fully client-side. A backend enables:

- Job persistence (save/bookmark jobs)
- Application tracking
- Server-side rendering (SEO)
- Complex business logic
- Scheduled tasks (job alerts)

### Option 1: No Backend (Supabase Only)

**Use Supabase for everything:**

- Auth: Supabase Auth
- Database: Supabase Postgres
- Server logic: Supabase Edge Functions

**Pros:**

- No server to maintain
- Free tier covers personal use
- Integrated ecosystem

**Cons:**

- Less control than custom backend
- Vendor lock-in

### Option 2: Express Backend

**Architecture:**

```
Client (React)
     │
     ├──► Supabase (Auth)
     │
     └──► Express API (Railway/Render)
              │
              └──► Postgres
```

**Pros:**

- Full control
- Familiar (user knows Express)
- Any hosting provider

**Cons:**

- Another service to maintain
- ~$5/mo hosting minimum
- Cold starts on serverless

### Option 3: Next.js Migration

**Would require:**

- Migrate from Vite to Next.js
- Use API routes for backend logic
- SSR for SEO (not needed for private job board)

**Verdict:** Overkill. Significant migration for minimal benefit.

### Option 4: Vercel Serverless Functions

**Add `/api` folder to Vite project:**

```
/api
  /jobs
    save.ts      # POST - save a job
    list.ts      # GET - get saved jobs
```

**Pros:**

- No separate deployment
- Uses existing Vercel setup
- Scales automatically

**Cons:**

- Mixes concerns in same repo
- Cold start latency

### Recommendation: Supabase Only

For job persistence without a custom backend:

```sql
CREATE TABLE saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hn_job_id TEXT NOT NULL,
  company TEXT,
  job_data JSONB,
  notes TEXT,
  status TEXT DEFAULT 'saved',  -- saved, applied, interviewing, rejected
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, hn_job_id)
);

ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their saved jobs" ON saved_jobs
  FOR ALL USING (auth.uid() = user_id);
```

Client-side usage:

```typescript
// Save a job
await supabase.from('saved_jobs').insert({
  hn_job_id: job.id,
  company: job.company,
  job_data: job,
})

// Get saved jobs
const { data } = await supabase.from('saved_jobs').select('*')
```

---

## Supabase Deep Dive

### Row Level Security (RLS)

**How it works:**

1. Policies are SQL `WHERE` clauses
2. Evaluated server-side by Postgres
3. Applied to every query automatically
4. User can't bypass, even with direct SQL

**Example:**

```sql
CREATE POLICY "Users own their saved jobs" ON saved_jobs
  FOR ALL USING (auth.uid() = user_id);
```

When user queries `saved_jobs`:

```sql
-- User's query
SELECT * FROM saved_jobs;

-- Postgres adds policy condition
SELECT * FROM saved_jobs WHERE user_id = '<user-id-from-jwt>';
```

**Why it's secure:**

- JWT is signed, can't be forged
- `auth.uid()` extracts user ID server-side
- Even malicious client code can't access other users' data

### CORS (Cross-Origin Resource Sharing)

**No configuration needed:**

- Supabase allows requests from any origin by default
- HN Algolia API allows `*` origins
- Both APIs work from any domain

### Edge Functions

**For future server-side logic:**

```typescript
// supabase/functions/send-job-alert/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Server-side logic with full DB access
  return new Response(JSON.stringify({ ok: true }))
})
```

**Deploy:**

```bash
supabase functions deploy send-job-alert
```

---

## Security Considerations

### Client-Side Security

| Concern             | Mitigation                                      |
| ------------------- | ----------------------------------------------- |
| Anon key exposure   | Designed for client-side use, RLS protects data |
| JWT in localStorage | Standard practice, auto-refreshed by Supabase   |
| HTTPS               | Enforced by Vercel and Supabase                 |

### Access Control

| Layer           | Protection                    |
| --------------- | ----------------------------- |
| Supabase Auth   | Email/password verification   |
| Signup disabled | Prevents public registration  |
| Whitelist table | Additional email verification |
| RLS policies    | Per-user data isolation       |

### Password Requirements

Configure in Supabase Dashboard → Authentication → Settings:

- Minimum length: 8+ characters
- Enable "Secure password" for complexity

### Rate Limiting

Built into Supabase:

- 30 password reset requests/hour
- 3 failed login attempts before lockout

---

## Cost Analysis

### Supabase Pricing

| Tier     | Monthly Cost | Limits                            |
| -------- | ------------ | --------------------------------- |
| **Free** | $0           | 50K MAU, 500MB DB, 5GB bandwidth  |
| **Pro**  | $25          | 100K MAU, 8GB DB, 250GB bandwidth |

**For personal use:** Free tier is more than enough.

### Vercel Pricing

| Tier      | Monthly Cost | Features                           |
| --------- | ------------ | ---------------------------------- |
| **Hobby** | $0           | Personal projects, 100GB bandwidth |
| **Pro**   | $20          | Password protection, analytics     |

**For two deployments:** Free tier works, no password protection needed if using Supabase auth.

### Total Cost

| Usage               | Supabase | Vercel (x2) | Total      |
| ------------------- | -------- | ----------- | ---------- |
| Personal            | Free     | Free        | **$0/mo**  |
| Growing (100 users) | Free     | Free        | **$0/mo**  |
| Pro features        | $25      | $20         | **$45/mo** |

---

## Code Exclusion Strategies

### The Problem

With env-var switching in same codebase:

- Portfolio build includes JobsApp code
- Job board code visible in portfolio bundle
- Increases bundle size unnecessarily

### Option 1: Dynamic Import

```typescript
const JobsApp = lazy(() => import('./JobsApp'))

if (appMode === 'jobs') {
  return <Suspense fallback={<Loading />}><JobsApp /></Suspense>
}
```

**Effectiveness:** Partial. Code is in bundle but not loaded.

### Option 2: Vite Conditional Build

```typescript
// vite.config.ts
export default defineConfig({
  define: {
    __INCLUDE_JOBS__: process.env.VITE_APP_MODE === 'jobs',
  },
})

// App.tsx
if (__INCLUDE_JOBS__) {
  // This code is tree-shaken out when false
}
```

**Effectiveness:** Full exclusion if done correctly.

### Option 3: Separate Entry Points

```
src/
├── main-portfolio.tsx  # Entry for portfolio
├── main-jobs.tsx       # Entry for jobs app
└── shared/             # Shared components
```

**Effectiveness:** Full exclusion, cleaner separation.

### Option 4: Monorepo (Best)

```
/packages
  /shared        # UI components, utils
  /portfolio     # yourportfolio.dev
  /jobs          # jobs.yourportfolio.dev
```

**Effectiveness:** Complete isolation, best maintainability.

---

## Monorepo Architecture

### Recommended Structure

```
portfolio-monorepo/
├── package.json           # Workspace root
├── turbo.json             # Turborepo config
├── packages/
│   ├── ui/                # Shared UI components
│   │   ├── package.json
│   │   └── src/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── index.ts
│   ├── config/            # Shared config (design systems, content)
│   │   ├── package.json
│   │   └── src/
│   │       ├── design-systems.json
│   │       └── content.json
│   └── skill-matcher/     # Job matching logic
│       ├── package.json
│       └── src/
│           └── matcher.ts
├── apps/
│   ├── portfolio/         # yourportfolio.dev
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── src/
│   └── jobs/              # jobs.yourportfolio.dev
│       ├── package.json
│       ├── vite.config.ts
│       └── src/
└── .github/
    └── workflows/
        └── deploy.yml     # Separate deploy per app
```

### Benefits

1. **Complete isolation** - Each app has its own build
2. **Shared code** - UI components, utilities reused
3. **Independent deploys** - Change portfolio without affecting jobs
4. **Open-source ready** - Job board package easily extractable
5. **Clear boundaries** - No env var confusion

### Tools

- **Turborepo** - Build orchestration, caching
- **pnpm workspaces** - Package management
- **Changesets** - Versioning (if publishing packages)

### Migration Path

1. Create monorepo structure
2. Extract shared UI to `packages/ui`
3. Extract skill matcher to `packages/skill-matcher`
4. Create `apps/portfolio` with portfolio code
5. Create `apps/jobs` with job board code
6. Configure Vercel for monorepo deploys

---

## Decision & Rationale

### Final Decision: Environment-Based Feature Flag

**Chosen approach:**

- Use `VITE_HN_JOB_BOARD` environment variable to control access
- **Local dev**: Enabled by default (no configuration needed)
- **Vercel Preview**: Enabled via env var (`VITE_HN_JOB_BOARD=true`)
- **Production**: Disabled (env var not set)
- Share access via Vercel preview URLs (publicly accessible)

### Environment Variable Behavior

| Environment | VITE_HN_JOB_BOARD | Job Board   |
| ----------- | ----------------- | ----------- |
| Local dev   | not set           | **Enabled** |
| Local dev   | `false`           | Disabled    |
| Preview     | `true`            | **Enabled** |
| Production  | not set           | Disabled    |

### Why This Decision

1. **Simple and secure** - Environment variable at build time, compiled into the code, cannot be bypassed by inspecting source
2. **Zero runtime cost** - No auth libraries, no API calls, no provider wrappers
3. **Great DX** - Works locally out of the box, no setup required
4. **Shareable** - Preview URLs are public, easy to share with others
5. **Portfolio stays clean** - Production site remains professional

### Vercel Configuration

**Preview deployments:**

1. Go to Project Settings → Environment Variables
2. Add `VITE_HN_JOB_BOARD` = `true`
3. Set Environment to "Preview" only

**Production:**

- Don't set the variable (defaults to disabled)

### Implementation Details

The feature flag is controlled by `src/lib/env.ts`:

```typescript
export function isJobBoardEnabled(): boolean {
  const envValue = import.meta.env.VITE_HN_JOB_BOARD

  if (envValue === 'true') return true
  if (envValue === 'false') return false

  // Default: enabled in development, disabled in production
  return import.meta.env.DEV
}
```

This is evaluated at build time, so the value is compiled into the bundle and cannot be modified at runtime.

### When to Revisit

Consider implementing full auth architecture when:

- Ready to open-source job board as standalone tool
- Multiple users need persistent access (team, community)
- Want job persistence features (bookmarks, notes, application tracking)
- Building additional tools that share components

### How to Use Job Board

**Local development:**

```bash
npm run dev
# Open http://localhost:5173 and click the briefcase icon
# Or go directly to http://localhost:5173/?view=jobs
```

**Preview deployments:**
Share the Vercel preview URL with others (no login required)

---

## Appendix: Full Implementation Reference

If implementing in the future, here are the complete file changes needed:

### New Files to Create

| File                                   | Purpose                        |
| -------------------------------------- | ------------------------------ |
| `src/lib/supabase.ts`                  | Supabase client initialization |
| `src/hooks/useAuth.tsx`                | Auth context provider + hook   |
| `src/components/auth/LoginForm.tsx`    | Login form UI                  |
| `src/components/auth/AuthGuard.tsx`    | Route protection wrapper       |
| `src/components/auth/LogoutButton.tsx` | Logout icon button             |
| `src/components/auth/index.ts`         | Barrel exports                 |

### Files to Modify

| File                                 | Changes                                      |
| ------------------------------------ | -------------------------------------------- |
| `package.json`                       | Add `@supabase/supabase-js`                  |
| `.gitignore`                         | Add `.env.local`                             |
| `src/App.tsx`                        | Add AuthProvider, wrap JobsPage in AuthGuard |
| `src/components/jobs/JobsHeader.tsx` | Add LogoutButton                             |

### Environment Variables

```bash
# .env.local (local development)
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_APP_MODE=jobs

# Vercel (production)
# Same variables in project settings
```

### Supabase SQL Setup

```sql
-- 1. Whitelist table
CREATE TABLE public.allowed_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON public.allowed_emails
  FOR ALL USING (auth.role() = 'service_role');

-- 2. Saved jobs table
CREATE TABLE public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hn_job_id TEXT NOT NULL,
  company TEXT,
  job_data JSONB,
  notes TEXT,
  status TEXT DEFAULT 'saved',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, hn_job_id)
);

ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their saved jobs" ON public.saved_jobs
  FOR ALL USING (auth.uid() = user_id);

-- 3. Add your email
INSERT INTO public.allowed_emails (email) VALUES ('your-email@example.com');
```

---

_Document created: December 2025_
_Last updated: December 2025 (environment-based feature flag implementation)_

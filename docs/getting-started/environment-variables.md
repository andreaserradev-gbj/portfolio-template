# Environment Variables

## Build-Time Variables

| Variable            | Default     | Description                          |
| ------------------- | ----------- | ------------------------------------ |
| `VITE_HN_JOB_BOARD` | `undefined` | Enable/disable the job board feature |
| `VITE_VERCEL`       | `undefined` | Enable Vercel Analytics              |

## Vercel Analytics

The `VITE_VERCEL` variable controls whether Vercel Analytics is included:

```typescript
// src/main.tsx
const isVercel = import.meta.env.VITE_VERCEL === 'true'
// Analytics component only renders when enabled
{isVercel && <Analytics />}
```

Set `VITE_VERCEL=true` in your Vercel project settings to enable analytics tracking.

## Job Board Feature Flag

The job board is an optional feature controlled by `VITE_HN_JOB_BOARD`:

| Environment    | Value   | Job Board |
| -------------- | ------- | --------- |
| Local dev      | not set | Enabled   |
| Vercel Preview | `true`  | Enabled   |
| Production     | not set | Disabled  |

### Behavior

- **Local development**: Job board is enabled by default for testing
- **Production**: Job board is hidden unless explicitly enabled
- **Preview deployments**: Enable to test with real job data

## Vercel Configuration

To configure environment variables on Vercel:

1. Go to **Project Settings** > **Environment Variables**
2. Add variables as needed:

| Variable            | Value  | Environment         | Purpose                      |
| ------------------- | ------ | ------------------- | ---------------------------- |
| `VITE_VERCEL`       | `true` | Production, Preview | Enable analytics             |
| `VITE_HN_JOB_BOARD` | `true` | Preview only        | Enable job board on previews |

3. Click **Save**

The job board will appear on preview deployments but remain hidden on production, while analytics will track on both.

## Accessing Variables in Code

```typescript
// Check if job board is enabled
const isJobBoardEnabled = import.meta.env.VITE_HN_JOB_BOARD === 'true'

// In local dev, also check for explicit false
const isLocalDev = import.meta.env.DEV
```

See `src/lib/env.ts` for the feature flag implementation.

## Local Development Override

To disable job board locally:

```bash
# Create .env.local
echo "VITE_HN_JOB_BOARD=false" > .env.local
npm run dev
```

To enable job board for production build testing:

```bash
VITE_HN_JOB_BOARD=true npm run build
```

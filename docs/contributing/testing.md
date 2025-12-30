# Testing Guide

This project uses [Vitest](https://vitest.dev/) for unit testing.

## Running Tests

```bash
# Watch mode (development)
npm run test

# Single run (CI)
npm run test:run

# With coverage report
npm run test:coverage
```

## Test Structure

Tests are co-located with source code in `__tests__` directories:

```
src/
├── config/
│   └── __tests__/
│       ├── loader.test.ts      # Config loading and processing
│       └── schema.test.ts      # Zod schema validation
├── lib/
│   └── __tests__/
│       ├── env.test.ts         # Environment utilities
│       ├── jobsCache.test.ts   # localStorage caching
│       ├── locationClassification.test.ts  # Location parsing
│       ├── skillScoring.test.ts # Skill matching algorithm
│       └── utils.test.ts       # Utility functions
└── services/jobs/
    └── __tests__/
        ├── JobService.test.ts  # Base job service
        └── processJobs.test.ts # Job processing pipeline
```

## Test Patterns

### Schema Validation Tests

Test Zod schemas with valid and invalid fixtures:

```typescript
import { describe, it, expect } from 'vitest'
import { SiteConfigSchema } from '../schema'

describe('SiteConfigSchema', () => {
  it('validates correct config', () => {
    const valid = {
      meta: { title: 'Test', description: 'A test site' },
      navigation: { links: [] },
      social: [],
    }
    expect(() => SiteConfigSchema.parse(valid)).not.toThrow()
  })

  it('rejects missing required fields', () => {
    const invalid = { meta: { title: 'Test' } }
    expect(() => SiteConfigSchema.parse(invalid)).toThrow()
  })
})
```

### Loader Tests

Test template processing and config transformation:

```typescript
import { describe, it, expect } from 'vitest'
import { processTemplateString, resolveMetricValue } from '../loader'

describe('processTemplateString', () => {
  it('resolves yearsSince template', () => {
    const variables = { startYear: 2020 }
    const result = processTemplateString(
      '{{yearsSince:startYear}} years',
      variables
    )
    expect(result).toMatch(/\d+ years/)
  })
})
```

### Skill Matching Tests

Test scoring algorithm with job text fixtures:

```typescript
import { describe, it, expect } from 'vitest'
import { calculateWeightedScore } from '../skillMatcher'

describe('calculateWeightedScore', () => {
  it('scores higher with more skill matches', () => {
    const manySkills = 'Looking for TypeScript, React, Node.js developer'
    const fewSkills = 'Looking for Python developer'

    const high = calculateWeightedScore(manySkills, 'EU', 0.4)
    const low = calculateWeightedScore(fewSkills, 'EU', 0.4)

    expect(high.score).toBeGreaterThan(low.score)
  })
})
```

### Location Classification Tests

Test location parsing with real job post patterns:

```typescript
import { describe, it, expect } from 'vitest'
import { classifyJobLocation } from '../skillMatcher'

describe('classifyJobLocation', () => {
  it('classifies global remote jobs', () => {
    const result = classifyJobLocation('Remote - work from anywhere')
    expect(result.type).toBe('REMOTE_GLOBAL')
  })

  it('detects regional restrictions', () => {
    const result = classifyJobLocation('Remote (EU only)')
    expect(result.type).toBe('REMOTE_REGIONAL')
    expect(result.primaryRegions).toContain('EU')
  })
})
```

## Adding Tests

1. Create test file next to source:

   ```
   src/lib/myModule.ts
   src/lib/__tests__/myModule.test.ts
   ```

2. Follow naming convention: `{source}.test.ts`

3. Import from parent directory:

   ```typescript
   import { myFunction } from '../myModule'
   ```

4. Group related tests with `describe`:
   ```typescript
   describe('myFunction', () => {
     it('handles basic case', () => { ... })
     it('handles edge case', () => { ... })
   })
   ```

## Build Integration

Tests run automatically during `npm run build`:

```
npm run build
  └── generate:css
  └── generate:html
  └── tsc -b
  └── vitest run    <-- Tests here
  └── vite build
```

Build fails if any test fails.

## Coverage

Generate coverage report:

```bash
npm run test:coverage
```

Coverage report is output to `coverage/` directory.

## Mocking

Vitest supports mocking via `vi`:

```typescript
import { describe, it, expect, vi } from 'vitest'

// Mock module
vi.mock('@/config/loader', () => ({
  skillCategories: [{ name: 'Test', skills: [] }],
}))

// Mock function
const mockFn = vi.fn().mockReturnValue('mocked')
```

## Tips

- Keep tests focused and fast
- Test edge cases, not just happy paths
- Use descriptive test names
- Avoid testing implementation details
- Mock external dependencies

# Job Board Location Filter - Test Implementation Plan

## Current Status

The new location classification system has been implemented with 5 filter options:

- **All Locations** - No filtering
- **Remote (Global)** - Only worldwide remote jobs
- **Remote (EU)** - Remote jobs where EU is primary target
- **On-site (EU)** - On-site/hybrid jobs in EU cities
- **Any (EU)** - All jobs available to EU users

## Known Issues

The classification algorithm has false positives. Jobs like these incorrectly appear in EU filters:

- "Marketing Lead - Remote friendly | DevRel - San Francisco | Staff Engineer - SF"
- "Remote (US, Canada)"
- "REMOTE or San Francisco, Los Angeles, Chicago, Boston..."

## Test Implementation Plan

### Test File Location

`src/lib/__tests__/locationClassification.test.ts`

### Test Cases Needed

#### 1. Classification Tests (`classifyJobLocation`)

| Input                                              | Expected Type   | Notes           |
| -------------------------------------------------- | --------------- | --------------- |
| "Fully remote, work from anywhere"                 | REMOTE_GLOBAL   |                 |
| "100% remote, distributed team"                    | REMOTE_GLOBAL   |                 |
| "Remote-first, async company"                      | REMOTE_GLOBAL   |                 |
| "Remote (US, Canada)"                              | REMOTE_REGIONAL | US primary      |
| "US REMOTE \| Full-time"                           | REMOTE_REGIONAL | US primary      |
| "Remote (North America, GMT-8–GMT-5)"              | REMOTE_REGIONAL | US primary      |
| "Full time (US timezones)"                         | REMOTE_REGIONAL | US primary      |
| "Remote (US/Canada/Europe)"                        | REMOTE_REGIONAL | EU is SECONDARY |
| "Marketing Lead - Remote friendly \| DevRel - SF"  | MIXED_ROLES     | Multiple roles  |
| "ONSITE in Zurich (Switzerland)"                   | ON_SITE         | EU location     |
| "In-person, SF office"                             | ON_SITE         | US location     |
| "Boston, MA / SF Hybrid or Remote \| US timezones" | HYBRID          | US hybrid       |

#### 2. Filter Matching Tests

**matchesRemoteGlobalFilter:**

- REMOTE_GLOBAL → `true`
- Everything else → `false`

**matchesRemoteEUFilter:**

- REMOTE_GLOBAL → `true`
- REMOTE_REGIONAL with EU primary → `true`
- REMOTE_REGIONAL with EU secondary → `false` (**critical!**)
- REMOTE_REGIONAL with US primary → `false`
- HYBRID/ON_SITE → `false`
- MIXED_ROLES → `false`

**matchesOnSiteEUFilter:**

- ON_SITE with EU city → `true`
- HYBRID with EU city → `true`
- ON_SITE with US city → `false`
- REMOTE\_\* → `false`

#### 3. Real-World Job Post Tests

```typescript
const PROBLEMATIC_JOBS = [
  {
    text: 'Marketing Lead (Developers) - Remote friendly | Forward Deployed Engineer- Software Engineer II | DevRel Engineer - San Francisco| Staff Full Stack Engineer - San Francisco | Sr Full Stack Engineer - San Francisco',
    expectedType: 'MIXED_ROLES',
    matchesRemoteGlobal: false,
    matchesRemoteEU: false,
  },
  {
    text: 'Nova Credit | Remote (US, Canada)...',
    expectedType: 'REMOTE_REGIONAL',
    matchesRemoteGlobal: false,
    matchesRemoteEU: false,
  },
  {
    text: 'RINSE | REMOTE or San Francisco, Los Angeles, Chicago, Boston, New York, New Jersey, Seattle, Austin, Dallas, Toronto, or Washington DC',
    expectedType: 'REMOTE_REGIONAL', // US-centric due to city list
    matchesRemoteGlobal: false,
    matchesRemoteEU: false,
  },
  {
    text: 'AllSpice | Boston, MA / SF Hybrid or Remote | Full time (US timezones)',
    expectedType: 'HYBRID',
    matchesRemoteGlobal: false,
    matchesRemoteEU: false,
  },
  {
    text: 'Ezra | Principal Engineer (Full-Stack) | US REMOTE | Full-time',
    expectedType: 'REMOTE_REGIONAL',
    matchesRemoteGlobal: false,
    matchesRemoteEU: false,
  },
  {
    text: 'Pinetree | Remote (North America, GMT-8–GMT-5) | Full-time',
    expectedType: 'REMOTE_REGIONAL',
    matchesRemoteGlobal: false,
    matchesRemoteEU: false,
  },
]
```

### Implementation Steps

1. **Install Vitest** (if not already)
2. **Create test file** at `src/lib/__tests__/locationClassification.test.ts`
3. **Test helper functions first:**
   - `analyzeLocationPriority()`
   - `detectMultiRolePost()`
   - `appearsUSCentric()`
4. **Test main classification:**
   - `classifyJobLocation()`
5. **Test filter matchers:**
   - `matchesRemoteGlobalFilter()`
   - `matchesRemoteEUFilter()`
   - `matchesOnSiteEUFilter()`
   - `matchesAnyEUFilter()`
6. **Add to CI pipeline**

### Priority

**HIGH** - The current implementation has bugs that need to be caught by tests before further development.

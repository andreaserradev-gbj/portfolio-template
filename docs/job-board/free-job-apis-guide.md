# Free Job Board APIs for Skill Matcher Integration

## Overview

This document lists free, publicly accessible job board APIs that can be integrated with the same skill matching algorithm used for HN "Who is Hiring?" threads. All of these APIs return JSON data and can be consumed without authentication or API keys.

---

## 🟢 Fully Free APIs (No Authentication Required)

### 1. Hacker News - Who is Hiring (Current Implementation)

| Property             | Value                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| **API Endpoint**     | `https://hn.algolia.com/api/v1/search_by_date?query=who+is+hiring&tags=story,author_whoishiring` |
| **Format**           | JSON                                                                                             |
| **Rate Limit**       | Reasonable use                                                                                   |
| **Update Frequency** | Monthly (1st of each month)                                                                      |
| **Job Count**        | ~300-500 per thread                                                                              |
| **Focus**            | Tech/Startup jobs, high quality                                                                  |
| **Remote Filter**    | Manual parsing required                                                                          |
| **Salary Data**      | Sometimes included in text                                                                       |

```typescript
// Example fetch
const response = await fetch(
  'https://hn.algolia.com/api/v1/search?tags=comment,story_${threadId}&hitsPerPage=100'
)
```

---

### 2. RemoteOK

| Property             | Value                      |
| -------------------- | -------------------------- |
| **API Endpoint**     | `https://remoteok.com/api` |
| **Format**           | JSON                       |
| **Rate Limit**       | Reasonable use             |
| **Update Frequency** | Daily                      |
| **Job Count**        | 30,000+ listings           |
| **Focus**            | 100% Remote jobs           |
| **Remote Filter**    | All jobs are remote        |
| **Salary Data**      | Yes (when provided)        |

```typescript
interface RemoteOKJob {
  slug: string
  id: string
  epoch: number
  date: string
  company: string
  company_logo: string
  position: string
  tags: string[] // Skills/technologies
  description: string
  location: string
  salary_min?: number
  salary_max?: number
  apply_url: string
}

// Example fetch
const response = await fetch('https://remoteok.com/api')
const jobs: RemoteOKJob[] = await response.json()
// Note: First element is metadata, actual jobs start at index 1
```

**Pros:**

- Large dataset (30K+ jobs)
- All remote positions
- Includes salary data
- Tags/skills are pre-parsed

**Cons:**

- Must attribute and link back to RemoteOK
- 24-hour delay on new listings
- Cannot redistribute to other job boards

---

### 3. Arbeitnow

| Property             | Value                                         |
| -------------------- | --------------------------------------------- |
| **API Endpoint**     | `https://www.arbeitnow.com/api/job-board-api` |
| **Format**           | JSON                                          |
| **Rate Limit**       | Reasonable use                                |
| **Update Frequency** | Daily                                         |
| **Job Count**        | 10,000+ listings                              |
| **Focus**            | European tech jobs                            |
| **Remote Filter**    | `?remote=true` parameter                      |
| **Salary Data**      | Sometimes                                     |

```typescript
interface ArbeitnowJob {
  slug: string
  company_name: string
  title: string
  description: string
  remote: boolean
  url: string
  tags: string[]
  job_types: string[]
  location: string
  created_at: number
}

// Example fetch - Remote jobs only
const response = await fetch(
  'https://www.arbeitnow.com/api/job-board-api?remote=true'
)
const data = await response.json()
const jobs: ArbeitnowJob[] = data.data
```

**Pros:**

- Strong European focus (great for EU timezone)
- Pre-parsed tags/skills
- Remote filter built-in
- Visa sponsorship filter available

**Cons:**

- Smaller dataset than RemoteOK
- Must attribute Arbeitnow

---

### 4. Himalayas

| Property             | Value                            |
| -------------------- | -------------------------------- |
| **API Endpoint**     | `https://himalayas.app/jobs/api` |
| **Format**           | JSON                             |
| **Rate Limit**       | Rate limited (reasonable use)    |
| **Update Frequency** | Daily                            |
| **Job Count**        | 5,000+ listings                  |
| **Focus**            | Remote tech jobs                 |
| **Remote Filter**    | All jobs are remote              |
| **Salary Data**      | Yes                              |

```typescript
interface HimalayasJob {
  id: string
  title: string
  companyName: string
  companyLogo: string
  description: string // HTML
  applicationUrl: string
  employmentType: string // 'Full Time', 'Part Time', 'Contractor', etc.
  locationRestrictions?: string[] // Countries where you can work from
  salary?: {
    min: number
    max: number
    currency: string
  }
  categories: string[]
  publishedAt: string
  expiresAt: string
}

// Example fetch (max 20 per request)
const response = await fetch('https://himalayas.app/jobs/api?limit=20&offset=0')
const data = await response.json()
```

**Pros:**

- Clean API with good documentation
- Location restrictions clearly specified (great for EU filtering)
- Salary data often included
- Company profiles available

**Cons:**

- Max 20 jobs per request (pagination required)
- Rate limited
- Must attribute Himalayas

---

### 5. Jobicy

| Property             | Value                                   |
| -------------------- | --------------------------------------- |
| **API Endpoint**     | `https://jobicy.com/api/v2/remote-jobs` |
| **Format**           | JSON                                    |
| **Rate Limit**       | Few times daily                         |
| **Update Frequency** | Daily (6-hour delay)                    |
| **Job Count**        | 5,000+ listings                         |
| **Focus**            | Remote jobs worldwide                   |
| **Remote Filter**    | All jobs are remote                     |
| **Salary Data**      | Yes                                     |

```typescript
interface JobicyJob {
  id: number
  url: string
  jobTitle: string
  companyName: string
  companyLogo: string
  jobIndustry: string // Category
  jobType: string // 'full-time', 'contract', 'part-time'
  jobGeo: string // Geographic restriction or 'Anywhere'
  jobLevel: string // 'Senior', 'Mid', 'Junior', 'Any'
  jobExcerpt: string
  jobDescription: string // HTML
  pubDate: string
  annualSalaryMin?: string
  annualSalaryMax?: string
  salaryCurrency?: string
}

// Example fetch with filters
const response = await fetch(
  'https://jobicy.com/api/v2/remote-jobs?count=50&industry=dev&geo=europe'
)
const data = await response.json()
const jobs: JobicyJob[] = data.jobs
```

**Query Parameters:**

- `count` - Number of listings (1-100)
- `geo` - Filter by region: `usa`, `europe`, `uk`, `canada`, etc.
- `industry` - Filter by category: `dev`, `marketing`, `design`, `data-science`, etc.
- `tag` - Search keywords

**Pros:**

- Built-in geo filtering (great for EU)
- Seniority level included
- Good salary data
- Industry categorization

**Cons:**

- 6-hour publication delay
- Don't poll frequently
- Must attribute Jobicy

---

### 6. Remotive

| Property             | Value                                  |
| -------------------- | -------------------------------------- |
| **API Endpoint**     | `https://remotive.com/api/remote-jobs` |
| **Format**           | JSON                                   |
| **Rate Limit**       | Reasonable use                         |
| **Update Frequency** | Daily (24-hour delay)                  |
| **Job Count**        | 3,000+ listings                        |
| **Focus**            | Remote jobs                            |
| **Remote Filter**    | All jobs are remote                    |
| **Salary Data**      | Sometimes                              |

```typescript
interface RemotiveJob {
  id: number
  url: string
  title: string
  company_name: string
  company_logo: string
  category: string
  job_type: string
  publication_date: string
  candidate_required_location: string
  salary: string
  description: string
}

// Example fetch
const response = await fetch('https://remotive.com/api/remote-jobs')
const data = await response.json()
const jobs: RemotiveJob[] = data.jobs

// Filter by category
const response = await fetch(
  'https://remotive.com/api/remote-jobs?category=software-dev'
)
```

**Categories:**

- `software-dev`
- `customer-support`
- `design`
- `marketing`
- `sales`
- `product`
- `data`
- `devops`
- `finance`
- `hr`

**Pros:**

- Clean categorization
- Good for filtering by job type

**Cons:**

- 24-hour delay
- Must attribute and link back
- Cannot redistribute

---

## 🟡 Free Tier APIs (Authentication Required)

### 7. The Muse

| Property           | Value                                     |
| ------------------ | ----------------------------------------- |
| **API Endpoint**   | `https://www.themuse.com/api/public/jobs` |
| **Format**         | JSON                                      |
| **Rate Limit**     | 3600 requests/hour                        |
| **Authentication** | API key (free)                            |
| **Focus**          | US-focused, company profiles              |

```typescript
// Example fetch
const response = await fetch(
  'https://www.themuse.com/api/public/jobs?page=1&descending=true&api_key=YOUR_KEY'
)
```

---

### 8. Adzuna

| Property           | Value                                                   |
| ------------------ | ------------------------------------------------------- |
| **API Endpoint**   | `https://api.adzuna.com/v1/api/jobs/{country}/search/1` |
| **Format**         | JSON                                                    |
| **Rate Limit**     | 250 requests/day (free tier)                            |
| **Authentication** | API key (free)                                          |
| **Focus**          | Multi-country job aggregator                            |

---

## 📋 Unified Job Interface

To integrate multiple providers, normalize them to a common interface:

```typescript
interface UnifiedJob {
  // Identifiers
  id: string
  source: 'hn' | 'remoteok' | 'arbeitnow' | 'himalayas' | 'jobicy' | 'remotive'
  sourceUrl: string

  // Company info
  company: string
  companyLogo?: string

  // Job details
  title: string
  description: string // HTML or plain text
  descriptionPlain: string // Plain text for matching

  // Location & Remote
  isRemote: boolean
  location?: string
  locationRestrictions?: string[] // e.g., ['EU', 'US']
  timezone?: string

  // Employment
  employmentType:
    | 'full-time'
    | 'part-time'
    | 'contract'
    | 'freelance'
    | 'internship'
  seniorityLevel?: 'junior' | 'mid' | 'senior' | 'lead' | 'principal' | 'any'

  // Compensation
  salary?: {
    min?: number
    max?: number
    currency: string
    period: 'yearly' | 'monthly' | 'hourly'
  }

  // Metadata
  tags: string[] // Skills/technologies
  category?: string
  postedAt: Date
  expiresAt?: Date

  // Application
  applyUrl: string
}
```

---

## 🔧 Provider Adapter Pattern

Create adapters for each provider:

```typescript
// types/jobProviders.ts
export interface JobProvider {
  name: string
  fetch(options?: FetchOptions): Promise<UnifiedJob[]>
  supportsFilters: {
    remote: boolean
    location: boolean
    category: boolean
    seniority: boolean
  }
}

export interface FetchOptions {
  limit?: number
  offset?: number
  remote?: boolean
  location?: string
  category?: string
  keywords?: string
}

// providers/remoteok.ts
export class RemoteOKProvider implements JobProvider {
  name = 'remoteok'
  supportsFilters = {
    remote: false, // All are remote
    location: false,
    category: true,
    seniority: false,
  }

  async fetch(options?: FetchOptions): Promise<UnifiedJob[]> {
    const response = await fetch('https://remoteok.com/api')
    const data = await response.json()

    // Skip first element (metadata)
    return data.slice(1).map(this.normalize)
  }

  private normalize(job: RemoteOKJob): UnifiedJob {
    return {
      id: `remoteok-${job.id}`,
      source: 'remoteok',
      sourceUrl: `https://remoteok.com/remote-jobs/${job.slug}`,
      company: job.company,
      companyLogo: job.company_logo,
      title: job.position,
      description: job.description,
      descriptionPlain: stripHtml(job.description),
      isRemote: true,
      location: job.location,
      employmentType: 'full-time',
      salary: job.salary_min
        ? {
            min: job.salary_min,
            max: job.salary_max,
            currency: 'USD',
            period: 'yearly',
          }
        : undefined,
      tags: job.tags || [],
      postedAt: new Date(job.epoch * 1000),
      applyUrl: job.apply_url || `https://remoteok.com/remote-jobs/${job.slug}`,
    }
  }
}

// providers/jobicy.ts
export class JobicyProvider implements JobProvider {
  name = 'jobicy'
  supportsFilters = {
    remote: false, // All are remote
    location: true, // geo parameter
    category: true, // industry parameter
    seniority: false,
  }

  async fetch(options?: FetchOptions): Promise<UnifiedJob[]> {
    const params = new URLSearchParams({
      count: String(options?.limit || 50),
    })

    if (options?.location) {
      params.set('geo', this.mapLocation(options.location))
    }
    if (options?.category) {
      params.set('industry', options.category)
    }
    if (options?.keywords) {
      params.set('tag', options.keywords)
    }

    const response = await fetch(
      `https://jobicy.com/api/v2/remote-jobs?${params}`
    )
    const data = await response.json()

    return data.jobs.map(this.normalize)
  }

  private mapLocation(location: string): string {
    const locationMap: Record<string, string> = {
      europe: 'europe',
      eu: 'europe',
      usa: 'usa',
      us: 'usa',
      uk: 'uk',
      canada: 'canada',
    }
    return locationMap[location.toLowerCase()] || location
  }

  private normalize(job: JobicyJob): UnifiedJob {
    return {
      id: `jobicy-${job.id}`,
      source: 'jobicy',
      sourceUrl: job.url,
      company: job.companyName,
      companyLogo: job.companyLogo,
      title: job.jobTitle,
      description: job.jobDescription,
      descriptionPlain: stripHtml(job.jobDescription),
      isRemote: true,
      location: job.jobGeo,
      employmentType: job.jobType as any,
      seniorityLevel: this.mapSeniority(job.jobLevel),
      salary: job.annualSalaryMin
        ? {
            min: parseInt(job.annualSalaryMin),
            max: job.annualSalaryMax
              ? parseInt(job.annualSalaryMax)
              : undefined,
            currency: job.salaryCurrency || 'USD',
            period: 'yearly',
          }
        : undefined,
      tags: [], // Parse from description
      category: job.jobIndustry,
      postedAt: new Date(job.pubDate),
      applyUrl: job.url,
    }
  }

  private mapSeniority(level: string): UnifiedJob['seniorityLevel'] {
    const map: Record<string, UnifiedJob['seniorityLevel']> = {
      Senior: 'senior',
      Mid: 'mid',
      Junior: 'junior',
      Lead: 'lead',
      Any: 'any',
    }
    return map[level] || 'any'
  }
}
```

---

## 🔀 Aggregator Service

Combine all providers:

```typescript
// services/jobAggregator.ts
import { JobProvider, UnifiedJob, FetchOptions } from '@/types/jobProviders'
import { RemoteOKProvider } from '@/providers/remoteok'
import { JobicyProvider } from '@/providers/jobicy'
import { HimalayasProvider } from '@/providers/himalayas'
import { ArbeitnowProvider } from '@/providers/arbeitnow'
import { HNProvider } from '@/providers/hn'
import { matchJobWithTemperature } from '@/lib/skillMatcher'

export class JobAggregator {
  private providers: JobProvider[]

  constructor(enabledProviders?: string[]) {
    const allProviders = [
      new HNProvider(),
      new RemoteOKProvider(),
      new JobicyProvider(),
      new HimalayasProvider(),
      new ArbeitnowProvider(),
    ]

    this.providers = enabledProviders
      ? allProviders.filter((p) => enabledProviders.includes(p.name))
      : allProviders
  }

  async fetchAll(options?: FetchOptions): Promise<UnifiedJob[]> {
    const results = await Promise.allSettled(
      this.providers.map((provider) => provider.fetch(options))
    )

    const jobs: UnifiedJob[] = []

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        jobs.push(...result.value)
      } else {
        console.warn(
          `Provider ${this.providers[index].name} failed:`,
          result.reason
        )
      }
    })

    // Deduplicate by company + title similarity
    return this.deduplicate(jobs)
  }

  async fetchAndMatch(
    options?: FetchOptions & { temperature?: number }
  ): Promise<Array<UnifiedJob & { matchResult: MatchResult }>> {
    const jobs = await this.fetchAll(options)
    const temperature = options?.temperature ?? 0.5

    return jobs
      .map((job) => ({
        ...job,
        matchResult: matchJobWithTemperature(job.descriptionPlain, {
          temperature,
        }),
      }))
      .filter((job) => job.matchResult.recommendation !== 'skip')
      .sort((a, b) => b.matchResult.score - a.matchResult.score)
  }

  private deduplicate(jobs: UnifiedJob[]): UnifiedJob[] {
    const seen = new Map<string, UnifiedJob>()

    for (const job of jobs) {
      const key =
        `${job.company.toLowerCase()}-${job.title.toLowerCase()}`.replace(
          /[^a-z0-9]/g,
          ''
        )

      if (!seen.has(key)) {
        seen.set(key, job)
      }
    }

    return Array.from(seen.values())
  }
}
```

---

## 📊 Provider Comparison

| Provider             | Jobs       | Remote Only | EU Filter | Salary    | Seniority | Rate Limit | Best For                  |
| -------------------- | ---------- | ----------- | --------- | --------- | --------- | ---------- | ------------------------- |
| **HN Who is Hiring** | ~400/month | Mixed       | Manual    | Sometimes | Manual    | Low        | High-quality startup jobs |
| **RemoteOK**         | 30,000+    | ✅ Yes      | ❌ No     | ✅ Yes    | ❌ No     | Medium     | Large remote dataset      |
| **Arbeitnow**        | 10,000+    | Filter      | ✅ Yes    | Sometimes | ❌ No     | Medium     | European tech jobs        |
| **Himalayas**        | 5,000+     | ✅ Yes      | ✅ Yes    | ✅ Yes    | ❌ No     | Strict     | Clean data, restrictions  |
| **Jobicy**           | 5,000+     | ✅ Yes      | ✅ Yes    | ✅ Yes    | ✅ Yes    | Low        | EU + seniority filter     |
| **Remotive**         | 3,000+     | ✅ Yes      | ❌ No     | Sometimes | ❌ No     | Medium     | Good categorization       |

---

## 👔 Job Categories & Role Types by Provider

### HN "Who is Hiring?" - Role Distribution

**Important:** HN is heavily tech/engineering focused. Here's the realistic breakdown:

| Role Category            | Presence | Notes                                              |
| ------------------------ | -------- | -------------------------------------------------- |
| **Software Engineering** | ~70-80%  | Frontend, Backend, Full Stack, DevOps, SRE, Mobile |
| **Data/ML/AI**           | ~10-15%  | Data Engineer, ML Engineer, AI Researcher          |
| **Product Design/UX**    | ~5-8%    | Usually at startups hiring multiple roles          |
| **Product Management**   | ~3-5%    | Technical PM roles                                 |
| **Marketing**            | ~1-3%    | Growth, Developer Relations, Content Marketing     |
| **HR/People Ops**        | <1%      | Very rare                                          |
| **Admin/Operations**     | <1%      | Almost never                                       |
| **Sales**                | <1%      | Occasionally "Solutions Engineer"                  |

**Bottom line:** If you're not in tech/engineering, HN is not your best source.

---

### Category Filters by Provider

#### RemoteOK Categories

Filter by adding the category to the URL: `https://remoteok.com/remote-{category}-jobs`

| Category         | URL Slug    | Good For                              |
| ---------------- | ----------- | ------------------------------------- |
| Development      | `dev`       | All engineering roles                 |
| Design           | `design`    | UI/UX, Product Design, Graphic Design |
| Marketing        | `marketing` | Growth, Content, SEO, Social Media    |
| Sales            | `sales`     | Account Executive, SDR, Sales Ops     |
| Customer Support | `support`   | Customer Success, Support             |
| DevOps/Sysadmin  | `devops`    | Infrastructure, SRE, Platform         |
| Finance          | `finance`   | Accounting, FP&A                      |
| HR               | `hr`        | People Ops, Recruiting, HR            |
| Product          | `product`   | Product Management                    |
| Data             | `data`      | Data Science, Analytics               |
| Legal            | `legal`     | Legal, Compliance                     |
| Writing          | `writing`   | Technical Writing, Content            |
| All              | `jobs`      | Everything                            |

```typescript
// Example: Fetch only marketing jobs
const response = await fetch('https://remoteok.com/remote-marketing-jobs.json')

// Example: Fetch only design jobs
const response = await fetch('https://remoteok.com/remote-design-jobs.json')
```

---

#### Jobicy Categories (industry parameter)

`https://jobicy.com/api/v2/remote-jobs?industry={category}`

| Category             | Parameter Value      | Good For                       |
| -------------------- | -------------------- | ------------------------------ |
| Development          | `dev`                | Software Engineering           |
| Design & Multimedia  | `design-multimedia`  | UI/UX, Graphic Design, Video   |
| Marketing & Sales    | `marketing`          | Marketing, Growth, Sales       |
| Customer Support     | `supporting`         | Support, Success               |
| Data Science         | `data-science`       | Data, Analytics, ML            |
| Copywriting          | `copywriting`        | Content, Technical Writing     |
| Human Resources      | `hr`                 | HR, Recruiting, People Ops     |
| Accounting & Finance | `accounting-finance` | Finance, Accounting            |
| Admin & Support      | `admin-support`      | Admin, Operations, EA          |
| Management           | `management`         | Leadership, Management         |
| Legal                | `legal`              | Legal, Compliance              |
| Education            | `education`          | Training, Instructional Design |
| Healthcare           | `healthcare`         | Health-related roles           |
| Engineering          | `engineering`        | Non-software engineering       |
| SEO                  | `seo`                | SEO Specialists                |
| Social Media         | `smm`                | Social Media Management        |

```typescript
// Example: Fetch HR jobs in Europe
const response = await fetch(
  'https://jobicy.com/api/v2/remote-jobs?industry=hr&geo=europe'
)

// Example: Fetch Design jobs anywhere
const response = await fetch(
  'https://jobicy.com/api/v2/remote-jobs?industry=design-multimedia&count=50'
)

// Example: Fetch Marketing + Sales jobs
const response = await fetch(
  'https://jobicy.com/api/v2/remote-jobs?industry=marketing&geo=europe'
)
```

---

#### Himalayas Categories

Categories are returned in the job object, filter client-side or use search:

| Category         | Notes                       |
| ---------------- | --------------------------- |
| Engineering      | Software, DevOps, QA        |
| Design           | Product Design, UX/UI       |
| Product          | Product Management          |
| Marketing        | Growth, Content, SEO        |
| Sales            | Sales, Business Development |
| Customer Success | Support, Success            |
| Operations       | Ops, Admin                  |
| Finance          | Accounting, Finance         |
| People           | HR, Recruiting              |
| Data             | Analytics, Data Science     |
| Legal            | Legal, Compliance           |

```typescript
// Fetch all jobs and filter by category client-side
const response = await fetch('https://himalayas.app/jobs/api?limit=20')
const data = await response.json()

// Filter for design jobs
const designJobs = data.jobs.filter((job) =>
  job.categories.some((cat) => cat.toLowerCase().includes('design'))
)

// Filter for marketing jobs
const marketingJobs = data.jobs.filter((job) =>
  job.categories.some((cat) => cat.toLowerCase().includes('marketing'))
)
```

---

#### Remotive Categories

`https://remotive.com/api/remote-jobs?category={category}`

| Category             | Parameter Value    | Good For                   |
| -------------------- | ------------------ | -------------------------- |
| Software Development | `software-dev`     | All engineering            |
| Design               | `design`           | UI/UX, Product Design      |
| Marketing            | `marketing`        | Marketing, Growth          |
| Sales                | `sales`            | Sales roles                |
| Customer Support     | `customer-support` | Support, Success           |
| Product              | `product`          | Product Management         |
| Data                 | `data`             | Data Science, Analytics    |
| DevOps / Sysadmin    | `devops`           | Infrastructure             |
| Finance / Legal      | `finance-legal`    | Finance, Legal, Accounting |
| Human Resources      | `hr`               | HR, Recruiting             |
| QA                   | `qa`               | Quality Assurance          |
| Writing              | `writing`          | Content, Technical Writing |
| All Others           | `all-others`       | Miscellaneous              |

```typescript
// Example: Fetch design jobs
const response = await fetch(
  'https://remotive.com/api/remote-jobs?category=design'
)

// Example: Fetch HR jobs
const response = await fetch('https://remotive.com/api/remote-jobs?category=hr')
```

---

#### Arbeitnow Categories

Categories are in the `tags` array, filter client-side:

```typescript
const response = await fetch('https://www.arbeitnow.com/api/job-board-api')
const data = await response.json()

// Filter for marketing jobs
const marketingJobs = data.data.filter((job) =>
  job.tags.some((tag) =>
    ['marketing', 'growth', 'seo', 'content'].includes(tag.toLowerCase())
  )
)

// Filter for design jobs
const designJobs = data.data.filter((job) =>
  job.tags.some((tag) =>
    ['design', 'ux', 'ui', 'product design'].includes(tag.toLowerCase())
  )
)
```

---

### 🎯 Best API by Role Type

| If you're a...          | Primary APIs                | Secondary APIs | Avoid             |
| ----------------------- | --------------------------- | -------------- | ----------------- |
| **Software Engineer**   | HN, RemoteOK, Jobicy        | All others     | -                 |
| **UX/Product Designer** | Jobicy, RemoteOK, Remotive  | Himalayas      | HN (few listings) |
| **Product Manager**     | RemoteOK, Jobicy, Himalayas | Remotive       | HN (rare)         |
| **Marketing**           | Jobicy, RemoteOK, Remotive  | Arbeitnow      | HN (very rare)    |
| **HR/People Ops**       | Jobicy, Remotive            | Himalayas      | HN, RemoteOK      |
| **Sales**               | RemoteOK, Jobicy            | Remotive       | HN                |
| **Data/Analytics**      | HN, RemoteOK, Jobicy        | All others     | -                 |
| **Customer Support**    | RemoteOK, Jobicy, Remotive  | Arbeitnow      | HN                |
| **Finance/Accounting**  | Jobicy, Remotive            | RemoteOK       | HN                |
| **Admin/Operations**    | Jobicy, Arbeitnow           | Remotive       | HN, RemoteOK      |
| **Technical Writing**   | RemoteOK, Remotive          | Jobicy         | HN                |
| **DevOps/SRE**          | HN, RemoteOK, Jobicy        | All others     | -                 |

---

### Category Coverage Comparison

| Category        | HN           | RemoteOK     | Jobicy        | Himalayas | Remotive | Arbeitnow |
| --------------- | ------------ | ------------ | ------------- | --------- | -------- | --------- |
| **Engineering** | ✅ Excellent | ✅ Excellent | ✅ Excellent  | ✅ Good   | ✅ Good  | ✅ Good   |
| **Design/UX**   | ⚠️ Few       | ✅ Good      | ✅ Good       | ✅ Good   | ✅ Good  | ⚠️ Few    |
| **Product**     | ⚠️ Few       | ✅ Good      | ✅ Good       | ✅ Good   | ✅ Good  | ⚠️ Few    |
| **Marketing**   | ❌ Rare      | ✅ Good      | ✅ Good       | ✅ Good   | ✅ Good  | ⚠️ Some   |
| **Sales**       | ❌ Rare      | ✅ Good      | ✅ Good       | ⚠️ Some   | ⚠️ Some  | ⚠️ Few    |
| **HR/People**   | ❌ No        | ⚠️ Few       | ✅ Good       | ⚠️ Some   | ✅ Good  | ⚠️ Few    |
| **Finance**     | ❌ No        | ⚠️ Few       | ✅ Good       | ⚠️ Some   | ✅ Good  | ⚠️ Few    |
| **Admin/Ops**   | ❌ No        | ⚠️ Few       | ✅ Good       | ⚠️ Few    | ⚠️ Few   | ⚠️ Some   |
| **Support**     | ❌ No        | ✅ Good      | ✅ Good       | ⚠️ Some   | ✅ Good  | ⚠️ Some   |
| **Data/ML**     | ✅ Good      | ✅ Good      | ✅ Good       | ✅ Good   | ✅ Good  | ⚠️ Some   |
| **Legal**       | ❌ No        | ⚠️ Few       | ✅ Has filter | ⚠️ Few    | ⚠️ Few   | ❌ Rare   |
| **Writing**     | ❌ Rare      | ✅ Good      | ✅ Good       | ⚠️ Some   | ✅ Good  | ⚠️ Few    |

---

### Multi-Category Fetching Example

```typescript
// types/jobCategories.ts
export type JobCategory =
  | 'engineering'
  | 'design'
  | 'product'
  | 'marketing'
  | 'sales'
  | 'hr'
  | 'finance'
  | 'support'
  | 'data'
  | 'operations'
  | 'writing'
  | 'legal'

// Map categories to provider-specific values
export const CATEGORY_MAP: Record<
  JobCategory,
  {
    remoteok?: string
    jobicy?: string
    remotive?: string
  }
> = {
  engineering: {
    remoteok: 'dev',
    jobicy: 'dev',
    remotive: 'software-dev',
  },
  design: {
    remoteok: 'design',
    jobicy: 'design-multimedia',
    remotive: 'design',
  },
  product: {
    remoteok: 'product',
    jobicy: 'management', // closest match
    remotive: 'product',
  },
  marketing: {
    remoteok: 'marketing',
    jobicy: 'marketing',
    remotive: 'marketing',
  },
  sales: {
    remoteok: 'sales',
    jobicy: 'marketing', // combined in Jobicy
    remotive: 'sales',
  },
  hr: {
    remoteok: 'hr',
    jobicy: 'hr',
    remotive: 'hr',
  },
  finance: {
    remoteok: 'finance',
    jobicy: 'accounting-finance',
    remotive: 'finance-legal',
  },
  support: {
    remoteok: 'support',
    jobicy: 'supporting',
    remotive: 'customer-support',
  },
  data: {
    remoteok: 'data',
    jobicy: 'data-science',
    remotive: 'data',
  },
  operations: {
    remoteok: undefined, // filter client-side
    jobicy: 'admin-support',
    remotive: 'all-others',
  },
  writing: {
    remoteok: 'writing',
    jobicy: 'copywriting',
    remotive: 'writing',
  },
  legal: {
    remoteok: 'legal',
    jobicy: 'legal',
    remotive: 'finance-legal',
  },
}

// Usage example
async function fetchJobsByCategory(category: JobCategory) {
  const mappings = CATEGORY_MAP[category]
  const results = []

  // Fetch from Jobicy (has best category support)
  if (mappings.jobicy) {
    const jobicy = await fetch(
      `https://jobicy.com/api/v2/remote-jobs?industry=${mappings.jobicy}&count=50`
    )
    results.push(...(await jobicy.json()).jobs)
  }

  // Fetch from Remotive
  if (mappings.remotive) {
    const remotive = await fetch(
      `https://remotive.com/api/remote-jobs?category=${mappings.remotive}`
    )
    results.push(...(await remotive.json()).jobs)
  }

  return results
}
```

---

## 🎯 Recommended Setup by Role

### For Software Engineers (EU-based, Senior)

Based on profile: Principal Engineer, Bologna, Italy, EU timezone

1. **Primary Sources:**
   - **HN Who is Hiring** - Best signal-to-noise for senior roles
   - **Jobicy** (with `geo=europe&industry=dev`) - Built-in EU filtering + seniority
   - **Arbeitnow** (with `remote=true`) - European focus

2. **Secondary Sources:**
   - **Himalayas** - Good for location restrictions
   - **RemoteOK** - Volume, but requires more filtering

3. **Skip:**
   - **Remotive** - Lower signal for senior EU roles

---

### For UX/Product Designers

1. **Primary Sources:**
   - **Jobicy** (`industry=design-multimedia`) - Good EU coverage
   - **RemoteOK** (`/remote-design-jobs`) - Large dataset
   - **Remotive** (`category=design`) - Clean categorization

2. **Secondary Sources:**
   - **Himalayas** - Filter by Design category
   - **Arbeitnow** - Some design roles

3. **Skip:**
   - **HN Who is Hiring** - Very few design roles (~5%)

---

### For Marketing Professionals

1. **Primary Sources:**
   - **Jobicy** (`industry=marketing`) - Best category coverage
   - **RemoteOK** (`/remote-marketing-jobs`) - Large dataset
   - **Remotive** (`category=marketing`) - Good options

2. **Secondary Sources:**
   - **Himalayas** - Some marketing roles
   - **Arbeitnow** - European marketing jobs

3. **Skip:**
   - **HN Who is Hiring** - Almost no marketing roles

---

### For HR/People Operations

1. **Primary Sources:**
   - **Jobicy** (`industry=hr`) - Has dedicated HR category
   - **Remotive** (`category=hr`) - Good HR coverage

2. **Secondary Sources:**
   - **Himalayas** - Some HR roles
   - **RemoteOK** (`/remote-hr-jobs`) - Limited but exists

3. **Skip:**
   - **HN Who is Hiring** - No HR roles
   - **Arbeitnow** - Very few HR positions

---

### For Product Managers

1. **Primary Sources:**
   - **RemoteOK** (`/remote-product-jobs`) - Good coverage
   - **Jobicy** (`industry=management`) - Closest match
   - **Remotive** (`category=product`) - Dedicated category

2. **Secondary Sources:**
   - **Himalayas** - Product category available
   - **HN Who is Hiring** - Some PM roles at startups

3. **Skip:**
   - **Arbeitnow** - Few PM roles

---

### For Data/Analytics Professionals

1. **Primary Sources:**
   - **HN Who is Hiring** - Strong data/ML presence
   - **Jobicy** (`industry=data-science`) - Dedicated category
   - **RemoteOK** (`/remote-data-jobs`) - Large dataset

2. **Secondary Sources:**
   - **Remotive** (`category=data`) - Good options
   - **Himalayas** - Data category

3. **All sources are good** for data roles

---

## 🚀 Quick Start

```typescript
// hooks/useAggregatedJobs.ts
import { useQuery } from '@tanstack/react-query'
import { JobAggregator } from '@/services/jobAggregator'

export function useAggregatedJobs(temperature = 0.5) {
  const aggregator = new JobAggregator([
    'hn',
    'jobicy',
    'arbeitnow',
    'himalayas',
  ])

  return useQuery({
    queryKey: ['jobs', temperature],
    queryFn: () =>
      aggregator.fetchAndMatch({
        temperature,
        location: 'europe',
      }),
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  })
}
```

---

## ⚖️ Terms of Service & Licensing

### TOS Summary Table

| Provider        | License            | Attribution Required?    | Private Repo OK? | Key Restriction                     |
| --------------- | ------------------ | ------------------------ | ---------------- | ----------------------------------- |
| **Hacker News** | **MIT License** ✅ | Include copyright notice | ✅ **Yes**       | None for personal use               |
| **RemoteOK**    | Custom ToS         | ⚠️ Only if public        | ✅ **Yes**       | Don't redistribute to job boards    |
| **Arbeitnow**   | Custom ToS         | ⚠️ Only if public        | ✅ **Yes**       | Link back when displaying publicly  |
| **Himalayas**   | Custom ToS         | ⚠️ Only if public        | ✅ **Yes**       | Don't submit to 3rd party job sites |
| **Jobicy**      | Custom ToS         | ⚠️ Only if public        | ✅ **Yes**       | Don't redistribute to job boards    |
| **Remotive**    | Custom ToS         | ⚠️ Only if public        | ✅ **Yes**       | Don't redistribute to job boards    |

---

### 🟢 Hacker News API - MIT License (Most Permissive)

**License:** MIT License  
**Source:** https://github.com/HackerNews/API/blob/master/LICENSE

```
Copyright (c) Y Combinator Hacker News

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

**What this means:**

- ✅ Use for any purpose (personal, commercial, open source)
- ✅ Modify and distribute
- ✅ Private repositories - no public attribution needed
- ✅ No rate limit specified
- 📝 Just include the MIT license notice somewhere in your project

**Recommended:** Add to your `LICENSES.md` or as a comment:

```typescript
/**
 * Hacker News API - MIT License
 * Copyright (c) Y Combinator
 * https://github.com/HackerNews/API
 */
```

---

### 🟡 RemoteOK - Custom ToS

**ToS Source:** https://remoteok.com/legal  
**API Documentation:** https://remoteok.com/api

**Key Terms:**

> "Please link back to the URL on Remote OK and mention Remote OK as a source, **so we get traffic back from your site**. If you do not we'll have to suspend API access."

**Interpretation:**

- The purpose is "so we get traffic back" → implies **public-facing** usage
- ✅ **Private portfolio/personal tool:** No attribution needed
- ⚠️ **Public website/app:** Must link back to RemoteOK
- ❌ Don't redistribute to other job boards (LinkedIn, Indeed, Jooble, Google Jobs)
- ❌ Don't use RemoteOK logo without permission
- ⏰ Data is delayed 24 hours from live site

---

### 🟡 Jobicy - Custom ToS

**ToS Source:** https://jobicy.com/jobs-rss-feed  
**GitHub:** https://github.com/Jobicy/remote-jobs-api

**Key Terms:**

> "Anyone can use the feed, all we ask is that you attribute the links back to Jobicy.com"
> "Primary Purpose of API/RSS Access: Our API/RSS access is primarily intended to facilitate the **wider distribution** of our job listings."

**Restrictions:**

- ✅ **Private portfolio/personal tool:** No attribution needed
- ⚠️ **Public website/app:** Link back to Jobicy.com
- ❌ Don't redistribute to: Jooble, Google Jobs, LinkedIn, or other job platforms
- ⏰ Jobs are published with 6-hour delay
- 🔄 Don't poll more than once per hour
- 📊 Accessing a few times daily is sufficient

---

### 🟡 Himalayas - Custom ToS

**ToS Source:** https://himalayas.app/api

**Key Terms:**

> "Our public API can be used to backfill other remote job boards. Anyone can use the interface, but please link back to the URL found on Himalayas AND mention Himalayas as the original source."

**Restrictions:**

- ✅ **Private portfolio/personal tool:** No attribution needed
- ⚠️ **Public website/app:** Link back + mention Himalayas
- ❌ Don't submit to: Jooble, Neuvoo, Google Jobs, LinkedIn Jobs
- 🔄 Rate limited - max 20 jobs per request
- 📊 RSS feed shows only 100 most recent jobs

---

### 🟡 Arbeitnow - Custom ToS

**ToS Source:** https://www.arbeitnow.com/blog/job-board-api

**Key Terms:**

> "Anyone can use the interface, but please link back to the URL found on Arbeitnow AND mention Arbeitnow as a source"

**Restrictions:**

- ✅ **Private portfolio/personal tool:** No attribution needed
- ⚠️ **Public website/app:** Link back + mention Arbeitnow
- ❌ Don't redistribute to third-party job platforms

---

### 🟡 Remotive - Custom ToS

**ToS Source:** https://remotive.com/remote-jobs/api

**Key Terms:**

> "API documentation and access is granted so that developers can share our jobs further. Please do not submit Remotive jobs to third Party websites."
> "Please link back to the URL found on Remotive AND mention Remotive as a source in order to get traffic from your listing. If you don't do that, we'll terminate your API access."

**Restrictions:**

- ✅ **Private portfolio/personal tool:** No attribution needed
- ⚠️ **Public website/app:** Link back + mention Remotive
- ❌ Don't redistribute to: Jooble, Neuvoo, Google Jobs, LinkedIn Jobs
- ❌ Don't collect signups/emails using their job listings
- ⏰ Jobs are delayed 24 hours

---

## 🏠 What This Means for Private/Personal Use

If you're building a **private portfolio** or **personal job search tool** in a **private repository**, here's what applies:

### ✅ You CAN:

- Use all these APIs freely for personal job searching
- Store/cache job data locally for your own use
- Build matching algorithms and filters
- Keep the repository private with no attribution
- Modify and transform the data for your personal analysis

### ❌ You CANNOT:

- Republish jobs to other job boards (LinkedIn, Indeed, etc.)
- Sell or monetize the job data
- Create a competing public job board
- Exceed rate limits (poll excessively)

### 📝 Recommended Practice for Private Repos

Even though not required, add this comment to your codebase as good practice:

```typescript
// lib/jobProviders/index.ts

/**
 * Job Data Sources & Licensing
 * ============================
 *
 * This project uses the following job APIs for personal use:
 *
 * - Hacker News API (MIT License)
 *   https://github.com/HackerNews/API
 *
 * - RemoteOK API (Personal use - no redistribution)
 *   https://remoteok.com/api
 *
 * - Jobicy API (Personal use - no redistribution)
 *   https://jobicy.com/jobs-rss-feed
 *
 * - Himalayas API (Personal use - no redistribution)
 *   https://himalayas.app/api
 *
 * - Arbeitnow API (Personal use - no redistribution)
 *   https://www.arbeitnow.com/blog/job-board-api
 *
 * NOTE: If this project is ever made public or used commercially,
 * proper attribution and linking back to sources is required.
 * Do not redistribute job data to other job platforms.
 */
```

---

## 🌐 If You Ever Make It Public

If you decide to open-source your project or deploy it publicly, you'll need to:

1. **Add visible attribution** in the UI:

   ```tsx
   <footer>
     Job data provided by <a href="https://remoteok.com">RemoteOK</a>,{' '}
     <a href="https://jobicy.com">Jobicy</a>,{' '}
     <a href="https://himalayas.app">Himalayas</a>
   </footer>
   ```

2. **Link job listings back to source:**

   ```tsx
   <a href={job.sourceUrl} target="_blank" rel="noopener">
     View on {job.source}
   </a>
   ```

3. **Include the HN MIT license** in your LICENSE file

4. **Don't allow redistribution** to other job boards from your platform

---

## ⚠️ General Best Practices

1. **Cache Aggressively** - Don't poll APIs more than necessary
   - HN: Once per day (monthly thread)
   - RemoteOK/Remotive: Once per day (24h delay anyway)
   - Jobicy: Few times per day max
   - Himalayas: Respect rate limits

2. **Don't Redistribute** - Never submit jobs to LinkedIn, Indeed, Google Jobs, etc.

3. **Respect Rate Limits** - If you get 429 errors, back off

4. **Keep Source URLs** - Always preserve links back to original job postings

5. **Don't Claim Ownership** - The job data belongs to the providers

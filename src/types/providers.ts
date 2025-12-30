/**
 * Job provider types and configuration registry.
 * Supports multiple job board sources with provider-specific options.
 */

/**
 * Supported job provider identifiers
 */
export type JobProviderId =
  | 'hn'
  | 'arbeitnow'
  | 'remoteok'
  | 'jobicy'
  | 'remotive'

/**
 * Provider metadata for UI display and configuration
 */
export interface JobProviderMeta {
  id: JobProviderId
  name: string
  description: string
  apiUrl: string
  /** Cache duration in milliseconds */
  cacheDuration: number
}

/**
 * Provider-specific options (type-safe per provider)
 */
export interface ProviderOptions {
  hn: Record<string, never> // HN has no extra options
  arbeitnow: {
    remoteOnly?: boolean // Maps to ?remote=true
  }
  remoteok: Record<string, never> // All jobs are remote, no options needed
  jobicy: Record<string, never> // All jobs are remote
  remotive: Record<string, never> // All jobs are remote
}

/**
 * Arbeitnow API job response structure
 */
export interface ArbeitnowApiJob {
  slug: string
  company_name: string
  title: string
  description: string // HTML
  remote: boolean
  url: string
  tags: string[]
  job_types: string[]
  location: string
  created_at: number // Unix timestamp
}

/**
 * Arbeitnow API response wrapper
 */
export interface ArbeitnowApiResponse {
  data: ArbeitnowApiJob[]
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number
    last_page: number
    path: string
    per_page: number
    to: number
    total: number
    terms: string
    info: string
  }
}

/**
 * RemoteOK API job response structure
 */
export interface RemoteOKApiJob {
  slug: string
  id: string
  epoch: number
  date: string
  company: string
  company_logo: string
  position: string
  tags: string[]
  description: string
  location: string
  salary_min?: number
  salary_max?: number
  apply_url: string
}

/**
 * Jobicy API job response structure
 */
export interface JobicyApiJob {
  id: number
  url: string
  jobTitle: string
  companyName: string
  companyLogo: string
  jobIndustry: string
  jobType: string
  jobGeo: string
  jobLevel: string
  jobExcerpt: string
  jobDescription: string // HTML
  pubDate: string
  annualSalaryMin?: string
  annualSalaryMax?: string
  salaryCurrency?: string
}

/**
 * Jobicy API response wrapper
 */
export interface JobicyApiResponse {
  jobs: JobicyApiJob[]
}

/**
 * Remotive API job response structure
 */
export interface RemotiveApiJob {
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

/**
 * Remotive API response wrapper
 */
export interface RemotiveApiResponse {
  jobs: RemotiveApiJob[]
}

/**
 * Provider configuration registry
 */
export const PROVIDERS: Record<JobProviderId, JobProviderMeta> = {
  hn: {
    id: 'hn',
    name: 'Hacker News',
    description: 'Who is Hiring threads from Hacker News',
    apiUrl: 'https://hn.algolia.com/api/v1',
    cacheDuration: 24 * 60 * 60 * 1000, // 1 day
  },
  arbeitnow: {
    id: 'arbeitnow',
    name: 'Arbeitnow',
    description: 'European tech job board',
    apiUrl: 'https://www.arbeitnow.com/api/job-board-api',
    cacheDuration: 6 * 60 * 60 * 1000, // 6 hours
  },
  remoteok: {
    id: 'remoteok',
    name: 'RemoteOK',
    description: 'Remote jobs worldwide',
    apiUrl: 'https://remoteok.com/api',
    cacheDuration: 24 * 60 * 60 * 1000, // 24 hours (data is delayed 24h)
  },
  jobicy: {
    id: 'jobicy',
    name: 'Jobicy',
    description: 'Remote jobs with geo filter',
    apiUrl: 'https://jobicy.com/api/v2/remote-jobs',
    cacheDuration: 6 * 60 * 60 * 1000, // 6 hours
  },
  remotive: {
    id: 'remotive',
    name: 'Remotive',
    description: 'Remote jobs by category',
    apiUrl: 'https://remotive.com/api/remote-jobs',
    cacheDuration: 24 * 60 * 60 * 1000, // 24 hours
  },
}

/**
 * Get provider metadata by ID
 */
export function getProvider(id: JobProviderId): JobProviderMeta {
  return PROVIDERS[id]
}

/**
 * Get all provider IDs as array
 */
export function getProviderIds(): JobProviderId[] {
  return Object.keys(PROVIDERS) as JobProviderId[]
}

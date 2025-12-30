/**
 * Job services - API business logic separated from React hooks.
 */

// Types
export type {
  JobFetchResult,
  JobServiceConfig,
  CacheKeyGenerator,
} from './types'

// Base class
export { JobService } from './JobService'

// Provider services
export { HNJobService } from './providers/HNJobService'
export {
  ArbeitnowJobService,
  type ArbeitnowFetchOptions,
} from './providers/ArbeitnowJobService'
export { RemoteOKJobService } from './providers/RemoteOKJobService'
export { JobicyJobService } from './providers/JobicyJobService'
export { RemotiveJobService } from './providers/RemotiveJobService'

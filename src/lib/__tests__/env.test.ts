import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// We need to mock import.meta.env before importing the module
// Using vi.mock with factory function

describe('isJobBoardEnabled', () => {
  const originalEnv = { ...import.meta.env }

  beforeEach(() => {
    // Reset modules to allow fresh import with new env values
    vi.resetModules()
  })

  afterEach(() => {
    // Restore original env
    Object.assign(import.meta.env, originalEnv)
  })

  it('returns true when VITE_HN_JOB_BOARD is "true"', async () => {
    import.meta.env.VITE_HN_JOB_BOARD = 'true'
    const { isJobBoardEnabled } = await import('../env')
    expect(isJobBoardEnabled()).toBe(true)
  })

  it('returns false when VITE_HN_JOB_BOARD is "false"', async () => {
    import.meta.env.VITE_HN_JOB_BOARD = 'false'
    const { isJobBoardEnabled } = await import('../env')
    expect(isJobBoardEnabled()).toBe(false)
  })

  it('returns true in dev mode when not set', async () => {
    delete (import.meta.env as Record<string, unknown>).VITE_HN_JOB_BOARD
    import.meta.env.DEV = true
    const { isJobBoardEnabled } = await import('../env')
    expect(isJobBoardEnabled()).toBe(true)
  })

  it('returns false in production mode when not set', async () => {
    delete (import.meta.env as Record<string, unknown>).VITE_HN_JOB_BOARD
    import.meta.env.DEV = false
    const { isJobBoardEnabled } = await import('../env')
    expect(isJobBoardEnabled()).toBe(false)
  })

  it('explicit "true" overrides dev mode', async () => {
    import.meta.env.VITE_HN_JOB_BOARD = 'true'
    import.meta.env.DEV = false
    const { isJobBoardEnabled } = await import('../env')
    expect(isJobBoardEnabled()).toBe(true)
  })

  it('explicit "false" overrides dev mode', async () => {
    import.meta.env.VITE_HN_JOB_BOARD = 'false'
    import.meta.env.DEV = true
    const { isJobBoardEnabled } = await import('../env')
    expect(isJobBoardEnabled()).toBe(false)
  })
})

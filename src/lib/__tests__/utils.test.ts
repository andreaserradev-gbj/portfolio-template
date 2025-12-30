import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('cn', () => {
  it('merges multiple class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    const isActive = true
    const isDisabled = false
    expect(cn('base', isActive && 'included', isDisabled && 'excluded')).toBe(
      'base included'
    )
  })

  it('handles undefined and null values', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end')
  })

  it('handles empty strings', () => {
    expect(cn('base', '', 'end')).toBe('base end')
  })

  it('merges Tailwind conflicting classes (last wins)', () => {
    expect(cn('p-4', 'p-6')).toBe('p-6')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    expect(cn('mt-2', 'mt-4', 'mt-6')).toBe('mt-6')
  })

  it('preserves non-conflicting Tailwind classes', () => {
    expect(cn('p-4', 'm-2')).toBe('p-4 m-2')
    expect(cn('text-lg', 'font-bold')).toBe('text-lg font-bold')
  })

  it('handles complex conflict resolution', () => {
    expect(cn('px-4 py-2', 'p-6')).toBe('p-6')
    expect(cn('p-4', 'px-6')).toBe('p-4 px-6')
  })

  it('handles arrays of classes', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
  })

  it('handles object notation', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
  })

  it('handles mixed inputs', () => {
    expect(cn('base', ['arr1', 'arr2'], { obj: true }, undefined)).toBe(
      'base arr1 arr2 obj'
    )
  })

  it('returns empty string for no valid inputs', () => {
    expect(cn()).toBe('')
    expect(cn(null, undefined, false)).toBe('')
  })
})

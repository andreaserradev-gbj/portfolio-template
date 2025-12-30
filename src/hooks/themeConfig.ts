// NOTE: When modifying THEMES, also update the inline script in index.html
// to prevent flash of incorrect theme on initial load.
export const THEMES = ['light', 'dark', 'system'] as const
export type Theme = (typeof THEMES)[number]
export type ResolvedTheme = Exclude<Theme, 'system'>

export function isTheme(value: string): value is Theme {
  return THEMES.includes(value as Theme)
}

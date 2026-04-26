/**
 * Editorial section ordinals are derived from the section's position in
 * content.sections[]. Hero is § 00; everything after it is § 01, § 02, ...
 */
export function ordinalFor(sectionId: string, sections: string[]): string {
  if (sectionId === 'hero') return '00'
  const nonHero = sections.filter((s) => s !== 'hero')
  const idx = nonHero.indexOf(sectionId)
  return String(idx + 1).padStart(2, '0')
}

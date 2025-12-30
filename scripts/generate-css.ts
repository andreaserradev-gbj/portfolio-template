/**
 * CSS Generation Script
 *
 * Generates CSS from design-systems.json.
 * The generated CSS contains the design tokens (colors, shadows, radius, etc.)
 * while custom decorative CSS remains in the original CSS files.
 *
 * Usage: npx tsx scripts/generate-css.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import {
  validateDesignSystemsConfig,
  type DesignSystemsConfig,
  type DesignSystemConfig,
  type DesignTokens,
} from '../src/config/schema'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function generateTokensCSS(tokens: DesignTokens, indent = '  '): string {
  const lines: string[] = []

  // Colors
  for (const [key, value] of Object.entries(tokens.colors)) {
    if (key === 'palette' && typeof value === 'object') {
      // Handle nested palette colors
      for (const [paletteKey, paletteValue] of Object.entries(
        value as Record<string, string>
      )) {
        lines.push(`${indent}--color-${paletteKey}: ${paletteValue};`)
      }
    } else if (typeof value === 'string') {
      lines.push(`${indent}--color-${key}: ${value};`)
    }
  }

  // Shadows
  for (const [key, value] of Object.entries(tokens.shadows)) {
    lines.push(`${indent}--shadow-${key}: ${value};`)
  }

  // Radius
  for (const [key, value] of Object.entries(tokens.radius)) {
    lines.push(`${indent}--radius-${key}: ${value};`)
  }

  // Border
  lines.push(`${indent}--border-width: ${tokens.border.width};`)
  if (tokens.border.style) {
    lines.push(`${indent}--border-style: ${tokens.border.style};`)
  }

  // Decorative properties
  if (tokens.decorative) {
    for (const [key, value] of Object.entries(tokens.decorative)) {
      lines.push(`${indent}--${key}: ${value};`)
    }
  }

  return lines.join('\n')
}

function generateDesignSystemCSS(system: DesignSystemConfig): string {
  const { id, name, description, fonts, tokens } = system

  // Skip systems without fonts or tokens (they rely on inheritance, handled at runtime)
  if (!fonts || !tokens) {
    console.warn(
      `  Skipping ${name}: missing fonts or tokens (uses inheritance)`
    )
    return ''
  }

  const fontDisplay = `'${fonts.display.family}', ${fonts.display.fallback}`
  const fontBody = `'${fonts.body.family}', ${fonts.body.fallback}`
  const fontMono = `'${fonts.mono.family}', ${fonts.mono.fallback}`

  const lightTokensCSS = generateTokensCSS(tokens.light as DesignTokens)
  const darkTokensCSS = tokens.dark
    ? generateTokensCSS(tokens.dark as DesignTokens)
    : lightTokensCSS // fallback to light tokens if dark not defined

  return `/* ==========================================================================
   ${name.toUpperCase()}
   ${description}
   ========================================================================== */

[data-design-system='${id}'] {
  /* Typography */
  --font-display: ${fontDisplay};
  --font-body: ${fontBody};
  --font-mono: ${fontMono};

  /* Design Tokens - Light Mode */
${lightTokensCSS}
}

/* Dark Mode */
[data-design-system='${id}'].dark {
${darkTokensCSS}
}
`
}

// Note: Google Fonts are loaded via index.html link tags for performance
// This function is kept for reference but not used to avoid CSS @import order issues
function _generateGoogleFontsImports(systems: DesignSystemConfig[]): string {
  const seenUrls = new Set<string>()
  const imports: string[] = []

  for (const system of systems) {
    if (!system.fonts) continue
    const fonts = [system.fonts.display, system.fonts.body, system.fonts.mono]
    for (const font of fonts) {
      if (font.googleFontsUrl && !seenUrls.has(font.googleFontsUrl)) {
        seenUrls.add(font.googleFontsUrl)
        imports.push(`@import url('${font.googleFontsUrl}');`)
      }
    }
  }

  return imports.join('\n')
}

// Export to avoid unused function warning (can be used for documentation generation)
export { _generateGoogleFontsImports as generateGoogleFontsImports }

async function main() {
  console.log('Generating CSS from design-systems.json...\n')

  // Read and validate design systems config
  const configPath = path.join(__dirname, '../src/config/design-systems.json')
  let config: DesignSystemsConfig
  try {
    const configContent = fs.readFileSync(configPath, 'utf-8')
    const parsed = JSON.parse(configContent)
    config = validateDesignSystemsConfig(parsed)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to read/parse/validate design-systems.json: ${msg}`)
  }

  // Generate CSS for each design system
  const cssBlocks: string[] = []

  // Add header
  cssBlocks.push(`/* ==========================================================================
   GENERATED DESIGN SYSTEM TOKENS
   Auto-generated from design-systems.json - DO NOT EDIT DIRECTLY
   To customize, edit src/config/design-systems.json and run: npm run generate:css
   ========================================================================== */
`)

  // Note: Google Fonts are loaded via index.html link tags for performance
  // The generateGoogleFontsImports function is kept for reference but not used
  // to avoid CSS @import order issues

  // Generate CSS for each system
  for (const system of config.systems) {
    const systemCSS = generateDesignSystemCSS(system)
    cssBlocks.push(systemCSS)
    console.log(`  Generated tokens for: ${system.name}`)
  }

  // Write generated CSS
  const outputDir = path.join(__dirname, '../src/config/generated')
  if (!fs.existsSync(outputDir)) {
    try {
      fs.mkdirSync(outputDir, { recursive: true })
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      throw new Error(`Failed to create output directory ${outputDir}: ${msg}`)
    }
  }

  const outputPath = path.join(outputDir, 'design-tokens.css')
  try {
    fs.writeFileSync(outputPath, cssBlocks.join('\n'), 'utf-8')
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to write ${outputPath}: ${msg}`)
  }

  console.log(`\nGenerated CSS written to: ${outputPath}`)
  console.log(
    '\nNote: This file contains only design tokens (colors, shadows, radius, etc.)'
  )
  console.log(
    'Custom decorative CSS (backgrounds, card effects, etc.) remains in'
  )
  console.log(
    'src/styles/design-systems/*.css files and should be imported separately.'
  )
}

main().catch((error) => {
  console.error('\nCSS generation failed:', error.message || error)
  process.exit(1)
})

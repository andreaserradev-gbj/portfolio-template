/**
 * HTML Generation Script
 *
 * Generates index.html from index.html.template using JSON configuration.
 * This enables configurable metadata, SEO tags, and structured data.
 *
 * Usage: npx tsx scripts/generate-html.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import {
  validateSiteConfig,
  validateContentConfig,
  validateDesignSystemsConfig,
  type SiteConfig,
  type ContentConfig,
  type DesignSystemsConfig,
} from '../src/config/schema'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ============================================================================
// TEMPLATE PROCESSING
// ============================================================================

const currentYear = new Date().getFullYear()

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Resolve a relative path to an absolute URL using the base URL.
 * If the path is already absolute (starts with http), return as-is.
 */
function resolveUrl(
  path: string | undefined,
  baseUrl: string | undefined
): string | undefined {
  if (!path) return undefined
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (!baseUrl) return path
  // Remove trailing slash from base URL and ensure path starts with /
  const base = baseUrl.replace(/\/$/, '')
  const relativePath = path.startsWith('/') ? path : `/${path}`
  return `${base}${relativePath}`
}

/**
 * Process template variables like "{{yearsSince:careerStartYear}}"
 * Throws an error if the variable is not defined (fail-fast behavior).
 */
function processTemplateString(
  str: string,
  variables: Record<string, number>
): string {
  return str.replace(/\{\{yearsSince:(\w+)\}\}/g, (_match, varName) => {
    const startYear = variables[varName]
    if (startYear === undefined) {
      const availableVars =
        Object.keys(variables).join(', ') || '(none defined)'
      throw new Error(
        `Unknown template variable "${varName}" in site.json or content. ` +
          `Available variables: ${availableVars}`
      )
    }
    return String(currentYear - startYear)
  })
}

/**
 * Generate JSON-LD structured data
 */
function generateJsonLd(
  site: SiteConfig,
  content: ContentConfig
): string | null {
  const sd = site.structuredData
  if (!sd || !sd.enabled) return null

  const email = site.social.find((s) => s.platform === 'email')?.value
  const linkedin = site.social.find((s) => s.platform === 'linkedin')?.url
  const profileImageUrl = resolveUrl(site.meta.profileImage, site.meta.url)

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: content.hero.name,
      jobTitle: content.hero.title,
      description: processTemplateString(
        site.meta.description,
        content.variables
      ),
      ...(site.meta.url && { url: site.meta.url }),
      ...(profileImageUrl && { image: profileImageUrl }),
      ...(email && { email }),
      ...(sd.telephone && { telephone: sd.telephone }),
      ...(sd.address && {
        address: {
          '@type': 'PostalAddress',
          addressLocality: sd.address.locality,
          addressCountry: sd.address.country,
        },
      }),
      ...(linkedin && { sameAs: [linkedin] }),
      ...(sd.knowsAbout && { knowsAbout: sd.knowsAbout }),
      ...(sd.employer && {
        worksFor: {
          '@type': sd.employer.type,
          name: sd.employer.name,
        },
      }),
    },
  }

  return `<script type="application/ld+json">
      ${JSON.stringify(jsonLd, null, 2).split('\n').join('\n      ')}
    </script>`
}

/**
 * Process conditional blocks like {{#if meta.url}}...{{/if}}
 */
function processConditionals(
  template: string,
  context: Record<string, unknown>
): string {
  // Match {{#if path}}content{{/if}} patterns
  const conditionalRegex = /\{\{#if ([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g

  return template.replace(conditionalRegex, (match, path, content) => {
    const value = getNestedValue(context, path.trim())
    // Truthy check - exists and not empty
    if (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      value !== false
    ) {
      return content
    }
    return ''
  })
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = obj

  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    current = (current as Record<string, unknown>)[part]
  }

  return current
}

// Paths that should NOT be HTML-escaped (e.g., values inside script tags)
const RAW_PATHS = new Set(['validDesignSystems', 'defaultDesignSystem'])

/**
 * Replace simple placeholders like {{meta.title}}
 * HTML-escapes values to prevent XSS vulnerabilities (except for script content)
 */
function replacePlaceholders(
  template: string,
  context: Record<string, unknown>
): string {
  // Match {{path.to.value}} patterns (but not {{#if}} or {{/if}})
  return template.replace(/\{\{(?!#|\/)([\w.]+)\}\}/g, (match, path) => {
    const trimmedPath = path.trim()
    const value = getNestedValue(context, trimmedPath)
    if (value === undefined || value === null) {
      throw new Error(`Missing value for placeholder: {{${trimmedPath}}}`)
    }
    // Skip escaping for values that go into script tags
    if (RAW_PATHS.has(trimmedPath)) {
      return String(value)
    }
    // Escape HTML to prevent XSS from config values
    return escapeHtml(String(value))
  })
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
  console.log('Generating index.html from template...\n')

  // Read configuration files
  const siteConfigPath = path.join(__dirname, '../src/config/site.json')
  const contentConfigPath = path.join(__dirname, '../src/config/content.json')
  const designSystemsPath = path.join(
    __dirname,
    '../src/config/design-systems.json'
  )
  const templatePath = path.join(__dirname, '../index.html.template')

  let site: SiteConfig
  let content: ContentConfig
  let designSystems: DesignSystemsConfig
  let template: string

  try {
    const parsed = JSON.parse(fs.readFileSync(siteConfigPath, 'utf-8'))
    site = validateSiteConfig(parsed)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to read/parse/validate site.json: ${msg}`)
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(contentConfigPath, 'utf-8'))
    content = validateContentConfig(parsed)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to read/parse/validate content.json: ${msg}`)
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(designSystemsPath, 'utf-8'))
    designSystems = validateDesignSystemsConfig(parsed)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to read/parse/validate design-systems.json: ${msg}`)
  }

  try {
    template = fs.readFileSync(templatePath, 'utf-8')
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to read index.html.template: ${msg}`)
  }

  // Process template variables in description
  const processedDescription = processTemplateString(
    site.meta.description,
    content.variables
  )

  // Resolve image URLs (relative paths become absolute when base URL is set)
  const ogImageUrl = resolveUrl(site.meta.ogImage, site.meta.url)

  // Get author (fallback chain: meta.author > branding.name > hero.name)
  const author = site.meta.author || site.branding?.name || content.hero.name

  // Build page title (with location if available)
  const location = content.contact?.location
  const pageTitle = location
    ? `${content.hero.name} - ${content.hero.title} | ${location}`
    : `${content.hero.name} - ${content.hero.title}`

  // Build OG title (without location)
  const ogTitle = `${content.hero.name} - ${content.hero.title}`

  // Generate design systems array
  const validDesignSystems = designSystems.systems.map((s) => s.id)

  // Build context object for template replacement
  const context: Record<string, unknown> = {
    meta: {
      ...site.meta,
      description: processedDescription,
      author,
      favicon: site.meta.favicon || '/favicon.ico',
      robots: site.meta.robots || 'index, follow',
      ogType: site.meta.ogType || 'website',
      ogImage: ogImageUrl, // Resolved to absolute URL
      ogImageWidth: site.meta.ogImageWidth || 1200,
      ogImageHeight: site.meta.ogImageHeight || 630,
      locale: site.meta.locale || 'en_US',
      twitterCard: site.meta.twitterCard || 'summary_large_image',
    },
    page: {
      title: pageTitle,
    },
    og: {
      title: ogTitle,
    },
    hero: content.hero,
    structuredData: site.structuredData || { enabled: false },
    validDesignSystems: JSON.stringify(validDesignSystems),
    defaultDesignSystem: designSystems.defaultSystem,
  }

  // Process conditionals first
  template = processConditionals(template, context)

  // Replace JSON-LD placeholder
  const jsonLd = generateJsonLd(site, content)
  template = template.replace(/\{\{jsonld\}\}/g, jsonLd || '')

  // Replace remaining placeholders
  template = replacePlaceholders(template, context)

  // Clean up any empty lines from removed conditionals
  template = template.replace(/^\s*\n(?=\s*\n)/gm, '')

  // Write output
  const outputPath = path.join(__dirname, '../index.html')
  try {
    fs.writeFileSync(outputPath, template, 'utf-8')
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to write ${outputPath}: ${msg}`)
  }

  console.log('  Generated: index.html')
  console.log(`  Title: ${pageTitle}`)
  console.log(`  Description: ${processedDescription.slice(0, 60)}...`)
  console.log(`  Design systems: ${validDesignSystems.join(', ')}`)
  if (jsonLd) {
    console.log('  JSON-LD: Enabled')
  }
  console.log('\nHTML generation complete!')
}

main().catch((error) => {
  console.error('\nHTML generation failed:', error.message)
  process.exit(1)
})

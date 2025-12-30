/**
 * Validates all example portfolio configurations against the schemas.
 * Run with: npx tsx scripts/validate-examples.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { validateSiteConfig, validateContentConfig } from '../src/config/schema'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const EXAMPLES_DIR = path.join(__dirname, '../src/config/examples')

interface ValidationResult {
  name: string
  site: { valid: boolean; error?: string }
  content: { valid: boolean; error?: string }
}

function validateExample(exampleDir: string): ValidationResult {
  const name = path.basename(exampleDir)
  const result: ValidationResult = {
    name,
    site: { valid: false },
    content: { valid: false },
  }

  // Validate site.json
  const siteJsonPath = path.join(exampleDir, 'site.json')
  if (fs.existsSync(siteJsonPath)) {
    let siteJson: unknown
    try {
      siteJson = JSON.parse(fs.readFileSync(siteJsonPath, 'utf-8'))
    } catch (e) {
      result.site.error = `JSON parse error: ${e instanceof Error ? e.message : String(e)}`
      siteJson = null
    }
    if (siteJson !== null) {
      try {
        validateSiteConfig(siteJson)
        result.site.valid = true
      } catch (e) {
        result.site.error = `Validation error: ${e instanceof Error ? e.message : String(e)}`
      }
    }
  } else {
    result.site.error = 'site.json not found'
  }

  // Validate content.json
  const contentJsonPath = path.join(exampleDir, 'content.json')
  if (fs.existsSync(contentJsonPath)) {
    let contentJson: unknown
    try {
      contentJson = JSON.parse(fs.readFileSync(contentJsonPath, 'utf-8'))
    } catch (e) {
      result.content.error = `JSON parse error: ${e instanceof Error ? e.message : String(e)}`
      contentJson = null
    }
    if (contentJson !== null) {
      try {
        validateContentConfig(contentJson)
        result.content.valid = true
      } catch (e) {
        result.content.error = `Validation error: ${e instanceof Error ? e.message : String(e)}`
      }
    }
  } else {
    result.content.error = 'content.json not found'
  }

  return result
}

function main() {
  console.log('\nValidating example portfolios...\n')

  if (!fs.existsSync(EXAMPLES_DIR)) {
    console.error('Examples directory not found:', EXAMPLES_DIR)
    process.exit(1)
  }

  const examples = fs
    .readdirSync(EXAMPLES_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => path.join(EXAMPLES_DIR, dirent.name))

  if (examples.length === 0) {
    console.log('No examples found.')
    return
  }

  let allValid = true
  const results: ValidationResult[] = []

  for (const exampleDir of examples) {
    const result = validateExample(exampleDir)
    results.push(result)

    const siteStatus = result.site.valid
      ? '\x1b[32mOK\x1b[0m'
      : '\x1b[31mFAIL\x1b[0m'
    const contentStatus = result.content.valid
      ? '\x1b[32mOK\x1b[0m'
      : '\x1b[31mFAIL\x1b[0m'

    console.log(`  ${result.name}:`)
    console.log(`    site.json:    ${siteStatus}`)
    if (result.site.error) {
      console.log(`      ${result.site.error}`)
    }
    console.log(`    content.json: ${contentStatus}`)
    if (result.content.error) {
      console.log(`      ${result.content.error}`)
    }
    console.log()

    if (!result.site.valid || !result.content.valid) {
      allValid = false
    }
  }

  console.log('---')
  if (allValid) {
    console.log('\x1b[32mAll examples valid!\x1b[0m\n')
  } else {
    console.log('\x1b[31mSome examples have validation errors.\x1b[0m\n')
    process.exit(1)
  }
}

main()

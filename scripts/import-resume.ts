/**
 * Import Resume Script - Extract portfolio data from a PDF resume using Claude CLI
 *
 * Usage:
 *   npx tsx scripts/import-resume.ts <pdf-path> <example-name>
 *   npx tsx scripts/import-resume.ts resume.pdf john-doe
 *   npx tsx scripts/import-resume.ts ~/Documents/my-resume.pdf my-portfolio
 *   npx tsx scripts/import-resume.ts --help
 *
 * Output:
 *   Creates src/config/examples/<example-name>/content.json and site.json
 *   Then use `npm run portfolio:switch <example-name>` to apply it
 *
 * Exit codes:
 *   0  - Success
 *   1  - Invalid arguments or prerequisites failed (PDF not found, CLI not installed)
 *   2  - Claude CLI execution failed (timeout, binary not found, process killed)
 *   3  - JSON parsing/extraction failed (invalid response from Claude)
 *   4  - Schema validation failed (content or site config invalid)
 *   5  - File system error (directory/file creation failed)
 *   99 - Unexpected error
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { execFileSync } from 'child_process'
import {
  validateSiteConfig,
  validateContentConfig,
  type SiteConfig,
  type ContentConfig,
} from '../src/config/schema'

// ============================================================================
// ANSI ESCAPE CODES
// ============================================================================

const ANSI = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  cursorHide: '\x1b[?25l',
  cursorShow: '\x1b[?25h',
}

// ============================================================================
// DIRECTORY CONSTANTS
// ============================================================================

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.join(__dirname, '..')
const EXAMPLES_DIR = path.join(ROOT_DIR, 'src/config/examples')

// ============================================================================
// PROMPT TEMPLATE
// ============================================================================

const EXTRACTION_PROMPT = `You are extracting structured data from a PDF resume to populate a portfolio website.

## Your Task

Parse the PDF resume file and extract information into two JSON objects:
1. \`content\` - Main portfolio content
2. \`site\` - Site metadata

## CRITICAL: Output Format

You MUST return ONLY valid JSON with no markdown formatting, no code blocks, no explanation.
Just the raw JSON object starting with { and ending with }

The response must be a single JSON object with this exact structure:
{
  "content": { /* ContentConfig */ },
  "site": { /* SiteConfig */ }
}

## Template Variables System

The portfolio uses dynamic year calculations. You MUST:
1. Identify the earliest year from the experience section
2. Set \`variables.careerStartYear\` to that year
3. Use \`{{yearsSince:careerStartYear}}\` in text instead of hardcoded years

Example: If earliest job started in 2010, set:
- \`"variables": { "careerStartYear": 2010 }\`
- In tagline: "{{yearsSince:careerStartYear}}+ years of experience..."

## Content Schema Requirements

### variables (required)
{
  "careerStartYear": <earliest-year-from-experience>
}

### sections (required)
Include only sections that have content. Base sections:
["hero", "metrics", "experience", "achievements", "skills", "contact"]
Only add "projects" to this array if the resume mentions open source projects or side projects.

### hero (required)
{
  "name": "<full-name>",
  "title": "<professional-title>",
  "tagline": "<1-2 sentence summary using {{yearsSince:careerStartYear}}+ years>",
  "avatar": "/profile.jpg",
  "cta": {
    "primary": { "text": "View Experience", "target": "#experience" },
    "secondary": { "text": "Contact Me", "target": "#contact" }
  },
  "statusBadge": { "text": "Open to opportunities", "active": true },
  "valuePills": [
    { "label": "<key-skill>", "sublabel": "<context>", "highlight": true },
    { "label": "{{yearsSince:careerStartYear}}yr", "sublabel": "Experience", "highlight": false }
  ],
  "quickStats": [ // MAX 3 items
    { "value": "{{yearsSince:careerStartYear}}", "suffix": "+", "label": "Years Experience" }
  ]
}

### experience (array, required)
Each entry:
{
  "company": "<company-name>",
  "role": "<job-title>",
  "period": "<Month Year - Month Year or Present>",
  "location": "<City, Country>",
  "highlights": ["<quantified achievement 1>", "<achievement 2>", ...],
  "techStack": ["<tech1>", "<tech2>", ...],
  "clients": ["<client1>", ...] // if any mentioned
}

### achievements (array, 3-5 entries)
Extract the most impressive accomplishments:
{
  "id": "<kebab-case-id>",
  "title": "<achievement-title>",
  "category": "<partnership|architecture|leadership|technical|domain>",
  "summary": "<one-line-summary>",
  "impact": "<business-impact>",
  "details": ["<detail1>", "<detail2>", ...],
  "metrics": [{ "label": "<metric-name>", "value": "<value>" }]
}

### skillCategories (array)
Group skills into categories:
{
  "name": "<category-name>",
  "skills": [
    {
      "name": "<skill-name>",
      "context": "<brief-context-of-usage>",
      "weight": <7-10 for primary, 4-6 for secondary>,
      "aliases": ["<alt-name1>", "<alt-name2>"]
    }
  ]
}

Categories to use:
- "Languages & Frameworks"
- "Cloud & Infrastructure"
- "Databases"
- "APIs & Integration"
- "Development Tools"
- "Leadership" (soft skills)

### projects (array, optional - OMIT entirely if no projects found)
Extract open source projects or side projects ONLY if explicitly mentioned in resume.
If no projects are found, do NOT include this field (don't use empty array).
{
  "id": "<kebab-case-id>",
  "title": "<project-name>",
  "description": "<1-2 sentence description>",
  "githubUrl": "<github-repository-url>",
  "tags": ["<technology1>", "<technology2>"],
  "featured": <true for most significant projects, false otherwise>
}

### projectsSection (optional - include ONLY if projects array has items)
{
  "eyebrow": "Open Source",
  "headline": "Projects",
  "description": "<optional description of open source contributions>"
}

### metrics (array, 3-4 entries)
Key quantifiable achievements:
{
  "label": "<metric-name>",
  "value": <number or "{{yearsSince:careerStartYear}}">,
  "suffix": "<%, +, K+, etc>",
  "description": "<brief-description>",
  "max": <reasonable-max-for-visualization>
}

### contact (required)
{
  "eyebrow": "Get in Touch",
  "headline": "Let's Work Together",
  "description": "Ready to discuss your next project or opportunity.",
  "ctaText": "Interested in working together? Let's start a conversation.",
  "location": "<City, Country from resume>",
  "preferredMethod": "email",
  "showSocial": true
}

## Site Schema Requirements

### meta
{
  "title": "<Name | Title>",
  "description": "<SEO description - MUST be between 10-160 characters exactly, no more>",
  "language": "en",
  "author": "<full-name>",
  "keywords": "<comma-separated-keywords>",
  "robots": "index, follow",
  "ogType": "website",
  "locale": "en_US",
  "favicon": "/favicon.svg",
  "twitterCard": "summary_large_image",
  "ogImage": "/og-image.jpg",
  "profileImage": "/profile.jpg",
  "themeColor": "#0f172a"
}

### social (array)
Extract any social links from resume:
[
  { "platform": "linkedin", "url": "<linkedin-url>" },
  { "platform": "github", "url": "<github-url>" },
  { "platform": "email", "value": "<email-address>" }
]
Valid platforms: linkedin, github, twitter, mastodon, youtube, dribbble, behance, email, website

### structuredData
{
  "enabled": true,
  "employer": {
    "name": "<current-or-most-recent-company>",
    "type": "Organization"
  },
  "knowsAbout": ["<skill1>", "<skill2>", ...],
  "address": {
    "locality": "<city>",
    "country": "<country>"
  }
}

### navigation (use these defaults, adjust based on sections)
{
  "links": [
    { "href": "#hero", "label": "Home", "external": false },
    { "href": "#impact", "label": "Impact", "external": false },
    { "href": "#experience", "label": "Experience", "external": false },
    { "href": "#achievements", "label": "Achievements", "external": false },
    { "href": "#skills", "label": "Skills", "external": false },
    { "href": "#contact", "label": "Contact", "external": false }
  ],
  "cta": { "text": "Get in Touch", "href": "#contact" }
}
Note: Only add { "href": "#projects", "label": "Projects", "external": false } if projects exist in the content.

### branding (use these defaults)
{
  "name": "<full-name>",
  "logo": null,
  "showName": true
}

### analytics (use these defaults)
{
  "vercel": false,
  "googleAnalytics": null,
  "plausible": null
}

### features (use these defaults)
{
  "darkMode": true,
  "designSystemSwitcher": true,
  "smoothScroll": true,
  "reduceMotion": "respect-system"
}

## Important Notes

1. Use sensible defaults for any missing information
2. Quantify achievements where possible (%, numbers, scale)
3. Calculate careerStartYear from the earliest experience date
4. Always use template variables for years of experience
5. Return ONLY the JSON object, no markdown, no explanation

Now extract the data from the provided PDF resume file.`

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function showHelp(): void {
  console.log(`
Resume Import Script - Extract portfolio data from a PDF resume using Claude CLI

Usage:
  npx tsx scripts/import-resume.ts <pdf-path> <example-name>

Arguments:
  <pdf-path>      Path to the PDF resume file
  <example-name>  Name for the example portfolio (e.g., john-doe, my-portfolio)

Options:
  --help, -h      Show this help message

Examples:
  npx tsx scripts/import-resume.ts resume.pdf john-doe
  npx tsx scripts/import-resume.ts ~/Documents/my-resume.pdf my-portfolio
  npm run resume:import -- resume.pdf john-doe

Output:
  Creates src/config/examples/<example-name>/
    - content.json
    - site.json

Next Steps:
  After import, run: npm run portfolio:switch <example-name>

Requirements:
  - Claude CLI must be installed and authenticated
  - The PDF file must exist and be readable
`)
}

function parseArguments(): { pdfPath: string; exampleName: string } | null {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp()
    return null
  }

  if (args.length < 2) {
    console.error('ERROR: Missing required arguments')
    console.error(
      'Usage: npx tsx scripts/import-resume.ts <pdf-path> <example-name>'
    )
    console.error('Run with --help for more information')
    process.exit(1)
  }

  const pdfPath = path.resolve(args[0])
  const exampleName = args[1]

  // Validate example name (lowercase letters, numbers, and hyphens only)
  if (!/^[a-z0-9-]+$/.test(exampleName)) {
    console.error(
      'ERROR: Example name must contain only lowercase letters, numbers, and hyphens'
    )
    console.error(`  Got: ${exampleName}`)
    process.exit(1)
  }

  return { pdfPath, exampleName }
}

const MAX_PDF_SIZE = 10 * 1024 * 1024 // 10MB limit

function verifyPdfExists(pdfPath: string): void {
  let stats: fs.Stats

  try {
    stats = fs.statSync(pdfPath)
  } catch (error) {
    const fsError = error as NodeJS.ErrnoException
    if (fsError.code === 'ENOENT') {
      console.error(`ERROR: PDF file not found: ${pdfPath}`)
    } else if (fsError.code === 'EACCES') {
      console.error(`ERROR: Permission denied reading PDF file: ${pdfPath}`)
    } else {
      console.error(`ERROR: Cannot access PDF file: ${pdfPath}`)
      console.error(`  ${fsError.message}`)
    }
    process.exit(1)
  }

  if (!stats.isFile()) {
    console.error(`ERROR: Not a file: ${pdfPath}`)
    process.exit(1)
  }

  // Limit file size to ensure reasonable processing time and extraction quality
  if (stats.size > MAX_PDF_SIZE) {
    console.error(
      `ERROR: PDF file too large (${(stats.size / 1024 / 1024).toFixed(1)} MB)`
    )
    console.error(`  Maximum allowed size: ${MAX_PDF_SIZE / 1024 / 1024} MB`)
    process.exit(1)
  }

  if (!pdfPath.toLowerCase().endsWith('.pdf')) {
    console.error(
      `${ANSI.red}WARNING: File does not have .pdf extension${ANSI.reset}`
    )
    console.error(`  Path: ${pdfPath}`)
    console.error('  Claude may not be able to read non-PDF files.')
    console.error('')
  }

  console.log(`  PDF file: ${pdfPath} (${(stats.size / 1024).toFixed(1)} KB)`)
}

function verifyClaude(): void {
  try {
    execFileSync('which', ['claude'], { encoding: 'utf-8', stdio: 'pipe' })
  } catch (error) {
    const execError = error as { code?: string; message?: string }

    // Try fallback with 'command -v' for systems without 'which'
    if (execError.code === 'ENOENT') {
      try {
        execFileSync('sh', ['-c', 'command -v claude'], {
          encoding: 'utf-8',
          stdio: 'pipe',
        })
        return // Claude found via fallback
      } catch (fallbackError) {
        // Log fallback error for debugging, then fall through to main error message
        if (process.env.DEBUG) {
          const msg =
            fallbackError instanceof Error
              ? fallbackError.message
              : fallbackError
          console.error(`  Debug: Fallback check failed: ${msg}`)
        }
      }
    }

    console.error('ERROR: Claude CLI not found')
    console.error('  Please install and authenticate Claude CLI first')
    console.error('  See: https://code.claude.com/docs/en/overview')
    process.exit(1)
  }
}

interface ExtractionResult {
  content: ContentConfig
  site: SiteConfig
}

function callClaudeCli(pdfPath: string): ExtractionResult {
  console.log(
    `  ${ANSI.magenta}${ANSI.bright}✦${ANSI.reset} ${ANSI.cyan}Extracting portfolio data...${ANSI.reset}`
  )
  console.log(`  ${ANSI.dim}Working... (this may take a minute)${ANSI.reset}`)

  // Only use cursor codes in TTY environments
  const isTTY = process.stdout.isTTY

  // Hide cursor during processing
  if (isTTY) process.stdout.write(ANSI.cursorHide)

  // Build prompt with file path - Claude will use Read tool to access the PDF
  const fullPrompt = `Please read the PDF file at: ${pdfPath}

${EXTRACTION_PROMPT}`

  try {
    const result = execFileSync(
      'claude',
      ['-p', fullPrompt, '--allowedTools', 'Read'],
      {
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        cwd: ROOT_DIR,
        timeout: 5 * 60 * 1000, // 5 minute timeout
      }
    )

    // Show cursor again
    if (isTTY) process.stdout.write(ANSI.cursorShow)

    // Try to extract JSON from the response
    let jsonStr = result.trim()

    // Extract JSON from markdown code blocks if Claude wrapped the response
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim()
    }

    // Find the JSON object
    const startIdx = jsonStr.indexOf('{')
    const endIdx = jsonStr.lastIndexOf('}')

    if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) {
      if (isTTY) process.stdout.write(ANSI.cursorShow)
      console.error(
        `${ANSI.red}ERROR: Claude did not return valid JSON${ANSI.reset}`
      )
      console.error('This typically happens when:')
      console.error('  - Claude could not read the PDF file')
      console.error('  - Claude refused the request')
      console.error('  - The PDF file is corrupted or unreadable')
      console.error('')
      console.error('Claude response:')
      console.error(jsonStr.slice(0, 1000))
      process.exit(3)
    }

    jsonStr = jsonStr.slice(startIdx, endIdx + 1)

    try {
      const parsed = JSON.parse(jsonStr)

      // Validate response structure before casting
      if (!parsed || typeof parsed !== 'object') {
        console.error(
          `${ANSI.red}ERROR: Claude response is not a JSON object${ANSI.reset}`
        )
        console.error('Expected { "content": {...}, "site": {...} }')
        console.error('Got:', typeof parsed)
        process.exit(3)
      }

      if (!parsed.content || typeof parsed.content !== 'object') {
        console.error(
          `${ANSI.red}ERROR: Claude response missing "content" object${ANSI.reset}`
        )
        console.error('Response keys:', Object.keys(parsed))
        process.exit(3)
      }

      if (!parsed.site || typeof parsed.site !== 'object') {
        console.error(
          `${ANSI.red}ERROR: Claude response missing "site" object${ANSI.reset}`
        )
        console.error('Response keys:', Object.keys(parsed))
        process.exit(3)
      }

      console.log(
        `  ${ANSI.green}Successfully parsed JSON response${ANSI.reset}`
      )
      return parsed as ExtractionResult
    } catch (parseError) {
      if (isTTY) process.stdout.write(ANSI.cursorShow)
      console.error(
        `${ANSI.red}ERROR: Failed to parse JSON response from Claude${ANSI.reset}`
      )
      console.error('')
      console.error(
        'JSON Parse Error:',
        parseError instanceof Error ? parseError.message : parseError
      )
      console.error('')
      console.error('Extracted JSON string (first 500 chars):')
      console.error(jsonStr.slice(0, 500))
      process.exit(3)
    }
  } catch (error) {
    // Show cursor on error
    if (isTTY) process.stdout.write(ANSI.cursorShow)

    const execError = error as {
      stderr?: Buffer | string
      status?: number
      message?: string
      code?: string
      killed?: boolean
      signal?: string
    }

    // Handle timeout (5-minute limit exceeded)
    if (execError.code === 'ETIMEDOUT' || execError.killed) {
      console.error(
        `${ANSI.red}ERROR: Claude CLI timed out after 5 minutes${ANSI.reset}`
      )
      console.error('  The PDF may be too large or complex to process.')
      console.error('  Try with a smaller or simpler PDF.')
      process.exit(2)
    }

    // Handle Claude binary not found during execution
    if (execError.code === 'ENOENT') {
      console.error(
        `${ANSI.red}ERROR: Claude CLI binary not found${ANSI.reset}`
      )
      console.error(
        '  The claude command was available but cannot be executed now.'
      )
      console.error('  Check your PATH and Claude CLI installation.')
      process.exit(2)
    }

    // Handle process killed (e.g., out of memory)
    if (execError.signal === 'SIGKILL') {
      console.error(`${ANSI.red}ERROR: Claude process was killed${ANSI.reset}`)
      console.error(
        '  This may indicate out-of-memory conditions or external termination.'
      )
      process.exit(2)
    }

    // Handle non-zero exit codes from Claude itself
    if (execError.status !== undefined && execError.status !== 0) {
      console.error(
        `${ANSI.red}ERROR: Claude CLI exited with code ${execError.status}${ANSI.reset}`
      )
      if (execError.stderr) {
        console.error(`  ${execError.stderr}`)
      }
      console.error(
        '  This may indicate authentication issues or Claude service problems.'
      )
      process.exit(2)
    }

    // Generic fallback for other errors
    console.error(`${ANSI.red}ERROR: Claude CLI failed${ANSI.reset}`)
    console.error(`  ${execError.message || error}`)
    if (execError.stderr) {
      console.error(`  ${execError.stderr}`)
    }
    process.exit(2)
  }
}

function validateResults(result: ExtractionResult): void {
  console.log('  Validating extracted data...')

  try {
    validateContentConfig(result.content)
    console.log('    content.json: valid')
  } catch (error) {
    console.error('ERROR: Content validation failed')
    console.error(error instanceof Error ? error.message : error)
    process.exit(4)
  }

  try {
    validateSiteConfig(result.site)
    console.log('    site.json: valid')
  } catch (error) {
    console.error('ERROR: Site validation failed')
    console.error(error instanceof Error ? error.message : error)
    process.exit(4)
  }

  // Cross-validation: ensure navigation links match available content
  const projectsNavLink = result.site.navigation.links.some(
    (link) => link.href === '#projects'
  )
  const hasProjects = (result.content.projects ?? []).length > 0

  if (projectsNavLink && !hasProjects) {
    console.error(
      `${ANSI.red}ERROR: Navigation has #projects link but no projects in content${ANSI.reset}`
    )
    console.error(
      '  Either add projects to content or remove the navigation link'
    )
    process.exit(4)
  }

  console.log('    cross-validation: valid')
}

function writeExampleConfigs(
  exampleName: string,
  content: ContentConfig,
  site: SiteConfig
): string {
  const exampleDir = path.join(EXAMPLES_DIR, exampleName)

  console.log(`  Creating example directory: ${exampleDir}`)

  try {
    fs.mkdirSync(exampleDir, { recursive: true })
  } catch (error) {
    console.error('ERROR: Failed to create example directory')
    console.error(error instanceof Error ? error.message : error)
    process.exit(5)
  }

  const contentPath = path.join(exampleDir, 'content.json')
  const sitePath = path.join(exampleDir, 'site.json')

  try {
    fs.writeFileSync(contentPath, JSON.stringify(content, null, 2))
    console.log(`    Written: content.json`)
  } catch (error) {
    console.error('ERROR: Failed to write content.json')
    console.error(error instanceof Error ? error.message : error)
    process.exit(5)
  }

  try {
    fs.writeFileSync(sitePath, JSON.stringify(site, null, 2))
    console.log(`    Written: site.json`)
  } catch (error) {
    console.error('ERROR: Failed to write site.json')
    console.error(error instanceof Error ? error.message : error)
    process.exit(5)
  }

  return exampleDir
}

// ============================================================================
// MAIN
// ============================================================================

function main(): void {
  console.log('\nResume Import Script')
  console.log('====================\n')

  // Parse arguments
  const args = parseArguments()
  if (!args) {
    return // Help was shown
  }

  const { pdfPath, exampleName } = args
  console.log(`Importing resume as "${exampleName}"...`)

  // Verify prerequisites
  console.log('\n1. Checking prerequisites...')
  verifyPdfExists(pdfPath)
  verifyClaude()
  console.log('  Claude CLI: available')

  // Call Claude
  console.log('\n2. Extracting data with Claude...')
  const result = callClaudeCli(pdfPath)

  // Validate
  console.log('\n3. Validating extracted data...')
  validateResults(result)

  // Write files
  console.log('\n4. Writing config files...')
  const exampleDir = writeExampleConfigs(
    exampleName,
    result.content,
    result.site
  )

  // Success
  console.log('\n' + '='.repeat(50))
  console.log(
    `${ANSI.green}SUCCESS!${ANSI.reset} Resume imported successfully.`
  )
  console.log('='.repeat(50))
  console.log(`\nOutput directory: ${exampleDir}`)
  console.log('\nNext steps:')
  console.log(`  1. Review the generated configs in ${exampleDir}`)
  console.log(`  2. Add a profile image as public/profile.jpg`)
  console.log(`  3. Apply the config: npm run portfolio:switch ${exampleName}`)
  console.log(`  4. Preview: npm run dev`)
  console.log()
}

try {
  main()
} catch (error) {
  // Ensure cursor is visible on unexpected errors
  if (process.stdout.isTTY) {
    process.stdout.write(ANSI.cursorShow)
  }

  console.error(`${ANSI.red}ERROR: Unexpected error occurred${ANSI.reset}`)
  console.error(`  ${error instanceof Error ? error.message : error}`)

  if (process.env.DEBUG) {
    console.error('')
    console.error('Stack trace:')
    console.error(error instanceof Error ? error.stack : 'No stack available')
  }

  process.exit(99)
}

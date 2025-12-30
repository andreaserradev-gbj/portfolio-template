/**
 * Switches the active portfolio by copying example configs to the main config location.
 *
 * Usage:
 *   npx tsx scripts/switch-portfolio.ts <example-name>
 *   npx tsx scripts/switch-portfolio.ts minimal
 *   npx tsx scripts/switch-portfolio.ts creative
 *   npx tsx scripts/switch-portfolio.ts startup
 *   npx tsx scripts/switch-portfolio.ts --list    # List available examples
 *   npx tsx scripts/switch-portfolio.ts --reset   # Restore original configs
 *
 * Note: This script modifies the main config files. The dev server will
 * hot-reload the changes automatically.
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { execFileSync } from 'child_process'
import { validateSiteConfig, validateContentConfig } from '../src/config/schema'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.join(__dirname, '..')
const CONFIG_DIR = path.join(__dirname, '../src/config')
const EXAMPLES_DIR = path.join(CONFIG_DIR, 'examples')
const BACKUP_DIR = path.join(CONFIG_DIR, '.backup')
const GENERATE_HTML_SCRIPT = path.join(__dirname, 'generate-html.ts')

function regenerateHtml(): boolean {
  console.log('  Regenerating index.html...')
  try {
    execFileSync('npx', ['tsx', GENERATE_HTML_SCRIPT], {
      cwd: ROOT_DIR,
      stdio: 'pipe',
    })
    console.log('  index.html updated')
    return true
  } catch (error) {
    const execError = error as {
      stderr?: Buffer
      status?: number
      message?: string
    }
    const stderr = execError.stderr?.toString().trim() || ''
    const exitCode = execError.status ?? 'unknown'
    const message = execError.message || String(error)

    console.error('  ERROR: Failed to regenerate index.html')
    console.error(`    Exit code: ${exitCode}`)
    console.error(`    Message: ${message}`)
    if (stderr) {
      console.error(`    Details: ${stderr}`)
    }
    console.error(
      '    Run `npm run generate:html` manually to update index.html'
    )
    return false
  }
}

function listExamples(): string[] {
  if (!fs.existsSync(EXAMPLES_DIR)) {
    return []
  }
  return fs
    .readdirSync(EXAMPLES_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
}

function checkGitAvailable(): void {
  try {
    execFileSync('git', ['rev-parse', '--git-dir'], {
      cwd: ROOT_DIR,
      stdio: 'pipe',
    })
  } catch (error) {
    const execError = error as {
      code?: string
      message?: string
      stderr?: Buffer
    }

    if (execError.code === 'ENOENT') {
      throw new Error(
        'Git is not installed or not in PATH. Please install git and try again.'
      )
    }

    const stderr = execError.stderr?.toString().trim() || ''
    const detail = stderr || execError.message || String(error)

    throw new Error(
      `Git command failed: ${detail}\n` +
        'Ensure you are in a git repository and have proper permissions.'
    )
  }
}

function backupOriginal() {
  // Verify git is available before proceeding
  checkGitAvailable()

  // Always sync backup with git HEAD to ensure it matches committed state
  try {
    fs.mkdirSync(BACKUP_DIR, { recursive: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to create backup directory: ${msg}`)
  }

  // Get committed versions from git HEAD
  let siteContent: string
  let contentContent: string

  try {
    siteContent = execFileSync('git', ['show', 'HEAD:src/config/site.json'], {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to retrieve site.json from git HEAD: ${msg}`)
  }

  try {
    contentContent = execFileSync(
      'git',
      ['show', 'HEAD:src/config/content.json'],
      { cwd: ROOT_DIR, encoding: 'utf-8' }
    )
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to retrieve content.json from git HEAD: ${msg}`)
  }

  // Write backup files
  try {
    fs.writeFileSync(path.join(BACKUP_DIR, 'site.json'), siteContent)
    fs.writeFileSync(path.join(BACKUP_DIR, 'content.json'), contentContent)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to write backup files to ${BACKUP_DIR}: ${msg}`)
  }

  console.log('  Original configs synced from git HEAD')
}

function restoreOriginal() {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.error('No backup found. Nothing to restore.')
    process.exit(1)
  }

  const siteBackup = path.join(BACKUP_DIR, 'site.json')
  const contentBackup = path.join(BACKUP_DIR, 'content.json')
  const siteTarget = path.join(CONFIG_DIR, 'site.json')
  const contentTarget = path.join(CONFIG_DIR, 'content.json')

  // Validate both backup files exist before restoring
  const siteBackupExists = fs.existsSync(siteBackup)
  const contentBackupExists = fs.existsSync(contentBackup)

  if (!siteBackupExists || !contentBackupExists) {
    const missing: string[] = []
    if (!siteBackupExists) missing.push('site.json')
    if (!contentBackupExists) missing.push('content.json')

    console.error(`Backup is incomplete. Missing: ${missing.join(', ')}`)
    console.error(
      'Cannot safely restore. Consider using `git checkout` to restore configs.'
    )
    process.exit(1)
  }

  // Restore site.json
  try {
    fs.copyFileSync(siteBackup, siteTarget)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to restore site.json: ${msg}`)
  }

  // Restore content.json
  try {
    fs.copyFileSync(contentBackup, contentTarget)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('  WARNING: site.json was restored but content.json failed.')
    throw new Error(`Failed to restore content.json: ${msg}`)
  }

  const htmlSuccess = regenerateHtml()

  if (!htmlSuccess) {
    console.error(
      '\nWARNING: Portfolio configs restored but index.html is out of sync!'
    )
    console.error('The portfolio will not render correctly until you run:')
    console.error('  npm run generate:html')
    process.exit(2)
  }

  console.log('\nRestored original portfolio configs.')
  console.log('Run `npm run dev` to see changes.\n')
}

function switchTo(exampleName: string) {
  const exampleDir = path.join(EXAMPLES_DIR, exampleName)

  if (!fs.existsSync(exampleDir)) {
    console.error(`\nExample "${exampleName}" not found.`)
    console.log('\nAvailable examples:')
    listExamples().forEach((name) => console.log(`  - ${name}`))
    process.exit(1)
  }

  // Validate before switching
  const siteJsonPath = path.join(exampleDir, 'site.json')
  const contentJsonPath = path.join(exampleDir, 'content.json')

  console.log(`\nSwitching to "${exampleName}" portfolio...`)

  // Validate site.json
  if (fs.existsSync(siteJsonPath)) {
    let siteJson: unknown
    try {
      siteJson = JSON.parse(fs.readFileSync(siteJsonPath, 'utf-8'))
    } catch (e) {
      console.error('  site.json: PARSE ERROR')
      console.error(
        `  Failed to parse JSON: ${e instanceof Error ? e.message : e}`
      )
      process.exit(1)
    }
    try {
      validateSiteConfig(siteJson)
      console.log('  site.json: valid')
    } catch (e) {
      console.error('  site.json: INVALID')
      console.error(e instanceof Error ? e.message : e)
      process.exit(1)
    }
  }

  // Validate content.json
  if (fs.existsSync(contentJsonPath)) {
    let contentJson: unknown
    try {
      contentJson = JSON.parse(fs.readFileSync(contentJsonPath, 'utf-8'))
    } catch (e) {
      console.error('  content.json: PARSE ERROR')
      console.error(
        `  Failed to parse JSON: ${e instanceof Error ? e.message : e}`
      )
      process.exit(1)
    }
    try {
      validateContentConfig(contentJson)
      console.log('  content.json: valid')
    } catch (e) {
      console.error('  content.json: INVALID')
      console.error(e instanceof Error ? e.message : e)
      process.exit(1)
    }
  }

  // Backup original if not already done
  backupOriginal()

  // Copy example files to main config
  try {
    if (fs.existsSync(siteJsonPath)) {
      fs.copyFileSync(siteJsonPath, path.join(CONFIG_DIR, 'site.json'))
    }
    if (fs.existsSync(contentJsonPath)) {
      fs.copyFileSync(contentJsonPath, path.join(CONFIG_DIR, 'content.json'))
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to apply "${exampleName}" config files: ${msg}`)
  }

  const htmlSuccess = regenerateHtml()

  if (!htmlSuccess) {
    console.error(
      `\nWARNING: Portfolio configs switched but index.html is out of sync!`
    )
    console.error('The portfolio will not render correctly until you run:')
    console.error('  npm run generate:html')
    process.exit(2)
  }

  console.log(`\nSwitched to "${exampleName}" portfolio!`)
  console.log('Run `npm run dev` to see changes.\n')
}

function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Portfolio Switcher - Test different portfolio configurations

Usage:
  npx tsx scripts/switch-portfolio.ts <example-name>
  npx tsx scripts/switch-portfolio.ts --list
  npx tsx scripts/switch-portfolio.ts --reset

Options:
  --list    List available example portfolios
  --reset   Restore original portfolio configs
  --help    Show this help message

Examples:
  npx tsx scripts/switch-portfolio.ts minimal
  npx tsx scripts/switch-portfolio.ts creative
  npx tsx scripts/switch-portfolio.ts startup
`)
    return
  }

  if (args[0] === '--list' || args[0] === '-l') {
    const examples = listExamples()
    if (examples.length === 0) {
      console.log('\nNo examples found in src/config/examples/')
    } else {
      console.log('\nAvailable example portfolios:')
      examples.forEach((name) => console.log(`  - ${name}`))
    }
    console.log()
    return
  }

  if (args[0] === '--reset' || args[0] === '-r') {
    restoreOriginal()
    return
  }

  switchTo(args[0])
}

main()

# PDF Resume Import Guide

Auto-generate your portfolio from a PDF resume using Claude CLI.

## Prerequisites

- [Claude Code](https://code.claude.com/docs/en/overview) installed and authenticated
- A PDF resume file

## Usage

```bash
npm run resume:import -- <pdf-path> <example-name>
```

**Example:**

```bash
npm run resume:import -- ~/Documents/resume.pdf john-doe
```

This creates configs in `src/config/examples/john-doe/`.

## What It Extracts

The script uses Claude to analyze your resume and extract:

- **Hero** - Name, title, tagline, status badge
- **Experience** - Companies, roles, highlights, tech stack
- **Achievements** - Major accomplishments with metrics
- **Skills** - Categorized by type (languages, cloud, tools, etc.)
- **Contact** - Location and social links
- **Site metadata** - SEO description, navigation, features

## Post-Import Steps

1. **Review configs** in `src/config/examples/<your-name>/`
2. **Add profile photo** as `public/profile.jpg` (400x400px recommended)
3. **Apply config:**
   ```bash
   npm run portfolio:switch <your-name>
   ```
4. **Preview:**
   ```bash
   npm run dev
   ```

## Troubleshooting

| Issue                  | Solution                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| "Claude CLI not found" | Install Claude Code from https://code.claude.com/docs/en/overview                            |
| "PDF file not found"   | Check the file path is correct (relative and absolute paths are supported)                   |
| "PDF file too large"   | Maximum file size is 10MB. Compress or split the PDF                                         |
| Validation errors      | Re-run the import; if issues persist, create JSON files manually using examples as templates |
| JSON parsing failed    | Claude response was malformed; try running the import again                                  |

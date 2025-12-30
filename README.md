# Portfolio Template

A JSON-driven portfolio platform with multiple design systems. Built with React 19, TypeScript, Tailwind CSS v4, and shadcn/ui.

**[Live Demo](https://portfolio-template-ten-eta.vercel.app/)**

## Quick Start

1. Click **"Use this template"** → **"Create a new repository"**
2. Clone your new repo and install:

```bash
git clone https://github.com/YOUR_USERNAME/portfolio-template.git
cd portfolio-template
npm install
```

3. Customize your content:
   - `src/config/content.json` → Your experience, skills, achievements
   - `src/config/site.json` → Site metadata, social links
   - `public/profile.jpg` → Your photo

4. Build and run:

```bash
npm run build
npm run dev
```

See the [Quick Start Guide](docs/getting-started/quick-start.md) for detailed setup.

## Features

- **Multi-Design System** - Switch between Corporate, Hand-Drawn, Automotive, and Bauhaus themes
- **Dark/Light Mode** - Full theme support with system preference detection
- **Shareable URLs** - Share specific theme combinations via `?theme=dark&design=bauhaus`
- **Animated Metrics** - Flip cards with animated counters
- **Job Board** - Optional multi-provider job aggregator matched to your skills
- **PDF Import** - Auto-generate portfolio from your PDF resume using Claude CLI
- **Build-time Validation** - Zod validates all JSON config at build time

## Design Systems

| ID           | Style                               |
| ------------ | ----------------------------------- |
| `corporate`  | Professional Navy & Brass (default) |
| `hand-drawn` | Sketch/paper aesthetic              |
| `automotive` | Neumorphic industrial               |
| `bauhaus`    | Constructivist geometric            |

## Documentation

| Category                                 | Topics                                                                                                                                                                           |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Getting Started](docs/getting-started/) | [Quick Start](docs/getting-started/quick-start.md), [Environment Variables](docs/getting-started/environment-variables.md), [Deployment](docs/getting-started/deployment.md)     |
| [Architecture](docs/architecture/)       | [Design Systems](docs/architecture/design-systems.md), [Configuration](docs/architecture/configuration-system.md), [Template Variables](docs/architecture/template-variables.md) |
| [Reference](docs/reference/)             | [Components](docs/reference/component-api.md), [Skill Matcher](docs/reference/skill-matcher.md), [Location Classification](docs/reference/location-classification.md)            |
| [Job Board](docs/job-board/)             | [Architecture](docs/job-board/architecture.md), [API Guide](docs/job-board/free-job-apis-guide.md)                                                                               |
| [Contributing](docs/contributing/)       | [Testing](docs/contributing/testing.md), [Troubleshooting](docs/contributing/troubleshooting.md)                                                                                 |
| [PDF Import](docs/pdf-import/)           | [Guide](docs/pdf-import/guide.md) - Auto-generate portfolio from PDF resume                                                                                                      |
| [Configuration](src/config/README.md)    | Full JSON schema reference                                                                                                                                                       |

## Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run test         # Run tests
npm run lint         # Lint code

# Config tools
npm run generate:css   # Regenerate design tokens
npm run generate:html  # Regenerate index.html
npm run portfolio:list # List example configs
npm run resume:import  # Import portfolio from PDF resume
```

## Tech Stack

React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Zod, Vitest

## Built With

This project was entirely written using [Claude Code](https://claude.com/product/claude-code).

## Credits

Inspired by:

- [Design Prompts](https://www.designprompts.dev/) - Theme design inspiration
- [JSON Resume](https://jsonresume.org/) - JSON-based configuration and job board concept

## License

MIT

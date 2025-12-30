# Deployment Guide

## Vercel (Recommended)

Zero-configuration deployment with automatic builds.

### Option A: Vercel CLI

```bash
npm i -g vercel
vercel
```

### Option B: GitHub Integration

1. Push your repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Click **Deploy**

Vercel automatically:

- Detects Vite configuration
- Runs `npm run build`
- Deploys to CDN

### Preview Deployments

Every pull request gets a preview URL. To enable job board on previews:

1. Go to **Project Settings** > **Environment Variables**
2. Add `VITE_HN_JOB_BOARD` = `true`
3. Set Environment to **Preview** only

## Docker Self-Hosting

Multi-stage Docker build with nginx for production.

### Quick Start

```bash
# Build and start
npm run docker:up

# Or build and run in foreground
npm run docker:dev
```

The portfolio will be available at [http://localhost](http://localhost) (port 80).

### Docker Commands

```bash
npm run docker:build   # Build image
npm run docker:up      # Start containers (detached)
npm run docker:down    # Stop containers
npm run docker:dev     # Build and run with logs
```

### Configuration

The Docker setup uses:

- `Dockerfile` - Multi-stage build (Node 24 -> nginx:alpine)
- `docker-compose.yml` - Container orchestration
- `nginx.conf` - Nginx configuration for SPA routing

### Custom Port

Edit `docker-compose.yml`:

```yaml
ports:
  - '3000:80' # Change 3000 to your preferred port
```

## Static Hosting

The build outputs a static site to `dist/`.

### Build

```bash
npm run build
```

### Output

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── profile.jpg
```

### Deploy to Static Hosts

**Netlify**

```bash
# Install CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

**GitHub Pages**

1. Build: `npm run build`
2. Push `dist/` to `gh-pages` branch
3. Enable GitHub Pages in repo settings

**AWS S3 + CloudFront**

```bash
aws s3 sync dist/ s3://your-bucket --delete
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

## Custom Domain

### Vercel

1. Go to **Project Settings** > **Domains**
2. Add your domain
3. Update DNS records as instructed

### Self-Hosted

Update `nginx.conf` with your domain:

```nginx
server {
    server_name yourdomain.com;
    # ... rest of config
}
```

## Environment Variables by Platform

| Platform       | Where to Set                                 |
| -------------- | -------------------------------------------- |
| Vercel         | Project Settings > Environment Variables     |
| Docker         | `docker-compose.yml` or `.env` file          |
| Netlify        | Site Settings > Build & Deploy > Environment |
| GitHub Actions | Repository Settings > Secrets                |

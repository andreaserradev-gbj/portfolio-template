# Troubleshooting

Common issues and solutions when working with the portfolio.

## Build Errors

### "Invalid site.json" or "Invalid content.json"

**Cause:** Zod validation failed on configuration.

**Solution:**

1. Check the error output for the specific field
2. Common issues:
   - `description` length (must be 10-160 characters)
   - Required fields missing
   - Invalid enum values

```
Error: Invalid content.json
  - hero.tagline: String must contain at least 10 characters
```

Fix: Update the tagline to be at least 10 characters.

### "Unknown template variable"

**Cause:** Template variable used but not defined.

```
Error: Unknown template variable "unknownVar".
Available variables: careerStartYear, partnershipStartYear
```

**Solution:** Add the variable to `content.json`:

```json
{
  "variables": {
    "unknownVar": 2020
  }
}
```

### "index.html not found"

**Cause:** Generated file doesn't exist.

**Solution:**

```bash
npm run build
# or just
npm run generate:html
```

### TypeScript Errors

**Cause:** Type mismatch or missing types.

**Solution:**

1. Run type check: `npx tsc --noEmit`
2. Check import paths use `@/` alias
3. Ensure JSON matches Zod schema

## Development Issues

### Design System Not Applying

**Symptoms:** Wrong colors, fonts, or styles.

**Check:**

1. Verify `data-design-system` attribute on `<html>`
2. Ensure design system ID matches `design-systems.json`
3. Check browser DevTools for CSS variable values

**Solution:**

```bash
npm run generate:css
npm run dev
```

### CSS Tokens Not Updating

**Cause:** Generated CSS is stale.

**Solution:**

```bash
npm run generate:css
# Restart dev server
npm run dev
```

### Job Board Not Showing

**Check:**

1. Environment variable: `VITE_HN_JOB_BOARD`
2. Local dev: enabled by default
3. Production: disabled by default

**Solution for local:**

```bash
# Explicitly enable
VITE_HN_JOB_BOARD=true npm run dev

# Or check if explicitly disabled
cat .env.local
```

### Hot Reload Not Working

**Cause:** Vite HMR issue.

**Solution:**

1. Stop dev server
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Restart: `npm run dev`

### Fonts Not Loading

**Cause:** Google Fonts URL issue.

**Check:** Network tab for font requests.

**Solution:**

1. Verify URLs in `design-systems.json`
2. Check for typos in font family names
3. Ensure internet connectivity

## Deployment Issues

### Vercel Preview Shows Job Board, Production Doesn't

**Cause:** Expected behavior - different env var settings.

**Explanation:**

- Preview: `VITE_HN_JOB_BOARD=true`
- Production: not set (disabled)

**If you want job board in production:**

1. Go to Vercel Project Settings
2. Add `VITE_HN_JOB_BOARD=true` for Production environment

### Docker Build Fails

**Common causes:**

1. **Invalid JSON config:**

   ```bash
   npm run build  # Test locally first
   ```

2. **Node version mismatch:**
   - Dockerfile uses Node 24
   - Ensure local Node is compatible

3. **Missing dependencies:**
   ```bash
   npm ci
   npm run build
   ```

### Static Assets Missing After Deploy

**Cause:** Assets not in `dist/` or wrong paths.

**Check:**

1. Verify `public/` contains assets
2. Check paths use `/` prefix (e.g., `/profile.jpg`)
3. Run local build and check `dist/`

## JSON Configuration Issues

### Skills Not Matching in Job Board

**Cause:** Missing aliases or wrong format.

**Solution:** Add aliases to skill definitions:

```json
{
  "name": "Node.js",
  "weight": 9,
  "aliases": ["node", "nodejs", "node.js"]
}
```

### Metrics Not Animating

**Cause:** Invalid metric value type.

**Check:** Metric values must be numbers or template strings:

```json
{
  "value": 25,           // OK
  "value": "{{yearsSince:startYear}}"  // OK
  "value": "twenty-five" // NOT OK
}
```

### Experience Timeline Wrong Order

**Cause:** Array order in JSON determines display order.

**Solution:** Reorder entries in `content.json` experience array.

## Performance Issues

### Slow Initial Load

**Possible causes:**

1. Large profile image - resize to 400x400px
2. Too many skills - consider reducing
3. Font loading - check network tab

### Job Board Slow to Load

**Cause:** API rate limits or slow providers.

**Solutions:**

1. Jobs are cached in localStorage
2. Switch providers if one is slow
3. Check browser console for API errors

## Getting Help

If you're stuck:

1. Check existing [GitHub Issues](https://github.com/your-repo/issues)
2. Review error messages carefully
3. Run with verbose logging: check browser console
4. Create a minimal reproduction case

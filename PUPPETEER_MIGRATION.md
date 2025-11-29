# Migration from Playwright to Puppeteer

## Summary

We've migrated from Playwright to Puppeteer for better serverless compatibility on Vercel.

## Changes Made

### 1. Package Dependencies
- ❌ Removed: `playwright` (^1.57.0)
- ✅ Added: `puppeteer` (^21.11.0)

### 2. Build Scripts
- ❌ Removed: `npx playwright install chromium` from build and postinstall scripts
- ✅ Simplified: Removed browser installation commands (Puppeteer handles this automatically)

### 3. Code Changes (`lib/services/crawler/base-crawler.ts`)
- Changed from Playwright's `chromium.launch()` to Puppeteer's `puppeteer.launch()`
- Removed browser context (Puppeteer doesn't use contexts, pages are created directly)
- Updated `fetchPage()` method to use Puppeteer API:
  - `context.newPage()` → `browser.newPage()`
  - `waitUntil: 'networkidle'` → `waitUntil: 'networkidle2'`
  - Direct page configuration (user agent, viewport, headers) on the page object

### 4. Vercel Configuration
- Removed Playwright browser installation from `installCommand`
- Kept increased timeout (300 seconds) for crawler functions

## Why Puppeteer?

1. **Better Serverless Support**: Puppeteer is designed to work better in serverless environments
2. **Smaller Bundle**: More efficient for Vercel deployments
3. **Simpler API**: Direct page creation without context abstraction
4. **Better Documentation**: More examples and guides for serverless deployments

## Testing

After deploying, test the crawler by:
1. Going to `/admin/crawl`
2. Entering a conference URL
3. Clicking "Start Crawl"

The crawler should now work properly on Vercel!

## API Differences

### Browser Launch
**Playwright:**
```typescript
const browser = await chromium.launch({ ... });
const context = await browser.newContext({ ... });
const page = await context.newPage();
```

**Puppeteer:**
```typescript
const browser = await puppeteer.launch({ ... });
const page = await browser.newPage();
```

### Page Navigation
**Playwright:**
```typescript
const response = await page.goto(url, {
  waitUntil: 'networkidle',
  timeout: 30000,
});
```

**Puppeteer:**
```typescript
const response = await page.goto(url, {
  waitUntil: 'networkidle2', // 'networkidle0' or 'networkidle2'
  timeout: 30000,
});
```

All other functionality (robots.txt checking, data extraction) remains the same!


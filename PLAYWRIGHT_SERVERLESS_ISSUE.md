# Playwright Serverless Deployment Issue

## Problem

Playwright browsers (~300MB) are too large for Vercel's serverless functions. The browser executable isn't found at runtime because:
1. Vercel has deployment size limits
2. Browser binaries aren't preserved between build and runtime
3. Serverless functions have limited storage

## Error Message

```
browserType.launch: Executable doesn't exist at /home/sbx_user1051/.cache/ms-playwright/chromium_headless_shell-1200/chrome-headless-shell-linux64/chrome-headless-shell
```

## Solutions

### Option 1: Use Puppeteer (Recommended)
Puppeteer is more serverless-friendly:
- Smaller bundle size
- Better serverless support
- Easier configuration

### Option 2: External Browser Service
Use a browser-as-a-service like:
- Browserless.io
- Puppeteer Cloud
- ScrapingBee

### Option 3: Separate Crawler Service
Move the crawler to a separate service (not serverless):
- VPS/VM with Playwright installed
- Docker container
- AWS Lambda with larger storage

### Option 4: Use `@playwright/browser-chromium` (Experimental)
This package bundles Chromium but may still have size issues.

## Current Status

We've attempted to:
1. ✅ Install browsers during Vercel build
2. ✅ Add serverless-friendly Chromium args
3. ✅ Increase function timeout

However, the browser binaries still aren't available at runtime.

## Recommendation

**Switch to Puppeteer** - It's specifically designed for serverless environments and is much more reliable on Vercel.


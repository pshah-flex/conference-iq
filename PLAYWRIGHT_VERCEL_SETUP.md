# Playwright Setup for Vercel

## Issue

Playwright browsers need to be installed in Vercel's serverless environment. The browser executable must be available at runtime.

## Solution

We've configured Playwright to install Chromium during the Vercel build process. Here's what was changed:

### 1. Updated `vercel.json`

Added browser installation to the `installCommand`:
```json
"installCommand": "npm install && npx playwright install --with-deps chromium"
```

This ensures Chromium is installed during the Vercel build.

### 2. Updated `package.json`

Added a `postinstall` script that attempts to install browsers:
```json
"postinstall": "npx playwright install --with-deps chromium || true"
```

The `|| true` ensures the build doesn't fail if browser installation has issues locally.

### 3. Updated Build Configuration

Added `--single-process` flag to Chromium launch args, which is important for serverless environments where we have limited resources.

### 4. Increased Function Timeout

Added a function configuration in `vercel.json` to increase the timeout for crawler API routes to 300 seconds (5 minutes):
```json
"functions": {
  "app/api/**/*.ts": {
    "maxDuration": 300
  }
}
```

## Alternative: Using Puppeteer (if Playwright doesn't work)

If Playwright continues to have issues on Vercel, we can switch to Puppeteer which is more serverless-friendly:

1. Install Puppeteer:
```bash
npm install puppeteer-core
```

2. Puppeteer works better with Vercel's serverless environment out of the box.

## Testing

After deploying, test the crawler by:
1. Going to `/admin/crawl`
2. Entering a conference URL
3. Clicking "Start Crawl"

If you still get browser errors, we may need to:
- Use a different browser automation tool (Puppeteer)
- Use an external browser service (like Browserless)
- Run crawls in a separate service (not serverless)

